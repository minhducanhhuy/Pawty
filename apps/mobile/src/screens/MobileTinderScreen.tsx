import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty } from '../context/MobilePawtyContext';
import { TinderIntent } from '../data/mobileSeedData';

const GOALS: { id: TinderIntent | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả mục đích' },
  { id: 'playdate', label: 'Tìm bạn chơi chung' },
  { id: 'dating', label: 'Hẹn hò chủ nuôi' },
  { id: 'community', label: 'Giao lưu nội khu' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 95;

export const MobileTinderScreen: React.FC = () => {
  const {
    theme,
    tinderCandidates,
    tinderIntent,
    setTinderIntent,
    swipeTinderCandidate,
    activePassportArea,
    setActiveModal,
    openPublicUserProfile,
    showToast,
  } = useMobilePawty();

  const [filterGoal, setFilterGoal] = useState<TinderIntent | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

  const filteredCandidates = useMemo(() => {
    return tinderCandidates.filter(
      (c) => filterGoal === 'all' || c.intent === filterGoal
    );
  }, [tinderCandidates, filterGoal]);

  const currentCandidate =
    filteredCandidates.length > 0
      ? filteredCandidates[currentIndex % filteredCandidates.length]
      : null;

  const pan = useRef(new Animated.ValueXY()).current;

  const handleAction = (direction: 'left' | 'right') => {
    if (!currentCandidate) return;
    swipeTinderCandidate(currentCandidate.id, direction);
    setPhotoIdx(0);
    setCurrentIndex((prev) => prev + 1);
    pan.setValue({ x: 0, y: 0 });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            Math.abs(gestureState.dx) > 14 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.3
          );
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > SWIPE_THRESHOLD) {
            Animated.timing(pan, {
              toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
              duration: 180,
              useNativeDriver: false,
            }).start(() => handleAction('right'));
          } else if (gestureState.dx < -SWIPE_THRESHOLD) {
            Animated.timing(pan, {
              toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
              duration: 180,
              useNativeDriver: false,
            }).start(() => handleAction('left'));
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 6,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [currentCandidate, currentIndex, filteredCandidates.length]
  );

  const rotateCard = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-7deg', '0deg', '7deg'],
    extrapolate: 'clamp',
  });

  const likeBadgeOpacity = pan.x.interpolate({
    inputRange: [20, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeBadgeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const candidatePhotos =
    currentCandidate && currentCandidate.photoUrls.length > 0
      ? currentCandidate.photoUrls
      : currentCandidate
      ? [currentCandidate.avatarUrl]
      : [];
  const activePhotoUrl = candidatePhotos[photoIdx % Math.max(candidatePhotos.length, 1)];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Filter & Quick Setup Bar */}
      <View style={styles.topUtilityBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.goalChipRow}
        >
          {GOALS.map((g) => {
            const active = filterGoal === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.goalChip,
                  active && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => {
                  setFilterGoal(g.id);
                  if (g.id !== 'all') setTinderIntent(g.id);
                }}
              >
                <Text style={[styles.goalChipText, active && { color: '#FFFFFF' }]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.setupChip}
            onPress={() => setActiveModal('tinder_setup')}
          >
            <Feather name="sliders" size={12} color="#2C2520" />
            <Text style={styles.setupChipText}>Hồ sơ Kết nối của tôi</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Tinder Card */}
      {currentCandidate ? (
        <View style={styles.tinderDeckWrapper}>
          {/* 1. REAL TINDER HERO PHOTO CARD WITH TOP PROGRESS BARS & DARK LIFESTYLE OVERLAY */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.heroCard,
              {
                transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: rotateCard }],
              },
            ]}
          >
            <Image source={{ uri: activePhotoUrl }} style={styles.heroImage} />

            {/* Top Segmented Photo Indicator Bars */}
            <View style={styles.photoBarsRow}>
              {candidatePhotos.map((_, idx) => (
                <View
                  key={`bar-${idx}`}
                  style={[
                    styles.photoBarSegment,
                    idx === photoIdx % candidatePhotos.length && styles.photoBarSegmentActive,
                  ]}
                />
              ))}
            </View>

            {/* Left / Right Tap Zones to switch photos */}
            <View style={styles.photoTapZonesRow}>
              <TouchableOpacity
                style={styles.photoTapHalf}
                activeOpacity={1}
                onPress={() =>
                  setPhotoIdx((prev) =>
                    prev > 0 ? prev - 1 : Math.max(candidatePhotos.length - 1, 0)
                  )
                }
              />
              <TouchableOpacity
                style={styles.photoTapHalf}
                activeOpacity={1}
                onPress={() =>
                  setPhotoIdx((prev) => (prev + 1) % Math.max(candidatePhotos.length, 1))
                }
              />
            </View>

            {/* Swipe Stamp Overlays */}
            <Animated.View style={[styles.likeStamp, { opacity: likeBadgeOpacity }]}>
              <Text style={styles.likeStampText}>THÍCH</Text>
            </Animated.View>
            <Animated.View style={[styles.nopeStamp, { opacity: nopeBadgeOpacity }]}>
              <Text style={styles.nopeStampText}>BỎ QUA</Text>
            </Animated.View>

            {/* Dark Bottom Overlay matching Tinder Screenshot 3 */}
            <View style={styles.heroDarkOverlay}>
              <View style={styles.heroTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroNameAge}>
                    {currentCandidate.ownerName} {currentCandidate.ownerAge}
                  </Text>
                  <Text style={styles.heroSubDistance}>
                    Nuôi {currentCandidate.pets.length} bé thú cưng · Cách {currentCandidate.distanceKm} km
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.expandCircleBtn}
                  onPress={() => setIsDetailsExpanded(!isDetailsExpanded)}
                >
                  <Feather
                    name={isDetailsExpanded ? 'chevron-down' : 'arrow-up'}
                    size={18}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.overlayLabelRow}>
                <Feather name="tag" size={13} color="#D8CFC5" />
                <Text style={styles.overlayLabelText}>
                  Thông tin cơ bản & Phong cách sống
                </Text>
              </View>

              {/* Dark Translucent Lifestyle Pills */}
              <View style={styles.darkPillsWrap}>
                <View style={styles.darkPill}>
                  <Feather name="zap" size={12} color="#FFFFFF" />
                  <Text style={styles.darkPillText}>{currentCandidate.lifestyle.smoking}</Text>
                </View>
                <View style={styles.darkPill}>
                  <Feather name="activity" size={12} color="#FFFFFF" />
                  <Text style={styles.darkPillText}>{currentCandidate.lifestyle.workout}</Text>
                </View>
                <View style={styles.darkPill}>
                  <Feather name="coffee" size={12} color="#FFFFFF" />
                  <Text style={styles.darkPillText}>{currentCandidate.lifestyle.drinking}</Text>
                </View>
                <View style={styles.darkPill}>
                  <Feather name="heart" size={12} color="#FFFFFF" />
                  <Text style={styles.darkPillText}>{currentCandidate.lifestyle.petSummary}</Text>
                </View>
                <View style={styles.darkPill}>
                  <Feather name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.darkPillText}>{currentCandidate.lifestyle.zodiac}</Text>
                </View>
                <View style={styles.darkPill}>
                  <Feather name="message-circle" size={12} color="#FFFFFF" />
                  <Text style={styles.darkPillText}>{currentCandidate.lifestyle.chatStyle}</Text>
                </View>
              </View>

              {/* Bottom Pass (✕) & Like (❤️) Floating Buttons */}
              <View style={styles.heroActionButtonsRow}>
                <TouchableOpacity
                  style={styles.tinderPassBtn}
                  onPress={() => handleAction('left')}
                >
                  <Feather name="x" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tinderLikeBtn}
                  onPress={() => handleAction('right')}
                >
                  <Feather name="heart" size={26} color="#FF3B5C" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* 2. EXPANDED TINDER INFO CARDS BELOW (Screenshot 2 + Multi-Pet with Per-Pet Vaccination) */}
          {isDetailsExpanded && (
            <View style={styles.detailsStack}>
              {/* Card A: Đang tìm kiếm */}
              <View style={styles.infoWhiteCard}>
                <View style={styles.infoCardHeader}>
                  <Feather name="search" size={15} color="#6C6055" />
                  <Text style={styles.infoCardHeaderTitle}>Đang tìm kiếm</Text>
                </View>
                <Text style={styles.lookingForBigText}>{currentCandidate.lookingFor}</Text>
                <Text style={styles.bioSubText}>{currentCandidate.bio}</Text>
              </View>

              {/* Card B: Danh sách Thú cưng đang nuôi (1 người có thể có nhiều pet + dấu tích tiêm chủng TRÊN TỪNG PET) */}
              <View style={styles.infoWhiteCard}>
                <View style={styles.infoCardHeader}>
                  <Feather name="shield" size={15} color={theme.primary} />
                  <Text style={styles.infoCardHeaderTitle}>
                    Thú cưng đang nuôi ({currentCandidate.pets.length} bé)
                  </Text>
                </View>

                <View style={styles.petCardsList}>
                  {currentCandidate.pets.map((pet) => (
                    <View key={pet.id} style={styles.candidatePetItemCard}>
                      <Image source={{ uri: pet.imageUrl }} style={styles.candidatePetAvatar} />
                      <View style={{ flex: 1 }}>
                        <View style={styles.candidatePetTopRow}>
                          <Text style={styles.candidatePetName}>{pet.name}</Text>
                          <View style={styles.speciesTag}>
                            <Text style={styles.speciesTagText}>Loài {pet.species}</Text>
                          </View>
                        </View>
                        <Text style={styles.candidatePetMeta}>
                          {pet.breed} · {pet.ageLabel} · {pet.weightKg} kg
                        </Text>

                        {/* Dấu tích Đã tiêm chủng & Phòng dại hiển thị RIÊNG TRÊN TỪNG PET */}
                        <View
                          style={[
                            styles.petVaccineBadge,
                            !pet.isVaccinatedAndRabies && styles.petVaccineBadgePending,
                          ]}
                        >
                          <Feather
                            name={pet.isVaccinatedAndRabies ? 'check-circle' : 'alert-triangle'}
                            size={12}
                            color={pet.isVaccinatedAndRabies ? '#2E7D5B' : '#B85D43'}
                          />
                          <Text
                            style={[
                              styles.petVaccineBadgeText,
                              !pet.isVaccinatedAndRabies && { color: '#B85D43' },
                            ]}
                          >
                            {pet.isVaccinatedAndRabies
                              ? 'Đã tiêm chủng & Phòng dại đầy đủ'
                              : 'Đang cập nhật mũi tiêm'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Card C: Thông tin chính */}
              <View style={styles.infoWhiteCard}>
                <View style={styles.infoCardHeaderBetween}>
                  <View style={styles.infoCardHeader}>
                    <Feather name="user" size={15} color="#6C6055" />
                    <Text style={styles.infoCardHeaderTitle}>Thông tin chính</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.replySmallPill}
                    onPress={() => openPublicUserProfile(currentCandidate.ownerHandle)}
                  >
                    <Feather name="send" size={12} color="#2C2520" />
                    <Text style={styles.replySmallPillText}>Trả lời</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRowItem}>
                  <Feather name="map-pin" size={16} color="#6C6055" />
                  <Text style={styles.infoRowValue}>
                    Cách xa {currentCandidate.distanceKm} km ({activePassportArea})
                  </Text>
                </View>
                <View style={styles.infoRowDivider} />
                <View style={styles.infoRowItem}>
                  <Feather name="user" size={16} color="#6C6055" />
                  <Text style={styles.infoRowValue}>{currentCandidate.gender}</Text>
                </View>
              </View>

              {/* Card D: Phong cách sống */}
              <View style={styles.infoWhiteCard}>
                <View style={styles.infoCardHeader}>
                  <Feather name="tag" size={15} color="#6C6055" />
                  <Text style={styles.infoCardHeaderTitle}>Phong cách sống</Text>
                </View>

                <View style={styles.lifestyleItemBlock}>
                  <Text style={styles.lifestyleLabel}>Bạn có hay hút thuốc không?</Text>
                  <View style={styles.lifestyleValueRow}>
                    <Feather name="zap" size={15} color="#6C6055" />
                    <Text style={styles.lifestyleValueText}>
                      {currentCandidate.lifestyle.smoking}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRowDivider} />

                <View style={styles.lifestyleItemBlock}>
                  <Text style={styles.lifestyleLabel}>Tập luyện</Text>
                  <View style={styles.lifestyleValueRow}>
                    <Feather name="activity" size={15} color="#6C6055" />
                    <Text style={styles.lifestyleValueText}>
                      {currentCandidate.lifestyle.workout}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRowDivider} />

                <View style={styles.lifestyleItemBlock}>
                  <Text style={styles.lifestyleLabel}>Về việc uống bia rượu</Text>
                  <View style={styles.lifestyleValueRow}>
                    <Feather name="coffee" size={15} color="#6C6055" />
                    <Text style={styles.lifestyleValueText}>
                      {currentCandidate.lifestyle.drinking}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRowDivider} />

                <View style={styles.lifestyleItemBlock}>
                  <Text style={styles.lifestyleLabel}>Thú cưng</Text>
                  <View style={styles.lifestyleValueRow}>
                    <Feather name="heart" size={15} color="#6C6055" />
                    <Text style={styles.lifestyleValueText}>
                      {currentCandidate.lifestyle.petSummary}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card E: Chia sẻ hồ sơ */}
              <TouchableOpacity
                style={styles.shareProfileCard}
                onPress={() =>
                  showToast(`Đã sao chép liên kết hồ sơ của ${currentCandidate.ownerName}.`)
                }
              >
                <Image
                  source={{ uri: currentCandidate.avatarUrl }}
                  style={styles.shareAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.shareProfileTitle}>
                    Chia sẻ hồ sơ của {currentCandidate.ownerName}
                  </Text>
                  <Text style={styles.shareProfileSub}>Bấm để gửi cho bạn bè</Text>
                </View>
                <Feather name="share-2" size={16} color="#6C6055" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Feather name="compass" size={28} color="#8E8074" />
          <Text style={styles.emptyTitle}>Đã xem hết hồ sơ trong mục này</Text>
          <Text style={styles.emptySub}>
            Hãy thử chuyển sang Tất cả mục đích hoặc đổi vị trí khu vực tìm kiếm.
          </Text>
          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              setFilterGoal('all');
              setCurrentIndex(0);
            }}
          >
            <Text style={styles.resetBtnText}>Xem toàn bộ hồ sơ</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 32,
  },
  topUtilityBar: {
    marginBottom: 10,
  },
  goalChipRow: {
    gap: 8,
  },
  goalChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDD3',
  },
  goalChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C5046',
  },
  setupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3EFEA',
    borderWidth: 1,
    borderColor: '#E2D9CE',
  },
  setupChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C2520',
  },
  tinderDeckWrapper: {
    gap: 12,
  },
  heroCard: {
    height: 520,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#1C1815',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  photoBarsRow: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  photoBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
  },
  photoBarSegmentActive: {
    backgroundColor: '#FFFFFF',
  },
  photoTapZonesRow: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    height: 240,
    flexDirection: 'row',
    zIndex: 8,
  },
  photoTapHalf: {
    flex: 1,
    height: '100%',
  },
  likeStamp: {
    position: 'absolute',
    top: 44,
    left: 20,
    borderWidth: 3,
    borderColor: '#3E8E6C',
    backgroundColor: 'rgba(234, 247, 241, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    transform: [{ rotate: '-12deg' }],
    zIndex: 12,
  },
  likeStampText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E7D5B',
  },
  nopeStamp: {
    position: 'absolute',
    top: 44,
    right: 20,
    borderWidth: 3,
    borderColor: '#D9534F',
    backgroundColor: 'rgba(253, 237, 237, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    transform: [{ rotate: '12deg' }],
    zIndex: 12,
  },
  nopeStampText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#C9302C',
  },
  heroDarkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18, 16, 15, 0.76)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    zIndex: 10,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroNameAge: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroSubDistance: {
    fontSize: 12,
    color: '#E5DDD3',
    fontWeight: '600',
    marginTop: 2,
  },
  expandCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  overlayLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F5F1EB',
  },
  darkPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  darkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  darkPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroActionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },
  tinderPassBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(38, 34, 32, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinderLikeBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(38, 34, 32, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 92, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsStack: {
    gap: 10,
  },
  infoWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  infoCardHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6C6055',
  },
  lookingForBigText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#1C1815',
    marginBottom: 6,
  },
  bioSubText: {
    fontSize: 13,
    color: '#5C5046',
    lineHeight: 19,
  },
  petCardsList: {
    gap: 10,
    marginTop: 4,
  },
  candidatePetItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  candidatePetAvatar: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#EFE9E1',
  },
  candidatePetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  candidatePetName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2520',
  },
  speciesTag: {
    backgroundColor: '#EFE9E1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speciesTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5C5046',
  },
  candidatePetMeta: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 2,
    marginBottom: 6,
  },
  petVaccineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: '#EAF7F1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  petVaccineBadgePending: {
    backgroundColor: '#FDF3F2',
  },
  petVaccineBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D5B',
  },
  replySmallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0EAE1',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 99,
  },
  replySmallPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2C2520',
  },
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  infoRowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1815',
  },
  infoRowDivider: {
    height: 1,
    backgroundColor: '#F2ECE4',
    marginVertical: 4,
  },
  lifestyleItemBlock: {
    paddingVertical: 8,
    gap: 5,
  },
  lifestyleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2520',
  },
  lifestyleValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lifestyleValueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1815',
  },
  shareProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  shareAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  shareProfileTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  shareProfileSub: {
    fontSize: 12,
    color: '#7A6E63',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: '#7A6E63',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
