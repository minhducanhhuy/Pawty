import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceFrame } from './components/common/DeviceFrame';
import { BottomNav } from './components/common/BottomNav';
import { RadarScreen } from './components/radar/RadarScreen';
import { MomentsFeedScreen } from './components/moments/MomentsFeedScreen';
import { ChatListScreen } from './components/chat/ChatListScreen';
import { PetProfileScreen } from './components/profile/PetProfileScreen';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { SosModal } from './components/monetization/SosModal';
import { VipModal } from './components/monetization/VipModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    viewingPetProfile,
    setViewingPetProfile,
    isSosModalOpen,
    setIsSosModalOpen,
    isVipModalOpen,
    setIsVipModalOpen,
    isOnboardingOpen,
    setIsOnboardingOpen,
  } = useApp();

  return (
    <DeviceFrame>
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Active Tab Screen */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {activeTab === 'radar' && <RadarScreen />}
          {activeTab === 'moments' && <MomentsFeedScreen />}
          {activeTab === 'chat' && <ChatListScreen />}
          {activeTab === 'profile' && <PetProfileScreen />}
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Viewing Pet Profile Modal (When inspecting another pet) */}
      {viewingPetProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm h-full max-h-[92vh] bg-white rounded-t-[36px] sm:rounded-[36px] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <PetProfileScreen
              overridePet={viewingPetProfile}
              onCloseOverride={() => setViewingPetProfile(null)}
            />
          </div>
        </div>
      )}

      {/* Global Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
      />

      <VipModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
      />
    </DeviceFrame>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
