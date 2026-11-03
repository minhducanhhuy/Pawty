import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty } from '../context/MobilePawtyContext';
import { TinderCardSurface } from './tinder/TinderCardSurface';
import { TinderActionBar } from './tinder/TinderActionBar';
import { TinderProfileDetailModal } from './tinder/TinderProfileDetailModal';
import { TinderFilterModal } from './tinder/TinderFilterModal';
import { TinderMenuModal } from './tinder/TinderMenuModal';
import { TINDER_PURPOSE_OPTIONS, getCandidateSlides, TinderCandidate } from '../types/mobileTypes';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 85;

export const MobileTinderScreen: React.FC = () => {
  const {
    theme,
    tinderCandidates,
    likesYouCandidates,
    tinderFilterGoal,
    setTinderFilterGoal,
    tinderGenderFilter,
    setTinderGenderFilter,
    tinderDistanceLimit,
    setTinderDistanceLimit,
    swipeTinderCandidate,
    reloadTinderDeck,
    rewindLastSwipe,
    canRewind,
    setShowLikesYouDrawer,
    activeModal,
    setActiveModal,
    openPublicUserProfile,
    showToast,
  } = useMobilePawty();

  // Cơ chế tải thông minh: Chỉ duy trì tối đa 5 thẻ trên FE (Sliding Window Buffer = 5)
  const TINDER_BUFFER_SIZE = 5;
  const [activeQueue, setActiveQueue] = useState<TinderCandidate[]>([]);
  const poolIndexRef = useRef(0);

  // Đồng bộ hoặc nạp ban đầu tối đa 5 thẻ vào hàng chờ FE khi cọc thẻ thay đổi
  useEffect(() => {
    poolIndexRef.current = 0;
    const initial = tinderCandidates.slice(0, TINDER_BUFFER_SIZE);
    setActiveQueue(initial);
    poolIndexRef.current = initial.length;
  }, [tinderCandidates]);

  const currentCandidate = activeQueue.length > 0 && activeQueue[0] ? activeQueue[0] : null;
  const nextCandidate = activeQueue.length > 1 && activeQueue[1] ? activeQueue[1] : null;

  const activeGoalLabel =
    tinderFilterGoal === 'all'
      ? 'Tất cả mục đích'
      : TINDER_PURPOSE_OPTIONS.find((opt) => opt.intent === tinderFilterGoal)?.shortLabel ||
        'Mục đích kết nối';

  const [photoIdx, setPhotoIdx] = useState(0);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const currentCandidateId = currentCandidate ? currentCandidate.id : null;
  useEffect(() => {
    setPhotoIdx(0);
  }, [currentCandidateId]);

  // Tự động làm mới cọc thẻ nếu danh sách trống
  useEffect(() => {
    if (activeQueue.length === 0 && tinderCandidates.length === 0) {
      reloadTinderDeck(true);
    }
  }, [activeQueue.length, tinderCandidates.length, reloadTinderDeck]);

  const pan = useRef(new Animated.ValueXY()).current;
  const isSwipingRef = useRef(false);
  const touchStartTimeRef = useRef(0);

  const commitSwipe = (direction: 'left' | 'right') => {
    if (!currentCandidate) {
      isSwipingRef.current = false;
      return;
    }
    const candidateId = currentCandidate.id;
    swipeTinderCandidate(candidateId, direction);

    // Khi người dùng quẹt 1 thẻ: giải phóng thẻ cũ và nạp ngay 1 thẻ tiếp theo từ pool vào hàng chờ
    setActiveQueue((prev) => {
      const remaining = prev.filter((c) => Boolean(c) && c.id !== candidateId);
      if (poolIndexRef.current < tinderCandidates.length) {
        const nextFromPool = tinderCandidates[poolIndexRef.current];
        poolIndexRef.current += 1;
        if (nextFromPool) {
          return [...remaining, nextFromPool];
        }
      }
      return remaining;
    });

    pan.setValue({ x: 0, y: 0 });
    setPhotoIdx(0);
    isSwipingRef.current = false;
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    if (!currentCandidate || isSwipingRef.current) return;
    isSwipingRef.current = true;
    const targetX = direction === 'right' ? SCREEN_WIDTH + 120 : -SCREEN_WIDTH - 120;

    Animated.timing(pan, {
      toValue: { x: targetX, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => commitSwipe(direction));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            Math.abs(gestureState.dx) > 10 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2
          );
        },
        onPanResponderGrant: () => {
          touchStartTimeRef.current = Date.now();
        },
        onPanResponderMove: (_, gestureState) => {
          if (isSwipingRef.current) return;
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        },
        onPanResponderRelease: (_, gestureState) => {
          if (isSwipingRef.current) return;

          const elapsed = Date.now() - touchStartTimeRef.current;
          const isTap =
            Math.abs(gestureState.dx) < 12 &&
            Math.abs(gestureState.dy) < 12 &&
            elapsed < 280;

          if (isTap && currentCandidate) {
            const slides = getCandidateSlides(currentCandidate);
            const photosCount = Math.max(slides.length, 1);

            if (gestureState.x0 < SCREEN_WIDTH / 2) {
              setPhotoIdx((prev) => (prev > 0 ? prev - 1 : Math.max(photosCount - 1, 0)));
            } else {
              setPhotoIdx((prev) => (prev + 1) % photosCount);
            }
            return;
          }

          if (gestureState.dx > SWIPE_THRESHOLD) {
            isSwipingRef.current = true;
            Animated.timing(pan, {
              toValue: { x: SCREEN_WIDTH + 120, y: gestureState.dy },
              duration: 200,
              useNativeDriver: false,
            }).start(() => commitSwipe('right'));
          } else if (gestureState.dx < -SWIPE_THRESHOLD) {
            isSwipingRef.current = true;
            Animated.timing(pan, {
              toValue: { x: -SCREEN_WIDTH - 120, y: gestureState.dy },
              duration: 200,
              useNativeDriver: false,
            }).start(() => commitSwipe('left'));
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 6,
              tension: 40,
              useNativeDriver: false,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          isSwipingRef.current = false;
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
          }).start();
        },
      }),
    [currentCandidate, activeQueue]
  );

  const rotateCard = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-9deg', '0deg', '9deg'],
    extrapolate: 'clamp',
  });

  const likeBadgeOpacity = pan.x.interpolate({
    inputRange: [18, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeBadgeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -18],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const likedYouCount = likesYouCandidates.length;

  return (
    <View style={styles.rootContainer}>
      {/* Banner thông báo khi có người đã thích mình (Mở miễn phí 100%) */}
      {likedYouCount > 0 && (
        <TouchableOpacity
          style={styles.likesYouTopBanner}
          activeOpacity={0.85}
          onPress={() => setShowLikesYouDrawer(true)}
        >
          <View style={styles.likesYouIconCircle}>
            <Feather name="heart" size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.likesYouTopText} numberOfLines={1}>
            Có <Text style={{ fontWeight: '900' }}>{likedYouCount} người</Text> đã thích hồ sơ của bạn
          </Text>
          <View style={styles.likesYouViewPill}>
            <Text style={styles.likesYouViewPillText}>Xem ngay</Text>
            <Feather name="chevron-right" size={13} color="#C93B52" />
          </View>
        </TouchableOpacity>
      )}

      {/* Thanh định vị Mục đích & Lối tắt riêng cho Hồ sơ Hẹn hò */}
      <View style={styles.tinderSubBar}>
        <TouchableOpacity
          style={[styles.tinderSubGoalBtn, { backgroundColor: theme.primarySoft }]}
          onPress={() => setActiveModal('tinder_filter')}
          activeOpacity={0.8}
        >
          <Feather name="target" size={12} color={theme.primary} />
          <Text style={[styles.tinderSubGoalText, { color: theme.primary }]} numberOfLines={1}>
            {activeGoalLabel} · {tinderDistanceLimit === 'all' ? 'Toàn quốc' : `< ${tinderDistanceLimit}km`}
          </Text>
          <Feather name="chevron-down" size={12} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.myDatingProfileBtn}
          onPress={() => setActiveModal('tinder_setup')}
          activeOpacity={0.8}
        >
          <Feather name="user-check" size={12} color="#5C5046" />
          <Text style={styles.myDatingProfileBtnText}>Hồ sơ hẹn hò của tôi</Text>
        </TouchableOpacity>
      </View>

      {/* 1. Deck Area */}
      <View style={styles.deckArea}>
        {nextCandidate && (
          <View style={[styles.cardAbsoluteWrap, styles.nextCardWrap]} pointerEvents="none">
            <TinderCardSurface candidate={nextCandidate} isBackground />
          </View>
        )}

        {currentCandidate ? (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.cardAbsoluteWrap,
              {
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { rotate: rotateCard },
                ],
              },
            ]}
          >
            <TinderCardSurface
              key={`${currentCandidate.id}-${photoIdx}`}
              candidate={currentCandidate}
              photoIdx={photoIdx}
              onOpenDetails={() => setIsDetailModalVisible(true)}
              likeBadgeOpacity={likeBadgeOpacity}
              nopeBadgeOpacity={nopeBadgeOpacity}
            />
          </Animated.View>
        ) : (
          <View style={styles.emptyStateBox}>
            <View style={styles.emptyIconBox}>
              <Feather name="compass" size={32} color="#B8ABA0" />
            </View>
            <Text style={styles.emptyTitle}>Đã xem hết hồ sơ phù hợp</Text>
            <Text style={styles.emptySub}>
              {tinderFilterGoal !== 'all' || tinderDistanceLimit !== 'all'
                ? 'Hãy thử chuyển sang Tất cả mục đích hoặc chọn Không giới hạn khoảng cách.'
                : 'Bạn có thể kiểm tra danh sách Ai đã thích bạn hoặc thiết lập hồ sơ kết nối của mình!'}
            </Text>

            <View style={styles.emptyActionsRow}>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                onPress={() => reloadTinderDeck(false)}
                activeOpacity={0.8}
              >
                <Feather name="refresh-cw" size={13} color="#FFFFFF" />
                <Text style={styles.emptyBtnText}>Làm mới danh sách ngay</Text>
              </TouchableOpacity>

              {(tinderFilterGoal !== 'all' || tinderDistanceLimit !== 'all') && (
                <TouchableOpacity
                  style={[styles.emptyBtn, { backgroundColor: '#6B7280' }]}
                  onPress={() => {
                    setTinderFilterGoal('all');
                    setTinderDistanceLimit('all');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyBtnText}>Bỏ giới hạn lọc</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.emptySecondaryBtn}
                onPress={() => setShowLikesYouDrawer(true)}
                activeOpacity={0.8}
              >
                <Feather name="heart" size={13} color="#C93B52" />
                <Text style={styles.emptySecondaryBtnText}>
                  Ai đã thích bạn ({likedYouCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 2. Action Bar */}
      <TinderActionBar
        disabled={isDetailModalVisible}
        isCardActive={Boolean(currentCandidate)}
        canRewind={canRewind}
        onRewind={rewindLastSwipe}
        onPass={() => triggerSwipe('left')}
        onLike={() => triggerSwipe('right')}
      />

      {/* 3. Modal Hồ sơ chi tiết */}
      <TinderProfileDetailModal
        visible={isDetailModalVisible}
        candidate={currentCandidate}
        activePhotoIdx={photoIdx}
        onClose={() => setIsDetailModalVisible(false)}
        onPass={() => triggerSwipe('left')}
        onLike={() => triggerSwipe('right')}
        onOpenOwnerProfile={(handle) => {
          setIsDetailModalVisible(false);
          openPublicUserProfile(handle);
        }}
        onShare={(name) => showToast(`Đã sao chép liên kết hồ sơ của ${name}`)}
      />

      {/* 4. Modal Bộ lọc (Mục đích 1-1 + Không giới hạn khoảng cách) */}
      <TinderFilterModal
        visible={activeModal === 'tinder_filter'}
        onClose={() => setActiveModal(null)}
        currentGoal={tinderFilterGoal}
        onSelectGoal={(goal) => setTinderFilterGoal(goal)}
        distanceLimit={tinderDistanceLimit}
        onSelectDistanceLimit={(dist) => setTinderDistanceLimit(dist)}
        genderLimit={tinderGenderFilter}
        onSelectGenderLimit={(gender) => {
          setTinderGenderFilter(gender);
          reloadTinderDeck(true, gender);
        }}
      />

      {/* 5. Modal Menu phụ (Mở khóa 100% miễn phí) */}
      <TinderMenuModal
        visible={activeModal === 'tinder_menu'}
        onClose={() => setActiveModal(null)}
        onRewind={rewindLastSwipe}
        canRewind={canRewind}
        onOpenLikesYou={() => setShowLikesYouDrawer(true)}
        onOpenTinderSetup={() => setActiveModal('tinder_setup')}
        likedYouCount={likedYouCount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  likesYouTopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#FFF2F4',
    borderWidth: 1,
    borderColor: '#F6CCD4',
  },
  likesYouIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E04F67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likesYouTopText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#4A252C',
  },
  likesYouViewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#F3C8D1',
  },
  likesYouViewPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C93B52',
  },
  tinderSubBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 4,
    gap: 8,
  },
  tinderSubGoalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
  },
  tinderSubGoalText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  myDatingProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5EFE6',
    borderWidth: 1,
    borderColor: '#ECE4DB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
  },
  myDatingProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A3F35',
  },
  deckArea: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 4,
    position: 'relative',
  },
  cardAbsoluteWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
  },
  nextCardWrap: {
    transform: [{ scale: 0.96 }],
    opacity: 0.88,
  },
  emptyStateBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECE5DB',
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F5EFE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C2520',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#7A6E63',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyBtn: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptySecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E2D9CE',
  },
  emptySecondaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4A3F35',
  },
});
