import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { BadgesService } from '../badges/badges.service';
import {
  ActivePet,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES } from '../../config/business-rules';
import {
  PetMomentRecord,
  PetRecord,
  UserRecord,
} from '../../database/types';

function enrichMoment(
  moment: PetMomentRecord,
  currentUserId: string,
  dataStore: DataStoreService,
) {
  const pet = dataStore.pets.find((p) => p.id === moment.petId);
  const isLikedByMe = dataStore.momentLikes.some(
    (ml) => ml.momentId === moment.id && ml.userId === currentUserId,
  );
  const commentsCount = dataStore.momentComments.filter(
    (mc) => mc.momentId === moment.id,
  ).length;

  return {
    ...moment,
    isLikedByMe,
    commentsCount,
    pet: pet
      ? {
          id: pet.id,
          name: pet.name,
          breed: pet.breed,
          species: pet.species,
          avatarUrl: pet.avatarUrl,
          condoComplex: pet.condoComplex,
          ownerName: pet.ownerName,
          ownerAvatar: pet.ownerAvatar,
          isSafePet: pet.isSafePet,
        }
      : null,
  };
}

@Controller('moments')
export class MomentsController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly badgesService: BadgesService,
  ) {}

  @Get()
  getMoments(
    @CurrentUser() user: UserRecord,
    @Query('filter') filter?: 'all' | 'mine',
    @Query('petId') petId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const myPetIds = new Set(
      this.dataStore.pets.filter((p) => p.userId === user.id).map((p) => p.id),
    );

    const filtered = this.dataStore.moments
      .filter((m) => {
        if (m.isHidden) return false;
        if (petId && m.petId !== petId) return false;
        if (filter === 'mine' && !myPetIds.has(m.petId)) return false;
        const pet = this.dataStore.pets.find((p) => p.id === m.petId);
        if (pet && this.dataStore.isBlockedEitherWay(user.id, pet.userId)) {
          return false;
        }
        return true;
      })
      .map((m) => enrichMoment(m, user.id, this.dataStore));

    return this.dataStore.paginate(filtered, page, limit);
  }

  @Post()
  async createMoment(
    @CurrentUser() user: UserRecord,
    @ActivePet() activePet: PetRecord | undefined,
    @Body()
    body: {
      petId?: string;
      mediaUrl: string;
      mediaType?: 'image' | 'video';
      caption: string;
    },
  ) {
    if (!body?.mediaUrl || !body?.caption) {
      throw new DomainException(
        'BAD_REQUEST',
        'Ảnh và lời bình caption là bắt buộc.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const myPets = this.dataStore.pets.filter((p) => p.userId === user.id);
    const myPetIds = new Set(myPets.map((p) => p.id));
    const myMomentsCount = this.dataStore.moments.filter((m) =>
      myPetIds.has(m.petId),
    ).length;

    const tierRule =
      BUSINESS_RULES.tiers[user.vipTier] || BUSINESS_RULES.tiers.free;
    if (
      tierRule.maxMoments !== null &&
      myMomentsCount >= tierRule.maxMoments
    ) {
      throw new DomainException(
        'VIP_STORAGE_LIMIT_REACHED',
        `Tài khoản miễn phí chỉ lưu tối đa ${tierRule.maxMoments} ảnh Khoảnh khắc. Nâng cấp Sen VIP để mở kho ảnh không giới hạn!`,
        HttpStatus.FORBIDDEN,
      );
    }

    const targetPet =
      (body.petId && myPets.find((p) => p.id === body.petId)) ||
      activePet ||
      myPets[0];

    if (!targetPet) {
      throw new DomainException(
        'BAD_REQUEST',
        'Bạn cần tạo hồ sơ Boss trước khi đăng khoảnh khắc.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newMoment: PetMomentRecord = {
      id: `moment_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      petId: targetPet.id,
      mediaUrl: body.mediaUrl,
      mediaType: body.mediaType === 'video' ? 'video' : 'image',
      caption: body.caption.trim(),
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.dataStore.moments.unshift(newMoment);
    this.dataStore.save();

    await this.badgesService.checkAndAwardBadges(user.id);
    return enrichMoment(newMoment, user.id, this.dataStore);
  }

  @Delete(':id')
  deleteMoment(@CurrentUser() user: UserRecord, @Param('id') id: string) {
    const moment = this.dataStore.moments.find((m) => m.id === id);
    if (!moment) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy khoảnh khắc.',
        HttpStatus.NOT_FOUND,
      );
    }

    const pet = this.dataStore.pets.find((p) => p.id === moment.petId);
    const isAdminOrMod = user.role === 'admin' || user.role === 'moderator';
    if (pet?.userId !== user.id && !isAdminOrMod) {
      throw new DomainException(
        'FORBIDDEN',
        'Bạn chỉ có thể xoá ảnh khoảnh khắc của mình.',
        HttpStatus.FORBIDDEN,
      );
    }

    this.dataStore.moments = this.dataStore.moments.filter((m) => m.id !== id);
    this.dataStore.momentLikes = this.dataStore.momentLikes.filter(
      (ml) => ml.momentId !== id,
    );
    this.dataStore.momentComments = this.dataStore.momentComments.filter(
      (mc) => mc.momentId !== id,
    );
    this.dataStore.save();

    return { deleted: true, id };
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  toggleLikeMoment(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
  ) {
    const moment = this.dataStore.moments.find((m) => m.id === id);
    if (!moment) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy khoảnh khắc.',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingIdx = this.dataStore.momentLikes.findIndex(
      (ml) => ml.momentId === id && ml.userId === user.id,
    );

    let liked: boolean;
    if (existingIdx >= 0) {
      this.dataStore.momentLikes.splice(existingIdx, 1);
      moment.likesCount = Math.max(0, moment.likesCount - 1);
      liked = false;
    } else {
      this.dataStore.momentLikes.push({
        id: `ml_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        momentId: id,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      moment.likesCount += 1;
      liked = true;
    }

    this.dataStore.save();
    return {
      liked,
      likesCount: moment.likesCount,
    };
  }

  @Get(':id/comments')
  getMomentComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const comments = this.dataStore.momentComments
      .filter((mc) => mc.momentId === id)
      .map((mc) => {
        const author = this.dataStore.users.find((u) => u.id === mc.userId);
        return {
          ...mc,
          user: author
            ? {
                id: author.id,
                fullName: author.fullName,
                nickname: author.nickname,
                avatarUrl: author.avatarUrl,
              }
            : null,
        };
      });

    return this.dataStore.paginate(comments, page, limit);
  }

  @Post(':id/comments')
  createMomentComment(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
    @Body() body: { text: string },
  ) {
    const moment = this.dataStore.moments.find((m) => m.id === id);
    if (!moment) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy khoảnh khắc.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!body?.text || !body.text.trim()) {
      throw new DomainException(
        'BAD_REQUEST',
        'Nội dung bình luận không được để trống.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const comment = {
      id: `mc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      momentId: id,
      userId: user.id,
      text: body.text.trim(),
      createdAt: new Date().toISOString(),
    };

    this.dataStore.momentComments.push(comment);
    this.dataStore.save();

    return {
      ...comment,
      user: {
        id: user.id,
        fullName: user.fullName,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  @Delete(':id/comments/:commentId')
  deleteMomentComment(
    @CurrentUser() user: UserRecord,
    @Param('id') momentId: string,
    @Param('commentId') commentId: string,
  ) {
    const comment = this.dataStore.momentComments.find(
      (mc) => mc.id === commentId && mc.momentId === momentId,
    );
    if (!comment) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy bình luận.',
        HttpStatus.NOT_FOUND,
      );
    }

    const moment = this.dataStore.moments.find((m) => m.id === momentId);
    const momentPet = moment
      ? this.dataStore.pets.find((p) => p.id === moment.petId)
      : null;
    const isCommentOwner = comment.userId === user.id;
    const isMomentOwner = momentPet?.userId === user.id;
    const isClubOwner = this.dataStore.clubs.some(
      (c) => c.ownerUserId === user.id,
    );
    const isAdminOrMod = user.role === 'admin' || user.role === 'moderator';

    if (!isCommentOwner && !isMomentOwner && !isClubOwner && !isAdminOrMod) {
      throw new DomainException(
        'FORBIDDEN',
        'Bạn không có quyền xoá bình luận này.',
        HttpStatus.FORBIDDEN,
      );
    }

    this.dataStore.momentComments = this.dataStore.momentComments.filter(
      (mc) => mc.id !== commentId,
    );
    this.dataStore.save();
    return { deleted: true, commentId };
  }

  @Get(':id/share')
  shareMoment(@Param('id') id: string) {
    const moment = this.dataStore.moments.find((m) => m.id === id);
    if (!moment) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy khoảnh khắc.',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      shareUrl: `https://pawty.app/moments/${moment.id}`,
      imageUrl: moment.mediaUrl,
      caption: moment.caption,
      watermark: 'Pawty',
    };
  }
}

@Controller('feed')
export class FeedController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get()
  getRegionalFeed(
    @CurrentUser() user: UserRecord,
    @Query('lat') latStr?: string,
    @Query('lng') lngStr?: string,
    @Query('radius') radiusStr?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const lat = latStr ? parseFloat(latStr) : user.latitude || 10.7951;
    const lng = lngStr ? parseFloat(lngStr) : user.longitude || 106.7218;
    const radius = radiusStr ? parseInt(radiusStr, 10) : 3000;

    const regionalMoments = this.dataStore.moments
      .filter((m) => {
        if (m.isHidden) return false;
        const pet = this.dataStore.pets.find((p) => p.id === m.petId);
        if (!pet || pet.isHidden) return false;
        const owner = this.dataStore.users.find((u) => u.id === pet.userId);
        if (!owner || owner.isDeleted) return false;
        if (this.dataStore.isBlockedEitherWay(user.id, pet.userId)) {
          return false;
        }
        const dist = this.dataStore.calculatePostGisDistanceMeters(
          lat,
          lng,
          pet.latitude,
          pet.longitude,
        );
        return dist <= radius;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((m) => enrichMoment(m, user.id, this.dataStore));

    return this.dataStore.paginate(regionalMoments, page, limit);
  }
}
