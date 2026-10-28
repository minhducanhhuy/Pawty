import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Badge } from '../components';
import { Club, EventItem } from '../types';
import { api } from '../api/endpoints';
import { useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';

export const ClubDetailScreen: React.FC<{ clubId: string }> = ({ clubId }) => {
  const { showToast } = useAppConfig();
  const { navigate } = useNavigation();

  const [club, setClub] = useState<(Club & { upcomingEvents?: EventItem[] }) | null>(null);

  useEffect(() => {
    api.getClubById(clubId).then(setClub).catch(() => {});
  }, [clubId]);

  if (!club) return null;

  const handleToggleMember = async () => {
    const updated = await api.joinLeaveClub(club.id, !club.isMember);
    setClub({ ...club, isMember: updated.isMember, membersCount: updated.membersCount });
    showToast(updated.isMember ? '🎉 Đã gia nhập CLB!' : 'Đã rời CLB.', 'success');
  };

  return (
    <View style={styles.screen}>
      <HeaderBar title={club.name} subtitle={`${club.membersCount} thành viên hoạt động`} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.heroCard}>
          <Image source={{ uri: club.coverUrl }} style={styles.cover} />
          <View style={styles.rowBetween}>
            <Badge
              text={club.type === 'breed' ? `Giống: ${club.breedOrBuilding}` : `Khu: ${club.breedOrBuilding}`}
              tone="mint"
            />
            <Badge text={club.isMember ? '✓ Thành viên' : 'Khách'} tone={club.isMember ? 'success' : 'gold'} />
          </View>
          <Text style={styles.title}>{club.name}</Text>
          <Text style={styles.desc}>{club.description}</Text>

          <View style={styles.btnRow}>
            <Button
              title={club.isMember ? 'Rời CLB' : '+ Tham Gia Ngay'}
              variant={club.isMember ? 'outline' : 'primary'}
              onPress={handleToggleMember}
              style={{ flex: 1 }}
            />
            <Button
              title="🎪 Sự kiện & Offline"
              variant="mint"
              onPress={() => navigate('Events', { clubId: club.id })}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>🎪 Sự Kiện Sắp Tới Của CLB</Text>
        {(club.upcomingEvents || []).length === 0 ? (
          <Card>
            <Text style={styles.desc}>Chưa có sự kiện nào trong tuần này. Hãy tạo buổi Offline mới!</Text>
            <Button
              title="+ Tạo Sự Kiện Offline Mới"
              size="sm"
              style={{ marginTop: 8 }}
              onPress={() => navigate('Events', { clubId: club.id })}
            />
          </Card>
        ) : (
          (club.upcomingEvents || []).map((ev) => (
            <Card key={ev.id} variant="mint" style={styles.evCard}>
              <Text style={styles.evTitle}>{ev.title}</Text>
              <Text style={styles.evMeta}>⏰ {ev.startsAt} • 📍 {ev.placeName}</Text>
              <Text style={styles.evMeta}>👥 Đã đăng ký: {ev.rsvpCount}/{ev.capacity} Boss</Text>
              <Button title="Xem & Đăng ký RSVP →" size="sm" onPress={() => navigate('Events', { clubId: club.id })} />
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
  heroCard: { gap: SPACING.sm },
  cover: { width: '100%', height: 170, borderRadius: RADIUS.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...TYPOGRAPHY.h2, color: COLORS.textDark },
  desc: { ...TYPOGRAPHY.body, color: COLORS.textBody },
  btnRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: 4 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textDark },
  evCard: { gap: 6 },
  evTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  evMeta: { ...TYPOGRAPHY.caption, color: '#0F766E', fontWeight: '700' },
});
