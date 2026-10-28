import { useState } from 'react';
import { CheckCircle2, QrCode, Wallet } from 'lucide-react';
import { useMutationRunner } from '../../shared/hooks/useMutationRunner';
import { formatVnd } from '../../shared/lib/format';
import { Button } from '../../shared/ui/Button';
import { Badge, Card, PageHeader } from '../../shared/ui/feedback';
import { TextField } from '../../shared/ui/fields';
import { partnerApi } from '../api/partnerApi';
import type { TopupResponse } from '../api/partnerTypes';
import { usePartnerAuth } from '../auth/PartnerAuthContext';

const PRESET_AMOUNTS = [100_000, 300_000, 500_000, 1_000_000, 1_500_000];

export function PartnerTopupPage() {
  const { partner, refreshPartner } = usePartnerAuth();
  const { run, isBusy } = useMutationRunner();
  const [amountVnd, setAmountVnd] = useState(300_000);
  const [topupTicket, setTopupTicket] = useState<TopupResponse | null>(null);

  const handleCreateQr = async () => {
    const ticket = await run(() => partnerApi.createTopup(amountVnd), {
      successMessage: ticketStatusMessage(amountVnd),
      failureLogLabel: 'createTopup',
    });
    if (ticket) {
      setTopupTicket(ticket);
      if (ticket.status === 'paid') {
        await refreshPartner();
      }
    }
  };

  const handleConfirmSandbox = async () => {
    if (!topupTicket) return;
    const updatedProfile = await run(
      () => partnerApi.confirmSandboxTopup(topupTicket.transactionId, topupTicket.amount),
      {
        successMessage: `Đã xác nhận nạp ${formatVnd(topupTicket.amount)} vào ví Quảng cáo!`,
        failureLogLabel: 'confirmSandboxTopup',
      },
    );
    if (updatedProfile) {
      setTopupTicket({ ...topupTicket, status: 'paid' });
      await refreshPartner();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nạp ngân sách Quảng cáo (VietQR)"
        description="Nạp số dư ví CPC (3.000đ/click) hoặc gia hạn gói tháng tự động qua mã VietQR động."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between rounded-xl bg-mint-light p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-6 w-6 text-emerald-800" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Số dư khả dụng hiện tại</p>
                <p className="font-fredoka text-2xl font-bold text-slate-900">{formatVnd(partner?.balanceVnd ?? 0)}</p>
              </div>
            </div>
            <Badge tone="success">Tự động kích hoạt Ads</Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700">Chọn mệnh giá nạp nhanh</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  variant={amountVnd === preset ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setAmountVnd(preset)}
                >
                  {formatVnd(preset)}
                </Button>
              ))}
            </div>
          </div>

          <TextField
            type="number"
            min={50000}
            step={50000}
            label="Hoặc nhập số tiền tuỳ chọn (VND)"
            value={String(amountVnd)}
            onChange={(event) => setAmountVnd(Math.max(50_000, Number(event.target.value) || 50_000))}
            hint={`Tương đương ~${Math.floor(amountVnd / 3000).toLocaleString('vi-VN')} lượt Click / Lưu Voucher trên Radar.`}
          />

          <Button
            variant="primary"
            className="w-full"
            isLoading={isBusy}
            leadingIcon={<QrCode className="h-4 w-4" />}
            onClick={handleCreateQr}
          >
            Tạo mã VietQR nạp {formatVnd(amountVnd)}
          </Button>
        </Card>

        <Card className="flex flex-col items-center justify-center space-y-4 text-center lg:col-span-5">
          {!topupTicket ? (
            <div className="py-10 text-slate-500">
              <QrCode className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 font-bold text-slate-700">Chưa có mã QR giao dịch</p>
              <p className="text-xs">Chọn mệnh giá bên trái và bấm "Tạo mã VietQR" để hiển thị mã thanh toán.</p>
            </div>
          ) : (
            <>
              <Badge tone={topupTicket.status === 'paid' ? 'success' : 'warning'}>
                {topupTicket.status === 'paid' ? '✓ ĐÃ NHẬN THANH TOÁN' : '⏳ ĐANG CHỜ CHUYỂN KHOẢN'}
              </Badge>
              <img
                src={topupTicket.qrCodeUrl}
                alt="VietQR Topup"
                className="h-56 w-56 rounded-2xl border border-slate-200 p-2 shadow-sm"
              />
              <div className="w-full rounded-xl bg-cream p-3 text-xs text-slate-700 space-y-1">
                <p><strong>Ngân hàng:</strong> {topupTicket.bankName} — STK: <strong>{topupTicket.accountNo}</strong></p>
                <p><strong>Số tiền:</strong> {formatVnd(topupTicket.amount)}</p>
                <p><strong>Nội dung CK:</strong> <span className="font-mono font-bold text-coral-dark">{topupTicket.paymentCode}</span></p>
              </div>
              {topupTicket.status !== 'paid' && (
                <Button
                  variant="mint"
                  className="w-full"
                  isLoading={isBusy}
                  leadingIcon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={handleConfirmSandbox}
                >
                  Xác nhận đã chuyển khoản (Sandbox) ⚡
                </Button>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function ticketStatusMessage(amount: number): string {
  return `Đã khởi tạo mã VietQR nạp ${formatVnd(amount)}.`;
}
