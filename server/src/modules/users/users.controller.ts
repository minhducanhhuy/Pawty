import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationPrefs, UserLocaleType, UserRecord } from '../../database/types';
import { enrichUserWithQuotas } from '../auth/auth.controller';
import { BUSINESS_RULES } from '../../config/business-rules';
import { DomainException } from '../../common/errors';

@Controller('users')
export class UsersController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get('me')
  getMe(@CurrentUser() user: UserRecord) {
    return enrichUserWithQuotas(user, this.dataStore);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: UserRecord,
    @Body()
    body: {
      fullName?: string;
      nickname?: string;
      avatarUrl?: string;
      condoComplex?: string;
      age?: number;
      gender?: string;
      occupation?: string;
      bio?: string;
      intentTags?: string[];
      latitude?: number;
      longitude?: number;
      locale?: UserLocaleType;
      isDistanceHidden?: boolean;
      notificationPrefs?: Partial<NotificationPrefs>;
      fcmToken?: string;
    },
  ) {
    if (body.fullName !== undefined) user.fullName = body.fullName;
    if (body.nickname !== undefined) user.nickname = body.nickname;
    if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl;
    if (body.condoComplex !== undefined) user.condoComplex = body.condoComplex;
    if (typeof body.age === 'number') user.age = body.age;
    if (body.gender !== undefined) user.gender = body.gender;
    if (body.occupation !== undefined) user.occupation = body.occupation;
    if (body.bio !== undefined) user.bio = body.bio;
    if (Array.isArray(body.intentTags)) user.intentTags = body.intentTags;
    if (typeof body.latitude === 'number') user.latitude = body.latitude;
    if (typeof body.longitude === 'number') user.longitude = body.longitude;
    if (body.locale === 'vi' || body.locale === 'en') user.locale = body.locale;
    if (typeof body.isDistanceHidden === 'boolean') {
      user.isDistanceHidden = body.isDistanceHidden;
    }
    if (body.notificationPrefs) {
      user.notificationPrefs = {
        ...user.notificationPrefs,
        ...body.notificationPrefs,
      };
    }
    if (body.fcmToken !== undefined) user.fcmToken = body.fcmToken;
    user.updatedAt = new Date().toISOString();

    for (const pet of this.dataStore.pets) {
      if (pet.userId === user.id) {
        if (typeof body.latitude === 'number') pet.latitude = body.latitude;
        if (typeof body.longitude === 'number') pet.longitude = body.longitude;
        if (body.condoComplex !== undefined) pet.condoComplex = body.condoComplex;
        if (body.fullName !== undefined) pet.ownerName = body.fullName;
        if (body.avatarUrl !== undefined) pet.ownerAvatar = body.avatarUrl;
        if (typeof body.age === 'number') pet.ownerAge = body.age;
        if (body.gender !== undefined) pet.ownerGender = body.gender;
        if (body.occupation !== undefined) pet.ownerOccupation = body.occupation;
        if (body.bio !== undefined) pet.ownerBio = body.bio;
        if (Array.isArray(body.intentTags)) pet.intentTags = body.intentTags;
      }
    }

    this.dataStore.save();
    return enrichUserWithQuotas(user, this.dataStore);
  }

  @Delete('me')
  deleteMe(@CurrentUser() user: UserRecord) {
    user.isDeleted = true;
    user.isWalkingNow = false;
    user.walkingUntil = null;
    user.updatedAt = new Date().toISOString();
    this.dataStore.save();

    const scheduledHardDeleteAt = new Date(
      Date.now() +
        BUSINESS_RULES.privacy.hardDeleteGraceDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    return { scheduledHardDeleteAt };
  }

  @Get('me/export')
  exportMyData(@CurrentUser() user: UserRecord) {
    const myPets = this.dataStore.pets.filter((p) => p.userId === user.id);
    const myPetIds = new Set(myPets.map((p) => p.id));

    return {
      exportedAt: new Date().toISOString(),
      user: enrichUserWithQuotas(user, this.dataStore),
      pets: myPets,
      moments: this.dataStore.moments.filter((m) => myPetIds.has(m.petId)),
      matches: this.dataStore.matches.filter(
        (m) => myPetIds.has(m.senderPetId) || myPetIds.has(m.targetPetId),
      ),
      appointments: this.dataStore.appointments.filter(
        (a) => myPetIds.has(a.senderPetId) || myPetIds.has(a.receiverPetId),
      ),
      walkLogs: this.dataStore.walkLogs.filter((w) => w.userId === user.id),
      vouchers: this.dataStore.vouchers.filter((v) => v.userId === user.id),
      badges: this.dataStore.userBadges.filter((ub) => ub.userId === user.id),
      notifications: this.dataStore.notifications.filter(
        (n) => n.userId === user.id,
      ),
      transactions: this.dataStore.transactions.filter(
        (t) => t.userId === user.id,
      ),
    };
  }

  @Post('blocks')
  blockUser(
    @CurrentUser() user: UserRecord,
    @Body() body: { blockedUserId: string },
  ) {
    if (!body?.blockedUserId || body.blockedUserId === user.id) {
      throw new DomainException(
        'BAD_REQUEST',
        'ID người dùng cần chặn không hợp lệ.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const exists = this.dataStore.blocks.some(
      (b) =>
        b.blockerUserId === user.id && b.blockedUserId === body.blockedUserId,
    );
    if (!exists) {
      this.dataStore.blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        blockerUserId: user.id,
        blockedUserId: body.blockedUserId,
        createdAt: new Date().toISOString(),
      });
      this.dataStore.save();
    }

    return { blocked: true };
  }

  @Delete('blocks/:userId')
  unblockUser(
    @CurrentUser() user: UserRecord,
    @Param('userId') blockedUserId: string,
  ) {
    this.dataStore.blocks = this.dataStore.blocks.filter(
      (b) =>
        !(b.blockerUserId === user.id && b.blockedUserId === blockedUserId),
    );
    this.dataStore.save();
    return { blocked: false };
  }

  @Get('blocks')
  getBlockedUsers(@CurrentUser() user: UserRecord) {
    const blockedIds = new Set(
      this.dataStore.blocks
        .filter((b) => b.blockerUserId === user.id)
        .map((b) => b.blockedUserId),
    );

    return this.dataStore.users
      .filter((u) => blockedIds.has(u.id))
      .map((u) => ({
        id: u.id,
        fullName: u.fullName,
        nickname: u.nickname,
        avatarUrl: u.avatarUrl,
        condoComplex: u.condoComplex,
      }));
  }
}
