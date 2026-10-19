import React from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, Flame, Image as ImageIcon, MessageSquare, User, Sparkles } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, chatRooms, setSelectedChatRoomId } = useApp();

  const totalUnread = chatRooms.reduce((acc, room) => acc + (room.unreadCount || 0), 0);

  const navItems = [
    {
      id: 'radar',
      label: 'Radar Boss',
      icon: Flame,
      badge: null,
    },
    {
      id: 'moments',
      label: 'Khoảnh Khắc',
      icon: ImageIcon,
      badge: null,
    },
    {
      id: 'chat',
      label: 'Chat & Hẹn',
      icon: MessageSquare,
      badge: totalUnread > 0 ? totalUnread : null,
    },
    {
      id: 'profile',
      label: 'Hồ Sơ Boss',
      icon: User,
      badge: null,
    },
  ] as const;

  return (
    <nav className="shrink-0 h-16 bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-3 flex items-center justify-around z-30 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const IconComponent = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id !== 'chat') {
                setSelectedChatRoomId(null);
              }
              setActiveTab(item.id);
            }}
            className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all group"
          >
            {/* Active Pill Indicator */}
            <div
              className={`flex items-center justify-center w-11 h-8 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-tr from-[#FF6F61] to-[#FF9A8B] text-white shadow-md shadow-[#FF6F61]/25 scale-105'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            >
              <IconComponent className="w-5 h-5 stroke-[2.2]" />
            </div>

            <span
              className={`text-[10px] mt-0.5 tracking-tight font-bold transition-colors ${
                isActive ? 'text-[#FF6F61]' : 'text-slate-500 group-hover:text-slate-700'
              }`}
            >
              {item.label}
            </span>

            {/* Unread Badge */}
            {item.badge && (
              <span className="absolute top-0.5 right-4 w-4 h-4 rounded-full bg-[#FF6F61] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
