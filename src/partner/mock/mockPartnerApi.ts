import { ApiError } from '../../shared/api/apiError';
import { paginateLocally, textMatchesQuery, type PageQuery } from '../../shared/api/paged';
import { createTokenStore } from '../../shared/api/tokenStore';
import type { PartnerAd, PartnerApi, PartnerProfile } from '../api/partnerTypes';
import { buildInitialPartnerAds, buildInitialPartnerProfile, buildVietQrSvg } from './partnerFixtures';

export const partnerTokenStore = createTokenStore('pawty_partner_token');

let currentPartner: PartnerProfile = buildInitialPartnerProfile();
const partnerAds: PartnerAd[] = buildInitialPartnerAds();
const redeemedCodes = new Set<string>();

const PRESET_VOUCHER_DISCOUNTS: Record<string, { discountPercent: number; campaignTitle: string }> = {
  'PAW-SPA35A': { discountPercent: 35, campaignTitle: 'Combo Spa Tắm Gội Thảo Dược & Cắt Tỉa Lông Boss' },
  'PAW-CAFE30': { discountPercent: 30, campaignTitle: 'Khách Sạn Thú Cưng Cuối Tuần - Phòng VIP' },
  'PAW-VIP35X': { discountPercent: 35, campaignTitle: 'Combo Spa Tắm Gội Thảo Dược & Cắt Tỉa Lông Boss' },
};

export const mockPartnerApi: PartnerApi = {
  async register(payload) {
    currentPartner = {
      id: `ptn_${Date.now()}`,
      businessName: payload.businessName,
      category: payload.category,
      contactEmail: payload.contactEmail,
      phone: payload.phone,
      address: payload.address,
      lat: payload.lat,
      lng: payload.lng,
      status: 'pending',
      plan: 'cpc',
      balanceVnd: 0,
      createdAt: new Date().toISOString(),
    };
    return currentPartner;
  },

  async login(email, password) {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === 'partner@pawtyspa.vn' && password !== 'pawty123') {
      throw new ApiError('Mật khẩu không đúng (gợi ý sandbox: pawty123).', 401, 'INVALID_CREDENTIALS');
    }
    if (trimmedEmail !== currentPartner.contactEmail.toLowerCase()) {
      currentPartner = {
        ...buildInitialPartnerProfile(),
        contactEmail: email.trim(),
      };
    }
    const token = `mock_partner_token_${currentPartner.id}`;
    partnerTokenStore.write(token);
    return { token, partner: currentPartner };
  },

  async getMe() {
    return currentPartner;
  },

  async createTopup(amountVnd) {
    if (amountVnd < 50_000) {
      throw new ApiError('Số tiền nạp tối thiểu là 50.000đ.', 400, 'INVALID_AMOUNT');
    }
    const paymentCode = `PAWTY TOPUP ${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      transactionId: `txn_topup_${Date.now()}`,
      qrCodeUrl: buildVietQrSvg(paymentCode, amountVnd),
      bankName: 'MB Bank (VietQR)',
      accountNo: '888866669999',
      amount: amountVnd,
      paymentCode,
      status: 'pending',
    };
  },

  async confirmSandboxTopup(_transactionId, amountVnd) {
    currentPartner = {
      ...currentPartner,
      balanceVnd: currentPartner.balanceVnd + amountVnd,
    };
    return currentPartner;
  },

  async listAds(query: PageQuery) {
    const filtered = partnerAds.filter((ad) => textMatchesQuery(query.q, ad.title, ad.description));
    return paginateLocally(filtered, query);
  },

  async createAd(input) {
    const created: PartnerAd = {
      id: `ad_${Date.now()}`,
      partnerId: currentPartner.id,
      partnerName: currentPartner.businessName,
      ...input,
      vouchersIssued: 0,
      vouchersRedeemed: 0,
      impressions: 0,
      clicks: 0,
      spendVnd: 0,
    };
    partnerAds.unshift(created);
    return created;
  },

  async updateAd(adId, patch) {
    const target = partnerAds.find((ad) => ad.id === adId);
    if (!target) throw new ApiError('Không tìm thấy chiến dịch.', 404, 'AD_NOT_FOUND');
    Object.assign(target, patch);
    return { ...target };
  },

  async getAdStats(adId) {
    const target = partnerAds.find((ad) => ad.id === adId);
    if (!target) throw new ApiError('Không tìm thấy chiến dịch.', 404, 'AD_NOT_FOUND');
    const spendVnd = target.spendVnd ?? target.clicks * 3000;
    const vouchersRedeemed = target.vouchersRedeemed ?? Math.round(target.vouchersIssued * 0.45);
    return {
      impressions: target.impressions,
      clicks: target.clicks,
      vouchersIssued: target.vouchersIssued,
      vouchersRedeemed,
      spendVnd,
    };
  },

  async redeemVoucher(rawCode) {
    const code = rawCode.trim().toUpperCase();
    if (!/^PAW-[A-Z0-9]{4,10}$/.test(code)) {
      throw new ApiError('Mã voucher không đúng định dạng PAW-XXXXXX.', 400, 'INVALID_VOUCHER_CODE');
    }
    if (redeemedCodes.has(code)) {
      throw new ApiError(`Mã ${code} đã được sử dụng trước đó.`, 409, 'VOUCHER_ALREADY_REDEEMED');
    }
    redeemedCodes.add(code);
    const preset = PRESET_VOUCHER_DISCOUNTS[code];
    const activeAd = partnerAds[0];
    if (activeAd) {
      activeAd.vouchersRedeemed = (activeAd.vouchersRedeemed ?? 0) + 1;
    }
    return {
      redeemed: true,
      code,
      discountPercent: preset?.discountPercent ?? activeAd?.discountPercent ?? 35,
      campaignTitle: preset?.campaignTitle ?? activeAd?.title ?? 'Ưu đãi Native Ad Pawty',
      redeemedAt: new Date().toISOString(),
    };
  },
};
