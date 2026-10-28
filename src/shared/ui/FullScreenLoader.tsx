import { Loader2 } from 'lucide-react';

export function FullScreenLoader({ label = 'Đang khởi động…' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-screen items-center justify-center gap-2 text-sm font-semibold text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin text-coral" aria-hidden="true" />
      {label}
    </div>
  );
}
