import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Badge } from '../components';
import { BadgeItem } from '../types';
import { api } from '../api/endpoints';
import { useTranslation } from '../i18n';

export const BadgesScreen: React.FC = () => {
  const { locale } = useTranslation();
  const [badges, setBadges] = useState<{ earned: BadgeItem[]; locked: BadgeItem[] }>({ earned: [], locked: [] });
  const [streak, setStreak] = useState<{
    streakDays: number;
    totalWalkMeters: number;
    recentWalks: { id: string; date: string; distanceMeters: number; durationMinutes: number; source: string }[];
  }>({ streakDays: 4, totalWalkMeters: 6420, recentWalks: [] });

  useEffect(() => {
    api.getBadges().then(setBadges).catch(() => {});
    api.getStreak().then(setStreak).catch(() => {});
  }, []);

  return (
    <View style={styles.screen}>
      <HeaderBar title="🏅 Huy Hiệu & Chuỗi Streak Dắt Dạo" subtitle="Gamification nâng cao sức khoẻ cho Boss" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="mint" style={styles.streakCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.streakBig}>🔥 {streak.streakDays} Ngày Liên Tiếp</Text>
            <Badge text={`Tổng: ${(streak.totalWalkMeters / 1000).toFixed(2)} km`} tone="coral" />
          </View>
          <Text style={styles.subText}>Duy trì dắt dạo đủ 7 ngày để mở khoá huy hiệu Chiến Thần Dắt Dạo!</Text>
          {streak.recentWalks.map((w) => (
            <View key={w.id} style={styles.walkRow}>
              <Text style={styles.walkText}>🐾 {w.date} ({w.source === 'walk_now' ? 'Walk Now' : 'Hẹn dạo'})</Text>
              <Text style={styles.walkDist}>{w.distanceMeters}m • {w.durationMinutes} phút</Text>
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>🏆 Huy Hiệu Đã Đạt Được ({badges.earned.length})</Text>
        <View style={styles.grid}>
          {badges.earned.map((b) => (
            <Card key={b.code} variant="goldBorder" style={styles.badgeCard}>
              <Text style={styles.icon}>{b.icon}</Text>
              <Text style={styles.bName}>{locale === 'en' ? b.nameEn : b.nameVi}</Text>
              <Text style={styles.bDesc}>{locale === 'en' ? b.descriptionEn : b.descriptionVi}</Text>
              <Badge text={`✓ Đạt ${b.earnedAt || ''}`} tone="success" />
            </Card>
          ))}
        </View>

        <Text style={styles.sectionTitle}>🔒 Huy Hiệu Đang Chinh Phục ({badges.locked.length})</Text>
        {badges.locked.map((b) => {
          const pct = Math.min(100, Math.round(((b.progress || 0) / (b.target || 1)) * 100));
          return (
            <Card key={b.code} style={styles.lockedCard}>
              <View style={styles.row}>
                <Text style={styles.icon}>{b.icon}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.bName}>{locale === 'en' ? b.nameEn : b.nameVi}</Text>
                    <Text style={styles.progressLabel}>{b.progress || 0}/{b.target || 1}</Text>
                  </View>
                  <Text style={styles.bDesc}>{locale === 'en' ? b.descriptionEn : b.descriptionVi}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 32 },
  streakCard: { gap: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakBig: { ...TYPOGRAPHY.h2, color: COLORS.coral },
  subText: { ...TYPOGRAPHY.caption, color: COLORS.textBody },
  walkRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4, borderTopWidth: 1, borderTopColor: COLORS.mint },
  walkText: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: '700' },
  walkDist: { ...TYPOGRAPHY.caption, color: '#0F766E', fontWeight: '800' },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textDark },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  badgeCard: { width: '48%', alignItems: 'center', gap: 4, padding: SPACING.md },
  icon: { fontSize: 32 },
  bName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  bDesc: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  lockedCard: { padding: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center' },
  progressLabel: { ...TYPOGRAPHY.caption, color: COLORS.coral, fontWeight: '800' },
  barTrack: { height: 8, backgroundColor: COLORS.creamWarm, borderRadius: RADIUS.pill, marginTop: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.coral, borderRadius: RADIUS.pill },
});
