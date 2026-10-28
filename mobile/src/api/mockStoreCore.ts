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
    id: 'usr_new_01', phone: '', fullName: 'Chủ Nuôi Pawty', nickname: 'Sen',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    condoComplex: 'Vinhomes Central Park', latitude: 10.7951, longitude: 106.7218,
    isVerified: true, isVip: false, vipTier: 'free', vipExpiresAt: null,
    dailySwipesCount: 0, swipesLeft: 20, superLikesToday: 0, superLikeBalance: 1, superLikesLeft: 1,
    boostBalance: 0, boostExpiresAt: null, isWalkingNow: false, walkingUntil: null,
    referralCode: 'PAWTYNEW', walkStreakDays: 0, lastWalkDate: null, totalWalkMeters: 0,
    isDistanceHidden: false, flakeReportsCount: 0, isBannedSwiping: false, banUntil: null, locale: 'vi',
    notificationPrefs: { match: true, message: true, appointment: true, sos: true, reminder: true, event: true },
  },
  myPets: [],
  radarPets: [],
  ads: [],
  moments: [],
  comments: {},
  blockedUsers: [],
  lastSwipedPet: null,
};
