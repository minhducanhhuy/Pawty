import { CheckCircle2, PauseCircle } from 'lucide-react';
import { useMutationRunner } from '../../shared/hooks/useMutationRunner';
import { usePagedResource } from '../../shared/hooks/usePagedResource';
import { formatDateTime, formatVnd } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { DataTable, SearchInput, type TableColumn } from '../../shared/ui/DataTable';
import { Badge, PageHeader } from '../../shared/ui/feedback';
import { adminApi } from '../api/adminApi';
import type { AdminPartner } from '../api/adminTypes';

export function PartnersPage() {
  const paged = usePagedResource((query) => adminApi.listPartners(query));
  const { run, isBusy } = useMutationRunner();

  const handleStatusChange = async (partnerId: string, status: 'approved' | 'suspended', businessName: string) => {
    const result = await run(() => adminApi.updatePartnerStatus(partnerId, status), {
      successMessage: status === 'approved' ? `Đã duyệt đối tác "${businessName}"!` : `Đã đình chỉ đối tác "${businessName}".`,
      failureLogLabel: `updatePartnerStatus ${partnerId}`,
    });
    if (result !== undefined) paged.reload();
  };

  const columns: Array<TableColumn<AdminPartner>> = [
    {
      key: 'business',
      header: 'Thương hiệu / Cửa hàng',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.businessName}</p>
          <p className="text-xs text-slate-500">{row.address ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Liên hệ',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-700">{row.contactEmail}</p>
          <p className="text-xs text-slate-500">{row.phone ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Danh mục & Gói',
      render: (row) => (
        <div className="space-y-1">
          <Badge tone="info">{row.category.toUpperCase()}</Badge>
          <p className="text-xs text-slate-600">{row.plan === 'cpc' ? 'CPC (3.000đ/click)' : 'Trọn gói 1.5tr/tháng'}</p>
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Số dư ví Ads',
      render: (row) => <span className="font-fredoka font-bold text-emerald-700">{formatVnd(row.balanceVnd)}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <div>
          <Badge tone={row.status === 'approved' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'}>
            {row.status === 'approved' ? 'Đã duyệt' : row.status === 'pending' ? 'Chờ duyệt' : 'Đình chỉ'}
          </Badge>
          <p className="mt-1 text-xs text-slate-400">{formatDateTime(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.status !== 'approved' && (
            <Button
              variant="mint"
              size="sm"
              disabled={isBusy}
              leadingIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
              onClick={() => handleStatusChange(row.id, 'approved', row.businessName)}
            >
              Duyệt đối tác
            </Button>
          )}
          {row.status !== 'suspended' && (
            <Button
              variant="danger"
              size="sm"
              disabled={isBusy}
              leadingIcon={<PauseCircle className="h-3.5 w-3.5" />}
              onClick={() => handleStatusChange(row.id, 'suspended', row.businessName)}
            >
              Đình chỉ
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Đối tác (Partner Stores)"
        description="Xét duyệt Pet Spa, Pet Cafe, Phòng khám thú y đăng ký chạy quảng cáo Native Ads và phát hành Voucher."
      />

      <DataTable
        columns={columns}
        rows={paged.items}
        getRowKey={(row) => row.id}
        isLoading={paged.isLoading}
        errorMessage={paged.errorMessage}
        onRetry={paged.reload}
        emptyTitle="Chưa có đối tác nào"
        toolbar={<SearchInput value={paged.searchText} onChange={paged.setSearchText} placeholder="Tìm tên cửa hàng, email, SĐT…" />}
        pagination={{ page: paged.page, limit: paged.limit, total: paged.total, onPageChange: paged.setPage }}
      />
    </div>
  );
}
