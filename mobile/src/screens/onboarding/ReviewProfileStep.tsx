import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme';
import { ConnectionIntent, Species } from '../../types';

interface ReviewProfileStepProps {
  fullName: string;
  age: string;
  occupation: string;
  condoComplex: string;
  bio: string;
  selectedIntents: ConnectionIntent[];
  petName: string;
  species: Species;
  breed: string;
  weightStr: string;
  isVaccinated: boolean;
  tags: string[];
  petBio: string;
  loading: boolean;
  onSubmit: () => void;
}

const INTENT_LABELS: Record<ConnectionIntent, { label: string; emoji: string }> = {
  dating: { label: 'Hẹn hò đôi', emoji: '❤️' },
  walk_buddy: { label: 'Đi dạo đôi', emoji: '🚶' },
  playdate: { label: 'Bạn cho Boss', emoji: '🐾' },
  community: { label: 'Giao lưu', emoji: '💬' },
};

export const ReviewProfileStep: React.FC<ReviewProfileStepProps> = ({
  fullName,
  age,
  occupation,
  condoComplex,
  bio,
  selectedIntents,
  petName,
  species,
  breed,
  weightStr,
  isVaccinated,
  tags,
  loading,
  onSubmit,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>XEM LẠI HỒ SƠ ĐÔI</Text>
        <Text style={styles.title}>Hồ sơ của bạn trên Radar</Text>
        <Text style={styles.subtitle}>
          Chiếc thẻ ghép đôi kết hợp Chủ nuôi + Boss sẽ hiển thị như bên dưới tới các Sen khác.
        </Text>
      </View>

      {/* Dual Profile Card Preview */}
      <View style={styles.previewCard}>
        {/* Top Intent Pills */}
        <View style={styles.intentRow}>
          {selectedIntents.map((i) => (
            <View key={i} style={styles.intentPill}>
              <Text style={styles.intentPillText}>
                {INTENT_LABELS[i]?.emoji} {INTENT_LABELS[i]?.label}
              </Text>
            </View>
          ))}
          <View style={styles.condoBadge}>
            <Text style={styles.condoBadgeText}>📍 {condoComplex}</Text>
          </View>
        </View>

        {/* Human Owner Section */}
        <View style={styles.ownerSection}>
          <View style={styles.ownerAvatarCircle}>
            <Text style={styles.ownerAvatarEmoji}>👤</Text>
          </View>
          <View style={styles.ownerInfo}>
            <Text style={styles.ownerName}>
              {fullName}, {age || '25'} tuổi
            </Text>
            <Text style={styles.ownerOccupation}>💼 {occupation}</Text>
            {bio ? <Text style={styles.ownerBio} numberOfLines={2}>"{bio}"</Text> : null}
          </View>
        </View>

        {/* Boss Co-Pilot Section */}
        <View style={styles.bossSection}>
          <View style={styles.bossHeader}>
            <View style={styles.bossAvatarCircle}>
              <Text style={styles.bossAvatarEmoji}>{species === 'dog' ? '🐶' : '🐱'}</Text>
            </View>
            <View style={styles.bossInfo}>
              <View style={styles.bossTitleRow}>
                <Text style={styles.bossName}>{petName}</Text>
                {isVaccinated && (
                  <View style={styles.safeBadge}>
                    <Text style={styles.safeBadgeText}>🛡️ Safe Pet</Text>
                  </View>
                )}
              </View>
              <Text style={styles.bossBreed}>
                {breed} • {weightStr || '5'}kg
              </Text>
            </View>
          </View>

          {/* Personality Chips */}
          <View style={styles.tagsRow}>
            {tags.slice(0, 3).map((tg) => (
              <View key={tg} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tg}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.launchBtn, loading && styles.launchBtnDisabled]}
        disabled={loading}
        onPress={onSubmit}
        activeOpacity={0.85}
      >
        <Text style={styles.launchBtnText}>
          {loading ? 'Đang khởi tạo hồ sơ...' : 'Sẵn sàng quẹt thẻ & tìm bạn ngay 🚀'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: SPACING.sm },
  header: { marginBottom: SPACING.md },
  eyebrow: { ...TYPOGRAPHY.caption, color: COLORS.coral, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.textDark, marginBottom: 4 },
  subtitle: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.coral,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  intentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.md },
  intentPill: {
    backgroundColor: '#FFE4E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  intentPillText: { ...TYPOGRAPHY.caption, color: COLORS.coral, fontWeight: '800', fontSize: 11 },
  condoBadge: {
    backgroundColor: COLORS.creamWarm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  condoBadgeText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, fontSize: 11 },
  ownerSection: { flexDirection: 'row', gap: SPACING.sm + 4, alignItems: 'center', marginBottom: SPACING.md },
  ownerAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.coralLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarEmoji: { fontSize: 26 },
  ownerInfo: { flex: 1 },
  ownerName: { ...TYPOGRAPHY.h3, color: COLORS.textDark, fontSize: 16 },
  ownerOccupation: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  ownerBio: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontStyle: 'italic', marginTop: 4 },
  bossSection: {
    backgroundColor: COLORS.creamWarm,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 4,
  },
  bossHeader: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  bossAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bossAvatarEmoji: { fontSize: 22 },
  bossInfo: { flex: 1 },
  bossTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bossName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark, fontSize: 15 },
  safeBadge: {
    backgroundColor: COLORS.mintDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  safeBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  bossBreed: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  tagsRow: { flexDirection: 'row', gap: 6, marginTop: SPACING.xs + 2 },
  tagPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: { ...TYPOGRAPHY.caption, color: COLORS.coral, fontSize: 11, fontWeight: '700' },
  launchBtn: {
    backgroundColor: COLORS.coral,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  launchBtnDisabled: { backgroundColor: COLORS.border, shadowOpacity: 0, elevation: 0 },
  launchBtnText: { ...TYPOGRAPHY.bodyBold, color: COLORS.white, fontSize: 15 },
});
