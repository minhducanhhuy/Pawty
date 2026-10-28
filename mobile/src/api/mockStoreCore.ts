import { User, Pet, NativeAd, MomentItem, MomentComment, PublicConfig } from '../types';

export const DEFAULT_CONFIG: PublicConfig = {
  tiers: {
    free: { dailySwipes: 20, superLikesPerDay: 1, maxPhotos: 5, maxPets: 1, priceMonthVnd: 0, priceYearVnd: 0 },
    vip: { dailySwipes: 9999, superLikesPerDay: 5, maxPhotos: 999, maxPets: 2, priceMonthVnd: 49000, priceYearVnd: 399000 },
    vip_plus: { dailySwipes: 9999, superLikesPerDay: 10, maxPhotos: 999, maxPets: 5, priceMonthVnd: 99000, priceYearVnd: 799000 },
  },
  products: {
    boost: { priceVnd: 15000, durationMinutes: 30 },
    superLikePack: { priceVnd: 29000, count: 5 },
    boostPack: { priceVnd: 39000, count: 3 },
  },
  sos: { priceVnd: 39000, radiusKm: 3 },
  radar: { minRadius: 500, maxRadius: 3000, adEveryMin: 5, adEveryMax: 7 },
  i18n: ['vi', 'en'],
};

export const mockCoreStore: {
  user: User;
  myPets: Pet[];
  radarPets: Pet[];
  ads: NativeAd[];
  moments: MomentItem[];
  comments: Record<string, MomentComment[]>;
  blockedUsers: { id: string; fullName: string; avatarUrl: string; phone: string }[];
  lastSwipedPet: Pet | null;
} = {
  user: {
    id: 'usr_sen_01', phone: '0908123456', fullName: 'Minh Khôi (Nhà Sen Bơ)', nickname: 'Nhà Sen Bơ',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    condoComplex: 'Vinhomes Central Park - Park 3', latitude: 10.7951, longitude: 106.7218,
    isVerified: true, isVip: false, vipTier: 'free', vipExpiresAt: null,
    dailySwipesCount: 2, swipesLeft: 18, superLikesToday: 0, superLikeBalance: 2, superLikesLeft: 3,
    boostBalance: 1, boostExpiresAt: null, isWalkingNow: false, walkingUntil: null,
    referralCode: 'PAWTYBO88', walkStreakDays: 4, lastWalkDate: '2026-10-27', totalWalkMeters: 6420,
    isDistanceHidden: false, flakeReportsCount: 0, isBannedSwiping: false, banUntil: null, locale: 'vi',
    notificationPrefs: { match: true, message: true, appointment: true, sos: true, reminder: true, event: true },
  },
  myPets: [
    {
      id: 'pet_bo_01', userId: 'usr_sen_01', name: 'Bơ Lùn', species: 'dog', breed: 'Corgi Pembroke',
      gender: 'male', isNeutered: true, ageYears: 1, ageMonths: 6, weightKg: 11.2, size: 'medium',
      isVaccinated: true, lastVaccineDate: '15/01/2026',
      vaccineDetails: 'Vắc-xin 7 bệnh Vanguard Plus & Phòng Dại - Thú Y PetCare',
      vaccineStatus: 'verified', vaccineProofUrls: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80'],
      vaccineNextDueDate: '15/01/2027', isSafePet: true, isPrimary: true,
      bio: 'Mông trái tim chân ngắn 1 khúc, siêu mê xúc xích nướng Landmark!',
      tags: ['Tăng động', 'Thân thiện', 'Mê xúc xích'],
      habitsGood: ['Đi vệ sinh đúng bãi cỏ', 'Ngồi chờ hiệu lệnh'],
      habitsBad: ['Hay sủa xe máy nẹt pô', 'Thấy bồ câu là rượt'],
      avatarUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
      photos: [], ownerName: 'Minh Khôi', ownerPhone: '0908***456', condoComplex: 'Vinhomes Central Park - Park 3',
    },
  ],
  radarPets: [
    {
      id: 'pet_mochi_02', userId: 'usr_sen_02', name: 'Mochi', species: 'dog', breed: 'Shiba Inu',
      gender: 'female', isNeutered: true, ageYears: 2, ageMonths: 2, weightKg: 9.8, size: 'medium',
      isVaccinated: true, lastVaccineDate: '02/02/2026', vaccineDetails: 'Mũi nhắc 7 bệnh & Dại PetCare Thảo Điền',
      vaccineStatus: 'verified', vaccineProofUrls: [], vaccineNextDueDate: '02/02/2027', isSafePet: true, isPrimary: true,
      bio: 'Nữ hoàng drama Park 3. Mặt lúc nào cũng cười nhưng ghét bị đụng đuôi!',
      tags: ['Ngoan ngoãn', 'Quý tộc', 'Thánh biểu cảm'],
      habitsGood: ['Không cắn đồ', 'Dắt dây rất ngoan'], habitsBad: ['Hơi chảnh với cún nhỏ', 'Sợ tiếng máy sấy'],
      avatarUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      photos: [], ownerName: 'Thanh Hằng', ownerPhone: '0912***889', condoComplex: 'Vinhomes Central Park - Park 3', ownerIsVip: true,
    },
    {
      id: 'pet_bunbo_03', userId: 'usr_sen_03', name: 'Bún Bò', species: 'dog', breed: 'Poodle Teacup',
      gender: 'female', isNeutered: false, ageYears: 1, ageMonths: 1, weightKg: 3.4, size: 'small',
      isVaccinated: true, lastVaccineDate: '10/12/2025', vaccineDetails: 'Đầy đủ sổ tiêm ngừa 7 bệnh & Dại',
      vaccineStatus: 'verified', vaccineProofUrls: [], vaccineNextDueDate: '10/12/2026', isSafePet: true, isPrimary: true,
      bio: 'Tuy bé hạt tiêu nhưng thích chạy đua bãi cỏ ven sông mỗi chiều.',
      tags: ['Điệu đà', 'Bám đuôi', 'Tăng động'],
      habitsGood: ['Biết đi 2 chân', 'Thích thơm má'], habitsBad: ['Hay nhõng nhẽo', 'Nhảy vào lòng người lạ'],
      avatarUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
      photos: [], ownerName: 'Hoàng Long', ownerPhone: '0987***321', condoComplex: 'Landmark Plus', ownerIsVip: false,
    },
    {
      id: 'pet_banhbao_04', userId: 'usr_sen_04', name: 'Bánh Bao', species: 'cat', breed: 'Mèo Anh Lông Ngắn',
      gender: 'male', isNeutered: true, ageYears: 2, ageMonths: 8, weightKg: 5.8, size: 'medium',
      isVaccinated: true, lastVaccineDate: '18/01/2026', vaccineDetails: 'Vaccine 4 bệnh mèo PureVax & Dại',
      vaccineStatus: 'verified', vaccineProofUrls: [], vaccineNextDueDate: '18/01/2027', isSafePet: true, isPrimary: true,
      bio: 'Má phính như 2 bánh bao hấp. Thích ngồi xe đẩy dạo hoàng hôn.',
      tags: ['Lười vận động', 'Quý tộc', 'Mê pate'],
      habitsGood: ['Không cào cấu', 'Cho ẵm bồng thoải mái'], habitsBad: ['Ngủ 18 tiếng/ngày', 'Ghét tiếng còi xe'],
      avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      photos: [], ownerName: 'Lan Phương', ownerPhone: '0933***112', condoComplex: 'The Sun Avenue', ownerIsVip: true,
    },
  ],
  ads: [
    {
      id: 'ad_spa_01', partnerId: 'partner_01', businessName: 'Pawty Luxury Pet Spa & Grooming',
      title: 'Tắm Khoáng Nóng & Cắt Tỉa Chuẩn Nhật Cho Boss',
      description: 'Giảm ngay 35% combo Spa 9 bước khử mùi & dưỡng lông mềm mượt nội khu Landmark.',
      imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80',
      discountPercent: 35, voucherQuota: 100, vouchersIssued: 42, radiusMeters: 1500,
    },
  ],
  moments: [
    {
      id: 'm_01', petId: 'pet_bo_01', petName: 'Bơ Lùn',
      petAvatarUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=200&q=80',
      condoComplex: 'Vinhomes Central Park',
      mediaUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
      mediaType: 'image', caption: 'Đang ngắm hoàng hôn thì phát hiện quầy xúc xích nướng Landmark 5 🌭👀',
      likesCount: 42, commentsCount: 2, isLiked: false, createdAt: '2 giờ trước',
    },
    {
      id: 'm_02', petId: 'pet_mochi_02', petName: 'Mochi',
      petAvatarUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=200&q=80',
      condoComplex: 'Park 3',
      mediaUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      mediaType: 'image', caption: 'Khuôn mặt khi bị bắt đi tắm sau một buổi quẩy bãi cỏ ướt 🛁',
      likesCount: 68, commentsCount: 1, isLiked: true, createdAt: '4 giờ trước',
    },
  ],
  comments: {
    m_01: [
      { id: 'c_1', momentId: 'm_01', userId: 'usr_sen_02', userName: 'Thanh Hằng (Sen Mochi)', userAvatarUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=100&q=80', text: 'Nhìn cái mông Corgi cưng xỉu luôn á 😂', createdAt: '1 giờ trước' },
      { id: 'c_2', momentId: 'm_01', userId: 'usr_sen_03', userName: 'Hoàng Long', userAvatarUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=80', text: 'Tối nay 7h30 ra bãi cỏ ven sông chơi không Bơ ơi!', createdAt: '30 phút trước' },
    ],
  },
  blockedUsers: [],
  lastSwipedPet: null,
};
