import { Megaphone, PlusCircle, TicketCheck, Wallet } from 'lucide-react';
import { useAsyncResource } from '../../shared/hooks/useAsyncResource';
import { formatNumber, formatPercent, formatVnd } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { Badge, Card, ErrorState, PageHeader, Spinner } from '../../shared/ui/feedback';
import { partnerApi } from '../api/partnerApi';
import { usePartnerAuth } from '../auth/PartnerAuthContext';

interface PartnerOverviewPageProps {
  onNavigate: (path: string) => void;
}

export function PartnerOverviewPage({ onNavigate }: PartnerOverviewPageProps) {
  const { partner } = usePartnerAuth();
  const { data: adsPage, isLoading, errorMessage, reload } = useAsyncResource(
    () => partnerApi.listAds({ page: 1, limit: 50 }),
    [],
  );

  if (isLoading && !adsPage) return <Spinner label="Đang tải tổng quan đối tác…" />;
  if (errorMessage || !adsPage) return <ErrorState message={errorMessage ?? 'Không tải được dữ liệu'} onRetry={reload} />;

  const campaigns = adsPage.items;
  const totalImpressions = campaigns.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = campaigns.reduce((sum, item) => sum + item.clicks, 0);
  const totalVouchersIssued = campaigns.reduce((sum, item) => sum + item.vouchersIssued, 0);
  const totalVouchersRedeemed = campaigns.reduce(
    (sum, item) => sum + (item.vouchersRedeemed ?? Math.round(item.vouchersIssued * 0.45)),
    0,
  );
  const totalSpendVnd = campaigns.reduce((sum, item) => sum + (item.spendVnd ?? item.clicks * 3000), 0);
  const overallCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Xin chào, ${partner?.businessName ?? 'Đối tác Pawty'} 👋`}
        description="Quản lý ngân sách quảng cáo bản địa (Native Ads), theo dõi lượt lưu Voucher và đối soát tại cửa hàng."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" leadingIcon={<Wallet className="h-4 w-4" />} onClick={() => onNavigate('/topup')}>
              Nạp thêm ngân sách
            </Button>
            <Button variant="primary" size="sm" leadingIcon={<PlusCircle className="h-4 w-4" />} onClick={() => onNavigate('/campaigns')}>
              Quản lý Chiến dịch
            </Button>
          </div>
        }
      />

      <Card className="border-mint-dark/40 bg-gradient-to-r from-mint-light via-white to-coral-light">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Số dư ví Quảng cáo</span>
              <Badge tone={partner?.status === 'approved' ? 'success' : 'warning'}>
                {partner?.status === 'approved' ? 'Đã xác minh ✓' : 'Chờ Admin duyệt'}
              </Badge>
            </div>
            <p className="font-fredoka text-3xl font-bold text-slate-900">{formatVnd(partner?.balanceVnd ?? 0)}</p>
            <p className="text-xs text-slate-600">
              Gói cước: <strong>{partner?.plan === 'monthly' ? 'Trọn gói 1.500.000đ/tháng' : 'CPC — 3.000đ / lượt Click hoặc Lưu Voucher'}</strong> • Địa chỉ: {partner?.address}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="mint" size="sm" leadingIcon={<TicketCheck className="h-4 w-4" />} onClick={() => onNavigate('/redeem')}>
              Quét / Nhập mã Voucher khách hàng
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Tổng lượt hiển thị Radar</span>
          <p className="font-fredoka text-2xl font-bold text-slate-900">{formatNumber(totalImpressions)}</p>
          <p className="text-xs text-slate-500">Chèn sau mỗi 5–7 thẻ Boss quanh tiệm</p>
        </Card>
        <Card className="space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Lượt Click & CTR</span>
          <p className="font-fredoka text-2xl font-bold text-coral">
            {formatNumber(totalClicks)} <span className="text-sm text-slate-500">({formatPercent(overallCtr)})</span>
          </p>
          <p className="text-xs text-slate-500">Tần suất giới hạn 1 lần/giờ/người</p>
        </Card>
        <Card className="space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Voucher Phát hành / Đã dùng</span>
          <p className="font-fredoka text-2xl font-bold text-emerald-700">
            {formatNumber(totalVouchersIssued)} / {formatNumber(totalVouchersRedeemed)}
          </p>
          <p className="text-xs text-slate-500">Hiệu lực 14 ngày từ lúc lưu</p>
        </Card>
        <Card className="space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Tổng chi tiêu luỹ kế</span>
          <p className="font-fredoka text-2xl font-bold text-slate-900">{formatVnd(totalSpendVnd)}</p>
          <p className="text-xs text-slate-500">{campaigns.length} chiến dịch đã tạo</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Chiến dịch nổi bật</h2>
          <Button variant="ghost" size="sm" leadingIcon={<Megaphone className="h-4 w-4" />} onClick={() => onNavigate('/campaigns')}>
            Xem tất cả
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {campaigns.slice(0, 4).map((ad) => (
            <div key={ad.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-cream p-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={ad.status === 'active' ? 'success' : 'warning'}>{ad.status.toUpperCase()}</Badge>
                  <Badge tone="coral">-{ad.discountPercent}%</Badge>
                </div>
                <p className="mt-1 font-bold text-slate-900 line-clamp-1">{ad.title}</p>
                <p className="text-xs text-slate-500">
                  {formatNumber(ad.impressions)} hiển thị • {formatNumber(ad.clicks)} click • {ad.vouchersIssued}/{ad.voucherQuota} voucher
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
