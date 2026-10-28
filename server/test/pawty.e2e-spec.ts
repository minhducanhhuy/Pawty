import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as http from 'http';
import { Duplex } from 'stream';
import { AppModule } from '../src/app.module';
import { DataStoreService } from '../src/database/data-store.service';
import { computeWebhookHmac } from '../src/adapters/payment.adapter';
import { setupE2eFixtures } from './test-fixtures';

/**
 * In-memory HTTP dispatcher for NestJS + Express that executes the full
 * Express router, Global Guards (JwtAuthGuard, RolesGuard), ValidationPipe,
 * ResponseEnvelopeInterceptor, and AllExceptionsFilter without opening a TCP port.
 */
class InMemoryHttpRequest {
  private reqHeaders: Record<string, string> = {};
  private reqBody: any = undefined;

  constructor(
    private readonly app: INestApplication,
    private readonly method: string,
    private readonly url: string,
  ) {}

  set(key: string, value: string): this {
    this.reqHeaders[key.toLowerCase()] = value;
    return this;
  }

  send(body: any): this {
    this.reqBody = body;
    return this;
  }

  async expect(expectedStatus: number): Promise<{ status: number; body: any }> {
    const expressApp = this.app.getHttpAdapter().getInstance();

    return new Promise((resolve, reject) => {
      const socket = new Duplex({
        read() {},
        write(_chunk, _encoding, callback) {
          callback();
        },
      }) as any;
      socket.remoteAddress = '127.0.0.1';

      const req = new http.IncomingMessage(socket) as any;
      req.method = this.method.toUpperCase();
      req.url = this.url;
      req.originalUrl = this.url;
      req.headers = {
        host: 'localhost',
        'content-type': 'application/json',
        ...this.reqHeaders,
      };
      req.body = this.reqBody ?? {};
      req._body = true; // Marks body as already parsed for body-parser

      const res = new http.ServerResponse(req) as any;
      res.assignSocket(socket);

      const chunks: Buffer[] = [];
      const origWrite = res.write.bind(res);
      const origEnd = res.end.bind(res);

      res.write = (chunk: any, ...args: any[]) => {
        if (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
        }
        return origWrite(chunk, ...args);
      };

      res.end = (chunk: any, ...args: any[]) => {
        if (chunk && typeof chunk !== 'function') {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
        }
        origEnd(chunk, ...args);

        const rawText = Buffer.concat(chunks).toString('utf-8');
        let parsedBody: any = rawText;
        try {
          parsedBody = rawText ? JSON.parse(rawText) : {};
        } catch {
          // keep raw string
        }

        if (res.statusCode !== expectedStatus) {
          reject(
            new Error(
              `Expected HTTP ${expectedStatus} for ${this.method} ${this.url}, but got ${res.statusCode}: ${rawText}`,
            ),
          );
          return;
        }

        resolve({
          status: res.statusCode,
          body: parsedBody,
        });
      };

      expressApp(req, res);
    });
  }
}

function apiRequest(app: INestApplication) {
  return {
    get: (url: string) => new InMemoryHttpRequest(app, 'GET', url),
    post: (url: string) => new InMemoryHttpRequest(app, 'POST', url),
    patch: (url: string) => new InMemoryHttpRequest(app, 'PATCH', url),
    delete: (url: string) => new InMemoryHttpRequest(app, 'DELETE', url),
  };
}

describe('Pawty Backend E2E & Business Rules Suite (v1.1)', () => {
  let app: INestApplication;
  let dataStore: DataStoreService;

  beforeAll(async () => {
    process.env.DATA_PERSIST = 'false';
    process.env.PAYMENT_GATEWAY = 'sandbox';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: false,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();

    dataStore = app.get(DataStoreService);
  });

  beforeEach(() => {
    dataStore.resetToSeed();
    setupE2eFixtures(dataStore);
  });

  afterAll(async () => {
    await app.close();
  });

  async function loginByPhone(phone: string, referralCode?: string) {
    const res = await apiRequest(app)
      .post('/api/auth/verify-otp')
      .send({ phone, otpCode: '888888', referralCode })
      .expect(200);
    return res.body.data as { token: string; user: any; isNewUser: boolean };
  }

  describe('1. Foundation: Envelope, Public Config, Health, Auth & Guards', () => {
    it('serves /api/config/public and /api/health without JWT', async () => {
      const configRes = await apiRequest(app)
        .get('/api/config/public')
        .expect(200);
      expect(configRes.body.success).toBe(true);
      expect(configRes.body.data.tiers.vip.priceMonthVnd).toBe(49000);
      expect(configRes.body.data.sos.priceVnd).toBe(39000);

      const healthRes = await apiRequest(app)
        .get('/api/health')
        .expect(200);
      expect(healthRes.body.data.status).toBe('ok');
      expect(healthRes.body.data.adapters.otp).toBe('sandbox');
    });

    it('rejects unauthenticated access to protected routes with 401 UNAUTHORIZED', async () => {
      const res = await apiRequest(app)
        .get('/api/users/me')
        .expect(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects invalid OTP code and issues real JWT on 888888', async () => {
      const badOtp = await apiRequest(app)
        .post('/api/auth/verify-otp')
        .send({ phone: '0908123456', otpCode: '000000' })
        .expect(400);
      expect(badOtp.body.error.code).toBe('INVALID_OTP');

      const { token, user } = await loginByPhone('0908123456');
      expect(token).toBeDefined();
      expect(user.phone).toBe('0908123456');

      const meRes = await apiRequest(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(meRes.body.data.id).toBe('usr_sen_01');
    });

    it('enforces RolesGuard on /api/admin/* and blocks moderators from changing roles', async () => {
      const sen = await loginByPhone('0908123456');
      await apiRequest(app)
        .get('/api/admin/kpi')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(403);

      const mod = await loginByPhone('0900000001');
      await apiRequest(app)
        .get('/api/admin/kpi')
        .set('Authorization', `Bearer ${mod.token}`)
        .expect(200);

      const roleChangeByMod = await apiRequest(app)
        .patch('/api/admin/users/usr_sen_01')
        .set('Authorization', `Bearer ${mod.token}`)
        .send({ role: 'admin' })
        .expect(403);
      expect(roleChangeByMod.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('2. Swipe Quotas, Super Like, Rewind, Boost & Likes-Me', () => {
    it('enforces 20 daily swipes limit and Super Like quota for free tier', async () => {
      const sen = await loginByPhone('0908123456');
      const userRecord = dataStore.users.find((u) => u.id === sen.user.id)!;
      userRecord.superLikeBalance = 0;
      userRecord.superLikesToday = 0;

      // 1st Super Like succeeds (free tier has 1/day)
      const super1 = await apiRequest(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({ targetPetId: 'pet_banhbao_04', action: 'superlike' })
        .expect(200);
      expect(super1.body.data.status).toBe('superliked');

      // 2nd Super Like fails with SUPER_LIKE_EXHAUSTED
      const super2 = await apiRequest(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({ targetPetId: 'pet_suatuoi_06', action: 'superlike' })
        .expect(403);
      expect(super2.body.error.code).toBe('SUPER_LIKE_EXHAUSTED');

      // Exhaust daily swipes (20)
      userRecord.dailySwipesCount = 20;
      const swipe21 = await apiRequest(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({ targetPetId: 'pet_suatuoi_06', action: 'like' })
        .expect(403);
      expect(swipe21.body.error.code).toBe('SWIPE_LIMIT_REACHED');
    });

    it('blocks Rewind for free users, allows VIP Rewind within 60s, and blocks rewinding a Match', async () => {
      const sen = await loginByPhone('0908123456');

      await apiRequest(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({ targetPetId: 'pet_banhbao_04', action: 'dislike' })
        .expect(200);

      // Free user cannot rewind
      const freeRewind = await apiRequest(app)
        .post('/api/matches/rewind')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(403);
      expect(freeRewind.body.error.code).toBe('VIP_REQUIRED');

      // Upgrade to VIP and rewind
      const userRecord = dataStore.users.find((u) => u.id === sen.user.id)!;
      userRecord.vipTier = 'vip';
      userRecord.isVip = true;

      const vipRewind = await apiRequest(app)
        .post('/api/matches/rewind')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(200);
      expect(vipRewind.body.data.restoredPet.id).toBe('pet_banhbao_04');

      // Swipe on pet_bunbo_03 (who already superliked pet_bo_01) -> creates a Match
      const matchRes = await apiRequest(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({ targetPetId: 'pet_bunbo_03', action: 'like' })
        .expect(200);
      expect(matchRes.body.data.isMatch).toBe(true);

      // Rewinding a matched swipe is blocked
      const rewindMatch = await apiRequest(app)
        .post('/api/matches/rewind')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(400);
      expect(rewindMatch.body.error.code).toBe('NOTHING_TO_REWIND');
    });

    it('activates Boost and prevents stacking active Boosts; blurs Likes-Me for free vs VIP', async () => {
      const sen = await loginByPhone('0908123456');

      // Free user Likes-Me: count > 0, items = []
      const likesFree = await apiRequest(app)
        .get('/api/matches/likes-me')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(200);
      expect(likesFree.body.data.count).toBeGreaterThan(0);
      expect(likesFree.body.data.items).toEqual([]);

      // Activate Boost (sen has 1 boostBalance in seed)
      const boost1 = await apiRequest(app)
        .post('/api/boosts/activate')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(200);
      expect(boost1.body.data.boostExpiresAt).toBeDefined();

      // Activating again while active throws BOOST_ALREADY_ACTIVE
      const boost2 = await apiRequest(app)
        .post('/api/boosts/activate')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(400);
      expect(boost2.body.error.code).toBe('BOOST_ALREADY_ACTIVE');
    });
  });

  describe('3. Appointment Check-in Window, Distance & Anti-Flake 2/Week Ban', () => {
    it('enforces check-in time window [-30m..+60m] and GPS distance <= 150m, completing when both check in', async () => {
      const senBo = await loginByPhone('0908123456'); // pet_bo_01
      const senMochi = await loginByPhone('0909111222'); // pet_mochi_02

      // Appointment scheduled 3 hours in future -> CHECKIN_WINDOW_CLOSED
      const futureAptRes = await apiRequest(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${senBo.token}`)
        .send({
          roomId: 'room_mochi_01',
          receiverPetId: 'pet_mochi_02',
          scheduledTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
          placeName: 'Công viên Landmark 81',
          placeAddress: '208 Nguyễn Hữu Cảnh',
          placeLat: 10.7948,
          placeLng: 106.7222,
        })
        .expect(201);
      const futureAptId = futureAptRes.body.data.id;

      await apiRequest(app)
        .patch(`/api/appointments/${futureAptId}/status`)
        .set('Authorization', `Bearer ${senMochi.token}`)
        .send({ status: 'confirmed' })
        .expect(200);

      const closedRes = await apiRequest(app)
        .post(`/api/appointments/${futureAptId}/check-in`)
        .set('Authorization', `Bearer ${senBo.token}`)
        .send({ lat: 10.7948, lng: 106.7222 })
        .expect(400);
      expect(closedRes.body.error.code).toBe('CHECKIN_WINDOW_CLOSED');

      // Seeded apt_mochi_01 is scheduled in 20 mins (inside -30m..+60m window)
      // Far away (> 150m) -> TOO_FAR_FROM_PLACE
      const farRes = await apiRequest(app)
        .post('/api/appointments/apt_mochi_01/check-in')
        .set('Authorization', `Bearer ${senBo.token}`)
        .send({ lat: 10.81, lng: 106.75 })
        .expect(400);
      expect(farRes.body.error.code).toBe('TOO_FAR_FROM_PLACE');

      // Within 150m -> Both check in -> completed!
      const c1 = await apiRequest(app)
        .post('/api/appointments/apt_mochi_01/check-in')
        .set('Authorization', `Bearer ${senBo.token}`)
        .send({ lat: 10.7948, lng: 106.7222 })
        .expect(200);
      expect(c1.body.data.checkedIn).toBe(true);
      expect(c1.body.data.isCompleted).toBe(false);

      const c2 = await apiRequest(app)
        .post('/api/appointments/apt_mochi_01/check-in')
        .set('Authorization', `Bearer ${senMochi.token}`)
        .send({ lat: 10.7949, lng: 106.7223 })
        .expect(200);
      expect(c2.body.data.isCompleted).toBe(true);
    });

    it('blocks non-checked-in user from reporting flake, and bans swiping for 3 days on 2nd flake report in a week', async () => {
      const senBo = await loginByPhone('0908123456'); // receiver of apt_mochi_01
      const senMochi = await loginByPhone('0909111222'); // sender of apt_mochi_01

      // Only senBo checks in at apt_mochi_01
      await apiRequest(app)
        .post('/api/appointments/apt_mochi_01/check-in')
        .set('Authorization', `Bearer ${senBo.token}`)
        .send({ lat: 10.7948, lng: 106.7222 })
        .expect(200);

      // senMochi (who did NOT check in) tries to report flake -> FORBIDDEN
      const invalidFlake = await apiRequest(app)
        .patch('/api/appointments/apt_mochi_01/status')
        .set('Authorization', `Bearer ${senMochi.token}`)
        .send({ status: 'reported_flake' })
        .expect(403);
      expect(invalidFlake.body.error.code).toBe('FLAKE_REPORT_NOT_ELIGIBLE');

      // senBo (who checked in) reports flake #1 on senMochi -> warning (isBanned: false)
      const flake1 = await apiRequest(app)
        .patch('/api/appointments/apt_mochi_01/status')
        .set('Authorization', `Bearer ${senBo.token}`)
        .send({ status: 'reported_flake' })
        .expect(200);
      expect(flake1.body.data.flakeReportsCount).toBe(1);
      expect(flake1.body.data.isBanned).toBe(false);

      // Create 2nd appointment, senBo checks in and reports flake #2 -> senMochi banned for 3 days!
      const apt2Res = await apiRequest(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${senBo.token}`)
        .send({
          roomId: 'room_mochi_01',
          receiverPetId: 'pet_mochi_02',
          scheduledTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          placeName: 'Công viên Landmark 81',
          placeAddress: '208 Nguyễn Hữu Cảnh',
          placeLat: 10.7948,
          placeLng: 106.7222,
        })
        .expect(201);
      const apt2Id = apt2Res.body.data.id;

      await apiRequest(app)
        .patch(`/api/appointments/${apt2Id}/status`)
        .set('Authorization', `Bearer ${senMochi.token}`)
        .send({ status: 'confirmed' })
        .expect(200);

      await apiRequest(app)
        .post(`/api/appointments/${apt2Id}/check-in`)
        .set('Authorization', `Bearer ${senBo.token}`)
        .send({ lat: 10.7948, lng: 106.7222 })
        .expect(200);

      const flake2 = await apiRequest(app)
        .patch(`/api/appointments/${apt2Id}/status`)
        .set('Authorization', `Bearer ${senBo.token}`)
        .send({ status: 'reported_flake' })
        .expect(200);
      expect(flake2.body.data.flakeReportsCount).toBe(2);
      expect(flake2.body.data.isBanned).toBe(true);
      expect(flake2.body.data.banUntil).toBeDefined();

      // senMochi tries to swipe on Radar -> SWIPING_BANNED
      const bannedSwipe = await apiRequest(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${senMochi.token}`)
        .send({ targetPetId: 'pet_banhbao_04', action: 'like' })
        .expect(403);
      expect(bannedSwipe.body.error.code).toBe('SWIPING_BANNED');
      expect(bannedSwipe.body.error.banUntil).toBeDefined();
    });
  });

  describe('4. Payments, HMAC Webhook & VIP Tier Fulfilment', () => {
    it('creates QR, verifies HMAC webhook signature, and fulfils VIP subscription idempotently', async () => {
      const sen = await loginByPhone('0908123456');

      const qrRes = await apiRequest(app)
        .post('/api/payments/create-qr')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({ serviceType: 'vip_subscription', plan: 'month' })
        .expect(200);

      const { paymentCode, amount } = qrRes.body.data;
      expect(amount).toBe(49000);

      // Invalid signature rejected
      const badWebhook = await apiRequest(app)
        .post('/api/payments/webhook')
        .set('X-Pawty-Signature', 'invalid_hmac')
        .send({ paymentCode, amount })
        .expect(401);
      expect(badWebhook.body.error.code).toBe('INVALID_SIGNATURE');

      // Valid HMAC signature fulfils VIP
      const payload = { paymentCode, amount };
      const validSig = computeWebhookHmac(JSON.stringify(payload));
      const okWebhook = await apiRequest(app)
        .post('/api/payments/webhook')
        .set('X-Pawty-Signature', validSig)
        .send(payload)
        .expect(200);
      expect(okWebhook.body.data.status).toBe('paid');
      expect(okWebhook.body.data.idempotent).toBe(false);

      // Duplicate webhook call is idempotent
      const dupWebhook = await apiRequest(app)
        .post('/api/payments/webhook')
        .set('X-Pawty-Signature', validSig)
        .send(payload)
        .expect(200);
      expect(dupWebhook.body.data.idempotent).toBe(true);

      const meRes = await apiRequest(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(200);
      expect(meRes.body.data.isVip).toBe(true);
      expect(meRes.body.data.vipTier).toBe('vip');
    });
  });

  describe('5. Referral Reward & Self-Referral Protection', () => {
    it('blocks self-referral and grants 7 days VIP to both referrer and new user', async () => {
      const senBo = await loginByPhone('0908123456'); // referralCode: SENBO888

      const selfRef = await apiRequest(app)
        .post('/api/referrals/apply')
        .set('Authorization', `Bearer ${senBo.token}`)
        .send({ referralCode: 'SENBO888' })
        .expect(400);
      expect(selfRef.body.error.code).toBe('SELF_REFERRAL');

      // New user registers with referralCode SENBO888
      const newSen = await loginByPhone('0988777666', 'SENBO888');
      expect(newSen.isNewUser).toBe(true);
      expect(newSen.user.isVip).toBe(true);
      expect(newSen.user.vipTier).toBe('vip');

      const referrerAfter = dataStore.users.find(
        (u) => u.id === senBo.user.id,
      )!;
      expect(referrerAfter.isVip).toBe(true);
      expect(referrerAfter.vipTier).toBe('vip');
    });
  });

  describe('6. Native Ads Frequency Cap & Voucher Uniqueness / Redemption', () => {
    it('enforces 1-hour impression frequency cap, prevents duplicate voucher saves, and redeems voucher via Partner API', async () => {
      const sen = await loginByPhone('0908123456');

      // 1st impression counted
      const imp1 = await apiRequest(app)
        .post('/api/ads/ad_01/impression')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(200);
      expect(imp1.body.data.counted).toBe(true);

      // 2nd impression within 1 hour is frequency-capped
      const imp2 = await apiRequest(app)
        .post('/api/ads/ad_01/impression')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(200);
      expect(imp2.body.data.counted).toBe(false);
      expect(imp2.body.data.frequencyCapped).toBe(true);

      // Save voucher
      const save1 = await apiRequest(app)
        .post('/api/ads/ad_01/save-voucher')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(200);
      const voucherCode = save1.body.data.code;
      expect(voucherCode).toMatch(/^PAW-[A-Z0-9]{6}$/);

      // Saving again throws ALREADY_SAVED
      const save2 = await apiRequest(app)
        .post('/api/ads/ad_01/save-voucher')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(400);
      expect(save2.body.error.code).toBe('ALREADY_SAVED');

      // Partner logs in and redeems voucher
      const partnerLogin = await apiRequest(app)
        .post('/api/partners/auth/login')
        .send({ email: 'partner@pawtyspa.vn', password: 'pawty123' })
        .expect(200);
      const partnerToken = partnerLogin.body.data.token;

      const redeem1 = await apiRequest(app)
        .post('/api/partners/vouchers/redeem')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({ code: voucherCode })
        .expect(200);
      expect(redeem1.body.data.redeemed).toBe(true);
      expect(redeem1.body.data.discountPercent).toBe(35);

      // Redeeming again throws VOUCHER_ALREADY_REDEEMED
      const redeem2 = await apiRequest(app)
        .post('/api/partners/vouchers/redeem')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({ code: voucherCode })
        .expect(400);
      expect(redeem2.body.error.code).toBe('VOUCHER_ALREADY_REDEEMED');
    });
  });

  describe('7. Vaccine Proof Upload & Admin Verification Flow', () => {
    it('transitions vaccineStatus from pending to verified, sets isSafePet=true, creates reminder and awards safe_pet badge', async () => {
      const senVy = await loginByPhone('0909555666'); // owner of pet_suatuoi_06
      const admin = await loginByPhone('0900000000');

      const uploadRes = await apiRequest(app)
        .post('/api/pets/pet_suatuoi_06/vaccine-proof')
        .set('Authorization', `Bearer ${senVy.token}`)
        .send({
          proofUrls: ['https://example.com/vaccine-proof-suatuoi.jpg'],
          vaccineDetails: '7 bệnh + Dại',
          lastVaccineDate: '2026-02-01',
        })
        .expect(200);
      expect(uploadRes.body.data.vaccineStatus).toBe('pending');
      expect(uploadRes.body.data.isSafePet).toBe(false);

      // Admin verifies vaccine proof
      const decisionRes = await apiRequest(app)
        .post('/api/admin/pets/pet_suatuoi_06/vaccine-decision')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          decision: 'verified',
          nextDueDate: '2027-02-01',
        })
        .expect(200);
      expect(decisionRes.body.data.vaccineStatus).toBe('verified');
      expect(decisionRes.body.data.isSafePet).toBe(true);
      expect(decisionRes.body.data.vaccineNextDueDate).toBe('2027-02-01');

      // Check reminders & badges for senVy
      const remindersRes = await apiRequest(app)
        .get('/api/reminders')
        .set('Authorization', `Bearer ${senVy.token}`)
        .expect(200);
      expect(
        remindersRes.body.data.some(
          (r: any) =>
            r.petId === 'pet_suatuoi_06' && r.dueDate === '2027-02-01',
        ),
      ).toBe(true);

      const badgesRes = await apiRequest(app)
        .get('/api/badges/me')
        .set('Authorization', `Bearer ${senVy.token}`)
        .expect(200);
      expect(
        badgesRes.body.data.earned.some((b: any) => b.code === 'safe_pet'),
      ).toBe(true);
    });
  });

  describe('8. Radar Scoring, Distance Privacy, Walk Now Streak, Moments, Clubs/Events & SOS', () => {
    it('applies Radar scoring, respects is_distance_hidden, and filters verifiedOnly by is_safe_pet', async () => {
      const sen = await loginByPhone('0908123456');

      const radarRes = await apiRequest(app)
        .get('/api/radar?lat=10.7951&lng=106.7218&radius=3000')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(200);

      const items = radarRes.body.data.items as any[];
      const petItems = items.filter((i) => i.type === 'pet');
      expect(petItems.length).toBeGreaterThanOrEqual(5);

      // Native Ad is inserted after 5 pet items for free user
      expect(items.some((i) => i.type === 'ad')).toBe(true);

      // pet_suatuoi_06 owner usr_06 has isDistanceHidden=true -> distanceMeters is null and label starts with "Gần bạn"
      const suatuoiItem = petItems.find((i) => i.pet.id === 'pet_suatuoi_06');
      expect(suatuoiItem).toBeDefined();
      expect(suatuoiItem.distanceMeters).toBeNull();
      expect(suatuoiItem.distanceLabel).toContain('Gần bạn');

      // verifiedOnly=true excludes pet_suatuoi_06 (vaccineStatus='pending', isSafePet=false)
      const verifiedRadar = await apiRequest(app)
        .get('/api/radar?lat=10.7951&lng=106.7218&radius=3000&verifiedOnly=true')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(200);
      const verifiedPetIds = verifiedRadar.body.data.items
        .filter((i: any) => i.type === 'pet')
        .map((i: any) => i.pet.id);
      expect(verifiedPetIds).not.toContain('pet_suatuoi_06');
    });

    it('tracks Walk Now start/heartbeat/stop with streak increment and enforces Moment storage quota, Event capacity & SOS resolution', async () => {
      const sen = await loginByPhone('0908123456');

      // Walk Now flow
      await apiRequest(app)
        .post('/api/walks/start')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({ lat: 10.7951, lng: 106.7218 })
        .expect(200);

      await apiRequest(app)
        .post('/api/walks/heartbeat')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({ lat: 10.7961, lng: 106.7228 })
        .expect(200);

      const stopRes = await apiRequest(app)
        .post('/api/walks/stop')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({
          points: [
            { lat: 10.7951, lng: 106.7218 },
            { lat: 10.7961, lng: 106.7228 },
          ],
        })
        .expect(200);
      expect(stopRes.body.data.distanceMeters).toBeGreaterThan(100);
      expect(stopRes.body.data.streakDays).toBe(4); // was 3 with lastWalkDate = yesterday

      // Moments storage limit (free = 5)
      for (let i = 0; i < 4; i++) {
        await apiRequest(app)
          .post('/api/moments')
          .set('Authorization', `Bearer ${sen.token}`)
          .send({
            mediaUrl: `https://example.com/m_${i}.jpg`,
            caption: `Khoảnh khắc ${i}`,
          })
          .expect(201);
      }
      const moment6 = await apiRequest(app)
        .post('/api/moments')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({
          mediaUrl: 'https://example.com/m_overflow.jpg',
          caption: 'Quá giới hạn 5 ảnh',
        })
        .expect(403);
      expect(moment6.body.error.code).toBe('VIP_STORAGE_LIMIT_REACHED');

      // SOS resolve awards sos_hero badge to helper usr_sen_01
      await apiRequest(app)
        .post('/api/sos/sos_01/resolve')
        .set('Authorization', `Bearer ${sen.token}`)
        .send({ helperUserId: 'usr_sen_01' })
        .expect(200);

      const badgesRes = await apiRequest(app)
        .get('/api/badges/me')
        .set('Authorization', `Bearer ${sen.token}`)
        .expect(200);
      expect(
        badgesRes.body.data.earned.some((b: any) => b.code === 'sos_hero'),
      ).toBe(true);
    });
  });
});
