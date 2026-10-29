import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MobilePawtyProvider, useMobilePawty } from './src/context/MobilePawtyContext';
import { MobileOnboardingScreen } from './src/screens/MobileOnboardingScreen';
import { MobileTodayScreen } from './src/screens/MobileTodayScreen';
import { MobileExploreScreen } from './src/screens/MobileExploreScreen';
import { MobileChatScreen } from './src/screens/MobileChatScreen';
import { MobileProfileScreen } from './src/screens/MobileProfileScreen';
import { MobileModals } from './src/components/MobileModals';
import { PAWTY_COLORS } from './src/theme/colors';

const MobileRootShell: React.FC = () => {
  const {
    hasCompletedOnboarding,
    activeTab,
    setActiveTab,
    setActiveModal,
    isApiOnline,
    syncWithLanBackend,
    isVip,
    toast,
  } = useMobilePawty();

  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <MobileOnboardingScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoLetter}>P</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.appTitle}>Pawty</Text>
              {isVip && <Text style={styles.vipCrown}>👑 VIP</Text>}
            </View>
            <TouchableOpacity onPress={syncWithLanBackend}>
              <Text style={styles.lanStatus}>
                {isApiOnline ? '🟢 LAN API Đã kết nối' : '🟡 Chế độ Điện thoại (Chạm đồng bộ)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.proPill}
            onPress={() => setActiveModal('pro_dashboard')}
          >
            <Text style={styles.proPillText}>🏢 Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sosPill}
            onPress={() => setActiveModal('sos_alert')}
          >
            <Text style={styles.sosPillText}>🚨 SOS 3km</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Notification Banner */}
      {toast && (
        <View
          style={[
            styles.toastBanner,
            toast.tone === 'danger' && styles.toastDanger,
            toast.tone === 'warning' && styles.toastWarning,
          ]}
        >
          <Text style={styles.toastTitle}>{toast.title}</Text>
          <Text style={styles.toastMsg}>{toast.message}</Text>
        </View>
      )}

      {/* Main Screen Area */}
      <View style={styles.screenArea}>
        {activeTab === 'today' && <MobileTodayScreen />}
        {activeTab === 'explore' && <MobileExploreScreen />}
        {activeTab === 'chat' && <MobileChatScreen />}
        {activeTab === 'profile' && <MobileProfileScreen />}
      </View>

      {/* 5-Tab Bottom Navigation Bar (Thumb-Zone Optimized >=48dp) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('today')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, activeTab === 'today' && styles.navLabelActive]}>
            Hôm nay
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('explore')}
        >
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={[styles.navLabel, activeTab === 'explore' && styles.navLabelActive]}>
            Khám phá
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createFab}
          onPress={() => setActiveModal('create_sheet')}
        >
          <Text style={styles.createFabText}>＋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={styles.navIcon}>💬</Text>
          <Text style={[styles.navLabel, activeTab === 'chat' && styles.navLabelActive]}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>
            Tôi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Global Interactive Modals */}
      <MobileModals />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <MobilePawtyProvider>
      <MobileRootShell />
    </MobilePawtyProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAWTY_COLORS.cream,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: PAWTY_COLORS.border,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: PAWTY_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appTitle: { fontSize: 18, fontWeight: '900', color: PAWTY_COLORS.charcoal },
  vipCrown: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: PAWTY_COLORS.goldSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lanStatus: { fontSize: 10, fontWeight: '700', color: PAWTY_COLORS.mintDark, marginTop: 1 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  proPill: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  proPillText: { fontSize: 11, fontWeight: '800', color: PAWTY_COLORS.mintDark },
  sosPill: {
    backgroundColor: PAWTY_COLORS.danger,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  sosPillText: { fontSize: 11, fontWeight: '800', color: '#FFF' },

  toastBanner: {
    marginHorizontal: 14,
    marginTop: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: PAWTY_COLORS.charcoal,
  },
  toastDanger: { backgroundColor: PAWTY_COLORS.danger },
  toastWarning: { backgroundColor: '#D97706' },
  toastTitle: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  toastMsg: { color: '#F8FAFC', fontSize: 11, marginTop: 2 },

  screenArea: { flex: 1 },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 78,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: PAWTY_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: { fontSize: 19 },
  navLabel: { fontSize: 11, fontWeight: '700', color: PAWTY_COLORS.slate, marginTop: 2 },
  navLabelActive: { color: PAWTY_COLORS.coral, fontWeight: '900' },

  createFab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PAWTY_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    shadowColor: PAWTY_COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  createFabText: { color: '#FFF', fontSize: 28, fontWeight: '900', marginTop: -2 },
});
