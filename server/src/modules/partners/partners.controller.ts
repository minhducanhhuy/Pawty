import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataStoreService } from '../../database/data-store.service';
import { CurrentPartner } from '../../common/decorators/current-user.decorator';
import { PartnerOnly } from '../../common/decorators/partner-only.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES } from '../../config/business-rules';
import {
  AdStatusType,
  NativeAdRecord,
  PartnerRecord,
  PlaceCategoryType,
} from '../../database/types';

function sanitizePartner(partner: PartnerRecord) {
  const { passwordHash: _pw, ...rest } = partner;
  return rest;
}

@Controller('partners')
export class PartnersController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('register')
  registerPartner(
    @Body()
    body: {
      businessName: string;
      category: PlaceCategoryType;
      contactEmail: string;
      password: string;
      phone: string;
      address: string;
      lat: number;
      lng: number;
    },
  ) {
    if (!body?.businessName || !body?.contactEmail || !body?.password) {
      throw new DomainException(
        'BAD_REQUEST',
        'Vui lòng điền đầy đủ thông tin đăng ký Đối tác (businessName, contactEmail, password).',
        HttpStatus.BAD_REQUEST,
      );
    }

    const emailNorm = body.contactEmail.trim().toLowerCase();
    const exists = this.dataStore.partners.some(
      (p) => p.contactEmail.toLowerCase() === emailNorm,
    );
    if (exists) {
      throw new DomainException(
        'BAD_REQUEST',
        'Email đối tác này đã được đăng ký.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const partner: PartnerRecord = {
      id: `partner_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      businessName: body.businessName.trim(),
      category: body.category || 'spa',
      contactEmail: emailNorm,
      passwordHash: body.password,
      phone: body.phone || '',
      lat: Number(body.lat ?? 10.7951),
      lng: Number(body.lng ?? 106.7218),
      address: body.address || '',
      status: 'pending',
      plan: 'cpc',
      balanceVnd: 0,
      createdAt: new Date().toISOString(),
    };

    this.dataStore.partners.push(partner);
    this.dataStore.save();

    return sanitizePartner(partner);
  }

  @Public()
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  loginPartner(@Body() body: { email: string; password: string }) {
    if (!body?.email || !body?.password) {
      throw new DomainException(
        'BAD_REQUEST',
        'Vui lòng nhập email và mật khẩu đối tác.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const emailNorm = body.email.trim().toLowerCase();
    const partner = this.dataStore.partners.find(
      (p) =>
        p.contactEmail.toLowerCase() === emailNorm &&
        p.passwordHash === body.password,
    );

    if (!partner) {
      throw new DomainException(
        'UNAUTHORIZED',
        'Email hoặc mật khẩu đối tác không chính xác.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = this.jwtService.sign({
      sub: partner.id,
      kind: 'partner',
    });

    return {
      token,
      partner: sanitizePartner(partner),
    };
  }

  @PartnerOnly()
  @Get('me')
  getMyPartnerProfile(@CurrentPartner() partner: PartnerRecord) {
    const ads = this.dataStore.nativeAds.filter(
      (a) => a.partnerId === partner.id,
    );
    return {
      ...sanitizePartner(partner),
      adsCount: ads.length,
    };
  }

  @PartnerOnly()
  @Post('me/topup')
  @HttpCode(HttpStatus.OK)
  topupPartnerBalance(
    @CurrentPartner() partner: PartnerRecord,
    @Body() body: { amountVnd: number },
  ) {
    const amount = Number(body?.amountVnd || 0);
    if (amount < 10000) {
      throw new DomainException(
        'BAD_REQUEST',
        'Số tiền nạp tối thiểu là 10.000 VNĐ.',
        HttpStatus.BAD_REQUEST,
      );
    }

    partner.balanceVnd += amount;
    // Re-activate paused ads if balance is sufficient
    if (partner.balanceVnd >= BUSINESS_RULES.adsAndVouchers.cpcCostVnd) {
      for (const ad of this.dataStore.nativeAds) {
        if (ad.partnerId === partner.id && ad.status === 'paused') {
          ad.status = 'active';
        }
      }
    }

    const txId = `tx_partner_${Date.now()}`;
    const paymentCode = `PAWTY_TOPUP_${Math.floor(100000 + Math.random() * 900000)}`;
    this.dataStore.transactions.unshift({
      id: txId,
      userId: 'usr_admin_01',
      partnerId: partner.id,
      type: 'partner_topup',
      amountVnd: amount,
      paymentGateway: 'sandbox',
      paymentCode,
      status: 'paid',
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    this.dataStore.save();

    return {
      transactionId: txId,
      paymentCode,
      amountVnd: amount,
      balanceVnd: partner.balanceVnd,
      status: 'paid',
    };
  }

  @PartnerOnly()
  @Get('ads')
  getPartnerAds(@CurrentPartner() partner: PartnerRecord) {
    return this.dataStore.nativeAds.filter((a) => a.partnerId === partner.id);
  }

  @PartnerOnly()
  @Post('ads')
  createPartnerAd(
    @CurrentPartner() partner: PartnerRecord,
    @Body()
    body: {
      title: string;
      description: string;
      imageUrl?: string;
      discountPercent: number;
      voucherQuota?: number;
      radiusMeters?: number;
      targetLat?: number;
      targetLng?: number;
      startsAt?: string;
      endsAt?: string;
      status?: AdStatusType;
    },
  ) {
    if (partner.status !== 'approved') {
      throw new DomainException(
        'PARTNER_NOT_APPROVED',
        'Tài khoản Đối tác đang chờ duyệt bởi Admin, chưa thể tạo chiến dịch quảng cáo.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!body?.title || !body?.description) {
      throw new DomainException(
        'BAD_REQUEST',
        'Vui lòng nhập tiêu đề và mô tả chiến dịch quảng cáo.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    const in30Days = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const newAd: NativeAdRecord = {
      id: `ad_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      partnerId: partner.id,
      title: body.title.trim(),
      description: body.description.trim(),
      imageUrl:
        body.imageUrl ||
        'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
      discountPercent: Math.min(90, Math.max(5, Number(body.discountPercent || 30))),
      voucherQuota: Math.max(1, Number(body.voucherQuota || 100)),
      vouchersIssued: 0,
      radiusMeters: Number(
        body.radiusMeters ||
          BUSINESS_RULES.adsAndVouchers.defaultAdRadiusMeters,
      ),
      targetLat: Number(body.targetLat ?? partner.lat),
      targetLng: Number(body.targetLng ?? partner.lng),
      status: body.status || 'active',
      impressions: 0,
      clicks: 0,
      startsAt: body.startsAt || now.toISOString(),
      endsAt: body.endsAt || in30Days,
    };

    this.dataStore.nativeAds.unshift(newAd);
    this.dataStore.save();
    return newAd;
  }

  @PartnerOnly()
  @Patch('ads/:id')
  updatePartnerAd(
    @CurrentPartner() partner: PartnerRecord,
    @Param('id') id: string,
    @Body() body: Partial<NativeAdRecord>,
  ) {
    const ad = this.dataStore.nativeAds.find(
      (a) => a.id === id && a.partnerId === partner.id,
    );
    if (!ad) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy chiến dịch quảng cáo của bạn.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (body.title !== undefined) ad.title = body.title;
    if (body.description !== undefined) ad.description = body.description;
    if (body.imageUrl !== undefined) ad.imageUrl = body.imageUrl;
    if (typeof body.discountPercent === 'number') {
      ad.discountPercent = body.discountPercent;
    }
    if (typeof body.voucherQuota === 'number') {
      ad.voucherQuota = body.voucherQuota;
    }
    if (typeof body.radiusMeters === 'number') {
      ad.radiusMeters = body.radiusMeters;
    }
    if (typeof body.targetLat === 'number') ad.targetLat = body.targetLat;
    if (typeof body.targetLng === 'number') ad.targetLng = body.targetLng;
    if (body.startsAt !== undefined) ad.startsAt = body.startsAt;
    if (body.endsAt !== undefined) ad.endsAt = body.endsAt;
    if (body.status !== undefined) ad.status = body.status;

    this.dataStore.save();
    return ad;
  }

  @PartnerOnly()
  @Get('ads/:id/stats')
  getAdStats(
    @CurrentPartner() partner: PartnerRecord,
    @Param('id') id: string,
  ) {
    const ad = this.dataStore.nativeAds.find(
      (a) => a.id === id && a.partnerId === partner.id,
    );
    if (!ad) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy chiến dịch quảng cáo của bạn.',
        HttpStatus.NOT_FOUND,
      );
    }

    const vouchersRedeemed = this.dataStore.vouchers.filter(
      (v) => v.adId === ad.id && v.status === 'redeemed',
    ).length;

    const spendVnd =
      partner.plan === 'cpc'
        ? (ad.clicks + ad.vouchersIssued) *
          BUSINESS_RULES.adsAndVouchers.cpcCostVnd
        : BUSINESS_RULES.adsAndVouchers.monthlyPlanCostVnd;

    return {
      impressions: ad.impressions,
      clicks: ad.clicks,
      vouchersIssued: ad.vouchersIssued,
      vouchersRedeemed,
      spendVnd,
    };
  }

  @PartnerOnly()
  @Post('vouchers/redeem')
  @HttpCode(HttpStatus.OK)
  redeemVoucher(
    @CurrentPartner() partner: PartnerRecord,
    @Body() body: { code: string },
  ) {
    if (!body?.code) {
      throw new DomainException(
        'BAD_REQUEST',
        'Vui lòng nhập mã voucher.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const codeNorm = body.code.trim().toUpperCase();
    const voucher = this.dataStore.vouchers.find(
      (v) => v.code.toUpperCase() === codeNorm,
    );

    if (!voucher) {
      throw new DomainException(
        'VOUCHER_INVALID',
        'Mã voucher không tồn tại.',
        HttpStatus.NOT_FOUND,
      );
    }

    const ad = this.dataStore.nativeAds.find((a) => a.id === voucher.adId);
    if (!ad || ad.partnerId !== partner.id) {
      throw new DomainException(
        'FORBIDDEN',
        'Mã voucher này không thuộc cửa hàng của bạn.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (voucher.status === 'redeemed') {
      throw new DomainException(
        'VOUCHER_ALREADY_REDEEMED',
        'Mã voucher này đã được sử dụng trước đó.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      voucher.status === 'expired' ||
      new Date(voucher.expiresAt) < new Date()
    ) {
      voucher.status = 'expired';
      this.dataStore.save();
      throw new DomainException(
        'VOUCHER_EXPIRED',
        'Mã voucher này đã hết hạn sử dụng.',
        HttpStatus.BAD_REQUEST,
      );
    }

    voucher.status = 'redeemed';
    voucher.redeemedAt = new Date().toISOString();
    this.dataStore.save();

    return {
      redeemed: true,
      discountPercent: ad.discountPercent,
      voucher,
    };
  }
}
