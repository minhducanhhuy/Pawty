import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  BackHandler,
  Animated,
  Easing,
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
import { MobileChatScreen } from './src/screens/MobileChatScreen';
import { MobileProfileScreen } from './src/screens/MobileProfileScreen';
import { MobileSosScreen } from './src/screens/MobileSosScreen';
import { MobileOnboardingScreen } from './src/screens/MobileOnboardingScreen';
import { MobileModals } from './src/components/MobileModals';
import { MobileAnimatedLogo } from './src/components/MobileAnimatedLogo';
import { TINDER_PURPOSE_OPTIONS } from './src/types/mobileTypes';

const PAWTY_LOGO_FULL = require('./assets/pawty-logo-full.png');

const BOTTOM_TABS: { id: Exclude<MobileMainTab, 'sos'>; label: string; icon: string }[] = [
  { id: 'explore', label: 'Khám phá', icon: 'compass' },
  { id: 'tinder', label: 'Kết nối', icon: 'heart' },
  { id: 'chat', label: 'Tin nhắn', icon: 'message-circle' },
  { id: 'profile', label: 'Tôi', icon: 'user' },
];

const SplashBootScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish, progressAnim]);

  return (
    <SafeAreaView style={styles.splashContainer} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.splashCenter}>
        <View style={styles.splashLogoBox}>
          <MobileAnimatedLogo width={220} withReveal />
        </View>
        <Text style={styles.splashTagline}>Những bàn chân nhỏ đang tới</Text>
        <Text style={styles.splashSub}>
          Mạng xã hội kết nối người nuôi thú cưng
        </Text>
      </View>

      {/* Bottom Loading Progress Bar and Connection Status (Image 1) */}
      <View style={styles.splashFooter}>
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                transform: [
                  {
                    scaleX: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.01, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Text style={styles.splashFooterText}>ĐANG KẾT NỐI CỘNG ĐỒNG BOSS...</Text>
      </View>
    </SafeAreaView>
  );
};

const MainMobileShell: React.FC = () => {
  const {
    theme,
    isAuthenticated,
    activeTab,
    setActiveTab,
    setSelectedProfileHandle,
    setActiveModal,
    handleHardwareBack,
    unreadNotificationCount,
    sosAlerts,
    chats,
    activeChatId,
    likesYouCandidates,
    tinderFilterGoal,
    tinderDistanceLimit,
    setShowLikesYouDrawer,
    toastMessage,
  } = useMobilePawty();

  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const handledInsideApp = handleHardwareBack();
      return handledInsideApp ? true : true;
    });
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
  const likedYouCount = likesYouCandidates.length;
  const activeGoalLabel =
    tinderFilterGoal === 'all'
      ? 'Tất cả mục đích'
      : TINDER_PURPOSE_OPTIONS.find((opt) => opt.intent === tinderFilterGoal)?.shortLabel ||
        'Tìm bạn dắt dạo';

  return (
    <SafeAreaView
      style={[styles.safeRoot, { backgroundColor: theme.bg }]}
      edges={
        activeTab === 'chat' && activeChatId
          ? ['top']
          : ['top', 'bottom', 'left', 'right']
      }
    >
      <StatusBar barStyle="dark-content" />

      {/* DYNAMIC CONTEXTUAL HEADER PER ACTIVE TAB (Ẩn khi ở tab Tôi hoặc đang trong chi tiết phòng chat) */}
      {activeTab !== 'profile' && !(activeTab === 'chat' && activeChatId) && (
        <View style={styles.header}>
          {/* 1. EXPLORE HEADER */}
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

          {/* 2. KẾT NỐI (TINDER) HEADER - GỌN GÀNG, KHÔNG ĐÈ NHAU */}
          {activeTab === 'tinder' && (
            <>
              <View style={styles.contextualTitleWrap}>
                <Feather name="heart" size={19} color={theme.primary} />
                <Text style={styles.contextualHeaderTitle}>Kết nối</Text>
              </View>

              <View style={styles.headerRightActions}>
                <TouchableOpacity
                  style={[
                    styles.contextualPillBtn,
                    {
                      backgroundColor: likedYouCount > 0 ? '#FDF2F4' : '#FAF7F2',
                      borderColor: likedYouCount > 0 ? '#F3C8D1' : '#ECE6DF',
                    },
                  ]}
                  onPress={() => setShowLikesYouDrawer(true)}
                  accessibilityLabel="Xem ai đã thích bạn"
                >
                  <Feather name="heart" size={12} color="#E04F67" />
                  <Text style={[styles.contextualPillText, { color: '#C93B52' }]}>
                    Thích bạn ({likedYouCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconSquareBtn}
                  onPress={() => setActiveModal('tinder_filter')}
                  accessibilityLabel="Mở bộ lọc kết nối"
                >
                  <Feather name="sliders" size={18} color="#4A3F35" />
                  {(tinderFilterGoal !== 'all' || tinderDistanceLimit !== 'all') && (
                    <View
                      style={[
                        styles.notifBadge,
                        {
                          backgroundColor: theme.primary,
                          width: 8,
                          height: 8,
                          top: 4,
                          right: 4,
                        },
                      ]}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconSquareBtn}
                  onPress={() => setActiveModal('tinder_menu')}
                  accessibilityLabel="Tùy chọn kết nối"
                >
                  <Feather name="more-vertical" size={19} color="#4A3F35" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* 3. TIN NHẮN HEADER */}
          {activeTab === 'chat' && (
            <>
              <View style={styles.contextualTitleWrap}>
                <Feather name="message-circle" size={18} color={theme.primary} />
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
                  <Text style={[styles.contextualPillText, { color: theme.primary }]}>
                    Kết nối
                  </Text>
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

          {/* 4. FULLSCREEN SOS TAB HEADER */}
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
        </View>
      )}

      {/* Main Content Body */}
      <View style={styles.body}>
        {activeTab === 'explore' && <MobileExploreScreen />}
        {activeTab === 'tinder' && <MobileTinderScreen />}
        {activeTab === 'chat' && <MobileChatScreen />}
        {activeTab === 'profile' && <MobileProfileScreen />}
        {activeTab === 'sos' && <MobileSosScreen />}
      </View>

      {/* Bottom Navigation Bar (Ẩn khi đang trong chi tiết phòng chat) */}
      {!(activeTab === 'chat' && activeChatId) && (
        <View style={styles.bottomBar}>
          {BOTTOM_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => {
                  if (tab.id === 'profile') {
                    setSelectedProfileHandle(null);
                  }
                  setActiveTab(tab.id);
                }}
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
      )}

      {/* Toast Banner */}
      {toastMessage && (
        <View style={[styles.toastBar, styles.toastInfo]} pointerEvents="none">
          <Feather name="check-circle" size={16} color="#48BB78" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

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
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  splashCenter: {
    alignItems: 'center',
    transform: [{ translateY: -25 }],
  },
  splashLogoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  splashTagline: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FF6F61',
    textAlign: 'center',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(255, 111, 97, 0.24)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  splashSub: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7A6E63',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  splashFooter: {
    position: 'absolute',
    bottom: 42,
    alignItems: 'center',
    width: '100%',
  },
  progressBarTrack: {
    width: 140,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#EFE7DC',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: 140,
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#FF6F61',
    transformOrigin: 'left',
  },
  splashFooterText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#A89F95',
    letterSpacing: 1.5,
    marginTop: 10,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1815',
  },
  tinderHeaderGoalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 2,
    maxWidth: 120,
  },
  tinderHeaderGoalText: {
    fontSize: 11,
    fontWeight: '800',
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
    top: 64,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    zIndex: 9999,
    elevation: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  toastInfo: {
    backgroundColor: '#26221F',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
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
