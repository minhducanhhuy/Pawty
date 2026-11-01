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

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 85;

export const MobileTinderScreen: React.FC = () => {
  const {
    theme,
    tinderCandidates,
    tinderFilterGoal,
    setTinderFilterGoal,
    tinderDistanceLimit,
    setTinderDistanceLimit,
    swipeTinderCandidate,
    rewindLastSwipe,
    canRewind,
    activePassportArea,
    setPassportArea,
    cyclePassportArea,
    setShowLikesYouDrawer,
    activeModal,
    setActiveModal,
    openPublicUserProfile,
    showToast,
    isVip,
  } = useMobilePawty();

  // 1. Lọc ứng viên theo mục đích & bán kính khoảng cách (Miễn phí 100%)
  const filteredCandidates = useMemo(() => {
    return tinderCandidates.filter((c) => {
      const matchGoal = tinderFilterGoal === 'all' || c.intent === tinderFilterGoal;
      const matchDistance =
        tinderDistanceLimit === 'all' || c.distanceKm <= Number(tinderDistanceLimit);
      return matchGoal && matchDistance;
    });
  }, [tinderCandidates, tinderFilterGoal, tinderDistanceLimit]);

  // Quản lý deck nhất quán: Đỉnh deck luôn là phần tử 0, thẻ kế tiếp là phần tử 1
  const currentCandidate = filteredCandidates.length > 0 ? filteredCandidates[0] : null;
  const nextCandidate = filteredCandidates.length > 1 ? filteredCandidates[1] : null;

  // 2. State cục bộ
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Reset photo index khi candidate thay đổi
  const currentCandidateId = currentCandidate ? currentCandidate.id : null;
  useEffect(() => {
    setPhotoIdx(0);
  }, [currentCandidateId]);

  // 3. Animation & Cử chỉ vuốt thẻ
  const pan = useRef(new Animated.ValueXY()).current;
  const isSwipingRef = useRef(false);
  const touchStartTimeRef = useRef(0);

  const commitSwipe = (direction: 'left' | 'right') => {
    if (!currentCandidate) {
      isSwipingRef.current = false;
      return;
    }
    const candidateId = currentCandidate.id;
    // Gọi swipe trong context (context sẽ xóa candidateId khỏi mảng tinderCandidates)
    swipeTinderCandidate(candidateId, direction);
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

  // 4. PanResponder phân biệt rạch ròi Tap (đổi ảnh) và Drag (quẹt thẻ)
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

          // Xử lý cử chỉ Chạm (Tap) nửa trái/nửa phải để chuyển ảnh thú cưng
          if (isTap && currentCandidate) {
            const petPhotosList = (currentCandidate.pets || [])
              .map((p) => p.imageUrl)
              .filter(Boolean);
            const otherPetPhotos = (currentCandidate.photoUrls || []).filter(
              (u) => u !== currentCandidate.avatarUrl && !petPhotosList.includes(u)
            );
            const photosCount = Math.max(petPhotosList.length + otherPetPhotos.length, 1);

            if (gestureState.x0 < SCREEN_WIDTH / 2) {
              // Nửa trái -> lùi ảnh
              setPhotoIdx((prev) => (prev > 0 ? prev - 1 : Math.max(photosCount - 1, 0)));
            } else {
              // Nửa phải -> tiến ảnh
              setPhotoIdx((prev) => (prev + 1) % photosCount);
            }
            return;
          }

          // Xử lý cử chỉ Kéo (Drag) quẹt thẻ
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
            // Chưa vượt ngưỡng -> Nhẹ nhàng đàn hồi về vị trí cũ
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 6,
              tension: 40,
              useNativeDriver: false,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          // Xử lý khi cử chỉ bị ngắt ngang bởi hệ thống
          isSwipingRef.current = false;
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
          }).start();
        },
      }),
    [currentCandidate, filteredCandidates]
  );

  // Hiệu ứng xoay thẻ khi kéo
  const rotateCard = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-9deg', '0deg', '9deg'],
    extrapolate: 'clamp',
  });

  // Hiệu ứng mờ/hiện của Stamp Thích & Bỏ qua
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

  const likedYouCount = tinderCandidates.filter((c) => c.hasLikedMe).length;

  return (
    <View style={styles.rootContainer}>
      {/* 1. Deck Area: Co giãn chiếm trọn chiều cao khả dụng (Không dùng ScrollView ngoài) */}
      <View style={styles.deckArea}>
        {/* Next Card Background Preview */}
        {nextCandidate && (
          <View style={[styles.cardAbsoluteWrap, styles.nextCardWrap]} pointerEvents="none">
            <TinderCardSurface candidate={nextCandidate} isBackground />
          </View>
        )}

        {/* Current Active Card Foreground */}
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
              candidate={currentCandidate}
              photoIdx={photoIdx}
              onOpenDetails={() => setIsDetailModalVisible(true)}
              likeBadgeOpacity={likeBadgeOpacity}
              nopeBadgeOpacity={nopeBadgeOpacity}
            />
          </Animated.View>
        ) : (
          /* Empty State khi duyệt hết hồ sơ */
          <View style={styles.emptyStateBox}>
            <View style={styles.emptyIconBox}>
              <Feather name="compass" size={32} color="#B8ABA0" />
            </View>
            <Text style={styles.emptyTitle}>Đã xem hết hồ sơ phù hợp</Text>
            <Text style={styles.emptySub}>
              {tinderFilterGoal !== 'all'
                ? 'Hãy thử chuyển sang xem Tất cả mục đích hoặc mở rộng vị trí tìm kiếm.'
                : 'Hãy thử đổi khu vực kết nối hoặc quay lại sau ít phút nhé!'}
            </Text>

            <View style={styles.emptyActionsRow}>
              {tinderFilterGoal !== 'all' && (
                <TouchableOpacity
                  style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setTinderFilterGoal('all')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyBtnText}>Xem tất cả mục đích</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.emptySecondaryBtn}
                onPress={() => setActiveModal('tinder_filter')}
                activeOpacity={0.8}
              >
                <Feather name="sliders" size={13} color="#2E7D5B" />
                <Text style={styles.emptySecondaryBtnText}>Mở rộng khoảng cách</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 2. Hàng nút thao tác Hoàn tác, Bỏ qua & Thích cố định ở chân màn hình */}
      <TinderActionBar
        disabled={isDetailModalVisible}
        isCardActive={Boolean(currentCandidate)}
        canRewind={canRewind}
        onRewind={rewindLastSwipe}
        onPass={() => triggerSwipe('left')}
        onLike={() => triggerSwipe('right')}
      />

      {/* 3. Modal Hồ sơ chi tiết phủ toàn màn hình */}
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

      {/* 4. Modal Bộ lọc (Mục đích duyệt + Giới hạn khoảng cách) */}
      <TinderFilterModal
        visible={activeModal === 'tinder_filter'}
        onClose={() => setActiveModal(null)}
        currentGoal={tinderFilterGoal}
        onSelectGoal={(goal) => {
          setTinderFilterGoal(goal);
        }}
        distanceLimit={tinderDistanceLimit}
        onSelectDistanceLimit={(dist) => {
          setTinderDistanceLimit(dist);
        }}
      />

      {/* 5. Modal Menu phụ (Hoàn tác miễn phí, Ai thích bạn, Hồ sơ kết nối) */}
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
