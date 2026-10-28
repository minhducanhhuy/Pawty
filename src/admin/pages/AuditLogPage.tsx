import { usePagedResource } from '../../shared/hooks/usePagedResource';
import { formatDateTime } from '../../shared/lib/format';
import { DataTable, SearchInput, type TableColumn } from '../../shared/ui/DataTable';
import { Badge, PageHeader } from '../../shared/ui/feedback';
import { adminApi } from '../api/adminApi';
import type { AuditLogEntry } from '../api/adminTypes';

export function AuditLogPage() {
  const paged = usePagedResource((query) => adminApi.listAuditLogs(query));

  const columns: Array<TableColumn<AuditLogEntry>> = [
    {
      key: 'actor',
      header: 'Người thực hiện',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.actorName ?? row.actorId}</p>
          <p className="font-mono text-xs text-slate-400">{row.actorId}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Hành động',
      render: (row) => <Badge tone="coral">{row.action}</Badge>,
    },
    {
      key: 'target',
      header: 'Đối tượng tác động',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">
          {row.targetType ?? 'system'} : {row.targetId ?? '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Thời điểm ghi nhận',
      render: (row) => <span className="text-xs text-slate-600">{formatDateTime(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký Kiểm toán (Audit Log)"
        description="Lưu vết bất biến mọi thao tác duyệt sổ tiêm, xử lý báo cáo, khoá tài khoản và duyệt chiến dịch quảng cáo."
      />

      <DataTable
        columns={columns}
        rows={paged.items}
        getRowKey={(row) => row.id}
        isLoading={paged.isLoading}
        errorMessage={paged.errorMessage}
        onRetry={paged.reload}
        emptyTitle="Chưa có bản ghi kiểm toán nào"
        toolbar={<SearchInput value={paged.searchText} onChange={paged.setSearchText} placeholder="Tìm theo người thực hiện, mã hành động…" />}
        pagination={{ page: paged.page, limit: paged.limit, total: paged.total, onPageChange: paged.setPage }}
      />
    </div>
  );
}
