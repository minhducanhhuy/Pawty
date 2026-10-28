import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataStoreService } from '../../database/data-store.service';
import { OtpAdapterService } from '../../adapters/otp.adapter';
import { ReferralsService } from '../referrals/referrals.service';
import { Public } from '../../common/decorators/public.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES } from '../../config/business-rules';
import { AuthProviderType, UserRecord } from '../../database/types';

export function enrichUserWithQuotas(
  user: UserRecord,
  dataStore: DataStoreService,
) {
  const tierRule = BUSINESS_RULES.tiers[user.vipTier] || BUSINESS_RULES.tiers.free;
  const swipesLeft =
    tierRule.dailySwipesLimit === null
      ? 9999
      : Math.max(0, tierRule.dailySwipesLimit - user.dailySwipesCount);
  const dailyFreeSuperLikesLeft = Math.max(
    0,
    tierRule.superLikesPerDay - user.superLikesToday,
  );
  const superLikesLeft = dailyFreeSuperLikesLeft + user.superLikeBalance;
  const weeklyBoostsUsed = dataStore.weeklyFreeBoostsUsed.get(user.id) || 0;
  const freeBoostsLeft = Math.max(
    0,
    tierRule.freeBoostsPerWeek - weeklyBoostsUsed,
  );

  return {
    ...user,
    quotas: {
      swipesLeft,
      dailySwipesLimit: tierRule.dailySwipesLimit,
      superLikesLeft,
      dailyFreeSuperLikesLeft,
      superLikeBalance: user.superLikeBalance,
      boostBalance: user.boostBalance + freeBoostsLeft,
      maxPets: tierRule.maxPets,
      maxMoments: tierRule.maxMoments,
    },
  };
}

function generateUniqueReferralCode(dataStore: DataStoreService): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 20; attempt++) {
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const candidate = `PAW${suffix}`;
    if (!dataStore.users.some((u) => u.referralCode === candidate)) {
      return candidate;
    }
  }
  return `PAW${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly otpAdapter: OtpAdapterService,
    private readonly jwtService: JwtService,
    private readonly referralsService: ReferralsService,
  ) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: { phone: string }) {
    if (!body?.phone || body.phone.trim().length < 8) {
      throw new DomainException(
        'BAD_REQUEST',
        'Số điện thoại không hợp lệ.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.otpAdapter.sendOtp(body.phone.trim());
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body()
    body: {
      phone: string;
      otpCode: string;
      referralCode?: string;
    },
  ) {
    if (!body?.phone || !body?.otpCode) {
      throw new DomainException(
        'BAD_REQUEST',
        'Vui lòng nhập số điện thoại và mã OTP.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const phone = body.phone.trim();
    const isValid = await this.otpAdapter.verifyOtp(phone, body.otpCode.trim());
    if (!isValid) {
      throw new DomainException(
        'INVALID_OTP',
        'Mã xác thực OTP không chính xác (Mã sandbox: 888888).',
        HttpStatus.BAD_REQUEST,
      );
    }

    let isNewUser = false;
    let user = this.dataStore.users.find((u) => u.phone === phone);
    const nowIso = new Date().toISOString();

    if (!user) {
      isNewUser = true;
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        phone,
        email: null,
        authProvider: 'phone',
        role: 'user',
        locale: 'vi',
        fullName: 'Chủ Nuôi Mới',
        nickname: 'Sen Mới',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        isVerified: true,
        isVip: false,
        vipTier: 'free',
        vipExpiresAt: null,
        dailySwipesCount: 0,
        superLikesToday: 0,
        superLikeBalance: 0,
        boostBalance: 0,
        boostExpiresAt: null,
        isWalkingNow: false,
        walkingUntil: null,
        referralCode: generateUniqueReferralCode(this.dataStore),
        referredByUserId: null,
        walkStreakDays: 0,
        lastWalkDate: null,
        totalWalkMeters: 0,
        latitude: 10.7951,
        longitude: 106.7218,
        isDistanceHidden: false,
        condoComplex: 'Vinhomes Central Park',
        flakeReportsCount: 0,
        isBannedSwiping: false,
        banUntil: null,
        fcmToken: null,
        notificationPrefs: {
          match: true,
          message: true,
          appointment: true,
          sos: true,
          reminder: true,
          event: true,
        },
        isDeleted: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      this.dataStore.users.push(user);
    } else {
      user.isVerified = true;
      user.isDeleted = false;
      user.updatedAt = nowIso;
    }

    if (body.referralCode && body.referralCode.trim().length > 0) {
      await this.referralsService.applyReferralCode(user, body.referralCode);
    }

    this.dataStore.save();

    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return {
      token,
      user: enrichUserWithQuotas(user, this.dataStore),
      isNewUser,
    };
  }

  @Public()
  @Post('social')
  @HttpCode(HttpStatus.OK)
  async socialLogin(
    @Body()
    body: {
      provider: 'google' | 'apple';
      idToken: string;
      phone: string;
      email?: string;
      fullName?: string;
      referralCode?: string;
    },
  ) {
    if (!body?.provider || !body?.idToken) {
      throw new DomainException(
        'BAD_REQUEST',
        'Thiếu thông tin xác thực mạng xã hội (provider, idToken).',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!body.phone || body.phone.trim().length < 8) {
      throw new DomainException(
        'PHONE_REQUIRED',
        'Bắt buộc xác thực số điện thoại kèm tài khoản mạng xã hội để chống bùng kèo.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const phone = body.phone.trim();
    const provider: AuthProviderType =
      body.provider === 'apple' ? 'apple' : 'google';
    const nowIso = new Date().toISOString();

    let isNewUser = false;
    let user = this.dataStore.users.find((u) => u.phone === phone);

    if (!user) {
      isNewUser = true;
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        phone,
        email: body.email || `${phone}@${provider}.pawty.app`,
        authProvider: provider,
        role: 'user',
        locale: 'vi',
        fullName: body.fullName || 'Chủ Nuôi Mới',
        nickname: 'Sen Mới',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        isVerified: true,
        isVip: false,
        vipTier: 'free',
        vipExpiresAt: null,
        dailySwipesCount: 0,
        superLikesToday: 0,
        superLikeBalance: 0,
        boostBalance: 0,
        boostExpiresAt: null,
        isWalkingNow: false,
        walkingUntil: null,
        referralCode: generateUniqueReferralCode(this.dataStore),
        referredByUserId: null,
        walkStreakDays: 0,
        lastWalkDate: null,
        totalWalkMeters: 0,
        latitude: 10.7951,
        longitude: 106.7218,
        isDistanceHidden: false,
        condoComplex: 'Vinhomes Central Park',
        flakeReportsCount: 0,
        isBannedSwiping: false,
        banUntil: null,
        fcmToken: null,
        notificationPrefs: {
          match: true,
          message: true,
          appointment: true,
          sos: true,
          reminder: true,
          event: true,
        },
        isDeleted: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      this.dataStore.users.push(user);
    } else {
      user.authProvider = provider;
      if (body.email) user.email = body.email;
      user.isVerified = true;
      user.isDeleted = false;
      user.updatedAt = nowIso;
    }

    if (body.referralCode && body.referralCode.trim().length > 0) {
      await this.referralsService.applyReferralCode(user, body.referralCode);
    }

    this.dataStore.save();

    const token = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return {
      token,
      user: enrichUserWithQuotas(user, this.dataStore),
      isNewUser,
    };
  }
}
