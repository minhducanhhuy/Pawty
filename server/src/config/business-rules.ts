export type VipTierType = 'free' | 'vip' | 'vip_plus';

export interface TierRuleConfig {
  dailySwipesLimit: number | null; // null = unlimited
  superLikesPerDay: number;
  canRewind: boolean;
  freeBoostsPerWeek: number;
  maxMoments: number | null; // null = unlimited
  maxPets: number;
  hasCrownBadge: boolean;
  radarPriorityMultiplier: number;
  canSeeLikesMe: boolean;
  hideNativeAds: boolean;
  advancedHealthReminders: boolean;
  priceMonthVnd: number;
  priceYearVnd: number | null;
}

export const BUSINESS_RULES = {
  tiers: {
    free: {
      dailySwipesLimit: 20,
      superLikesPerDay: 1,
      canRewind: false,
      freeBoostsPerWeek: 0,
      maxMoments: 5,
      maxPets: 1,
      hasCrownBadge: false,
      radarPriorityMultiplier: 1,
      canSeeLikesMe: false,
      hideNativeAds: false,
      advancedHealthReminders: false,
      priceMonthVnd: 0,
      priceYearVnd: 0,
    },
    vip: {
      dailySwipesLimit: null,
      superLikesPerDay: 5,
      canRewind: true,
      freeBoostsPerWeek: 1,
      maxMoments: null,
      maxPets: 2,
      hasCrownBadge: true,
      radarPriorityMultiplier: 3,
      canSeeLikesMe: true,
      hideNativeAds: false,
      advancedHealthReminders: false,
      priceMonthVnd: 49000,
      priceYearVnd: 399000,
    },
    vip_plus: {
      dailySwipesLimit: null,
      superLikesPerDay: 10,
      canRewind: true,
      freeBoostsPerWeek: 3,
      maxMoments: null,
      maxPets: 5,
      hasCrownBadge: true,
      radarPriorityMultiplier: 3,
      canSeeLikesMe: true,
      hideNativeAds: true,
      advancedHealthReminders: true,
      priceMonthVnd: 99000,
      priceYearVnd: 799000,
    },
  } as Record<VipTierType, TierRuleConfig>,

  products: {
    boost: {
      priceVnd: 15000,
      durationMinutes: 30,
      count: 1,
    },
    boostPack: {
      priceVnd: 39000,
      durationMinutes: 30,
      count: 3,
    },
    superLikePack: {
      priceVnd: 29000,
      count: 5,
    },
  },

  sos: {
    priceVnd: 39000,
    radiusKm: 3,
    radiusMeters: 3000,
  },

  radar: {
    minRadius: 500,
    maxRadius: 3000,
    defaultRadius: 1500,
    adEveryMin: 5,
    adEveryMax: 7,
    scoring: {
      baseDistanceOffset: 1000,
      vipBonus: 300,
      boostBonus: 1000,
      superLikeReceivedBonus: 500,
      walkingNowBonus: 200,
    },
  },

  walkNow: {
    durationMinutes: 30,
    gridRoundingMeters: 100,
    maxGpsPoints: 50,
  },

  rewind: {
    maxSecondsAfterSwipe: 60,
  },

  antiFlake: {
    maxFlakesPerWeek: 2,
    banDurationDays: 3,
    checkinWindowBeforeMinutes: 30,
    checkinWindowAfterMinutes: 60,
    checkinMaxDistanceMeters: 150,
    reminderBeforeMinutes: 15,
  },

  community: {
    maxClubsPerUser: 3,
    autoHideReportsThreshold: 3,
    eventReminderBeforeMinutes: 60,
  },

  referral: {
    rewardVipDays: 7,
    maxReferralsPerUser: 20,
    newUserEligibilityDays: 7,
  },

  adsAndVouchers: {
    cpcCostVnd: 3000,
    monthlyPlanCostVnd: 1500000,
    frequencyCapMinutes: 60,
    voucherValidityDays: 14,
    defaultAdRadiusMeters: 1000,
  },

  ai: {
    icebreakerHourlyLimit: 10,
    icebreakerSuggestionsCount: 3,
  },

  vaccine: {
    defaultValidityDays: 365,
    reminderOffsetsDays: [30, 7, 1, 0],
  },

  privacy: {
    hardDeleteGraceDays: 30,
    liveLocationWindowBeforeMinutes: 15,
    liveLocationWindowAfterMinutes: 60,
    liveLocationMinIntervalSeconds: 5,
  },

  i18n: ['vi', 'en'] as const,
};

export function getPublicConfig() {
  return {
    tiers: BUSINESS_RULES.tiers,
    products: BUSINESS_RULES.products,
    sos: {
      priceVnd: BUSINESS_RULES.sos.priceVnd,
      radiusKm: BUSINESS_RULES.sos.radiusKm,
    },
    radar: {
      minRadius: BUSINESS_RULES.radar.minRadius,
      maxRadius: BUSINESS_RULES.radar.maxRadius,
      adEveryMin: BUSINESS_RULES.radar.adEveryMin,
      adEveryMax: BUSINESS_RULES.radar.adEveryMax,
    },
    i18n: [...BUSINESS_RULES.i18n],
  };
}
