import {
  UserRecord,
  PetRecord,
  MatchRecord,
  ChatRoomRecord,
  ChatMessageRecord,
  WalkAppointmentRecord,
  PetMomentRecord,
  MomentLikeRecord,
  MomentCommentRecord,
  SosAlertRecord,
  TransactionRecord,
  BlockRecord,
  ReportRecord,
  NotificationRecord,
  ReminderRecord,
  BadgeRecord,
  UserBadgeRecord,
  WalkLogRecord,
  ClubRecord,
  ClubMemberRecord,
  EventRecord,
  EventRsvpRecord,
  PetFriendlyPlaceRecord,
  PlaceReviewRecord,
  PartnerRecord,
  NativeAdRecord,
  VoucherRecord,
  ReferralRecord,
  AuditLogRecord,
} from './types';

const DEFAULT_PREFS = {
  match: true,
  message: true,
  appointment: true,
  sos: true,
  reminder: true,
  event: true,
};

export function createInitialSeed() {
  const now = new Date();
  const isoNow = now.toISOString();

  // Root admin for Web Portal
  const users: UserRecord[] = [
    {
      id: 'usr_admin_01',
      username: 'admin',
      passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin' sha256
      phone: '0900000001',
      email: 'admin@pawty.app',
      authProvider: 'username_password',
      role: 'admin',
      locale: 'vi',
      fullName: 'Quản Trị Viên Pawty',
      nickname: 'Pawty Admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      isVerified: true,
      isVip: true,
      vipTier: 'vip_plus',
      vipExpiresAt: null,
      dailySwipesCount: 0,
      superLikesToday: 0,
      superLikeBalance: 99,
      boostBalance: 99,
      boostExpiresAt: null,
      isWalkingNow: false,
      walkingUntil: null,
      referralCode: 'PAWTYADMIN',
      referredByUserId: null,
      walkStreakDays: 0,
      lastWalkDate: null,
      totalWalkMeters: 0,
      latitude: 10.7951,
      longitude: 106.7218,
      isDistanceHidden: false,
      condoComplex: 'Vinhomes Central Park',
      flakeReportsCount: 0,
      isBannedSwiping: false,
      banUntil: null,
      fcmToken: null,
      notificationPrefs: DEFAULT_PREFS,
      isDeleted: false,
      createdAt: isoNow,
      updatedAt: isoNow,
    },
  ];

  const pets: PetRecord[] = [];
  const matches: MatchRecord[] = [];
  const chatRooms: ChatRoomRecord[] = [];
  const chatMessages: ChatMessageRecord[] = [];
  const appointments: WalkAppointmentRecord[] = [];
  const moments: PetMomentRecord[] = [];
  const momentLikes: MomentLikeRecord[] = [];
  const momentComments: MomentCommentRecord[] = [];
  const sosAlerts: SosAlertRecord[] = [];
  const transactions: TransactionRecord[] = [];
  const blocks: BlockRecord[] = [];
  const reports: ReportRecord[] = [];
  const notifications: NotificationRecord[] = [];
  const reminders: ReminderRecord[] = [];

  const badges: BadgeRecord[] = [
    {
      code: 'first_match',
      nameVi: 'Khớp Lệnh Đầu Tiên',
      nameEn: 'First Match',
      icon: '🤝',
      descriptionVi: 'Khớp lệnh thành công lần đầu tiên',
      descriptionEn: 'Completed your first match',
    },
    {
      code: 'safe_pet',
      nameVi: 'Chứng Nhận Safe Pet',
      nameEn: 'Safe Pet Certified',
      icon: '🛡️',
      descriptionVi: 'Xác minh tiêm chủng 7 bệnh an toàn',
      descriptionEn: 'Vaccination verified',
    },
    {
      code: 'walk_7_streak',
      nameVi: 'Chiến Thần Dắt Dạo',
      nameEn: '7-Day Walker',
      icon: '🔥',
      descriptionVi: 'Chuỗi 7 ngày dắt dạo liên tiếp',
      descriptionEn: '7 days walking streak',
    },
    {
      code: 'social_butterfly',
      nameVi: 'Chiến Thần Xã Hội',
      nameEn: 'Social Butterfly',
      icon: '🦋',
      descriptionVi: 'Kết nối với hơn 5 người bạn mới',
      descriptionEn: 'Connected with 5+ friends',
    },
    {
      code: 'moment_10',
      nameVi: 'Nhiếp Ảnh Gia Boss',
      nameEn: 'Pet Photographer',
      icon: '📸',
      descriptionVi: 'Đăng tải 10 khoảnh khắc',
      descriptionEn: 'Shared 10 moments',
    },
    {
      code: 'club_member',
      nameVi: 'Hội Viên CLB',
      nameEn: 'Club Member',
      icon: '🏰',
      descriptionVi: 'Tham gia CLB giống hoặc toà nhà',
      descriptionEn: 'Joined a club',
    },
    {
      code: 'referral_3',
      nameVi: 'Đại Sứ Cộng Đồng',
      nameEn: 'Community Ambassador',
      icon: '🎁',
      descriptionVi: 'Giới thiệu thành công 3 người bạn',
      descriptionEn: 'Referred 3 friends',
    },
    {
      code: 'sos_hero',
      nameVi: 'Hiệp Sĩ Cứu Cún',
      nameEn: 'SOS Hero',
      icon: '🦸',
      descriptionVi: 'Hỗ trợ tìm kiếm Boss đi lạc',
      descriptionEn: 'Helped locate a lost pet',
    },
  ];

  const userBadges: UserBadgeRecord[] = [];
  const walkLogs: WalkLogRecord[] = [];
  const clubs: ClubRecord[] = [];
  const clubMembers: ClubMemberRecord[] = [];
  const events: EventRecord[] = [];
  const eventRsvps: EventRsvpRecord[] = [];

  const places: PetFriendlyPlaceRecord[] = [
    {
      id: 'place_01',
      name: 'Bãi Cỏ Công Viên Ven Sông Vinhomes',
      category: 'park',
      address: 'Công viên Landmark 81, P.22, Q.Bình Thạnh, TP.HCM',
      lat: 10.7955,
      lng: 106.7222,
      thumbnailUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
      ratingAvg: 4.9,
      reviewsCount: 1,
      partnerId: null,
    },
    {
      id: 'place_02',
      name: 'Corgi & Friends Pet Cafe Thảo Điền',
      category: 'cafe',
      address: '24 Xuân Thủy, P.Thảo Điền, TP.Thủ Đức, TP.HCM',
      lat: 10.8012,
      lng: 106.7315,
      thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=500&q=80',
      ratingAvg: 4.8,
      reviewsCount: 1,
      partnerId: null,
    },
  ];

  const placeReviews: PlaceReviewRecord[] = [];
  const partners: PartnerRecord[] = [];
  const nativeAds: NativeAdRecord[] = [];
  const vouchers: VoucherRecord[] = [];
  const referrals: ReferralRecord[] = [];
  const auditLogs: AuditLogRecord[] = [];

  return {
    users,
    pets,
    matches,
    chatRooms,
    chatMessages,
    appointments,
    moments,
    momentLikes,
    momentComments,
    sosAlerts,
    transactions,
    blocks,
    reports,
    notifications,
    reminders,
    badges,
    userBadges,
    walkLogs,
    clubs,
    clubMembers,
    events,
    eventRsvps,
    places,
    placeReviews,
    partners,
    nativeAds,
    vouchers,
    referrals,
    auditLogs,
  };
}
