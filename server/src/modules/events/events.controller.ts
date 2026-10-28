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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DomainException } from '../../common/errors';
import { EventRecord, UserRecord } from '../../database/types';

@Controller('events')
export class EventsController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get()
  getEvents(
    @CurrentUser() user: UserRecord,
    @Query('clubId') clubId?: string,
    @Query('upcoming') upcoming?: string,
    @Query('lat') latStr?: string,
    @Query('lng') lngStr?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const now = new Date();
    const lat = latStr ? parseFloat(latStr) : user.latitude || 10.7951;
    const lng = lngStr ? parseFloat(lngStr) : user.longitude || 106.7218;

    const list = this.dataStore.events
      .filter((e) => {
        if (clubId && e.clubId !== clubId) return false;
        if (upcoming === 'true' && new Date(e.startsAt) < now) return false;
        return true;
      })
      .map((e) => {
        const myRsvp = this.dataStore.eventRsvps.find(
          (r) => r.eventId === e.id && r.userId === user.id,
        );
        return {
          ...e,
          myRsvpStatus: myRsvp?.status || 'none',
          distanceMeters: this.dataStore.calculatePostGisDistanceMeters(
            lat,
            lng,
            e.lat,
            e.lng,
          ),
        };
      })
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );

    return this.dataStore.paginate(list, page, limit);
  }

  @Post()
  createEvent(
    @CurrentUser() user: UserRecord,
    @Body()
    body: {
      clubId?: string;
      title: string;
      description: string;
      coverUrl?: string;
      placeName: string;
      lat: number;
      lng: number;
      startsAt: string;
      capacity: number;
    },
  ) {
    if (!body?.title || !body?.placeName || !body?.startsAt) {
      throw new DomainException(
        'BAD_REQUEST',
        'Vui lòng nhập tiêu đề, địa điểm và thời gian bắt đầu sự kiện.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (body.clubId) {
      const club = this.dataStore.clubs.find((c) => c.id === body.clubId);
      if (!club) {
        throw new DomainException(
          'NOT_FOUND',
          'Không tìm thấy Câu lạc bộ.',
          HttpStatus.NOT_FOUND,
        );
      }
      if (club.ownerUserId !== user.id && user.role !== 'admin') {
        throw new DomainException(
          'FORBIDDEN',
          'Chỉ chủ sở hữu Câu lạc bộ mới có quyền tạo sự kiện cho CLB.',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const nowIso = new Date().toISOString();
    const newEvent: EventRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      clubId: body.clubId || null,
      title: body.title.trim(),
      description: (body.description || '').trim(),
      coverUrl:
        body.coverUrl ||
        'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
      placeName: body.placeName.trim(),
      lat: Number(body.lat ?? user.latitude),
      lng: Number(body.lng ?? user.longitude),
      startsAt: body.startsAt,
      capacity: Math.max(2, Number(body.capacity || 20)),
      rsvpCount: 1,
      createdBy: user.id,
    };

    this.dataStore.events.unshift(newEvent);
    this.dataStore.eventRsvps.push({
      eventId: newEvent.id,
      userId: user.id,
      status: 'going',
      createdAt: nowIso,
    });
    this.dataStore.save();

    return {
      ...newEvent,
      myRsvpStatus: 'going',
    };
  }

  @Post(':id/rsvp')
  @HttpCode(HttpStatus.OK)
  rsvpEvent(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
    @Body() body: { status: 'going' | 'maybe' | 'none' },
  ) {
    const event = this.dataStore.events.find((e) => e.id === id);
    if (!event) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy sự kiện.',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingIdx = this.dataStore.eventRsvps.findIndex(
      (r) => r.eventId === id && r.userId === user.id,
    );
    const currentGoingCount = this.dataStore.eventRsvps.filter(
      (r) => r.eventId === id && r.status === 'going' && r.userId !== user.id,
    ).length;

    if (body?.status === 'going' && currentGoingCount >= event.capacity) {
      throw new DomainException(
        'EVENT_FULL',
        'Sự kiện đã đạt số lượng người tham gia tối đa.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (body?.status === 'none') {
      if (existingIdx >= 0) {
        this.dataStore.eventRsvps.splice(existingIdx, 1);
      }
    } else {
      const status = body?.status === 'maybe' ? 'maybe' : 'going';
      if (existingIdx >= 0) {
        this.dataStore.eventRsvps[existingIdx].status = status;
      } else {
        this.dataStore.eventRsvps.push({
          eventId: id,
          userId: user.id,
          status,
          createdAt: new Date().toISOString(),
        });
      }
    }

    event.rsvpCount = this.dataStore.eventRsvps.filter(
      (r) => r.eventId === id && r.status === 'going',
    ).length;

    this.dataStore.save();
    return {
      rsvpCount: event.rsvpCount,
      status: body?.status || 'going',
    };
  }
}
