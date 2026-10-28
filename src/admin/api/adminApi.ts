import { ApiError } from '../../shared/api/apiError';
import { IS_MOCK_MODE } from '../../shared/config';
import { mockAdminApi } from '../mock/mockAdminApi';
import type { AdminApi } from './adminTypes';
import { adminTokenStore, httpAdminApi, setAdminUnauthorizedHandler } from './httpAdminApi';

/**
 * Gọi API thật trước; nếu bật VITE_USE_MOCK=true hoặc máy chủ chưa chạy (NETWORK_ERROR)
 * thì tự động chuyển sang bộ dữ liệu mẫu để cổng quản trị luôn duyệt được.
 */
async function withMockFallback<T>(callHttp: () => Promise<T>, callMock: () => Promise<T>): Promise<T> {
  if (IS_MOCK_MODE) return callMock();
  try {
    return await callHttp();
  } catch (error) {
    if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
      console.warn('[AdminApi] Máy chủ không phản hồi, dùng dữ liệu mẫu dự phòng.');
      return callMock();
    }
    throw error;
  }
}

export const adminApi: AdminApi = {
  requestOtp: (phone) => withMockFallback(() => httpAdminApi.requestOtp(phone), () => mockAdminApi.requestOtp(phone)),
  verifyOtp: (phone, otpCode) => withMockFallback(() => httpAdminApi.verifyOtp(phone, otpCode), () => mockAdminApi.verifyOtp(phone, otpCode)),
  restoreProfile: () => withMockFallback(() => httpAdminApi.restoreProfile(), () => mockAdminApi.restoreProfile()),
  getKpi: () => withMockFallback(() => httpAdminApi.getKpi(), () => mockAdminApi.getKpi()),
  listUsers: (query) => withMockFallback(() => httpAdminApi.listUsers(query), () => mockAdminApi.listUsers(query)),
  updateUser: (userId, patch) => withMockFallback(() => httpAdminApi.updateUser(userId, patch), () => mockAdminApi.updateUser(userId, patch)),
  listVaccineQueue: (query) => withMockFallback(() => httpAdminApi.listVaccineQueue(query), () => mockAdminApi.listVaccineQueue(query)),
  decideVaccine: (petId, decision) => withMockFallback(() => httpAdminApi.decideVaccine(petId, decision), () => mockAdminApi.decideVaccine(petId, decision)),
  listReports: (query, status) => withMockFallback(() => httpAdminApi.listReports(query, status), () => mockAdminApi.listReports(query, status)),
  resolveReport: (reportId, resolution) => withMockFallback(() => httpAdminApi.resolveReport(reportId, resolution), () => mockAdminApi.resolveReport(reportId, resolution)),
  listTransactions: (query, filters) => withMockFallback(() => httpAdminApi.listTransactions(query, filters), () => mockAdminApi.listTransactions(query, filters)),
  listPartners: (query) => withMockFallback(() => httpAdminApi.listPartners(query), () => mockAdminApi.listPartners(query)),
  updatePartnerStatus: (partnerId, status) => withMockFallback(() => httpAdminApi.updatePartnerStatus(partnerId, status), () => mockAdminApi.updatePartnerStatus(partnerId, status)),
  listAds: (query) => withMockFallback(() => httpAdminApi.listAds(query), () => mockAdminApi.listAds(query)),
  updateAdStatus: (adId, status) => withMockFallback(() => httpAdminApi.updateAdStatus(adId, status), () => mockAdminApi.updateAdStatus(adId, status)),
  listSos: (query) => withMockFallback(() => httpAdminApi.listSos(query), () => mockAdminApi.listSos(query)),
  listAuditLogs: (query) => withMockFallback(() => httpAdminApi.listAuditLogs(query), () => mockAdminApi.listAuditLogs(query)),
};

export { adminTokenStore, setAdminUnauthorizedHandler };
