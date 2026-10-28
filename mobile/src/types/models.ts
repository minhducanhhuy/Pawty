export type VipTier = 'free' | 'vip' | 'vip_plus';
export type LocaleCode = 'vi' | 'en';
export type Species = 'dog' | 'cat';
export type PetSize = 'small' | 'medium' | 'large';
export type VaccineStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface NotificationPrefs {
  match: boolean;
  message: boolean;
  appointment: boolean;
  sos: boolean;
  reminder: boolean;
  event: boolean;
}

export interface User {
  id: string;
  phone: string;
  fullName: string;
  nickname?: string;
  avatarUrl: string;
  condoComplex: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
  isVip: boolean;
  vipTier: VipTier;
  vipExpiresAt?: string | null;
  dailySwipesCount: number;
  swipesLeft: number;
  superLikesToday: number;
  superLikeBalance: number;
  superLikesLeft: number;
  boostBalance: number;
  boostExpiresAt?: string | null;
  isWalkingNow: boolean;
  walkingUntil?: string | null;
  referralCode: string;
  walkStreakDays: number;
  lastWalkDate?: string | null;
  totalWalkMeters: number;
  isDistanceHidden: boolean;
  flakeReportsCount: number;
  isBannedSwiping: boolean;
  banUntil?: string | null;
  locale: LocaleCode;
  notificationPrefs: NotificationPrefs;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: Species;
  breed: string;
  gender: 'male' | 'female';
  isNeutered: boolean;
  ageYears: number;
  ageMonths: number;
  weightKg: number;
  size: PetSize;
  isVaccinated: boolean;
  lastVaccineDate?: string;
  vaccineDetails?: string;
  vaccineStatus: VaccineStatus;
  vaccineProofUrls: string[];
  vaccineNextDueDate?: string | null;
  vaccineRejectReason?: string | null;
  isSafePet: boolean;
  isPrimary: boolean;
  bio: string;
  tags: string[];
  habitsGood: string[];
  habitsBad: string[];
  avatarUrl: string;
  photos: string[];
  ownerName?: string;
  ownerPhone?: string;
  condoComplex?: string;
  ownerIsVip?: boolean;
}

export interface NativeAd {
  id: string;
  partnerId: string;
  businessName: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercent: number;
  voucherQuota: number;
  vouchersIssued: number;
  radiusMeters: number;
}

export type RadarItem =
  | {
      type: 'pet';
      pet: Pet;
      distanceMeters: number;
      distanceLabel: string;
      isBoosted: boolean;
      isWalkingNow: boolean;
      hasSuperLikedMe: boolean;
    }
  | {
      type: 'ad';
      ad: NativeAd;
    };

export interface MomentItem {
  id: string;
  petId: string;
  petName: string;
  petAvatarUrl: string;
  condoComplex?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface MomentComment {
  id: string;
  momentId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  text: string;
  createdAt: string;
}
