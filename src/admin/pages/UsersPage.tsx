import { useState } from 'react';
import { Ban, CheckCircle, Settings2 } from 'lucide-react';
import { useMutationRunner } from '../../shared/hooks/useMutationRunner';
import { usePagedResource } from '../../shared/hooks/usePagedResource';
import { formatDate } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { DataTable, SearchInput, type TableColumn } from '../../shared/ui/DataTable';
import { Badge, PageHeader } from '../../shared/ui/feedback';
import { adminApi } from '../api/adminApi';
import type { AdminUser, AdminUserPatch } from '../api/adminTypes';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { UserEditModal } from './UserEditModal';

export function UsersPage() {
  const { profile } = useAdminAuth();
  const paged = usePagedResource((query) => adminApi.listUsers(query));
  const { run, isBusy } = useMutationRunner();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const handleApplyPatch = async (userId: string, patch: AdminUserPatch, successMessage: string) => {
    const result = await run(() => adminApi.updateUser(userId, patch), {
      successMessage,
      failureLogLabel: `updateUser ${userId}`,
    });
    if (result !== undefined) {
      setEditingUser(null);
      paged.reload();
    }
  };

  const columns: Array<TableColumn<AdminUser>> = [
    {
      key: 'user',
      header: 'Chủ nuôi (Sen)',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.fullName}</p>
          <p className="text-xs text-slate-500">
            {row.phone} {row.condoComplex ? `• ${row.condoComplex}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (row) => (
        <Badge tone={row.role === 'admin' ? 'coral' : row.role === 'moderator' ? 'info' : 'neutral'}>
          {row.role.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'vip',
      header: 'Hạng VIP',
      render: (row) => (
        <div>
          <Badge tone={row.vipTier === 'free' ? 'neutral' : 'warning'}>
            {row.vipTier === 'free' ? 'FREE' : row.vipTier === 'vip_plus' ? '👑 VIP+' : '👑 VIP'}
          </Badge>
          {row.vipExpiresAt && <p className="mt-1 text-xs text-slate-500">Hết hạn: {formatDate(row.vipExpiresAt)}</p>}
        </div>
      ),
    },
    {
      key: 'flake',
      header: 'An toàn & Bùng kèo',
      render: (row) => (
        <div>
          {row.isBannedSwiping ? (
            <Badge tone="danger">Khoá quẹt đến {formatDate(row.banUntil)}</Badge>
          ) : (
            <Badge tone="success">Đang hoạt động</Badge>
          )}
          <p className="mt-1 text-xs text-slate-500">Báo bùng kèo: {row.flakeReportsCount} lần</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={row.isBannedSwiping ? 'mint' : 'danger'}
            size="sm"
            disabled={isBusy}
            leadingIcon={row.isBannedSwiping ? <CheckCircle className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
            onClick={() =>
              handleApplyPatch(
                row.id,
                { isBannedSwiping: !row.isBannedSwiping, banDays: 3 },
                row.isBannedSwiping
                  ? `Đã mở khoá quẹt thẻ cho ${row.fullName}.`
                  : `Đã khoá quẹt thẻ 3 ngày đối với ${row.fullName}.`,
              )
            }
          >
            {row.isBannedSwiping ? 'Mở khoá quẹt' : 'Khoá quẹt 3 ngày'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Settings2 className="h-3.5 w-3.5" />}
            onClick={() => setEditingUser(row)}
          >
            Cấp VIP / Quyền
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Người dùng"
        description="Tra cứu chủ nuôi, chế tài khoá quẹt thẻ chống bùng kèo, cấp gói VIP và phân quyền."
      />

      <DataTable
        columns={columns}
        rows={paged.items}
        getRowKey={(row) => row.id}
        isLoading={paged.isLoading}
        errorMessage={paged.errorMessage}
        onRetry={paged.reload}
        emptyTitle="Không tìm thấy người dùng phù hợp"
        toolbar={<SearchInput value={paged.searchText} onChange={paged.setSearchText} placeholder="Tìm theo tên, SĐT, chung cư…" />}
        pagination={{ page: paged.page, limit: paged.limit, total: paged.total, onPageChange: paged.setPage }}
      />

      <UserEditModal
        user={editingUser}
        canChangeRole={profile?.role === 'admin'}
        isBusy={isBusy}
        onClose={() => setEditingUser(null)}
        onApply={handleApplyPatch}
      />
    </div>
  );
}
