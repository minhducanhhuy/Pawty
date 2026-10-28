import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'white' | 'mint' | 'cream' | 'goldBorder';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, variant = 'white', style }) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'mint' && styles.mint,
        variant === 'cream' && styles.cream,
        variant === 'goldBorder' && styles.goldBorder,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  mint: {
    backgroundColor: COLORS.mintLight,
    borderColor: COLORS.mint,
  },
  cream: {
    backgroundColor: COLORS.creamWarm,
    borderColor: COLORS.border,
  },
  goldBorder: {
    borderWidth: 2.5,
    borderColor: COLORS.goldVip,
  },
});
