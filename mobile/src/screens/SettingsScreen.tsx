import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Switch, Share, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Chip } from '../components';
import { api } from '../api/endpoints';
import { useAuth, useAppConfig } from '../context';
import { useTranslation } from '../i18n';

export const SettingsScreen: React.FC = () => {
  const { user, updateUser, logout, deleteAccount } = useAuth();
  const { showToast } = useAppConfig();
  const { locale, setLocale, t } = useTranslation();

  const [blocks, setBlocks] = useState<{ id: string; fullName: string; avatarUrl: string; phone: string }[]>([]);
  const [confirmDeleteStep, setConfirmDeleteStep] = useState(false);

  useEffect(() => {
    api.getBlocks().then(setBlocks).catch(() => {});
  }, []);

  const handleUnblock = async (id: string) => {
    await api.unblockUser(id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    showToast('Đã bỏ chặn người dùng.', 'success');
  };

  const handleExport = async () => {
    const data = await api.exportMe();
    await Share.share({
      message: JSON.stringify(data, null, 2),
      title: 'Pawty_Personal_Data_Export.json',
    });
    showToast('📥 Đã xuất JSON dữ liệu cá nhân!', 'success');
  };

  const handleDeleteAccount = async () => {
    if (!confirmDeleteStep) {
      setConfirmDeleteStep(true);
      showToast('⚠️ Bấm thêm lần nữa để xác nhận xoá mềm tài khoản (30 ngày).', 'error');
      return;
    }
    const scheduled = await deleteAccount();
    showToast(`Tài khoản đã xoá mềm. Xoá cứng vào: ${scheduled.slice(0, 10)}`, 'info');
  };

  const prefs = user?.notificationPrefs || {
    match: true, message: true, appointment: true, sos: true, reminder: true, event: true,
  };

  return (
    <View style={styles.screen}>
      <HeaderBar title={t('settings.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🌐 {t('settings.language')}</Text>
          <View style={styles.row}>
            <Chip label="🇻🇳 Tiếng Việt (VI)" selected={locale === 'vi'} onPress={() => setLocale('vi')} />
            <Chip label="🇬🇧 English (EN)" selected={locale === 'en'} onPress={() => setLocale('en')} />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🔒 Quyền Riêng Tư Địa Điểm & Radar</Text>
          <View style={styles.switchRow}>
            <Text style={styles.label}>{t('settings.distanceHidden')}</Text>
            <Switch
              value={Boolean(user?.isDistanceHidden)}
              onValueChange={(v) => updateUser({ isDistanceHidden: v })}
              trackColor={{ true: COLORS.mintDark, false: COLORS.border }}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🔔 Tuỳ Chỉnh Thông Báo Đẩy (FCM)</Text>
          {(['match', 'message', 'appointment', 'sos', 'reminder', 'event'] as const).map((key) => (
            <View key={key} style={styles.switchRow}>
              <Text style={styles.label}>Thông báo {key.toUpperCase()}</Text>
              <Switch
                value={prefs[key]}
                onValueChange={(v) => updateUser({ notificationPrefs: { ...prefs, [key]: v } })}
                trackColor={{ true: COLORS.coral, false: COLORS.border }}
              />
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🚫 Danh Sách Đã Chặn ({blocks.length})</Text>
          {blocks.length === 0 ? (
            <Text style={styles.muted}>Chưa chặn tài khoản nào.</Text>
          ) : (
            blocks.map((b) => (
              <View key={b.id} style={styles.switchRow}>
                <Text style={styles.label}>{b.fullName} ({b.phone})</Text>
                <Button title="Bỏ chặn" size="sm" variant="outline" onPress={() => handleUnblock(b.id)} />
              </View>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <Button title={t('settings.exportData')} variant="mint" onPress={handleExport} />
          <Button
            title={confirmDeleteStep ? '⚠️ XÁC NHẬN XOÁ TÀI KHOẢN BƯỚC 2' : t('settings.deleteAccount')}
            variant="danger"
            onPress={handleDeleteAccount}
          />
          <Button title={t('settings.logout')} variant="outline" onPress={logout} />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 40 },
  card: { gap: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  row: { flexDirection: 'row', gap: SPACING.sm },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  label: { ...TYPOGRAPHY.body, color: COLORS.textBody, flex: 1, marginRight: 8 },
  muted: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
});
