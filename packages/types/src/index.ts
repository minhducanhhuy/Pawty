// Shared TypeScript contracts for the 5-layer Pawty Ecosystem

export type Species = 'dog' | 'cat' | 'other';
export type PetGender = 'male' | 'female' | 'unknown';
export type PetSizeCategory = 'tiny' | 'small' | 'medium' | 'large' | 'giant';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type VaccinationStatus = 'full' | 'partial' | 'none' | 'unknown';

export type UserRole = 'user' | 'moderator' | 'admin' | 'partner';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type CircleRole = 'owner' | 'caretaker' | 'viewer';
export type CircleStatus = 'pending' | 'active' | 'revoked';

export type PrimaryNeed =
  | 'care_management'
  | 'family_circle'
  | 'walk_buddy'
  | 'grooming_service'
  | 'vet_care'
  | 'community_join'
  | 'share_moments'
  | 'pet_sitting';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface UserPrivacySettings {
  showLocation: boolean;
  showPhone: boolean;
  allowMessages: 'everyone' | 'circle_and_matches' | 'circle_only';
  consents: {
    dataCollection: boolean;
    location: boolean;
    notifications: boolean;
    marketing: boolean;
    updatedAt: string;
  };
}

export interface UserProfile {
  id: string;
  phone: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  bio: string;
  district: string;
  neighborhood: string;
  location: GeoPoint;
  isVip: boolean;
  vipPlan?: 'free' | 'basic' | 'sen_vip' | 'sen_vip_yearly';
  vipExpiresAt?: string;
  isExpert?: boolean;
  expertTitle?: string;
  role: UserRole;
  status: UserStatus;
  primaryNeeds: PrimaryNeed[];
  noShowCount: number;
  radarLockedUntil?: string;
  dailySwipeCount: number;
  privacy: UserPrivacySettings;
  createdAt: string;
}

export type BehaviorCategory = 'personality' | 'good_habit' | 'caution';

export interface PetBehavior {
  id: string;
  petId: string;
  category: BehaviorCategory;
  label: string;
  description?: string;
}

export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string;
  vetName: string;
  documentUrl?: string;
  verified: boolean;
}

export interface WeightLog {
  date: string;
  weightKg: number;
}

export interface PetProfile {
  id: string;
  householdId: string;
  ownerId: string;
  name: string;
  species: Species;
  breed: string;
  gender: PetGender;
  dateOfBirth: string;
  ageDisplay: string;
  weightKg: number;
  sizeCategory: PetSizeCategory;
  energyLevel: EnergyLevel;
  avatarUrl: string;
  coverPhotoUrl: string;
  isNeutered: boolean;
  allergies: string;
  medicalNotes: string;
  vetName: string;
  vetContact: string;
  vaccinationStatus: VaccinationStatus;
  lastVaccineDate?: string;
  isPublic: boolean;
  followerCount: number;
  behaviors: PetBehavior[];
  vaccinations: VaccinationRecord[];
  weightHistory: WeightLog[];
  speciesMeta?: {
    walkFrequencyPerDay?: number;
    litterCleanFrequencyPerDay?: number;
    coatCycleNote?: string;
    indoorActivityLevel?: 'low' | 'moderate' | 'high';
  };
}

export interface Household {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface CircleMember {
  id: string;
  householdId: string;
  userId: string;
  displayName: string;
  avatarUrl: string;
  relationLabel: string;
  role: CircleRole;
  inviteCode: string;
  expiresAt?: string;
  status: CircleStatus;
  joinedAt: string;
}

export type CareTaskCategory =
  | 'feeding'
  | 'medicine'
  | 'grooming'
  | 'walk'
  | 'vet'
  | 'litter'
  | 'other';

export type CareTaskStatus = 'pending' | 'done' | 'missed' | 'cancelled';

export interface CareTask {
  id: string;
  householdId: string;
  petId: string;
  createdBy: string;
  assignedTo: string;
  assignedToName: string;
  title: string;
  description?: string;
  category: CareTaskCategory;
  isRecurring: boolean;
  recurrenceRule?: string;
  dueDate: string;
  dueTime: string;
  status: CareTaskStatus;
  completedAt?: string;
  completedBy?: string;
  completedByName?: string;
  completionNote?: string;
  completionPhoto?: string;
  reminderEnabled: boolean;
}

export interface CircleActivityItem {
  id: string;
  householdId: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  actionText: string;
  detailText?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface CareHandoverNote {
  id: string;
  householdId: string;
  petId: string;
  createdBy: string;
  caretakerName: string;
  startDate: string;
  endDate: string;
  feedingInstructions: string;
  medicationInstructions: string;
  emergencyVetContact: string;
  checklist: { id: string; label: string; checked: boolean }[];
  isActive: boolean;
}

// Layer 3: Pet Social Network & Local Community
export type PostContentType =
  | 'moment'
  | 'care_log'
  | 'question'
  | 'tip'
  | 'place_review'
  | 'event'
  | 'service_review';

export type ReactionType = 'paw' | 'heart_eyes' | 'laughing' | 'worried' | 'helpful';

export type PostVisibility = 'public' | 'circle_only' | 'private';

export interface PostMedia {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  aspectRatio: '1:1' | '4:5' | '16:9';
}

export interface SocialComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  parentId?: string | null;
  textContent: string;
  mentions: string[];
  isExpert: boolean;
  expertTitle?: string;
  hasHealthDisclaimer: boolean;
  reactions: {
    paw: number;
    helpful: number;
  };
  userReactedHelpful?: boolean;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorIsVip?: boolean;
  petIds: string[];
  petName: string;
  petBreed: string;
  petAvatar: string;
  contentType: PostContentType;
  textContent: string;
  media: PostMedia[];
  hashtags: string[];
  location: {
    name: string;
    approximate: boolean;
    point?: GeoPoint;
  };
  speciesTags: Species[];
  breedTags: string[];
  topicTags: string[];
  visibility: PostVisibility;
  isExpertContent: boolean;
  expertTitle?: string;
  expertVerified: boolean;
  hasHealthDisclaimer: boolean;
  isSevereHealthAlert?: boolean;
  isSponsored: boolean;
  sponsorPartnerId?: string;
  sponsorCtaText?: string;
  sponsorDiscountBadge?: string;
  engagement: {
    pawCount: number;
    commentCount: number;
    shareCount: number;
    saveCount: number;
    reactionBreakdown: Record<ReactionType, number>;
  };
  userReaction?: ReactionType | null;
  isBookmarked?: boolean;
  bookmarkFolder?: string;
  feedSource?: 'circle_following' | 'local' | 'discovery' | 'expert' | 'partner';
  pawRankScore?: number;
  moderationStatus: 'approved' | 'pending' | 'flagged' | 'removed';
  createdAt: string;
  comments: SocialComment[];
}

export type CommunityGroupType = 'area' | 'breed' | 'interest' | 'activity' | 'partner';

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  type: CommunityGroupType;
  avatarUrl: string;
  coverUrl: string;
  area: string;
  isPrivate: boolean;
  rules: string[];
  memberCount: number;
  isJoined: boolean;
  moderatorNames: string[];
}

export interface PetFriendlyPlace {
  id: string;
  name: string;
  category: 'park' | 'cafe' | 'vet' | 'spa' | 'mall';
  district: string;
  address: string;
  location: GeoPoint;
  distanceMeters: number;
  rating: number;
  reviewCount: number;
  isVerifiedPetFriendly: boolean;
  features: string[];
  imageUrl: string;
}

// Radar & Walk Appointments
export interface RadarCandidate {
  id: string;
  userId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerIsVip: boolean;
  neighborhood: string;
  distanceMeters: number;
  location: GeoPoint;
  pet: PetProfile;
  compatibilityScore: number;
  matchReason: string;
}

export interface MatchRecord {
  id: string;
  userAId: string;
  userBId: string;
  petAId: string;
  petBId: string;
  partnerOwnerName: string;
  partnerOwnerAvatar: string;
  partnerPetName: string;
  partnerPetBreed: string;
  partnerPetAvatar: string;
  neighborhood: string;
  distanceMeters: number;
  matchReason: string;
  matchedAt: string;
}

export type WalkAppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface WalkAppointment {
  id: string;
  conversationId: string;
  initiatorId: string;
  inviteeId: string;
  partnerName: string;
  petNames: string[];
  scheduledDate: string;
  scheduledTime: string;
  locationName: string;
  locationAddress: string;
  distanceFromMidpointMeters: number;
  locationPoint: GeoPoint;
  note: string;
  status: WalkAppointmentStatus;
  createdAt: string;
}

// Messaging
export type MessageType =
  | 'text'
  | 'image'
  | 'voice'
  | 'walk_invite'
  | 'care_handover'
  | 'system';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  messageType: MessageType;
  textContent: string;
  mediaUrl?: string;
  voiceDurationSec?: number;
  walkAppointmentId?: string;
  handoverNoteId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'circle';
  title: string;
  subtitle: string;
  avatarUrl: string;
  partnerUserId?: string;
  partnerLocation?: GeoPoint;
  isOnline: boolean;
  unreadCount: number;
  lastMessageText: string;
  lastMessageAt: string;
}

// Layer 4 & Layer 5: Services, Bookings & Partners
export type PartnerCategory = 'grooming' | 'vet' | 'cafe' | 'hotel' | 'walker' | 'sitter';

export interface PartnerServiceOffering {
  id: string;
  name: string;
  priceVnd: number;
  durationMin: number;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PartnerReview {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  petName: string;
  rating: number;
  textContent: string;
  photos: string[];
  partnerReply?: string;
  createdAt: string;
}

export interface PartnerProfile {
  id: string;
  name: string;
  type: PartnerCategory;
  description: string;
  address: string;
  district: string;
  location: GeoPoint;
  distanceMeters: number;
  phone: string;
  avatarUrl: string;
  coverUrl: string;
  operatingHours: string;
  services: PartnerServiceOffering[];
  availableSlots: string[];
  verificationStatus: 'pending' | 'verified' | 'suspended';
  ratingAvg: number;
  reviewCount: number;
  commissionRatePercent: number;
  reviews: PartnerReview[];
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ServiceBooking {
  id: string;
  userId: string;
  userName: string;
  partnerId: string;
  partnerName: string;
  partnerType: PartnerCategory;
  partnerAvatar: string;
  petId: string;
  petName: string;
  serviceNames: string[];
  totalPriceVnd: number;
  commissionVnd: number;
  scheduledDate: string;
  scheduledTime: string;
  note: string;
  status: BookingStatus;
  hasReviewed: boolean;
  opsMinutesSpent?: number;
  createdAt: string;
}

// SOS Alert
export interface SosSighting {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  locationName: string;
  note: string;
  photoUrl?: string;
  createdAt: string;
}

export interface SosAlert {
  id: string;
  userId: string;
  ownerName: string;
  ownerPhone: string;
  petId: string;
  petName: string;
  petBreed: string;
  petAvatar: string;
  lastSeenLocation: string;
  radiusKm: number;
  description: string;
  rewardText: string;
  feePaidVnd: number;
  status: 'active' | 'found' | 'expired';
  sightings: SosSighting[];
  createdAt: string;
}

// Moderation & Analytics (Layer 8)
export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user' | 'post' | 'comment' | 'message' | 'partner';
  targetId: string;
  targetPreview: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'fraud' | 'safety' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  actionTaken?: string;
  createdAt: string;
}

export interface AnalyticsEventRecord {
  id: string;
  eventType: string;
  eventData: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface NorthStarDashboardMetrics {
  activeHouseholdsMonthly: number;
  northStarQualifiedHouseholds: number;
  mrrVnd: number;
  bookingCommissionRevenueVnd: number;
  vipSubscriptionRevenueVnd: number;
  nativeAdsRevenueVnd: number;
  sosRevenueVnd: number;
  onboardingCompletionRate: number;
  activationRate7d: number;
  circleInviteRate14d: number;
  d1Retention: number;
  d7Retention: number;
  d28Retention: number;
  w4ActiveRate: number;
  bookingCompletionRate: number;
  avgPartnerRating: number;
  avgOpsMinutesPerBooking: number;
  moderationFlagRate: number;
}

