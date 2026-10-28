import { useState } from 'react';
import { Eye, ShieldCheck } from 'lucide-react';
import { useMutationRunner } from '../../shared/hooks/useMutationRunner';
import { usePagedResource } from '../../shared/hooks/usePagedResource';
import { daysFromNowIso, formatDate, formatDateTime } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { DataTable, SearchInput, type TableColumn } from '../../shared/ui/DataTable';
import { Badge, PageHeader } from '../../shared/ui/feedback';
import { adminApi } from '../api/adminApi';
import type { VaccineDecision, VaccineQueueItem } from '../api/adminTypes';
import { VaccineReviewModal } from './VaccineReviewModal';

export function VaccineQueuePage() {
  const paged = usePagedResource((query) => adminApi.listVaccineQueue(query));
  const { run, isBusy } = useMutationRunner();
  const [selectedItem, setSelectedItem] = useState<VaccineQueueItem | null>(null);

  const handleDecision = async (petId: string, decision: VaccineDecision) => {
    const result = await run(
      () => adminApi.decideVaccine(petId, decision),
      {
        successMessage:
          decision.decision === 'verified'
            ? 'Đã duyệt Sổ tiêm Safe Pet và tạo lịch nhắc tái chủng!'
            : 'Đã từ chối sổ tiêm và gửi thông báo cho chủ nuôi.',
        failureLogLabel: `decideVaccine ${petId}`,
      },
    );
    if (result !== undefined) {
      setSelectedItem(null);
      paged.reload();
    }
  };

  const columns: Array<TableColumn<VaccineQueueItem>> = [
    {
      key: 'pet',
      header: 'Hồ sơ Boss',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.vaccineProofUrls[0] && (
            <img
              src={row.vaccineProofUrls[0]}
              alt={row.name}
              className="h-11 w-11 rounded-xl border border-slate-200 object-cover"
            />
          )}
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.breed ?? 'Chưa rõ giống'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Chủ nuôi (Sen)',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.owner?.fullName ?? '—'}</p>
          <p className="text-xs text-slate-500">{row.owner?.phone ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'vaccine',
      header: 'Thông tin mũi tiêm',
      render: (row) => (
        <div>
          <Badge tone="success">{row.vaccineDetails ?? '7 bệnh + Phòng dại'}</Badge>
          <p className="mt-1 text-xs text-slate-500">Tiêm gần nhất: {formatDate(row.lastVaccineDate)}</p>
        </div>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Gửi lúc',
      render: (row) => <span className="text-xs text-slate-600">{formatDateTime(row.submittedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Thao tác kiểm duyệt',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => setSelectedItem(row)}
          >
            Xem sổ ({row.vaccineProofUrls.length} ảnh)
          </Button>
          <Button
            variant="mint"
            size="sm"
            isLoading={isBusy}
            leadingIcon={<ShieldCheck className="h-3.5 w-3.5" />}
            onClick={() => handleDecision(row.id, { decision: 'verified', nextDueDate: daysFromNowIso(365) })}
          >
            Duyệt nhanh (+1 năm)
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hàng đợi duyệt Sổ tiêm Safe Pet"
        description="Kiểm tra ảnh chụp sổ tiêm (vắc-xin 7 bệnh & phòng dại) để cấp chứng nhận Safe Pet trên Radar."
      />

      <DataTable
        columns={columns}
        rows={paged.items}
        getRowKey={(row) => row.id}
        isLoading={paged.isLoading}
        errorMessage={paged.errorMessage}
        onRetry={paged.reload}
        emptyTitle="Không còn hồ sơ sổ tiêm chờ duyệt"
        emptyDescription="Tất cả các Boss gửi sổ tiêm đều đã được xử lý."
        toolbar={
          <SearchInput
            value={paged.searchText}
            onChange={paged.setSearchText}
            placeholder="Tìm theo tên Boss, giống, SĐT Sen…"
          />
        }
        pagination={{ page: paged.page, limit: paged.limit, total: paged.total, onPageChange: paged.setPage }}
      />

      <VaccineReviewModal
        item={selectedItem}
        isBusy={isBusy}
        onClose={() => setSelectedItem(null)}
        onDecide={handleDecision}
      />
    </div>
  );
}
