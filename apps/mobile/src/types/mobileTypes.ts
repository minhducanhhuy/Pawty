export interface PetVaccineRecord {
  id: string;
  vaccineName: string;
  name?: string;
  date: string;
  doseNumber: string | number;
  clinicName?: string;
  clinic?: string;
  isSafeVerified?: boolean;
}

export interface PetWeightEntry {
  month: string;
  weightKg: number;
}

export interface MobilePet {
  id: string;
  ownerId?: string;
  name: string;
  species: 'Chó' | 'Mèo' | 'Khác';
  customSpecies?: string;
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
  isSterilized?: boolean;
  isVaccinatedAndRabies: boolean;
  goodHabits: string[];
  cautionHabits: string[];
  galleryUrls?: string[];
  weightHistory?: PetWeightEntry[];
  vaccineRecords?: PetVaccineRecord[];
  dewormingHistory?: string;
  medicalHistory?: string;
  likesCount?: number;
  isLiked?: boolean;
}

export interface MobilePost {
  id: string;
  authorId?: string;
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
    authorAvatar?: string;
    likesCount?: number;
    isLiked?: boolean;
    replies?: {
      id: string;
      authorName: string;
      authorHandle: string;
      authorAvatar?: string;
      content: string;
      replyToName?: string;
      createdAt: string;
      likesCount?: number;
      isLiked?: boolean;
    }[];
  }[];
  createdAt: string;
}

export type FriendRelationshipStatus =
  | 'none'
  | 'pending_outgoing'
  | 'pending_incoming'
  | 'accepted';

export interface PublicUserProfile {
  id?: string;
  handle: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  coverUrl?: string;
  gender?: string;
  age?: number;
  birthDate?: string;
  zodiac?: string;
  mbti?: string;
  occupation?: string;
  education?: string;
  noteBubble?: string;
  bio: string;
  area: string;
  isPrivate: boolean;
  isFriend: boolean;
  friendStatus: FriendRelationshipStatus;
  isFollowing: boolean;
  isMatchedOnTinder: boolean;
  followersCount: number;
  followingCount?: number;
  friendsCount: number;
  likesCount?: number;
  pets: MobilePet[];
  posts?: MobilePost[];
  galleryUrls: string[];
}

export type TinderIntent = 'playdate' | 'dating' | 'community';

export interface CandidatePetItem {
  id: string;
  name: string;
  species: 'Chó' | 'Mèo' | 'Khác';
  customSpecies?: string;
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
  gender: 'Nam' | 'Nữ' | 'Khác';
  ownerNickname: string;
  avatarUrl: string;
  photoUrls: string[];
  distanceKm: number;
  area?: string;
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
  displayName?: string;
  bio?: string;
  datingPetId?: string;
  age: number;
  gender: 'Nam' | 'Nữ' | 'Khác';
  intent: TinderIntent;
  lookingFor: string;
  smoking: string;
  workout: string;
  drinking: string;
  zodiac: string;
  chatStyle: string;
  promptQuote: string;
  photoUrls?: string[];
  photos?: string[];
}

export interface SuggestedPersonCard {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  mutualText: string;
  isFollowing: boolean;
}

export interface MobileChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  mediaUrl?: string;
  time: string;
  isRead?: boolean;
  createdAt?: string | Date;
}

export interface MobileChatRoom {
  id: string;
  partnerId?: string;
  partnerName: string;
  partnerHandle: string;
  partnerNickname: string;
  partnerAvatar: string;
  petSummary: string;
  distanceLabel: string;
  isOnline: boolean;
  canMessage?: boolean;
  isFriend?: boolean;
  unreadCount: number;
  matchSource: 'friend' | 'tinder_match' | 'service';
  chatType?: 'dating' | 'social';
  candidateProfile?: TinderCandidate;
  messages: MobileChatMessage[];
}

export interface MobileSosAlert {
  id: string;
  petName: string;
  species: 'Chó' | 'Mèo' | 'Khác';
  customSpecies?: string;
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

export type NotificationCategory = 'friend' | 'follow' | 'sos' | 'system';

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'follow'
  | 'match'
  | 'sos_alert'
  | 'sos_sighting'
  | 'post_reaction'
  | 'post_comment'
  | 'new_post'
  | 'social'
  | 'appointment'
  | 'sos'
  | 'tinder'
  | 'system';

export interface MobileNotificationItem {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  actionPayload?: {
    category?: NotificationCategory;
    senderId?: string;
    senderHandle?: string;
    senderName?: string;
    senderAvatar?: string;
    status?: 'pending' | 'accepted' | 'declined' | 'matched';
    postId?: string;
    conversationId?: string;
    sosAlertId?: string;
  };
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

export const TINDER_PURPOSE_OPTIONS: {
  intent: TinderIntent;
  label: string;
  shortLabel: string;
  desc: string;
}[] = [
  {
    intent: 'playdate',
    label: 'Cùng dắt thú cưng đi dạo',
    shortLabel: 'Tìm bạn dắt dạo',
    desc: 'Ghép đôi cún/mèo đi dạo công viên nội khu cùng khung giờ',
  },
  {
    intent: 'dating',
    label: 'Hẹn hò cho người yêu thú',
    shortLabel: 'Hẹn hò chủ nuôi',
    desc: 'Kết nối chủ nuôi độc thân có chung tình yêu động vật',
  },
  {
    intent: 'community',
    label: 'Giao lưu hội nuôi thú cưng',
    shortLabel: 'Giao lưu cộng đồng',
    desc: 'Kết bạn hàng xóm chia sẻ kinh nghiệm chăm sóc Boss',
  },
];

export function resolveTinderIntentFromLabel(raw?: string | null): TinderIntent {
  if (!raw) return 'playdate';
  const lowered = raw.trim().toLowerCase();
  if (lowered === 'dating' || lowered.includes('hẹn hò')) return 'dating';
  if (lowered === 'community' || lowered.includes('giao lưu') || lowered.includes('cộng đồng')) {
    return 'community';
  }
  return 'playdate';
}

export function getTinderPurposeLabel(intent: TinderIntent): string {
  return (
    TINDER_PURPOSE_OPTIONS.find((opt) => opt.intent === intent)?.label ||
    'Cùng dắt thú cưng đi dạo'
  );
}

export const EMPTY_USER_TINDER_SETUP: UserTinderSetupProfile = {
  displayName: '',
  bio: '',
  datingPetId: '',
  age: 24,
  gender: 'Nữ',
  intent: 'playdate',
  lookingFor: 'Cùng dắt thú cưng đi dạo',
  smoking: 'Không hút thuốc',
  workout: 'Dắt thú đi bộ mỗi chiều',
  drinking: 'Không uống rượu bia',
  zodiac: 'Sư Tử',
  chatStyle: 'Thân thiện, phản hồi nhanh',
  promptQuote: '',
  photoUrls: [],
  photos: [],
};

/* ========================================================================== */
/* SELECTOR OPTIONS FOR OWNER PROFILE, PET PROFILE, TINDER & SOS              */
/* ========================================================================== */

export const LIVING_AREA_OPTIONS: string[] = [
  'Vinhomes Grand Park, TP. Thủ Đức',
  'Vinhomes Central Park, Bình Thạnh',
  'Thảo Điền, TP. Thủ Đức (Quận 2)',
  'Sala Đại Quang Minh, TP. Thủ Đức',
  'Phú Mỹ Hưng, Quận 7',
  'Sunrise City, Quận 7',
  'Masteri Thảo Điền, TP. Thủ Đức',
  'Estella Heights, TP. Thủ Đức',
  'Saigon Pearl, Bình Thạnh',
  'Celadon City, Tân Phú',
  'Hà Đô Centrosa, Quận 10',
  'Vinhomes Golden River, Quận 1',
  'Eco Green Sài Gòn, Quận 7',
  'Vinhomes Ocean Park, Hà Nội',
  'Vinhomes Smart City, Hà Nội',
  'Times City, Hai Bà Trưng, Hà Nội',
  'Royal City, Thanh Xuân, Hà Nội',
  'Ecopark, Hưng Yên / Hà Nội',
  'Khu đô thị Ciputra, Tây Hồ, Hà Nội',
  'Sơn Trà / Hải Châu, Đà Nẵng',
];

export const OCCUPATION_OPTIONS: string[] = [
  'UI/UX & Product Designer',
  'Kỹ sư Phần mềm / IT',
  'Marketing & Truyền thông',
  'Tài chính - Ngân hàng',
  'Bác sĩ / Nhân viên Y tế',
  'Bác sĩ Thú y / Chăm sóc Thú cưng',
  'Kiến trúc sư / Nội thất',
  'Kinh doanh tự do / Founder',
  'Giáo viên / Giảng viên',
  'Nhiếp ảnh / Sáng tạo nội dung',
  'Nhân sự / Vận hành (HR & Ops)',
  'Luật / Tư vấn pháp lý',
  'Freelancer làm việc từ xa',
  'Sinh viên Đại học / Cao học',
];

export const EDUCATION_OPTIONS: string[] = [
  'Đại học Quốc gia TP.HCM',
  'Đại học FPT',
  'Đại học RMIT Việt Nam',
  'Đại học Kinh tế TP.HCM (UEH)',
  'Đại học Bách Khoa',
  'Đại học Ngoại thương (FTU)',
  'Đại học Kiến trúc',
  'Đại học Nông Lâm (Thú Y)',
  'Đại học Tôn Đức Thắng',
  'Đại học Văn Lang / HUTECH',
  'Đại học Quốc gia Hà Nội',
  'Thạc sĩ / Sau Đại học',
  'Du học Quốc tế',
  'Tốt nghiệp Đại học / Cao đẳng',
];

export const ZODIAC_OPTIONS: string[] = [
  'Bạch Dương',
  'Kim Ngưu',
  'Song Tử',
  'Cự Giải',
  'Sư Tử',
  'Xử Nữ',
  'Thiên Bình',
  'Bọ Cạp',
  'Nhân Mã',
  'Ma Kết',
  'Bảo Bình',
  'Song Ngư',
];

export const MBTI_OPTIONS: string[] = [
  'ENFP',
  'INFJ',
  'INTJ',
  'ENFJ',
  'INFP',
  'ENTP',
  'INTP',
  'ENTJ',
  'ISFJ',
  'ESFJ',
  'ISTJ',
  'ESTJ',
  'ISFP',
  'ESFP',
  'ISTP',
  'ESTP',
];

export const OWNER_AGE_OPTIONS: string[] = Array.from({ length: 43 }, (_, i) => String(18 + i));

export const OTHER_SPECIES_OPTIONS: string[] = [
  'Thỏ (Rabbit)',
  'Chuột Hamster',
  'Chuột Lang (Guinea Pig)',
  'Sóc Bay (Sugar Glider)',
  'Chim / Vẹt Cảnh',
  'Nhím Kiểng',
  'Rùa Cảnh',
  'Chồn Cảnh (Ferret)',
];

export const PET_AGE_OPTIONS: string[] = [
  '2 tháng',
  '3 tháng',
  '6 tháng',
  '9 tháng',
  '1 tuổi',
  '1.5 tuổi',
  '2 tuổi',
  '3 tuổi',
  '4 tuổi',
  '5 tuổi',
  '6 tuổi',
  '7 tuổi',
  '8 tuổi',
  '9 tuổi',
  '10+ tuổi',
];

export const PET_WEIGHT_OPTIONS: string[] = [
  '0.8',
  '1.2',
  '1.8',
  '2.5',
  '3.2',
  '4.0',
  '4.8',
  '5.5',
  '6.5',
  '7.5',
  '8.5',
  '10.0',
  '12.0',
  '15.0',
  '18.0',
  '22.0',
  '25.0',
  '28.5',
  '32.0',
  '36.0',
  '40.0',
];

export const PET_FUR_COLOR_OPTIONS: string[] = [
  'Vàng kem',
  'Vàng sẫm',
  'Trắng tuyết',
  'Đen tuyền',
  'Nâu Chocolate',
  'Xám xanh',
  'Tam thể',
  'Vàng trắng',
  'Đen trắng (Tuxedo)',
  'Mướp vằn',
  'Nâu đỏ',
  'Bạch kim',
];

export const PET_FOOD_OPTIONS: string[] = [
  'Hạt dinh dưỡng & Ức gà luộc',
  'Hạt khô cao cấp (Royal Canin / Orijen)',
  'Pate tươi & Súp thưởng cá hồi',
  'Thức ăn tươi nấu chín (Thịt bò, bí đỏ)',
  'Chế độ Raw Food / BARF',
  'Rau củ nghiền & Cá biển hấp',
  'Ăn dễ, không kén ăn',
];

export const PET_DEWORMING_OPTIONS: string[] = [
  'Định kỳ 3 tháng/lần (Đúng lịch)',
  'Định kỳ 1 tháng/lần (Bé nhỏ)',
  'Định kỳ 6 tháng/lần',
  'Vừa tẩy giun trong tháng này',
  'Chưa đến lịch tẩy giun tiếp theo',
];

export const PET_MEDICAL_OPTIONS: string[] = [
  'Khỏe mạnh, không có bệnh nền',
  'Dị ứng nhẹ với hải sản / thịt gà',
  'Da nhạy cảm theo mùa',
  'Đang theo dõi chế độ dinh dưỡng riêng',
  'Đã triệt sản, sức khỏe ổn định',
];

export const PET_GOOD_HABIT_OPTIONS: string[] = [
  'Thân thiện với trẻ nhỏ',
  'Hòa đồng với chó mèo lạ',
  'Đi vệ sinh đúng chỗ',
  'Không sủa bậy trong thang máy',
  'Biết nghe lệnh cơ bản (Ngồi, Chờ)',
  'Thích đi dạo công viên',
  'Ngoan khi tắm & cắt tỉa lông',
  'Đeo dây dắt ngoan ngoãn',
];

export const PET_CAUTION_HABIT_OPTIONS: string[] = [
  'Hơi nhút nhát với người lạ',
  'Phấn khích khi gặp bạn mới',
  'Sợ tiếng sấm / pháo hoa lớn',
  'Hay đuổi chim / sóc ngoài công viên',
  'Cần làm quen chậm 2-3 phút đầu',
  'Giữ đồ ăn / đồ chơi riêng',
  'Sợ tiếng còi xe máy lớn',
  'Không có lưu ý đặc biệt',
];

export const PET_VACCINE_NAME_OPTIONS: string[] = [
  'Vắc-xin 7 bệnh (Chó)',
  'Vắc-xin 5 bệnh (Chó)',
  'Vắc-xin 4 bệnh (Mèo)',
  'Vắc-xin Phòng bệnh Dại (Rabies)',
  'Vắc-xin Lepto / Ho cũi chó',
  'Vắc-xin Giảm bạch cầu / FIP',
];

export const PET_DOSE_OPTIONS: string[] = [
  'Mũi 1',
  'Mũi 2',
  'Mũi 3',
  'Nhắc lại hằng năm',
];

export const PET_CLINIC_OPTIONS: string[] = [
  'Thú Y PetCare TP.HCM',
  'Bệnh viện Thú Y PetHealth',
  'Phòng khám Thú Y Sasaki',
  'Bệnh viện Thú Y Quốc Tế Vet24h',
  'Phòng khám Thú Y Nội khu',
  'Bác sĩ Thú Y tại nhà',
];

export const SMOKING_OPTIONS: string[] = [
  'Không hút thuốc',
  'Thỉnh thoảng giao lưu',
  'Đang cố gắng bỏ',
];

export const WORKOUT_OPTIONS: string[] = [
  'Dắt thú đi bộ mỗi chiều',
  'Tập luyện hằng ngày',
  '3-4 buổi / tuần',
  'Thư giãn cuối tuần',
];

export const DRINKING_OPTIONS: string[] = [
  'Không uống rượu bia',
  'Chỉ uống cà phê / trà',
  'Thỉnh thoảng dịp cuối tuần',
  'Giao lưu vừa phải',
];

export const CHAT_STYLE_OPTIONS: string[] = [
  'Thân thiện, phản hồi nhanh',
  'Thích hẹn dạo trực tiếp cùng Boss',
  'Nhẹ nhàng, tinh tế',
  'Hài hước, nhiều năng lượng',
];

export const SOS_REWARD_OPTIONS: string[] = [
  'Hậu tạ chân thành & Quà cảm ơn',
  'Hậu tạ 500.000đ',
  'Hậu tạ 1.000.000đ',
  'Hậu tạ 2.000.000đ',
  'Hậu tạ 5.000.000đ',
  'Thương lượng & Cảm ơn hậu hĩnh',
];

export const POPULAR_DOG_BREEDS: string[] = [
  'Golden Retriever',
  'Corgi',
  'Poodle',
  'Phốc Sóc (Pomeranian)',
  'Husky Sibir',
  'Alaska Malamute',
  'Shiba Inu',
  'Chó Ta (Bản địa / Chó cỏ)',
  'Chó Phú Quốc',
  'Chó Bắc Hà',
  "Chó H'Mông cộc đuôi",
  'Pug',
  'Bulldog Pháp',
  'Bulldog Anh',
  'Samoyed',
  'Chihuahua',
  'Dachshund (Lạp xưởng)',
  'Beagle',
  'Rottweiler',
  'Doberman',
  'Border Collie',
  'Labrador Retriever',
  'Bichon Frise',
  'Chó cỏ lai',
  'Chó Becgie (German Shepherd)',
  'Chó Akita',
  'Khác',
];

export const POPULAR_CAT_BREEDS: string[] = [
  'Mèo Anh lông ngắn (BSH)',
  'Mèo Anh lông dài (BLH)',
  'Mèo Ba Tư (Persian)',
  'Mèo Mướp (Bản địa)',
  'Mèo Vàng (Bản địa)',
  'Mèo Munchkin',
  'Mèo Ragdoll',
  'Mèo Scottish Fold',
  'Mèo Xiêm (Siamese)',
  'Mèo Bengal',
  'Mèo Sphynx',
  'Mèo Maine Coon',
  'Mèo Nga mắt xanh',
  'Mèo Tam thể',
  'Mèo Mướp lai',
  'Khác',
];

export function isFutureDate(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length < 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;

  const date = new Date(year, month, day);
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return date > now;
}

export function calculatePetAgeFromBirthDate(birthDateStr?: string | null): string {
  if (!birthDateStr || !birthDateStr.trim()) return 'Chưa rõ';
  const parts = birthDateStr.split(/[\/\-\.]/);
  if (parts.length < 3) return 'Chưa rõ';
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Chưa rõ';

  const birth = new Date(year, month, day);
  const now = new Date();
  if (birth > now) return 'Chưa rõ';

  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30.4375);
  const diffYears = Math.floor(diffDays / 365.25);

  if (diffMonths < 1) {
    const weeks = Math.max(1, Math.floor(diffDays / 7));
    return `${weeks} tuần tuổi`;
  }
  if (diffMonths < 12) {
    return `${diffMonths} tháng tuổi`;
  }
  const remainingMonths = diffMonths % 12;
  if (remainingMonths >= 3 && remainingMonths <= 9) {
    return `${diffYears}.5 tuổi`;
  }
  return `${diffYears} tuổi`;
}


export interface CandidateSlide {
  id: string;
  type: 'owner' | 'pet';
  imageUrl: string;
  ownerName: string;
  ownerAge?: number;
  gender?: string;
  area?: string;
  distanceKm: number;
  bio?: string;
  lookingFor?: string;
  intent: string;
  totalOwnerPhotos?: number;
  ownerPhotoIndex?: number;
  pet?: CandidatePetItem;
  petIndex?: number;
  totalPets?: number;
  petNamesSummary?: string;
}

export function getCandidateSlides(candidate: TinderCandidate): CandidateSlide[] {
  if (!candidate) return [];
  const cleanOwnerName = (candidate.ownerName || '')
    .replace(/\s*\(@[^)]*\)?/g, '')
    .replace(/@\w+/g, '')
    .replace(/\s*@.*$/, '')
    .replace(/\s*\([^)]*\)$/g, '')
    .trim() || 'Thành viên Pawty';

  const petImageUrls = (candidate.pets || [])
    .map((p) => p.imageUrl)
    .filter((u): u is string => Boolean(u));

  // 1. Owner photos (filter out empty and any pet images)
  const rawOwnerPhotos = (candidate.photoUrls || []).filter(
    (u): u is string => Boolean(u) && !petImageUrls.includes(u)
  );

  let ownerPhotos = rawOwnerPhotos;
  if (
    ownerPhotos.length === 0 &&
    candidate.avatarUrl &&
    !petImageUrls.includes(candidate.avatarUrl)
  ) {
    ownerPhotos = [candidate.avatarUrl];
  }
  if (ownerPhotos.length === 0 && candidate.avatarUrl && !petImageUrls.includes(candidate.avatarUrl)) {
    ownerPhotos = [candidate.avatarUrl];
  }

  const petNamesSummary = (candidate.pets || []).map((p) => p.name).join(', ');

  const ownerSlides: CandidateSlide[] = ownerPhotos.map((url, idx) => ({
    id: `owner-${candidate.id}-${idx}`,
    type: 'owner',
    imageUrl: url,
    ownerName: cleanOwnerName,
    ownerAge: candidate.ownerAge,
    gender: candidate.gender,
    area: candidate.area,
    distanceKm: candidate.distanceKm,
    bio: candidate.bio,
    lookingFor: candidate.lookingFor,
    intent: candidate.intent,
    totalOwnerPhotos: ownerPhotos.length,
    ownerPhotoIndex: idx + 1,
    petNamesSummary,
  }));

  // 2. Pet slides (one slide per pet)
  const petSlides: CandidateSlide[] = (candidate.pets || []).map((pet, pIdx) => ({
    id: `pet-${candidate.id}-${pet.id || pIdx}`,
    type: 'pet',
    imageUrl:
      pet.imageUrl ||
      (pet.species === 'Mèo'
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80'
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80'),
    ownerName: cleanOwnerName,
    ownerAge: candidate.ownerAge,
    gender: candidate.gender,
    distanceKm: candidate.distanceKm,
    intent: candidate.intent,
    lookingFor: candidate.lookingFor,
    pet,
    petIndex: pIdx + 1,
    totalPets: candidate.pets.length,
    petNamesSummary,
  }));

  const allSlides = [...ownerSlides, ...petSlides];
  return allSlides;
}
