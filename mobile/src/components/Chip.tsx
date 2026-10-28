import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'coral' | 'mint' | 'gold' | 'neutral';
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  tone = 'coral',
  style,
}) => {
  const activeBg =
    tone === 'mint'
      ? COLORS.mintDark
      : tone === 'gold'
      ? COLORS.goldVip
      : COLORS.coral;
  const inactiveBg =
    tone === 'mint'
      ? COLORS.mintLight
      : tone === 'gold'
      ? COLORS.goldLight
      : COLORS.white;

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? activeBg : inactiveBg,
          borderColor: selected ? activeBg : COLORS.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? (tone === 'gold' ? COLORS.darkNavy : COLORS.white) : COLORS.textDark },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
});
