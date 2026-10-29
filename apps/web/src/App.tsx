import React, { useEffect } from 'react';
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
  const {
    hasCompletedOnboarding,
    activeTab,
    activeModal,
    setActiveModal,
    activeConversationId,
    setActiveConversationId,
    setActiveTab,
  } = usePawtyStore();

  useEffect(() => {
    const handlePopState = () => {
      if (activeModal) {
        setActiveModal(null);
      } else if (activeConversationId) {
        setActiveConversationId(null);
      } else if (activeTab !== 'explore') {
        setActiveTab('explore');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeModal, activeConversationId, activeTab, setActiveModal, setActiveConversationId, setActiveTab]);

  const renderActiveScreen = () => {
    if (!hasCompletedOnboarding) {
      return <OnboardingFlow />;
    }

    switch (activeTab) {
      case 'explore':
      case 'tinder':
      case 'services':
        return <ExploreScreen />;
      case 'appointments':
      case 'today':
        return <TodayScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <ExploreScreen />;
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
