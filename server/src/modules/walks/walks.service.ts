import { Global, Injectable } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { BadgesService } from '../badges/badges.service';
import { BUSINESS_RULES } from '../../config/business-rules';
import { PetRecord, UserRecord } from '../../database/types';

export function roundCoordinate100m(coord: number): number {
  return Math.round(coord * 1000) / 1000;
}

type WalkingNowBroadcastFn = (userId: string, isWalkingNow: boolean) => void;

@Injectable()
export class WalksService {
  private broadcastFn: WalkingNowBroadcastFn | null = null;

  constructor(
    private readonly dataStore: DataStoreService,
    private readonly badgesService: BadgesService,
  ) {}

  public registerBroadcastFn(fn: WalkingNowBroadcastFn) {
    this.broadcastFn = fn;
  }

  public notifyWalkingNowChanged(userId: string, isWalkingNow: boolean) {
    if (this.broadcastFn) {
      this.broadcastFn(userId, isWalkingNow);
    }
  }

  public updateWalkStreakForUser(user: UserRecord): number {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterdayStr = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    if (user.lastWalkDate === todayStr) {
      if (user.walkStreakDays < 1) {
        user.walkStreakDays = 1;
      }
    } else if (user.lastWalkDate === yesterdayStr) {
      user.walkStreakDays += 1;
    } else {
      user.walkStreakDays = 1;
    }

    user.lastWalkDate = todayStr;
    user.updatedAt = now.toISOString();
    return user.walkStreakDays;
  }

  public getLiveWalkers(
    user: UserRecord,
    latParam?: string,
    lngParam?: string,
    radiusParam?: string,
  ) {
    const lat = latParam ? parseFloat(latParam) : user.latitude || 10.7951;
    const lng = lngParam ? parseFloat(lngParam) : user.longitude || 106.7218;
    const radius = radiusParam ? parseInt(radiusParam, 10) : 2500;
    const now = new Date();

    return this.dataStore.users
      .filter((u) => {
        if (u.id === user.id || u.isDeleted) return false;
        if (!u.isWalkingNow) return false;
        if (u.walkingUntil && new Date(u.walkingUntil) <= now) return false;
        if (this.dataStore.isBlockedEitherWay(user.id, u.id)) return false;
        const dist = this.dataStore.calculatePostGisDistanceMeters(
          lat,
          lng,
          u.latitude,
          u.longitude,
        );
        return dist <= radius;
      })
      .map((u) => {
        const primaryPet = this.dataStore.getActivePetForUser(u.id);
        return {
          userId: u.id,
          fullName: u.fullName,
          nickname: u.nickname,
          avatarUrl: u.avatarUrl,
          condoComplex: u.condoComplex,
          // Privacy rule §4.4: rounded to 100m grid
          lat: roundCoordinate100m(u.latitude),
          lng: roundCoordinate100m(u.longitude),
          walkingUntil: u.walkingUntil,
          pet: primaryPet
            ? {
                id: primaryPet.id,
                name: primaryPet.name,
                breed: primaryPet.breed,
                species: primaryPet.species,
                avatarUrl: primaryPet.avatarUrl,
                isSafePet: primaryPet.isSafePet,
              }
            : null,
        };
      });
  }

  public startWalk(
    user: UserRecord,
    activePet: PetRecord | undefined,
    body: { lat?: number; lng?: number; petId?: string },
  ) {
    const now = new Date();
    const durationMs = BUSINESS_RULES.walkNow.durationMinutes * 60 * 1000;
    const walkingUntil = new Date(now.getTime() + durationMs).toISOString();

    user.isWalkingNow = true;
    user.walkingUntil = walkingUntil;

    const lat = typeof body?.lat === 'number' ? body.lat : user.latitude;
    const lng = typeof body?.lng === 'number' ? body.lng : user.longitude;
    const petId = body?.petId || activePet?.id || 'pet_unknown';

    this.dataStore.activeWalkSessions.set(user.id, {
      petId,
      startedAt: now.toISOString(),
      points: [{ lat, lng, t: now.getTime() }],
    });

    this.dataStore.save();
    this.notifyWalkingNowChanged(user.id, true);

    return { walkingUntil };
  }

  public heartbeatWalk(
    user: UserRecord,
    body: { lat: number; lng: number },
  ) {
    const now = new Date();
    const durationMs = BUSINESS_RULES.walkNow.durationMinutes * 60 * 1000;
    const walkingUntil = new Date(now.getTime() + durationMs).toISOString();

    user.isWalkingNow = true;
    user.walkingUntil = walkingUntil;

    const session = this.dataStore.activeWalkSessions.get(user.id);
    if (
      session &&
      typeof body?.lat === 'number' &&
      typeof body?.lng === 'number'
    ) {
      if (session.points.length < BUSINESS_RULES.walkNow.maxGpsPoints) {
        session.points.push({
          lat: body.lat,
          lng: body.lng,
          t: now.getTime(),
        });
      }
    }

    this.dataStore.save();
    return { walkingUntil };
  }

  public async stopWalk(
    user: UserRecord,
    activePet: PetRecord | undefined,
    body?: { points?: Array<{ lat: number; lng: number; t?: number }> },
  ) {
    const now = new Date();
    user.isWalkingNow = false;
    user.walkingUntil = null;

    const session = this.dataStore.activeWalkSessions.get(user.id);
    this.dataStore.activeWalkSessions.delete(user.id);

    const rawPoints =
      Array.isArray(body?.points) && body!.points.length > 0
        ? body!.points.slice(0, BUSINESS_RULES.walkNow.maxGpsPoints)
        : session?.points || [];

    let distanceMeters = 0;
    for (let i = 1; i < rawPoints.length; i++) {
      const p1 = rawPoints[i - 1];
      const p2 = rawPoints[i];
      if (
        typeof p1.lat === 'number' &&
        typeof p1.lng === 'number' &&
        typeof p2.lat === 'number' &&
        typeof p2.lng === 'number'
      ) {
        distanceMeters += this.dataStore.calculatePostGisDistanceMeters(
          p1.lat,
          p1.lng,
          p2.lat,
          p2.lng,
        );
      }
    }

    if (distanceMeters === 0 && rawPoints.length <= 1) {
      distanceMeters = 450; // Default minimum walk log distance if stopped without multi-point GPS track
    }

    const petId =
      session?.petId ||
      activePet?.id ||
      this.dataStore.getActivePetForUser(user.id)?.id ||
      'pet_bo_01';

    this.dataStore.walkLogs.unshift({
      id: `walk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      petId,
      startedAt:
        session?.startedAt ||
        new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      endedAt: now.toISOString(),
      distanceMeters,
      source: 'walk_now',
    });

    user.totalWalkMeters += distanceMeters;
    const streakDays = this.updateWalkStreakForUser(user);
    this.dataStore.save();

    this.notifyWalkingNowChanged(user.id, false);
    const newBadges = await this.badgesService.checkAndAwardBadges(user.id);

    return {
      distanceMeters,
      streakDays,
      newBadges,
    };
  }
}
