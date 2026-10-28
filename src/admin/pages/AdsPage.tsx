import { Pause, Play } from 'lucide-react';
import { useMutationRunner } from '../../shared/hooks/useMutationRunner';
import { usePagedResource } from '../../shared/hooks/usePagedResource';
import { formatDate, formatNumber, formatPercent } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { DataTable, SearchInput, type TableColumn } from '../../shared/ui/DataTable';
import { Badge, PageHeader } from '../../shared/ui/feedback';
import { adminApi } from '../api/adminApi';
import type { AdminAd } from '../api/adminTypes';

export function AdsPage() {
  const paged = usePagedResource((query) => adminApi.listAds(query));
  const { run, isBusy } = useMutationRunner();

  const handleToggleAd = async (adId: string, status: 'active' | 'paused', title: string) => {
    const result = await run(() => adminApi.updateAdStatus(adId, status), {
      successMessage: status === 'active' ? `Đã kích hoạt chiến dịch "${title}".` : `Đã tạm dừng chiến dịch "${title}".`,
      failureLogLabel: `updateAdStatus ${adId}`,
    });
    if (result !== undefined) paged.reload();
  };

  const columns: Array<TableColumn<AdminAd>> = [
    {
      key: 'campaign',
      header: 'Chiến dịch Native Ad',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-500">
            Đối tác: {row.partnerName ?? '—'} • Bán kính {(row.radiusMeters / 1000).toFixed(1)}km
          </p>
        </div>
      ),
    },
    {
      key: 'voucher',
      header: 'Ưu đãi & Quota',
      render: (row) => (
        <div>
          <Badge tone="coral">Voucher -{row.discountPercent}%</Badge>
          <p className="mt-1 text-xs text-slate-600">
            Đã phát: {row.vouchersIssued} / {row.voucherQuota}
          </p>
        </div>
      ),
    },
    {
      key: 'metrics',
      header: 'Hiệu quả (Impr / Click / CTR)',
      render: (row) => {
        const ctr = row.impressions > 0 ? row.clicks / row.impressions : 0;
        return (
          <div className="text-xs text-slate-700">
            <p>
              <strong>{formatNumber(row.impressions)}</strong> hiển thị • <strong>{formatNumber(row.clicks)}</strong> click
            </p>
            <p className="text-slate-500">CTR: {formatPercent(ctr)}</p>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <div>
          <Badge
            tone={
              row.status === 'active'
                ? 'success'
                : row.status === 'paused'
                  ? 'warning'
                  : row.status === 'draft'
                    ? 'info'
                    : 'neutral'
            }
          >
            {row.status.toUpperCase()}
          </Badge>
          {row.endsAt && <p className="mt-1 text-xs text-slate-400">Hết hạn: {formatDate(row.endsAt)}</p>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.status !== 'active' && row.status !== 'ended' && (
            <Button
              variant="mint"
              size="sm"
              disabled={isBusy}
              leadingIcon={<Play className="h-3.5 w-3.5" />}
              onClick={() => handleToggleAd(row.id, 'active', row.title)}
            >
              Duyệt / Chạy
            </Button>
          )}
          {row.status === 'active' && (
            <Button
              variant="secondary"
              size="sm"
              disabled={isBusy}
              leadingIcon={<Pause className="h-3.5 w-3.5" />}
              onClick={() => handleToggleAd(row.id, 'paused', row.title)}
            >
              Tạm dừng
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Chiến dịch Native Ads"
        description="Kiểm duyệt nội dung thẻ quảng cáo bản địa chèn vào cọc quẹt Radar (tần suất mỗi 5–7 thẻ)."
      />

      <DataTable
        columns={columns}
        rows={paged.items}
        getRowKey={(row) => row.id}
        isLoading={paged.isLoading}
        errorMessage={paged.errorMessage}
        onRetry={paged.reload}
        emptyTitle="Chưa có chiến dịch quảng cáo nào"
        toolbar={<SearchInput value={paged.searchText} onChange={paged.setSearchText} placeholder="Tìm theo tiêu đề, tên đối tác…" />}
        pagination={{ page: paged.page, limit: paged.limit, total: paged.total, onPageChange: paged.setPage }}
      />
    </div>
  );
}
