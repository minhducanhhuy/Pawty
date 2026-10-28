import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';

interface BadgeProps {
  text: string;
  tone?: 'coral' | 'mint' | 'gold' | 'danger' | 'success';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ text, tone = 'mint', style }) => {
  const bgMap = {
    coral: COLORS.coralLight,
    mint: COLORS.mintLight,
    gold: COLORS.goldLight,
    danger: COLORS.dangerLight,
    success: COLORS.successLight,
  };
  const textMap = {
    coral: COLORS.coralDark,
    mint: '#115E59',
    gold: COLORS.goldDark,
    danger: COLORS.danger,
    success: '#065F46',
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[tone] }, style]}>
      <Text style={[styles.text, { color: textMap[tone] }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    alignSelf: 'flex-start',
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
});
