import { createHttpClient } from '../../shared/api/httpClient';
import { normalizePagedResult, type PageQuery } from '../../shared/api/paged';
import { API_BASE_URL } from '../../shared/config';
import { buildVietQrSvg } from '../mock/partnerFixtures';
import { partnerTokenStore } from '../mock/mockPartnerApi';
import type { PartnerAd, PartnerApi, PartnerProfile, RedeemVoucherResponse, TopupResponse } from './partnerTypes';

let unauthorizedHandler: (() => void) | null = null;
export function setPartnerUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

const httpClient = createHttpClient({
  baseUrl: API_BASE_URL,
  getToken: partnerTokenStore.read,
  onUnauthorized: () => unauthorizedHandler?.(),
});

export const httpPartnerApi: PartnerApi = {
  async register(payload) {
    return httpClient.post<PartnerProfile>('/partners/register', payload, { isAuthEndpoint: true });
  },

  async login(email, password) {
    const response = await httpClient.post<{ token: string; partner: PartnerProfile }>(
      '/partners/auth/login',
      { email, password },
      { isAuthEndpoint: true },
    );
    partnerTokenStore.write(response.token);
    return response;
  },

  async getMe() {
    return httpClient.get<PartnerProfile>('/partners/me');
  },

  async createTopup(amountVnd) {
    const raw = await httpClient.post<Record<string, unknown>>('/partners/me/topup', { amountVnd });
    const paymentCode = String(raw.paymentCode ?? `PAWTY TOPUP ${Date.now()}`);
    const amount = typeof raw.amount === 'number' ? raw.amount : amountVnd;
    return {
      transactionId: typeof raw.transactionId === 'string' ? raw.transactionId : undefined,
      qrCodeUrl: typeof raw.qrCodeUrl === 'string' && raw.qrCodeUrl ? raw.qrCodeUrl : buildVietQrSvg(paymentCode, amount),
      bankName: String(raw.bankName ?? 'MB Bank (VietQR)'),
      accountNo: String(raw.accountNo ?? '888866669999'),
      amount,
      paymentCode,
      status: raw.status === 'paid' ? 'paid' : 'pending',
      newBalanceVnd: typeof raw.balanceVnd === 'number' ? raw.balanceVnd : undefined,
    } satisfies TopupResponse;
  },

  async confirmSandboxTopup(transactionId) {
    if (transactionId) {
      await httpClient.post('/payments/sandbox/confirm', { transactionId });
    }
    return httpClient.get<PartnerProfile>('/partners/me');
  },

  async listAds(query: PageQuery) {
    const raw = await httpClient.get<unknown>('/partners/ads', {
      query: { page: query.page, limit: query.limit, q: query.q },
    });
    return normalizePagedResult<PartnerAd>(raw, query);
  },

  async createAd(input) {
    return httpClient.post<PartnerAd>('/partners/ads', input);
  },

  async updateAd(adId, patch) {
    return httpClient.patch<PartnerAd>(`/partners/ads/${adId}`, patch);
  },

  async getAdStats(adId) {
    return httpClient.get(`/partners/ads/${adId}/stats`);
  },

  async redeemVoucher(code) {
    const raw = await httpClient.post<{ redeemed: boolean; discountPercent: number; campaignTitle?: string }>(
      '/partners/vouchers/redeem',
      { code: code.trim().toUpperCase() },
    );
    return {
      redeemed: raw.redeemed,
      code: code.trim().toUpperCase(),
      discountPercent: raw.discountPercent,
      campaignTitle: raw.campaignTitle,
      redeemedAt: new Date().toISOString(),
    } satisfies RedeemVoucherResponse;
  },
};
