import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../lib/cn';

type ToastKind = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastApi {
  showSuccess: (text: string) => void;
  showError: (text: string) => void;
  showInfo: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const TOAST_LIFETIME_MS = 4000;

const TOAST_STYLES: Record<ToastKind, { className: string; icon: ReactNode }> = {
  success: { className: 'border-mint-dark bg-mint-light text-emerald-900', icon: <CheckCircle2 className="h-5 w-5" /> },
  error: { className: 'border-red-300 bg-red-50 text-red-800', icon: <XCircle className="h-5 w-5" /> },
  info: { className: 'border-sky-300 bg-sky-50 text-sky-900', icon: <Info className="h-5 w-5" /> },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((kind: ToastKind, text: string) => {
    const toastId = Date.now() + Math.random();
    setToastMessages((current) => [...current, { id: toastId, kind, text }]);
    window.setTimeout(() => setToastMessages((current) => current.filter((toast) => toast.id !== toastId)), TOAST_LIFETIME_MS);
  }, []);

  const toastApi = useMemo<ToastApi>(
    () => ({
      showSuccess: (text) => pushToast('success', text),
      showError: (text) => pushToast('error', text),
      showInfo: (text) => pushToast('info', text),
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toastMessages.map((toast) => (
          <div key={toast.id} role="status" className={cn('animate-toast-in pointer-events-auto flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg', TOAST_STYLES[toast.kind].className)}>
            {TOAST_STYLES[toast.kind].icon}
            <span>{toast.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const toastApi = useContext(ToastContext);
  if (!toastApi) throw new Error('useToast phải được dùng bên trong <ToastProvider>');
  return toastApi;
}
