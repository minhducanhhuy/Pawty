import React, { useState } from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  BellRing,
  Crown,
  Lock,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserPlus,
  Wifi,
} from 'lucide-react';
import { usePawtyStore } from '../../stores/usePawtyStore';
import { BottomTabBar } from './BottomTabBar';

interface MobileFrameShellProps {
  children: React.ReactNode;
  proPortalView: React.ReactNode;
}

export const MobileFrameShell: React.FC<MobileFrameShellProps> = ({
  children,
  proPortalView,
}) => {
  const {
    user,
    pets,
    activePetId,
    setActivePetId,
    desktopFrameMode,
    setDesktopFrameMode,
    hasCompletedOnboarding,
    restartOnboardingDemo,
    setActiveModal,
    showToast,
    toast,
    clearToast,
    resetAllDemoData,
  } = usePawtyStore();

  const [reminderCountdown, setReminderCountdown] = useState<number | null>(null);

  const triggerSimulatedReminder = () => {
    setReminderCountdown(5);
    const interval = setInterval(() => {
      setReminderCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          showToast(
            '🔔 Nhắc việc thông minh: Tới giờ uống thuốc giun của Lu!',
            'Mẹ Mai & bạn đều nhận được thông báo trong Vòng chăm sóc (Circle).',
            'warning'
          );
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#2D3436] flex flex-col lg:flex-row items-center justify-center lg:gap-8 lg:p-6">
      {/* Left Desktop Control Panel (Visible on lg+ screens) */}
      <aside className="hidden lg:flex flex-col w-80 bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-[#FF6F61]/15 shadow-lg shrink-0 self-start sticky top-6">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <img
            src="/assets/pawty-icon.png"
            alt="Pawty Icon"
            className="w-11 h-11 rounded-2xl object-cover shadow-sm"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl font-bold text-[#2D3436]">Pawty</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FF6F61]/15 text-[#FF6F61]">
                5-Layer Super App
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Nuôi thú cưng nhẹ đầu hơn, có người đồng hành
            </p>
          </div>
        </div>

        {/* Mode Switcher: Mobile App vs Layer 5 Pawty Pro & KPI Portal */}
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
            Chế độ hiển thị Hệ sinh thái
          </p>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-2xl">
            <button
              onClick={() => setDesktopFrameMode('iphone')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                desktopFrameMode === 'iphone'
                  ? 'bg-[#FF6F61] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              App Chủ Nuôi
            </button>
            <button
              onClick={() => setDesktopFrameMode('pro_portal')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                desktopFrameMode === 'pro_portal'
                  ? 'bg-[#2D3436] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Pawty Pro & KPI
            </button>
          </div>
        </div>

        {/* Active Boss Switcher */}
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
            Hồ sơ Boss đang chọn
          </p>
          <div className="space-y-1.5">
            {pets.map((pet) => {
              const isSelected = pet.id === activePetId;
              return (
                <button
                  key={pet.id}
                  onClick={() => setActivePetId(pet.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#FF6F61] bg-[#FF6F61]/8'
                      : 'border-stone-100 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={pet.avatarUrl}
                      alt={pet.name}
                      className="w-9 h-9 rounded-full object-cover border border-white shadow-xs"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        {pet.name}
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#A3E4D7]/40 text-teal-900 rounded-full">
                          {pet.species === 'dog' ? '🐕 Chó' : '🐈 Mèo'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate max-w-[140px]">
                        {pet.breed}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F61]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Simulator Actions (Phase 1 Native Mocks & Flows) */}
        <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Bộ công cụ Test nhanh cho CTO
          </p>

          <button
            onClick={restartOnboardingDemo}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-xs font-semibold text-stone-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#FF6F61]" />
            Chạy lại Onboarding (3 Slide + Wizard 4 bước)
          </button>

          <button
            onClick={triggerSimulatedReminder}
            disabled={reminderCountdown !== null}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-900 transition-colors"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-600" />
            {reminderCountdown !== null
              ? `Đang đếm ngược báo thức (${reminderCountdown}s)...`
              : 'Giả lập Push Nhắc việc (5 giây)'}
          </button>

          <button
            onClick={() => setActiveModal('sos_alert')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#E17055]" />
            Kích hoạt 🚨 SOS Tìm Boss Lạc (39k VietQR)
          </button>

          <button
            onClick={() => setActiveModal('vip_upgrade')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-100/60 hover:bg-amber-100 text-xs font-semibold text-amber-900 transition-colors"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            {user.isVip ? 'Đang là Sen VIP 👑 (Xem gói)' : 'Nâng cấp Gói Sen VIP (49k/tháng)'}
          </button>

          <button
            onClick={() => setActiveModal('kiosk_lock')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-xs font-semibold text-stone-700 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-teal-700" />
            Chế độ Khóa Màn Hình Bàn Giao (Kiosk Lock)
          </button>

          <button
            onClick={resetAllDemoData}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục dữ liệu mẫu ban đầu
          </button>
        </div>
      </aside>

      {/* Main Content Area: Either iPhone 9:16 Simulator or Layer 5 Pawty Pro & KPI Portal */}
      {desktopFrameMode === 'pro_portal' ? (
        <div className="w-full max-w-5xl bg-[#FDFBF7] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden min-h-[840px]">
          {proPortalView}
        </div>
      ) : (
        <div className="relative w-full lg:w-[412px] h-screen lg:h-[868px] bg-[#FDFBF7] lg:rounded-[48px] lg:border-[11px] lg:border-[#2D3436] lg:shadow-[0_24px_60px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden">
          {/* Simulated iOS Status Bar */}
          <div className="h-11 px-6 flex items-center justify-between bg-[#FDFBF7] text-[#2D3436] shrink-0 select-none z-30 border-b border-stone-100/80">
            <span className="text-xs font-bold tracking-tight font-mono">09:41</span>
            <div className="hidden lg:flex items-center gap-1.5 bg-[#2D3436] text-white px-3.5 py-1 rounded-full text-[10px] font-semibold">
              <Sparkles className="w-3 h-3 text-[#A3E4D7]" />
              <span>Pawty Dynamic Island</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setDesktopFrameMode(desktopFrameMode === 'iphone' ? 'pro_portal' : 'iphone')
                }
                className="lg:hidden text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800"
              >
                Pro/KPI
              </button>
              <Wifi className="w-3.5 h-3.5" />
              <BatteryCharging className="w-4 h-4 text-teal-600" />
            </div>
          </div>

          {/* Toast Notification Overlay */}
          {toast && (
            <div
              onClick={clearToast}
              className={`mx-3 mt-2 p-3 rounded-2xl shadow-lg border cursor-pointer z-50 transition-all flex items-start gap-2.5 ${
                toast.tone === 'danger'
                  ? 'bg-red-600 text-white border-red-700'
                  : toast.tone === 'warning'
                  ? 'bg-[#FDCB6E] text-[#2D3436] border-amber-400'
                  : 'bg-[#2D3436] text-white border-stone-700'
              }`}
            >
              <span className="text-base leading-none mt-0.5">🐾</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-snug">{toast.title}</p>
                <p className="text-[11px] opacity-90 leading-snug mt-0.5">{toast.message}</p>
              </div>
            </div>
          )}

          {/* Scrollable Screen Viewport */}
          <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#FDFBF7]">
            {children}
          </main>

          {/* 5-Tab Bottom Navigation Bar (Hidden during Onboarding) */}
          {hasCompletedOnboarding && <BottomTabBar />}
        </div>
      )}
    </div>
  );
};

