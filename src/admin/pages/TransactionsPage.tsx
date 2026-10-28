import { useState } from 'react';
import { Download } from 'lucide-react';
import { usePagedResource } from '../../shared/hooks/usePagedResource';
import { buildCsv, downloadCsv } from '../../shared/lib/csv';
import { formatDateTime, formatVnd } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { DataTable, FilterSelect, SearchInput, type TableColumn } from '../../shared/ui/DataTable';
import { Badge, PageHeader } from '../../shared/ui/feedback';
import { adminApi } from '../api/adminApi';
import type { AdminTransaction } from '../api/adminTypes';

const TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại dịch vụ' },
  { value: 'sos', label: 'SOS Tìm Boss Lạc (39k)' },
  { value: 'vip_month', label: 'Gói Sen VIP Tháng (49k)' },
  { value: 'vip_year', label: 'Gói Sen VIP Năm (399k)' },
  { value: 'vip_plus_month', label: 'Gói Sen VIP+ Tháng (99k)' },
  { value: 'boost', label: 'Boost Radar (29k)' },
  { value: 'super_like_pack', label: 'Gói Super Paw (49k)' },
  { value: 'partner_topup', label: 'Đối tác nạp tiền Ads' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'paid', label: 'Đã thanh toán (Paid)' },
  { value: 'pending', label: 'Đang chờ (Pending)' },
  { value: 'expired', label: 'Hết hạn (Expired)' },
  { value: 'failed', label: 'Thất bại (Failed)' },
];

export function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const paged = usePagedResource(
    (query) => adminApi.listTransactions(query, { type: typeFilter || undefined, status: statusFilter || undefined }),
    [typeFilter, statusFilter],
  );

  const handleExportCsv = () => {
    const headers = ['Mã GD', 'Khách hàng / Đối tác', 'Loại dịch vụ', 'Số tiền (VND)', 'Trạng thái', 'Nội dung CK', 'Thời gian'];
    const rows = paged.items.map((item) => [
      item.id,
      item.userName ?? '',
      item.type,
      item.amountVnd,
      item.status,
      item.paymentCode ?? '',
      item.createdAt,
    ]);
    downloadCsv(`pawty-transactions-page-${paged.page}.csv`, buildCsv(headers, rows));
  };

  const columns: Array<TableColumn<AdminTransaction>> = [
    {
      key: 'id',
      header: 'Mã giao dịch',
      render: (row) => (
        <div>
          <p className="font-mono text-xs font-bold text-slate-900">{row.id}</p>
          <p className="text-xs text-slate-500">{row.paymentCode ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Khách hàng',
      render: (row) => <span className="font-semibold text-slate-800">{row.userName ?? '—'}</span>,
    },
    {
      key: 'type',
      header: 'Loại dịch vụ',
      render: (row) => <Badge tone="info">{row.type.toUpperCase()}</Badge>,
    },
    {
      key: 'amount',
      header: 'Số tiền',
      render: (row) => <span className="font-fredoka font-bold text-slate-900">{formatVnd(row.amountVnd)}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <Badge
          tone={
            row.status === 'paid'
              ? 'success'
              : row.status === 'pending'
                ? 'warning'
                : row.status === 'failed'
                  ? 'danger'
                  : 'neutral'
          }
        >
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      render: (row) => <span className="text-xs text-slate-600">{formatDateTime(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Giao dịch & Doanh thu VietQR"
        description="Đối soát giao dịch SOS, gói VIP/VIP+, mua lẻ IAP và nạp tiền quảng cáo của đối tác."
        actions={
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Download className="h-4 w-4" />}
            onClick={handleExportCsv}
            disabled={paged.items.length === 0}
          >
            Xuất CSV
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
        emptyTitle="Chưa có giao dịch nào khớp bộ lọc"
        toolbar={
          <>
            <SearchInput value={paged.searchText} onChange={paged.setSearchText} placeholder="Tìm mã GD, tên khách hàng…" />
            <FilterSelect label="Loại dịch vụ" value={typeFilter} options={TYPE_OPTIONS} onChange={setTypeFilter} />
            <FilterSelect label="Trạng thái" value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
          </>
        }
        pagination={{ page: paged.page, limit: paged.limit, total: paged.total, onPageChange: paged.setPage }}
      />
    </div>
  );
}
