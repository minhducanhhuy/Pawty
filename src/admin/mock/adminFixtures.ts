import { daysFromNowIso } from '../../shared/lib/format';
import type {
  AdminAd,
  AdminKpi,
  AdminPartner,
  AdminReport,
  AdminSosAlert,
  AdminTransaction,
  AdminUser,
  AuditLogEntry,
  KpiSeriesPoint,
  VaccineQueueItem,
} from '../api/adminTypes';

/** Ảnh sổ tiêm giả dạng SVG data-URI để lightbox chạy được cả khi offline. */
function buildVaccineBookImage(petName: string, pageNumber: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="840" viewBox="0 0 640 840">
<rect width="640" height="840" fill="#FDFBF7"/><rect x="24" y="24" width="592" height="792" rx="24" fill="#EBF9F6" stroke="#48C4B0" stroke-width="4"/>
<text x="320" y="110" font-family="Arial" font-size="34" font-weight="700" text-anchor="middle" fill="#0F766E">SỔ TIÊM CHỦNG - Trang ${pageNumber}</text>
<text x="320" y="170" font-family="Arial" font-size="28" text-anchor="middle" fill="#334155">Tên: ${petName}</text>
<g font-family="Arial" font-size="22" fill="#475569"><text x="70" y="270">Vắc-xin 7 bệnh ............ 12/03/2026</text><text x="70" y="330">Phòng dại ................. 12/03/2026</text><text x="70" y="390">Tẩy giun .................. 01/04/2026</text><text x="70" y="450">Hẹn tái chủng ............. 12/03/2027</text></g>
<circle cx="500" cy="640" r="80" fill="none" stroke="#FF6F61" stroke-width="6"/><text x="500" y="648" font-family="Arial" font-size="22" font-weight="700" text-anchor="middle" fill="#FF6F61">PHÒNG KHÁM</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SAMPLE_PET_NAMES = ['Mochi', 'Bơ', 'Lu', 'Cốm', 'Bông', 'Milo', 'Xoài'];

export function buildInitialVaccineQueue(): VaccineQueueItem[] {
  return SAMPLE_PET_NAMES.slice(0, 5).map((petName, index) => ({
    id: `pet_vq_${index + 1}`,
    name: petName,
    breed: ['Corgi', 'Poodle', 'Mèo Anh lông ngắn', 'Golden Retriever', 'Husky'][index],
    avatarUrl: buildVaccineBookImage(petName, 1),
    vaccineProofUrls: [buildVaccineBookImage(petName, 1), buildVaccineBookImage(petName, 2)],
    vaccineDetails: 'Vắc-xin 7 bệnh + phòng dại',
    lastVaccineDate: daysFromNowIso(-20 - index * 3),
    submittedAt: daysFromNowIso(-index),
    owner: { id: `usr_${index + 10}`, fullName: ['Nguyễn Minh Anh', 'Trần Gia Hân', 'Lê Quốc Bảo', 'Phạm Thu Trang', 'Võ Đức Huy'][index], phone: `09081234${50 + index}` },
  }));
}

const USER_NAMES = ['Nguyễn Minh Anh', 'Trần Gia Hân', 'Lê Quốc Bảo', 'Phạm Thu Trang', 'Võ Đức Huy', 'Đặng Khánh Linh', 'Bùi Anh Tuấn', 'Hoàng Mai Chi', 'Ngô Thanh Sơn', 'Đỗ Ngọc Ánh', 'Lý Hoàng Nam', 'Phan Bảo Ngọc'];
const CONDOS = ['Vinhomes Central Park - Park 3', 'Masteri Thảo Điền', 'Sunrise Riverside', 'Vinhomes Ocean Park', 'Royal City'];

export function buildInitialUsers(): AdminUser[] {
  const staff: AdminUser[] = [
    { id: 'usr_admin', phone: '0900000000', fullName: 'Pawty Admin', role: 'admin', vipTier: 'vip_plus', isBannedSwiping: false, flakeReportsCount: 0, condoComplex: 'Pawty HQ', createdAt: daysFromNowIso(-120) },
    { id: 'usr_mod', phone: '0900000001', fullName: 'Pawty Moderator', role: 'moderator', vipTier: 'free', isBannedSwiping: false, flakeReportsCount: 0, condoComplex: 'Pawty HQ', createdAt: daysFromNowIso(-100) },
  ];
  const members = USER_NAMES.map<AdminUser>((fullName, index) => ({
    id: `usr_${index + 1}`,
    phone: `09081234${String(index).padStart(2, '0')}`,
    fullName,
    nickname: index % 3 === 0 ? `Nhà Sen ${fullName.split(' ').pop()}` : null,
    condoComplex: CONDOS[index % CONDOS.length],
    role: 'user',
    vipTier: index % 4 === 0 ? 'vip' : 'free',
    vipExpiresAt: index % 4 === 0 ? daysFromNowIso(12) : null,
    isBannedSwiping: index === 5,
    banUntil: index === 5 ? daysFromNowIso(2) : null,
    flakeReportsCount: index === 5 ? 2 : index % 5 === 0 ? 1 : 0,
    createdAt: daysFromNowIso(-(index * 6 + 3)),
  }));
  return [...staff, ...members];
}

export function buildInitialReports(): AdminReport[] {
  const reasons = ['spam', 'harassment', 'abuse_animal', 'nsfw', 'fake', 'other'];
  const targetTypes = ['user', 'moment', 'message', 'pet', 'moment', 'club'] as const;
  return Array.from({ length: 9 }, (_, index) => ({
    id: `rep_${index + 1}`,
    reporterName: USER_NAMES[index % USER_NAMES.length],
    targetType: targetTypes[index % targetTypes.length],
    targetId: `tgt_${index + 100}`,
    targetLabel: ['Tài khoản "Sen ảo 99"', 'Ảnh "Boss đi tắm"', 'Tin nhắn trong phòng room_mochi_01', 'Boss "Lu"', 'Ảnh "Dạo công viên"', 'CLB "Corgi Q7"'][index % 6],
    reason: reasons[index % reasons.length],
    detail: index % 2 === 0 ? 'Người này nhắn tin quấy rối và gửi link lạ nhiều lần.' : null,
    status: index < 5 ? 'open' : index < 7 ? 'resolved' : 'dismissed',
    action: index === 5 ? 'warn' : index === 6 ? 'hide_content' : null,
    createdAt: daysFromNowIso(-index),
  }));
}

const TRANSACTION_TYPES = ['sos', 'vip_month', 'vip_year', 'vip_plus_month', 'boost', 'super_like_pack', 'partner_topup'];
const TRANSACTION_AMOUNTS = [39000, 49000, 399000, 99000, 29000, 49000, 500000];

export function buildInitialTransactions(): AdminTransaction[] {
  return Array.from({ length: 34 }, (_, index) => ({
    id: `txn_${1000 + index}`,
    userName: index % 7 === 6 ? 'Pawty Spa & Hotel' : USER_NAMES[index % USER_NAMES.length],
    type: TRANSACTION_TYPES[index % TRANSACTION_TYPES.length],
    amountVnd: TRANSACTION_AMOUNTS[index % TRANSACTION_AMOUNTS.length],
    status: index % 9 === 0 ? 'pending' : index % 11 === 0 ? 'expired' : index % 13 === 0 ? 'failed' : 'paid',
    paymentCode: `PAWTY ${TRANSACTION_TYPES[index % TRANSACTION_TYPES.length].toUpperCase()} ${1000 + index}`,
    createdAt: daysFromNowIso(-index * 0.7),
  }));
}

export function buildInitialPartners(): AdminPartner[] {
  return [
    { id: 'ptn_1', businessName: 'Pawty Spa & Hotel', category: 'spa', contactEmail: 'partner@pawtyspa.vn', phone: '0281234567', address: '12 Nguyễn Hữu Cảnh, Bình Thạnh', status: 'approved', plan: 'cpc', balanceVnd: 420000, createdAt: daysFromNowIso(-60) },
    { id: 'ptn_2', businessName: 'Bơ Pet Cafe', category: 'cafe', contactEmail: 'hello@bocafe.vn', phone: '0907777888', address: 'Masteri Thảo Điền, Quận 2', status: 'pending', plan: 'monthly', balanceVnd: 0, createdAt: daysFromNowIso(-2) },
    { id: 'ptn_3', businessName: 'Fresh Meal For Dogs', category: 'shop', contactEmail: 'order@freshmeal.vn', phone: '0909000111', address: 'Vinhomes Ocean Park, Gia Lâm', status: 'pending', plan: 'cpc', balanceVnd: 0, createdAt: daysFromNowIso(-1) },
    { id: 'ptn_4', businessName: 'Phòng khám Thú y Minh Tâm', category: 'vet', contactEmail: 'admin@minhtamvet.vn', phone: '0283888999', address: '45 Lê Văn Việt, Thủ Đức', status: 'suspended', plan: 'cpc', balanceVnd: 15000, createdAt: daysFromNowIso(-90) },
  ];
}

export function buildInitialAds(): AdminAd[] {
  return [
    { id: 'ad_1', partnerName: 'Pawty Spa & Hotel', title: 'Spa Tắm Gội Boss - Giảm 35%', discountPercent: 35, voucherQuota: 100, vouchersIssued: 37, radiusMeters: 1000, status: 'active', impressions: 5230, clicks: 412, endsAt: daysFromNowIso(20) },
    { id: 'ad_2', partnerName: 'Pawty Spa & Hotel', title: 'Khách sạn thú cưng cuối tuần', discountPercent: 30, voucherQuota: 50, vouchersIssued: 0, radiusMeters: 2000, status: 'draft', impressions: 0, clicks: 0, endsAt: daysFromNowIso(30) },
    { id: 'ad_3', partnerName: 'Bơ Pet Cafe', title: 'Cà phê cùng Boss - Giảm 30%', discountPercent: 30, voucherQuota: 80, vouchersIssued: 12, radiusMeters: 1500, status: 'paused', impressions: 1800, clicks: 130, endsAt: daysFromNowIso(10) },
    { id: 'ad_4', partnerName: 'Fresh Meal For Dogs', title: 'Pate tươi - Giảm 35%', discountPercent: 35, voucherQuota: 60, vouchersIssued: 60, radiusMeters: 1000, status: 'ended', impressions: 7000, clicks: 600, endsAt: daysFromNowIso(-5) },
  ];
}

export function buildInitialSos(): AdminSosAlert[] {
  return [
    { id: 'sos_1', ownerName: 'Trần Gia Hân', petName: 'Bơ', lastSeenAddress: 'Công viên Park 3, Vinhomes Central Park', radiusKm: 3, status: 'active', createdAt: daysFromNowIso(-0.05) },
    { id: 'sos_2', ownerName: 'Lê Quốc Bảo', petName: 'Lu', lastSeenAddress: 'Sảnh Block A, Masteri Thảo Điền', radiusKm: 3, status: 'resolved', createdAt: daysFromNowIso(-3), resolvedAt: daysFromNowIso(-2.8) },
    { id: 'sos_3', ownerName: 'Phạm Thu Trang', petName: 'Cốm', lastSeenAddress: 'Đường nội khu Sunrise Riverside', radiusKm: 3, status: 'expired', createdAt: daysFromNowIso(-9) },
  ];
}

const AUDIT_ACTIONS = ['vaccine.verified', 'report.resolved', 'user.ban_swiping', 'partner.approved', 'ad.paused', 'user.grant_vip'];

export function buildInitialAuditLogs(): AuditLogEntry[] {
  return Array.from({ length: 24 }, (_, index) => ({
    id: `aud_${index + 1}`,
    actorId: index % 3 === 0 ? 'usr_mod' : 'usr_admin',
    actorName: index % 3 === 0 ? 'Pawty Moderator' : 'Pawty Admin',
    action: AUDIT_ACTIONS[index % AUDIT_ACTIONS.length],
    targetType: ['pet', 'report', 'user', 'partner', 'ad', 'user'][index % 6],
    targetId: `tgt_${index + 1}`,
    createdAt: daysFromNowIso(-index * 0.4),
  }));
}

export function buildKpiFixture(counts: { vaccinePending: number; openReports: number; partnersPending: number }): AdminKpi {
  const series: KpiSeriesPoint[] = Array.from({ length: 14 }, (_, index) => {
    const wave = Math.sin(index / 2) * 12;
    return {
      date: daysFromNowIso(index - 13).slice(0, 10),
      dau: Math.round(160 + index * 9 + wave),
      newPets: Math.round(14 + index * 0.8 + wave / 4),
      matches: Math.round(60 + index * 4 + wave),
      appointmentsCreated: Math.round(22 + index * 1.4 + wave / 3),
      appointmentsCompleted: Math.round(11 + index * 1.1 + wave / 5),
    };
  });
  return {
    dau: 284,
    mau: 1730,
    totalUsers: 2418,
    newPetsToday: 21,
    matchesToday: 118,
    appointmentsCreatedToday: 37,
    appointmentsCompletedToday: 19,
    flakeRate: 0.082,
    revenueBySource: { sos: 1_287_000, vip: 4_165_000, iap: 1_390_000, ads: 3_000_000 },
    openReports: counts.openReports,
    vaccinePending: counts.vaccinePending,
    partnersPending: counts.partnersPending,
    northStarCompletedThisWeek: series.slice(-7).reduce((sum, point) => sum + point.appointmentsCompleted, 0),
    series,
  };
}
