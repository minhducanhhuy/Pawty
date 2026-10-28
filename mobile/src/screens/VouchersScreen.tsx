import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Badge, EmptyState } from '../components';
import { VoucherItem } from '../types';
import { api } from '../api/endpoints';
import { useAppConfig } from '../context';
import { useTranslation } from '../i18n';

export const VouchersScreen: React.FC = () => {
  const { showToast } = useAppConfig();
  const { t } = useTranslation();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);

  useEffect(() => {
    api.getMyVouchers().then(setVouchers).catch(() => {});
  }, []);

  const handleCopy = async (code: string) => {
    await Clipboard.setStringAsync(code);
    showToast(`🎟️ ${t('common.copied')} (${code})`, 'success');
  };

  return (
    <View style={styles.screen}>
      <HeaderBar title="🎟️ Ví Voucher Ưu Đãi Nội Khu" subtitle="Đưa mã PAW-XXXXXX cho cửa hàng đối tác để giảm giá" />
      <ScrollView contentContainerStyle={styles.content}>
        {vouchers.length === 0 ? (
          <EmptyState
            icon="🎟️"
            title="Ví Voucher đang trống"
            subtitle="Hãy lưu các thẻ Native Ad ưu đãi -35% khi quẹt Radar!"
          />
        ) : (
          vouchers.map((v) => (
            <Card key={v.id} variant="goldBorder" style={styles.card}>
              <View style={styles.rowBetween}>
                <Badge text={`GIẢM -${v.discountPercent}%`} tone="coral" />
                <Badge
                  text={v.status === 'saved' ? '✓ CÒN HIỆU LỰC' : v.status.toUpperCase()}
                  tone={v.status === 'saved' ? 'success' : 'gold'}
                />
              </View>
              <Text style={styles.biz}>🏪 {v.businessName}</Text>
              <Text style={styles.title}>{v.title}</Text>
              <Text style={styles.exp}>⏳ Hạn sử dụng: {v.expiresAt} (Hiệu lực 14 ngày)</Text>

              <View style={styles.codeRow}>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{v.code}</Text>
                </View>
                <Button title={t('common.copy')} size="sm" variant="gold" onPress={() => handleCopy(v.code)} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md },
  card: { gap: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  biz: { ...TYPOGRAPHY.caption, color: COLORS.coralDark, fontWeight: '800' },
  title: { ...TYPOGRAPHY.h3, color: COLORS.textDark },
  exp: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 6 },
  codeBox: {
    flex: 1, backgroundColor: COLORS.creamWarm, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.coral,
  },
  codeText: { ...TYPOGRAPHY.bodyBold, color: COLORS.coralDark, letterSpacing: 1.5, textAlign: 'center' },
});
