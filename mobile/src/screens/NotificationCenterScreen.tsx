import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, EmptyState } from '../components';
import { NotificationItem } from '../types';
import { useNotifications, useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';

export const NotificationCenterScreen: React.FC = () => {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const { showToast } = useAppConfig();
  const { navigate } = useNavigation();

  const handlePressItem = (item: NotificationItem) => {
    if (item.type === 'match' || item.type === 'message' || item.type === 'appointment') {
      navigate('ChatRoom', { roomId: item.payload?.roomId || 'room_mochi_01' });
    } else if (item.type === 'sos') {
      navigate('SosNearby');
    } else if (item.type === 'reminder') {
      navigate('Reminders');
    } else if (item.type === 'event') {
      navigate('Events');
    } else if (item.type === 'badge') {
      navigate('Badges');
    } else if (item.type === 'referral') {
      navigate('Referral');
    }
  };

  return (
    <View style={styles.screen}>
      <HeaderBar
        title="🔔 Trung Tâm Thông Báo"
        subtitle={`${unreadCount} thông báo chưa đọc`}
        rightElement={
          <Button
            title="Đọc tất cả"
            size="sm"
            variant="outline"
            onPress={async () => {
              await markAllRead();
              showToast('Đã đánh dấu đã đọc toàn bộ thông báo.', 'success');
            }}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <EmptyState icon="🔔" title="Chưa có thông báo nào" subtitle="Các thông báo Match, Kèo hẹn và SOS sẽ hiển thị tại đây." />
        ) : (
          notifications.map((item) => (
            <TouchableOpacity key={item.id} activeOpacity={0.85} onPress={() => handlePressItem(item)}>
              <Card variant={item.isRead ? 'white' : 'mint'} style={styles.card}>
                <View style={styles.row}>
                  {!item.isRead && <View style={styles.unreadDot} />}
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.time}>{item.createdAt}</Text>
                    </View>
                    <Text style={styles.body}>{item.body}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.sm + 2 },
  card: { padding: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.coral },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  title: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark, flex: 1 },
  time: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.textMuted },
  body: { ...TYPOGRAPHY.body, color: COLORS.textBody },
});
