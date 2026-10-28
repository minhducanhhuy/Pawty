import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'mint' | 'outline' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const bgMap = {
    primary: COLORS.coral,
    mint: COLORS.mintDark,
    outline: COLORS.white,
    danger: COLORS.danger,
    gold: COLORS.goldVip,
  };
  const colorMap = {
    primary: COLORS.white,
    mint: COLORS.white,
    outline: COLORS.coral,
    danger: COLORS.white,
    gold: COLORS.darkNavy,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        { backgroundColor: bgMap[variant] },
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colorMap[variant]} />
      ) : (
        <Text style={[styles.text, { color: colorMap[variant] }, size === 'sm' && styles.textSm, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: { paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md },
  lg: { paddingVertical: SPACING.lg - 2, paddingHorizontal: SPACING.xl },
  outline: { borderWidth: 1.5, borderColor: COLORS.coral },
  disabled: { opacity: 0.55 },
  text: { ...TYPOGRAPHY.bodyBold, fontSize: 15 },
  textSm: { fontSize: 12 },
});
