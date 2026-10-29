import React from 'react';
import { Compass, Home, MessageCircle, Plus, User } from 'lucide-react';
import { usePawtyStore, type BottomTabId } from '../../stores/usePawtyStore';

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab, setActiveModal, conversations, careTasks } = usePawtyStore();

  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const pendingTasks = careTasks.filter((t) => t.status === 'pending').length;

  const navItems: {
    id: BottomTabId | 'create';
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'today',
      label: 'Hôm nay',
      icon: <Home className="w-5 h-5" />,
      badge: pendingTasks > 0 ? pendingTasks : undefined,
    },
    {
      id: 'explore',
      label: 'Khám phá',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      id: 'create',
      label: 'Tạo mới',
      icon: <Plus className="w-6 h-6 text-white" />,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageCircle className="w-5 h-5" />,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      id: 'profile',
      label: 'Tôi',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      aria-label="Điều hướng chính Pawty"
      className="h-20 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-2 flex items-center justify-around shrink-0 z-30 select-none"
    >
      {navItems.map((item) => {
        if (item.id === 'create') {
          return (
            <button
              key="create"
              onClick={() => setActiveModal('create_sheet')}
              aria-label="Mở menu tạo mới"
              className="flex flex-col items-center justify-center -mt-5 group"
            >
              <div className="w-13 h-13 rounded-full bg-[#FF6F61] shadow-[0_6px_18px_rgba(255,111,97,0.45)] flex items-center justify-center group-hover:scale-105 active:scale-95 transition-transform">
                {item.icon}
              </div>
              <span className="text-[10px] font-bold text-[#2D3436] mt-1">{item.label}</span>
            </button>
          );
        }

        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as BottomTabId)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-colors ${
              isActive ? 'text-[#FF6F61]' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#FF6F61] text-white text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-1 ${isActive ? 'font-extrabold' : 'font-semibold'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

