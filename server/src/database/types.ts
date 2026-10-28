import { VipTierType } from '../config/business-rules';

export type AuthProviderType = 'phone' | 'google' | 'apple';
export type UserRoleType = 'user' | 'moderator' | 'admin';
export type UserLocaleType = 'vi' | 'en';
export type PetSpeciesType = 'dog' | 'cat';
export type PetGenderType = 'male' | 'female';
export type PetSizeType = 'small' | 'medium' | 'large';
export type VaccineStatusType = 'none' | 'pending' | 'verified' | 'rejected';
export type MatchStatusType = 'liked' | 'disliked' | 'matched' | 'superliked';
export type MatchActionType = 'like' | 'superlike' | 'dislike';
export type AppointmentStatusType =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'reported_flake'
  | 'completed';
export type ReportTargetType = 'user' | 'pet' | 'moment' | 'message' | 'club';
export type ReportReasonType =
  | 'spam'
  | 'harassment'
  | 'abuse_animal'
  | 'nsfw'
  | 'fake'
  | 'other';
export type ReportStatusType = 'open' | 'resolved' | 'dismissed';
export type NotificationType =
  | 'match'
  | 'message'
  | 'appointment'
  | 'sos'
  | 'reminder'
  | 'event'
  | 'system'
  | 'badge'
  | 'referral';
export type ReminderKindType = 'vaccine' | 'deworm' | 'custom';
export type WalkSourceType = 'walk_now' | 'appointment';
export type ClubType = 'breed' | 'building';
export type ClubMemberRoleType = 'owner' | 'member';
export type EventRsvpStatusType = 'going' | 'maybe';
export type PlaceCategoryType = 'park' | 'cafe' | 'spa' | 'vet' | 'shop' | 'hotel';
export type PartnerStatusType = 'pending' | 'approved' | 'suspended';
export type PartnerPlanType = 'cpc' | 'monthly';
export type AdStatusType = 'draft' | 'active' | 'paused' | 'ended';
export type VoucherStatusType = 'saved' | 'redeemed' | 'expired';
export type TransactionType =
  | 'sos'
  | 'vip_month'
  | 'vip_year'
  | 'vip_plus_month'
  | 'boost'
  | 'boost_pack'
  | 'super_like_pack'
  | 'partner_topup';

export interface NotificationPrefs {
  match: boolean;
  message: boolean;
  appointment: boolean;
  sos: boolean;
  reminder: boolean;
  event: boolean;
}

export interface UserRecord {
  id: string;
  phone: string;
  email: string | null;
  authProvider: AuthProviderType;
  role: UserRoleType;
  locale: UserLocaleType;
  fullName: string;
  nickname: string | null;
  avatarUrl: string;
  isVerified: boolean;
  isVip: boolean;
  vipTier: VipTierType;
  vipExpiresAt: string | null;
  dailySwipesCount: number;
  superLikesToday: number;
  superLikeBalance: number;
  boostBalance: number;
  boostExpiresAt: string | null;
  isWalkingNow: boolean;
  walkingUntil: string | null;
  referralCode: string;
  referredByUserId: string | null;
  walkStreakDays: number;
  lastWalkDate: string | null;
  totalWalkMeters: number;
  latitude: number;
  longitude: number;
  isDistanceHidden: boolean;
  condoComplex: string;
  flakeReportsCount: number;
  isBannedSwiping: boolean;
  banUntil: string | null;
  fcmToken: string | null;
  notificationPrefs: NotificationPrefs;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PetRecord {
  id: string;
  userId: string;
  isPrimary: boolean;
  name: string;
  species: PetSpeciesType;
  breed: string;
  gender: PetGenderType;
  isNeutered: boolean;
  ageYears: number;
  ageMonths: number;
  weightKg: number;
  size: PetSizeType;
  isVaccinated: boolean;
  lastVaccineDate: string | null;
  vaccineDetails: string | null;
  vaccineStatus: VaccineStatusType;
  vaccineProofUrls: string[];
  vaccineNextDueDate: string | null;
  vaccineRejectReason: string | null;
  isSafePet: boolean;
  bio: string | null;
  tags: string[];
  habitsGood: string[];
  habitsBad: string[];
  avatarUrl: string;
  photos: string[];
  latitude: number;
  longitude: number;
  condoComplex: string;
  ownerName: string;
  ownerAvatar: string;
  isHidden?: boolean;
  createdAt: string;
}

export interface MatchRecord {
  id: string;
  senderPetId: string;
  targetPetId: string;
  action: MatchActionType;
  status: MatchStatusType;
  isUndone: boolean;
  matchedAt: string | null;
  createdAt: string;
}

export interface ChatRoomRecord {
  id: string;
  petAId: string;
  petBId: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface ChatMessageRecord {
  id: string;
  roomId: string;
  senderPetId: string;
  text: string | null;
  appointmentId: string | null;
  isRead: boolean;
  status?: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface WalkAppointmentRecord {
  id: string;
  roomId: string;
  senderPetId: string;
  receiverPetId: string;
  scheduledTime: string;
  displayTime: string;
  placeName: string;
  placeAddress: string;
  placeThumbnail: string;
  placeLat: number;
  placeLng: number;
  placeDistanceMeters?: number;
  checkedInSenderAt: string | null;
  checkedInReceiverAt: string | null;
  reminderSentAt: string | null;
  completedAt: string | null;
  note: string | null;
  status: AppointmentStatusType;
  createdAt: string;
}

export interface PetMomentRecord {
  id: string;
  petId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  likesCount: number;
  isHidden?: boolean;
  createdAt: string;
}

export interface MomentLikeRecord {
  id: string;
  momentId: string;
  userId: string;
  createdAt: string;
}

export interface MomentCommentRecord {
  id: string;
  momentId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface SosAlertRecord {
  id: string;
  userId?: string;
  petId?: string;
  petName: string;
  species: PetSpeciesType;
  breed: string;
  petPhotoUrl: string;
  latitude: number;
  longitude: number;
  lastSeenAddress: string;
  radiusKm: number;
  rewardAmountVnd: string;
  contactPhone: string;
  notes: string;
  status: 'active' | 'resolved';
  helperUserIds?: string[];
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  partnerId?: string;
  type: TransactionType;
  amountVnd: number;
  paymentGateway: string;
  paymentCode: string;
  status: 'pending' | 'paid' | 'failed';
  consumedForSos?: boolean;
  paidAt?: string | null;
  createdAt: string;
}

export interface BlockRecord {
  id: string;
  blockerUserId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  reporterUserId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReasonType;
  detail: string | null;
  status: ReportStatusType;
  resolvedBy: string | null;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface ReminderRecord {
  id: string;
  petId: string;
  kind: ReminderKindType;
  title: string;
  dueDate: string;
  isDone: boolean;
  lastNotifiedOffset: number | null;
}

export interface BadgeRecord {
  code:
    | 'first_match'
    | 'walk_7_streak'
    | 'social_butterfly'
    | 'safe_pet'
    | 'moment_10'
    | 'club_member'
    | 'referral_3'
    | 'sos_hero';
  nameVi: string;
  nameEn: string;
  icon: string;
  descriptionVi: string;
  descriptionEn: string;
}

export interface UserBadgeRecord {
  userId: string;
  badgeCode: BadgeRecord['code'];
  earnedAt: string;
}

export interface WalkLogRecord {
  id: string;
  userId: string;
  petId: string;
  startedAt: string;
  endedAt: string;
  distanceMeters: number;
  source: WalkSourceType;
}

export interface ClubRecord {
  id: string;
  name: string;
  type: ClubType;
  breedOrBuilding: string;
  coverUrl: string | null;
  description: string;
  ownerUserId: string;
  membersCount: number;
  isHidden?: boolean;
  createdAt: string;
}

export interface ClubMemberRecord {
  clubId: string;
  userId: string;
  role: ClubMemberRoleType;
  joinedAt: string;
}

export interface EventRecord {
  id: string;
  clubId: string | null;
  title: string;
  description: string;
  coverUrl: string | null;
  placeName: string;
  lat: number;
  lng: number;
  startsAt: string;
  capacity: number;
  rsvpCount: number;
  createdBy: string;
  reminderSent?: boolean;
}

export interface EventRsvpRecord {
  eventId: string;
  userId: string;
  status: EventRsvpStatusType;
  createdAt: string;
}

export interface PetFriendlyPlaceRecord {
  id: string;
  name: string;
  category: PlaceCategoryType;
  address: string;
  lat: number;
  lng: number;
  thumbnailUrl: string;
  ratingAvg: number;
  reviewsCount: number;
  partnerId: string | null;
  highlights?: string[];
}

export interface PlaceReviewRecord {
  id: string;
  placeId: string;
  userId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface PartnerRecord {
  id: string;
  businessName: string;
  category: PlaceCategoryType;
  contactEmail: string;
  passwordHash: string;
  phone: string;
  lat: number;
  lng: number;
  address: string;
  status: PartnerStatusType;
  plan: PartnerPlanType;
  balanceVnd: number;
  createdAt: string;
}

export interface NativeAdRecord {
  id: string;
  partnerId: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercent: number;
  voucherQuota: number;
  vouchersIssued: number;
  radiusMeters: number;
  targetLat: number;
  targetLng: number;
  status: AdStatusType;
  impressions: number;
  clicks: number;
  startsAt: string;
  endsAt: string;
}

export interface VoucherRecord {
  id: string;
  adId: string;
  userId: string;
  code: string;
  status: VoucherStatusType;
  expiresAt: string;
  redeemedAt: string | null;
  createdAt: string;
}

export interface ReferralRecord {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  rewardGrantedAt: string | null;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  meta: Record<string, any>;
  createdAt: string;
}

export interface LiveLocationRecord {
  roomId: string;
  appointmentId: string;
  userId: string;
  lat: number;
  lng: number;
  updatedAt: string;
  expiresAt: string;
}
