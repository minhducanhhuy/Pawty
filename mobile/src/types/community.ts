import { Pet } from './models';

export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'reported_flake' | 'completed';

export interface WalkAppointment {
  id: string;
  roomId: string;
  senderPetId: string;
  receiverPetId: string;
  scheduledTime: string;
  displayTime: string;
  placeId?: string;
  placeName: string;
  placeAddress: string;
  placeThumbnail: string;
  placeLat: number;
  placeLng: number;
  note?: string;
  status: AppointmentStatus;
  checkedInSenderAt?: string | null;
  checkedInReceiverAt?: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderPetId: string;
  text?: string;
  appointment?: WalkAppointment;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  partnerPet: Pet;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  activeAppointment?: WalkAppointment | null;
}

export type PlaceCategory = 'park' | 'cafe' | 'spa' | 'vet' | 'shop' | 'hotel';

export interface PlaceReview {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface PetFriendlyPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  lat: number;
  lng: number;
  distanceMeters?: number;
  thumbnailUrl: string;
  ratingAvg: number;
  reviewsCount: number;
  reviews?: PlaceReview[];
}

export interface Club {
  id: string;
  name: string;
  type: 'breed' | 'building';
  breedOrBuilding: string;
  coverUrl: string;
  description: string;
  ownerUserId: string;
  membersCount: number;
  isMember: boolean;
}

export interface EventItem {
  id: string;
  clubId?: string | null;
  clubName?: string;
  title: string;
  description: string;
  coverUrl: string;
  placeName: string;
  lat: number;
  lng: number;
  startsAt: string;
  capacity: number;
  rsvpCount: number;
  myRsvp?: 'going' | 'maybe' | 'none';
}

export interface NotificationItem {
  id: string;
  type: 'match' | 'message' | 'appointment' | 'sos' | 'reminder' | 'event' | 'system' | 'badge' | 'referral';
  title: string;
  body: string;
  payload?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export interface ReminderItem {
  id: string;
  petId: string;
  petName?: string;
  kind: 'vaccine' | 'deworm' | 'custom';
  title: string;
  dueDate: string;
  isDone: boolean;
}

export interface BadgeItem {
  code: string; nameVi: string; nameEn: string; icon: string;
  descriptionVi: string; descriptionEn: string;
  earnedAt?: string; progress?: number; target?: number;
}

export interface VoucherItem {
  id: string; adId: string; businessName: string; title: string;
  discountPercent: number; code: string; status: 'saved' | 'redeemed' | 'expired'; expiresAt: string;
}

export interface SosAlert {
  id: string; petName: string; species: 'dog' | 'cat'; breed: string; petPhotoUrl: string;
  lastSeenAddress: string; rewardAmountVnd: string; contactPhone: string; notes: string;
  status: 'active' | 'resolved'; distanceMeters?: number; createdAt: string;
}
