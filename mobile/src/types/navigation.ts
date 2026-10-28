import { PetFriendlyPlace, WalkAppointment } from './community';

export type MainTab = 'Radar' | 'Feed' | 'Chat' | 'Profile';

export type ScreenName =
  | 'MainTabs'
  | 'Onboarding'
  | 'PetDetail'
  | 'WalkNow'
  | 'Paywall'
  | 'SosCreate'
  | 'SosNearby'
  | 'VaccineUpload'
  | 'Reminders'
  | 'Settings'
  | 'ChatRoom'
  | 'WalkScheduler'
  | 'CheckIn'
  | 'LiveLocation'
  | 'Places'
  | 'PlaceDetail'
  | 'Clubs'
  | 'ClubDetail'
  | 'Events'
  | 'NotificationCenter'
  | 'Vouchers'
  | 'Badges'
  | 'Referral';

export interface ScreenParamsMap {
  MainTabs: { tab?: MainTab } | undefined;
  Onboarding: undefined;
  PetDetail: { petId: string };
  WalkNow: undefined;
  Paywall: { highlight?: 'vip' | 'vip_plus' | 'boost' | 'super_like' } | undefined;
  SosCreate: undefined;
  SosNearby: undefined;
  VaccineUpload: { petId?: string } | undefined;
  Reminders: undefined;
  Settings: undefined;
  ChatRoom: { roomId: string; prefillPlace?: PetFriendlyPlace };
  WalkScheduler: { roomId: string; receiverPetId: string; preselectedPlace?: PetFriendlyPlace };
  CheckIn: { appointment: WalkAppointment };
  LiveLocation: { roomId: string; appointment: WalkAppointment };
  Places: { returnToRoomId?: string; receiverPetId?: string } | undefined;
  PlaceDetail: { placeId: string; returnToRoomId?: string; receiverPetId?: string };
  Clubs: undefined;
  ClubDetail: { clubId: string };
  Events: { clubId?: string } | undefined;
  NotificationCenter: undefined;
  Vouchers: undefined;
  Badges: undefined;
  Referral: undefined;
}

export interface StackEntry<K extends ScreenName = ScreenName> {
  name: K;
  params: ScreenParamsMap[K];
}

export interface PublicConfig {
  tiers: {
    free: { dailySwipes: number; superLikesPerDay: number; maxPhotos: number; maxPets: number; priceMonthVnd: number; priceYearVnd: number };
    vip: { dailySwipes: number; superLikesPerDay: number; maxPhotos: number; maxPets: number; priceMonthVnd: number; priceYearVnd: number };
    vip_plus: { dailySwipes: number; superLikesPerDay: number; maxPhotos: number; maxPets: number; priceMonthVnd: number; priceYearVnd: number };
  };
  products: {
    boost: { priceVnd: number; durationMinutes: number };
    superLikePack: { priceVnd: number; count: number };
    boostPack: { priceVnd: number; count: number };
  };
  sos: { priceVnd: number; radiusKm: number };
  radar: { minRadius: number; maxRadius: number; adEveryMin: number; adEveryMax: number };
  i18n: string[];
}
