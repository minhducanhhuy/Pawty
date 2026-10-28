import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { Avatar, Badge, Button, Card } from '../components';
import { DeepBioTab } from './profile/DeepBioTab';
import { BossSwitcherModal } from './profile/BossSwitcherModal';
import { MomentItem } from '../types';
import { api } from '../api/endpoints';
import { useAuth, useActivePet, useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';
import { useTranslation } from '../i18n';

const GRID_SIZE = (Dimensions.get('window').width - 36) / 3;

export const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const { pets, activePet, switchPet, addPet } = useActivePet();
  const { config, showToast } = useAppConfig();
  const { navigate } = useNavigation();
  const { t } = useTranslation();

  const [tab, setTab] = useState<'moments' | 'bio'>('bio');
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    api.getFeed('mine').then((res) => setMoments(res.items)).catch(() => {});
  }, []);

  if (!activePet) return null;
  const maxPets = config.tiers[user?.vipTier || 'free'].maxPets;

  const quickLinks: { icon: string; label: string; onPress: () => void }[] = [
    { icon: '💉', label: 'Sổ tiêm', onPress: () => navigate('VaccineUpload', { petId: activePet.id }) },
    { icon: '⏰', label: 'Nhắc lịch', onPress: () => navigate('Reminders') },
    { icon: '🏅', label: 'Huy hiệu', onPress: () => navigate('Badges') },
    { icon: '🎟️', label: 'Voucher', onPress: () => navigate('Vouchers') },
    { icon: '🎁', label: 'Mời bạn', onPress: () => navigate('Referral') },
    { icon: '🏘️', label: 'Câu lạc bộ', onPress: () => navigate('Clubs') },
    { icon: '🎪', label: 'Sự kiện', onPress: () => navigate('Events') },
    { icon: '📍', label: 'Điểm hẹn', onPress: () => navigate('Places') },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card style={styles.headerCard}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.switcherBtn} onPress={() => setSwitcherOpen(true)}>
            <Text style={styles.switcherText}>🐾 Đổi Boss ({pets.length}/{maxPets}) ▾</Text>
          </TouchableOpacity>
          <View style={styles.rightBtns}>
            <TouchableOpacity style={styles.streakPill} onPress={() => navigate('Badges')}>
              <Text style={styles.streakText}>🔥 {user?.walkStreakDays || 4} ngày</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => navigate('Settings')}>
              <Text style={styles.settingsText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileRow}>
          <Avatar uri={activePet.avatarUrl} size={76} isVip={user?.isVip} isWalkingNow={user?.isWalkingNow} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{activePet.name}</Text>
            <Text style={styles.breed}>{activePet.breed} • {activePet.weightKg}kg</Text>
            <Text style={styles.condo}>🏢 {user?.condoComplex}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              <Badge text={user?.isVip ? `👑 ${user.vipTier.toUpperCase()}` : 'Gói Free'} tone={user?.isVip ? 'gold' : 'coral'} />
              {activePet.isSafePet && <Badge text="🛡️ Safe Pet" tone="mint" />}
            </View>
          </View>
        </View>
        <Text style={styles.bio}>"{activePet.bio}"</Text>
        <Button title="👑 Nâng Cấp Đặc Quyền Sen VIP / Mua Boost" variant="gold" size="sm" onPress={() => navigate('Paywall')} />
      </Card>

      <View style={styles.quickGrid}>
        {quickLinks.map((q) => (
          <TouchableOpacity key={q.label} style={styles.quickItem} onPress={q.onPress}>
            <Text style={styles.quickIcon}>{q.icon}</Text>
            <Text style={styles.quickLabel}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabSwitch}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'moments' && styles.tabBtnActive]} onPress={() => setTab('moments')}>
          <Text style={[styles.tabText, tab === 'moments' && styles.tabTextActive]}>{t('profile.tab.moments')} ({moments.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'bio' && styles.tabBtnActive]} onPress={() => setTab('bio')}>
          <Text style={[styles.tabText, tab === 'bio' && styles.tabTextActive]}>{t('profile.tab.bio')}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'moments' ? (
        <View style={styles.gridWrap}>
          {moments.map((m) => (
            <Image key={m.id} source={{ uri: m.mediaUrl }} style={styles.gridImg} />
          ))}
        </View>
      ) : (
        <DeepBioTab
          pet={activePet}
          isOwner
          onUploadVaccine={() => navigate('VaccineUpload', { petId: activePet.id })}
          onOpenReminders={() => navigate('Reminders')}
        />
      )}

      <BossSwitcherModal
        visible={switcherOpen} pets={pets} activePetId={activePet.id} maxPets={maxPets}
        onSelectPet={switchPet}
        onAddBoss={async (data) => { await addPet(data); showToast('Đã thêm Boss mới!', 'success'); }}
        onOpenPaywall={() => { setSwitcherOpen(false); navigate('Paywall', { highlight: 'vip' }); }}
        onClose={() => setSwitcherOpen(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 32 },
  headerCard: { gap: SPACING.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switcherBtn: { backgroundColor: COLORS.coralLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  switcherText: { ...TYPOGRAPHY.caption, color: COLORS.coralDark, fontWeight: '800' },
  rightBtns: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakPill: { backgroundColor: COLORS.goldLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  streakText: { ...TYPOGRAPHY.caption, color: COLORS.goldDark, fontWeight: '800' },
  settingsBtn: { backgroundColor: COLORS.creamWarm, padding: 6, borderRadius: 16 },
  settingsText: { fontSize: 16 },
  profileRow: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center' },
  name: { ...TYPOGRAPHY.h2, color: COLORS.textDark },
  breed: { ...TYPOGRAPHY.caption, color: COLORS.textBody, fontWeight: '700' },
  condo: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  bio: { ...TYPOGRAPHY.body, fontStyle: 'italic', color: COLORS.textBody },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  quickItem: { width: '23%', backgroundColor: COLORS.white, paddingVertical: 10, borderRadius: RADIUS.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  quickIcon: { fontSize: 20, marginBottom: 2 },
  quickLabel: { ...TYPOGRAPHY.caption, fontSize: 11, color: COLORS.textDark },
  tabSwitch: { flexDirection: 'row', backgroundColor: COLORS.creamWarm, borderRadius: RADIUS.pill, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.pill, alignItems: 'center' },
  tabBtnActive: { backgroundColor: COLORS.coral },
  tabText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, fontWeight: '700' },
  tabTextActive: { color: COLORS.white },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  gridImg: { width: GRID_SIZE, height: GRID_SIZE, borderRadius: RADIUS.md },
});
