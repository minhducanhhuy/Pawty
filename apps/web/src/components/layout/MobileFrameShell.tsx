import React from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Dog,
  Cat,
  Info,
  Palette,
  Plus,
  X,
} from 'lucide-react';
import { usePawtyStore } from '../../stores/usePawtyStore';
import { WEB_THEMES, type WebThemeId } from '../../mocks/seedData';
import { BottomTabBar } from './BottomTabBar';

interface MobileFrameShellProps {
  children: React.ReactNode;
  proPortalView?: React.ReactNode;
}

export const MobileFrameShell: React.FC<MobileFrameShellProps> = ({
  children,
}) => {
  const {
    pets,
    activePetId,
    setActivePetId,
    hasCompletedOnboarding,
    setActiveModal,
    toast,
    clearToast,
    themeId,
    setThemeId,
    notifications,
  } = usePawtyStore();

  const theme = WEB_THEMES[themeId] ?? WEB_THEMES.coral;
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      style={{ backgroundColor: themeId === 'dark' ? '#0E0D0C' : '#EFECE6', color: theme.text }}
      className="min-h-screen flex flex-col lg:flex-row items-center justify-center lg:gap-8 lg:p-6 transition-colors"
    >
      {/* Left Desktop Companion Panel (Visible on lg+ screens — clean user panel, zero dev jargon) */}
      <aside
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.text,
        }}
        className="hidden lg:flex flex-col w-80 rounded-3xl p-5 border shadow-sm shrink-0 self-start sticky top-6"
      >
        <div
          style={{ borderColor: theme.border }}
          className="flex items-center gap-3 pb-4 border-b"
        >
          <img
            src="/assets/pawty-icon.png"
            alt="Pawty"
            className="w-11 h-11 rounded-2xl object-cover border border-stone-100"
          />
          <div>
            <img
              src="/assets/pawty-logo-full.png"
              alt="Pawty"
              className="h-6 object-contain"
            />
            <p style={{ color: theme.textSoft }} className="text-xs mt-0.5">
              Chăm thú cưng gọn gàng mỗi ngày
            </p>
          </div>
        </div>

        {/* Unified Pet Profile Selector */}
        <div className="mt-4">
          <p
            style={{ color: theme.textSoft }}
            className="text-[11px] font-bold uppercase tracking-wider mb-2"
          >
            Thú cưng đang quản lý
          </p>
          <div className="space-y-1.5">
            {pets.map((pet) => {
              const isSelected = pet.id === activePetId;
              return (
                <button
                  key={pet.id}
                  onClick={() => setActivePetId(pet.id)}
                  style={{
                    borderColor: isSelected ? theme.primary : theme.border,
                    backgroundColor: isSelected ? theme.primarySoft : 'transparent',
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={pet.avatarUrl}
                      alt={pet.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{pet.name}</span>
                        <span
                          style={{
                            backgroundColor: theme.surface,
                            color: theme.textSoft,
                            borderColor: theme.border,
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 font-semibold"
                        >
                          {pet.species === 'dog' ? (
                            <Dog className="w-3 h-3" />
                          ) : (
                            <Cat className="w-3 h-3" />
                          )}
                          {pet.species === 'dog' ? 'Chó' : 'Mèo'}
                        </span>
                      </div>
                      <p
                        style={{ color: theme.textSoft }}
                        className="text-[11px] truncate max-w-[150px]"
                      >
                        {pet.breed}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <span
                      style={{ backgroundColor: theme.primary }}
                      className="w-2 h-2 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Personalization Theme Selector */}
        <div
          style={{ borderColor: theme.border }}
          className="mt-4 pt-4 border-t space-y-2"
        >
          <div className="flex items-center gap-1.5">
            <Palette style={{ color: theme.primary }} className="w-3.5 h-3.5" />
            <p
              style={{ color: theme.textSoft }}
              className="text-[11px] font-bold uppercase tracking-wider"
            >
              Giao diện cá nhân hóa
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(WEB_THEMES) as WebThemeId[]).map((id) => {
              const t = WEB_THEMES[id];
              const active = themeId === id;
              return (
                <button
                  key={id}
                  onClick={() => setThemeId(id)}
                  style={{
                    borderColor: active ? t.primary : theme.border,
                    backgroundColor: active ? t.primarySoft : 'transparent',
                  }}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-all"
                >
                  <span
                    style={{ backgroundColor: t.primary }}
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                  />
                  <span
                    style={{ color: active ? t.primary : theme.text }}
                    className="truncate"
                  >
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Mobile Viewport */}
      <div
        style={{
          backgroundColor: theme.bg,
          color: theme.text,
          borderColor: themeId === 'dark' ? '#2A2725' : '#23201E',
        }}
        className="relative w-full lg:w-[412px] h-dvh lg:h-[868px] lg:rounded-[44px] lg:border-[10px] lg:shadow-[0_20px_50px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden"
      >
        {/* Top App Bar (Instagram-Style: Left [+], Center Single Logo, Right [SOS] + [Notif]) */}
        {hasCompletedOnboarding && (
          <header
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
            className="h-14 px-4 flex items-center justify-between border-b shrink-0 z-30 select-none"
          >
            {/* Left: Instagram-style '+' Create Post Button */}
            <div className="flex items-center min-w-[84px]">
              <button
                onClick={() => setActiveModal('new_moment')}
                aria-label="Đăng bài mới"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="w-9 h-9 rounded-xl border flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Center: Single Official Wordmark Logo Only */}
            <div className="flex items-center justify-center">
              <img
                src="/assets/pawty-logo-full.png"
                alt="Pawty"
                className="h-8 object-contain"
              />
            </div>

            {/* Right: SOS Hub + Notifications */}
            <div className="flex items-center justify-end gap-1.5 min-w-[84px]">
              <button
                onClick={() => setActiveModal('sos_alert')}
                aria-label="Trung tâm SOS Thú lạc"
                className="px-2.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[11px] font-extrabold flex items-center gap-1 hover:opacity-85 transition-opacity"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SOS</span>
              </button>

              <button
                onClick={() => setActiveModal('notifications')}
                aria-label="Thông báo"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="relative w-9 h-9 rounded-xl border flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span
                    style={{ backgroundColor: theme.primary }}
                    className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {unreadNotifCount}
                  </span>
                )}
              </button>
            </div>
          </header>
        )}

        {/* Vector-Icon Custom Notification Banner (Zero Emojis) */}
        {toast && (
          <div
            onClick={clearToast}
            style={{
              backgroundColor: theme.surface,
              borderColor:
                toast.tone === 'danger'
                  ? '#C94A4A'
                  : toast.tone === 'warning'
                  ? '#C88A2E'
                  : theme.primary,
            }}
            className="mx-3 mt-2.5 p-3 rounded-2xl shadow-md border border-l-4 cursor-pointer z-50 transition-all flex items-start gap-2.5"
          >
            <div
              style={{
                backgroundColor:
                  toast.tone === 'danger'
                    ? '#FDECEC'
                    : toast.tone === 'warning'
                    ? '#FDF5E6'
                    : theme.primarySoft,
                color:
                  toast.tone === 'danger'
                    ? '#C94A4A'
                    : toast.tone === 'warning'
                    ? '#C88A2E'
                    : theme.primary,
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            >
              {toast.tone === 'danger' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : toast.tone === 'warning' || toast.tone === 'info' ? (
                <Info className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: theme.text }} className="text-xs font-bold leading-snug">
                {toast.title}
              </p>
              <p
                style={{ color: theme.textSoft }}
                className="text-[11px] leading-snug mt-0.5"
              >
                {toast.message}
              </p>
            </div>
            <button
              onClick={clearToast}
              style={{ color: theme.textSoft }}
              className="p-0.5 hover:opacity-75"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Screen Viewport */}
        <main
          style={{ backgroundColor: theme.bg }}
          className="flex-1 overflow-y-auto no-scrollbar relative"
        >
          {children}
        </main>

        {/* Bottom Navigation Bar */}
        {hasCompletedOnboarding && <BottomTabBar />}
      </div>
    </div>
  );
};
