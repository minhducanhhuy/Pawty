import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Badge, ConfettiOverlay } from '../components';
import { WalkAppointment } from '../types';
import { api } from '../api/endpoints';
import { useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';

export const CheckInScreen: React.FC<{ appointment: WalkAppointment }> = ({ appointment }) => {
  const { showToast } = useAppConfig();
  const { goBack } = useNavigation();

  const [distanceMeters, setDistanceMeters] = useState<number>(85);
  const [checkedIn, setCheckedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const canCheckIn = distanceMeters <= 150;

  const handleCheckIn = async () => {
    if (!canCheckIn) {
      showToast('TOO_FAR_FROM_PLACE: Bạn cần ở trong bán kính 150m quanh điểm hẹn!', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.checkInAppointment(appointment.id, appointment.placeLat, appointment.placeLng);
      setCheckedIn(true);
      showToast('🎉 Check-in GPS thành công! Kèo hẹn hoàn tất (+1 Tiến độ Huy hiệu)', 'success');
    } catch {
      showToast('Không thể Check-in lúc này.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ConfettiOverlay visible={checkedIn} />
      <HeaderBar title="📍 Check-in GPS Điểm Hẹn" subtitle={appointment.placeName} />

      <View style={styles.content}>
        <Card variant="mint" style={styles.card}>
          <Badge
            text={canCheckIn ? '✓ TRONG BÁN KÍNH HỢP LỆ (≤150M)' : '⚠️ NGOÀI BÁN KÍNH 150M'}
            tone={canCheckIn ? 'success' : 'danger'}
          />
          <Text style={styles.distanceBig}>{distanceMeters}m</Text>
          <Text style={styles.subText}>Khoảng cách GPS hiện tại tới {appointment.placeName}</Text>

          <View style={styles.simRow}>
            <Button title="Giả lập GPS 65m (Hợp lệ)" size="sm" variant="outline" onPress={() => setDistanceMeters(65)} />
            <Button title="Giả lập GPS 320m (Quá xa)" size="sm" variant="outline" onPress={() => setDistanceMeters(320)} />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.statusTitle}>Trạng thái xác nhận 2 bên</Text>
          <Text style={styles.statusLine}>
            • Bạn (Sen Bơ Lùn): {checkedIn ? '✅ Đã Check-in GPS' : '⏳ Chưa Check-in'}
          </Text>
          <Text style={styles.statusLine}>
            • Đối phương (Sen Mochi): ✅ Đã có mặt tại điểm hẹn
          </Text>
          <Text style={styles.ruleNote}>
            💡 Quy tắc Anti-Flake: Cửa sổ Check-in mở từ −30 phút đến +60 phút quanh giờ hẹn ({appointment.displayTime}).
          </Text>

          {!checkedIn ? (
            <Button
              title="📍 Xác Nhận Check-in Có Mặt Ngay"
              disabled={!canCheckIn}
              loading={loading}
              onPress={handleCheckIn}
            />
          ) : (
            <Button title="🎉 Quay lại phòng Chat" variant="mint" onPress={goBack} />
          )}
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md },
  card: { alignItems: 'center', gap: SPACING.sm },
  distanceBig: { fontSize: 48, fontWeight: '800', color: COLORS.coral },
  subText: { ...TYPOGRAPHY.body, color: COLORS.textBody, textAlign: 'center' },
  simRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: 4 },
  statusTitle: { ...TYPOGRAPHY.h3, color: COLORS.textDark, alignSelf: 'flex-start' },
  statusLine: { ...TYPOGRAPHY.bodyBold, color: COLORS.textBody, alignSelf: 'flex-start' },
  ruleNote: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginVertical: 4 },
});
