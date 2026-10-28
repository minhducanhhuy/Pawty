import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme';
import { ToastMessage } from '../context/AppConfigContext';
import { NotificationItem } from '../types';

interface ToastOverlayProps {
  toast: ToastMessage | null;
  banner: NotificationItem | null;
  onDismissToast: () => void;
  onPressBanner: (banner: NotificationItem) => void;
}

export const ToastOverlay: React.FC<ToastOverlayProps> = ({
  toast,
  banner,
  onDismissToast,
  onPressBanner,
}) => {
  if (!toast && !banner) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {banner && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onPressBanner(banner)}
          style={styles.banner}
        >
          <Text style={styles.bannerTitle}>{banner.title}</Text>
          <Text style={styles.bannerBody} numberOfLines={2}>
            {banner.body}
          </Text>
        </TouchableOpacity>
      )}
      {toast && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onDismissToast}
          style={[
            styles.toast,
            toast.type === 'error' && { backgroundColor: COLORS.danger },
            toast.type === 'success' && { backgroundColor: COLORS.mintDark },
          ]}
        >
          <Text style={styles.toastText}>{toast.text}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 48,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 999,
    gap: 8,
  },
  banner: {
    backgroundColor: COLORS.darkNavy,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.coral,
    ...SHADOWS.card,
  },
  bannerTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.white, marginBottom: 2 },
  bannerBody: { ...TYPOGRAPHY.caption, color: COLORS.mint },
  toast: {
    backgroundColor: COLORS.coral,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
    alignSelf: 'center',
    ...SHADOWS.floating,
  },
  toastText: { ...TYPOGRAPHY.bodyBold, color: COLORS.white, textAlign: 'center' },
});
