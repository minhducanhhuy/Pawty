import { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { daysFromNowIso, formatDate, toDateInputValue } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { TextAreaField, TextField } from '../../shared/ui/fields';
import { Modal } from '../../shared/ui/Modal';
import type { VaccineDecision, VaccineQueueItem } from '../api/adminTypes';

interface VaccineReviewModalProps {
  item: VaccineQueueItem | null;
  isBusy: boolean;
  onClose: () => void;
  onDecide: (petId: string, decision: VaccineDecision) => void;
}

export function VaccineReviewModal({ item, isBusy, onClose, onDecide }: VaccineReviewModalProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [nextDueDate, setNextDueDate] = useState(() => toDateInputValue(daysFromNowIso(365)));
  const [rejectReason, setRejectReason] = useState('');
  const [mode, setMode] = useState<'approve' | 'reject'>('approve');

  if (!item) return null;

  const images = item.vaccineProofUrls.length > 0 ? item.vaccineProofUrls : item.avatarUrl ? [item.avatarUrl] : [];
  const activeImage = images[imageIndex] ?? images[0];

  const handleSubmit = () => {
    if (mode === 'approve') {
      const isoNextDue = nextDueDate ? new Date(nextDueDate).toISOString() : daysFromNowIso(365);
      onDecide(item.id, { decision: 'verified', nextDueDate: isoNextDue });
    } else if (rejectReason.trim()) {
      onDecide(item.id, { decision: 'rejected', reason: rejectReason.trim() });
    }
  };

  return (
    <Modal
      isOpen={Boolean(item)}
      title={`Kiểm duyệt sổ tiêm — Boss ${item.name}`}
      onClose={onClose}
      widthClassName="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isBusy}>
            Đóng
          </Button>
          {mode === 'approve' ? (
            <Button variant="mint" isLoading={isBusy} leadingIcon={<CheckCircle2 className="h-4 w-4" />} onClick={handleSubmit}>
              Xác nhận Duyệt Safe Pet ✓
            </Button>
          ) : (
            <Button variant="danger" isLoading={isBusy} disabled={!rejectReason.trim()} leadingIcon={<XCircle className="h-4 w-4" />} onClick={handleSubmit}>
              Từ chối hồ sơ ✗
            </Button>
          )}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
          {activeImage ? (
            <img src={activeImage} alt={`Sổ tiêm ${item.name} trang ${imageIndex + 1}`} className="mx-auto max-h-96 object-contain" />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">Không có ảnh sổ tiêm</div>
          )}
          {images.length > 1 && (
            <div className="flex items-center justify-between bg-slate-900/80 px-3 py-2 text-xs font-bold text-white">
              <button type="button" disabled={imageIndex <= 0} onClick={() => setImageIndex((i) => Math.max(0, i - 1))} className="inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer">
                <ChevronLeft className="h-4 w-4" /> Trước
              </button>
              <span>Trang {imageIndex + 1} / {images.length}</span>
              <button type="button" disabled={imageIndex >= images.length - 1} onClick={() => setImageIndex((i) => Math.min(images.length - 1, i + 1))} className="inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer">
                Sau <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-mint-light/70 p-3.5 text-sm space-y-1">
            <p><strong>Boss:</strong> {item.name} ({item.breed ?? 'Chưa rõ giống'})</p>
            <p><strong>Chủ nuôi:</strong> {item.owner?.fullName ?? '—'} ({item.owner?.phone ?? '—'})</p>
            <p><strong>Mũi kê khai:</strong> {item.vaccineDetails ?? 'Vắc-xin 7 bệnh + phòng dại'}</p>
            <p><strong>Ngày tiêm gần nhất:</strong> {formatDate(item.lastVaccineDate)}</p>
          </div>

          <div className="flex gap-2">
            <Button variant={mode === 'approve' ? 'mint' : 'secondary'} size="sm" className="flex-1" onClick={() => setMode('approve')}>
              Chế độ Duyệt ✓
            </Button>
            <Button variant={mode === 'reject' ? 'danger' : 'secondary'} size="sm" className="flex-1" onClick={() => setMode('reject')}>
              Chế độ Từ chối ✗
            </Button>
          </div>

          {mode === 'approve' ? (
            <TextField
              type="date"
              label="Ngày hẹn tái chủng kế tiếp"
              value={nextDueDate}
              onChange={(event) => setNextDueDate(event.target.value)}
              hint="Hệ thống tự tạo lịch nhắc tái chủng ở mốc 30 / 7 / 1 / 0 ngày trước hạn."
            />
          ) : (
            <TextAreaField
              label="Lý do từ chối sổ tiêm"
              placeholder="Ví dụ: Ảnh mờ không rõ mộc đỏ phòng khám hoặc thiếu mũi dại..."
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
