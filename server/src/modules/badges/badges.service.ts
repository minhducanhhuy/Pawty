import { Injectable } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { PushAdapterService } from '../../adapters/push.adapter';
import { BadgeRecord } from '../../database/types';

export interface BadgeProgressItem extends BadgeRecord {
  earnedAt?: string;
  current: number;
  target: number;
  progressPercent: number;
}

@Injectable()
export class BadgesService {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly pushAdapter: PushAdapterService,
  ) {}

  public computeProgressForUser(
    userId: string,
    code: BadgeRecord['code'],
  ): { current: number; target: number } {
    const user = this.dataStore.users.find((u) => u.id === userId);
    const userPetIds = new Set(
      this.dataStore.pets.filter((p) => p.userId === userId).map((p) => p.id),
    );

    switch (code) {
      case 'first_match': {
        const count = this.dataStore.matches.filter(
          (m) =>
            m.status === 'matched' &&
            !m.isUndone &&
            (userPetIds.has(m.senderPetId) || userPetIds.has(m.targetPetId)),
        ).length;
        return { current: count, target: 1 };
      }
      case 'walk_7_streak': {
        return { current: user?.walkStreakDays || 0, target: 7 };
      }
      case 'social_butterfly': {
        const completed = this.dataStore.appointments.filter(
          (a) =>
            a.status === 'completed' &&
            (userPetIds.has(a.senderPetId) || userPetIds.has(a.receiverPetId)),
        ).length;
        return { current: completed, target: 5 };
      }
      case 'safe_pet': {
        const safeCount = this.dataStore.pets.filter(
          (p) => p.userId === userId && p.isSafePet,
        ).length;
        return { current: safeCount, target: 1 };
      }
      case 'moment_10': {
        const momentsCount = this.dataStore.moments.filter((m) =>
          userPetIds.has(m.petId),
        ).length;
        return { current: momentsCount, target: 10 };
      }
      case 'club_member': {
        const clubsCount = this.dataStore.clubMembers.filter(
          (cm) => cm.userId === userId,
        ).length;
        return { current: clubsCount, target: 1 };
      }
      case 'referral_3': {
        const refCount = this.dataStore.referrals.filter(
          (r) => r.referrerUserId === userId,
        ).length;
        return { current: refCount, target: 3 };
      }
      case 'sos_hero': {
        const helpedCount = this.dataStore.sosAlerts.filter(
          (s) =>
            s.status === 'resolved' &&
            Array.isArray(s.helperUserIds) &&
            s.helperUserIds.includes(userId),
        ).length;
        return { current: helpedCount, target: 1 };
      }
      default:
        return { current: 0, target: 1 };
    }
  }

  public async unlockBadge(
    userId: string,
    code: BadgeRecord['code'],
  ): Promise<BadgeRecord | null> {
    const existing = this.dataStore.userBadges.find(
      (ub) => ub.userId === userId && ub.badgeCode === code,
    );
    if (existing) {
      return null;
    }

    const badge = this.dataStore.badges.find((b) => b.code === code);
    if (!badge) {
      return null;
    }

    this.dataStore.userBadges.push({
      userId,
      badgeCode: code,
      earnedAt: new Date().toISOString(),
    });
    this.dataStore.save();

    await this.pushAdapter.sendPush(userId, {
      type: 'badge',
      title: `🏅 Mở khoá huy hiệu: ${badge.nameVi}!`,
      body: `${badge.icon} ${badge.descriptionVi}`,
      payload: { badgeCode: badge.code },
    });

    return badge;
  }

  public async checkAndAwardBadges(userId: string): Promise<BadgeRecord[]> {
    const newlyUnlocked: BadgeRecord[] = [];
    for (const badge of this.dataStore.badges) {
      const { current, target } = this.computeProgressForUser(userId, badge.code);
      if (current >= target) {
        const unlocked = await this.unlockBadge(userId, badge.code);
        if (unlocked) {
          newlyUnlocked.push(unlocked);
        }
      }
    }
    return newlyUnlocked;
  }

  public getBadgesForUser(userId: string) {
    const earnedMap = new Map(
      this.dataStore.userBadges
        .filter((ub) => ub.userId === userId)
        .map((ub) => [ub.badgeCode, ub.earnedAt]),
    );

    const earned: Array<BadgeRecord & { earnedAt: string }> = [];
    const locked: BadgeProgressItem[] = [];

    for (const badge of this.dataStore.badges) {
      const earnedAt = earnedMap.get(badge.code);
      const { current, target } = this.computeProgressForUser(userId, badge.code);
      const progressPercent = Math.min(100, Math.round((current / target) * 100));

      if (earnedAt) {
        earned.push({ ...badge, earnedAt });
      } else {
        locked.push({
          ...badge,
          current: Math.min(current, target),
          target,
          progressPercent,
        });
      }
    }

    return { earned, locked };
  }
}
