import { ApiError } from '../../shared/api/apiError';
import { daysFromNowIso } from '../../shared/lib/format';
import { paginateLocally, textMatchesQuery, type PageQuery } from '../../shared/api/paged';
import type {
  AdminAd,
  AdminApi,
  AdminPartner,
  AdminProfile,
  AdminReport,
  AdminSosAlert,
  AdminTransaction,
  AdminUser,
  AuditLogEntry,
  VaccineQueueItem,
} from '../api/adminTypes';
import { adminTokenStore } from '../api/httpAdminApi';
import {
  buildInitialAds,
  buildInitialAuditLogs,
  buildInitialPartners,
  buildInitialReports,
  buildInitialSos,
  buildInitialTransactions,
  buildInitialUsers,
  buildInitialVaccineQueue,
  buildKpiFixture,
} from './adminFixtures';

const users: AdminUser[] = buildInitialUsers();
let vaccineQueue: VaccineQueueItem[] = buildInitialVaccineQueue();
const reports: AdminReport[] = buildInitialReports();
const transactions: AdminTransaction[] = buildInitialTransactions();
const partners: AdminPartner[] = buildInitialPartners();
const ads: AdminAd[] = buildInitialAds();
const sosAlerts: AdminSosAlert[] = buildInitialSos();
const auditLogs: AuditLogEntry[] = buildInitialAuditLogs();

let currentProfile: AdminProfile = {
  id: 'usr_admin',
  phone: '0900000000',
  fullName: 'Pawty Admin',
  role: 'admin',
};

function recordAudit(action: string, targetType: string, targetId: string): void {
  auditLogs.unshift({
    id: `aud_${Date.now()}`,
    actorId: currentProfile.id,
    actorName: currentProfile.fullName,
    action,
    targetType,
    targetId,
    createdAt: new Date().toISOString(),
  });
}

export const mockAdminApi: AdminApi = {
  async requestOtp() {
    return;
  },

  async verifyOtp(phone, otpCode) {
    if (otpCode.trim() !== '888888') {
      throw new ApiError('Mã OTP không chính xác (mã sandbox: 888888).', 401, 'INVALID_OTP');
    }
    const matchedUser = users.find((user) => user.phone === phone.trim());
    const role = matchedUser?.role ?? (phone.trim() === '0900000000' ? 'admin' : phone.trim() === '0900000001' ? 'moderator' : 'user');
    currentProfile = {
      id: matchedUser?.id ?? `usr_${phone.trim()}`,
      phone: phone.trim(),
      fullName: matchedUser?.fullName ?? 'Tài khoản Pawty',
      role,
    };
    const token = `mock_admin_token_${currentProfile.id}`;
    adminTokenStore.write(token);
    return { token, profile: currentProfile };
  },

  async restoreProfile() {
    return currentProfile;
  },

  async getKpi() {
    return buildKpiFixture({
      vaccinePending: vaccineQueue.length,
      openReports: reports.filter((item) => item.status === 'open').length,
      partnersPending: partners.filter((item) => item.status === 'pending').length,
    });
  },

  async listUsers(query: PageQuery) {
    const filtered = users.filter((user) => textMatchesQuery(query.q, user.fullName, user.phone, user.condoComplex, user.nickname));
    return paginateLocally(filtered, query);
  },

  async updateUser(userId, patch) {
    const target = users.find((user) => user.id === userId);
    if (!target) throw new ApiError('Không tìm thấy người dùng.', 404, 'USER_NOT_FOUND');
    if (patch.isBannedSwiping !== undefined) {
      target.isBannedSwiping = patch.isBannedSwiping;
      target.banUntil = patch.isBannedSwiping ? daysFromNowIso(patch.banDays ?? 3) : null;
      recordAudit(patch.isBannedSwiping ? 'user.ban_swiping' : 'user.unban_swiping', 'user', userId);
    }
    if (patch.role) {
      target.role = patch.role;
      recordAudit(`user.role_${patch.role}`, 'user', userId);
    }
    if (patch.grantVip) {
      target.vipTier = patch.grantVip.tier;
      target.vipExpiresAt = daysFromNowIso(patch.grantVip.days);
      recordAudit(`user.grant_${patch.grantVip.tier}`, 'user', userId);
    }
  },

  async listVaccineQueue(query: PageQuery) {
    const filtered = vaccineQueue.filter((pet) => textMatchesQuery(query.q, pet.name, pet.breed, pet.owner?.fullName, pet.owner?.phone));
    return paginateLocally(filtered, query);
  },

  async decideVaccine(petId, decision) {
    vaccineQueue = vaccineQueue.filter((item) => item.id !== petId);
    recordAudit(`vaccine.${decision.decision}`, 'pet', petId);
  },

  async listReports(query: PageQuery, status?: string) {
    const filtered = reports.filter(
      (report) => (!status || report.status === status) && textMatchesQuery(query.q, report.reason, report.targetLabel, report.reporterName, report.detail),
    );
    return paginateLocally(filtered, query);
  },

  async resolveReport(reportId, resolution) {
    const target = reports.find((item) => item.id === reportId);
    if (!target) throw new ApiError('Không tìm thấy báo cáo.', 404, 'REPORT_NOT_FOUND');
    target.status = resolution.status;
    target.action = resolution.action ?? null;
    recordAudit(`report.${resolution.status}`, 'report', reportId);
  },

  async listTransactions(query: PageQuery, filters) {
    const filtered = transactions.filter(
      (txn) =>
        (!filters.type || txn.type === filters.type) &&
        (!filters.status || txn.status === filters.status) &&
        textMatchesQuery(query.q, txn.id, txn.userName, txn.paymentCode, txn.type),
    );
    return paginateLocally(filtered, query);
  },

  async listPartners(query: PageQuery) {
    const filtered = partners.filter((partner) => textMatchesQuery(query.q, partner.businessName, partner.contactEmail, partner.phone, partner.address));
    return paginateLocally(filtered, query);
  },

  async updatePartnerStatus(partnerId, status) {
    const target = partners.find((item) => item.id === partnerId);
    if (!target) throw new ApiError('Không tìm thấy đối tác.', 404, 'PARTNER_NOT_FOUND');
    target.status = status;
    recordAudit(`partner.${status}`, 'partner', partnerId);
  },

  async listAds(query: PageQuery) {
    const filtered = ads.filter((ad) => textMatchesQuery(query.q, ad.title, ad.partnerName));
    return paginateLocally(filtered, query);
  },

  async updateAdStatus(adId, status) {
    const target = ads.find((item) => item.id === adId);
    if (!target) throw new ApiError('Không tìm thấy chiến dịch.', 404, 'AD_NOT_FOUND');
    target.status = status;
    recordAudit(`ad.${status}`, 'ad', adId);
  },

  async listSos(query: PageQuery) {
    const filtered = sosAlerts.filter((sos) => textMatchesQuery(query.q, sos.petName, sos.ownerName, sos.lastSeenAddress));
    return paginateLocally(filtered, query);
  },

  async listAuditLogs(query: PageQuery) {
    const filtered = auditLogs.filter((entry) => textMatchesQuery(query.q, entry.actorName, entry.action, entry.targetType, entry.targetId));
    return paginateLocally(filtered, query);
  },
};
