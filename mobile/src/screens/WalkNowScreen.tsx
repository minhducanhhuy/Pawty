import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Avatar, Badge, ModalSheet } from '../components';
import { api } from '../api/endpoints';
import { useAuth, useActivePet, useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';
import { useTranslation } from '../i18n';
import { Pet } from '../types';

export const WalkNowScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { activePet } = useActivePet();
  const { showToast } = useAppConfig();
  const { navigate } = useNavigation();
  const { t } = useTranslation();

  const [isWalking, setIsWalking] = useState(Boolean(user?.isWalkingNow));
  const [secondsLeft, setSecondsLeft] = useState(1800);
  const [liveWalkers, setLiveWalkers] = useState<{ pet: Pet; distanceGridMeters: number; condoComplex?: string; walkingMinutesLeft: number }[]>([]);
  const [summary, setSummary] = useState<{ distanceMeters: number; streakDays: number; newBadges: string[] } | null>(null);

  useEffect(() => {
    api.getLiveWalkers(10.7951, 106.7218).then(setLiveWalkers).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isWalking) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isWalking]);

  const handleStart = async () => {
    await api.startWalk(10.7951, 106.7218, activePet?.id);
    setIsWalking(true);
    setSecondsLeft(1800);
    await refreshUser();
    showToast('🟢 Đã bật chế độ Dắt dạo ngay (30 phút)!', 'success');
  };

  const handleExtend = async () => {
    await api.heartbeatWalk(10.7951, 106.7218);
    setSecondsLeft((prev) => prev + 1800);
    showToast('⏳ Đã gia hạn thêm 30 phút dắt dạo!', 'success');
  };

  const handleStop = async () => {
    const res = await api.stopWalk();
    setIsWalking(false);
    setSummary(res);
    await refreshUser();
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <View style={styles.screen}>
      <HeaderBar title={t('walkNow.title')} subtitle="Chia sẻ vị trí lưới 100m an toàn" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="mint" style={styles.timerCard}>
          <Badge text={isWalking ? '🟢 ĐANG PHÁT TÍN HIỆU DẮT DẠO' : '⚪ CHƯA BẬT DẮT DẠO'} tone={isWalking ? 'success' : 'coral'} />
          <Text style={styles.timerText}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </Text>
          <Text style={styles.privacyText}>{t('walkNow.privacy')}</Text>

          {!isWalking ? (
            <Button title="🐕 Bắt đầu dắt dạo 30 phút" onPress={handleStart} style={{ width: '100%' }} />
          ) : (
            <View style={styles.actionRow}>
              <Button title={t('walkNow.extend')} variant="mint" onPress={handleExtend} style={{ flex: 1 }} />
              <Button title={t('walkNow.stop')} variant="danger" onPress={handleStop} style={{ flex: 1 }} />
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>📍 {t('walkNow.nearbyTitle')} ({liveWalkers.length})</Text>
        {liveWalkers.map((w) => (
          <Card key={w.pet.id} style={styles.walkerCard}>
            <View style={styles.walkerRow}>
              <Avatar uri={w.pet.avatarUrl} size={52} isVip={w.pet.ownerIsVip} isWalkingNow />
              <View style={{ flex: 1 }}>
                <Text style={styles.walkerName}>{w.pet.name} ({w.pet.breed})</Text>
                <Text style={styles.walkerSub}>
                  📍 Lưới ~{w.distanceGridMeters}m • {w.condoComplex || 'Vinhomes'}
                </Text>
                <Text style={styles.walkerTime}>🟢 Còn dạo khoảng {w.walkingMinutesLeft} phút</Text>
              </View>
              <Button
                title="Hồ sơ"
                size="sm"
                variant="outline"
                onPress={() => navigate('PetDetail', { petId: w.pet.id })}
              />
            </View>
          </Card>
        ))}
      </ScrollView>

      <ModalSheet
        visible={Boolean(summary)}
        title="🎉 Hoàn Thành Buổi Dắt Dạo!"
        onClose={() => setSummary(null)}
      >
        <Card variant="mint" style={{ alignItems: 'center', gap: 8 }}>
          <Text style={styles.summaryBig}>🏃‍♂️ {summary?.distanceMeters || 850} mét</Text>
          <Text style={styles.walkerName}>🔥 Chuỗi Streak hiện tại: {summary?.streakDays || 5} ngày liên tiếp!</Text>
          {summary?.newBadges?.length ? (
            <Badge text={`🏅 Tiến độ huy hiệu: +1 (${summary.newBadges.join(', ')})`} tone="gold" />
          ) : null}
          <Button title="Xem Huy Hiệu & Streak 🔥" onPress={() => { setSummary(null); navigate('Badges'); }} style={{ width: '100%', marginTop: 8 }} />
        </Card>
      </ModalSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md },
  timerCard: { alignItems: 'center', gap: SPACING.sm },
  timerText: { fontSize: 44, fontWeight: '800', color: COLORS.textDark, letterSpacing: 2 },
  privacyText: { ...TYPOGRAPHY.caption, color: COLORS.textBody, textAlign: 'center', marginBottom: 4 },
  actionRow: { flexDirection: 'row', gap: SPACING.sm, width: '100%' },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textDark, marginTop: SPACING.xs },
  walkerCard: { padding: SPACING.md },
  walkerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  walkerName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  walkerSub: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  walkerTime: { ...TYPOGRAPHY.caption, color: COLORS.success, fontWeight: '700', marginTop: 2 },
  summaryBig: { ...TYPOGRAPHY.h1, color: COLORS.coral },
});
