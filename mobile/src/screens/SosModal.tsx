import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Badge } from '../components';
import { VietQrModal, QrPaymentData } from './paywall/VietQrModal';
import { api } from '../api/endpoints';
import { useActivePet, useAuth, useAppConfig, useNotifications } from '../context';
import { useNavigation } from '../navigation/NavigationContext';
import { useTranslation } from '../i18n';

export const SosModal: React.FC = () => {
  const { activePet } = useActivePet();
  const { user } = useAuth();
  const { showToast } = useAppConfig();
  const { pushLocalNotification } = useNotifications();
  const { navigate } = useNavigation();
  const { t } = useTranslation();

  const [petName, setPetName] = useState(activePet?.name || 'Bơ Lùn');
  const [lastSeenAddress, setLastSeenAddress] = useState('Hầm gửi xe B1 - Park 3 Vinhomes Central Park');
  const [rewardAmountVnd, setRewardAmountVnd] = useState('5.000.000 VNĐ');
  const [contactPhone, setContactPhone] = useState(user?.phone || '0908123456');
  const [notes, setNotes] = useState('Bé đeo vòng cổ bảng tên màu xanh mint, thấy người lạ gọi tên sẽ vẫy đuôi.');
  const [qrData, setQrData] = useState<QrPaymentData | null>(null);

  const handleStartQr = async () => {
    try {
      const res = await api.createQrPayment('sos_emergency');
      setQrData({ ...res, serviceType: 'sos_emergency' });
    } catch {
      showToast('Không thể tạo mã VietQR SOS.', 'error');
    }
  };

  const handleAfterPaid = async () => {
    setQrData(null);
    await api.createSos({
      petName,
      species: activePet?.species || 'dog',
      breed: activePet?.breed || 'Corgi Pembroke',
      petPhotoUrl: activePet?.avatarUrl || 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=500',
      lastSeenAddress,
      rewardAmountVnd,
      contactPhone,
      notes,
    });
    pushLocalNotification({
      type: 'sos',
      title: `🚨 BÁO ĐỘNG SOS: Tìm ${petName} lạc!`,
      body: `Tại ${lastSeenAddress}. Hậu tạ ${rewardAmountVnd}. Nhấn để hỗ trợ!`,
    });
    showToast('🚨 Đã phát sóng SOS khẩn cấp bán kính 3km!', 'success');
    navigate('SosNearby');
  };

  return (
    <View style={styles.screen}>
      <HeaderBar
        title={t('sos.createTitle')}
        subtitle="Bắn Push Notification khẩn cấp bán kính 3km"
        rightElement={<Button title="Danh sách SOS" size="sm" variant="outline" onPress={() => navigate('SosNearby')} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Badge text="🚨 CƠ CHẾ BÁO ĐỘNG KHẨN CẤP POSTGIS 3KM (39.000Đ)" tone="danger" />
          <Text style={styles.label}>Tên Boss bị lạc</Text>
          <TextInput style={styles.input} value={petName} onChangeText={setPetName} />

          <Text style={styles.label}>Vị trí mất dấu / Rơi dây dắt</Text>
          <TextInput style={styles.input} value={lastSeenAddress} onChangeText={setLastSeenAddress} />

          <Text style={styles.label}>Mức tiền hậu tạ & SĐT liên hệ khẩn cấp</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} value={rewardAmountVnd} onChangeText={setRewardAmountVnd} />
            <TextInput style={[styles.input, { flex: 1 }]} value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
          </View>

          <Text style={styles.label}>Đặc điểm nhận dạng (Vòng cổ, màu lông, thói quen)</Text>
          <TextInput style={[styles.input, { height: 68 }]} multiline value={notes} onChangeText={setNotes} />

          <Button title="🚨 Tạo Mã VietQR 39.000đ & Phát Sóng SOS" variant="danger" onPress={handleStartQr} />
        </Card>
      </ScrollView>

      <VietQrModal
        visible={Boolean(qrData)}
        qrData={qrData}
        onSuccess={handleAfterPaid}
        onClose={() => setQrData(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md },
  card: { gap: SPACING.sm + 2 },
  label: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: '700' },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body, color: COLORS.textDark,
  },
  row: { flexDirection: 'row', gap: SPACING.sm },
});
