import { Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { MockModeBanner } from './AuthShell';
import { Button } from './Button';
import { IS_MOCK_MODE } from '../config';

export interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  badgeCount?: number;
}

interface PortalLayoutProps {
  portalName: string;
  navItems: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  accountLabel: string;
  onLogout: () => void;
  children: ReactNode;
}

/** Sidebar cố định ≥ lg; dưới lg thu thành drawer để tablet vẫn dùng được. */
export function PortalLayout({ portalName, navItems, currentPath, onNavigate, accountLabel, onLogout, children }: PortalLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsDrawerOpen(false);
  };

  const sidebar = (
    <nav aria-label="Điều hướng chính" className="flex h-full flex-col gap-1 p-4">
      <img src="/assets/pawty-logo-full.png" alt="Pawty" className="mb-1 h-10 w-auto self-start" />
      <p className="mb-4 font-fredoka text-sm font-semibold text-coral-dark">{portalName}</p>
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <button
            key={item.path}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => handleNavigate(item.path)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors cursor-pointer',
              isActive ? 'bg-coral text-white shadow shadow-coral/30' : 'text-slate-700 hover:bg-cream-warm',
            )}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badgeCount ? (
              <span className={cn('rounded-full px-2 py-0.5 text-xs', isActive ? 'bg-white/25' : 'bg-coral-light text-coral-dark')}>{item.badgeCount}</span>
            ) : null}
          </button>
        );
      })}
      <div className="mt-auto space-y-2 border-t border-slate-200 pt-4">
        <p className="truncate text-xs font-semibold text-slate-500">{accountLabel}</p>
        <Button variant="secondary" size="sm" className="w-full" onClick={onLogout}>
          Đăng xuất
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream">
      {IS_MOCK_MODE && <MockModeBanner />}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block" style={{ top: IS_MOCK_MODE ? '1.9rem' : 0 }}>
        {sidebar}
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button type="button" aria-label="Mở menu" onClick={() => setIsDrawerOpen(true)} className="rounded-lg p-1.5 hover:bg-slate-100 cursor-pointer">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-fredoka font-semibold text-coral-dark">{portalName}</span>
        <span className="w-9" />
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setIsDrawerOpen(false)} aria-hidden="true" />
          <div className="relative h-full w-72 bg-white shadow-xl">
            <button type="button" aria-label="Đóng menu" onClick={() => setIsDrawerOpen(false)} className="absolute right-3 top-3 rounded-lg p-1.5 hover:bg-slate-100 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
