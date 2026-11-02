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
import {
  TinderCandidate,
  getTinderPurposeLabel,
  getCandidateSlides,
  CandidateSlide,
} from '../../types/mobileTypes';

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

  // Sinh danh sách slides: Ảnh chủ nuôi -> Ảnh các bé thú cưng
  const slides: CandidateSlide[] = React.useMemo(() => {
    return getCandidateSlides(candidate);
  }, [candidate]);

  const currentSlide = slides[photoIdx % Math.max(slides.length, 1)] || slides[0];
  const displayPhotoUrl = imageError
    ? FALLBACK_PET_IMG
    : currentSlide?.imageUrl || FALLBACK_PET_IMG;

  const purposeLabel =
    candidate.lookingFor || getTinderPurposeLabel(candidate.intent);

  return (
    <View style={styles.cardContainer}>
      <Image
        key={displayPhotoUrl}
        source={{ uri: displayPhotoUrl }}
        style={styles.cardImage}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />

      {/* Thanh vạch tiến độ trên đỉnh thẻ: Số vạch = Tổng số ảnh chủ nuôi + Ảnh các bé */}
      {slides.length > 1 && (
        <View style={styles.segmentedBarRow}>
          {slides.map((_, idx) => (
            <View
              key={`bar-${idx}`}
              style={[
                styles.barSegment,
                idx === photoIdx % slides.length && styles.barSegmentActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Con dấu THÍCH khi quẹt phải */}
      {!isBackground && likeBadgeOpacity !== undefined && (
        <Animated.View
          style={[styles.stampBase, styles.likeStamp, { opacity: likeBadgeOpacity }]}
          pointerEvents="none"
        >
          <Text style={styles.likeStampText}>THÍCH</Text>
        </Animated.View>
      )}

      {/* Con dấu BỎ QUA khi quẹt trái */}
      {!isBackground && nopeBadgeOpacity !== undefined && (
        <Animated.View
          style={[styles.stampBase, styles.nopeStamp, { opacity: nopeBadgeOpacity }]}
          pointerEvents="none"
        >
          <Text style={styles.nopeStampText}>BỎ QUA</Text>
        </Animated.View>
      )}

      {/* Lớp phủ chuyển sắc thông tin đáy thẻ */}
      <LinearGradient
        colors={['transparent', 'rgba(18, 16, 15, 0.45)', 'rgba(18, 16, 15, 0.93)']}
        locations={[0, 0.38, 1]}
        style={styles.bottomGradient}
      >
        {/* Dòng Badge nhãn phân loại */}
        <View style={styles.badgeRow}>
          {candidate.hasLikedMe && (
            <View style={styles.likedMeBadge}>
              <Feather name="heart" size={11} color="#FFFFFF" />
              <Text style={styles.likedMeBadgeText}>Đã thích bạn</Text>
            </View>
          )}

          {currentSlide.type === 'owner' ? (
            <>
              {candidate.intent === 'dating' ? (
                <View style={[styles.intentBadge, styles.datingBadge]}>
                  <Feather name="heart" size={11} color="#FFFFFF" />
                  <Text style={styles.datingBadgeText}>{purposeLabel}</Text>
                </View>
              ) : candidate.intent === 'community' ? (
                <View style={[styles.intentBadge, styles.communityBadge]}>
                  <Feather name="users" size={11} color="#382E25" />
                  <Text style={styles.communityBadgeText}>{purposeLabel}</Text>
                </View>
              ) : (
                <View style={[styles.intentBadge, styles.playdateBadge]}>
                  <Feather name="smile" size={11} color="#0E4833" />
                  <Text style={styles.playdateBadgeText}>{purposeLabel}</Text>
                </View>
              )}

              {/* Thông báo số bé thú cưng đi cùng */}
              {candidate.pets && candidate.pets.length > 0 && (
                <View style={styles.petCounterPill}>
                  <Text style={styles.petCounterPillText}>
                    🐾 Có {candidate.pets.length} bé cưng
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              {/* Badge bé thú cưng đang hiển thị */}
              <View style={styles.petActiveSlideBadge}>
                <Text style={styles.petActiveSlideBadgeText}>
                  🐾 Bé cưng {currentSlide.petIndex}/{currentSlide.totalPets}
                </Text>
              </View>

              {currentSlide.pet?.isVaccinatedAndRabies && (
                <View style={styles.petVaccinatedPill}>
                  <Feather name="shield" size={10} color="#0E4833" />
                  <Text style={styles.petVaccinatedPillText}>Đã tiêm phòng đủ</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Nội dung thông tin chi tiết đáy thẻ */}
        <View style={styles.infoContentRow}>
          <View style={styles.infoTextColumn}>
            {currentSlide.type === 'owner' ? (
              <>
                {/* 1. THÔNG TIN CHỦ NUÔI */}
                <Text style={styles.primaryTitle} numberOfLines={1}>
                  {currentSlide.ownerName}, {currentSlide.ownerAge}
                </Text>
                <Text style={styles.secondaryMeta} numberOfLines={1}>
                  {currentSlide.area || 'Cộng đồng Pawty'}
                  {currentSlide.gender ? ` · ${currentSlide.gender}` : ''}
                </Text>
                <View style={styles.distanceBadgeRow}>
                  <Feather name="navigation" size={12} color="#A3E4D7" />
                  <Text style={styles.distanceBadgeText}>
                    Cách bạn {currentSlide.distanceKm} km
                  </Text>
                </View>
                {currentSlide.bio ? (
                  <Text style={styles.tertiarySub} numberOfLines={2}>
                    {currentSlide.bio}
                  </Text>
                ) : null}
              </>
            ) : (
              <>
                {/* 2. THÔNG TIN THÚ CƯNG (Khi lướt hết ảnh người) */}
                <Text style={styles.primaryTitle} numberOfLines={1}>
                  {currentSlide.pet?.name} · {currentSlide.pet?.ageLabel}
                </Text>
                <Text style={styles.secondaryMeta} numberOfLines={1}>
                  {currentSlide.pet?.breed}{' '}
                  {currentSlide.pet?.weightKg ? `· ${currentSlide.pet.weightKg} kg` : ''}
                </Text>
                <Text style={styles.tertiarySub} numberOfLines={1}>
                  Bé cưng của {currentSlide.ownerName} ({currentSlide.ownerAge}t)
                </Text>
                <View style={styles.distanceBadgeRow}>
                  <Feather name="navigation" size={12} color="#A3E4D7" />
                  <Text style={styles.distanceBadgeText}>
                    Cách bạn {currentSlide.distanceKm} km
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Nút mũi tên mở Drawer xem toàn bộ hồ sơ */}
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
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
    zIndex: 30,
  },
  barSegment: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
  },
  barSegmentActive: {
    backgroundColor: '#FFFFFF',
  },
  stampBase: {
    position: 'absolute',
    top: 48,
    borderWidth: 3.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    zIndex: 40,
  },
  likeStamp: {
    left: 20,
    borderColor: '#10B981',
    transform: [{ rotate: '-15deg' }],
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  likeStampText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 1.5,
  },
  nopeStamp: {
    right: 20,
    borderColor: '#EF4444',
    transform: [{ rotate: '15deg' }],
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  nopeStampText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 1.5,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 16,
    justifyContent: 'flex-end',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  likedMeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6F61',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
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
    paddingVertical: 4.5,
    borderRadius: 10,
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
    backgroundColor: '#E11D48',
  },
  datingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  communityBadge: {
    backgroundColor: '#F7EDE2',
  },
  communityBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#382E25',
  },
  petCounterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  petCounterPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  petActiveSlideBadge: {
    backgroundColor: '#FF6F61',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  petActiveSlideBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  petVaccinatedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#A3E4D7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  petVaccinatedPillText: {
    color: '#0E4833',
    fontSize: 11,
    fontWeight: '700',
  },
  infoContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoTextColumn: {
    flex: 1,
    gap: 2,
  },
  primaryTitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  secondaryMeta: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 1,
  },
  distanceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A3E4D7',
  },
  tertiarySub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    lineHeight: 16,
  },
  expandCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
});
