import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { ConnectionIntent } from '../../types';
import { Card } from '../../components';

interface IntentStepProps {
  selectedIntents: ConnectionIntent[];
  onToggleIntent: (intent: ConnectionIntent) => void;
  onContinue: () => void;
}

const INTENT_OPTIONS: {
  id: ConnectionIntent;
  emoji: string;
  title: string;
  subtitle: string;
  badge: string;
}[] = [
  {
    id: 'dating',
    emoji: '❤️',
    title: 'Hẹn hò đôi (Pet Lovers Dating)',
    subtitle: 'Tìm nửa kia cùng tình yêu thương Boss để chia sẻ mọi buồn vui.',
    badge: 'Hot nhất 🔥',
  },
  {
    id: 'walk_buddy',
    emoji: '🚶‍♂️',
    title: 'Tìm bạn đi dạo đôi (Walk Buddy)',
    subtitle: 'Tìm bạn dắt cún cùng giờ, cùng cung đường quanh công viên & toà nhà.',
    badge: 'Phổ biến 🌟',
  },
  {
    id: 'playdate',
    emoji: '🐾',
    title: 'Tìm bạn chơi cho Boss (Playdate)',
    subtitle: 'Tìm Boss cùng kích cỡ, độ tuổi và tính cách để xả năng lượng.',
    badge: 'Xả stress 🐶',
  },
  {
    id: 'community',
    emoji: '💬',
    title: 'Giao lưu cộng đồng & Kinh nghiệm',
    subtitle: 'Kết nối hàng xóm chung cư, hỏi đáp dinh dưỡng, thú y và chăm Boss.',
    badge: 'Hữu ích 💡',
  },
];

export const IntentStep: React.FC<IntentStepProps> = ({
  selectedIntents,
  onToggleIntent,
  onContinue,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>MỤC ĐÍCH KẾT NỐI</Text>
        <Text style={styles.title}>Bạn tìm kiếm điều gì tại Pawty?</Text>
        <Text style={styles.subtitle}>
          Pawty là mạng xã hội ghép đôi dành riêng cho người nuôi thú cưng. Chọn ít nhất 1 mục đích phù hợp nhất với bạn.
        </Text>
      </View>

      <View style={styles.list}>
        {INTENT_OPTIONS.map((opt) => {
          const isSelected = selectedIntents.includes(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.88}
              onPress={() => onToggleIntent(opt.id)}
              style={[styles.intentCard, isSelected && styles.intentCardSelected]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.emojiCircle}>
                  <Text style={styles.emojiText}>{opt.emoji}</Text>
                </View>
                <View style={styles.titleWrap}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.optionTitle}>{opt.title}</Text>
                  </View>
                  <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.continueBtn,
          selectedIntents.length === 0 && styles.continueBtnDisabled,
        ]}
        disabled={selectedIntents.length === 0}
        onPress={onContinue}
        activeOpacity={0.85}
      >
        <Text style={styles.continueBtnText}>Tiếp tục thiết lập hồ sơ Chủ nuôi →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  eyebrow: {
    ...TYPOGRAPHY.caption,
    color: COLORS.coral,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textDark,
    marginBottom: 6,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  list: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  intentCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  intentCardSelected: {
    borderColor: COLORS.coral,
    backgroundColor: '#FFF7F5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.creamWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  titleWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  optionTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textDark,
    fontSize: 14,
  },
  optionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.coral,
    borderColor: COLORS.coral,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13,
  },
  continueBtn: {
    backgroundColor: COLORS.coral,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
    fontSize: 15,
  },
});
