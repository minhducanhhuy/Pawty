import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { BadgesService } from '../badges/badges.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES } from '../../config/business-rules';
import { ClubRecord, ClubType, UserRecord } from '../../database/types';

@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly badgesService: BadgesService,
  ) {}

  @Get()
  getClubs(
    @CurrentUser() user: UserRecord,
    @Query('type') type?: ClubType,
    @Query('q') q?: string,
    @Query('mine') mine?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const qLower = q?.trim().toLowerCase();
    const myClubIds = new Set(
      this.dataStore.clubMembers
        .filter((cm) => cm.userId === user.id)
        .map((cm) => cm.clubId),
    );

    const list = this.dataStore.clubs
      .filter((club) => {
        if (club.isHidden) return false;
        if (type && club.type !== type) return false;
        if (mine === 'true' && !myClubIds.has(club.id)) return false;
        if (qLower) {
          const hay = `${club.name} ${club.breedOrBuilding} ${club.description}`.toLowerCase();
          if (!hay.includes(qLower)) return false;
        }
        return true;
      })
      .map((club) => ({
        ...club,
        isMember: myClubIds.has(club.id),
      }));

    return this.dataStore.paginate(list, page, limit);
  }

  @Post()
  async createClub(
    @CurrentUser() user: UserRecord,
    @Body()
    body: {
      name: string;
      type: ClubType;
      breedOrBuilding: string;
      description: string;
      coverUrl?: string;
    },
  ) {
    if (!body?.name || !body?.breedOrBuilding || !body?.description) {
      throw new DomainException(
        'BAD_REQUEST',
        'Vui lòng điền đầy đủ tên CLB, giống/toà nhà và mô tả.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const ownedCount = this.dataStore.clubs.filter(
      (c) => c.ownerUserId === user.id,
    ).length;
    if (ownedCount >= BUSINESS_RULES.community.maxClubsPerUser) {
      throw new DomainException(
        'CLUB_LIMIT_REACHED',
        `Mỗi tài khoản chỉ được tạo tối đa ${BUSINESS_RULES.community.maxClubsPerUser} Câu lạc bộ.`,
        HttpStatus.FORBIDDEN,
      );
    }

    const nameNorm = body.name.trim().toLowerCase();
    const nameExists = this.dataStore.clubs.some(
      (c) => c.name.trim().toLowerCase() === nameNorm,
    );
    if (nameExists) {
      throw new DomainException(
        'CLUB_NAME_TAKEN',
        'Tên Câu lạc bộ này đã tồn tại. Vui lòng chọn tên khác.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const nowIso = new Date().toISOString();
    const club: ClubRecord = {
      id: `club_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: body.name.trim(),
      type: body.type === 'building' ? 'building' : 'breed',
      breedOrBuilding: body.breedOrBuilding.trim(),
      coverUrl:
        body.coverUrl ||
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      description: body.description.trim(),
      ownerUserId: user.id,
      membersCount: 1,
      createdAt: nowIso,
    };

    this.dataStore.clubs.unshift(club);
    this.dataStore.clubMembers.push({
      clubId: club.id,
      userId: user.id,
      role: 'owner',
      joinedAt: nowIso,
    });
    this.dataStore.save();

    await this.badgesService.checkAndAwardBadges(user.id);
    return {
      ...club,
      isMember: true,
    };
  }

  @Get(':id')
  getClubDetail(@CurrentUser() user: UserRecord, @Param('id') id: string) {
    const club = this.dataStore.clubs.find((c) => c.id === id);
    if (!club || club.isHidden) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy Câu lạc bộ.',
        HttpStatus.NOT_FOUND,
      );
    }

    const membership = this.dataStore.clubMembers.find(
      (cm) => cm.clubId === id && cm.userId === user.id,
    );

    const upcomingEvents = this.dataStore.events
      .filter((e) => e.clubId === id)
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      )
      .slice(0, 3);

    return {
      ...club,
      isMember: Boolean(membership),
      myRole: membership?.role || null,
      upcomingEvents,
    };
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinClub(@CurrentUser() user: UserRecord, @Param('id') id: string) {
    const club = this.dataStore.clubs.find((c) => c.id === id);
    if (!club) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy Câu lạc bộ.',
        HttpStatus.NOT_FOUND,
      );
    }

    const existing = this.dataStore.clubMembers.find(
      (cm) => cm.clubId === id && cm.userId === user.id,
    );
    if (!existing) {
      this.dataStore.clubMembers.push({
        clubId: id,
        userId: user.id,
        role: 'member',
        joinedAt: new Date().toISOString(),
      });
      club.membersCount += 1;
      this.dataStore.save();
      await this.badgesService.checkAndAwardBadges(user.id);
    }

    return {
      joined: true,
      membersCount: club.membersCount,
    };
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  leaveClub(@CurrentUser() user: UserRecord, @Param('id') id: string) {
    const club = this.dataStore.clubs.find((c) => c.id === id);
    if (!club) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy Câu lạc bộ.',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingIdx = this.dataStore.clubMembers.findIndex(
      (cm) => cm.clubId === id && cm.userId === user.id,
    );
    if (existingIdx >= 0) {
      if (this.dataStore.clubMembers[existingIdx].role === 'owner') {
        throw new DomainException(
          'BAD_REQUEST',
          'Chủ sở hữu không thể rời khỏi Câu lạc bộ do mình tạo.',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.dataStore.clubMembers.splice(existingIdx, 1);
      club.membersCount = Math.max(1, club.membersCount - 1);
      this.dataStore.save();
    }

    return {
      joined: false,
      membersCount: club.membersCount,
    };
  }
}
