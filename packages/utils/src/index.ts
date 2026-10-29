import type {
  GeoPoint,
  PetFriendlyPlace,
  PetSizeCategory,
  SocialPost,
  Species,
} from '@pawty/types';

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates distance in meters between two geographic points (PostGIS ST_Distance equivalent on client).
 */
export function calculateDistanceMeters(pointA: GeoPoint, pointB: GeoPoint): number {
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(pointA.lat)) *
      Math.cos(toRadians(pointB.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Calculates geographic midpoint between two users (PostGIS ST_Centroid(ST_Collect(A,B)) equivalent).
 */
export function calculateMidpoint(pointA: GeoPoint, pointB: GeoPoint): GeoPoint {
  return {
    lat: Number(((pointA.lat + pointB.lat) / 2).toFixed(6)),
    lng: Number(((pointA.lng + pointB.lng) / 2).toFixed(6)),
  };
}

/**
 * Suggests the top 3 Pet-Friendly places closest to the midpoint between two pet owners.
 */
export function suggestMidpointWalkPlaces(
  userALocation: GeoPoint,
  userBLocation: GeoPoint,
  places: PetFriendlyPlace[],
  limit = 3
): { midpoint: GeoPoint; suggestedPlaces: (PetFriendlyPlace & { midpointDistanceMeters: number })[] } {
  const midpoint = calculateMidpoint(userALocation, userBLocation);
  const scoredPlaces = places
    .filter((place) => place.isVerifiedPetFriendly)
    .map((place) => ({
      ...place,
      midpointDistanceMeters: calculateDistanceMeters(midpoint, place.location),
    }))
    .sort((a, b) => a.midpointDistanceMeters - b.midpointDistanceMeters)
    .slice(0, limit);

  return { midpoint, suggestedPlaces: scoredPlaces };
}

export function classifyPetSizeByWeight(weightKg: number): PetSizeCategory {
  if (weightKg < 4) return 'tiny';
  if (weightKg < 10) return 'small';
  if (weightKg < 25) return 'medium';
  if (weightKg < 40) return 'large';
  return 'giant';
}

export function formatSizeCategoryLabel(size: PetSizeCategory): string {
  const labels: Record<PetSizeCategory, string> = {
    tiny: 'Siêu nhỏ (<4kg)',
    small: 'Nhỏ (4–10kg)',
    medium: 'Trung bình (10–25kg)',
    large: 'Lớn (25–40kg)',
    giant: 'Khổng lồ (>40kg)',
  };
  return labels[size];
}

export function formatVndCurrency(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

export function formatDistanceLabel(meters: number): string {
  if (meters < 1000) {
    return `Cách bạn ${meters}m`;
  }
  return `Cách bạn ${(meters / 1000).toFixed(1)}km`;
}

/**
 * PawRank Algorithm (Tầng 2 - Section 4):
 * Purpose-driven ranking:
 * - Relevance: 30% (same species, breed, topic)
 * - Recency: 25%
 * - Engagement Quality: 20% (comments weighted higher than paws)
 * - Author Trust: 15% (Expert verified, VIP)
 * - Proximity: 10%
 * Plus Boosts for Expert/Helpful Q&A/Tips and Demotions for clickbait.
 */
export function calculatePawRankScore(
  post: SocialPost,
  activeSpecies: Species,
  activeBreed: string,
  userLocation: GeoPoint
): number {
  const relevanceScore =
    (post.speciesTags.includes(activeSpecies) ? 60 : 25) +
    (post.breedTags.some((b) => activeBreed.toLowerCase().includes(b.toLowerCase())) ? 40 : 0);

  const ageHours = Math.max(
    0.5,
    (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60)
  );
  const recencyScore = Math.max(10, 100 - ageHours * 3.5);

  const engagementQualityScore = Math.min(
    100,
    post.engagement.commentCount * 5 +
      post.engagement.reactionBreakdown.helpful * 6 +
      post.engagement.saveCount * 4 +
      post.engagement.pawCount * 1.2
  );

  const authorTrustScore =
    (post.expertVerified ? 65 : 25) + (post.authorIsVip ? 20 : 0) + (post.isExpertContent ? 15 : 0);

  const distanceMeters = post.location.point
    ? calculateDistanceMeters(userLocation, post.location.point)
    : 2500;
  const proximityScore = Math.max(10, 100 - distanceMeters / 50);

  let totalScore =
    relevanceScore * 0.3 +
    recencyScore * 0.25 +
    engagementQualityScore * 0.2 +
    authorTrustScore * 0.15 +
    proximityScore * 0.1;

  // Purpose-driven boosts
  if (post.expertVerified) totalScore += 15;
  if (post.contentType === 'tip' && post.media.length > 0) totalScore += 10;
  if (post.contentType === 'question' && post.engagement.reactionBreakdown.helpful >= 3) {
    totalScore += 12;
  }

  return Number(totalScore.toFixed(1));
}

export function buildVietQrUrl(params: {
  bankBin?: string;
  accountNumber?: string;
  accountName?: string;
  amountVnd: number;
  description: string;
}): string {
  const bankBin = params.bankBin ?? '970422'; // MB Bank default demo
  const accountNumber = params.accountNumber ?? '0888999777';
  const accountName = encodeURIComponent(params.accountName ?? 'CONG TY CO PHAN PAWTY VN');
  const addInfo = encodeURIComponent(params.description);
  return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png?amount=${params.amountVnd}&addInfo=${addInfo}&accountName=${accountName}`;
}

