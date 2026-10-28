import {
  AlertOctagon,
  BarChart3,
  ClipboardCheck,
  CreditCard,
  History,
  Megaphone,
  Radio,
  Store,
  Users,
} from 'lucide-react';
import { useHashRoute } from '../shared/hooks/useHashRoute';
import { FullScreenLoader } from '../shared/ui/FullScreenLoader';
import { PortalLayout, type NavItem } from '../shared/ui/PortalLayout';
import { useAdminAuth } from './auth/AdminAuthContext';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdsPage } from './pages/AdsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { DashboardPage } from './pages/DashboardPage';
import { PartnersPage } from './pages/PartnersPage';
import { ReportsPage } from './pages/ReportsPage';
import { SosMonitorPage } from './pages/SosMonitorPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { UsersPage } from './pages/UsersPage';
import { VaccineQueuePage } from './pages/VaccineQueuePage';

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Bảng điều khiển KPI', icon: <BarChart3 className="h-4 w-4" /> },
  { path: '/vaccines', label: 'Duyệt Sổ tiêm Safe Pet', icon: <ClipboardCheck className="h-4 w-4" /> },
  { path: '/reports', label: 'Báo cáo vi phạm', icon: <AlertOctagon className="h-4 w-4" /> },
  { path: '/users', label: 'Người dùng & VIP', icon: <Users className="h-4 w-4" /> },
  { path: '/transactions', label: 'Giao dịch VietQR', icon: <CreditCard className="h-4 w-4" /> },
  { path: '/partners', label: 'Đối tác cửa hàng', icon: <Store className="h-4 w-4" /> },
  { path: '/ads', label: 'Chiến dịch Native Ads', icon: <Megaphone className="h-4 w-4" /> },
  { path: '/sos', label: 'Giám sát SOS 3km', icon: <Radio className="h-4 w-4" /> },
  { path: '/audit-logs', label: 'Nhật ký kiểm toán', icon: <History className="h-4 w-4" /> },
];

export function AdminApp() {
  const { profile, isRestoring, logout } = useAdminAuth();
  const [currentPath, navigateTo] = useHashRoute('/dashboard');

  if (isRestoring) {
    return <FullScreenLoader label="Đang xác thực quyền Quản trị…" />;
  }

  if (!profile) {
    return <AdminLoginPage />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/vaccines':
        return <VaccineQueuePage />;
      case '/reports':
        return <ReportsPage />;
      case '/users':
        return <UsersPage />;
      case '/transactions':
        return <TransactionsPage />;
      case '/partners':
        return <PartnersPage />;
      case '/ads':
        return <AdsPage />;
      case '/sos':
        return <SosMonitorPage />;
      case '/audit-logs':
        return <AuditLogPage />;
      case '/dashboard':
      default:
        return <DashboardPage onNavigate={navigateTo} />;
    }
  };

  return (
    <PortalLayout
      portalName="Pawty Admin Portal"
      navItems={NAV_ITEMS}
      currentPath={currentPath}
      onNavigate={navigateTo}
      accountLabel={`${profile.fullName} (${profile.role.toUpperCase()})`}
      onLogout={logout}
    >
      {renderPage()}
    </PortalLayout>
  );
}
