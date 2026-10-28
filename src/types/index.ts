export type PetSpecies = 'dog' | 'cat';
export type PetGender = 'male' | 'female';
export type PetSize = 'small' | 'medium' | 'large';

export interface UserLocation {
  latitude: number;
  longitude: number;
  addressName: string;
  condoComplex: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  fullName: string;
  nickname: string;
  avatarUrl: string;
  isVerified: boolean;
  isVip: boolean;
  vipTier?: 'free' | 'vip' | 'vip_plus';
  locale?: 'vi' | 'en';
  superLikesLeft?: number;
  boostActiveUntil?: number | null;
  isWalkingNow?: boolean;
  walkingUntil?: number | null;
  walkStreakDays?: number;
  referralCode?: string;
  dailySwipesCount: number;
  maxFreeSwipesPerDay: number;
  location: UserLocation;
  flakeReportsCount: number;
  isBannedFromSwiping: boolean;
  banUntil?: string;
}

export interface SavedVoucher {
  id: string;
  code: string;
  title: string;
  brandName: string;
  discountBadge: string;
  expiresAt: string;
  status: 'saved' | 'redeemed';
}

export interface PetReminder {
  id: string;
  petId: string;
  kind: 'vaccine' | 'deworm' | 'custom';
  title: string;
  dueDate: string;
  isDone: boolean;
}

export interface MomentComment {
  id: string;
  momentId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface PetHabit {
  good: string[];
  bad: string[];
}

export interface PetProfile {
  id: string;
  ownerId: string;
  name: string;
  species: PetSpecies;
  breed: string;
  gender: PetGender;
  isNeutered: boolean;
  ageYears: number;
  ageMonths: number;
  weightKg: number;
  size: PetSize;
  isVaccinated: boolean;
  isSafePet?: boolean;
  vaccineStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  isWalkingNow?: boolean;
  isBoosted?: boolean;
  hasSuperLikedMe?: boolean;
  lastVaccineDate?: string;
  vaccineDetails?: string;
  bio: string;
  tags: string[];
  habits: PetHabit;
  avatarUrl: string;
  photos: string[];
  ownerName: string;
  ownerAvatar: string;
  condoComplex: string;
  location: UserLocation;
  distanceMeters?: number;
}

export interface PetMoment {
  id: string;
  petId: string;
  petName: string;
  petAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export interface MatchRecord {
  id: string;
  petId: string;
  targetPetId: string;
  status: 'liked' | 'disliked' | 'matched' | 'superliked';
  matchedAt?: string;
}

export interface PetFriendlyPlace {
  id: string;
  name: string;
  category: 'park' | 'cafe' | 'play_area';
  address: string;
  distanceMeters: number;
  highlights: string[];
  thumbnailUrl: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'reported_flake';

export interface WalkAppointment {
  id: string;
  matchId: string;
  senderPetId: string;
  senderPetName: string;
  receiverPetId: string;
  receiverPetName: string;
  scheduledTime: string;
  displayTime: string;
  place: PetFriendlyPlace;
  note?: string;
  status: AppointmentStatus;
  checkedInByMe?: boolean;
  checkedInByPartner?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderPetId: string;
  senderName: string;
  text?: string;
  timestamp: string;
  isOwn: boolean;
  isRead?: boolean;
  appointment?: WalkAppointment;
}

export interface ChatRoom {
  id: string;
  matchPet: PetProfile;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  messages: ChatMessage[];
  hasAppointment: boolean;
}

export interface NativeAd {
  id: string;
  isAd: true;
  brandName: string;
  title: string;
  tagline: string;
  discountBadge: string;
  locationName: string;
  distance: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
}

export interface SosAlert {
  id: string;
  petName: string;
  species: PetSpecies;
  breed: string;
  petPhotoUrl: string;
  lastSeenAddress: string;
  radiusKm: number;
  rewardAmountVnd: string;
  contactPhone: string;
  notes: string;
  createdAt: string;
  status: 'active' | 'resolved';
}

export interface RadarFilterOptions {
  radiusMeters: number;
  species: 'all' | 'dog' | 'cat';
  size: 'all' | 'small' | 'medium' | 'large';
  verifiedOnly: boolean;
  walkingNowOnly?: boolean;
}
