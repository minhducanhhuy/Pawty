import { useState, type FormEvent } from 'react';
import { LogIn, Zap } from 'lucide-react';
import { getFriendlyErrorMessage } from '../../shared/api/apiError';
import { AuthShell } from '../../shared/ui/AuthShell';
import { Button } from '../../shared/ui/Button';
import { TextField } from '../../shared/ui/fields';
import { useToast } from '../../shared/ui/Toast';
import { usePartnerAuth } from '../auth/PartnerAuthContext';
import { PartnerRegisterForm } from './PartnerRegisterForm';

export function PartnerAuthPage() {
  const { login } = usePartnerAuth();
  const toast = useToast();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('partner@pawtyspa.vn');
  const [password, setPassword] = useState('pawty123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(email, password);
      toast.showSuccess('Chào mừng trở lại Cổng đối tác Pawty!');
    } catch (loginError) {
      console.error('[PartnerAuth] lỗi đăng nhập', loginError);
      setErrorMessage(getFriendlyErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      portalName="Pawty Partner Portal"
      tagline="Quảng cáo bản địa Native Ads trên Radar & phát hành Voucher cho cư dân nuôi thú cưng"
      footer={
        <div className="rounded-xl border border-mint-dark/40 bg-mint-light/70 p-3 text-xs text-slate-700">
          <p className="font-bold text-emerald-900">Tài khoản Đối tác Sandbox:</p>
          <p>• Email: <strong>partner@pawtyspa.vn</strong> · Mật khẩu: <strong>pawty123</strong></p>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-cream p-1">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={`rounded-lg py-2 text-xs font-bold transition-colors cursor-pointer ${
            tab === 'login' ? 'bg-coral text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => setTab('register')}
          className={`rounded-lg py-2 text-xs font-bold transition-colors cursor-pointer ${
            tab === 'register' ? 'bg-coral text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          Đăng ký đối tác mới
        </button>
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <TextField
            type="email"
            label="Email đối tác"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            type="password"
            label="Mật khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            errorMessage={errorMessage ?? undefined}
          />
          <Button
            type="button"
            variant="mint"
            size="sm"
            className="w-full"
            leadingIcon={<Zap className="h-4 w-4" />}
            onClick={() => {
              setEmail('partner@pawtyspa.vn');
              setPassword('pawty123');
            }}
          >
            Điền nhanh tài khoản mẫu Pawty Spa ⚡
          </Button>
          <Button type="submit" className="w-full" isLoading={isSubmitting} leadingIcon={<LogIn className="h-4 w-4" />}>
            Đăng nhập Cổng đối tác
          </Button>
        </form>
      ) : (
        <PartnerRegisterForm
          onSuccessSwitchToLogin={(registeredEmail) => {
            setEmail(registeredEmail);
            setTab('login');
          }}
        />
      )}
    </AuthShell>
  );
}
