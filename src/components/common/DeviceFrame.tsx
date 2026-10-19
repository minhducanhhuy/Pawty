import React, { useState, ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  Maximize2,
  Minimize2,
  RefreshCw,
  Crown,
  Bell,
  MapPin,
  Sparkles,
  Info,
  X,
  Send,
  AlertTriangle,
  QrCode,
  Copy,
  Wifi
} from 'lucide-react';

interface DeviceFrameProps {
  children: ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [showDesktopInfo, setShowDesktopInfo] = useState(true);
  const [showWifiQr, setShowWifiQr] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  const {
    user,
    currentPet,
    activePushNotice,
    dismissPushNotice,
    isVipModalOpen,
    setIsVipModalOpen,
    isSosModalOpen,
    setIsSosModalOpen,
    setIsOnboardingOpen,
    resetAllDemoData,
    updateUserLocation,
    triggerPushNotice,
    setActiveTab,
    setSelectedChatRoomId,
  } = useApp();

  const LOCATIONS = [
    { name: 'Vinhomes Central Park', lat: 10.7951, lng: 106.7218, city: 'Bình Thạnh, TP.HCM' },
    { name: 'Masteri Thảo Điền', lat: 10.803, lng: 106.729, city: 'Thủ Đức, TP.HCM' },
    { name: 'Khu Đô Thị Sala', lat: 10.771, lng: 106.722, city: 'Thủ Thiêm, TP.HCM' },
    { name: 'Times City', lat: 20.995, lng: 105.868, city: 'Hai Bà Trưng, Hà Nội' },
  ];

  return (
    <div className="min-h-screen bg-[#14161D] text-slate-100 flex flex-col lg:flex-row items-center justify-center p-0 lg:p-6 overflow-x-hidden">
      {/* Desktop Helper Sidebar (Visible on LG screens) */}
      {!isFullscreenMode && showDesktopInfo && (
        <aside className="hidden xl:flex flex-col w-84 mr-8 bg-[#1F232D] border border-slate-700/60 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <img
                src="/assets/pawty-icon.png"
                alt="Pawty Icon"
                className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-[#FF6F61]/25 border border-white/10"
              />
              <div>
                <img
                  src="/assets/pawty-logo-full.png"
                  alt="Pawty"
                  className="h-7 w-auto object-contain"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Playful Minimalism UI</p>
              </div>
            </div>
            <button
              onClick={() => setShowDesktopInfo(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
              title="Thu gọn bảng điều khiển"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Demo Controls */}
          <div className="py-4 space-y-4 text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF6F61]" /> Giả lập GPS PostGIS (Chung cư)
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {LOCATIONS.map((loc) => {
                  const isSelected = user.location.condoComplex.includes(loc.name);
                  return (
                    <button
                      key={loc.name}
                      onClick={() => updateUserLocation(loc.name, loc.lat, loc.lng)}
                      className={`text-left p-2 rounded-xl transition-all border text-[11px] font-medium ${
                        isSelected
                          ? 'bg-[#FF6F61]/20 border-[#FF6F61] text-white shadow-sm'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="truncate font-bold">{loc.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{loc.city}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#A3E4D7]" /> Test Nhanh Các Luồng Core
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/70 flex items-center justify-between text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>📱</span>
                    <span>Core 1: Onboarding OTP & Tạo Boss</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Mở</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('chat');
                    setSelectedChatRoomId('room_mochi_01');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/70 flex items-center justify-between text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Core 4: Chat & Kèo Hẹn Landmark</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Mở</span>
                </button>

                <button
                  onClick={() => setIsSosModalOpen(true)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-700/50 flex items-center justify-between text-red-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>🚨</span>
                    <span>Monetization: SOS Lạc (39k VietQR)</span>
                  </span>
                  <span className="text-[10px] text-red-300">Test</span>
                </button>

                <button
                  onClick={() => setIsVipModalOpen(true)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-600/50 flex items-center justify-between text-amber-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Monetization: Nâng Cấp VIP (49k)</span>
                  </span>
                  <span className="text-[10px] text-amber-300">
                    {user.isVip ? 'Đã kích hoạt' : 'Nâng cấp'}
                  </span>
                </button>
              </div>
            </div>

            {/* Test Push FCM */}
            <div className="pt-2">
              <button
                onClick={() => {
                  triggerPushNotice({
                    title: '🐾 FCM: Mochi vừa quẹt thích Boss Bơ!',
                    body: 'Cặp đôi chân ngắn & mặt cười đã sẵn sàng cho chuyến đi dạo tối nay!',
                    type: 'match',
                  });
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <Bell className="w-3.5 h-3.5 text-[#FF6F61]" />
                <span>Bắn thử Push Notification FCM</span>
              </button>
            </div>

            {/* Wi-Fi Local Sharing */}
            <div className="pt-2">
              <div className="p-3 rounded-2xl bg-slate-800/90 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                    <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                    <span>Cùng Mạng Wi-Fi</span>
                  </span>
                  <button
                    onClick={() => setShowWifiQr(!showWifiQr)}
                    className="text-[10px] text-slate-300 hover:text-white bg-slate-700/80 hover:bg-slate-700 px-2 py-0.5 rounded-lg border border-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>{showWifiQr ? 'Ẩn QR' : 'Quét QR'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-xl border border-slate-700 font-mono text-[11px] text-emerald-300">
                  <span className="truncate">http://192.168.21.100:5173</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('http://192.168.21.100:5173/');
                      setCopiedWifi(true);
                      setTimeout(() => setCopiedWifi(false), 2000);
                    }}
                    className="ml-2 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                    title="Sao chép link"
                  >
                    {copiedWifi ? (
                      <span className="text-[10px] text-emerald-400 font-sans font-bold">Đã chép!</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {showWifiQr && (
                  <div className="p-2.5 bg-white rounded-xl text-center space-y-1.5 animate-in zoom-in-95 duration-150 shadow-md">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=http://192.168.21.100:5173/"
                      alt="Wi-Fi QR Code"
                      className="w-36 h-36 mx-auto rounded-lg"
                    />
                    <p className="text-[10px] text-slate-600 font-sans font-medium">
                      📱 Mở Camera điện thoại quét để xem ngay
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reset & Status Footer */}
          <div className="pt-3 border-t border-slate-700/60 mt-auto flex items-center justify-between text-xs">
            <div className="text-[11px] text-slate-400">
              Boss: <span className="font-bold text-white">{currentPet.name}</span> ({currentPet.breed})
            </div>
            <button
              onClick={resetAllDemoData}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-300 border border-slate-700 text-slate-400 transition-colors"
              title="Khôi phục dữ liệu ban đầu"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Mockup Container */}
      <div className="relative flex flex-col items-center">
        {/* Toggle mode bar on Desktop */}
        <div className="hidden lg:flex items-center gap-3 mb-4 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/80 text-xs shadow-lg backdrop-blur">
          <button
            onClick={() => setIsFullscreenMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              !isFullscreenMode
                ? 'bg-[#FF6F61] text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Khung iPhone Mockup</span>
          </button>
          <button
            onClick={() => setIsFullscreenMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              isFullscreenMode
                ? 'bg-[#FF6F61] text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Toàn Màn Hình</span>
          </button>

          {!showDesktopInfo && !isFullscreenMode && (
            <button
              onClick={() => setShowDesktopInfo(true)}
              className="text-slate-400 hover:text-white flex items-center gap-1 ml-2 pl-2 border-l border-slate-700"
            >
              <Info className="w-3.5 h-3.5" /> Bảng điều khiển
            </button>
          )}
        </div>

        {/* The Phone Shell */}
        <div
          className={`relative transition-all duration-300 ${
            isFullscreenMode
              ? 'w-screen h-screen rounded-none border-none shadow-none max-w-none'
              : 'w-[412px] h-[860px] max-h-[92vh] rounded-[48px] border-[10px] border-[#2A2E3B] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-black/80'
          } bg-[#FDFBF7] text-slate-800 overflow-hidden flex flex-col`}
        >
          {/* Top Notch / Dynamic Island & Status Bar (Mock Mobile) */}
          <div className="relative shrink-0 h-11 bg-transparent px-6 pt-3 flex items-center justify-between text-xs font-semibold text-slate-700 select-none z-50">
            {/* Clock */}
            <span className="font-mono text-[13px] tracking-tight text-slate-900 font-bold">19:42</span>

            {/* Dynamic Island Pill */}
            {!isFullscreenMode && (
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-28 h-5 bg-black rounded-full flex items-center justify-center px-2 shadow-inner">
                <img
                  src="/assets/pawty-icon.png"
                  alt="Pawty"
                  className="w-3.5 h-3.5 rounded-full object-cover mr-auto"
                />
                <span className="text-[9px] text-[#A3E4D7] font-mono tracking-wider font-semibold">PAWTY</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto animate-pulse" />
              </div>
            )}

            {/* Mobile Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="text-[10px] font-bold font-mono">5G</span>
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"/>
              </svg>
              {/* Battery */}
              <div className="w-5 h-2.5 border border-slate-700 rounded-sm p-0.5 flex items-center">
                <div className="h-full w-4/5 bg-slate-900 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* FCM Push Notification Toast Overlay (Top Slide-down) */}
          {activePushNotice && (
            <div
              onClick={() => {
                if (activePushNotice.type === 'match' || activePushNotice.type === 'chat') {
                  setActiveTab('chat');
                  setSelectedChatRoomId('room_mochi_01');
                } else if (activePushNotice.type === 'sos') {
                  setIsSosModalOpen(true);
                }
                dismissPushNotice();
              }}
              className="absolute top-12 left-3 right-3 z-50 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-2xl flex items-start gap-3 cursor-pointer animate-in fade-in slide-in-from-top-4 duration-300"
            >
              <img
                src="/assets/pawty-icon.png"
                alt="Pawty App Icon"
                className="w-10 h-10 rounded-2xl object-cover shrink-0 shadow-md border border-slate-100"
              />
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6F61]">Pawty • Thông báo</span>
                  <span className="text-[10px] text-slate-400">{activePushNotice.time}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{activePushNotice.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{activePushNotice.body}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissPushNotice();
                }}
                className="text-slate-400 hover:text-slate-700 p-1 -mr-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Screen Content */}
          <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#FDFBF7]">
            {children}
          </main>

          {/* Bottom Home Indicator Bar (Mock Mobile) */}
          <div className="shrink-0 h-5 bg-[#FDFBF7] flex items-center justify-center">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
