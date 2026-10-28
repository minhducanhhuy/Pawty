import { ApiError } from '../../shared/api/apiError';
import { IS_MOCK_MODE } from '../../shared/config';
import { mockPartnerApi, partnerTokenStore } from '../mock/mockPartnerApi';
import { httpPartnerApi, setPartnerUnauthorizedHandler } from './httpPartnerApi';
import type { PartnerApi } from './partnerTypes';

async function withMockFallback<T>(callHttp: () => Promise<T>, callMock: () => Promise<T>): Promise<T> {
  if (IS_MOCK_MODE) return callMock();
  try {
    return await callHttp();
  } catch (error) {
    if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
      console.warn('[PartnerApi] Máy chủ không phản hồi, chuyển sang dữ liệu mẫu dự phòng.');
      return callMock();
    }
    throw error;
  }
}

export const partnerApi: PartnerApi = {
  register: (payload) => withMockFallback(() => httpPartnerApi.register(payload), () => mockPartnerApi.register(payload)),
  login: (email, password) => withMockFallback(() => httpPartnerApi.login(email, password), () => mockPartnerApi.login(email, password)),
  getMe: () => withMockFallback(() => httpPartnerApi.getMe(), () => mockPartnerApi.getMe()),
  createTopup: (amountVnd) => withMockFallback(() => httpPartnerApi.createTopup(amountVnd), () => mockPartnerApi.createTopup(amountVnd)),
  confirmSandboxTopup: (transactionId, amountVnd) =>
    withMockFallback(
      () => httpPartnerApi.confirmSandboxTopup(transactionId, amountVnd),
      () => mockPartnerApi.confirmSandboxTopup(transactionId, amountVnd),
    ),
  listAds: (query) => withMockFallback(() => httpPartnerApi.listAds(query), () => mockPartnerApi.listAds(query)),
  createAd: (input) => withMockFallback(() => httpPartnerApi.createAd(input), () => mockPartnerApi.createAd(input)),
  updateAd: (adId, patch) => withMockFallback(() => httpPartnerApi.updateAd(adId, patch), () => mockPartnerApi.updateAd(adId, patch)),
  getAdStats: (adId) => withMockFallback(() => httpPartnerApi.getAdStats(adId), () => mockPartnerApi.getAdStats(adId)),
  redeemVoucher: (code) => withMockFallback(() => httpPartnerApi.redeemVoucher(code), () => mockPartnerApi.redeemVoucher(code)),
};

export { partnerTokenStore, setPartnerUnauthorizedHandler };
