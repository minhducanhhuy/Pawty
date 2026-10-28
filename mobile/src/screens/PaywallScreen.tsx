import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Badge, Chip, ConfettiOverlay } from '../components';
import { VietQrModal, QrPaymentData } from './paywall/VietQrModal';
import { api } from '../api/endpoints';
import { useAuth, useAppConfig } from '../context';
import { useTranslation } from '../i18n';

export const PaywallScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useAppConfig();
  const { t } = useTranslation();

  const [billingPlan, setBillingPlan] = useState<'month' | 'year'>('month');
  const [qrData, setQrData] = useState<QrPaymentData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const startCheckout = async (serviceType: string, plan?: 'month' | 'year') => {
    try {
      const res = await api.createQrPayment(serviceType, plan);
      setQrData({ ...res, serviceType });
    } catch (err) {
      showToast('Không thể khởi tạo mã VietQR.', 'error');
    }
  };

  const handlePaymentSuccess = async () => {
    setQrData(null);
    setShowConfetti(true);
    await refreshUser();
    showToast('🎉 Thanh toán thành công! Đã kích hoạt đặc quyền.', 'success');
    setTimeout(() => setShowConfetti(false), 2500);
  };

  return (
    <View style={styles.screen}>
      <ConfettiOverlay visible={showConfetti} />
      <HeaderBar title={t('paywall.title')} subtitle={`Hạng hiện tại: ${(user?.vipTier || 'free').toUpperCase()}`} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.planToggle}>
          <Chip label="Thanh toán Tháng" selected={billingPlan === 'month'} onPress={() => setBillingPlan('month')} />
          <Chip label="Gói Năm (-32% Tiết kiệm)" selected={billingPlan === 'year'} onPress={() => setBillingPlan('year')} tone="gold" />
        </View>

        <Card variant="goldBorder" style={styles.tierCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.tierTitle}>👑 Gói Sen VIP</Text>
            <Badge text="Phổ biến nhất" tone="gold" />
          </View>
          <Text style={styles.price}>
            {billingPlan === 'month' ? '49.000đ / tháng' : '399.000đ / năm'}
          </Text>
          <Text style={styles.feature}>✅ Quẹt thẻ không giới hạn & Rewind vô hạn</Text>
          <Text style={styles.feature}>✅ 5 Super Paw/ngày + 1 Boost/tuần + 2 hồ sơ Boss</Text>
          <Text style={styles.feature}>✅ Kho ảnh Khoảnh khắc không giới hạn + Xem ai thích bạn</Text>
          <Text style={styles.feature}>✅ Vương miện vàng VIP 👑 & Ưu tiên hiển thị Radar ×3</Text>
          <Button title="Nâng cấp Sen VIP ngay" variant="gold" onPress={() => startCheckout('vip_subscription', billingPlan)} />
        </Card>

        <Card variant="mint" style={styles.tierCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.tierTitle}>💎 Gói Sen VIP+</Text>
            <Badge text="Siêu Đặc Quyền" tone="coral" />
          </View>
          <Text style={styles.price}>99.000đ / tháng</Text>
          <Text style={styles.feature}>✨ Mọi quyền lợi VIP + Tối đa 5 hồ sơ Boss</Text>
          <Text style={styles.feature}>✨ 10 Super Paw/ngày + 3 Boost/tuần</Text>
          <Text style={styles.feature}>✨ Ẩn toàn bộ quảng cáo Native Ads & Nhắc lịch nâng cao</Text>
          <Button title="Nâng cấp VIP+ (99k)" onPress={() => startCheckout('vip_plus_subscription', 'month')} />
        </Card>

        <Card style={styles.tierCard}>
          <Text style={styles.tierTitle}>🌱 Gói Miễn Phí (Free)</Text>
          <Text style={styles.feature}>• 20 lượt quẹt/ngày • 1 Super Paw/ngày • Tối đa 5 ảnh & 1 Boss</Text>
        </Card>

        <Text style={styles.sectionTitle}>⚡ Mua Lẻ Tăng Tốc Tức Thì (IAP)</Text>
        <View style={styles.iapRow}>
          <Card style={styles.iapCard}>
            <Text style={styles.iapTitle}>⚡ 1 Boost 30p</Text>
            <Text style={styles.iapPrice}>15.000đ</Text>
            <Text style={styles.iapSub}>Đẩy đầu Radar ×5</Text>
            <Button title="Mua" size="sm" onPress={() => startCheckout('boost')} />
          </Card>
          <Card style={styles.iapCard}>
            <Text style={styles.iapTitle}>⭐ 5 Super Paw</Text>
            <Text style={styles.iapPrice}>29.000đ</Text>
            <Text style={styles.iapSub}>Không giới hạn hạn dùng</Text>
            <Button title="Mua" size="sm" variant="gold" onPress={() => startCheckout('super_like_pack')} />
          </Card>
          <Card style={styles.iapCard}>
            <Text style={styles.iapTitle}>🚀 Gói 3 Boost</Text>
            <Text style={styles.iapPrice}>39.000đ</Text>
            <Text style={styles.iapSub}>Tiết kiệm 15%</Text>
            <Button title="Mua" size="sm" variant="mint" onPress={() => startCheckout('boost_pack')} />
          </Card>
        </View>
      </ScrollView>

      <VietQrModal
        visible={Boolean(qrData)}
        qrData={qrData}
        onSuccess={handlePaymentSuccess}
        onClose={() => setQrData(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 40 },
  planToggle: { flexDirection: 'row', justifyContent: 'center' },
  tierCard: { gap: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierTitle: { ...TYPOGRAPHY.h3, color: COLORS.textDark },
  price: { ...TYPOGRAPHY.h2, color: COLORS.coral, marginBottom: 4 },
  feature: { ...TYPOGRAPHY.body, color: COLORS.textBody },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textDark, marginTop: SPACING.xs },
  iapRow: { flexDirection: 'row', gap: SPACING.sm },
  iapCard: { flex: 1, padding: SPACING.sm + 2, alignItems: 'center', gap: 4 },
  iapTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark, textAlign: 'center' },
  iapPrice: { ...TYPOGRAPHY.bodyBold, color: COLORS.coral },
  iapSub: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.textMuted, textAlign: 'center', marginBottom: 4 },
});
