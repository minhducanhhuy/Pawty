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
import { TinderCandidate } from '../../data/mobileSeedData';

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
const FALLBACK_OWNER_IMG =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80';

export const TinderCardSurface: React.FC<TinderCardSurfaceProps> = ({
  candidate,
  photoIdx = 0,
  onOpenDetails,
  likeBadgeOpacity,
  nopeBadgeOpacity,
  isBackground = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Xây dựng danh sách ảnh theo từng mục đích (Intent-driven photo album)
  const primaryPet = candidate.pets && candidate.pets.length > 0 ? candidate.pets[0] : null;

  const candidatePhotos = React.useMemo(() => {
    if (candidate.intent === 'playdate' && primaryPet?.imageUrl) {
      // Playdate: Ưu tiên ảnh pet đại diện làm ảnh đầu tiên
      const otherPhotos = candidate.photoUrls.filter((u) => u !== primaryPet.imageUrl);
      return [primaryPet.imageUrl, ...otherPhotos];
    }
    if (candidate.photoUrls && candidate.photoUrls.length > 0) {
      return candidate.photoUrls;
    }
    return [candidate.avatarUrl || FALLBACK_OWNER_IMG];
  }, [candidate, primaryPet]);

  const activePhotoUrl =
    candidatePhotos[photoIdx % Math.max(candidatePhotos.length, 1)] ||
    (candidate.intent === 'playdate' ? FALLBACK_PET_IMG : FALLBACK_OWNER_IMG);

  const displayPhotoUrl = imageError
    ? candidate.intent === 'playdate'
      ? FALLBACK_PET_IMG
      : FALLBACK_OWNER_IMG
    : activePhotoUrl;

  const extraPetsCount = Math.max(0, candidate.pets.length - 1);

  return (
    <View style={styles.cardContainer}>
      {/* 1. Main Photo */}
      <Image
        source={{ uri: displayPhotoUrl }}
        style={styles.cardImage}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />

      {/* 2. Top Segmented Progress Bar (Chỉ báo số ảnh trong album) */}
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

      {/* 3. Stamp "THÍCH" và "BỎ QUA" khi quẹt (Chỉ hiển thị trên thẻ đang tương tác) */}
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

      {/* 4. Bottom Dark Gradient Overlay (Expo Linear Gradient) */}
      <LinearGradient
        colors={['transparent', 'rgba(18, 16, 15, 0.42)', 'rgba(18, 16, 15, 0.92)']}
        locations={[0, 0.42, 1]}
        style={styles.bottomGradient}
      >
        {/* Intent Badge */}
        <View style={styles.badgeRow}>
          {candidate.intent === 'playdate' && (
            <View style={[styles.intentBadge, styles.playdateBadge]}>
              <Feather name="smile" size={11} color="#0E4833" />
              <Text style={styles.playdateBadgeText}>Tìm bạn chơi chung</Text>
            </View>
          )}

          {candidate.intent === 'dating' && (
            <View style={[styles.intentBadge, styles.datingBadge]}>
              <Feather name="heart" size={11} color="#FFFFFF" />
              <Text style={styles.datingBadgeText}>Hẹn hò chủ nuôi</Text>
            </View>
          )}

          {candidate.intent === 'community' && (
            <View style={[styles.intentBadge, styles.communityBadge]}>
              <Feather name="users" size={11} color="#382E25" />
              <Text style={styles.communityBadgeText}>Giao lưu nội khu</Text>
            </View>
          )}

          {extraPetsCount > 0 && candidate.intent === 'playdate' && (
            <TouchableOpacity
              style={styles.extraPetsBadge}
              onPress={onOpenDetails}
              activeOpacity={0.8}
            >
              <Text style={styles.extraPetsBadgeText}>+{extraPetsCount} bé khác</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Thông tin hiển thị linh hoạt theo từng Intent */}
        <View style={styles.infoContentRow}>
          <View style={styles.infoTextColumn}>
            {/* Playdate: Pet làm nhân vật chính */}
            {candidate.intent === 'playdate' && (
              <>
                <Text style={styles.primaryTitle} numberOfLines={1}>
                  {primaryPet ? `${primaryPet.name} · ${primaryPet.ageLabel}` : candidate.ownerName}
                </Text>
                {primaryPet && (
                  <Text style={styles.secondaryMeta} numberOfLines={1}>
                    {primaryPet.breed} {primaryPet.weightKg ? `· ${primaryPet.weightKg} kg` : ''}
                  </Text>
                )}
                <Text style={styles.tertiarySub} numberOfLines={1}>
                  Đi cùng {candidate.ownerName} · cách {candidate.distanceKm} km
                </Text>
              </>
            )}

            {/* Dating: Chủ nuôi làm nhân vật chính */}
            {candidate.intent === 'dating' && (
              <>
                <Text style={styles.primaryTitle} numberOfLines={1}>
                  {candidate.ownerName} {candidate.ownerAge}
                </Text>
                <Text style={styles.secondaryMeta} numberOfLines={1}>
                  Cách xa {candidate.distanceKm} km
                </Text>
                <Text style={styles.tertiarySub} numberOfLines={1}>
                  {candidate.pets.length > 0
                    ? `Nuôi bé ${candidate.pets.map((p) => p.name).join(' & ')}`
                    : candidate.lifestyle.petSummary || 'Yêu thú cưng'}
                </Text>
              </>
            )}

            {/* Community: Giao lưu kinh nghiệm & hội nhóm */}
            {candidate.intent === 'community' && (
              <>
                <Text style={styles.primaryTitle} numberOfLines={1}>
                  {candidate.ownerName} & {primaryPet ? primaryPet.name : 'Boss'}
                </Text>
                <Text style={styles.secondaryMeta} numberOfLines={1}>
                  Cách xa {candidate.distanceKm} km
                </Text>
                <Text style={styles.tertiarySub} numberOfLines={1}>
                  {candidate.lookingFor || candidate.bio || 'Tìm hội giao lưu cùng khu vực'}
                </Text>
              </>
            )}
          </View>

          {/* Nút mở hồ sơ chi tiết (Vùng chạm >= 44x44) */}
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
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
    fontSize: 26,
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

