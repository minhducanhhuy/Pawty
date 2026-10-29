export interface MobilePet {
  id: string;
  name: string;
  species: 'Chó' | 'Mèo';
  breed: string;
  gender: 'Đực' | 'Cái';
  birthDate: string;
  ageLabel: string;
  weightKg: number;
  furColor: string;
  microchipOrMark: string;
  favoriteFood: string;
  allergies: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  isVaccinatedAndRabies: boolean;
  goodHabits: string[];
  cautionHabits: string[];
}

export interface MobilePost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorNickname: string;
  category: 'moment' | 'health_tip' | 'qa_vet' | 'lost_found';
  categoryLabel: string;
  content: string;
  tags: string[];
  mediaUrls: string[];
  mediaType: 'image' | 'video';
  videoDuration?: string;
  reactions: {
    paws: number;
    love: number;
    haha: number;
    wow: number;
    helpful: number;
  };
  userReaction?: 'paws' | 'love' | 'haha' | 'wow' | 'helpful' | null;
  shareCount: number;
  isSaved: boolean;
  comments: {
    id: string;
    authorName: string;
    authorHandle: string;
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export interface PublicUserProfile {
  handle: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
  area: string;
  isPrivate: boolean;
  isFriend: boolean;
  isMatchedOnTinder: boolean;
  followersCount: number;
  friendsCount: number;
  pets: {
    name: string;
    species: 'Chó' | 'Mèo';
    breed: string;
    ageLabel: string;
    weightKg: number;
    isVaccinatedAndRabies: boolean;
  }[];
  galleryUrls: string[];
}

export type TinderIntent = 'dating' | 'playdate' | 'community';

export interface CandidatePetItem {
  id: string;
  name: string;
  species: 'Chó' | 'Mèo';
  breed: string;
  ageLabel: string;
  weightKg: number;
  imageUrl: string;
  isVaccinatedAndRabies: boolean;
}

export interface TinderCandidate {
  id: string;
  ownerName: string;
  ownerHandle: string;
  ownerAge: number;
  gender: 'Nam' | 'Nữ';
  ownerNickname: string;
  avatarUrl: string;
  photoUrls: string[];
  distanceKm: number;
  intent: TinderIntent;
  intentLabel: string;
  lookingFor: string;
  bio: string;
  lifestyle: {
    smoking: string;
    workout: string;
    drinking: string;
    petSummary: string;
    zodiac: string;
    chatStyle: string;
  };
  pets: CandidatePetItem[];
  tags: string[];
  hasLikedMe: boolean;
}

export interface UserTinderSetupProfile {
  age: number;
  gender: 'Nam' | 'Nữ';
  lookingFor: string;
  smoking: string;
  workout: string;
  drinking: string;
  zodiac: string;
  chatStyle: string;
  promptQuote: string;
}

export interface SuggestedPersonCard {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  mutualText: string;
  isFollowing: boolean;
}

export interface MobileAppointment {
  id: string;
  petId: string;
  petName: string;
  serviceName: string;
  providerName: string;
  category: 'Grooming & Spa' | 'Phòng khám Thú y' | 'Khách sạn Thú cưng';
  dateLabel: string;
  timeSlot: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  priceLabel: string;
  location: string;
  notes?: string;
}

export interface MobileService {
  id: string;
  name: string;
  category: 'Grooming & Spa' | 'Phòng khám Thú y' | 'Khách sạn Thú cưng';
  rating: number;
  reviewCount: number;
  distanceKm: number;
  priceRange: string;
  address: string;
  imageUrl: string;
  promoVoucher?: string;
  Packages: {
    name: string;
    price: string;
    duration: string;
  }[];
}

export interface MobileChatRoom {
  id: string;
  partnerName: string;
  partnerHandle: string;
  partnerNickname: string;
  partnerAvatar: string;
  petSummary: string;
  distanceLabel: string;
  isOnline: boolean;
  unreadCount: number;
  matchSource: 'friend' | 'tinder_match' | 'service';
  messages: {
    id: string;
    sender: 'me' | 'them';
    text: string;
    time: string;
  }[];
}

export interface MobileSosAlert {
  id: string;
  petName: string;
  species: 'Chó' | 'Mèo';
  breed: string;
  lastSeenLocation: string;
  lastSeenTime: string;
  distanceKm: number;
  rewardAmount: string;
  contactPhone: string;
  ownerName: string;
  ownerHandle: string;
  status: 'searching' | 'found';
  sightingsCount: number;
  priorityScore: number;
  imageUrl: string;
  description: string;
  sightingReports: {
    id: string;
    reporterName: string;
    reporterPhone: string;
    locationNote: string;
    timeLabel: string;
  }[];
}

export interface MobileNotificationItem {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  type: 'social' | 'appointment' | 'sos' | 'tinder';
  isRead: boolean;
}

export interface VipPlanOption {
  id: string;
  name: string;
  priceLabel: string;
  durationLabel: string;
  badge: string;
  highlightColor: string;
  features: string[];
}

export const SUGGESTED_HASHTAGS: string[] = [
  '#Corgi',
  '#GoldenRetriever',
  '#MeoAnhLongNgan',
  '#DiDaoChieu',
  '#MeoChamThuCung',
  '#TimBanChoiChung',
  '#GocThuY',
  '#KhoanhKhacThuCung',
];

export const INITIAL_SEARCH_HISTORY: string[] = [
  '#GoldenRetriever',
  'Mẹo trị rụng lông mùa nóng',
  'Công viên nội khu',
  'Bác sĩ Trần Minh Khoa',
];

export const TRENDING_SEARCH_SUGGESTIONS: string[] = [
  '#CorgiChayBo',
  '#KetNoiCuoiTuan',
  '#ThucAnHatKhongNguCoc',
  '#SpaThuCungQuan9',
  '#PhongBenhDaiMuaHe',
];

export const SAMPLE_UPLOAD_GALLERY: { id: string; label: string; url: string; type: 'image' | 'video' }[] = [
  {
    id: 'img-1',
    label: 'Cún chạy công viên',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
    type: 'image',
  },
  {
    id: 'img-2',
    label: 'Mèo tắm nắng sáng',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
    type: 'image',
  },
  {
    id: 'img-3',
    label: 'Hội bạn Corgi',
    url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    type: 'image',
  },
  {
    id: 'img-4',
    label: 'Video chạy bộ (0:24)',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    type: 'video',
  },
];

export const INITIAL_SUGGESTED_PEOPLE: SuggestedPersonCard[] = [
  {
    id: 'sug-1',
    name: 'Bùi Tuấn',
    handle: '@buituan',
    avatarUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    mutualText: 'Gợi ý cho bạn',
    isFollowing: false,
  },
  {
    id: 'sug-2',
    name: 'Trần Thành Trung',
    handle: '@tranthanh',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    mutualText: '1 người theo dõi chung',
    isFollowing: false,
  },
  {
    id: 'sug-3',
    name: 'Bảo Ngọc',
    handle: '@baongoc',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    mutualText: 'Nuôi Poodle gần bạn',
    isFollowing: false,
  },
  {
    id: 'sug-4',
    name: 'Lan Anh',
    handle: '@lananh',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    mutualText: '2 người theo dõi chung',
    isFollowing: false,
  },
];

export const INITIAL_USER_TINDER_SETUP: UserTinderSetupProfile = {
  age: 25,
  gender: 'Nữ',
  lookingFor: 'Bất kỳ điều gì có thể · Cùng dắt thú cưng đi dạo',
  smoking: 'Không hút thuốc',
  workout: 'Chạy bộ chiều mỗi ngày cùng cún',
  drinking: 'Uống giao lưu vào cuối tuần',
  zodiac: 'Thiên Bình',
  chatStyle: 'Thích nhắn tin & hẹn cafe thú cưng',
  promptQuote: 'Cuối tuần lý tưởng là sáng uống bạc xỉu, chiều ra bãi cỏ công viên ngắm tụi nhỏ chạy nhảy.',
};

export const VIP_PLAN_OPTIONS: VipPlanOption[] = [
  {
    id: 'plus_weekly',
    name: 'Pawty Plus Tuần',
    priceLabel: '19.000đ',
    durationLabel: '7 ngày',
    badge: 'Khởi đầu',
    highlightColor: '#529471',
    features: [
      'Xem danh sách những người đã thả tim bạn ở mục Kết nối',
      'Quẹt thẻ kéo thả không giới hạn lượt mỗi ngày',
      'Hoàn tác lượt quẹt lỡ tay không giới hạn',
    ],
  },
  {
    id: 'plus_monthly',
    name: 'Pawty Plus Tháng',
    priceLabel: '49.000đ',
    durationLabel: '30 ngày',
    badge: 'Phổ biến nhất',
    highlightColor: '#E06D53',
    features: [
      'Toàn bộ quyền lợi gói Tuần',
      'Đổi vị trí tìm kiếm (Passport) khắp các quận & thành phố',
      'Tăng x3 độ ưu tiên hiển thị hồ sơ trên mục Kết nối',
      '5 lượt Gửi lời chào ưu tiên mỗi tuần',
    ],
  },
  {
    id: 'plus_yearly',
    name: 'Pawty Gold Năm',
    priceLabel: '399.000đ',
    durationLabel: '12 tháng (Tiết kiệm 32%)',
    badge: 'Tiết kiệm nhất',
    highlightColor: '#C88A2E',
    features: [
      'Toàn bộ đặc quyền gói Tháng suốt 365 ngày',
      'Miễn phí 2 lần đăng tin SOS Tìm thú lạc xác thực',
      'Giảm thêm 10% khi đặt lịch Spa & Thú y đối tác',
    ],
  },
];

export const INITIAL_MOBILE_PETS: MobilePet[] = [
  {
    id: 'pet-lu',
    name: 'Lu',
    species: 'Chó',
    breed: 'Golden Retriever',
    gender: 'Đực',
    birthDate: '15/03/2024',
    ageLabel: '2 tuổi',
    weightKg: 28.4,
    furColor: 'Vàng óng',
    microchipOrMark: 'ChipVN-882910 · Đeo bảng tên bạc ở cổ',
    favoriteFood: 'Ức gà luộc, bí đỏ nghiền và súp thưởng cá hồi',
    allergies: 'Không hợp hải sản có vỏ',
    avatarUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80',
    bio: 'Chàng Golden thân thiện, mê chạy bộ công viên mỗi chiều và rất thích chơi ném bóng.',
    isVaccinatedAndRabies: true,
    goodHabits: ['Thân thiện với trẻ nhỏ', 'Biết ngồi chờ hiệu lệnh', 'Không sủa bậy trong thang máy'],
    cautionHabits: ['Hơi phấn khích khi gặp giống Corgi', 'Sợ tiếng sấm lớn'],
  },
  {
    id: 'pet-miu',
    name: 'Miu',
    species: 'Mèo',
    breed: 'Mèo Anh lông ngắn',
    gender: 'Cái',
    birthDate: '20/11/2024',
    ageLabel: '1.5 tuổi',
    weightKg: 4.2,
    furColor: 'Xám xanh',
    microchipOrMark: 'Đeo vòng cổ chuông nhỏ màu hồng phấn',
    favoriteFood: 'Pate cá ngừ, cỏ mèo tươi',
    allergies: 'Không có',
    avatarUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1513360382564-850126167794?auto=format&fit=crop&w=1000&q=80',
    bio: 'Cô mèo điềm tĩnh, thích nằm sưởi nắng ban công và cực kỳ sạch sẽ.',
    isVaccinatedAndRabies: true,
    goodHabits: ['Đi vệ sinh đúng khay cát', 'Không cào sofa', 'Thích được chải lông'],
    cautionHabits: ['Ngại người lạ trong 10 phút đầu'],
  },
];

export const PUBLIC_USER_PROFILES: Record<string, PublicUserProfile> = {
  '@minhpham': {
    handle: '@minhpham',
    name: 'Minh Phạm',
    nickname: 'Mê Corgi chân ngắn',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Thích chụp ảnh phim và dắt Bơ & Mật chạy bộ quanh công viên mỗi chiều.',
    area: 'Vinhomes Grand Park · TP. Thủ Đức',
    isPrivate: false,
    isFriend: true,
    isMatchedOnTinder: true,
    followersCount: 342,
    friendsCount: 128,
    pets: [
      {
        name: 'Bơ',
        species: 'Chó',
        breed: 'Pembroke Welsh Corgi',
        ageLabel: '1.5 tuổi',
        weightKg: 11.5,
        isVaccinatedAndRabies: true,
      },
      {
        name: 'Mật',
        species: 'Mèo',
        breed: 'Mèo Munchkin chân ngắn',
        ageLabel: '1 tuổi',
        weightKg: 3.6,
        isVaccinatedAndRabies: true,
      },
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    ],
  },
  '@bskhoa': {
    handle: '@bskhoa',
    name: 'BS. Trần Minh Khoa',
    nickname: 'Bác sĩ thú y',
    avatarUrl:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    bio: 'Bác sĩ thú y 8 năm kinh nghiệm. Luôn sẵn lòng giải đáp dinh dưỡng và sức khỏe cho chó mèo.',
    area: 'Thảo Điền · TP. Thủ Đức',
    isPrivate: false,
    isFriend: false,
    isMatchedOnTinder: false,
    followersCount: 1850,
    friendsCount: 410,
    pets: [
      {
        name: 'Mực',
        species: 'Chó',
        breed: 'Labrador',
        ageLabel: '3 tuổi',
        weightKg: 26,
        isVaccinatedAndRabies: true,
      },
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    ],
  },
  '@lananh': {
    handle: '@lananh',
    name: 'Lan Anh',
    nickname: 'Yêu mèo Anh',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Hồ sơ cá nhân chế độ riêng tư — Chỉ mở cho bạn bè hoặc người đã Match trên Kết nối.',
    area: 'Masteri Thảo Điền · Quận 2',
    isPrivate: true,
    isFriend: false,
    isMatchedOnTinder: false,
    followersCount: 215,
    friendsCount: 64,
    pets: [
      {
        name: 'Sữa',
        species: 'Mèo',
        breed: 'Scottish Fold',
        ageLabel: '1 tuổi',
        weightKg: 3.8,
        isVaccinatedAndRabies: true,
      },
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
    ],
  },
};

export const INITIAL_MOBILE_POSTS: MobilePost[] = [
  {
    id: 'post-1',
    authorName: 'Minh Phạm',
    authorHandle: '@minhpham',
    authorAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    authorNickname: 'Mê Corgi chân ngắn',
    category: 'moment',
    categoryLabel: 'Khoảnh khắc',
    content:
      'Chiều nay ra bãi cỏ công viên gặp hội bạn chạy vui quên lối về. Vuốt ngang để xem 3 tấm ảnh hoặc chạm vào ảnh để phóng to nhé!',
    tags: ['#Corgi', '#DiDaoChieu', '#TimBanChoiChung'],
    mediaUrls: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    ],
    mediaType: 'image',
    reactions: { paws: 42, love: 19, haha: 6, wow: 2, helpful: 4 },
    userReaction: 'paws',
    shareCount: 14,
    isSaved: false,
    comments: [
      {
        id: 'c-1',
        authorName: 'Lan Anh',
        authorHandle: '@lananh',
        content: 'Nhìn tụi nhỏ chạy trên cỏ cưng quá chừng!',
        createdAt: '15 phút trước',
      },
    ],
    createdAt: '25 phút trước',
  },
  {
    id: 'post-2',
    authorName: 'BS. Trần Minh Khoa',
    authorHandle: '@bskhoa',
    authorAvatar:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    authorNickname: 'Bác sĩ thú y',
    category: 'health_tip',
    categoryLabel: 'Chia sẻ',
    content:
      'Video ngắn 24 giây hướng dẫn cách kiểm tra phản xạ bàn chân và làm mát đúng cách cho chó mèo sau khi đi dạo mùa nắng nóng.',
    tags: ['#GocThuY', '#MeoChamThuCung'],
    mediaUrls: [
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=900&q=80',
    ],
    mediaType: 'video',
    videoDuration: '0:24',
    reactions: { paws: 58, love: 31, haha: 0, wow: 8, helpful: 64 },
    userReaction: null,
    shareCount: 39,
    isSaved: true,
    comments: [],
    createdAt: '2 giờ trước',
  },
  {
    id: 'post-3',
    authorName: 'Lan Anh',
    authorHandle: '@lananh',
    authorAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    authorNickname: 'Yêu mèo Anh',
    category: 'qa_vet',
    categoryLabel: 'Khoảnh khắc',
    content:
      'Mọi người ơi, bé mèo nhà mình dạo này hơi kén hạt khô, trộn thêm súp thưởng cá hồi vào có sợ bé bỏ hạt luôn không nhỉ?',
    tags: ['#MeoAnhLongNgan', '#MeoChamThuCung'],
    mediaUrls: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80',
    ],
    mediaType: 'image',
    reactions: { paws: 18, love: 9, haha: 2, wow: 0, helpful: 11 },
    userReaction: null,
    shareCount: 5,
    isSaved: false,
    comments: [],
    createdAt: '4 giờ trước',
  },
];

export const INITIAL_TINDER_CANDIDATES: TinderCandidate[] = [
  {
    id: 'tinder-1',
    ownerName: 'Khánh Linh',
    ownerHandle: '@khanhlinh',
    ownerAge: 23,
    gender: 'Nữ',
    ownerNickname: 'Mê mèo & Corgi',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    photoUrls: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
    ],
    distanceKm: 1.4,
    intent: 'dating',
    intentLabel: 'Hẹn hò & Cùng dắt thú cưng',
    lookingFor: 'Bất kỳ điều gì có thể · Tìm người hợp gu cùng yêu thú cưng',
    bio: 'Nuôi 1 bé mèo Anh và 1 bé Corgi siêu quấn người. Cuối tuần thích đi cafe pet-friendly và chụp ảnh phim.',
    lifestyle: {
      smoking: 'Không hút thuốc',
      workout: 'Thỉnh thoảng',
      drinking: 'Uống giao lưu vào cuối tuần',
      petSummary: '1 Chó Corgi & 1 Mèo Anh',
      zodiac: 'Bảo Bình',
      chatStyle: 'Nghiện nhắn tin',
    },
    pets: [
      {
        id: 'cp-1a',
        name: 'Mochi',
        species: 'Mèo',
        breed: 'Mèo Anh lông ngắn',
        ageLabel: '1.5 tuổi',
        weightKg: 4.1,
        imageUrl:
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
        isVaccinatedAndRabies: true,
      },
      {
        id: 'cp-1b',
        name: 'Bơ',
        species: 'Chó',
        breed: 'Pembroke Corgi',
        ageLabel: '2 tuổi',
        weightKg: 11.2,
        imageUrl:
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
        isVaccinatedAndRabies: true,
      },
    ],
    tags: ['Độc thân', 'Nuôi 2 bé', 'Hay đi cafe pet'],
    hasLikedMe: true,
  },
  {
    id: 'tinder-2',
    ownerName: 'Minh Phạm',
    ownerHandle: '@minhpham',
    ownerAge: 27,
    gender: 'Nam',
    ownerNickname: 'Mê Corgi chân ngắn',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    photoUrls: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529472119196-cb724127a98e?auto=format&fit=crop&w=900&q=80',
    ],
    distanceKm: 0.5,
    intent: 'playdate',
    intentLabel: 'Tìm bạn chơi chung cho thú cưng',
    lookingFor: 'Tìm bạn cún/mèo đi dạo công viên nội khu mỗi chiều 17h30',
    bio: 'Nhà mình có 2 bé cún và 1 bé mèo cực kỳ thân thiện, muốn tìm hội bạn chạy bộ quanh hồ ánh sáng.',
    lifestyle: {
      smoking: 'Không hút thuốc',
      workout: 'Chạy bộ mỗi ngày',
      drinking: 'Uống giao lưu dịp lễ',
      petSummary: '2 Chó & 1 Mèo',
      zodiac: 'Sư Tử',
      chatStyle: 'Trả lời nhanh',
    },
    pets: [
      {
        id: 'cp-2a',
        name: 'Bơ',
        species: 'Chó',
        breed: 'Pembroke Corgi',
        ageLabel: '1.5 tuổi',
        weightKg: 11.5,
        imageUrl:
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
        isVaccinatedAndRabies: true,
      },
      {
        id: 'cp-2b',
        name: 'Simba',
        species: 'Chó',
        breed: 'Samoyed trắng tuyết',
        ageLabel: '2 tuổi',
        weightKg: 21.0,
        imageUrl:
          'https://images.unsplash.com/photo-1529472119196-cb724127a98e?auto=format&fit=crop&w=600&q=80',
        isVaccinatedAndRabies: true,
      },
      {
        id: 'cp-2c',
        name: 'Mật',
        species: 'Mèo',
        breed: 'Mèo Munchkin',
        ageLabel: '8 tháng',
        weightKg: 3.2,
        imageUrl:
          'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
        isVaccinatedAndRabies: false,
      },
    ],
    tags: ['Đi dạo 17h30', 'Sân cỏ nội khu', 'Nuôi 3 bé'],
    hasLikedMe: true,
  },
  {
    id: 'tinder-3',
    ownerName: 'Hoàng Nam',
    ownerHandle: '@hoangnam',
    ownerAge: 26,
    gender: 'Nam',
    ownerNickname: 'Thích chạy bộ cùng cún',
    avatarUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80',
    photoUrls: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529472119196-cb724127a98e?auto=format&fit=crop&w=900&q=80',
    ],
    distanceKm: 1.8,
    intent: 'community',
    intentLabel: 'Giao lưu kinh nghiệm nuôi thú',
    lookingFor: 'Giao lưu hội nuôi chó lớn và chia sẻ kinh nghiệm chăm lông',
    bio: 'Làm thiết kế đồ họa, chiều nào cũng rảnh từ 5h30. Rất vui được làm quen với các bạn cùng khu.',
    lifestyle: {
      smoking: 'Đang cố gắng bỏ',
      workout: 'Tập gym 4 buổi/tuần',
      drinking: 'Uống giao lưu vào cuối tuần',
      petSummary: 'Chó Samoyed & Golden',
      zodiac: 'Nhân Mã',
      chatStyle: 'Hài hước, nhiệt tình',
    },
    pets: [
      {
        id: 'cp-3a',
        name: 'Tuyết',
        species: 'Chó',
        breed: 'Samoyed',
        ageLabel: '2 tuổi',
        weightKg: 22.5,
        imageUrl:
          'https://images.unsplash.com/photo-1529472119196-cb724127a98e?auto=format&fit=crop&w=600&q=80',
        isVaccinatedAndRabies: true,
      },
      {
        id: 'cp-3b',
        name: 'Gấu',
        species: 'Chó',
        breed: 'Alaska Malamute',
        ageLabel: '2.5 tuổi',
        weightKg: 32.0,
        imageUrl:
          'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
        isVaccinatedAndRabies: true,
      },
    ],
    tags: ['Hội Samoyed', 'Cafe cuối tuần', 'Chăm lông'],
    hasLikedMe: true,
  },
];

export const INITIAL_MOBILE_APPOINTMENTS: MobileAppointment[] = [
  {
    id: 'apt-1',
    petId: 'pet-lu',
    petName: 'Lu',
    serviceName: 'Gói Tắm Spa Thảo Dược & Cắt Tỉa Lông',
    providerName: 'Pawty Grooming & Spa Studio',
    category: 'Grooming & Spa',
    dateLabel: 'Thứ Bảy, 31/10',
    timeSlot: '10:00 - 11:30',
    status: 'confirmed',
    priceLabel: '320.000đ',
    location: 'Shophouse S2.05 Vinhomes Grand Park',
    notes: 'Cắt gọn lông bàn chân và vệ sinh tai kỹ cho bé.',
  },
  {
    id: 'apt-2',
    petId: 'pet-miu',
    petName: 'Miu',
    serviceName: 'Khám sức khỏe tổng quát & Siêu âm định kỳ',
    providerName: 'Phòng khám Thú y Quốc tế PetCare',
    category: 'Phòng khám Thú y',
    dateLabel: 'Chủ Nhật, 08/11',
    timeSlot: '15:00 - 15:45',
    status: 'pending',
    priceLabel: '450.000đ',
    location: 'Đường Nguyễn Xiển, TP. Thủ Đức',
    notes: 'Kiểm tra răng miệng và tư vấn chế độ ăn kiểm soát cân nặng.',
  },
];

export const INITIAL_MOBILE_SERVICES: MobileService[] = [
  {
    id: 'srv-1',
    name: 'Pawty Grooming & Spa Studio',
    category: 'Grooming & Spa',
    rating: 4.9,
    reviewCount: 248,
    distanceKm: 0.3,
    priceRange: '250.000đ - 550.000đ',
    address: 'Shophouse S2.05 Vinhomes Grand Park',
    imageUrl:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    promoVoucher: 'Ưu đãi 35% cho lần đặt lịch đầu tiên',
    Packages: [
      { name: 'Tắm thảo dược khử mùi 8 bước', price: '250.000đ', duration: '60 phút' },
      { name: 'Combo Tắm + Cắt tỉa tạo kiểu', price: '420.000đ', duration: '90 phút' },
    ],
  },
  {
    id: 'srv-2',
    name: 'Phòng khám Thú y Quốc tế PetCare',
    category: 'Phòng khám Thú y',
    rating: 4.8,
    reviewCount: 412,
    distanceKm: 1.2,
    priceRange: '200.000đ - 900.000đ',
    address: '128 Nguyễn Xiển, TP. Thủ Đức',
    imageUrl:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80',
    promoVoucher: 'Miễn phí khám lâm sàng khi đặt lịch trước',
    Packages: [
      { name: 'Gói tiêm phòng 7 bệnh + Dại', price: '380.000đ', duration: '30 phút' },
      { name: 'Khám tổng quát & Xét nghiệm máu', price: '650.000đ', duration: '45 phút' },
    ],
  },
  {
    id: 'srv-3',
    name: 'Khách sạn Thú cưng Cozy Paws Resort',
    category: 'Khách sạn Thú cưng',
    rating: 4.9,
    reviewCount: 164,
    distanceKm: 2.1,
    priceRange: '300.000đ/đêm',
    address: 'Khu biệt thự Manhattan, Vinhomes Grand Park',
    imageUrl:
      'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80',
    Packages: [
      { name: 'Phòng tiêu chuẩn có camera 24/7', price: '300.000đ/đêm', duration: '24 giờ' },
      { name: 'Phòng VIP có sân cỏ riêng', price: '500.000đ/đêm', duration: '24 giờ' },
    ],
  },
];

export const INITIAL_MOBILE_CHATS: MobileChatRoom[] = [
  {
    id: 'chat-1',
    partnerName: 'Minh Phạm',
    partnerHandle: '@minhpham',
    partnerNickname: 'Mê Corgi chân ngắn',
    partnerAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    petSummary: 'Bơ (Corgi) & Simba (Samoyed)',
    distanceLabel: 'Cách 350m',
    isOnline: true,
    unreadCount: 1,
    matchSource: 'tinder_match',
    messages: [
      {
        id: 'm-1',
        sender: 'them',
        text: 'Chào Mai! Hai tụi mình vừa tương hợp trên mục Kết nối nè.',
        time: '16:20',
      },
      {
        id: 'm-2',
        sender: 'me',
        text: 'Chào Minh nha, bé Bơ và Simba nhìn cưng quá! Chiều nay bạn có cho tụi nhỏ ra công viên không?',
        time: '16:22',
      },
      {
        id: 'm-3',
        sender: 'them',
        text: 'Có nha, tầm 17h45 mình ra khu thảm cỏ gần hồ nước nhé!',
        time: '16:25',
      },
    ],
  },
  {
    id: 'chat-2',
    partnerName: 'Pawty Grooming & Spa Studio',
    partnerHandle: '@pawtyspa',
    partnerNickname: 'Dịch vụ Spa & Cắt tỉa',
    partnerAvatar:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=300&q=80',
    petSummary: 'Hỗ trợ đặt lịch tắm & cắt tỉa cho bé Lu',
    distanceLabel: 'Cách 300m',
    isOnline: true,
    unreadCount: 1,
    matchSource: 'service',
    messages: [
      {
        id: 'm-s1',
        sender: 'them',
        text: 'Chào chị Mai! Lịch tắm thảo dược của bé Lu vào 10:00 Thứ Bảy đã được xác nhận. Spa có chuẩn bị sẵn bánh thưởng cho bé ạ!',
        time: '14:10',
      },
    ],
  },
  {
    id: 'chat-3',
    partnerName: 'Phòng khám Thú y Quốc tế PetCare',
    partnerHandle: '@petcarevet',
    partnerNickname: 'Dịch vụ Thú y 24/7',
    partnerAvatar:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    petSummary: 'Tư vấn sức khỏe & Lịch khám định kỳ',
    distanceLabel: 'Cách 1.2km',
    isOnline: true,
    unreadCount: 0,
    matchSource: 'service',
    messages: [
      {
        id: 'm-201',
        sender: 'me',
        text: 'Bác sĩ ơi, bé Miu nhà em mới đổi sang hạt cá hồi thì nên trộn tỷ lệ sao ạ?',
        time: 'Hôm qua',
      },
      {
        id: 'm-202',
        sender: 'them',
        text: 'Chào bạn, 3 ngày đầu bạn pha 25% hạt mới với 75% hạt cũ để hệ tiêu hóa của bé quen dần nhé.',
        time: 'Hôm qua',
      },
    ],
  },
];

export const INITIAL_MOBILE_SOS: MobileSosAlert[] = [
  {
    id: 'sos-1',
    petName: 'Mochi',
    species: 'Chó',
    breed: 'Pomeranian (Phốc Sóc Trắng)',
    lastSeenLocation: 'Cổng công viên ánh sáng Vinhomes Grand Park',
    lastSeenTime: '35 phút trước',
    distanceKm: 0.4,
    rewardAmount: '3.000.000đ',
    contactPhone: '0918 222 889',
    ownerName: 'Gia đình chị Thảo',
    ownerHandle: '@thaopom',
    status: 'searching',
    sightingsCount: 2,
    priorityScore: 138,
    imageUrl:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
    description:
      'Bé lông trắng xù, đeo vòng cổ màu xanh mint có khắc tên Mochi. Bé hơi nhát người lạ, xin đừng đuổi mạnh.',
    sightingReports: [
      {
        id: 'sr-1',
        reporterName: 'Anh Tuấn (Cư dân S1.02)',
        reporterPhone: '0903 441 220',
        locationNote: 'Vừa thấy bé chạy qua lối đi bộ tòa S1.02 hướng về phía siêu thị.',
        timeLabel: '10 phút trước',
      },
    ],
  },
  {
    id: 'sos-2',
    petName: 'Cam',
    species: 'Mèo',
    breed: 'Mèo Anh lông ngắn màu vàng',
    lastSeenLocation: 'Sảnh tòa S3.01 Vinhomes Grand Park',
    lastSeenTime: '2 giờ trước',
    distanceKm: 1.1,
    rewardAmount: '1.500.000đ',
    contactPhone: '0987 654 321',
    ownerName: 'Bạn Đức Anh',
    ownerHandle: '@ducanh',
    status: 'searching',
    sightingsCount: 1,
    priorityScore: 105,
    imageUrl:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
    description:
      'Bé mèo màu vàng cam, đeo chuông nhỏ màu đỏ. Ai nhìn thấy xin giữ giúp và bấm nút Báo vừa nhìn thấy.',
    sightingReports: [],
  },
  {
    id: 'sos-my-sample',
    petName: 'Lu',
    species: 'Chó',
    breed: 'Golden Retriever',
    lastSeenLocation: 'Khu vực tiểu khu Manhattan Vinhomes Grand Park',
    lastSeenTime: '15 phút trước',
    distanceKm: 0.2,
    rewardAmount: '2.000.000đ',
    contactPhone: '0909 123 456',
    ownerName: 'Mai Nguyễn',
    ownerHandle: '@mainguyen',
    status: 'searching',
    sightingsCount: 1,
    priorityScore: 145,
    imageUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    description:
      'Tin đăng của bạn: Bé Lu chạy theo bướm quanh khu Manhattan, có đeo bảng tên số điện thoại ở cổ.',
    sightingReports: [
      {
        id: 'sr-my-1',
        reporterName: 'Chú Bảo vệ cổng số 2',
        reporterPhone: '0901 888 999',
        locationNote: 'Thấy bé đang đứng gần bồn hoa ngã tư Manhattan.',
        timeLabel: '5 phút trước',
      },
    ],
  },
];

export const INITIAL_MOBILE_NOTIFICATIONS: MobileNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Tương hợp mới trên Kết nối!',
    body: 'Khánh Linh & 2 bé Mochi, Bơ vừa thả tim cho hồ sơ của bạn.',
    timeLabel: '5 phút trước',
    type: 'tinder',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'Lịch hẹn Spa ngày mai',
    body: 'Pawty Grooming & Spa Studio đã xác nhận lịch tắm thảo dược cho bé Lu lúc 10:00.',
    timeLabel: '1 giờ trước',
    type: 'appointment',
    isRead: false,
  },
];
