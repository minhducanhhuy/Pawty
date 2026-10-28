import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { Avatar, Chip } from '../../components';
import { RadarFilters } from './RadarFilterModal';
import { useTranslation } from '../../i18n';

interface RadarHeaderProps {
  avatarUrl?: string;
  isVip?: boolean;
  isWalkingNow?: boolean;
  boostMinsLeft: number;
  unreadCount: number;
  filters: RadarFilters;
  setFilters: (f: RadarFilters) => void;
  onPressProfile: () => void;
  onPressBoost: () => void;
  onPressSos: () => void;
  onPressNotif: () => void;
  onPressFilter: () => void;
  onPressWalkNow: () => void;
}

export const RadarHeader: React.FC<RadarHeaderProps> = ({
  avatarUrl, isVip, isWalkingNow, boostMinsLeft, unreadCount,
  filters, setFilters, onPressProfile, onPressBoost, onPressSos, onPressNotif, onPressFilter, onPressWalkNow,
}) => {
  const { t } = useTranslation();

  return (
    <View>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.brandRow} onPress={onPressProfile}>
          <Avatar uri={avatarUrl} size={38} isVip={isVip} isWalkingNow={isWalkingNow} />
          <Image source={require('../../../assets/pawty-logo-full.png')} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.boostBtn} onPress={onPressBoost}>
            <Text style={styles.boostText}>{boostMinsLeft > 0 ? `⚡ ${boostMinsLeft}p` : t('radar.boost.label')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sosBtn} onPress={onPressSos}>
            <Text style={styles.sosText}>🚨 SOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onPressNotif}>
            <Text style={styles.bellIcon}>🔔{unreadCount > 0 ? `(${unreadCount})` : ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onPressFilter}>
            <Text style={styles.bellIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.subBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip label={t('radar.filter.all')} selected={!filters.walkingNow && !filters.verifiedOnly} onPress={() => setFilters({ ...filters, walkingNow: false, verifiedOnly: false })} />
          <Chip label={t('radar.filter.walkingNow')} selected={filters.walkingNow} onPress={() => setFilters({ ...filters, walkingNow: !filters.walkingNow })} tone="mint" />
          <Chip label={t('radar.filter.safePet')} selected={filters.verifiedOnly} onPress={() => setFilters({ ...filters, verifiedOnly: !filters.verifiedOnly })} tone="mint" />
        </ScrollView>
        <TouchableOpacity style={styles.walkNowBanner} onPress={onPressWalkNow}>
          <Text style={styles.walkNowText}>{isWalkingNow ? t('radar.walkingNow.active') : t('radar.walkingNow.cta')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface RadarControlsProps {
  superLikesLeft: number;
  onRewind: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  onLike: () => void;
  onInfo: () => void;
}

export const RadarControls: React.FC<RadarControlsProps> = ({
  superLikesLeft, onRewind, onPass, onSuperLike, onLike, onInfo,
}) => (
  <View style={styles.controlsRow}>
    <TouchableOpacity style={styles.smallCircle} onPress={onRewind}><Text style={styles.btnEmoji}>⏪</Text></TouchableOpacity>
    <TouchableOpacity style={styles.passCircle} onPress={onPass}><Text style={styles.btnEmojiLg}>❌</Text></TouchableOpacity>
    <TouchableOpacity style={styles.superCircle} onPress={onSuperLike}>
      <Text style={styles.btnEmoji}>⭐</Text>
      <Text style={styles.superQuota}>{superLikesLeft}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.likeCircle} onPress={onLike}><Text style={styles.btnEmojiLg}>💖</Text></TouchableOpacity>
    <TouchableOpacity style={styles.smallCircle} onPress={onInfo}><Text style={styles.btnEmoji}>ℹ️</Text></TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logo: { width: 88, height: 32 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  boostBtn: { backgroundColor: COLORS.goldLight, paddingHorizontal: 9, paddingVertical: 5, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.goldVip },
  boostText: { ...TYPOGRAPHY.caption, color: COLORS.goldDark, fontWeight: '800' },
  sosBtn: { backgroundColor: COLORS.dangerLight, paddingHorizontal: 9, paddingVertical: 5, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.danger },
  sosText: { ...TYPOGRAPHY.caption, color: COLORS.danger, fontWeight: '800' },
  iconBtn: { backgroundColor: COLORS.white, paddingHorizontal: 8, paddingVertical: 5, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border },
  bellIcon: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  subBar: { marginBottom: SPACING.sm, gap: 6 },
  walkNowBanner: { backgroundColor: COLORS.mintLight, paddingVertical: 7, paddingHorizontal: 12, borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.mintDark, alignItems: 'center' },
  walkNowText: { ...TYPOGRAPHY.caption, color: '#0F766E', fontWeight: '800' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: SPACING.md },
  smallCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  passCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
  superCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.goldLight, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.goldVip },
  likeCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: COLORS.coral, alignItems: 'center', justifyContent: 'center' },
  btnEmoji: { fontSize: 18 },
  btnEmojiLg: { fontSize: 24 },
  superQuota: { fontSize: 10, fontWeight: '800', color: COLORS.goldDark, marginTop: -2 },
});
