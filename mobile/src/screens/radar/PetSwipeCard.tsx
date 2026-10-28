import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { Pet } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 110;

interface PetSwipeCardProps {
  pet: Pet;
  distanceLabel: string;
  isBoosted?: boolean;
  isWalkingNow?: boolean;
  hasSuperLikedMe?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isTopCard?: boolean;
}

export const PetSwipeCard: React.FC<PetSwipeCardProps> = ({
  pet,
  distanceLabel,
  isBoosted,
  isWalkingNow,
  hasSuperLikedMe,
  onSwipeLeft,
  onSwipeRight,
  isTopCard = true,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTopCard,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return isTopCard && (Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (!isTopCard) return;

        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe Right (Like)
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH + 150, y: gesture.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight?.();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe Left (Pass)
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH - 150, y: gesture.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft?.();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            tension: 40,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Rotation mapping (-15deg to +15deg)
  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 1.5, 0, SCREEN_WIDTH / 1.5],
    outputRange: ['-14deg', '0deg', '14deg'],
    extrapolate: 'clamp',
  });

  // Stamp Opacity
  const likeOpacity = pan.x.interpolate({
    inputRange: [15, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, -15],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const cardStyle = isTopCard
    ? {
        transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
      }
    : {};

  return (
    <Animated.View
      style={[styles.cardContainer, cardStyle]}
      {...(isTopCard ? panResponder.panHandlers : {})}
    >
      <View style={styles.card}>
        {/* Fullsize Pet Photo */}
        <Image
          source={{ uri: pet.avatarUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Badges (Minimal) */}
        <View style={styles.topBar}>
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>📍 {distanceLabel}</Text>
          </View>
          {pet.isSafePet && (
            <View style={styles.safePetBadge}>
              <Text style={styles.safePetText}>🛡️ Safe Pet</Text>
            </View>
          )}
        </View>

        {/* Tinder STAMP: LIKE (Right swipe) */}
        {isTopCard && (
          <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={styles.likeStampText}>THÍCH</Text>
          </Animated.View>
        )}

        {/* Tinder STAMP: NOPE (Left swipe) */}
        {isTopCard && (
          <Animated.View style={[styles.stamp, styles.nopeStamp, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeStampText}>BỎ QUA</Text>
          </Animated.View>
        )}

        {/* Clean Bottom Overlay (Visual-First, Clean) */}
        <View style={styles.bottomOverlay}>
          <View style={styles.petNameRow}>
            <Text style={styles.petName}>
              {pet.name} {pet.ownerIsVip ? '👑' : ''}
            </Text>
            <Text style={styles.petAge}>
              {pet.ageYears ? `${pet.ageYears} tuổi` : 'Cún cưng'}
            </Text>
          </View>

          <Text style={styles.petBreed}>
            {pet.gender === 'male' ? '♂️' : '♀️'} {pet.breed} • {pet.weightKg}kg
          </Text>

          <Text style={styles.condoText} numberOfLines={1}>
            🏢 {pet.condoComplex || 'Cư dân chung cư'} • Sen: {pet.ownerName || 'Chủ nuôi'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 460,
  },
  card: {
    flex: 1,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    backgroundColor: '#292524',
    position: 'relative',
    ...SHADOWS.card,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    zIndex: 10,
  },
  distanceBadge: {
    backgroundColor: 'rgba(28, 25, 23, 0.72)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  distanceText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  safePetBadge: {
    backgroundColor: 'rgba(163, 228, 215, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  safePetText: {
    color: '#064E3B',
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  stamp: {
    position: 'absolute',
    top: 45,
    borderWidth: 3.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    zIndex: 30,
  },
  likeStamp: {
    left: 24,
    borderColor: '#10B981',
    transform: [{ rotate: '-15deg' }],
  },
  likeStampText: {
    color: '#10B981',
    fontFamily: 'Fredoka-Bold',
    fontSize: 28,
    letterSpacing: 1.5,
  },
  nopeStamp: {
    right: 24,
    borderColor: '#EF4444',
    transform: [{ rotate: '15deg' }],
  },
  nopeStampText: {
    color: '#EF4444',
    fontFamily: 'Fredoka-Bold',
    fontSize: 28,
    letterSpacing: 1.5,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: 20,
    paddingTop: 36,
    backgroundColor: 'rgba(28, 25, 23, 0.75)',
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  petName: {
    color: '#FFFFFF',
    fontFamily: 'Fredoka-Bold',
    fontSize: 26,
  },
  petAge: {
    color: '#E7E5E4',
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
  petBreed: {
    color: '#A3E4D7',
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    marginTop: 2,
  },
  condoText: {
    color: '#D6D3D1',
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    marginTop: 4,
  },
});
