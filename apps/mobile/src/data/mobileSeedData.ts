export type MobileReactionKey = 'paw' | 'heart_eyes' | 'laughing' | 'worried' | 'helpful';

export interface MobileVaccination {
  id: string;
  vaccineName: string;
  dateGiven: string;
  nextDueDate: string;
  clinicName: string;
  verified: boolean;
}

export interface MobileBehaviorChip {
  id: string;
  category: 'personality' | 'good_habit' | 'caution';
  label: string;
}

export interface MobilePet {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  gender: 'male' | 'female';
  ageDisplay: string;
  weightKg: number;
  sizeLabel: string;
  isNeutered: boolean;
  avatarUrl: string;
  bio: string;
  vaccinationStatus: 'full' | 'partial' | 'none';
  vetClinicName: string;
  vetDoctorName: string;
  vetPhone: string;
  vaccinations: MobileVaccination[];
  behaviors: MobileBehaviorChip[];
  weightHistory: Array<{ month: string; weightKg: number }>;
  momentPhotos: string[];
}

export interface MobileCareTask {
  id: string;
  petId: string;
  petName: string;
  title: string;
  category: 'feeding' | 'walk' | 'grooming' | 'medication' | 'vet';
  assignedToName: string;
  dueTime: string;
  recurrence: string;
  status: 'pending' | 'done';
  completedByName?: string;
  completedAt?: string;
  completionNote?: string;
}

export interface MobileCircleMember {
  id: string;
  displayName: string;
  relationshipLabel: string;
  role: 'owner' | 'co_carer' | 'helper' | 'viewer';
  avatarUrl: string;
  inviteCode?: string;
}

export interface MobileCircleActivity {
  id: string;
  actorName: string;
  actionText: string;
  timestamp: string;
}

export interface MobileComment {
  id: string;
  authorName: string;
  authorBadge?: 'vet' | 'trainer' | 'vip';
  content: string;
  createdAt: string;
}

export interface MobilePost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRoleBadge?: 'vip' | 'vet' | 'partner';
  authorVerifiedTitle?: string;
  petId: string;
  petName: string;
  petBreed: string;
  petSpecies: 'dog' | 'cat';
  contentType: 'moment' | 'question' | 'tip' | 'review';
  textContent: string;
  imageUrl: string;
  hashtags: string[];
  locationDistrict: string;
  distanceMeters: number;
  hasHealthDisclaimer: boolean;
  isSponsored: boolean;
  sponsorVoucherCode?: string;
  sponsorDiscountText?: string;
  pawRankScore: number;
  createdAt: string;
  reactions: Record<MobileReactionKey, number>;
  userReaction?: MobileReactionKey;
  isBookmarked: boolean;
  comments: MobileComment[];
}

export interface MobileGroup {
  id: string;
  name: string;
  description: string;
  district: string;
  memberCount: number;
  postsToday: number;
  coverUrl: string;
  isJoined: boolean;
}

export interface MobileRadarCandidate {
  id: string;
  ownerName: string;
  neighborhood: string;
  distanceMeters: number;
  walkRoutineTime: string;
  compatibilityScore: number;
  petName: string;
  petSpecies: 'dog' | 'cat';
  petBreed: string;
  petWeightKg: number;
  petAvatar: string;
  vaccinationStatus: 'full' | 'partial';
  goodHabits: string[];
  cautions: string[];
}

export interface MobilePartner {
  id: string;
  businessName: string;
  businessType: 'grooming' | 'vet' | 'walking';
  address: string;
  distanceMeters: number;
  ratingAvg: number;
  reviewCount: number;
  avatarUrl: string;
  verified: boolean;
  services: Array<{
    id: string;
    name: string;
    priceVnd: number;
    durationMinutes: number;
  }>;
}

export interface MobilePlace {
  id: string;
  name: string;
  category: 'park' | 'cafe';
  address: string;
  distanceMeters: number;
  rating: number;
  features: string[];
  imageUrl: string;
}

export interface MobileBooking {
  id: string;
  partnerId: string;
  partnerName: string;
  serviceName: string;
  petName: string;
  bookingDate: string;
  bookingTime: string;
  servicePrice: number;
  commissionVnd: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

export interface MobileWalkAppointment {
  id: string;
  partnerName: string;
  partnerPetName: string;
  proposedTime: string;
  midpointLocationName: string;
  distanceFromMidpointMeters: number;
  status: 'pending' | 'confirmed' | 'completed' | 'no_show';
  notes: string;
}

export interface MobileConversation {
  id: string;
  title: string;
  subtitle: string;
  category: 'circle' | 'match' | 'partner';
  avatarUrl: string;
  unreadCount: number;
  messages: Array<{
    id: string;
    senderName: string;
    isMe: boolean;
    text: string;
    createdAt: string;
    type?: 'text' | 'voice' | 'walk_invite' | 'handover';
  }>;
}

export interface MobileSosAlert {
  id: string;
  ownerName: string;
  ownerPhone: string;
  petName: string;
  petAvatar: string;
  lastSeenAddress: string;
  radiusKm: number;
  rewardText: string;
  status: 'active' | 'found';
  createdAt: string;
  sightingCount: number;
}

const BANNED_PATTERNS = [
  /bán\s+(chó|mèo|thú\s*cưng|pet|cún|boss)/i,
  /mua\s*bán\s+(chó|mèo|cún)/i,
  /phối\s*giống\s*(giá|thu\s*phí|kinh\s*doanh)/i,
  /thịt\s*(chó|mèo)/i,
  /đánh\s*đập|hành\s*hạ|bạo\s*hành/i,
  /kê\s*đơn\s*thuốc|bán\s*thuốc\s*kháng\s*sinh/i,
];

const HEALTH_PATTERNS = [
  /bỏ\s*ăn|nôn\s*mửa|tiêu\s*chảy|đi\s*ngoài\s*ra\s*máu|co\s*giật|sốt\s*cao|sốc\s*nhiệt|khó\s*thở|vắc-xin|tiêm\s*phòng|tẩy\s*giun|dị\s*ứng/i,
];

export function moderateMobileContent(text: string): {
  allowed: boolean;
  reason?: string;
  hasHealthDisclaimer: boolean;
} {
  for (const regex of BANNED_PATTERNS) {
    if (regex.test(text)) {
      return {
        allowed: false,
        reason:
          'Nội dung vi phạm chính sách Pawty: Nghiêm cấm mua bán thú cưng, phối giống thương mại, tự kê đơn thuốc hoặc ngược đãi động vật.',
        hasHealthDisclaimer: false,
      };
    }
  }
  const hasHealthDisclaimer = HEALTH_PATTERNS.some((r) => r.test(text));
  return { allowed: true, hasHealthDisclaimer };
}

export function buildMobileVietQrUrl(amountVnd: number, addInfo: string): string {
  const encodedInfo = encodeURIComponent(addInfo);
  const encodedName = encodeURIComponent('CONG TY CO PHAN PAWTY VIET NAM');
  return `https://img.vietqr.io/image/MB-0988776655-compact2.png?amount=${amountVnd}&addInfo=${encodedInfo}&accountName=${encodedName}`;
}

export const INITIAL_MOBILE_PETS: MobilePet[] = [
  {
    id: 'pet-lu',
    name: 'Lu',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    ageDisplay: '2 tuổi',
    weightKg: 28.4,
    sizeLabel: 'Cỡ lớn (25–40kg)',
    isNeutered: true,
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    bio: 'Chàng Golden 28.4kg siêu thân thiện, mê bơi lội và thích nhặt bóng tennis ở công viên nội khu Vinhomes Grand Park.',
    vaccinationStatus: 'full',
    vetClinicName: 'Phòng Khám Thú Y Dr. Paw Thảo Điền',
    vetDoctorName: 'BS. Trần Minh Khoa',
    vetPhone: '028 3899 1122',
    vaccinations: [
      {
        id: 'vac-1',
        vaccineName: 'Vắc-xin 7 bệnh (Vanguard Plus 5/CV-L)',
        dateGiven: '10/11/2025',
        nextDueDate: '10/11/2026',
        clinicName: 'Dr. Paw Clinic',
        verified: true,
      },
      {
        id: 'vac-2',
        vaccineName: 'Vắc-xin Phòng Dại (Rabisin)',
        dateGiven: '10/11/2025',
        nextDueDate: '10/11/2026',
        clinicName: 'Dr. Paw Clinic',
        verified: true,
      },
    ],
    behaviors: [
      { id: 'bh-1', category: 'personality', label: 'Thân thiện với chó nhỏ' },
      { id: 'bh-2', category: 'good_habit', label: 'Đi vệ sinh đúng chỗ' },
      { id: 'bh-3', category: 'good_habit', label: 'Nghe lệnh ngồi & đợi' },
      { id: 'bh-4', category: 'caution', label: 'Hay đuổi chim bồ câu' },
      { id: 'bh-5', category: 'caution', label: 'Giật mình khi nghe còi xe tải' },
    ],
    weightHistory: [
      { month: 'T7', weightKg: 27.2 },
      { month: 'T8', weightKg: 27.8 },
      { month: 'T9', weightKg: 28.1 },
      { month: 'T10', weightKg: 28.4 },
    ],
    momentPhotos: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    id: 'pet-miu',
    name: 'Miu',
    species: 'cat',
    breed: 'Mèo Anh Lông Ngắn (British Shorthair)',
    gender: 'female',
    ageDisplay: '1 tuổi 4 tháng',
    weightKg: 4.3,
    sizeLabel: 'Cỡ nhỏ (<5kg)',
    isNeutered: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
    bio: 'Công chúa Miu thích nằm sưởi nắng ban công, nghiện súp thưởng cá hồi và ghét tiếng máy hút bụi.',
    vaccinationStatus: 'full',
    vetClinicName: 'Phòng Khám Thú Y Dr. Paw Thảo Điền',
    vetDoctorName: 'BS. Nguyễn Lan Anh',
    vetPhone: '028 3899 1122',
    vaccinations: [
      {
        id: 'vac-3',
        vaccineName: 'Vắc-xin 4 bệnh Mèo (Felocell 4)',
        dateGiven: '01/12/2025',
        nextDueDate: '01/12/2026',
        clinicName: 'Dr. Paw Clinic',
        verified: true,
      },
    ],
    behaviors: [
      { id: 'bh-6', category: 'personality', label: 'Quấn chủ, thích gãi cằm' },
      { id: 'bh-7', category: 'good_habit', label: 'Đi cát vệ sinh cực chuẩn' },
      { id: 'bh-8', category: 'caution', label: 'Sợ người lạ trong 15 phút đầu' },
    ],
    weightHistory: [
      { month: 'T7', weightKg: 4.0 },
      { month: 'T8', weightKg: 4.1 },
      { month: 'T9', weightKg: 4.2 },
      { month: 'T10', weightKg: 4.3 },
    ],
    momentPhotos: [
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=500&q=80',
    ],
  },
];

export const INITIAL_MOBILE_TASKS: MobileCareTask[] = [
  {
    id: 'task-1',
    petId: 'pet-lu',
    petName: 'Lu',
    title: 'Cho Lu ăn sáng (200g hạt Royal Canin + ức gà luộc)',
    category: 'feeding',
    assignedToName: 'Hùng Lê (Chồng)',
    dueTime: '07:30',
    recurrence: 'Hàng ngày',
    status: 'done',
    completedByName: 'Hùng Lê',
    completedAt: '07:35',
    completionNote: 'Lu ăn hết sạch trong 3 phút, uống thêm 300ml nước.',
  },
  {
    id: 'task-2',
    petId: 'pet-lu',
    petName: 'Lu',
    title: 'Dắt Lu đi dạo chiều 30 phút quanh công viên nội khu',
    category: 'walk',
    assignedToName: 'Mai Nguyễn (Bạn)',
    dueTime: '17:30',
    recurrence: 'Hàng ngày',
    status: 'pending',
  },
  {
    id: 'task-3',
    petId: 'pet-miu',
    petName: 'Miu',
    title: 'Chải lông & dọn khay cát vệ sinh cho Miu',
    category: 'grooming',
    assignedToName: 'Hùng Lê (Chồng)',
    dueTime: '19:00',
    recurrence: 'Hàng ngày',
    status: 'pending',
  },
  {
    id: 'task-4',
    petId: 'pet-lu',
    petName: 'Lu',
    title: 'Cho uống viên nhai tẩy giun định kỳ NexGard Spectra',
    category: 'medication',
    assignedToName: 'Mai Nguyễn (Bạn)',
    dueTime: '20:00',
    recurrence: 'Hàng tháng',
    status: 'pending',
  },
];

export const INITIAL_MOBILE_CIRCLE_MEMBERS: MobileCircleMember[] = [
  {
    id: 'cm-1',
    displayName: 'Mai Nguyễn (Bạn)',
    relationshipLabel: 'Chủ chính — Mẹ của Lu & Miu',
    role: 'owner',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'cm-2',
    displayName: 'Hùng Lê',
    relationshipLabel: 'Đồng chăm sóc — Ba của Lu',
    role: 'co_carer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'cm-3',
    displayName: 'Lan Trần',
    relationshipLabel: 'Người hỗ trợ — Hàng xóm tầng 12',
    role: 'helper',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
];

export const INITIAL_MOBILE_CIRCLE_ACTIVITIES: MobileCircleActivity[] = [
  {
    id: 'act-1',
    actorName: 'Hùng Lê',
    actionText: 'đã hoàn thành "Cho Lu ăn sáng (200g hạt + ức gà)" — Kèm ghi chú: Ăn hết sạch!',
    timestamp: '07:35 Hôm nay',
  },
  {
    id: 'act-2',
    actorName: 'Mai Nguyễn',
    actionText: 'đã tạo Ghi chú bàn giao chăm sóc cuối tuần cho Lan Trần (Hàng xóm)',
    timestamp: 'Hôm qua, 20:15',
  },
];

export const INITIAL_MOBILE_POSTS: MobilePost[] = [
  {
    id: 'post-1',
    authorName: 'Mai Nguyễn',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    authorRoleBadge: 'vip',
    petId: 'pet-lu',
    petName: 'Lu',
    petBreed: 'Golden Retriever',
    petSpecies: 'dog',
    contentType: 'moment',
    textContent:
      'Chiều nay ra công viên nội khu Vinhomes Grand Park gặp hội bạn Corgi chạy mệt nghỉ luôn! Có Sen nào ở khu Rainbow tối nay dắt cún đi dạo chung không ạ? 🐾🌅',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    hashtags: ['#GoldenRetriever', '#VinhomesGrandPark', '#HẹnDạo'],
    locationDistrict: 'TP. Thủ Đức (Quận 9)',
    distanceMeters: 120,
    hasHealthDisclaimer: false,
    isSponsored: false,
    pawRankScore: 95,
    createdAt: '25 phút trước',
    reactions: { paw: 34, heart_eyes: 19, laughing: 6, worried: 0, helpful: 4 },
    userReaction: 'paw',
    isBookmarked: false,
    comments: [
      {
        id: 'c-1',
        authorName: 'Minh Phạm (Ba của Bơ)',
        content: 'Tầm 17h45 Bơ Corgi cũng ra bãi cỏ trung tâm nha mẹ Lu ơi!',
        createdAt: '15 phút trước',
      },
    ],
  },
  {
    id: 'post-2',
    authorName: 'BS. Trần Minh Khoa',
    authorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
    authorRoleBadge: 'vet',
    authorVerifiedTitle: 'Bác sĩ Thú Y Xác minh — Dr. Paw Clinic',
    petId: 'pet-lu',
    petName: 'Góc Chuyên Gia',
    petBreed: 'Phòng tránh sốc nhiệt mùa nắng',
    petSpecies: 'dog',
    contentType: 'tip',
    textContent:
      'Mùa nắng nóng tại TP.HCM, các giống chó lông dày như Golden, Husky, Corgi rất dễ bị sốc nhiệt và bỏ ăn khi đi dạo trên mặt nhựa đường nóng. Hãy dắt dạo sau 17h00 và luôn mang theo bình nước gấp gọn nhé!',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    hashtags: ['#MẹoChămBoss', '#BácSĩThúY', '#SốcNhiệt'],
    locationDistrict: 'Thảo Điền, TP. Thủ Đức',
    distanceMeters: 2400,
    hasHealthDisclaimer: true,
    isSponsored: false,
    pawRankScore: 92,
    createdAt: '1 giờ trước',
    reactions: { paw: 52, heart_eyes: 14, laughing: 0, worried: 8, helpful: 89 },
    isBookmarked: true,
    comments: [
      {
        id: 'c-2',
        authorName: 'BS. Trần Minh Khoa',
        authorBadge: 'vet',
        content:
          'Lưu ý y khoa: Nếu thấy nướu cún đỏ sẫm, thở gấp và chảy nhiều nước dãi, hãy làm mát bằng khăn ẩm mát vừa phải và đưa tới phòng khám thú y gần nhất.',
        createdAt: '40 phút trước',
      },
    ],
  },
  {
    id: 'post-ad-1',
    authorName: 'PetSpa Bubble & Paws Nội Khu',
    authorAvatar: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=200&q=80',
    authorRoleBadge: 'partner',
    authorVerifiedTitle: 'Đối tác Xác minh Pawty Pro',
    petId: 'pet-lu',
    petName: 'Ưu đãi Nội khu -35%',
    petBreed: 'Grooming & Spa Sục Ozone',
    petSpecies: 'dog',
    contentType: 'review',
    textContent:
      '🎁 Tặng cư dân Vinhomes Grand Park & Thảo Điền Voucher giảm 35% gói Tắm Spa Sục Ozone Khử Mùi + Cắt Tỉa Tạo Kiểu chuẩn Nhật cho Boss trong tuần này!',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    hashtags: ['#GroomingĐẹp', '#ƯuĐãiNộiKhu', '#PawtyServices'],
    locationDistrict: 'Cách bạn 350m',
    distanceMeters: 350,
    hasHealthDisclaimer: false,
    isSponsored: true,
    sponsorVoucherCode: 'PAWTYSPA35',
    sponsorDiscountText: 'Giảm 35% Combo Spa 8 bước — Chỉ còn 225.000đ',
    pawRankScore: 84,
    createdAt: 'Được tài trợ',
    reactions: { paw: 28, heart_eyes: 15, laughing: 1, worried: 0, helpful: 19 },
    isBookmarked: false,
    comments: [],
  },
];

export const INITIAL_MOBILE_GROUPS: MobileGroup[] = [
  {
    id: 'grp-1',
    name: 'Hội nuôi chó Vinhomes Grand Park (Quận 9)',
    description: 'Cộng đồng cư dân nuôi thú cưng văn minh tại Vinhomes Grand Park. Chia sẻ lịch hẹn dạo chiều và bác sĩ thú y uy tín.',
    district: 'TP. Thủ Đức (Quận 9)',
    memberCount: 642,
    postsToday: 18,
    coverUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
    isJoined: true,
  },
  {
    id: 'grp-2',
    name: 'Golden & Corgi Sài Gòn — Hội Mông To',
    description: 'Giao lưu offline cuối tuần, chia sẻ kinh nghiệm chăm bộ lông bóng mượt và chế độ dinh dưỡng chống béo phì.',
    district: 'TP. Hồ Chí Minh',
    memberCount: 1280,
    postsToday: 31,
    coverUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
    isJoined: true,
  },
  {
    id: 'grp-3',
    name: 'Hội Mèo Anh Lông Ngắn & Mèo Nội Chung Cư',
    description: 'Tư vấn cát vệ sinh khử mùi, lưới an toàn ban công chung cư và thức ăn hạt chuẩn dinh dưỡng.',
    district: 'TP. Hồ Chí Minh & Hà Nội',
    memberCount: 950,
    postsToday: 24,
    coverUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    isJoined: false,
  },
];

export const INITIAL_MOBILE_RADAR: MobileRadarCandidate[] = [
  {
    id: 'radar-bo',
    ownerName: 'Minh Phạm',
    neighborhood: 'Vinhomes Grand Park - Khu Origami',
    distanceMeters: 280,
    walkRoutineTime: '17:30 – 18:15 hàng ngày',
    compatibilityScore: 96,
    petName: 'Bơ',
    petSpecies: 'dog',
    petBreed: 'Pembroke Welsh Corgi',
    petWeightKg: 11.8,
    petAvatar: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
    vaccinationStatus: 'full',
    goodHabits: ['Hòa đồng, thích chạy bộ', 'Đã tiêm đủ 7 bệnh & Dại'],
    cautions: ['Hơi giữ đồ chơi bóng cao su'],
  },
  {
    id: 'radar-milo',
    ownerName: 'Thảo Vy',
    neighborhood: 'Vinhomes Grand Park - Khu Beverly',
    distanceMeters: 450,
    walkRoutineTime: '18:00 – 19:00',
    compatibilityScore: 93,
    petName: 'Milo',
    petSpecies: 'dog',
    petBreed: 'Toy Poodle',
    petWeightKg: 4.5,
    petAvatar: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=600&q=80',
    vaccinationStatus: 'full',
    goodHabits: ['Hiền lành, quấn người', 'Không sủa trong thang máy'],
    cautions: ['Sợ chó lớn chạy quá nhanh'],
  },
];

export const INITIAL_MOBILE_PARTNERS: MobilePartner[] = [
  {
    id: 'partner-1',
    businessName: 'PetSpa Bubble & Paws Nội Khu',
    businessType: 'grooming',
    address: 'Shophouse S2.05 Vinhomes Grand Park, TP. Thủ Đức',
    distanceMeters: 350,
    ratingAvg: 4.9,
    reviewCount: 128,
    avatarUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=500&q=80',
    verified: true,
    services: [
      {
        id: 'srv-1',
        name: 'Combo Tắm Spa Sục Ozone 8 Bước & Vệ Sinh Tai/Móng',
        priceVnd: 280000,
        durationMinutes: 60,
      },
      {
        id: 'srv-2',
        name: 'Cắt Tỉa Tạo Kiểu Toàn Thân + Ủ Lông Collagen',
        priceVnd: 420000,
        durationMinutes: 90,
      },
    ],
  },
  {
    id: 'partner-2',
    businessName: 'Phòng Khám Thú Y Dr. Paw Clinic',
    businessType: 'vet',
    address: 'Số 42 Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức',
    distanceMeters: 2400,
    ratingAvg: 4.95,
    reviewCount: 215,
    avatarUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=500&q=80',
    verified: true,
    services: [
      {
        id: 'srv-3',
        name: 'Tiêm Vắc-xin 7 Bệnh Chó / 4 Bệnh Mèo + Cấp Sổ Điện Tử',
        priceVnd: 290000,
        durationMinutes: 30,
      },
      {
        id: 'srv-4',
        name: 'Khám Tổng Quát Định Kỳ & Siêu Âm Ô Bụng',
        priceVnd: 350000,
        durationMinutes: 45,
      },
    ],
  },
];

export const INITIAL_MOBILE_PLACES: MobilePlace[] = [
  {
    id: 'place-1',
    name: 'Công viên Ánh Sáng Vinhomes Grand Park (Khu Bãi Cỏ Nam)',
    category: 'park',
    address: 'Đại lộ Ánh Sáng, Vinhomes Grand Park',
    distanceMeters: 180,
    rating: 4.9,
    features: ['Bãi cỏ rộng thoáng', 'Thùng rác chuyên dụng', 'Đèn chiếu sáng tối'],
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'place-2',
    name: 'Paws & Chill Acoustic Coffee',
    category: 'cafe',
    address: 'Khu Manhattan Glory, Vinhomes Grand Park',
    distanceMeters: 260,
    rating: 4.8,
    features: ['Bát nước miễn phí cho cún', 'Sân vườn mát mẻ', 'Bánh thưởng tươi'],
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'place-3',
    name: 'Đường Dạo Bộ Ven Sông Tắc Nội Khu',
    category: 'park',
    address: 'Phân khu The Beverly — Ven sông',
    distanceMeters: 340,
    rating: 4.85,
    features: ['Gió sông mát rượi', 'Ít xe cộ qua lại', 'Ghế nghỉ chân mỗi 100m'],
    imageUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=500&q=80',
  },
];

export const INITIAL_MOBILE_BOOKINGS: MobileBooking[] = [
  {
    id: 'bk-1',
    partnerId: 'partner-1',
    partnerName: 'PetSpa Bubble & Paws Nội Khu',
    serviceName: 'Combo Tắm Spa Sục Ozone 8 Bước & Vệ Sinh Tai/Móng',
    petName: 'Lu (Golden Retriever)',
    bookingDate: 'Thứ Bảy tuần này',
    bookingTime: '10:00',
    servicePrice: 280000,
    commissionVnd: 33600,
    status: 'confirmed',
    notes: 'Lu hơi nhột ở bàn chân trước, nhờ kỹ thuật viên cắt móng nhẹ tay giúp mẹ Mai nhé!',
  },
];

export const INITIAL_MOBILE_WALK_APPOINTMENTS: MobileWalkAppointment[] = [
  {
    id: 'walk-1',
    partnerName: 'Minh Phạm',
    partnerPetName: 'Bơ (Corgi)',
    proposedTime: 'Hôm nay, 17:45',
    midpointLocationName: 'Bãi cỏ Trung tâm Công viên Ánh Sáng (Cách mỗi bên 180m)',
    distanceFromMidpointMeters: 180,
    status: 'confirmed',
    notes: 'Nhớ mang dây dắt và túi hốt phân tự hủy sinh học nhé!',
  },
];

export const INITIAL_MOBILE_CONVERSATIONS: MobileConversation[] = [
  {
    id: 'conv-circle',
    title: 'Gia đình Lu & Miu (Vòng chăm sóc)',
    subtitle: 'Hùng Lê: Anh vừa cho Lu ăn sáng xong nha!',
    category: 'circle',
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80',
    unreadCount: 1,
    messages: [
      {
        id: 'm-1',
        senderName: 'Hùng Lê (Ba của Lu)',
        isMe: false,
        text: 'Anh vừa cho Lu ăn sáng 200g hạt + ức gà luộc xong nha, Lu ăn hết veo!',
        createdAt: '07:35',
        type: 'text',
      },
      {
        id: 'm-2',
        senderName: 'Mai Nguyễn (Bạn)',
        isMe: true,
        text: 'Tuyệt quá! Chiều nay 17h30 em về dắt Lu ra công viên gặp bé Bơ Corgi.',
        createdAt: '07:40',
        type: 'text',
      },
    ],
  },
  {
    id: 'conv-bo',
    title: 'Minh Phạm — Ba của Bơ (Corgi)',
    subtitle: '📍 Đã chốt lịch hẹn dắt dạo 17:45 tại Trung điểm Công viên Ánh Sáng',
    category: 'match',
    avatarUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=200&q=80',
    unreadCount: 2,
    messages: [
      {
        id: 'm-3',
        senderName: 'Minh Phạm',
        isMe: false,
        text: 'Chào mẹ Lu! Bé Bơ nhà mình đã tiêm đủ 7 bệnh, chiều nay cho 2 bé chạy bộ chung nhé!',
        createdAt: '16:10',
        type: 'text',
      },
      {
        id: 'm-4',
        senderName: 'Mai Nguyễn (Bạn)',
        isMe: true,
        text: '📍 Lịch hẹn dắt dạo Trung điểm (ST_Centroid): Công viên Ánh Sáng lúc 17:45',
        createdAt: '16:15',
        type: 'walk_invite',
      },
    ],
  },
  {
    id: 'conv-spa',
    title: 'PetSpa Bubble & Paws Nội Khu',
    subtitle: 'Đã xác nhận lịch Spa cho Lu lúc 10:00 Thứ Bảy',
    category: 'partner',
    avatarUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=200&q=80',
    unreadCount: 0,
    messages: [
      {
        id: 'm-5',
        senderName: 'PetSpa Bubble & Paws',
        isMe: false,
        text: 'Dạ Spa đã nhận lịch hẹn tắm Ozone cho bé Lu vào 10:00 sáng Thứ Bảy tuần này ạ!',
        createdAt: 'Hôm qua',
        type: 'text',
      },
    ],
  },
];

export const INITIAL_MOBILE_SOS: MobileSosAlert[] = [
  {
    id: 'sos-1',
    ownerName: 'Khánh Hoàng',
    ownerPhone: '0987 654 321',
    petName: 'Coca (Poodle Nâu Đỏ)',
    petAvatar: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?auto=format&fit=crop&w=400&q=80',
    lastSeenAddress: 'Gần cổng S1.02 Vinhomes Grand Park (đeo vòng cổ chuông xanh mint)',
    radiusKm: 3,
    rewardText: 'Hậu tạ 2.000.000đ cho người tìm thấy hoặc giữ giúp bé',
    status: 'active',
    createdAt: '15 phút trước',
    sightingCount: 2,
  },
];

