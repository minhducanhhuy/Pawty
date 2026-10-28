import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES } from '../../config/business-rules';
import { UserRecord, VoucherRecord } from '../../database/types';

function generateUniqueVoucherCode(dataStore: DataStoreService): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 20; attempt++) {
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `PAW-${suffix}`;
    if (!dataStore.vouchers.some((v) => v.code === code)) {
      return code;
    }
  }
  return `PAW-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

@Controller('ads')
export class AdsController {
  constructor(private readonly dataStore: DataStoreService) {}

  private chargeCpcIfApplicable(partnerId: string) {
    const partner = this.dataStore.partners.find((p) => p.id === partnerId);
    if (!partner) return;

    if (partner.plan === 'cpc') {
      const cpc = BUSINESS_RULES.adsAndVouchers.cpcCostVnd;
      partner.balanceVnd = Math.max(0, partner.balanceVnd - cpc);
      if (partner.balanceVnd < cpc) {
        for (const ad of this.dataStore.nativeAds) {
          if (ad.partnerId === partner.id && ad.status === 'active') {
            ad.status = 'paused';
          }
        }
      }
    }
  }

  @Post(':id/impression')
  @HttpCode(HttpStatus.OK)
  recordImpression(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
  ) {
    const ad = this.dataStore.nativeAds.find((a) => a.id === id);
    if (!ad) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy chiến dịch quảng cáo.',
        HttpStatus.NOT_FOUND,
      );
    }

    const capKey = `${user.id}:${ad.id}`;
    const lastMs = this.dataStore.adImpressionTimestamps.get(capKey);
    const capMs =
      BUSINESS_RULES.adsAndVouchers.frequencyCapMinutes * 60 * 1000;

    if (lastMs && Date.now() - lastMs < capMs) {
      return {
        counted: false,
        frequencyCapped: true,
        impressions: ad.impressions,
      };
    }

    this.dataStore.adImpressionTimestamps.set(capKey, Date.now());
    ad.impressions += 1;
    this.dataStore.save();

    return {
      counted: true,
      frequencyCapped: false,
      impressions: ad.impressions,
    };
  }

  @Post(':id/click')
  @HttpCode(HttpStatus.OK)
  recordClick(@Param('id') id: string) {
    const ad = this.dataStore.nativeAds.find((a) => a.id === id);
    if (!ad) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy chiến dịch quảng cáo.',
        HttpStatus.NOT_FOUND,
      );
    }

    ad.clicks += 1;
    this.chargeCpcIfApplicable(ad.partnerId);
    this.dataStore.save();

    return {
      clicked: true,
      clicks: ad.clicks,
      adStatus: ad.status,
    };
  }

  @Post(':id/save-voucher')
  @HttpCode(HttpStatus.OK)
  saveVoucher(@CurrentUser() user: UserRecord, @Param('id') id: string) {
    const ad = this.dataStore.nativeAds.find((a) => a.id === id);
    if (!ad) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy chiến dịch quảng cáo.',
        HttpStatus.NOT_FOUND,
      );
    }

    const existing = this.dataStore.vouchers.find(
      (v) => v.adId === id && v.userId === user.id,
    );
    if (existing) {
      throw new DomainException(
        'ALREADY_SAVED',
        'Bạn đã lưu voucher của chiến dịch này vào ví rồi.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (ad.vouchersIssued >= ad.voucherQuota) {
      throw new DomainException(
        'VOUCHER_QUOTA_REACHED',
        'Chiến dịch này đã phát hết số lượng voucher.',
        HttpStatus.BAD_REQUEST,
      );
    }

    ad.vouchersIssued += 1;
    this.chargeCpcIfApplicable(ad.partnerId);

    const now = new Date();
    const validityMs =
      BUSINESS_RULES.adsAndVouchers.voucherValidityDays *
      24 *
      60 *
      60 *
      1000;

    const voucher: VoucherRecord = {
      id: `vch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      adId: ad.id,
      userId: user.id,
      code: generateUniqueVoucherCode(this.dataStore),
      status: 'saved',
      expiresAt: new Date(now.getTime() + validityMs).toISOString(),
      redeemedAt: null,
      createdAt: now.toISOString(),
    };

    this.dataStore.vouchers.unshift(voucher);
    this.dataStore.save();

    const partner = this.dataStore.partners.find(
      (p) => p.id === ad.partnerId,
    );

    return {
      ...voucher,
      ad: {
        id: ad.id,
        title: ad.title,
        description: ad.description,
        imageUrl: ad.imageUrl,
        discountPercent: ad.discountPercent,
      },
      partner: partner
        ? {
            id: partner.id,
            businessName: partner.businessName,
            address: partner.address,
            phone: partner.phone,
          }
        : null,
    };
  }
}

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get('me')
  getMyVouchers(@CurrentUser() user: UserRecord) {
    const now = new Date();
    return this.dataStore.vouchers
      .filter((v) => v.userId === user.id)
      .map((v) => {
        if (v.status === 'saved' && new Date(v.expiresAt) < now) {
          v.status = 'expired';
        }
        const ad = this.dataStore.nativeAds.find((a) => a.id === v.adId);
        const partner = ad
          ? this.dataStore.partners.find((p) => p.id === ad.partnerId)
          : null;

        return {
          ...v,
          ad: ad
            ? {
                id: ad.id,
                title: ad.title,
                description: ad.description,
                imageUrl: ad.imageUrl,
                discountPercent: ad.discountPercent,
              }
            : null,
          partner: partner
            ? {
                id: partner.id,
                businessName: partner.businessName,
                address: partner.address,
                phone: partner.phone,
              }
            : null,
        };
      });
  }
}
