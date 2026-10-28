import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { PlacesAdapterService } from '../../adapters/places.adapter';
import { PushAdapterService } from '../../adapters/push.adapter';
import { BadgesService } from '../badges/badges.service';
import { WalksService } from '../walks/walks.service';
import { ChatGateway } from '../chat/chat.gateway';
import {
  ActivePet,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES } from '../../config/business-rules';
import {
  PetRecord,
  UserRecord,
  WalkAppointmentRecord,
} from '../../database/types';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly placesAdapter: PlacesAdapterService,
    private readonly pushAdapter: PushAdapterService,
    private readonly badgesService: BadgesService,
    private readonly walksService: WalksService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('suggestions')
  getPlaceSuggestions(
    @Query('petAId') petAId?: string,
    @Query('petBId') petBId?: string,
  ) {
    const petA =
      (petAId && this.dataStore.pets.find((p) => p.id === petAId)) ||
      this.dataStore.pets[0];
    const petB =
      (petBId && this.dataStore.pets.find((p) => p.id === petBId)) ||
      this.dataStore.pets[1] ||
      petA;

    const result = this.placesAdapter.getMidpointSuggestions(
      petA.latitude,
      petA.longitude,
      petB.latitude,
      petB.longitude,
    );
    return {
      midpoint: result.midpoint,
      suggestions: result.suggestions,
      items: result.suggestions,
    };
  }

  @Get()
  getMyAppointments(@CurrentUser() user: UserRecord) {
    const myPetIds = new Set(
      this.dataStore.pets.filter((p) => p.userId === user.id).map((p) => p.id),
    );
    return this.dataStore.appointments.filter(
      (a) => myPetIds.has(a.senderPetId) || myPetIds.has(a.receiverPetId),
    );
  }

  @Post()
  async createAppointment(
    @CurrentUser() user: UserRecord,
    @ActivePet() activePet: PetRecord | undefined,
    @Body()
    body: {
      roomId: string;
      senderPetId?: string;
      receiverPetId: string;
      scheduledTime: string;
      displayTime?: string;
      placeId?: string;
      placeName?: string;
      placeAddress?: string;
      placeThumbnail?: string;
      placeLat?: number;
      placeLng?: number;
      note?: string;
    },
  ) {
    const senderPet =
      (body.senderPetId &&
        this.dataStore.pets.find(
          (p) => p.id === body.senderPetId && p.userId === user.id,
        )) ||
      activePet ||
      this.dataStore.pets.find((p) => p.userId === user.id);

    if (!senderPet) {
      throw new DomainException(
        'BAD_REQUEST',
        'Không tìm thấy Boss gửi lời mời hẹn.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const place = body.placeId
      ? this.dataStore.places.find((pl) => pl.id === body.placeId)
      : undefined;

    const placeName =
      body.placeName || place?.name || 'Công viên Landmark 81 ven sông';
    const placeAddress =
      body.placeAddress ||
      place?.address ||
      '208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM';
    const placeThumbnail =
      body.placeThumbnail ||
      place?.thumbnailUrl ||
      'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80';
    const placeLat =
      typeof body.placeLat === 'number'
        ? body.placeLat
        : place?.lat ?? 10.7948;
    const placeLng =
      typeof body.placeLng === 'number'
        ? body.placeLng
        : place?.lng ?? 106.7222;

    const scheduledTime =
      body.scheduledTime || new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const nowIso = new Date().toISOString();

    const newApt: WalkAppointmentRecord = {
      id: `apt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roomId: body.roomId || `room_${body.receiverPetId}`,
      senderPetId: senderPet.id,
      receiverPetId: body.receiverPetId,
      scheduledTime,
      displayTime:
        body.displayTime ||
        new Date(scheduledTime).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      placeName,
      placeAddress,
      placeThumbnail,
      placeLat,
      placeLng,
      placeDistanceMeters: this.dataStore.calculatePostGisDistanceMeters(
        senderPet.latitude,
        senderPet.longitude,
        placeLat,
        placeLng,
      ),
      checkedInSenderAt: null,
      checkedInReceiverAt: null,
      reminderSentAt: null,
      completedAt: null,
      note: body.note || null,
      status: 'pending',
      createdAt: nowIso,
    };

    this.dataStore.appointments.push(newApt);

    this.dataStore.chatMessages.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roomId: newApt.roomId,
      senderPetId: senderPet.id,
      text: `📅 Lời mời hẹn dắt dạo tại ${placeName}`,
      appointmentId: newApt.id,
      isRead: false,
      status: 'delivered',
      createdAt: nowIso,
    });

    const room = this.dataStore.chatRooms.find((r) => r.id === newApt.roomId);
    if (room) {
      room.lastMessageText = `📅 Lời mời hẹn dắt dạo tại ${placeName}`;
      room.lastMessageAt = nowIso;
    }

    this.dataStore.save();

    const receiverPet = this.dataStore.pets.find(
      (p) => p.id === body.receiverPetId,
    );
    if (receiverPet) {
      await this.pushAdapter.sendPush(receiverPet.userId, {
        type: 'appointment',
        title: `📅 ${senderPet.name} mời ${receiverPet.name} đi dạo!`,
        body: `Điểm hẹn: ${placeName} (${newApt.displayTime})`,
        payload: { appointmentId: newApt.id, roomId: newApt.roomId },
      });
    }

    return newApt;
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
    @Body()
    body: {
      status: 'confirmed' | 'rejected' | 'reported_flake';
    },
  ) {
    const apt = this.dataStore.appointments.find((a) => a.id === id);
    if (!apt) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy lịch hẹn dắt dạo.',
        HttpStatus.NOT_FOUND,
      );
    }

    const senderPet = this.dataStore.pets.find(
      (p) => p.id === apt.senderPetId,
    );
    const receiverPet = this.dataStore.pets.find(
      (p) => p.id === apt.receiverPetId,
    );
    const isSender = senderPet?.userId === user.id;
    const isReceiver = receiverPet?.userId === user.id;

    if (body.status === 'reported_flake') {
      if (apt.status === 'completed' || apt.status === 'rejected') {
        throw new DomainException(
          'FLAKE_REPORT_NOT_ELIGIBLE',
          'Không thể báo cáo bùng kèo đối với lịch hẹn đã hoàn thành hoặc đã từ chối.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (apt.checkedInSenderAt && apt.checkedInReceiverAt) {
        throw new DomainException(
          'FLAKE_REPORT_NOT_ELIGIBLE',
          'Cả hai bên đều đã Check-in tại điểm hẹn.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Tier 05 §4.5: If check-in was used, only the party that checked in can report flake
      if (apt.checkedInSenderAt || apt.checkedInReceiverAt) {
        const didCallerCheckIn = isSender
          ? Boolean(apt.checkedInSenderAt)
          : isReceiver
            ? Boolean(apt.checkedInReceiverAt)
            : false;

        if (!didCallerCheckIn) {
          throw new DomainException(
            'FLAKE_REPORT_NOT_ELIGIBLE',
            'Chỉ bên đã Check-in tại điểm hẹn mới có quyền báo cáo bùng kèo.',
            HttpStatus.FORBIDDEN,
          );
        }
      }

      apt.status = 'reported_flake';

      const flakerUserId = isSender
        ? receiverPet?.userId
        : isReceiver
          ? senderPet?.userId
          : receiverPet?.userId || senderPet?.userId;

      const flakerUser =
        this.dataStore.users.find((u) => u.id === flakerUserId) || user;

      flakerUser.flakeReportsCount += 1;
      let isBanned = false;

      if (
        flakerUser.flakeReportsCount >=
        BUSINESS_RULES.antiFlake.maxFlakesPerWeek
      ) {
        flakerUser.isBannedSwiping = true;
        flakerUser.banUntil = new Date(
          Date.now() +
            BUSINESS_RULES.antiFlake.banDurationDays * 24 * 60 * 60 * 1000,
        ).toISOString();
        isBanned = true;
      }

      this.dataStore.logAudit(
        user.id,
        isBanned ? 'ANTI_FLAKE_BAN_TRIGGERED' : 'FLAKE_REPORTED',
        'user',
        flakerUser.id,
        {
          appointmentId: apt.id,
          flakeReportsCount: flakerUser.flakeReportsCount,
          banUntil: flakerUser.banUntil,
        },
      );

      this.dataStore.save();

      await this.pushAdapter.sendPush(flakerUser.id, {
        type: 'system',
        title: isBanned
          ? '🚫 Tạm khoá quyền quẹt thẻ 3 ngày'
          : '⚠️ Cảnh báo văn minh cộng đồng (Bùng hẹn lần 1/2)',
        body: isBanned
          ? 'Tài khoản của bạn đã bị báo cáo bùng kèo 2 lần trong tuần và tạm khoá quẹt thẻ 3 ngày.'
          : 'Bạn vừa bị báo cáo không có mặt tại điểm hẹn dắt dạo. Nếu tái phạm lần 2 trong tuần sẽ bị khoá quẹt 3 ngày.',
        payload: {
          appointmentId: apt.id,
          flakeReportsCount: flakerUser.flakeReportsCount,
          banUntil: flakerUser.banUntil,
        },
      });

      return {
        ...apt,
        flakerUserId: flakerUser.id,
        flakeReportsCount: flakerUser.flakeReportsCount,
        isBanned,
        banUntil: flakerUser.banUntil,
      };
    }

    apt.status = body.status;
    this.dataStore.save();

    if (this.chatGateway.server) {
      this.chatGateway.server
        .to(apt.roomId)
        .emit('appointment_status_changed', {
          appointmentId: apt.id,
          roomId: apt.roomId,
          status: apt.status,
        });
    }

    const otherUserId = isSender ? receiverPet?.userId : senderPet?.userId;
    if (otherUserId) {
      await this.pushAdapter.sendPush(otherUserId, {
        type: 'appointment',
        title:
          body.status === 'confirmed'
            ? '✅ Kèo hẹn dạo đã được chốt!'
            : '💬 Lời mời hẹn dạo đã được dời dịp khác',
        body:
          body.status === 'confirmed'
            ? `Hẹn gặp tại ${apt.placeName} (${apt.displayTime}). Pawty sẽ nhắc trước 15 phút!`
            : `Cuộc hẹn tại ${apt.placeName} đã được cập nhật trạng thái.`,
        payload: { appointmentId: apt.id, roomId: apt.roomId },
      });
    }

    return apt;
  }

  @Post(':id/check-in')
  @HttpCode(HttpStatus.OK)
  async checkInAppointment(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number },
  ) {
    const apt = this.dataStore.appointments.find((a) => a.id === id);
    if (!apt) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy lịch hẹn dắt dạo.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (apt.status !== 'confirmed' && apt.status !== 'completed') {
      throw new DomainException(
        'BAD_REQUEST',
        'Chỉ có thể Check-in đối với kèo hẹn đã được xác nhận.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const senderPet = this.dataStore.pets.find(
      (p) => p.id === apt.senderPetId,
    );
    const receiverPet = this.dataStore.pets.find(
      (p) => p.id === apt.receiverPetId,
    );
    const isSender = senderPet?.userId === user.id;
    const isReceiver = receiverPet?.userId === user.id;

    if (!isSender && !isReceiver) {
      throw new DomainException(
        'FORBIDDEN',
        'Bạn không phải thành viên của kèo hẹn này.',
        HttpStatus.FORBIDDEN,
      );
    }

    const nowMs = Date.now();
    const scheduledMs = new Date(apt.scheduledTime).getTime();
    const minWindowMs =
      scheduledMs -
      BUSINESS_RULES.antiFlake.checkinWindowBeforeMinutes * 60 * 1000;
    const maxWindowMs =
      scheduledMs +
      BUSINESS_RULES.antiFlake.checkinWindowAfterMinutes * 60 * 1000;

    if (nowMs < minWindowMs || nowMs > maxWindowMs) {
      throw new DomainException(
        'CHECKIN_WINDOW_CLOSED',
        'Cửa sổ Check-in chỉ mở từ 30 phút trước đến 60 phút sau giờ hẹn.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (typeof body?.lat !== 'number' || typeof body?.lng !== 'number') {
      throw new DomainException(
        'BAD_REQUEST',
        'Toạ độ GPS (lat, lng) là bắt buộc để Check-in.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const distanceMeters = this.dataStore.calculatePostGisDistanceMeters(
      body.lat,
      body.lng,
      apt.placeLat,
      apt.placeLng,
    );

    if (distanceMeters > BUSINESS_RULES.antiFlake.checkinMaxDistanceMeters) {
      throw new DomainException(
        'TOO_FAR_FROM_PLACE',
        `Bạn đang cách điểm hẹn ${distanceMeters}m. Vui lòng di chuyển lại gần trong phạm vi 150m để Check-in!`,
        HttpStatus.BAD_REQUEST,
        { distanceMeters },
      );
    }

    const nowIso = new Date().toISOString();
    if (isSender) {
      apt.checkedInSenderAt = nowIso;
    } else {
      apt.checkedInReceiverAt = nowIso;
    }

    let isCompleted = false;
    if (
      apt.checkedInSenderAt &&
      apt.checkedInReceiverAt &&
      apt.status !== 'completed'
    ) {
      apt.status = 'completed';
      apt.completedAt = nowIso;
      isCompleted = true;

      // Record walk_logs for both participants & update walk streaks
      if (senderPet) {
        const senderUser = this.dataStore.users.find(
          (u) => u.id === senderPet.userId,
        );
        this.dataStore.walkLogs.unshift({
          id: `walk_${Date.now()}_s`,
          userId: senderPet.userId,
          petId: senderPet.id,
          startedAt: apt.scheduledTime,
          endedAt: nowIso,
          distanceMeters: 1200,
          source: 'appointment',
        });
        if (senderUser) {
          senderUser.totalWalkMeters += 1200;
          this.walksService.updateWalkStreakForUser(senderUser);
        }
      }

      if (receiverPet) {
        const receiverUser = this.dataStore.users.find(
          (u) => u.id === receiverPet.userId,
        );
        this.dataStore.walkLogs.unshift({
          id: `walk_${Date.now()}_r`,
          userId: receiverPet.userId,
          petId: receiverPet.id,
          startedAt: apt.scheduledTime,
          endedAt: nowIso,
          distanceMeters: 1200,
          source: 'appointment',
        });
        if (receiverUser) {
          receiverUser.totalWalkMeters += 1200;
          this.walksService.updateWalkStreakForUser(receiverUser);
        }
      }
    }

    this.dataStore.save();

    const newBadges = await this.badgesService.checkAndAwardBadges(user.id);
    if (isCompleted) {
      const otherUserId = isSender ? receiverPet?.userId : senderPet?.userId;
      if (otherUserId) {
        await this.badgesService.checkAndAwardBadges(otherUserId);
      }
    }

    return {
      checkedIn: true,
      isCompleted: apt.status === 'completed',
      distanceMeters,
      newBadges,
    };
  }
}
