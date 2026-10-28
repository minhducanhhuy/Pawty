import React, { useState } from 'react';
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
import { P1FeatureDrawer } from './components/common/P1FeatureDrawer';
import { Sparkles } from 'lucide-react';

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

  const [isP1DrawerOpen, setIsP1DrawerOpen] = useState(false);

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

        {/* Floating P1 Hub Pill */}
        <button
          onClick={() => setIsP1DrawerOpen(true)}
          className="absolute bottom-16 right-3 z-30 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-fredoka font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer border border-white/30"
          title="Mở tiện ích Phase 1–2: Walk Now, Voucher, Nhắc lịch, Huy hiệu, Referral, Portal"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tiện ích P1</span>
        </button>

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

      <P1FeatureDrawer
        isOpen={isP1DrawerOpen}
        onClose={() => setIsP1DrawerOpen(false)}
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
