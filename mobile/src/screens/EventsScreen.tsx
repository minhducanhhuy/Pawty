import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Image, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Badge, ModalSheet } from '../components';
import { EventItem } from '../types';
import { api } from '../api/endpoints';
import { useAppConfig } from '../context';

export const EventsScreen: React.FC<{ clubId?: string }> = ({ clubId }) => {
  const { showToast } = useAppConfig();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [placeName, setPlaceName] = useState('Bãi cỏ ven sông Vinhomes Central Park');
  const [startsAt, setStartsAt] = useState('Chủ Nhật • 16:30');
  const [capacity, setCapacity] = useState('25');
  const [description, setDescription] = useState('');

  useEffect(() => {
    api.getEvents().then((res) => setEvents(res.items)).catch(() => {});
  }, []);

  const handleRsvp = async (ev: EventItem, status: 'going' | 'maybe') => {
    if (status === 'going' && ev.rsvpCount >= ev.capacity && ev.myRsvp !== 'going') {
      showToast('EVENT_FULL: Sự kiện đã đủ số lượng Boss tham gia!', 'error');
      return;
    }
    const res = await api.rsvpEvent(ev.id, status);
    setEvents((prev) =>
      prev.map((x) => (x.id === ev.id ? { ...x, myRsvp: status, rsvpCount: res.rsvpCount } : x)),
    );
    showToast(status === 'going' ? '🎉 Đã xác nhận Tham gia! Sẽ nhắc lịch trước 1 giờ.' : 'Đã đánh dấu Quan tâm.', 'success');
  };

  const handleCreateEvent = async () => {
    if (!title.trim()) return;
    const created = await api.createEvent({
      clubId,
      title: title.trim(),
      placeName,
      startsAt,
      capacity: parseInt(capacity, 10) || 25,
      description: description.trim() || 'Giao lưu cuối tuần vui nhộn cho các Boss!',
    });
    setEvents((prev) => [created, ...prev]);
    setCreateOpen(false);
    setTitle('');
    showToast('🎪 Đã tạo sự kiện Offline mới!', 'success');
  };

  return (
    <View style={styles.screen}>
      <HeaderBar
        title="🎪 Sự Kiện & Offline Thú Cưng"
        subtitle="Nhắc tự động 1 giờ trước giờ bóng lăn"
        rightElement={<Button title="+ Tạo Sự kiện" size="sm" onPress={() => setCreateOpen(true)} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {events.map((ev) => {
          const isFull = ev.rsvpCount >= ev.capacity;
          return (
            <Card key={ev.id} style={styles.evCard}>
              <Image source={{ uri: ev.coverUrl }} style={styles.cover} />
              <View style={styles.rowBetween}>
                <Badge text={`⏰ ${ev.startsAt}`} tone="coral" />
                <Badge
                  text={`👥 ${ev.rsvpCount}/${ev.capacity} Boss ${isFull ? '(ĐẦY)' : ''}`}
                  tone={isFull ? 'danger' : 'mint'}
                />
              </View>
              <Text style={styles.title}>{ev.title}</Text>
              <Text style={styles.place}>📍 {ev.placeName}</Text>
              <Text style={styles.desc}>{ev.description}</Text>

              <View style={styles.btnRow}>
                <Button
                  title={ev.myRsvp === 'going' ? '✓ Sẽ Tham Gia (Going)' : 'Tham Gia Ngay'}
                  size="sm"
                  variant={ev.myRsvp === 'going' ? 'mint' : 'primary'}
                  onPress={() => handleRsvp(ev, 'going')}
                  style={{ flex: 1 }}
                />
                <Button
                  title={ev.myRsvp === 'maybe' ? '✓ Quan tâm (Maybe)' : 'Có thể'}
                  size="sm"
                  variant="outline"
                  onPress={() => handleRsvp(ev, 'maybe')}
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <ModalSheet visible={createOpen} title="🎪 Tạo Sự Kiện Offline Mới" onClose={() => setCreateOpen(false)}>
        <View style={{ gap: SPACING.sm }}>
          <TextInput style={styles.input} placeholder="Tên sự kiện (VD: Đua Corgi Mùa Thu)" value={title} onChangeText={setTitle} />
          <TextInput style={styles.input} placeholder="Địa điểm tổ chức" value={placeName} onChangeText={setPlaceName} />
          <View style={styles.btnRow}>
            <TextInput style={[styles.input, { flex: 2 }]} placeholder="Thời gian" value={startsAt} onChangeText={setStartsAt} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Sức chứa" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" />
          </View>
          <TextInput style={styles.input} placeholder="Mô tả nội dung sự kiện" value={description} onChangeText={setDescription} />
          <Button title="Đăng Sự Kiện" onPress={handleCreateEvent} />
        </View>
      </ModalSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md },
  evCard: { gap: SPACING.sm },
  cover: { width: '100%', height: 150, borderRadius: RADIUS.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...TYPOGRAPHY.h3, color: COLORS.textDark },
  place: { ...TYPOGRAPHY.caption, color: '#0F766E', fontWeight: '800' },
  desc: { ...TYPOGRAPHY.body, color: COLORS.textBody },
  btnRow: { flexDirection: 'row', gap: SPACING.sm },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body, color: COLORS.textDark,
  },
});
