import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme';
import { NativeAd } from '../../types';
import { Badge, Button } from '../../components';
import { api } from '../../api/endpoints';
import { useTranslation } from '../../i18n';

interface NativeAdCardProps {
  ad: NativeAd;
  onVoucherSaved: (code: string) => void;
  onPassAd: () => void;
}

export const NativeAdCard: React.FC<NativeAdCardProps> = ({ ad, onVoucherSaved, onPassAd }) => {
  const { t } = useTranslation();

  useEffect(() => {
    api.trackAdImpression(ad.id).catch(() => {});
  }, [ad.id]);

  const handleSaveVoucher = async () => {
    try {
      await api.trackAdClick(ad.id);
      const voucher = await api.saveAdVoucher(ad.id);
      onVoucherSaved(voucher.code);
    } catch (err) {
      console.error('Failed to save voucher:', err);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => api.trackAdClick(ad.id)}
      style={styles.card}
    >
      <Image source={{ uri: ad.imageUrl }} style={styles.image} />

      <View style={styles.topRow}>
        <Badge text={`✨ ${t('radar.ad.sponsored')}`} tone="gold" />
        <Badge text={`Voucher -${ad.discountPercent}%`} tone="coral" />
      </View>

      <View style={styles.overlay}>
        <Text style={styles.business}>🏪 {ad.businessName}</Text>
        <Text style={styles.title}>{ad.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {ad.description}
        </Text>

        <View style={styles.actions}>
          <Button
            title={t('radar.ad.saveVoucher')}
            variant="gold"
            onPress={handleSaveVoucher}
            style={{ flex: 1 }}
          />
          <Button title="Bỏ qua →" variant="outline" size="sm" onPress={onPassAd} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 390,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    backgroundColor: COLORS.darkNavy,
    borderWidth: 2.5,
    borderColor: COLORS.goldVip,
    position: 'relative',
    ...SHADOWS.card,
  },
  image: { width: '100%', height: '100%', position: 'absolute' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 29, 36, 0.88)',
    padding: SPACING.md,
    gap: 6,
  },
  business: { ...TYPOGRAPHY.caption, color: COLORS.goldVip, fontWeight: '800' },
  title: { ...TYPOGRAPHY.h3, color: COLORS.white },
  desc: { ...TYPOGRAPHY.caption, color: '#E2E8F0', marginBottom: 6 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
});
