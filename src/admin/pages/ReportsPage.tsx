import { useState } from 'react';
import { Ban, EyeOff, ShieldAlert, X } from 'lucide-react';
import { useMutationRunner } from '../../shared/hooks/useMutationRunner';
import { usePagedResource } from '../../shared/hooks/usePagedResource';
import { formatDateTime } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { DataTable, FilterSelect, SearchInput, type TableColumn } from '../../shared/ui/DataTable';
import { Badge, PageHeader } from '../../shared/ui/feedback';
import { adminApi } from '../api/adminApi';
import type { AdminReport, ReportResolution } from '../api/adminTypes';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'open', label: 'Đang mở (Open)' },
  { value: 'resolved', label: 'Đã xử lý (Resolved)' },
  { value: 'dismissed', label: 'Đã bỏ qua (Dismissed)' },
];

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam / Quảng cáo rác',
  harassment: 'Quấy rối / Xúc phạm',
  abuse_animal: 'Ngược đãi thú cưng',
  nsfw: 'Hình ảnh phản cảm (NSFW)',
  fake: 'Giả mạo hồ sơ',
  other: 'Lý do khác',
};

const ACTION_LABELS: Record<string, string> = {
  warn: 'Cảnh cáo',
  hide_content: 'Ẩn nội dung',
  ban_user: 'Khoá tài khoản',
};

export function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState('open');
  const paged = usePagedResource((query) => adminApi.listReports(query, statusFilter || undefined), [statusFilter]);
  const { run, isBusy } = useMutationRunner();

  const handleResolve = async (reportId: string, resolution: ReportResolution, successLabel: string) => {
    const result = await run(() => adminApi.resolveReport(reportId, resolution), {
      successMessage: successLabel,
      failureLogLabel: `resolveReport ${reportId}`,
    });
    if (result !== undefined) paged.reload();
  };

  const columns: Array<TableColumn<AdminReport>> = [
    {
      key: 'target',
      header: 'Đối tượng bị báo cáo',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <Badge tone="coral">{row.targetType.toUpperCase()}</Badge>
            <span className="font-bold text-slate-900">{row.targetLabel ?? row.targetId}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Người báo cáo: {row.reporterName ?? 'Ẩn danh'}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Lý do & Chi tiết',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-semibold text-slate-800">{REASON_LABELS[row.reason] ?? row.reason}</p>
          {row.detail && <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{row.detail}</p>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <div className="space-y-1">
          <Badge tone={row.status === 'open' ? 'warning' : row.status === 'resolved' ? 'success' : 'neutral'}>
            {row.status === 'open' ? 'Chờ xử lý' : row.status === 'resolved' ? 'Đã xử lý' : 'Bỏ qua'}
          </Badge>
          {row.action && <p className="text-xs font-semibold text-slate-600">{ACTION_LABELS[row.action] ?? row.action}</p>}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      render: (row) => <span className="text-xs text-slate-600">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Biện pháp xử lý',
      render: (row) =>
        row.status !== 'open' ? (
          <span className="text-xs text-slate-400">Đã đóng</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <Button variant="secondary" size="sm" disabled={isBusy} leadingIcon={<ShieldAlert className="h-3.5 w-3.5" />} onClick={() => handleResolve(row.id, { status: 'resolved', action: 'warn' }, 'Đã gửi cảnh cáo vi phạm.')}>
              Cảnh cáo
            </Button>
            <Button variant="secondary" size="sm" disabled={isBusy} leadingIcon={<EyeOff className="h-3.5 w-3.5" />} onClick={() => handleResolve(row.id, { status: 'resolved', action: 'hide_content' }, 'Đã ẩn nội dung vi phạm.')}>
              Ẩn nội dung
            </Button>
            <Button variant="danger" size="sm" disabled={isBusy} leadingIcon={<Ban className="h-3.5 w-3.5" />} onClick={() => handleResolve(row.id, { status: 'resolved', action: 'ban_user' }, 'Đã khoá tài khoản vi phạm.')}>
              Khoá TK
            </Button>
            <Button variant="ghost" size="sm" disabled={isBusy} leadingIcon={<X className="h-3.5 w-3.5" />} onClick={() => handleResolve(row.id, { status: 'dismissed' }, 'Đã bỏ qua báo cáo.')}>
              Bỏ qua
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Báo cáo vi phạm cộng đồng" description="Kiểm duyệt nội dung, cảnh cáo hoặc khoá các tài khoản vi phạm tiêu chuẩn an toàn Pawty." />
      <DataTable
        columns={columns}
        rows={paged.items}
        getRowKey={(row) => row.id}
        isLoading={paged.isLoading}
        errorMessage={paged.errorMessage}
        onRetry={paged.reload}
        emptyTitle="Không có báo cáo vi phạm nào khớp bộ lọc"
        toolbar={
          <>
            <SearchInput value={paged.searchText} onChange={paged.setSearchText} placeholder="Tìm theo đối tượng, lý do…" />
            <FilterSelect label="Lọc trạng thái báo cáo" value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
          </>
        }
        pagination={{ page: paged.page, limit: paged.limit, total: paged.total, onPageChange: paged.setPage }}
      />
    </div>
  );
}
