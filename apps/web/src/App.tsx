import React from 'react';
import { MobileFrameShell } from './components/layout/MobileFrameShell';
import { GlobalModals } from './components/modals/GlobalModals';
import { ProAndAdminPortal } from './pages/admin/ProAndAdminPortal';
import { ChatScreen } from './pages/chat/ChatScreen';
import { ExploreScreen } from './pages/explore/ExploreScreen';
import { OnboardingFlow } from './pages/onboarding/OnboardingFlow';
import { ProfileScreen } from './pages/profile/ProfileScreen';
import { TodayScreen } from './pages/today/TodayScreen';
import { usePawtyStore } from './stores/usePawtyStore';

export const App: React.FC = () => {
  const { hasCompletedOnboarding, activeTab } = usePawtyStore();

  const renderActiveScreen = () => {
    if (!hasCompletedOnboarding) {
      return <OnboardingFlow />;
    }

    switch (activeTab) {
      case 'today':
        return <TodayScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <TodayScreen />;
    }
  };

  return (
    <>
      <MobileFrameShell proPortalView={<ProAndAdminPortal />}>
        {renderActiveScreen()}
      </MobileFrameShell>
      <GlobalModals />
    </>
  );
};

export default App;

