import { Compass, RefreshCw, Sparkles } from 'lucide-react';
import { useAsyncResource } from '../../shared/hooks/useAsyncResource';
import { formatNumber, formatPercent, formatVnd } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { Badge, Card, ErrorState, PageHeader, Spinner } from '../../shared/ui/feedback';
import { adminApi } from '../api/adminApi';
import { DashboardCharts } from './DashboardCharts';

interface DashboardPageProps {
  onNavigate?: (path: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data: kpi, isLoading, errorMessage, reload } = useAsyncResource(() => adminApi.getKpi(), []);

  if (isLoading && !kpi) return <Spinner label="Đang tải chỉ số KPI…" />;
  if (errorMessage || !kpi) return <ErrorState message={errorMessage ?? 'Không tải được dữ liệu KPI'} onRetry={reload} />;

  const totalRevenue =
    kpi.revenueBySource.sos + kpi.revenueBySource.vip + kpi.revenueBySource.iap + kpi.revenueBySource.ads;

  const metricCards = [
    { label: 'DAU / MAU', value: `${formatNumber(kpi.dau)} / ${formatNumber(kpi.mau)}`, hint: `Tổng ${formatNumber(kpi.totalUsers)} Sen` },
    { label: 'Boss mới hôm nay', value: formatNumber(kpi.newPetsToday), hint: 'Hồ sơ thú cưng tạo mới' },
    { label: 'Match hôm nay', value: formatNumber(kpi.matchesToday), hint: 'Cặp đôi khớp lệnh trên Radar' },
    {
      label: 'Kèo hẹn hôm nay',
      value: `${formatNumber(kpi.appointmentsCompletedToday)} / ${formatNumber(kpi.appointmentsCreatedToday)}`,
      hint: 'Hoàn thành / Đã tạo',
    },
    { label: 'Tỷ lệ bùng kèo', value: formatPercent(kpi.flakeRate), hint: 'Ngưỡng cảnh báo: > 10%' },
    { label: 'Sổ tiêm chờ duyệt', value: formatNumber(kpi.vaccinePending), hint: 'Hàng đợi Safe Pet', route: '/vaccines' },
    { label: 'Báo cáo mở', value: formatNumber(kpi.openReports), hint: 'Vi phạm cần xử lý', route: '/reports' },
    { label: 'Đối tác chờ duyệt', value: formatNumber(kpi.partnersPending), hint: 'Cửa hàng đăng ký mới', route: '/partners' },
  ];

  const revenueItems = [
    { label: '🚨 SOS Tìm Boss Lạc', amount: kpi.revenueBySource.sos, tone: 'danger' as const },
    { label: '👑 Gói Sen VIP / VIP+', amount: kpi.revenueBySource.vip, tone: 'coral' as const },
    { label: '⚡ Mua lẻ (Boost / Super Paw)', amount: kpi.revenueBySource.iap, tone: 'info' as const },
    { label: '🎁 Quảng cáo Native Ads', amount: kpi.revenueBySource.ads, tone: 'success' as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng điều khiển KPI"
        description="Theo dõi sức khoẻ cộng đồng Pawty, doanh thu đa nguồn và chỉ số North Star thời gian thực."
        actions={
          <Button variant="secondary" size="sm" leadingIcon={<RefreshCw className="h-4 w-4" />} onClick={reload}>
            Làm mới
          </Button>
        }
      />

      <Card className="border-coral/30 bg-gradient-to-r from-coral-light via-white to-mint-light">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-coral-dark">
              <Sparkles className="h-4 w-4" />
              North Star Metric — Kèo hẹn hoàn thành trong tuần
            </div>
            <p className="font-fredoka text-3xl font-bold text-slate-900">
              {formatNumber(kpi.northStarCompletedThisWeek)} cuộc dắt dạo thực tế 🐾
            </p>
            <p className="text-xs text-slate-600">
              Đo lường số kèo hẹn được cả 2 chủ nuôi Check-in GPS thành công trong bán kính 150m tại điểm hẹn.
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 px-4 py-3 text-right shadow-sm">
            <p className="text-xs font-bold text-slate-500">Tổng doanh thu ghi nhận</p>
            <p className="font-fredoka text-2xl font-bold text-emerald-700">{formatVnd(totalRevenue)}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.label} className="flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{card.label}</span>
              {card.route && onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate(card.route!)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-coral hover:underline cursor-pointer"
                >
                  <Compass className="h-3.5 w-3.5" /> Mở
                </button>
              )}
            </div>
            <p className="font-fredoka text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500">{card.hint}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Cơ cấu doanh thu theo nguồn (Monetization)</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {revenueItems.map((rev) => (
            <div key={rev.label} className="rounded-xl border border-slate-100 bg-cream p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">{rev.label}</span>
                <Badge tone={rev.tone}>
                  {totalRevenue > 0 ? formatPercent(rev.amount / totalRevenue) : '0%'}
                </Badge>
              </div>
              <p className="mt-2 font-fredoka text-xl font-bold text-slate-900">{formatVnd(rev.amount)}</p>
            </div>
          ))}
        </div>
      </Card>

      <DashboardCharts series={kpi.series} />
    </div>
  );
}
