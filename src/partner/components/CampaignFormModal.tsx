import { useEffect, useState } from 'react';
import { daysFromNowIso, toDateInputValue } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { SelectField, TextAreaField, TextField } from '../../shared/ui/fields';
import { Modal } from '../../shared/ui/Modal';
import type { PartnerAd, PartnerAdInput, PartnerAdStatus } from '../api/partnerTypes';
import { buildAdBannerSvg } from '../mock/partnerFixtures';
import { NativeAdPreviewCard } from './NativeAdPreviewCard';

interface CampaignFormModalProps {
  isOpen: boolean;
  businessName: string;
  editingAd: PartnerAd | null;
  isBusy: boolean;
  onClose: () => void;
  onSubmit: (input: PartnerAdInput) => void;
}

export function CampaignFormModal({ isOpen, businessName, editingAd, isBusy, onClose, onSubmit }: CampaignFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [discountPercent, setDiscountPercent] = useState(35);
  const [voucherQuota, setVoucherQuota] = useState(100);
  const [radiusMeters, setRadiusMeters] = useState(1500);
  const [startsAt, setStartsAt] = useState(() => toDateInputValue(daysFromNowIso(0)));
  const [endsAt, setEndsAt] = useState(() => toDateInputValue(daysFromNowIso(30)));
  const [status, setStatus] = useState<PartnerAdStatus>('active');

  useEffect(() => {
    if (editingAd) {
      setTitle(editingAd.title);
      setDescription(editingAd.description);
      setImageUrl(editingAd.imageUrl);
      setDiscountPercent(editingAd.discountPercent);
      setVoucherQuota(editingAd.voucherQuota);
      setRadiusMeters(editingAd.radiusMeters);
      setStartsAt(toDateInputValue(editingAd.startsAt));
      setEndsAt(toDateInputValue(editingAd.endsAt));
      setStatus(editingAd.status);
    } else {
      setTitle('Combo Tắm Spa Thảo Dược Cho Boss - Giảm 35%');
      setDescription('Tặng kèm cắt mài móng & vệ sinh tai miễn phí cho cư dân chung cư quanh tiệm.');
      setImageUrl('');
      setDiscountPercent(35);
      setVoucherQuota(100);
      setRadiusMeters(1500);
      setStartsAt(toDateInputValue(daysFromNowIso(0)));
      setEndsAt(toDateInputValue(daysFromNowIso(30)));
      setStatus('active');
    }
  }, [editingAd, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || buildAdBannerSvg(businessName, discountPercent),
      discountPercent,
      voucherQuota,
      radiusMeters,
      startsAt: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : daysFromNowIso(30),
      status,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={editingAd ? 'Chỉnh sửa chiến dịch Native Ad' : 'Tạo chiến dịch Native Ad mới'}
      onClose={onClose}
      widthClassName="max-w-4xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isBusy}>Huỷ</Button>
          <Button variant="primary" onClick={handleSave} isLoading={isBusy} disabled={!title.trim()}>
            {editingAd ? 'Lưu cập nhật' : 'Xuất bản chiến dịch'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-3.5 lg:col-span-7">
          <TextField label="Tiêu đề chiến dịch" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextAreaField label="Mô tả ưu đãi" value={description} onChange={(e) => setDescription(e.target.value)} />
          <TextField label="URL ảnh minh hoạ (trống = tự sinh banner)" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <TextField type="number" min={5} max={90} label="Mức giảm Voucher (%)" value={String(discountPercent)} onChange={(e) => setDiscountPercent(Math.min(90, Math.max(5, Number(e.target.value) || 35)))} />
            <TextField type="number" min={10} max={5000} label="Tổng số lượng Voucher (Quota)" value={String(voucherQuota)} onChange={(e) => setVoucherQuota(Math.max(10, Number(e.target.value) || 100))} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">
              Bán kính phủ sóng Radar: {(radiusMeters / 1000).toFixed(2)} km ({radiusMeters}m)
            </label>
            <input type="range" min={500} max={5000} step={250} value={radiusMeters} onChange={(e) => setRadiusMeters(Number(e.target.value))} className="w-full accent-coral cursor-pointer" />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>500m (Nội khu)</span>
              <span>2.5km (Liên khu)</span>
              <span>5.0km (Toàn quận)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextField type="date" label="Ngày bắt đầu" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            <TextField type="date" label="Ngày kết thúc" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            <SelectField
              label="Trạng thái"
              value={status}
              onChange={(e) => setStatus(e.target.value as PartnerAdStatus)}
              options={[
                { value: 'active', label: 'Đang chạy (Active)' },
                { value: 'draft', label: 'Bản nháp (Draft)' },
                { value: 'paused', label: 'Tạm dừng (Paused)' },
              ]}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-cream p-4 lg:col-span-5">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">Xem trước trực tiếp trên Radar (Live Preview)</p>
          <NativeAdPreviewCard businessName={businessName} title={title} description={description} imageUrl={imageUrl} discountPercent={discountPercent} radiusMeters={radiusMeters} />
        </div>
      </div>
    </Modal>
  );
}
