import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme';
import { Pet } from '../../types';
import { Badge } from '../../components';

interface PetSwipeCardProps {
  pet: Pet;
  distanceLabel: string;
  isBoosted: boolean;
  isWalkingNow: boolean;
  hasSuperLikedMe: boolean;
}

export const PetSwipeCard: React.FC<PetSwipeCardProps> = ({
  pet,
  distanceLabel,
  isBoosted,
  isWalkingNow,
  hasSuperLikedMe,
}) => {
  const hasGoldHighlight = isBoosted || hasSuperLikedMe || pet.ownerIsVip;

  return (
    <View style={[styles.card, hasGoldHighlight && styles.goldBorder]}>
      <Image source={{ uri: pet.avatarUrl }} style={styles.image} />

      <View style={styles.topBadges}>
        <View style={styles.distancePill}>
          <Text style={styles.distanceText}>
            📍 {distanceLabel} • {pet.condoComplex || 'Vinhomes'}
          </Text>
        </View>
        {pet.isSafePet && <Badge text="🛡️ Safe Pet" tone="mint" />}
      </View>

      {(isWalkingNow || hasSuperLikedMe || isBoosted) && (
        <View style={styles.statusRow}>
          {isWalkingNow && (
            <View style={styles.walkLivePill}>
              <View style={styles.greenDot} />
              <Text style={styles.walkLiveText}>Đang dắt dạo</Text>
            </View>
          )}
          {hasSuperLikedMe && <Badge text="⭐ Đã Super Paw bạn!" tone="gold" />}
          {isBoosted && <Badge text="⚡ Đang Boost" tone="coral" />}
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>
            {pet.name} {pet.ownerIsVip ? '👑' : ''}
          </Text>
          <Text style={styles.meta}>
            {pet.gender === 'male' ? '♂️' : '♀️'} {pet.breed} • {pet.weightKg}kg
          </Text>
        </View>

        <Text style={styles.bio} numberOfLines={2}>
          "{pet.bio}"
        </Text>

        <View style={styles.tagsRow}>
          {pet.tags?.slice(0, 4).map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ownerRow}>
          <Text style={styles.ownerText}>
            👤 Sen: {pet.ownerName || 'Cư dân Pawty'} • {pet.isNeutered ? 'Đã triệt sản ✓' : 'Chưa triệt sản'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 390,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    backgroundColor: COLORS.darkNavy,
    position: 'relative',
    ...SHADOWS.card,
  },
  goldBorder: { borderWidth: 3, borderColor: COLORS.goldVip },
  image: { width: '100%', height: '100%', position: 'absolute' },
  topBadges: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, gap: 6, flexWrap: 'wrap',
  },
  distancePill: {
    backgroundColor: 'rgba(26,29,36,0.75)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill,
  },
  distanceText: { ...TYPOGRAPHY.caption, color: COLORS.white, fontWeight: '700' },
  statusRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: 6, flexWrap: 'wrap' },
  walkLivePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(16,185,129,0.92)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill,
  },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white },
  walkLiveText: { ...TYPOGRAPHY.caption, color: COLORS.white, fontWeight: '800' },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(26, 29, 36, 0.82)', padding: SPACING.md,
  },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 },
  name: { ...TYPOGRAPHY.h2, color: COLORS.white },
  meta: { ...TYPOGRAPHY.caption, color: COLORS.mint, fontWeight: '700' },
  bio: { ...TYPOGRAPHY.body, color: '#F1F5F9', fontStyle: 'italic', marginBottom: SPACING.sm },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  tagChip: { backgroundColor: 'rgba(255, 111, 97, 0.28)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: COLORS.coral },
  tagText: { ...TYPOGRAPHY.caption, fontSize: 11, color: '#FFE4E1' },
  ownerRow: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 6 },
  ownerText: { ...TYPOGRAPHY.caption, color: COLORS.mintLight },
});
