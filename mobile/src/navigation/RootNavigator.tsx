import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { useNavigation } from './NavigationContext';
import { BottomTabBar } from './BottomTabBar';
import { ToastOverlay } from '../components';
import { useAuth, useAppConfig, useNotifications } from '../context';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { RadarScreen } from '../screens/RadarScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { ChatListScreen } from '../screens/ChatListScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PetDetailScreen } from '../screens/PetDetailScreen';
import { WalkNowScreen } from '../screens/WalkNowScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { SosModal } from '../screens/SosModal';
import { SosNearbyScreen } from '../screens/SosNearbyScreen';
import { VaccineUploadScreen } from '../screens/VaccineUploadScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ChatRoomScreen } from '../screens/ChatRoomScreen';
import { WalkSchedulerModal } from '../screens/WalkSchedulerModal';
import { CheckInScreen } from '../screens/CheckInScreen';
import { LiveLocationModal } from '../screens/LiveLocationModal';
import { PlacesScreen } from '../screens/PlacesScreen';
import { PlaceDetailScreen } from '../screens/PlaceDetailScreen';
import { ClubsScreen } from '../screens/ClubsScreen';
import { ClubDetailScreen } from '../screens/ClubDetailScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { NotificationCenterScreen } from '../screens/NotificationCenterScreen';
import { VouchersScreen } from '../screens/VouchersScreen';
import { BadgesScreen } from '../screens/BadgesScreen';
import { ReferralScreen } from '../screens/ReferralScreen';
import { IntroScreen } from '../screens/IntroScreen';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();
  const { toast, hideToast } = useAppConfig();
  const { inAppBanner, dismissBanner } = useNotifications();
  const { currentTab, currentScreen, navigate } = useNavigation();

  if (!isAuthenticated) {
    return (
      <View style={styles.root}>
        <IntroScreen onSuccess={() => {}} />
        <ToastOverlay toast={toast} banner={inAppBanner} onDismissToast={hideToast} onPressBanner={dismissBanner} />
      </View>
    );
  }

  if (!hasCompletedOnboarding || currentScreen.name === 'Onboarding') {
    return (
      <View style={styles.root}>
        <OnboardingScreen />
        <ToastOverlay toast={toast} banner={inAppBanner} onDismissToast={hideToast} onPressBanner={dismissBanner} />
      </View>
    );
  }

  const renderScreen = () => {
    const { name, params } = currentScreen;
    switch (name) {
      case 'PetDetail':
        return <PetDetailScreen petId={(params as { petId: string })?.petId || 'pet_mochi_02'} />;
      case 'WalkNow':
        return <WalkNowScreen />;
      case 'Paywall':
        return <PaywallScreen />;
      case 'SosCreate':
        return <SosModal />;
      case 'SosNearby':
        return <SosNearbyScreen />;
      case 'VaccineUpload':
        return <VaccineUploadScreen />;
      case 'Reminders':
        return <RemindersScreen />;
      case 'Settings':
        return <SettingsScreen />;
      case 'ChatRoom':
        return <ChatRoomScreen roomId={(params as { roomId: string })?.roomId || 'room_mochi_01'} />;
      case 'WalkScheduler': {
        const p = params as { roomId: string; receiverPetId: string; preselectedPlace?: any };
        return <WalkSchedulerModal roomId={p?.roomId || 'room_mochi_01'} receiverPetId={p?.receiverPetId || 'pet_mochi_02'} preselectedPlace={p?.preselectedPlace} />;
      }
      case 'CheckIn': {
        const p = params as { appointment: any };
        return <CheckInScreen appointment={p?.appointment} />;
      }
      case 'LiveLocation': {
        const p = params as { roomId: string; appointment: any };
        return <LiveLocationModal roomId={p?.roomId || 'room_mochi_01'} appointment={p?.appointment} />;
      }
      case 'Places': {
        const p = params as { returnToRoomId?: string; receiverPetId?: string } | undefined;
        return <PlacesScreen returnToRoomId={p?.returnToRoomId} receiverPetId={p?.receiverPetId} />;
      }
      case 'PlaceDetail': {
        const p = params as { placeId: string; returnToRoomId?: string; receiverPetId?: string };
        return <PlaceDetailScreen placeId={p?.placeId || 'place_01'} returnToRoomId={p?.returnToRoomId} receiverPetId={p?.receiverPetId} />;
      }
      case 'Clubs':
        return <ClubsScreen />;
      case 'ClubDetail':
        return <ClubDetailScreen clubId={(params as { clubId: string })?.clubId || 'club_01'} />;
      case 'Events':
        return <EventsScreen clubId={(params as { clubId?: string })?.clubId} />;
      case 'NotificationCenter':
        return <NotificationCenterScreen />;
      case 'Vouchers':
        return <VouchersScreen />;
      case 'Badges':
        return <BadgesScreen />;
      case 'Referral':
        return <ReferralScreen />;
      case 'MainTabs':
      default:
        if (currentTab === 'Feed') return <FeedScreen />;
        if (currentTab === 'Chat') return <ChatListScreen />;
        if (currentTab === 'Profile') return <ProfileScreen />;
        return <RadarScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.body}>{renderScreen()}</View>
      {currentScreen.name === 'MainTabs' && <BottomTabBar />}
      <ToastOverlay
        toast={toast}
        banner={inAppBanner}
        onDismissToast={hideToast}
        onPressBanner={(b) => {
          dismissBanner();
          if (b.type === 'sos') navigate('SosNearby');
          else navigate('NotificationCenter');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },
  body: { flex: 1 },
});
