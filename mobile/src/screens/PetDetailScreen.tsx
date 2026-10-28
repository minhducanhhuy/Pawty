import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Avatar, Badge, Card, Button } from '../components';
import { DeepBioTab } from './profile/DeepBioTab';
import { Pet, MomentItem } from '../types';
import { api } from '../api/endpoints';
import { useNavigation } from '../navigation/NavigationContext';
import { useTranslation } from '../i18n';

const GRID_SIZE = (Dimensions.get('window').width - 36) / 3;

export const PetDetailScreen: React.FC<{ petId: string }> = ({ petId }) => {
  const { navigate } = useNavigation();
  const { t } = useTranslation();

  const [pet, setPet] = useState<Pet | null>(null);
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [tab, setTab] = useState<'bio' | 'moments'>('bio');

  useEffect(() => {
    api.getPetById(petId).then(setPet).catch(() => {});
    api.getFeed('area').then((res) => setMoments(res.items)).catch(() => {});
  }, [petId]);

  if (!pet) return null;

  return (
    <View style={styles.screen}>
      <HeaderBar title={`Hồ sơ ${pet.name}`} subtitle={pet.condoComplex || 'Vinhomes Central Park'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.row}>
            <Avatar uri={pet.avatarUrl} size={82} isVip={pet.ownerIsVip} isWalkingNow />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.breed}>
                {pet.breed} • {pet.ageYears} tuổi {pet.ageMonths} tháng
              </Text>
              <View style={styles.badgeRow}>
                {pet.isSafePet && <Badge text="🛡️ Safe Pet Đã Xác Minh" tone="mint" />}
                {pet.ownerIsVip && <Badge text="👑 Sen VIP" tone="gold" />}
              </View>
            </View>
          </View>
          <Text style={styles.bio}>"{pet.bio}"</Text>
          <Button
            title="💬 Nhắn Tin & Hẹn Dắt Dạo Ngay"
            onPress={() => navigate('ChatRoom', { roomId: 'room_mochi_01' })}
          />
        </Card>

        <View style={styles.tabSwitch}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'bio' && styles.tabBtnActive]} onPress={() => setTab('bio')}>
            <Text style={[styles.tabText, tab === 'bio' && styles.tabTextActive]}>{t('profile.tab.bio')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'moments' && styles.tabBtnActive]} onPress={() => setTab('moments')}>
            <Text style={[styles.tabText, tab === 'moments' && styles.tabTextActive]}>{t('profile.tab.moments')}</Text>
          </TouchableOpacity>
        </View>

        {tab === 'bio' ? (
          <DeepBioTab pet={pet} />
        ) : (
          <View style={styles.gridWrap}>
            {moments.map((m) => (
              <Image key={m.id} source={{ uri: m.mediaUrl }} style={styles.gridImg} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 32 },
  heroCard: { gap: SPACING.sm },
  row: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center' },
  name: { ...TYPOGRAPHY.h2, color: COLORS.textDark },
  breed: { ...TYPOGRAPHY.caption, color: COLORS.textBody, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  bio: { ...TYPOGRAPHY.body, fontStyle: 'italic', color: COLORS.textBody },
  tabSwitch: { flexDirection: 'row', backgroundColor: COLORS.creamWarm, borderRadius: RADIUS.pill, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.pill, alignItems: 'center' },
  tabBtnActive: { backgroundColor: COLORS.coral },
  tabText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, fontWeight: '700' },
  tabTextActive: { color: COLORS.white },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  gridImg: { width: GRID_SIZE, height: GRID_SIZE, borderRadius: RADIUS.md },
});
