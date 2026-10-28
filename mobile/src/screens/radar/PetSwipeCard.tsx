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
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme';
import { Pet, ConnectionIntent } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 110;

const INTENT_MAP: Record<ConnectionIntent, { label: string; emoji: string }> = {
  dating: { label: 'Hẹn hò đôi', emoji: '❤️' },
  walk_buddy: { label: 'Đi dạo đôi', emoji: '🚶' },
  playdate: { label: 'Bạn cho Boss', emoji: '🐾' },
  community: { label: 'Giao lưu', emoji: '💬' },
};

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

  // Rotation mapping (-14deg to +14deg)
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

  const primaryIntent = pet.intentTags?.[0] || 'dating';
  const intentInfo = INTENT_MAP[primaryIntent] || INTENT_MAP.dating;

  const ownerDisplayName = pet.ownerName || 'Chủ nuôi';
  const ownerAgeStr = pet.ownerAge ? `, ${pet.ownerAge}` : '';
  const ownerOccupation = pet.ownerOccupation || 'Cư dân Pawty';
  const ownerBio = pet.ownerBio || pet.bio;

  return (
    <Animated.View
      style={[styles.cardContainer, cardStyle]}
      {...(isTopCard ? panResponder.panHandlers : {})}
    >
      <View style={styles.card}>
        {/* Hero Photo (Pet with Owner or Pet) */}
        <Image
          source={{ uri: pet.avatarUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Badges */}
        <View style={styles.topBar}>
          {/* Intent Tag Pill */}
          <View style={styles.intentBadge}>
            <Text style={styles.intentBadgeText}>
              {intentInfo.emoji} {intentInfo.label}
            </Text>
          </View>

          <View style={styles.rightBadges}>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>📍 {distanceLabel}</Text>
            </View>
            {pet.isSafePet && (
              <View style={styles.safePetBadge}>
                <Text style={styles.safePetText}>🛡️ Safe Pet</Text>
              </View>
            )}
          </View>
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

        {/* Dual Profile Bottom Overlay */}
        <View style={styles.bottomOverlay}>
          {/* Human Owner Row */}
          <View style={styles.ownerRow}>
            <View style={styles.ownerTextCol}>
              <View style={styles.ownerNameRow}>
                <Text style={styles.ownerName}>
                  {ownerDisplayName}{ownerAgeStr} {pet.ownerIsVip ? '👑' : ''}
                </Text>
              </View>
              <Text style={styles.ownerOccupation}>💼 {ownerOccupation}</Text>
            </View>
          </View>

          {ownerBio ? (
            <Text style={styles.ownerBio} numberOfLines={2}>
              "{ownerBio}"
            </Text>
          ) : null}

          {/* Boss Co-Pilot Mini Card */}
          <View style={styles.bossCoPilotCard}>
            <View style={styles.bossAvatarCircle}>
              <Text style={styles.bossAvatarEmoji}>
                {pet.species === 'cat' ? '🐱' : '🐶'}
              </Text>
            </View>
            <View style={styles.bossInfoCol}>
              <View style={styles.bossNameRow}>
                <Text style={styles.bossNameLabel}>Boss:</Text>
                <Text style={styles.bossNameText}>{pet.name}</Text>
                <Text style={styles.bossBreedText}>
                  ({pet.gender === 'male' ? '♂️' : '♀️'} {pet.breed} · {pet.weightKg}kg)
                </Text>
              </View>
              <View style={styles.tagsRow}>
                {pet.tags?.slice(0, 3).map((tg) => (
                  <View key={tg} style={styles.tagPill}>
                    <Text style={styles.tagText}>#{tg}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.condoText} numberOfLines={1}>
            🏢 {pet.condoComplex || 'Khu dân cư'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 490,
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
    alignItems: 'center',
    padding: SPACING.md,
    zIndex: 10,
  },
  intentBadge: {
    backgroundColor: 'rgba(255, 111, 97, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  intentBadgeText: {
    color: '#FFFFFF',
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
  },
  rightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceBadge: {
    backgroundColor: 'rgba(28, 25, 23, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  distanceText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
  },
  safePetBadge: {
    backgroundColor: 'rgba(163, 228, 215, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  safePetText: {
    color: '#064E3B',
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
  },
  stamp: {
    position: 'absolute',
    top: 55,
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 32,
    backgroundColor: 'rgba(28, 25, 23, 0.82)',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerTextCol: {
    flex: 1,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  ownerName: {
    color: '#FFFFFF',
    fontFamily: 'Fredoka-Bold',
    fontSize: 24,
  },
  ownerOccupation: {
    color: '#A3E4D7',
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    marginTop: 2,
  },
  ownerBio: {
    color: '#E7E5E4',
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 16,
  },
  bossCoPilotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADIUS.lg,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bossAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(163, 228, 215, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bossAvatarEmoji: {
    fontSize: 18,
  },
  bossInfoCol: {
    flex: 1,
  },
  bossNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  bossNameLabel: {
    color: '#A3E4D7',
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  bossNameText: {
    color: '#FFFFFF',
    fontFamily: 'Fredoka-Bold',
    fontSize: 13,
  },
  bossBreedText: {
    color: '#E7E5E4',
    fontFamily: 'Nunito-Regular',
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 111, 97, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    color: '#FF6F61',
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
  },
  condoText: {
    color: '#A8A29E',
    fontFamily: 'Nunito-Regular',
    fontSize: 11,
    marginTop: 8,
  },
});
