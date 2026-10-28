import { useState, type FormEvent } from 'react';
import { KeyRound, Phone, ShieldCheck, Zap } from 'lucide-react';
import { getFriendlyErrorMessage } from '../../shared/api/apiError';
import { AuthShell } from '../../shared/ui/AuthShell';
import { Button } from '../../shared/ui/Button';
import { TextField } from '../../shared/ui/fields';
import { useToast } from '../../shared/ui/Toast';
import { useAdminAuth } from '../auth/AdminAuthContext';

export function AdminLoginPage() {
  const { requestOtp, verifyOtpAndLogin } = useAdminAuth();
  const toast = useToast();
  const [phone, setPhone] = useState('0900000000');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendOtp = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    if (!phone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại quản trị.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await requestOtp(phone);
      setIsOtpStep(true);
      toast.showInfo('Đã gửi mã OTP (sandbox: 888888).');
    } catch (sendError) {
      console.error('[AdminLogin] gửi OTP thất bại', sendError);
      setErrorMessage(getFriendlyErrorMessage(sendError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    if (!otpCode.trim()) {
      setErrorMessage('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await verifyOtpAndLogin(phone, otpCode);
      toast.showSuccess('Đăng nhập Cổng quản trị thành công!');
    } catch (verifyError) {
      console.error('[AdminLogin] xác thực OTP thất bại', verifyError);
      setErrorMessage(getFriendlyErrorMessage(verifyError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      portalName="Pawty Admin Portal"
      tagline="Cổng điều hành, kiểm duyệt Sổ tiêm Safe Pet & an toàn cộng đồng"
      footer={
        <div className="rounded-xl border border-mint-dark/40 bg-mint-light/70 p-3 text-xs text-slate-700">
          <p className="font-bold text-emerald-900">Tài khoản Sandbox:</p>
          <p>• Admin: <strong>0900000000</strong> · Moderator: <strong>0900000001</strong> · OTP: <strong>888888</strong></p>
        </div>
      }
    >
      {!isOtpStep ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <TextField
            label="Số điện thoại quản trị"
            placeholder="0900000000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            errorMessage={errorMessage ?? undefined}
            hint="Chỉ tài khoản có vai trò Admin hoặc Moderator mới được phép truy cập."
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setPhone('0900000000')}>
              Chọn Admin (0900000000)
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setPhone('0900000001')}>
              Chọn Mod (0900000001)
            </Button>
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting} leadingIcon={<Phone className="h-4 w-4" />}>
            Gửi mã xác thực OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <TextField
            label={`Mã OTP gửi tới ${phone}`}
            placeholder="888888"
            maxLength={6}
            value={otpCode}
            onChange={(event) => setOtpCode(event.target.value)}
            errorMessage={errorMessage ?? undefined}
          />
          <Button
            type="button"
            variant="mint"
            size="sm"
            className="w-full"
            leadingIcon={<Zap className="h-4 w-4" />}
            onClick={() => setOtpCode('888888')}
          >
            Nhập nhanh mã test 888888 ⚡
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsOtpStep(false)} disabled={isSubmitting}>
              Đổi SĐT
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting} leadingIcon={<ShieldCheck className="h-4 w-4" />}>
              Xác nhận & Vào cổng
            </Button>
          </div>
        </form>
      )}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <KeyRound className="h-3.5 w-3.5 text-coral" />
        <span>Bảo vệ bởi RBAC Role Guard (admin / moderator)</span>
      </div>
    </AuthShell>
  );
}
