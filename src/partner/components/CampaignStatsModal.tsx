import { useAsyncResource } from '../../shared/hooks/useAsyncResource';
import { formatNumber, formatPercent, formatVnd } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { ErrorState, Spinner } from '../../shared/ui/feedback';
import { Modal } from '../../shared/ui/Modal';
import { partnerApi } from '../api/partnerApi';
import type { PartnerAd } from '../api/partnerTypes';

interface CampaignStatsModalProps {
  ad: PartnerAd | null;
  onClose: () => void;
}

export function CampaignStatsModal({ ad, onClose }: CampaignStatsModalProps) {
  const { data: stats, isLoading, errorMessage, reload } = useAsyncResource(
    () => (ad ? partnerApi.getAdStats(ad.id) : Promise.resolve(null)),
    [ad?.id],
  );

  if (!ad) return null;

  const ctr = stats && stats.impressions > 0 ? stats.clicks / stats.impressions : 0;
  const redemptionRate = stats && stats.vouchersIssued > 0 ? stats.vouchersRedeemed / stats.vouchersIssued : 0;

  return (
    <Modal
      isOpen={Boolean(ad)}
      title={`Thống kê hiệu quả — ${ad.title}`}
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      {isLoading && <Spinner label="Đang tải thống kê chiến dịch…" />}
      {!isLoading && errorMessage && <ErrorState message={errorMessage} onRetry={reload} />}
      {!isLoading && !errorMessage && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-cream p-3.5">
              <p className="text-xs font-bold text-slate-500">Lượt hiển thị (Impressions)</p>
              <p className="mt-1 font-fredoka text-2xl font-bold text-slate-900">{formatNumber(stats.impressions)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-cream p-3.5">
              <p className="text-xs font-bold text-slate-500">Lượt Click / Lưu (Clicks)</p>
              <p className="mt-1 font-fredoka text-2xl font-bold text-coral">{formatNumber(stats.clicks)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-cream p-3.5">
              <p className="text-xs font-bold text-slate-500">Tỷ lệ nhấp (CTR)</p>
              <p className="mt-1 font-fredoka text-2xl font-bold text-emerald-700">{formatPercent(ctr)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-mint-light/60 p-3.5">
              <p className="text-xs font-bold text-slate-600">Voucher đã phát hành</p>
              <p className="mt-1 font-fredoka text-xl font-bold text-slate-900">
                {formatNumber(stats.vouchersIssued)} / {formatNumber(ad.voucherQuota)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-mint-light/60 p-3.5">
              <p className="text-xs font-bold text-slate-600">Voucher đã Redeem tại quầy</p>
              <p className="mt-1 font-fredoka text-xl font-bold text-emerald-800">
                {formatNumber(stats.vouchersRedeemed)} ({formatPercent(redemptionRate)})
              </p>
            </div>
            <div className="rounded-xl border border-coral/30 bg-coral-light/60 p-3.5">
              <p className="text-xs font-bold text-coral-dark">Chi phí quảng cáo (Spend)</p>
              <p className="mt-1 font-fredoka text-xl font-bold text-coral-dark">{formatVnd(stats.spendVnd)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            • Cơ chế tính phí: Gói CPC trừ 3.000đ cho mỗi lượt người dùng bấm vào thẻ hoặc lưu Voucher trên Radar (Frequency Cap: tối đa 1 lần/giờ/user).
          </p>
        </div>
      )}
    </Modal>
  );
}
