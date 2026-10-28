import { useState, type FormEvent } from 'react';
import { CheckCircle2, Sparkles, TicketCheck } from 'lucide-react';
import { useMutationRunner } from '../../shared/hooks/useMutationRunner';
import { formatDateTime } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { Badge, Card, PageHeader } from '../../shared/ui/feedback';
import { TextField } from '../../shared/ui/fields';
import { partnerApi } from '../api/partnerApi';
import type { RedeemVoucherResponse } from '../api/partnerTypes';

const SAMPLE_CODES = ['PAW-SPA35A', 'PAW-CAFE30', 'PAW-VIP35X'];

export function PartnerRedeemPage() {
  const { run, isBusy } = useMutationRunner();
  const [code, setCode] = useState('PAW-SPA35A');
  const [history, setHistory] = useState<RedeemVoucherResponse[]>([]);

  const handleRedeem = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    if (!code.trim()) return;
    const result = await run(() => partnerApi.redeemVoucher(code.trim().toUpperCase()), {
      successMessage: `Đã áp dụng thành công mã ${code.trim().toUpperCase()}!`,
      failureLogLabel: `redeemVoucher ${code}`,
    });
    if (result) {
      setHistory((prev) => [result, ...prev]);
      setCode('');
    }
  };

  const latestRedeem = history[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đối soát & Thu hồi Voucher (Redeem)"
        description="Nhập mã PAW-XXXXXX do chủ nuôi xuất trình tại quầy thu ngân để áp dụng mức chiết khấu."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="space-y-4 lg:col-span-6">
          <form onSubmit={handleRedeem} className="space-y-4">
            <TextField
              label="Mã Voucher khách hàng (PAW-XXXXXX)"
              placeholder="VD: PAW-SPA35A"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              hint="Mỗi mã chỉ được sử dụng 1 lần duy nhất trong thời hạn 14 ngày kể từ khi lưu trên Radar."
            />

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Mã mẫu test nhanh:</span>
              {SAMPLE_CODES.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setCode(sample)}
                  className="rounded-lg border border-coral/30 bg-coral-light/60 px-2.5 py-1 font-mono text-xs font-bold text-coral-dark hover:bg-coral-light cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isBusy}
              disabled={!code.trim()}
              leadingIcon={<TicketCheck className="h-4 w-4" />}
            >
              Kiểm tra & Xác nhận sử dụng Voucher
            </Button>
          </form>
        </Card>

        <Card className="space-y-4 lg:col-span-6">
          {latestRedeem ? (
            <div className="rounded-2xl border-2 border-mint-dark bg-mint-light/70 p-5 text-center space-y-2">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-700" />
              <Badge tone="success">VOUCHER HỢP LỆ — ĐÃ KÍCH HOẠT</Badge>
              <p className="font-mono text-lg font-extrabold text-slate-900">{latestRedeem.code}</p>
              <p className="font-fredoka text-3xl font-bold text-coral">
                Giảm ngay -{latestRedeem.discountPercent}% trên hoá đơn 🎁
              </p>
              {latestRedeem.campaignTitle && (
                <p className="text-xs font-semibold text-slate-700">Chiến dịch: {latestRedeem.campaignTitle}</p>
              )}
              <p className="text-xs text-slate-500">Thời điểm xác nhận: {formatDateTime(latestRedeem.redeemedAt)}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
              <Sparkles className="h-10 w-10 text-coral/50" />
              <p className="mt-2 font-bold text-slate-700">Sẵn sàng kiểm tra mã ưu đãi</p>
              <p className="max-w-xs text-xs">
                Kết quả mức giảm giá (%) và tên chương trình khuyến mãi sẽ hiển thị ngay lập tức tại đây.
              </p>
            </div>
          )}

          {history.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Lịch sử Redeem trong phiên</p>
              {history.map((item) => (
                <div key={item.code + item.redeemedAt} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-xs">
                  <span className="font-mono font-bold text-slate-900">{item.code}</span>
                  <Badge tone="coral">-{item.discountPercent}%</Badge>
                  <span className="text-slate-500">{formatDateTime(item.redeemedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
