import type { GeoPoint, PetFriendlyPlace, SocialPost, Species } from '@pawty/types';

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

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

export function calculateMidpoint(pointA: GeoPoint, pointB: GeoPoint): GeoPoint {
  return {
    lat: Number(((pointA.lat + pointB.lat) / 2).toFixed(6)),
    lng: Number(((pointA.lng + pointB.lng) / 2).toFixed(6)),
  };
}

export function suggestMidpointWalkPlaces(
  userALocation: GeoPoint,
  userBLocation: GeoPoint,
  places: PetFriendlyPlace[],
  limit = 3
) {
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

  if (post.expertVerified) totalScore += 15;
  if (post.contentType === 'tip' && post.media.length > 0) totalScore += 10;
  if (post.contentType === 'question' && post.engagement.reactionBreakdown.helpful >= 3) {
    totalScore += 12;
  }

  return Number(totalScore.toFixed(1));
}

/**
 * PawRank Feed Service & PostGIS Spatial Service (Tầng 2 Section 4 & Tầng 6 Section 6)
 */
export class PawRankAndSpatialService {
  rankFeedForUser(
    posts: SocialPost[],
    activeSpecies: Species,
    activeBreed: string,
    userLocation: GeoPoint
  ): SocialPost[] {
    return [...posts]
      .map((post) => ({
        ...post,
        pawRankScore: calculatePawRankScore(post, activeSpecies, activeBreed, userLocation),
      }))
      .sort((a, b) => (b.pawRankScore ?? 0) - (a.pawRankScore ?? 0));
  }

  findNearbyUsersWithinRadius<T extends { location: GeoPoint }>(
    center: GeoPoint,
    radiusMeters: number,
    candidates: T[]
  ): (T & { distanceMeters: number })[] {
    return candidates
      .map((item) => ({
        ...item,
        distanceMeters: calculateDistanceMeters(center, item.location),
      }))
      .filter((item) => item.distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  computeWalkMidpointSuggestions(
    userALocation: GeoPoint,
    userBLocation: GeoPoint,
    places: PetFriendlyPlace[]
  ) {
    const midpoint = calculateMidpoint(userALocation, userBLocation);
    return suggestMidpointWalkPlaces(userALocation, userBLocation, places, 3);
  }
}

