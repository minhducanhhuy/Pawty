import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/cn';
import { Button } from './Button';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>{children}</section>;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Spinner({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-12 text-sm font-semibold text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin text-coral" aria-hidden="true" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <Inbox className="h-10 w-10 text-slate-300" aria-hidden="true" />
      <p className="font-bold text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
      <AlertTriangle className="h-10 w-10 text-coral" aria-hidden="true" />
      <p className="max-w-md text-sm font-semibold text-slate-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" leadingIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'coral';

const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-mint-light text-emerald-800 ring-1 ring-mint-dark/40',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-amber-300/60',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  info: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
  coral: 'bg-coral-light text-coral-dark ring-1 ring-coral/30',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap', BADGE_TONE_CLASSES[tone])}>{children}</span>;
}

export type { BadgeTone };
