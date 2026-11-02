import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '../../components/FeatherIcon';
import { TinderCandidate, getTinderPurposeLabel } from '../../types/mobileTypes';

interface TinderCardSurfaceProps {
  candidate: TinderCandidate;
  photoIdx?: number;
  onOpenDetails?: () => void;
  likeBadgeOpacity?: Animated.AnimatedInterpolation<number> | number;
  nopeBadgeOpacity?: Animated.AnimatedInterpolation<number> | number;
  isBackground?: boolean;
}

const FALLBACK_PET_IMG =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80';

export const TinderCardSurface: React.FC<TinderCardSurfaceProps> = ({
  candidate,
  photoIdx = 0,
  onOpenDetails,
  likeBadgeOpacity,
  nopeBadgeOpacity,
  isBackground = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isFlippedToPet, setIsFlippedToPet] = useState(false);
  const [petIdx, setPetIdx] = useState(0);

  const candidatePets = candidate.pets && candidate.pets.length > 0 ? candidate.pets : [];
  const primaryPet = candidatePets[petIdx % Math.max(candidatePets.length, 1)] || null;

  const handlePrevPet = () => {
    if (candidatePets.length > 0) {
      setPetIdx((prev) => (prev > 0 ? prev - 1 : candidatePets.length - 1));
      setIsFlippedToPet(true);
    }
  };

  const handleNextPet = () => {
    if (candidatePets.length > 0) {
      setPetIdx((prev) => (prev + 1) % candidatePets.length);
      setIsFlippedToPet(true);
    }
  };

  const candidatePhotos = React.useMemo(() => {
    if (isFlippedToPet) {
      const petPhotos = (candidate.pets || [])
        .map((p) => p.imageUrl)
        .filter(Boolean);
      if (petPhotos.length > 0) return petPhotos;
    } else {
      if (candidate.avatarUrl) {
        const otherPhotos = (candidate.photoUrls || []).filter((u) => u !== candidate.avatarUrl);
        return [candidate.avatarUrl, ...otherPhotos];
      }
    }

    const petPhotos = (candidate.pets || [])
      .map((p) => p.imageUrl)
      .filter(Boolean);

    const albumPhotos = (candidate.photoUrls || []).filter(
      (u) => Boolean(u) && !petPhotos.includes(u)
    );

    const merged = [...petPhotos, ...albumPhotos];
    if (merged.length > 0) return merged;
    if (candidate.avatarUrl) return [candidate.avatarUrl];
    return [FALLBACK_PET_IMG];
  }, [candidate, isFlippedToPet]);

  const activePhotoUrl =
    candidatePhotos[photoIdx % Math.max(candidatePhotos.length, 1)] || FALLBACK_PET_IMG;

  const displayPhotoUrl = imageError ? FALLBACK_PET_IMG : activePhotoUrl;
  const extraPetsCount = Math.max(0, candidate.pets.length - 1);
  const purposeLabel = candidate.lookingFor || getTinderPurposeLabel(candidate.intent);

  return (
    <View style={styles.cardContainer}>
      <Image
        source={{ uri: displayPhotoUrl }}
        style={styles.cardImage}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />

      {candidatePhotos.length > 1 && (
        <View style={styles.segmentedBarRow}>
          {candidatePhotos.map((_, idx) => (
            <View
              key={`bar-${idx}`}
              style={[
                styles.barSegment,
                idx === photoIdx % candidatePhotos.length && styles.barSegmentActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Top 2-Sided indicator & Flip Button */}
      <View style={styles.topIndicatorRow}>
        <View style={styles.sideTypeBadge}>
          <Feather name={isFlippedToPet ? 'smile' : 'user'} size={11} color="#FFFFFF" />
          <Text style={styles.sideTypeText}>
            {isFlippedToPet
              ? `Boss ${(petIdx % Math.max(candidatePets.length, 1)) + 1}/${Math.max(candidatePets.length, 1)}`
              : 'Mặt trước: Chủ nuôi'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.flipBtn}
          onPress={() => setIsFlippedToPet((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Feather name="refresh-cw" size={11} color="#FFFFFF" />
          <Text style={styles.flipBtnText}>
            {isFlippedToPet ? 'Lật xem Sen 👤' : 'Lật xem Boss 🐾'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2 Nút mũi tên sang trái/phải để duyệt tất cả các pet của người chủ đó */}
      <View style={styles.petNavigationRow} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.petNavArrowBtn}
          onPress={handlePrevPet}
          activeOpacity={0.75}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.petNavArrowBtn}
          onPress={handleNextPet}
          activeOpacity={0.75}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="chevron-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {!isBackground && likeBadgeOpacity !== undefined && (
        <Animated.View
          style={[styles.stampBase, styles.likeStamp, { opacity: likeBadgeOpacity }]}
          pointerEvents="none"
        >
          <Text style={styles.likeStampText}>THÍCH</Text>
        </Animated.View>
      )}

      {!isBackground && nopeBadgeOpacity !== undefined && (
        <Animated.View
          style={[styles.stampBase, styles.nopeStamp, { opacity: nopeBadgeOpacity }]}
          pointerEvents="none"
        >
          <Text style={styles.nopeStampText}>BỎ QUA</Text>
        </Animated.View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(18, 16, 15, 0.45)', 'rgba(18, 16, 15, 0.93)']}
        locations={[0, 0.42, 1]}
        style={styles.bottomGradient}
      >
        <View style={styles.badgeRow}>
          {candidate.hasLikedMe && (
            <View style={styles.likedMeBadge}>
              <Feather name="heart" size={11} color="#FFFFFF" />
              <Text style={styles.likedMeBadgeText}>Đã thích bạn</Text>
            </View>
          )}

          {candidate.intent === 'playdate' && (
            <View style={[styles.intentBadge, styles.playdateBadge]}>
              <Feather name="smile" size={11} color="#0E4833" />
              <Text style={styles.playdateBadgeText}>{purposeLabel}</Text>
            </View>
          )}

          {candidate.intent === 'dating' && (
            <View style={[styles.intentBadge, styles.datingBadge]}>
              <Feather name="heart" size={11} color="#FFFFFF" />
              <Text style={styles.datingBadgeText}>{purposeLabel}</Text>
            </View>
          )}

          {candidate.intent === 'community' && (
            <View style={[styles.intentBadge, styles.communityBadge]}>
              <Feather name="users" size={11} color="#382E25" />
              <Text style={styles.communityBadgeText}>{purposeLabel}</Text>
            </View>
          )}

          {extraPetsCount > 0 && (
            <TouchableOpacity
              style={styles.extraPetsBadge}
              onPress={onOpenDetails}
              activeOpacity={0.8}
            >
              <Text style={styles.extraPetsBadgeText}>+{extraPetsCount} bé khác</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoContentRow}>
          <View style={styles.infoTextColumn}>
            {!isFlippedToPet ? (
              <>
                <Text style={styles.primaryTitle} numberOfLines={1}>
                  {candidate.ownerName}, {candidate.ownerAge} tuổi
                </Text>
                <Text style={styles.secondaryMeta} numberOfLines={1}>
                  {candidate.area || 'Khu vực quanh bạn'} · cách {candidate.distanceKm} km
                </Text>
                <Text style={styles.tertiarySub} numberOfLines={1}>
                  {candidate.bio || purposeLabel}
                </Text>
              </>
            ) : primaryPet ? (
              <>
                <Text style={styles.primaryTitle} numberOfLines={1}>
                  {primaryPet.name} · {primaryPet.ageLabel || ''}
                </Text>
                <Text style={styles.secondaryMeta} numberOfLines={1}>
                  {primaryPet.breed} {primaryPet.weightKg ? `· ${primaryPet.weightKg} kg` : ''} · Nuôi bởi {candidate.ownerName}
                </Text>
                <Text style={styles.tertiarySub} numberOfLines={1}>
                  ✓ Đã tiêm phòng · {purposeLabel}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.primaryTitle} numberOfLines={1}>
                  {candidate.ownerName}, {candidate.ownerAge}
                </Text>
                <Text style={styles.secondaryMeta} numberOfLines={1}>
                  {candidate.area || 'Khu vực quanh bạn'} · cách {candidate.distanceKm} km
                </Text>
                <Text style={styles.tertiarySub} numberOfLines={1}>
                  {candidate.bio || purposeLabel}
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.expandCircleBtn}
            onPress={onOpenDetails}
            activeOpacity={0.85}
            accessibilityLabel="Xem chi tiết hồ sơ"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E1B18',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  segmentedBarRow: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  barSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  barSegmentActive: {
    backgroundColor: '#FFFFFF',
  },
  stampBase: {
    position: 'absolute',
    top: 40,
    borderWidth: 3,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 20,
  },
  likeStamp: {
    left: 20,
    borderColor: '#3E8E6C',
    backgroundColor: 'rgba(234, 247, 241, 0.95)',
    transform: [{ rotate: '-12deg' }],
  },
  likeStampText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#165A42',
    letterSpacing: 1,
  },
  nopeStamp: {
    right: 20,
    borderColor: '#D9534F',
    backgroundColor: 'rgba(253, 237, 237, 0.95)',
    transform: [{ rotate: '12deg' }],
  },
  nopeStampText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#B52B27',
    letterSpacing: 1,
  },
  petNavigationRow: {
    position: 'absolute',
    top: '40%',
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 12,
  },
  petNavArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topIndicatorRow: {
    position: 'absolute',
    top: 24,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 15,
  },
  sideTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
  },
  sideTypeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  flipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FF6F61',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  flipBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 36,
    paddingBottom: 20,
    justifyContent: 'flex-end',
    zIndex: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  likedMeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#E04F67',
  },
  likedMeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  intentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  playdateBadge: {
    backgroundColor: '#A3E4D7',
  },
  playdateBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0E4833',
  },
  datingBadge: {
    backgroundColor: '#FF6F61',
  },
  datingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  communityBadge: {
    backgroundColor: '#EBE4D8',
  },
  communityBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#382E25',
  },
  extraPetsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  extraPetsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoTextColumn: {
    flex: 1,
    paddingRight: 4,
  },
  primaryTitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  secondaryMeta: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E8E1D9',
    marginTop: 2,
  },
  tertiarySub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D4C9BC',
    marginTop: 2,
  },
  expandCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
});
