import { createHttpClient } from '../../shared/api/httpClient';
import { API_BASE_URL } from '../../shared/config';
import { normalizePagedResult, type PageQuery } from '../../shared/api/paged';
import { createTokenStore } from '../../shared/api/tokenStore';
import { normalizeKpi } from './normalizeKpi';
import type { AdminApi, AdminProfile, AdminSession, AdminUser } from './adminTypes';

export const adminTokenStore = createTokenStore('pawty_admin_token');

let unauthorizedHandler: (() => void) | null = null;
export function setAdminUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

const httpClient = createHttpClient({
  baseUrl: API_BASE_URL,
  getToken: adminTokenStore.read,
  onUnauthorized: () => unauthorizedHandler?.(),
});

const pageParams = (query: PageQuery) => ({ page: query.page, limit: query.limit, q: query.q });

interface VerifyOtpResponse {
  token: string;
  user: Partial<AdminProfile>;
}

function toAdminProfile(user: Partial<AdminProfile>): AdminProfile {
  return {
    id: user.id ?? '',
    phone: user.phone ?? '',
    fullName: user.fullName ?? 'Quản trị viên',
    role: user.role ?? 'user',
  };
}

async function fetchOwnProfile(): Promise<AdminProfile> {
  return toAdminProfile(await httpClient.get<Partial<AdminProfile>>('/users/me'));
}

async function listFrom<T>(path: string, query: PageQuery, extra: Record<string, string | undefined> = {}) {
  const raw = await httpClient.get<unknown>(path, { query: { ...pageParams(query), ...extra } });
  return normalizePagedResult<T>(raw, query);
}

export const httpAdminApi: AdminApi = {
  async requestOtp(phone) {
    await httpClient.post('/auth/send-otp', { phone }, { isAuthEndpoint: true });
  },

  async verifyOtp(phone, otpCode): Promise<AdminSession> {
    const response = await httpClient.post<VerifyOtpResponse>('/auth/verify-otp', { phone, otpCode }, { isAuthEndpoint: true });
    // Token cần có sẵn trong store để gọi /users/me khi response thiếu `role`.
    adminTokenStore.write(response.token);
    const profile = response.user.role ? toAdminProfile(response.user) : await fetchOwnProfile();
    return { token: response.token, profile };
  },

  restoreProfile: fetchOwnProfile,

  async getKpi() {
    return normalizeKpi(await httpClient.get<unknown>('/admin/kpi'));
  },

  listUsers: (query) => listFrom<AdminUser>('/admin/users', query),
  async updateUser(userId, patch) {
    await httpClient.patch(`/admin/users/${userId}`, patch);
  },

  listVaccineQueue: (query) => listFrom('/admin/vaccine-queue', query),
  async decideVaccine(petId, decision) {
    await httpClient.post(`/admin/pets/${petId}/vaccine-decision`, decision);
  },

  listReports: (query, status) => listFrom('/admin/reports', query, { status }),
  async resolveReport(reportId, resolution) {
    await httpClient.patch(`/admin/reports/${reportId}`, resolution);
  },

  listTransactions: (query, filters) => listFrom('/admin/transactions', query, { type: filters.type, status: filters.status }),

  listPartners: (query) => listFrom('/admin/partners', query),
  async updatePartnerStatus(partnerId, status) {
    await httpClient.patch(`/admin/partners/${partnerId}`, { status });
  },

  listAds: (query) => listFrom('/admin/ads', query),
  async updateAdStatus(adId, status) {
    await httpClient.patch(`/admin/ads/${adId}`, { status });
  },

  listSos: (query) => listFrom('/admin/sos', query),
  listAuditLogs: (query) => listFrom('/admin/audit-logs', query),
};
