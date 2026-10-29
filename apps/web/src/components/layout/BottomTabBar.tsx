import React from 'react';
import { Briefcase, Calendar, Compass, Heart, MessageCircle, User } from 'lucide-react';
import { usePawtyStore, type BottomTabId } from '../../stores/usePawtyStore';
import { WEB_THEMES } from '../../mocks/seedData';

export const BottomTabBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setExploreSubTab,
    conversations,
    bookings,
    themeId,
  } = usePawtyStore();

  const theme = WEB_THEMES[themeId] ?? WEB_THEMES.coral;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length;

  const navItems: {
    id: BottomTabId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'explore',
      label: 'Khám phá',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      id: 'tinder',
      label: 'Kết nối',
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: 'services',
      label: 'Dịch vụ',
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      id: 'appointments',
      label: 'Lịch hẹn',
      icon: <Calendar className="w-5 h-5" />,
      badge: upcomingBookings > 0 ? upcomingBookings : undefined,
    },
    {
      id: 'chat',
      label: 'Tin nhắn',
      icon: <MessageCircle className="w-5 h-5" />,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      id: 'profile',
      label: 'Tôi',
      icon: <User className="w-5 h-5" />,
    },
  ];

  const handleSelectTab = (id: BottomTabId) => {
    if (id === 'explore') {
      setExploreSubTab('feed');
    } else if (id === 'tinder') {
      setExploreSubTab('radar');
    } else if (id === 'services') {
      setExploreSubTab('services');
    }
    setActiveTab(id);
  };

  return (
    <nav
      aria-label="Điều hướng chính Pawty"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }}
      className="h-16 border-t px-1 flex items-center justify-around shrink-0 z-30 select-none"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleSelectTab(item.id)}
            style={{ color: isActive ? theme.primary : theme.textSoft }}
            className="relative flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-colors"
          >
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && (
                <span
                  style={{ backgroundColor: theme.primary }}
                  className="absolute -top-1.5 -right-2.5 min-w-[15px] h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-0.5 truncate ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
