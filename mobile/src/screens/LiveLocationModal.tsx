import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Badge } from '../components';
import { WalkAppointment } from '../types';
import { useNotifications, useAppConfig } from '../context';

export const LiveLocationModal: React.FC<{ roomId: string; appointment: WalkAppointment }> = ({
  roomId,
  appointment,
}) => {
  const { emitSocket } = useNotifications();
  const { showToast } = useAppConfig();

  const [isSharing, setIsSharing] = useState(true);
  const [myCoords, setMyCoords] = useState({ lat: 10.7952, lng: 106.7219 });
  const [partnerCoords, setPartnerCoords] = useState({ lat: 10.7956, lng: 106.7223 });

  useEffect(() => {
    if (!isSharing) return;
    emitSocket('location_share_start', { roomId, appointmentId: appointment.id });
    const interval = setInterval(() => {
      setMyCoords((prev) => {
        const next = { lat: +(prev.lat + 0.0001).toFixed(5), lng: +(prev.lng + 0.0001).toFixed(5) };
        emitSocket('location_update', { roomId, ...next });
        return next;
      });
      setPartnerCoords((prev) => ({
        lat: +(prev.lat - 0.00005).toFixed(5),
        lng: +(prev.lng - 0.00005).toFixed(5),
      }));
    }, 5000);

    return () => {
      clearInterval(interval);
      emitSocket('location_share_stop', { roomId });
    };
  }, [isSharing, roomId, appointment.id, emitSocket]);

  const handleStop = () => {
    setIsSharing(false);
    emitSocket('location_share_stop', { roomId });
    showToast('Đã dừng chia sẻ vị trí trực tiếp.', 'info');
  };

  return (
    <View style={styles.screen}>
      <HeaderBar title="📡 Vị Trí Trực Tiếp (Live Location)" subtitle={appointment.placeName} />
      <View style={styles.content}>
        <Card variant="mint" style={styles.radarBox}>
          <Badge
            text={isSharing ? '🟢 ĐANG ĐỒNG BỘ SOCKET MỖI 5 GIÂY' : '⚪ ĐÃ TẮT CHIA SẺ'}
            tone={isSharing ? 'success' : 'coral'}
          />
          <Text style={styles.radarTitle}>🗺️ Rada Định Vị Điểm Hẹn</Text>
          <Text style={styles.coordText}>
            📍 Điểm hẹn ({appointment.placeName}): {appointment.placeLat}, {appointment.placeLng}
          </Text>
          <Text style={styles.coordText}>
            🐕 Vị trí của bạn: {myCoords.lat}, {myCoords.lng} (Cách ~45m)
          </Text>
          <Text style={styles.coordText}>
            🐕 Vị trí đối phương: {partnerCoords.lat}, {partnerCoords.lng} (Cách ~60m)
          </Text>
        </Card>

        <Card style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>🔒 Cam Kết Bảo Mật Vị Trí</Text>
          <Text style={styles.privacySub}>
            • Chỉ chia sẻ giữa 2 người trong kèo hẹn đã xác nhận (Confirmed) từ −15 phút đến +60 phút quanh giờ hẹn.
          </Text>
          <Text style={styles.privacySub}>
            • Tọa độ trực tiếp chỉ lưu trên RAM/Socket tạm thời và tự động xoá ngay khi kết thúc.
          </Text>
          {isSharing ? (
            <Button title="Dừng Chia Sẻ Vị Trí Ngay" variant="danger" onPress={handleStop} />
          ) : (
            <Button title="Bật Lại Chia Sẻ Vị Trí" onPress={() => setIsSharing(true)} />
          )}
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md },
  radarBox: { gap: SPACING.sm },
  radarTitle: { ...TYPOGRAPHY.h3, color: COLORS.textDark },
  coordText: { ...TYPOGRAPHY.bodyBold, color: '#0F766E' },
  privacyCard: { gap: SPACING.sm },
  privacyTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  privacySub: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
});
