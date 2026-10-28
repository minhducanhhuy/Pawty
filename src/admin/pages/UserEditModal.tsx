import { useState } from 'react';
import { Crown, Shield } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { SelectField, TextField } from '../../shared/ui/fields';
import { Modal } from '../../shared/ui/Modal';
import type { AdminUser, AdminUserPatch, UserRole, VipTier } from '../api/adminTypes';

interface UserEditModalProps {
  user: AdminUser | null;
  canChangeRole: boolean;
  isBusy: boolean;
  onClose: () => void;
  onApply: (userId: string, patch: AdminUserPatch, successMessage: string) => void;
}

export function UserEditModal({ user, canChangeRole, isBusy, onClose, onApply }: UserEditModalProps) {
  const [vipTier, setVipTier] = useState<Exclude<VipTier, 'free'>>('vip');
  const [vipDays, setVipDays] = useState(30);
  const [role, setRole] = useState<UserRole>(user?.role ?? 'user');

  if (!user) return null;

  return (
    <Modal
      isOpen={Boolean(user)}
      title={`Quản lý tài khoản — ${user.fullName}`}
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose} disabled={isBusy}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-cream p-3.5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Crown className="h-4 w-4 text-amber-500" /> Cấp gói thành viên VIP / VIP+
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Hạng gói"
              value={vipTier}
              onChange={(event) => setVipTier(event.target.value as Exclude<VipTier, 'free'>)}
              options={[
                { value: 'vip', label: 'Sen VIP (49k/tháng)' },
                { value: 'vip_plus', label: 'Sen VIP+ (99k/tháng)' },
              ]}
            />
            <TextField
              type="number"
              min={1}
              max={365}
              label="Số ngày hiệu lực"
              value={String(vipDays)}
              onChange={(event) => setVipDays(Math.max(1, Number(event.target.value) || 7))}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            isLoading={isBusy}
            onClick={() =>
              onApply(
                user.id,
                { grantVip: { tier: vipTier, days: vipDays } },
                `Đã cấp gói ${vipTier.toUpperCase()} (${vipDays} ngày) cho ${user.fullName}.`,
              )
            }
          >
            Xác nhận cấp VIP
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Shield className="h-4 w-4 text-coral" /> Phân quyền hệ thống (RBAC)
          </div>
          <SelectField
            label="Vai trò (chỉ Admin mới được đổi)"
            disabled={!canChangeRole}
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            options={[
              { value: 'user', label: 'User (Chủ nuôi)' },
              { value: 'moderator', label: 'Moderator (Kiểm duyệt viên)' },
              { value: 'admin', label: 'Admin (Quản trị toàn quyền)' },
            ]}
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={!canChangeRole || isBusy}
            onClick={() => onApply(user.id, { role }, `Đã cập nhật vai trò ${role} cho ${user.fullName}.`)}
          >
            Cập nhật vai trò
          </Button>
        </div>
      </div>
    </Modal>
  );
}
