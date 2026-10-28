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
import { PushAdapterService } from '../../adapters/push.adapter';
import { BadgesService } from '../badges/badges.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES } from '../../config/business-rules';
import {
  PetSpeciesType,
  SosAlertRecord,
  UserRecord,
} from '../../database/types';

@Controller('sos')
export class SosController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly pushAdapter: PushAdapterService,
    private readonly badgesService: BadgesService,
  ) {}

  @Post()
  async createSosAlert(
    @CurrentUser() user: UserRecord,
    @Body()
    body: {
      transactionId?: string;
      petId?: string;
      petName: string;
      species?: PetSpeciesType;
      breed?: string;
      petPhotoUrl?: string;
      lat?: number;
      lng?: number;
      latitude?: number;
      longitude?: number;
      lastSeenAddress: string;
      rewardAmountVnd?: string;
      contactPhone?: string;
      notes?: string;
    },
  ) {
    if (!body?.petName || !body?.lastSeenAddress) {
      throw new DomainException(
        'BAD_REQUEST',
        'Vui lòng cung cấp tên Boss và vị trí mất dấu (lastSeenAddress).',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (body.transactionId) {
      const tx = this.dataStore.transactions.find(
        (t) =>
          (t.id === body.transactionId ||
            t.paymentCode === body.transactionId) &&
          t.type === 'sos',
      );
      if (!tx || tx.status !== 'paid') {
        throw new DomainException(
          'SOS_PAYMENT_REQUIRED',
          'Vui lòng hoàn tất thanh toán phí phát sóng khẩn cấp SOS 39.000đ trước.',
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      tx.consumedForSos = true;
    } else {
      const paidSosTx = this.dataStore.transactions.find(
        (t) =>
          t.userId === user.id &&
          t.type === 'sos' &&
          t.status === 'paid' &&
          !t.consumedForSos,
      );
      if (paidSosTx) {
        paidSosTx.consumedForSos = true;
      }
    }

    const lat = Number(body.lat ?? body.latitude ?? user.latitude ?? 10.7951);
    const lng = Number(body.lng ?? body.longitude ?? user.longitude ?? 106.7218);

    const newAlert: SosAlertRecord = {
      id: `sos_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      petId: body.petId,
      petName: body.petName.trim(),
      species: body.species === 'cat' ? 'cat' : 'dog',
      breed: body.breed || 'Thú cưng',
      petPhotoUrl:
        body.petPhotoUrl ||
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      latitude: lat,
      longitude: lng,
      lastSeenAddress: body.lastSeenAddress.trim(),
      radiusKm: BUSINESS_RULES.sos.radiusKm,
      rewardAmountVnd: body.rewardAmountVnd || '3.000.000 VNĐ',
      contactPhone: body.contactPhone || user.phone,
      notes: body.notes || 'Bé rất hoảng sợ, xin gọi ngay khi nhìn thấy!',
      status: 'active',
      helperUserIds: [],
      createdAt: new Date().toISOString(),
    };

    this.dataStore.sosAlerts.unshift(newAlert);
    this.dataStore.save();

    const nearbyUsers = this.dataStore.users.filter((u) => {
      if (u.isDeleted) return false;
      const dist = this.dataStore.calculatePostGisDistanceMeters(
        lat,
        lng,
        u.latitude,
        u.longitude,
      );
      return dist <= BUSINESS_RULES.sos.radiusMeters;
    });

    for (const targetUser of nearbyUsers) {
      await this.pushAdapter.sendPush(targetUser.id, {
        type: 'sos',
        title: `🚨 BÁO ĐỘNG SOS: Tìm ${newAlert.petName} lạc tại ${newAlert.lastSeenAddress}!`,
        body: `Hậu tạ ${newAlert.rewardAmountVnd}. Liên hệ: ${newAlert.contactPhone}. Nhấn để xem ảnh nhận diện!`,
        payload: { sosId: newAlert.id },
      });
    }

    return {
      ...newAlert,
      notifiedUsersCount: nearbyUsers.length,
    };
  }

  @Get('nearby')
  getNearbySos(
    @CurrentUser() user: UserRecord,
    @Query('lat') latStr?: string,
    @Query('lng') lngStr?: string,
  ) {
    const lat = latStr ? parseFloat(latStr) : user.latitude || 10.7951;
    const lng = lngStr ? parseFloat(lngStr) : user.longitude || 106.7218;

    return this.dataStore.sosAlerts
      .filter((s) => s.status === 'active')
      .map((s) => ({
        ...s,
        distanceMeters: this.dataStore.calculatePostGisDistanceMeters(
          lat,
          lng,
          s.latitude,
          s.longitude,
        ),
      }))
      .filter((s) => s.distanceMeters <= BUSINESS_RULES.sos.radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  async resolveSos(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
    @Body() body?: { helperUserId?: string; helperUserIds?: string[] },
  ) {
    const sos = this.dataStore.sosAlerts.find((s) => s.id === id);
    if (!sos) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy tin báo động SOS.',
        HttpStatus.NOT_FOUND,
      );
    }

    sos.status = 'resolved';
    const helpers = new Set<string>(sos.helperUserIds || []);
    if (body?.helperUserId) helpers.add(body.helperUserId);
    if (Array.isArray(body?.helperUserIds)) {
      body!.helperUserIds.forEach((h) => helpers.add(h));
    }
    if (sos.userId && sos.userId !== user.id) {
      helpers.add(user.id);
    }
    sos.helperUserIds = Array.from(helpers);

    this.dataStore.save();

    for (const helperId of sos.helperUserIds) {
      await this.badgesService.checkAndAwardBadges(helperId);
    }

    return sos;
  }
}
