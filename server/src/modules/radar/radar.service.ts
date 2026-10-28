import { HttpStatus, Injectable } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { PushAdapterService } from '../../adapters/push.adapter';
import { BadgesService } from '../badges/badges.service';
import { BUSINESS_RULES } from '../../config/business-rules';
import { DomainException } from '../../common/errors';
import {
  MatchActionType,
  MatchRecord,
  PetRecord,
  UserRecord,
} from '../../database/types';

@Injectable()
export class RadarService {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly pushAdapter: PushAdapterService,
    private readonly badgesService: BadgesService,
  ) {}

  public computeQuotaSummary(user: UserRecord) {
    const tierRule =
      BUSINESS_RULES.tiers[user.vipTier] || BUSINESS_RULES.tiers.free;
    const swipesLeft =
      tierRule.dailySwipesLimit === null
        ? 9999
        : Math.max(0, tierRule.dailySwipesLimit - user.dailySwipesCount);
    const freeSuperLeft = Math.max(
      0,
      tierRule.superLikesPerDay - user.superLikesToday,
    );
    const superLikesLeft = freeSuperLeft + user.superLikeBalance;
    return { swipesLeft, superLikesLeft };
  }

  public getRadarFeed(
    user: UserRecord,
    activePet: PetRecord | undefined,
    query: {
      lat?: string;
      lng?: string;
      radius?: string;
      species?: string;
      size?: string;
      verifiedOnly?: string;
      walkingNow?: string;
    },
  ) {
    const lat = query.lat ? parseFloat(query.lat) : user.latitude || 10.7951;
    const lng = query.lng ? parseFloat(query.lng) : user.longitude || 106.7218;
    const radiusMeters = query.radius
      ? parseInt(query.radius, 10)
      : BUSINESS_RULES.radar.defaultRadius;
    const verifiedOnly = query.verifiedOnly === 'true';
    const walkingNowFilter = query.walkingNow === 'true';
    const now = new Date();

    const alreadySwipedPetIds = new Set(
      this.dataStore.matches
        .filter((m) => m.senderPetId === activePet?.id && !m.isUndone)
        .map((m) => m.targetPetId),
    );

    const scoredPets = this.dataStore.pets
      .filter((pet) => {
        if (pet.userId === user.id) return false;
        if (pet.isHidden) return false;
        if (alreadySwipedPetIds.has(pet.id)) return false;
        if (this.dataStore.isBlockedEitherWay(user.id, pet.userId)) {
          return false;
        }
        const owner = this.dataStore.users.find((u) => u.id === pet.userId);
        if (!owner || owner.isDeleted || owner.isBannedSwiping) return false;
        return true;
      })
      .map((pet) => {
        const owner = this.dataStore.users.find((u) => u.id === pet.userId)!;
        const rawDistance = this.dataStore.calculatePostGisDistanceMeters(
          lat,
          lng,
          pet.latitude,
          pet.longitude,
        );

        const isOwnerVip =
          owner.vipTier !== 'free' &&
          (!owner.vipExpiresAt || new Date(owner.vipExpiresAt) > now);
        const isBoosted = Boolean(
          owner.boostExpiresAt && new Date(owner.boostExpiresAt) > now,
        );
        const isWalkingNow = Boolean(
          owner.isWalkingNow &&
            (!owner.walkingUntil || new Date(owner.walkingUntil) > now),
        );
        const hasSuperLikedMe = Boolean(
          activePet &&
            this.dataStore.matches.some(
              (m) =>
                m.senderPetId === pet.id &&
                m.targetPetId === activePet.id &&
                m.action === 'superlike' &&
                !m.isUndone &&
                m.status !== 'matched',
            ),
        );

        const scoring = BUSINESS_RULES.radar.scoring;
        const score =
          scoring.baseDistanceOffset -
          rawDistance +
          (isOwnerVip ? scoring.vipBonus : 0) +
          (isBoosted ? scoring.boostBonus : 0) +
          (hasSuperLikedMe ? scoring.superLikeReceivedBonus : 0) +
          (isWalkingNow ? scoring.walkingNowBonus : 0);

        return {
          pet,
          owner,
          rawDistance,
          isOwnerVip,
          isBoosted,
          isWalkingNow,
          hasSuperLikedMe,
          score,
        };
      })
      .filter((entry) => {
        if (entry.rawDistance > radiusMeters) return false;
        if (
          query.species &&
          query.species !== 'all' &&
          entry.pet.species !== query.species
        ) {
          return false;
        }
        if (
          query.size &&
          query.size !== 'all' &&
          entry.pet.size !== query.size
        ) {
          return false;
        }
        // Tier 02 §3.2: Safe Pet filter relies strictly on is_safe_pet
        if (verifiedOnly && !entry.pet.isSafePet) {
          return false;
        }
        if (walkingNowFilter && !entry.isWalkingNow) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);

    const petItems = scoredPets.map((entry) => {
      const hideDist = entry.owner.isDistanceHidden;
      const distanceMeters = hideDist ? null : entry.rawDistance;
      const distanceLabel = hideDist
        ? `Gần bạn • ${entry.pet.condoComplex}`
        : `Cách bạn ${entry.rawDistance}m • ${entry.pet.condoComplex}`;

      return {
        type: 'pet' as const,
        pet: {
          ...entry.pet,
          isVip: entry.isOwnerVip,
          vipTier: entry.owner.vipTier,
          distanceMeters,
          distanceLabel,
        },
        distanceMeters,
        distanceLabel,
        isBoosted: entry.isBoosted,
        isWalkingNow: entry.isWalkingNow,
        hasSuperLikedMe: entry.hasSuperLikedMe,
        score: entry.score,
      };
    });

    const items: Array<any> = [];
    const tierRule =
      BUSINESS_RULES.tiers[user.vipTier] || BUSINESS_RULES.tiers.free;

    let eligibleAds: typeof this.dataStore.nativeAds = [];
    if (!tierRule.hideNativeAds) {
      const capMs =
        BUSINESS_RULES.adsAndVouchers.frequencyCapMinutes * 60 * 1000;
      eligibleAds = this.dataStore.nativeAds.filter((ad) => {
        if (ad.status !== 'active') return false;
        if (ad.vouchersIssued >= ad.voucherQuota) return false;
        if (new Date(ad.startsAt) > now || new Date(ad.endsAt) < now) {
          return false;
        }
        const partner = this.dataStore.partners.find(
          (p) => p.id === ad.partnerId,
        );
        if (!partner || partner.status !== 'approved') return false;
        if (
          partner.plan === 'cpc' &&
          partner.balanceVnd < BUSINESS_RULES.adsAndVouchers.cpcCostVnd
        ) {
          return false;
        }
        const dist = this.dataStore.calculatePostGisDistanceMeters(
          lat,
          lng,
          ad.targetLat,
          ad.targetLng,
        );
        if (dist > ad.radiusMeters) return false;

        const capKey = `${user.id}:${ad.id}`;
        const lastShown = this.dataStore.adImpressionTimestamps.get(capKey);
        if (lastShown && Date.now() - lastShown < capMs) {
          return false;
        }
        return true;
      });
    }

    let adCursor = 0;
    const adInterval = BUSINESS_RULES.radar.adEveryMin; // 5 cards

    for (let i = 0; i < petItems.length; i++) {
      items.push(petItems[i]);
      if (
        (i + 1) % adInterval === 0 &&
        adCursor < eligibleAds.length
      ) {
        const ad = eligibleAds[adCursor++];
        ad.impressions += 1;
        this.dataStore.adImpressionTimestamps.set(
          `${user.id}:${ad.id}`,
          Date.now(),
        );
        items.push({
          type: 'ad' as const,
          ad,
        });
      }
    }

    return {
      items,
      radiusMeters,
      totalFound: petItems.length,
    };
  }

  public async handleSwipe(
    user: UserRecord,
    activePet: PetRecord | undefined,
    body: {
      targetPetId: string;
      action: MatchActionType;
      senderPetId?: string;
    },
  ) {
    if (!body?.targetPetId || !body?.action) {
      throw new DomainException(
        'BAD_REQUEST',
        'Thiếu thông tin targetPetId hoặc action.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if ban expired
    if (
      user.isBannedSwiping &&
      user.banUntil &&
      new Date(user.banUntil).getTime() <= Date.now()
    ) {
      user.isBannedSwiping = false;
      user.banUntil = null;
      user.flakeReportsCount = 0;
    }

    if (user.isBannedSwiping) {
      throw new DomainException(
        'SWIPING_BANNED',
        'Tài khoản của bạn đang bị tạm khoá quẹt thẻ 3 ngày do bùng kèo hẹn 2 lần/tuần.',
        HttpStatus.FORBIDDEN,
        { banUntil: user.banUntil },
      );
    }

    const senderPet = body.senderPetId
      ? this.dataStore.pets.find(
          (p) => p.id === body.senderPetId && p.userId === user.id,
        ) || activePet
      : activePet;

    if (!senderPet) {
      throw new DomainException(
        'BAD_REQUEST',
        'Bạn cần tạo hồ sơ Boss trước khi quẹt thẻ Radar.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const targetPet = this.dataStore.pets.find(
      (p) => p.id === body.targetPetId,
    );
    if (!targetPet) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy Boss mục tiêu.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (this.dataStore.isBlockedEitherWay(user.id, targetPet.userId)) {
      throw new DomainException(
        'FORBIDDEN',
        'Không thể tương tác với người dùng đã chặn.',
        HttpStatus.FORBIDDEN,
      );
    }

    const tierRule =
      BUSINESS_RULES.tiers[user.vipTier] || BUSINESS_RULES.tiers.free;

    if (
      tierRule.dailySwipesLimit !== null &&
      user.dailySwipesCount >= tierRule.dailySwipesLimit
    ) {
      throw new DomainException(
        'SWIPE_LIMIT_REACHED',
        'Bạn đã hết 20 lượt quẹt miễn phí trong ngày. Nâng cấp Sen VIP để quẹt không giới hạn!',
        HttpStatus.FORBIDDEN,
      );
    }

    if (body.action === 'superlike') {
      if (user.superLikesToday < tierRule.superLikesPerDay) {
        user.superLikesToday += 1;
      } else if (user.superLikeBalance > 0) {
        user.superLikeBalance -= 1;
      } else {
        throw new DomainException(
          'SUPER_LIKE_EXHAUSTED',
          'Bạn đã dùng hết lượt Super Paw hôm nay. Mua gói Super Like hoặc nâng cấp VIP để tiếp tục!',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    user.dailySwipesCount += 1;
    const nowIso = new Date().toISOString();

    if (body.action === 'dislike') {
      this.dataStore.matches.push({
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        senderPetId: senderPet.id,
        targetPetId: targetPet.id,
        action: 'dislike',
        status: 'disliked',
        isUndone: false,
        matchedAt: null,
        createdAt: nowIso,
      });
      this.dataStore.save();
      return {
        isMatch: false,
        status: 'disliked',
        quota: this.computeQuotaSummary(user),
      };
    }

    if (body.action === 'superlike') {
      await this.pushAdapter.sendPush(targetPet.userId, {
        type: 'match',
        title: `⭐ ${senderPet.name} đã Super Paw bạn!`,
        body: `Bé ${senderPet.name} (${senderPet.breed}) vừa thả Siêu Thích cho ${targetPet.name}!`,
        payload: { senderPetId: senderPet.id, targetPetId: targetPet.id },
      });
    }

    const reverseLike = this.dataStore.matches.find(
      (m) =>
        m.senderPetId === targetPet.id &&
        m.targetPetId === senderPet.id &&
        (m.action === 'like' || m.action === 'superlike') &&
        !m.isUndone,
    );

    if (reverseLike) {
      reverseLike.status = 'matched';
      reverseLike.matchedAt = nowIso;

      const matchRecord: MatchRecord = {
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        senderPetId: senderPet.id,
        targetPetId: targetPet.id,
        action: body.action,
        status: 'matched',
        isUndone: false,
        matchedAt: nowIso,
        createdAt: nowIso,
      };
      this.dataStore.matches.push(matchRecord);

      let room = this.dataStore.chatRooms.find(
        (r) =>
          (r.petAId === senderPet.id && r.petBId === targetPet.id) ||
          (r.petAId === targetPet.id && r.petBId === senderPet.id),
      );
      if (!room) {
        room = {
          id: `room_${targetPet.id}`,
          petAId: senderPet.id,
          petBId: targetPet.id,
          lastMessageText: 'Hai Boss vừa tương hợp! Nhắn tin làm quen ngay 🐾',
          lastMessageAt: nowIso,
          createdAt: nowIso,
        };
        this.dataStore.chatRooms.push(room);
      }

      this.dataStore.save();

      await this.pushAdapter.sendPush(targetPet.userId, {
        type: 'match',
        title: `🎉 Khớp lệnh tuyệt đối với ${senderPet.name}!`,
        body: `${senderPet.name} và ${targetPet.name} đã thích nhau. Lên lịch hẹn dạo ngay!`,
        payload: { roomId: room.id, partnerPetId: senderPet.id },
      });

      await this.badgesService.checkAndAwardBadges(user.id);
      await this.badgesService.checkAndAwardBadges(targetPet.userId);

      return {
        isMatch: true,
        status: 'matched',
        roomId: room.id,
        matchedAt: nowIso,
        quota: this.computeQuotaSummary(user),
      };
    }

    const status = body.action === 'superlike' ? 'superliked' : 'liked';
    this.dataStore.matches.push({
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderPetId: senderPet.id,
      targetPetId: targetPet.id,
      action: body.action,
      status,
      isUndone: false,
      matchedAt: null,
      createdAt: nowIso,
    });
    this.dataStore.save();

    return {
      isMatch: false,
      status,
      quota: this.computeQuotaSummary(user),
    };
  }

  public rewindLastSwipe(
    user: UserRecord,
    activePet: PetRecord | undefined,
  ) {
    const tierRule =
      BUSINESS_RULES.tiers[user.vipTier] || BUSINESS_RULES.tiers.free;
    if (!tierRule.canRewind) {
      throw new DomainException(
        'VIP_REQUIRED',
        'Tính năng Tua lại thẻ (Rewind) chỉ dành cho hội viên Sen VIP.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!activePet) {
      throw new DomainException(
        'NOTHING_TO_REWIND',
        'Không tìm thấy Boss đang hoạt động.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const candidates = this.dataStore.matches.filter(
      (m) => m.senderPetId === activePet.id && !m.isUndone,
    );
    const lastSwipe = candidates[candidates.length - 1];

    if (!lastSwipe) {
      throw new DomainException(
        'NOTHING_TO_REWIND',
        'Không có lượt quẹt nào gần đây để hoàn tác.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (lastSwipe.status === 'matched') {
      throw new DomainException(
        'NOTHING_TO_REWIND',
        'Không thể hoàn tác lượt quẹt đã khớp lệnh Match.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const ageMs = Date.now() - new Date(lastSwipe.createdAt).getTime();
    if (ageMs > BUSINESS_RULES.rewind.maxSecondsAfterSwipe * 1000) {
      throw new DomainException(
        'NOTHING_TO_REWIND',
        'Chỉ có thể hoàn tác lượt quẹt gần nhất trong vòng 60 giây.',
        HttpStatus.BAD_REQUEST,
      );
    }

    lastSwipe.isUndone = true;
    user.dailySwipesCount = Math.max(0, user.dailySwipesCount - 1);
    if (lastSwipe.action === 'superlike') {
      if (user.superLikesToday > 0) {
        user.superLikesToday -= 1;
      } else {
        user.superLikeBalance += 1;
      }
    }

    const restoredPet = this.dataStore.pets.find(
      (p) => p.id === lastSwipe.targetPetId,
    );
    this.dataStore.save();

    return {
      restoredPet: restoredPet || null,
      quota: this.computeQuotaSummary(user),
    };
  }

  public getLikesMe(user: UserRecord) {
    const myPetIds = new Set(
      this.dataStore.pets.filter((p) => p.userId === user.id).map((p) => p.id),
    );

    const incoming = this.dataStore.matches
      .filter(
        (m) =>
          myPetIds.has(m.targetPetId) &&
          (m.action === 'like' || m.action === 'superlike') &&
          m.status !== 'matched' &&
          !m.isUndone,
      )
      .sort((a, b) => {
        if (a.action === 'superlike' && b.action !== 'superlike') return -1;
        if (a.action !== 'superlike' && b.action === 'superlike') return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

    const items: Array<PetRecord & { hasSuperLikedMe: boolean }> = [];
    const seenPets = new Set<string>();

    for (const m of incoming) {
      if (seenPets.has(m.senderPetId)) continue;
      const pet = this.dataStore.pets.find((p) => p.id === m.senderPetId);
      if (!pet || pet.isHidden) continue;
      if (this.dataStore.isBlockedEitherWay(user.id, pet.userId)) continue;
      seenPets.add(pet.id);
      items.push({
        ...pet,
        hasSuperLikedMe: m.action === 'superlike',
      });
    }

    const tierRule =
      BUSINESS_RULES.tiers[user.vipTier] || BUSINESS_RULES.tiers.free;
    return {
      count: items.length,
      items: tierRule.canSeeLikesMe ? items : [],
    };
  }

  public getMyMatches(user: UserRecord) {
    const myPetIds = new Set(
      this.dataStore.pets.filter((p) => p.userId === user.id).map((p) => p.id),
    );

    const matchedRecords = this.dataStore.matches.filter(
      (m) =>
        m.status === 'matched' &&
        !m.isUndone &&
        (myPetIds.has(m.senderPetId) || myPetIds.has(m.targetPetId)),
    );

    const seenPairs = new Set<string>();
    const results: Array<any> = [];

    for (const m of matchedRecords) {
      const partnerPetId = myPetIds.has(m.senderPetId)
        ? m.targetPetId
        : m.senderPetId;
      if (seenPairs.has(partnerPetId)) continue;
      const partnerPet = this.dataStore.pets.find((p) => p.id === partnerPetId);
      if (!partnerPet) continue;
      if (this.dataStore.isBlockedEitherWay(user.id, partnerPet.userId)) {
        continue;
      }
      seenPairs.add(partnerPetId);

      const room = this.dataStore.chatRooms.find(
        (r) =>
          (myPetIds.has(r.petAId) && r.petBId === partnerPetId) ||
          (myPetIds.has(r.petBId) && r.petAId === partnerPetId),
      );

      results.push({
        id: m.id,
        matchedAt: m.matchedAt,
        roomId: room?.id || `room_${partnerPetId}`,
        pet: partnerPet,
      });
    }

    return results;
  }

  public activateBoost(user: UserRecord) {
    const now = new Date();
    if (user.boostExpiresAt && new Date(user.boostExpiresAt) > now) {
      throw new DomainException(
        'BOOST_ALREADY_ACTIVE',
        'Boost của bạn đang hoạt động trên Radar.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const tierRule =
      BUSINESS_RULES.tiers[user.vipTier] || BUSINESS_RULES.tiers.free;
    const weeklyUsed = this.dataStore.weeklyFreeBoostsUsed.get(user.id) || 0;
    const freeLeft = Math.max(0, tierRule.freeBoostsPerWeek - weeklyUsed);

    if (freeLeft > 0) {
      this.dataStore.weeklyFreeBoostsUsed.set(user.id, weeklyUsed + 1);
    } else if (user.boostBalance > 0) {
      user.boostBalance -= 1;
    } else {
      throw new DomainException(
        user.vipTier === 'free' ? 'VIP_REQUIRED' : 'BOOST_EXHAUSTED',
        'Bạn đã hết lượt Boost. Mua lẻ Boost 15k hoặc nâng cấp VIP để nhận Boost miễn phí mỗi tuần!',
        HttpStatus.FORBIDDEN,
      );
    }

    const durationMs =
      BUSINESS_RULES.products.boost.durationMinutes * 60 * 1000;
    user.boostExpiresAt = new Date(now.getTime() + durationMs).toISOString();
    this.dataStore.save();

    return {
      boostExpiresAt: user.boostExpiresAt,
      boostBalance: user.boostBalance,
    };
  }
}
