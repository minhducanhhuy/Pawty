import type { ReactNode } from 'react';
import { Card } from './feedback';

interface AuthShellProps {
  portalName: string;
  tagline: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ portalName, tagline, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream via-cream to-mint-light p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <img src="/assets/pawty-logo-full.png" alt="Pawty" className="mx-auto h-14 w-auto" />
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{portalName}</h1>
          <p className="text-sm text-slate-600">{tagline}</p>
        </div>
        <Card className="space-y-4 p-6">{children}</Card>
        {footer}
      </div>
    </main>
  );
}

export function MockModeBanner() {
  return (
    <div role="note" className="bg-amber-100 px-4 py-1.5 text-center text-xs font-bold text-amber-900">
      Chế độ MOCK: dữ liệu mẫu, không gọi máy chủ thật.
    </div>
  );
}
