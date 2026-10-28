import type { PageQuery, PagedResult } from '../../shared/api/paged';

export type UserRole = 'user' | 'moderator' | 'admin';
export type VipTier = 'free' | 'vip' | 'vip_plus';

export interface AdminProfile {
  id: string;
  phone: string;
  fullName: string;
  role: UserRole;
}

export interface AdminSession {
  token: string;
  profile: AdminProfile;
}

export interface KpiSeriesPoint {
  date: string;
  dau: number;
  newPets: number;
  matches: number;
  appointmentsCreated: number;
  appointmentsCompleted: number;
}

export interface RevenueBySource {
  sos: number;
  vip: number;
  iap: number;
  ads: number;
}

export interface AdminKpi {
  dau: number;
  mau: number;
  totalUsers: number;
  newPetsToday: number;
  matchesToday: number;
  appointmentsCreatedToday: number;
  appointmentsCompletedToday: number;
  flakeRate: number;
  revenueBySource: RevenueBySource;
  openReports: number;
  vaccinePending: number;
  partnersPending: number;
  northStarCompletedThisWeek: number;
  series: KpiSeriesPoint[];
}

export interface AdminUser {
  id: string;
  phone: string;
  fullName: string;
  nickname?: string | null;
  condoComplex?: string;
  role: UserRole;
  vipTier: VipTier;
  vipExpiresAt?: string | null;
  isBannedSwiping: boolean;
  banUntil?: string | null;
  flakeReportsCount: number;
  createdAt: string;
}

export interface AdminUserPatch {
  isBannedSwiping?: boolean;
  banDays?: number;
  role?: UserRole;
  grantVip?: { tier: Exclude<VipTier, 'free'>; days: number };
}

export interface VaccineQueueItem {
  id: string;
  name: string;
  breed?: string;
  avatarUrl?: string;
  vaccineProofUrls: string[];
  vaccineDetails?: string | null;
  lastVaccineDate?: string | null;
  submittedAt?: string;
  owner?: { id: string; fullName: string; phone: string };
}

export type VaccineDecision =
  | { decision: 'verified'; nextDueDate: string }
  | { decision: 'rejected'; reason: string };

export type ReportStatus = 'open' | 'resolved' | 'dismissed';
export type ReportAction = 'warn' | 'hide_content' | 'ban_user';
export type ReportTargetType = 'user' | 'pet' | 'moment' | 'message' | 'club';

export interface AdminReport {
  id: string;
  reporterName?: string;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string;
  reason: string;
  detail?: string | null;
  status: ReportStatus;
  action?: ReportAction | null;
  createdAt: string;
}

export interface ReportResolution {
  status: Exclude<ReportStatus, 'open'>;
  action?: ReportAction;
}

export type TransactionStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface AdminTransaction {
  id: string;
  userName?: string;
  type: string;
  amountVnd: number;
  status: TransactionStatus;
  paymentCode?: string;
  createdAt: string;
}

export type PartnerStatus = 'pending' | 'approved' | 'suspended';

export interface AdminPartner {
  id: string;
  businessName: string;
  category: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  status: PartnerStatus;
  plan: 'cpc' | 'monthly';
  balanceVnd: number;
  createdAt: string;
}

export type AdStatus = 'draft' | 'active' | 'paused' | 'ended';

export interface AdminAd {
  id: string;
  partnerName?: string;
  title: string;
  imageUrl?: string;
  discountPercent: number;
  voucherQuota: number;
  vouchersIssued: number;
  radiusMeters: number;
  status: AdStatus;
  impressions: number;
  clicks: number;
  endsAt?: string | null;
}

export type SosStatus = 'active' | 'resolved' | 'expired';

export interface AdminSosAlert {
  id: string;
  ownerName?: string;
  petName: string;
  lastSeenAddress?: string;
  radiusKm?: number;
  status: SosStatus;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface AuditLogEntry {
  id: string;
  actorName?: string;
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  createdAt: string;
}

export interface TransactionFilters {
  type?: string;
  status?: string;
}

export interface AdminApi {
  requestOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, otpCode: string): Promise<AdminSession>;
  restoreProfile(): Promise<AdminProfile>;
  getKpi(): Promise<AdminKpi>;
  listUsers(query: PageQuery): Promise<PagedResult<AdminUser>>;
  updateUser(userId: string, patch: AdminUserPatch): Promise<void>;
  listVaccineQueue(query: PageQuery): Promise<PagedResult<VaccineQueueItem>>;
  decideVaccine(petId: string, decision: VaccineDecision): Promise<void>;
  listReports(query: PageQuery, status?: string): Promise<PagedResult<AdminReport>>;
  resolveReport(reportId: string, resolution: ReportResolution): Promise<void>;
  listTransactions(query: PageQuery, filters: TransactionFilters): Promise<PagedResult<AdminTransaction>>;
  listPartners(query: PageQuery): Promise<PagedResult<AdminPartner>>;
  updatePartnerStatus(partnerId: string, status: Exclude<PartnerStatus, 'pending'>): Promise<void>;
  listAds(query: PageQuery): Promise<PagedResult<AdminAd>>;
  updateAdStatus(adId: string, status: 'active' | 'paused'): Promise<void>;
  listSos(query: PageQuery): Promise<PagedResult<AdminSosAlert>>;
  listAuditLogs(query: PageQuery): Promise<PagedResult<AuditLogEntry>>;
}
