import { useState } from 'react';
import { BarChart2, Edit3, Pause, Play, Plus } from 'lucide-react';
import { useMutationRunner } from '../../shared/hooks/useMutationRunner';
import { usePagedResource } from '../../shared/hooks/usePagedResource';
import { formatDate, formatNumber } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { DataTable, SearchInput, type TableColumn } from '../../shared/ui/DataTable';
import { Badge, PageHeader } from '../../shared/ui/feedback';
import { partnerApi } from '../api/partnerApi';
import type { PartnerAd, PartnerAdInput } from '../api/partnerTypes';
import { usePartnerAuth } from '../auth/PartnerAuthContext';
import { CampaignFormModal } from '../components/CampaignFormModal';
import { CampaignStatsModal } from '../components/CampaignStatsModal';

export function PartnerCampaignsPage() {
  const { partner } = usePartnerAuth();
  const paged = usePagedResource((query) => partnerApi.listAds(query));
  const { run, isBusy } = useMutationRunner();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<PartnerAd | null>(null);
  const [statsAd, setStatsAd] = useState<PartnerAd | null>(null);

  const handleSaveCampaign = async (input: PartnerAdInput) => {
    const result = await run(
      () => (editingAd ? partnerApi.updateAd(editingAd.id, input) : partnerApi.createAd(input)),
      {
        successMessage: editingAd ? 'Đã cập nhật chiến dịch quảng cáo!' : 'Đã tạo chiến dịch Native Ad mới!',
        failureLogLabel: editingAd ? `updateAd ${editingAd.id}` : 'createAd',
      },
    );
    if (result !== undefined) {
      setIsFormOpen(false);
      setEditingAd(null);
      paged.reload();
    }
  };

  const handleToggleStatus = async (ad: PartnerAd) => {
    const nextStatus = ad.status === 'active' ? 'paused' : 'active';
    const result = await run(() => partnerApi.updateAd(ad.id, { status: nextStatus }), {
      successMessage: nextStatus === 'active' ? `Đã chạy lại "${ad.title}".` : `Đã tạm dừng "${ad.title}".`,
      failureLogLabel: `toggleAdStatus ${ad.id}`,
    });
    if (result !== undefined) paged.reload();
  };

  const columns: Array<TableColumn<PartnerAd>> = [
    {
      key: 'title',
      header: 'Chiến dịch Native Ad',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-bold text-slate-900 line-clamp-1">{row.title}</p>
          <p className="text-xs text-slate-500">Bán kính {(row.radiusMeters / 1000).toFixed(1)}km • Hạn: {formatDate(row.endsAt)}</p>
        </div>
      ),
    },
    {
      key: 'voucher',
      header: 'Ưu đãi & Quota',
      render: (row) => (
        <div>
          <Badge tone="coral">Voucher -{row.discountPercent}%</Badge>
          <p className="mt-1 text-xs text-slate-600">Đã lưu: {row.vouchersIssued} / {row.voucherQuota}</p>
        </div>
      ),
    },
    {
      key: 'performance',
      header: 'Hiển thị / Click',
      render: (row) => (
        <div className="text-xs text-slate-700">
          <p><strong>{formatNumber(row.impressions)}</strong> lượt xem</p>
          <p className="font-bold text-coral-dark">{formatNumber(row.clicks)} lượt click</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <Badge tone={row.status === 'active' ? 'success' : row.status === 'paused' ? 'warning' : 'neutral'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          <Button variant="secondary" size="sm" leadingIcon={<BarChart2 className="h-3.5 w-3.5" />} onClick={() => setStatsAd(row)}>
            Thống kê
          </Button>
          <Button variant="secondary" size="sm" leadingIcon={<Edit3 className="h-3.5 w-3.5" />} onClick={() => { setEditingAd(row); setIsFormOpen(true); }}>
            Sửa & Preview
          </Button>
          {row.status !== 'ended' && (
            <Button variant={row.status === 'active' ? 'ghost' : 'mint'} size="sm" disabled={isBusy} leadingIcon={row.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} onClick={() => handleToggleStatus(row)}>
              {row.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chiến dịch Native Ads trên Radar"
        description="Thiết kế thẻ quảng cáo bản địa kèm Voucher ưu đãi hiển thị đúng bán kính quanh cửa hàng của bạn."
        actions={
          <Button variant="primary" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditingAd(null); setIsFormOpen(true); }}>
            Tạo chiến dịch mới
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={paged.items}
        getRowKey={(row) => row.id}
        isLoading={paged.isLoading}
        errorMessage={paged.errorMessage}
        onRetry={paged.reload}
        emptyTitle="Chưa có chiến dịch nào"
        emptyDescription="Bấm 'Tạo chiến dịch mới' để thiết kế thẻ Native Ad xuất hiện trên Radar."
        toolbar={<SearchInput value={paged.searchText} onChange={paged.setSearchText} placeholder="Tìm chiến dịch…" />}
        pagination={{ page: paged.page, limit: paged.limit, total: paged.total, onPageChange: paged.setPage }}
      />
      <CampaignFormModal isOpen={isFormOpen} businessName={partner?.businessName ?? 'Pawty Partner'} editingAd={editingAd} isBusy={isBusy} onClose={() => { setIsFormOpen(false); setEditingAd(null); }} onSubmit={handleSaveCampaign} />
      <CampaignStatsModal ad={statsAd} onClose={() => setStatsAd(null)} />
    </div>
  );
}
