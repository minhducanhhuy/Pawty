import { Radio } from 'lucide-react';
import { usePagedResource } from '../../shared/hooks/usePagedResource';
import { formatDateTime } from '../../shared/lib/format';
import { DataTable, SearchInput, type TableColumn } from '../../shared/ui/DataTable';
import { Badge, PageHeader } from '../../shared/ui/feedback';
import { adminApi } from '../api/adminApi';
import type { AdminSosAlert } from '../api/adminTypes';

export function SosMonitorPage() {
  const paged = usePagedResource((query) => adminApi.listSos(query));

  const columns: Array<TableColumn<AdminSosAlert>> = [
    {
      key: 'pet',
      header: 'Boss thất lạc',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Radio className={row.status === 'active' ? 'h-4 w-4 animate-pulse text-red-600' : 'h-4 w-4 text-slate-400'} />
          <div>
            <p className="font-bold text-slate-900">{row.petName}</p>
            <p className="text-xs text-slate-500">Chủ nuôi: {row.ownerName ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Vị trí nhìn thấy lần cuối',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.lastSeenAddress ?? '—'}</p>
          <p className="text-xs text-slate-500">Phát sóng bán kính {row.radiusKm ?? 3}km</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái SOS',
      render: (row) => (
        <Badge tone={row.status === 'active' ? 'danger' : row.status === 'resolved' ? 'success' : 'neutral'}>
          {row.status === 'active' ? '🚨 ĐANG PHÁT BÁO ĐỘNG' : row.status === 'resolved' ? '✓ ĐÃ TÌM THẤY' : 'HẾT HẠN'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Thời gian kích hoạt',
      render: (row) => (
        <div className="text-xs text-slate-600">
          <p>Phát lúc: {formatDateTime(row.createdAt)}</p>
          {row.resolvedAt && <p className="text-emerald-700">Tìm thấy: {formatDateTime(row.resolvedAt)}</p>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Giám sát SOS Tìm Boss Lạc (Bán kính 3km)"
        description="Theo dõi các tin báo động khẩn cấp đang phát Push Notification cho cộng đồng cư dân xung quanh."
      />

      <DataTable
        columns={columns}
        rows={paged.items}
        getRowKey={(row) => row.id}
        isLoading={paged.isLoading}
        errorMessage={paged.errorMessage}
        onRetry={paged.reload}
        emptyTitle="Hiện không có cảnh báo SOS nào"
        toolbar={<SearchInput value={paged.searchText} onChange={paged.setSearchText} placeholder="Tìm tên Boss, chủ nuôi, địa điểm…" />}
        pagination={{ page: paged.page, limit: paged.limit, total: paged.total, onPageChange: paged.setPage }}
      />
    </div>
  );
}
