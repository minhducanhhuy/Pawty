import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { Card, Button, Badge, ModalSheet } from '../../components';
import { WalkAppointment } from '../../types';
import { useTranslation } from '../../i18n';

interface AppointmentBubbleProps {
  appointment: WalkAppointment;
  onUpdateStatus: (status: 'confirmed' | 'rejected' | 'reported_flake') => void;
  onCheckIn: () => void;
  onLiveLocation: () => void;
}

export const AppointmentBubble: React.FC<AppointmentBubbleProps> = ({
  appointment,
  onUpdateStatus,
  onCheckIn,
  onLiveLocation,
}) => {
  const { t } = useTranslation();
  const [flakeModalVisible, setFlakeModalVisible] = useState(false);

  return (
    <Card variant="mint" style={styles.card}>
      <View style={styles.headerRow}>
        <Badge text="🐾 LỜI MỜI HẸN DẮT BOSS DẠO CHUNG" tone="mint" />
        <Badge
          text={appointment.status.toUpperCase()}
          tone={appointment.status === 'confirmed' || appointment.status === 'completed' ? 'success' : 'gold'}
        />
      </View>

      <View style={styles.placeRow}>
        <Image source={{ uri: appointment.placeThumbnail }} style={styles.thumb} />
        <View style={{ flex: 1 }}>
          <Text style={styles.placeName}>📍 {appointment.placeName}</Text>
          <Text style={styles.time}>⏰ {appointment.displayTime}</Text>
          {appointment.note ? <Text style={styles.note}>💬 "{appointment.note}"</Text> : null}
        </View>
      </View>

      {appointment.status === 'pending' && (
        <View style={styles.btnRow}>
          <Button
            title={t('appointment.accept')}
            size="sm"
            variant="mint"
            onPress={() => onUpdateStatus('confirmed')}
            style={{ flex: 1 }}
          />
          <Button
            title={t('appointment.reject')}
            size="sm"
            variant="outline"
            onPress={() => onUpdateStatus('rejected')}
            style={{ flex: 1 }}
          />
        </View>
      )}

      {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
        <View style={styles.confirmedBox}>
          <Text style={styles.confirmedText}>{t('appointment.confirmed')}</Text>
          <View style={styles.btnRow}>
            <Button title={t('appointment.checkIn')} size="sm" onPress={onCheckIn} style={{ flex: 1 }} />
            <Button title={t('appointment.liveLocation')} size="sm" variant="mint" onPress={onLiveLocation} style={{ flex: 1 }} />
          </View>
          <Button
            title={t('appointment.reportFlake')}
            size="sm"
            variant="danger"
            onPress={() => setFlakeModalVisible(true)}
            style={{ marginTop: 4 }}
          />
        </View>
      )}

      <ModalSheet
        visible={flakeModalVisible}
        title="⚠️ Cảnh Báo Chế Tài Báo Cáo Bùng Kèo"
        onClose={() => setFlakeModalVisible(false)}
      >
        <View style={{ gap: SPACING.sm }}>
          <Text style={styles.warningText}>
            • Quy tắc Anti-Flake Pawty: Chỉ bên đã Check-in GPS tại điểm hẹn mới có quyền báo cáo đối phương bùng kèo sau 60 phút.
          </Text>
          <Text style={styles.warningText}>
            • Nếu một tài khoản bị báo cáo bùng kèo 2 lần/tuần sẽ tự động bị KHOÁ QUẸT THẺ RADAR TRONG 3 NGÀY!
          </Text>
          <Button
            title="Xác nhận báo cáo đối phương bùng kèo"
            variant="danger"
            onPress={() => {
              setFlakeModalVisible(false);
              onUpdateStatus('reported_flake');
            }}
          />
        </View>
      </ModalSheet>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { gap: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.mintDark, marginVertical: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
  placeRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: RADIUS.md },
  placeName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  time: { ...TYPOGRAPHY.caption, color: COLORS.coralDark, fontWeight: '800' },
  note: { ...TYPOGRAPHY.caption, color: COLORS.textBody, fontStyle: 'italic' },
  btnRow: { flexDirection: 'row', gap: SPACING.sm },
  confirmedBox: { gap: 6, borderTopWidth: 1, borderTopColor: COLORS.mint, paddingTop: 6 },
  confirmedText: { ...TYPOGRAPHY.caption, color: '#065F46', fontWeight: '800' },
  warningText: { ...TYPOGRAPHY.body, color: COLORS.textBody },
});
