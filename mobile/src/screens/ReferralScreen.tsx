import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Share, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Badge } from '../components';
import { api } from '../api/endpoints';
import { useAppConfig } from '../context';
import { useTranslation } from '../i18n';

export const ReferralScreen: React.FC = () => {
  const { showToast } = useAppConfig();
  const { t } = useTranslation();

  const [referral, setReferral] = useState({
    code: 'PAWTYBO88',
    invitedCount: 2,
    rewardDaysGranted: 14,
    shareUrl: 'https://pawty.app/invite/PAWTYBO88',
  });

  useEffect(() => {
    api.getReferrals().then(setReferral).catch(() => {});
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referral.code);
    showToast(`🎁 ${t('common.copied')} (${referral.code})`, 'success');
  };

  const handleShare = async () => {
    await Share.share({
      message: `🐾 Nhập mã giới thiệu ${referral.code} khi đăng ký Pawty để cả 2 cùng nhận ngay +7 ngày Sen VIP miễn phí! Tải tại: ${referral.shareUrl}`,
    });
  };

  return (
    <View style={styles.screen}>
      <HeaderBar title="🎁 Giới Thiệu Bạn Bè Nhận VIP" subtitle="Mời cư dân nuôi thú cưng chung cư tham gia Pawty" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="goldBorder" style={styles.heroCard}>
          <Badge text="👑 THƯỞNG ĐÔI: CẢ 2 CÙNG NHẬN +7 NGÀY SEN VIP" tone="gold" />
          <Text style={styles.title}>Chia Sẻ Mã Giới Thiệu Của Bạn</Text>
          <Text style={styles.desc}>
            Khi người bạn mới nhập mã giới thiệu của bạn trong bước Onboarding (hợp lệ trong 7 ngày đầu), cả bạn và người ấy đều được cộng dồn ngay 7 ngày Sen VIP!
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{referral.code}</Text>
          </View>

          <View style={styles.btnRow}>
            <Button title={`📋 ${t('common.copy')}`} variant="outline" onPress={handleCopy} style={{ flex: 1 }} />
            <Button title={`📤 ${t('common.share')}`} variant="gold" onPress={handleShare} style={{ flex: 1 }} />
          </View>
        </Card>

        <Card variant="mint" style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Thành Tích Lan Toả Cộng Đồng</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{referral.invitedCount}/20</Text>
              <Text style={styles.statLabel}>Sen đã mời thành công</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>+{referral.rewardDaysGranted} ngày</Text>
              <Text style={styles.statLabel}>VIP miễn phí đã nhận</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md },
  heroCard: { alignItems: 'center', gap: SPACING.sm + 2 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.textDark, textAlign: 'center' },
  desc: { ...TYPOGRAPHY.body, color: COLORS.textBody, textAlign: 'center' },
  codeBox: {
    width: '100%', backgroundColor: COLORS.creamWarm, paddingVertical: 14,
    borderRadius: RADIUS.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.coral,
    alignItems: 'center', marginVertical: 4,
  },
  codeText: { fontSize: 26, fontWeight: '800', color: COLORS.coralDark, letterSpacing: 3 },
  btnRow: { flexDirection: 'row', gap: SPACING.sm, width: '100%' },
  statsCard: { gap: SPACING.sm },
  statsTitle: { ...TYPOGRAPHY.h3, color: '#0F766E' },
  statsRow: { flexDirection: 'row', gap: SPACING.md },
  statBox: { flex: 1, backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center' },
  statNum: { ...TYPOGRAPHY.h2, color: COLORS.coral },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, textAlign: 'center' },
});
