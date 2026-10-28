import { HttpStatus, Injectable } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { PushAdapterService } from '../../adapters/push.adapter';
import { BadgesService } from '../badges/badges.service';
import { BUSINESS_RULES } from '../../config/business-rules';
import { DomainException } from '../../common/errors';
import { UserRecord } from '../../database/types';

@Injectable()
export class ReferralsService {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly pushAdapter: PushAdapterService,
    private readonly badgesService: BadgesService,
  ) {}

  public extendVipDays(user: UserRecord, days: number) {
    const now = new Date();
    const currentExpiry =
      user.vipExpiresAt && new Date(user.vipExpiresAt) > now
        ? new Date(user.vipExpiresAt).getTime()
        : now.getTime();
    user.vipExpiresAt = new Date(
      currentExpiry + days * 24 * 60 * 60 * 1000,
    ).toISOString();
    if (user.vipTier === 'free') {
      user.vipTier = 'vip';
    }
    user.isVip = true;
    user.updatedAt = now.toISOString();
  }

  public async applyReferralCode(
    referredUser: UserRecord,
    rawCode: string,
  ): Promise<{ grantedDays: number; referrerId: string }> {
    const code = rawCode.trim().toUpperCase();
    const referrer = this.dataStore.users.find(
      (u) => u.referralCode.toUpperCase() === code && !u.isDeleted,
    );

    if (!referrer) {
      throw new DomainException(
        'NOT_FOUND',
        'Mã giới thiệu không tồn tại.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (referrer.id === referredUser.id) {
      throw new DomainException(
        'SELF_REFERRAL',
        'Bạn không thể tự nhập mã giới thiệu của chính mình.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const alreadyReferred =
      referredUser.referredByUserId ||
      this.dataStore.referrals.some((r) => r.referredUserId === referredUser.id);
    if (alreadyReferred) {
      throw new DomainException(
        'REFERRAL_ALREADY_USED',
        'Tài khoản của bạn đã sử dụng mã giới thiệu trước đó.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdMs = new Date(referredUser.createdAt).getTime();
    const maxAgeMs =
      BUSINESS_RULES.referral.newUserEligibilityDays * 24 * 60 * 60 * 1000;
    if (Date.now() - createdMs > maxAgeMs) {
      throw new DomainException(
        'REFERRAL_EXPIRED',
        'Mã giới thiệu chỉ áp dụng cho tài khoản mới trong 7 ngày đầu.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const referrerCount = this.dataStore.referrals.filter(
      (r) => r.referrerUserId === referrer.id,
    ).length;
    if (referrerCount >= BUSINESS_RULES.referral.maxReferralsPerUser) {
      throw new DomainException(
        'REFERRAL_LIMIT_REACHED',
        'Người giới thiệu này đã đạt giới hạn tối đa 20 lượt mời.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const rewardDays = BUSINESS_RULES.referral.rewardVipDays;
    this.extendVipDays(referrer, rewardDays);
    this.extendVipDays(referredUser, rewardDays);
    referredUser.referredByUserId = referrer.id;

    const nowIso = new Date().toISOString();
    this.dataStore.referrals.push({
      id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      referrerUserId: referrer.id,
      referredUserId: referredUser.id,
      rewardGrantedAt: nowIso,
      createdAt: nowIso,
    });
    this.dataStore.save();

    await this.pushAdapter.sendPush(referrer.id, {
      type: 'referral',
      title: '🎁 Mời bạn thành công! +7 ngày Sen VIP',
      body: `${referredUser.fullName} vừa nhập mã giới thiệu của bạn. Cả hai được tặng 7 ngày VIP!`,
      payload: { referredUserId: referredUser.id, rewardDays },
    });

    await this.pushAdapter.sendPush(referredUser.id, {
      type: 'referral',
      title: '👑 Chào mừng! Bạn nhận được 7 ngày Sen VIP',
      body: `Nhập mã từ ${referrer.fullName} thành công. Trải nghiệm đặc quyền VIP ngay!`,
      payload: { referrerUserId: referrer.id, rewardDays },
    });

    await this.badgesService.checkAndAwardBadges(referrer.id);

    return { grantedDays: rewardDays, referrerId: referrer.id };
  }

  public getReferralSummary(user: UserRecord) {
    const invitedCount = this.dataStore.referrals.filter(
      (r) => r.referrerUserId === user.id,
    ).length;
    const rewardDaysGranted =
      invitedCount * BUSINESS_RULES.referral.rewardVipDays;

    return {
      code: user.referralCode,
      invitedCount,
      rewardDaysGranted,
      shareUrl: `https://pawty.app/invite/${user.referralCode}`,
    };
  }

  public getStreakSummary(user: UserRecord) {
    const recentWalks = this.dataStore.walkLogs
      .filter((w) => w.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      )
      .slice(0, 20);

    return {
      streakDays: user.walkStreakDays,
      lastWalkDate: user.lastWalkDate,
      totalWalkMeters: user.totalWalkMeters,
      recentWalks,
    };
  }
}
