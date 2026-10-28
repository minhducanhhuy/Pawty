import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { COLORS, SPACING, RADIUS } from '../theme';
import { EmptyState } from '../components';
import { PetSwipeCard } from './radar/PetSwipeCard';
import { NativeAdCard } from './radar/NativeAdCard';
import { RadarFilterModal, RadarFilters } from './radar/RadarFilterModal';
import { MatchCelebrationModal } from './radar/MatchCelebrationModal';
import { RadarHeader, RadarControls } from './radar/RadarHeaderAndControls';
import { RadarItem, Pet } from '../types';
import { api } from '../api/endpoints';
import { useAuth, useActivePet, useAppConfig, useNotifications } from '../context';
import { useNavigation } from '../navigation/NavigationContext';
import { useTranslation } from '../i18n';

export const RadarScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { activePet } = useActivePet();
  const { showToast } = useAppConfig();
  const { unreadCount } = useNotifications();
  const { navigate } = useNavigation();
  const { t } = useTranslation();

  const [items, setItems] = useState<RadarItem[]>([]);
  const [index, setIndex] = useState(0);
  const [filters, setFilters] = useState<RadarFilters>({ radius: 1500, species: 'all', size: 'all', verifiedOnly: false, walkingNow: false });
  const [filterVisible, setFilterVisible] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);
  const [matchedRoomId, setMatchedRoomId] = useState<string>('room_mochi_01');
  const [likesMe, setLikesMe] = useState<{ count: number; items: Pet[] }>({ count: 2, items: [] });
  const [boostMinsLeft, setBoostMinsLeft] = useState<number>(0);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: user?.latitude || 10.7951,
    lng: user?.longitude || 106.7218,
  });

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCurrentCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } else {
        setHasLocationPermission(false);
      }
    } catch (err) {
      console.warn('Location request error:', err);
      setHasLocationPermission(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const loadRadar = useCallback(async () => {
    try {
      const res = await api.getRadar({ lat: currentCoords.lat, lng: currentCoords.lng, ...filters });
      let list = res.items;
      if (filters.verifiedOnly) list = list.filter((it) => it.type === 'ad' || it.pet.isSafePet);
      if (filters.walkingNow) list = list.filter((it) => it.type === 'ad' || it.isWalkingNow);
      if (filters.species !== 'all') list = list.filter((it) => it.type === 'ad' || it.pet.species === filters.species);
      if (filters.size !== 'all') list = list.filter((it) => it.type === 'ad' || it.pet.size === filters.size);
      setItems(list);
      setIndex(0);
      setLikesMe(await api.getLikesMe());
    } catch (err) {
      console.error('Radar fetch error:', err);
    }
  }, [currentCoords.lat, currentCoords.lng, filters]);

  useEffect(() => { loadRadar(); }, [loadRadar]);

  const currentItem = items[index];

  const handleAction = async (action: 'like' | 'dislike' | 'superlike') => {
    if (!currentItem || currentItem.type === 'ad') {
      setIndex((i) => (i + 1) % Math.max(1, items.length));
      return;
    }
    if (!user?.isVip && (user?.swipesLeft ?? 1) <= 0) {
      showToast(t('radar.swipe.exhausted'), 'error');
      navigate('Paywall', { highlight: 'vip' });
      return;
    }
    if (action === 'superlike' && (user?.superLikesLeft ?? 0) <= 0) {
      showToast(t('radar.superLike.exhausted'), 'error');
      navigate('Paywall', { highlight: 'super_like' });
      return;
    }
    const res = await api.swipePet(currentItem.pet.id, action);
    await refreshUser();
    if (res.isMatch && action !== 'dislike') {
      setMatchedPet(currentItem.pet);
      if (res.roomId) setMatchedRoomId(res.roomId);
    }
    setIndex((i) => (i + 1) % Math.max(1, items.length));
  };

  const handleRewind = async () => {
    if (!user?.isVip) {
      showToast(t('radar.rewind.locked'), 'info');
      navigate('Paywall', { highlight: 'vip' });
      return;
    }
    await api.rewindSwipe();
    setIndex((i) => Math.max(0, i - 1));
    showToast('⏪ Đã hoàn tác thẻ quẹt gần nhất!', 'success');
  };

  const handleBoost = async () => {
    if (boostMinsLeft > 0) return showToast(`⚡ Boost đang chạy (còn ${boostMinsLeft} phút)`, 'info');
    if ((user?.boostBalance ?? 0) <= 0 && !user?.isVip) return navigate('Paywall', { highlight: 'boost' });
    await api.activateBoost();
    setBoostMinsLeft(30);
    showToast('⚡ Đã bật Boost ưu tiên x5 Radar trong 30 phút!', 'success');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <RadarHeader
        avatarUrl={activePet?.avatarUrl} isVip={user?.isVip} isWalkingNow={user?.isWalkingNow}
        boostMinsLeft={boostMinsLeft} unreadCount={unreadCount} filters={filters} setFilters={setFilters}
        onPressProfile={() => navigate('MainTabs', { tab: 'Profile' })} onPressBoost={handleBoost}
        onPressSos={() => navigate('SosCreate')} onPressNotif={() => navigate('NotificationCenter')}
        onPressFilter={() => setFilterVisible(true)} onPressWalkNow={() => navigate('WalkNow')}
      />

      {/* Location Permission Prompt (Real Native App) */}
      {hasLocationPermission === false && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>
            📍 Pawty cần vị trí để quét tìm Boss quanh khu vực chung cư của bạn.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestLocation}>
            <Text style={styles.permissionBtnText}>Cấp quyền vị trí</Text>
          </TouchableOpacity>
        </View>
      )}

      {!currentItem ? (
        <EmptyState
          title="Chưa có bạn cún nào quanh đây"
          subtitle="Hãy thử tăng bán kính trong Bộ Lọc hoặc rủ hàng xóm dắt cún tham gia nhé! 🐾"
          actionLabel="Mở bộ lọc bán kính"
          onAction={() => setFilterVisible(true)}
        />
      ) : currentItem.type === 'ad' ? (
        <NativeAdCard
          ad={currentItem.ad}
          onVoucherSaved={(code) => { showToast(`🎁 Đã lưu mã ${code} vào Ví Voucher!`, 'success'); setIndex((i) => (i + 1) % items.length); }}
          onPassAd={() => setIndex((i) => (i + 1) % items.length)}
        />
      ) : (
        <PetSwipeCard
          pet={currentItem.pet}
          distanceLabel={currentItem.distanceLabel}
          isBoosted={currentItem.isBoosted}
          isWalkingNow={currentItem.isWalkingNow}
          hasSuperLikedMe={currentItem.hasSuperLikedMe}
          onSwipeLeft={() => handleAction('dislike')}
          onSwipeRight={() => handleAction('like')}
          isTopCard={true}
        />
      )}
      <RadarControls
        superLikesLeft={user?.superLikesLeft ?? 1} onRewind={handleRewind} onPass={() => handleAction('dislike')}
        onSuperLike={() => handleAction('superlike')} onLike={() => handleAction('like')}
        onInfo={() => currentItem?.type === 'pet' && navigate('PetDetail', { petId: currentItem.pet.id })}
      />
      <RadarFilterModal
        visible={filterVisible} filters={filters} setFilters={setFilters} likesMeCount={likesMe.count} likesMePets={likesMe.items}
        isVip={Boolean(user?.isVip)} onClose={() => setFilterVisible(false)} onApply={() => { setFilterVisible(false); loadRadar(); }}
        onOpenPaywall={() => { setFilterVisible(false); navigate('Paywall', { highlight: 'vip' }); }}
      />
      <MatchCelebrationModal
        visible={Boolean(matchedPet)} myPet={activePet} matchedPet={matchedPet}
        onChatNow={() => { setMatchedPet(null); navigate('ChatRoom', { roomId: matchedRoomId }); }}
        onClose={() => setMatchedPet(null)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.lg },
  permissionBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    gap: 8,
  },
  permissionText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
  },
  permissionBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  permissionBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
});
