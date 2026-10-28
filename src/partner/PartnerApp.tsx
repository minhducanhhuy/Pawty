import { LayoutDashboard, Megaphone, TicketCheck, Wallet } from 'lucide-react';
import { useHashRoute } from '../shared/hooks/useHashRoute';
import { formatVnd } from '../shared/lib/format';
import { FullScreenLoader } from '../shared/ui/FullScreenLoader';
import { PortalLayout, type NavItem } from '../shared/ui/PortalLayout';
import { usePartnerAuth } from './auth/PartnerAuthContext';
import { PartnerAuthPage } from './pages/PartnerAuthPage';
import { PartnerCampaignsPage } from './pages/PartnerCampaignsPage';
import { PartnerOverviewPage } from './pages/PartnerOverviewPage';
import { PartnerRedeemPage } from './pages/PartnerRedeemPage';
import { PartnerTopupPage } from './pages/PartnerTopupPage';

const NAV_ITEMS: NavItem[] = [
  { path: '/overview', label: 'Tổng quan & Số dư', icon: <LayoutDashboard className="h-4 w-4" /> },
  { path: '/campaigns', label: 'Chiến dịch Native Ads', icon: <Megaphone className="h-4 w-4" /> },
  { path: '/topup', label: 'Nạp ngân sách VietQR', icon: <Wallet className="h-4 w-4" /> },
  { path: '/redeem', label: 'Redeem Voucher', icon: <TicketCheck className="h-4 w-4" /> },
];

export function PartnerApp() {
  const { partner, isRestoring, logout } = usePartnerAuth();
  const [currentPath, navigateTo] = useHashRoute('/overview');

  if (isRestoring) {
    return <FullScreenLoader label="Đang tải cổng Đối tác Pawty…" />;
  }

  if (!partner) {
    return <PartnerAuthPage />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/campaigns':
        return <PartnerCampaignsPage />;
      case '/topup':
        return <PartnerTopupPage />;
      case '/redeem':
        return <PartnerRedeemPage />;
      case '/overview':
      default:
        return <PartnerOverviewPage onNavigate={navigateTo} />;
    }
  };

  return (
    <PortalLayout
      portalName="Pawty Partner Portal"
      navItems={NAV_ITEMS}
      currentPath={currentPath}
      onNavigate={navigateTo}
      accountLabel={`${partner.businessName} • ${formatVnd(partner.balanceVnd)}`}
      onLogout={logout}
    >
      {renderPage()}
    </PortalLayout>
  );
}
