import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  BackHandler,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from './src/components/FeatherIcon';
import {
  MobilePawtyProvider,
  useMobilePawty,
  MobileMainTab,
} from './src/context/MobilePawtyContext';
import { MobileExploreScreen } from './src/screens/MobileExploreScreen';
import { MobileTinderScreen } from './src/screens/MobileTinderScreen';
import { MobileServicesScreen } from './src/screens/MobileServicesScreen';
import { MobileAppointmentsScreen } from './src/screens/MobileAppointmentsScreen';
import { MobileChatScreen } from './src/screens/MobileChatScreen';
import { MobileProfileScreen } from './src/screens/MobileProfileScreen';
import { MobileSosScreen } from './src/screens/MobileSosScreen';
import { MobileOnboardingScreen } from './src/screens/MobileOnboardingScreen';
import { MobileModals } from './src/components/MobileModals';

const PAWTY_LOGO_FULL = require('./assets/pawty-logo-full.png');

const BOTTOM_TABS: { id: Exclude<MobileMainTab, 'sos'>; label: string; icon: string }[] = [
  { id: 'explore', label: 'Khám phá', icon: 'compass' },
  { id: 'tinder', label: 'Kết nối', icon: 'heart' },
  { id: 'services', label: 'Dịch vụ', icon: 'briefcase' },
  { id: 'appointments', label: 'Lịch hẹn', icon: 'calendar' },
  { id: 'chat', label: 'Tin nhắn', icon: 'message-circle' },
  { id: 'profile', label: 'Tôi', icon: 'user' },
];

const SplashBootScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 950);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <SafeAreaView style={styles.splashContainer} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.splashCenter}>
        <View style={styles.splashLogoBox}>
          <Image
            source={PAWTY_LOGO_FULL}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.splashTagline}>Những bàn chân nhỏ đang tới</Text>
        <Text style={styles.splashSub}>
          Mạng xã hội hình ảnh · Kết nối bạn đi dạo · Dịch vụ thú cưng
        </Text>
      </View>
    </SafeAreaView>
  );
};

const MainMobileShell: React.FC = () => {
  const {
    theme,
    isAuthenticated,
    ownerHandle,
    isPrivateProfile,
    isVip,
    activeVipPlanId,
    activeTab,
    setActiveTab,
    setActiveModal,
    handleHardwareBack,
    unreadNotificationCount,
    sosAlerts,
    chats,
    tinderCandidates,
    rewindLastSwipe,
    setShowLikesYouDrawer,
    cyclePassportArea,
    toastMessage,
  } = useMobilePawty();

  const [isSplashDone, setIsSplashDone] = useState(false);

  // Intercept Android Hardware Back Gesture / Button so it never exits the app abruptly
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const handledInsideApp = handleHardwareBack();
        return handledInsideApp ? true : true;
      }
    );
    return () => subscription.remove();
  }, [handleHardwareBack]);

  if (!isSplashDone) {
    return <SplashBootScreen onFinish={() => setIsSplashDone(true)} />;
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.safeRoot, { backgroundColor: theme.bg }]}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <StatusBar barStyle="dark-content" />
        <MobileOnboardingScreen />
      </SafeAreaView>
    );
  }

  const activeSosCount = sosAlerts.filter((s) => s.status === 'searching').length;
  const unreadChatCount = chats.reduce((acc, c) => acc + c.unreadCount, 0);
  const likedYouCount = tinderCandidates.filter((c) => c.hasLikedMe).length;

  return (
    <SafeAreaView
      style={[styles.safeRoot, { backgroundColor: theme.bg }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <StatusBar barStyle="dark-content" />

      {/* DYNAMIC CONTEXTUAL HEADER PER ACTIVE TAB */}
      <View style={styles.header}>
        {/* 1. EXPLORE HEADER: Left '+' | Center Single Pawty Logo | Right SOS (Opens Fullscreen SOS Tab) + Notifications */}
        {activeTab === 'explore' && (
          <>
            <TouchableOpacity
              style={styles.iconSquareBtn}
              onPress={() => setActiveModal('new_moment')}
            >
              <Feather name="plus" size={20} color="#2C2520" />
            </TouchableOpacity>

            <View style={styles.logoCenterWrap}>
              <Image
                source={PAWTY_LOGO_FULL}
                style={styles.headerSingleLogo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.sosHeaderBtn}
                onPress={() => setActiveTab('sos')}
              >
                <Feather name="alert-triangle" size={13} color="#B85D43" />
                <Text style={styles.sosHeaderText}>SOS ({activeSosCount})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconSquareBtn}
                onPress={() => setActiveModal('notifications')}
              >
                <Feather name="bell" size={18} color="#4A3F35" />
                {unreadNotificationCount > 0 && (
                  <View
                    style={[
                      styles.notifBadge,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text style={styles.notifBadgeText}>
                      {unreadNotificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 2. KẾT NỐI (TINDER) HEADER: Left Title 'Kết nối' | Right Rewind + Liked You + Location */}
        {activeTab === 'tinder' && (
          <>
            <View style={styles.contextualTitleWrap}>
              <Feather name="heart" size={18} color={theme.primary} />
              <Text style={styles.contextualHeaderTitle}>Kết nối</Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.contextualPillBtn}
                onPress={rewindLastSwipe}
              >
                <Feather name="rotate-ccw" size={13} color="#4A3F35" />
                <Text style={styles.contextualPillText}>Hoàn tác</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.contextualPillBtn,
                  { backgroundColor: theme.primarySoft },
                ]}
                onPress={() => setShowLikesYouDrawer(true)}
              >
                <Feather name="heart" size={13} color={theme.primary} />
                <Text
                  style={[
                    styles.contextualPillText,
                    { color: theme.primary },
                  ]}
                >
                  Đã thích ({likedYouCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconSquareBtn}
                onPress={cyclePassportArea}
              >
                <Feather name="map-pin" size={17} color="#2E7D5B" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 3. DỊCH VỤ HEADER */}
        {activeTab === 'services' && (
          <>
            <View style={styles.contextualTitleWrap}>
              <Feather name="briefcase" size={18} color={theme.primary} />
              <Text style={styles.contextualHeaderTitle}>Dịch vụ Thú cưng</Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.contextualPillBtn}
                onPress={() => setActiveTab('appointments')}
              >
                <Feather name="calendar" size={13} color="#4A3F35" />
                <Text style={styles.contextualPillText}>Lịch hẹn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sosHeaderBtn}
                onPress={() => setActiveTab('sos')}
              >
                <Feather name="alert-triangle" size={13} color="#B85D43" />
                <Text style={styles.sosHeaderText}>SOS</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 4. LỊCH HẸN HEADER */}
        {activeTab === 'appointments' && (
          <>
            <View style={styles.contextualTitleWrap}>
              <Feather name="calendar" size={18} color={theme.primary} />
              <Text style={styles.contextualHeaderTitle}>Quản lý Lịch hẹn</Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={[
                  styles.contextualPillBtn,
                  { backgroundColor: theme.primarySoft },
                ]}
                onPress={() => setActiveTab('services')}
              >
                <Feather name="plus" size={13} color={theme.primary} />
                <Text
                  style={[
                    styles.contextualPillText,
                    { color: theme.primary },
                  ]}
                >
                  Đặt lịch mới
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconSquareBtn}
                onPress={() => setActiveModal('notifications')}
              >
                <Feather name="bell" size={18} color="#4A3F35" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 5. TIN NHẮN HEADER */}
        {activeTab === 'chat' && (
          <>
            <View style={styles.contextualTitleWrap}>
              <Feather
                name="message-circle"
                size={18}
                color={theme.primary}
              />
              <Text style={styles.contextualHeaderTitle}>Tin nhắn</Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={[
                  styles.contextualPillBtn,
                  { backgroundColor: theme.primarySoft },
                ]}
                onPress={() => setActiveTab('tinder')}
              >
                <Feather name="heart" size={13} color={theme.primary} />
                <Text
                  style={[
                    styles.contextualPillText,
                    { color: theme.primary },
                  ]}
                >
                  Kết nối
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sosHeaderBtn}
                onPress={() => setActiveTab('sos')}
              >
                <Feather name="alert-triangle" size={13} color="#B85D43" />
                <Text style={styles.sosHeaderText}>SOS</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 6. FULLSCREEN SOS TAB HEADER (Opened from top-right SOS button) */}
        {activeTab === 'sos' && (
          <>
            <View style={styles.contextualTitleWrap}>
              <TouchableOpacity
                style={styles.iconSquareBtn}
                onPress={() => setActiveTab('explore')}
              >
                <Feather name="arrow-left" size={18} color="#2C2520" />
              </TouchableOpacity>
              <Text style={styles.contextualHeaderTitle}>
                Bảng tin SOS Thú Lạc
              </Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.iconSquareBtn}
                onPress={() => setActiveModal('notifications')}
              >
                <Feather name="bell" size={18} color="#4A3F35" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 7. TÔI (INSTAGRAM PROFILE HEADER): Left '+' | Center 🔒 @handle ⌄ | Right Plus + Hamburger ☰ */}
        {activeTab === 'profile' && (
          <>
            <TouchableOpacity
              style={styles.iconSquareBtn}
              onPress={() => setActiveModal('new_moment')}
            >
              <Feather name="plus" size={20} color="#1C1815" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.igProfileHeaderCenter}
              onPress={() => setActiveModal('edit_profile')}
            >
              {isPrivateProfile && (
                <Feather name="lock" size={15} color="#1C1815" />
              )}
              <Text style={styles.igProfileHandleTitle}>
                {ownerHandle.replace('@', '')}
              </Text>
              <Feather name="chevron-down" size={16} color="#1C1815" />
            </TouchableOpacity>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={[
                  styles.plusHeaderBadge,
                  { backgroundColor: theme.primarySoft },
                ]}
                onPress={() => setActiveModal('vip_upgrade')}
              >
                <Feather name="award" size={13} color={theme.primary} />
                <Text
                  style={[
                    styles.plusHeaderBadgeText,
                    { color: theme.primary },
                  ]}
                >
                  {isVip
                    ? activeVipPlanId === 'vip_gold'
                      ? 'GOLD'
                      : 'PLUS'
                    : 'Plus'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconSquareBtn}
                onPress={() => setActiveModal('my_settings')}
              >
                <Feather name="menu" size={20} color="#1C1815" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Main Content Body */}
      <View style={styles.body}>
        {activeTab === 'explore' && <MobileExploreScreen />}
        {activeTab === 'tinder' && <MobileTinderScreen />}
        {activeTab === 'services' && <MobileServicesScreen />}
        {activeTab === 'appointments' && <MobileAppointmentsScreen />}
        {activeTab === 'chat' && <MobileChatScreen />}
        {activeTab === 'profile' && <MobileProfileScreen />}
        {activeTab === 'sos' && <MobileSosScreen />}
      </View>

      {/* Clean Minimalist Toast Banner */}
      {toastMessage && (
        <View style={[styles.toastBar, styles.toastInfo]}>
          <Feather name="info" size={15} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 6-Tab Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        {BOTTOM_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
            >
              <View style={styles.tabIconWrap}>
                <Feather
                  name={tab.icon}
                  size={19}
                  color={isActive ? theme.primary : '#9C8E80'}
                />
                {tab.id === 'chat' && unreadChatCount > 0 && (
                  <View
                    style={[
                      styles.tabBadge,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text style={styles.tabBadgeText}>{unreadChatCount}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && {
                    color: theme.primary,
                    fontWeight: '800',
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Shared Modals */}
      <MobileModals />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <MobilePawtyProvider>
        <MainMobileShell />
      </MobilePawtyProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  splashCenter: {
    alignItems: 'center',
  },
  splashLogoBox: {
    width: 220,
    height: 92,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE9E1',
    marginBottom: 14,
  },
  splashLogo: {
    width: 185,
    height: 68,
  },
  splashTagline: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2C2520',
    textAlign: 'center',
  },
  splashSub: {
    fontSize: 12,
    color: '#8E8074',
    textAlign: 'center',
    marginTop: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6DF',
    minHeight: 54,
  },
  iconSquareBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECE6DF',
    position: 'relative',
  },
  logoCenterWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSingleLogo: {
    width: 112,
    height: 36,
  },
  contextualTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  contextualHeaderTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1C1815',
  },
  igProfileHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  igProfileHandleTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1815',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contextualPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#ECE6DF',
  },
  contextualPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4A3F35',
  },
  plusHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  plusHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  sosHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FDF3F2',
    borderWidth: 1,
    borderColor: '#F3D6D3',
  },
  sosHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B85D43',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  body: {
    flex: 1,
  },
  toastBar: {
    position: 'absolute',
    bottom: 72,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
  },
  toastInfo: {
    backgroundColor: '#2C2520',
  },
  toastText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECE6DF',
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIconWrap: {
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9C8E80',
  },
});
