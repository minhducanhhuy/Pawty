const vndFormatter = new Intl.NumberFormat('vi-VN');

export function formatNumber(value: number): string {
  return vndFormatter.format(value);
}

export function formatVnd(amountVnd: number): string {
  return `${vndFormatter.format(amountVnd)}đ`;
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1).replace(/\.0$/, '')}%`;
}

export function formatDateTime(isoDate?: string | null): string {
  if (!isoDate) return '—';
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) return '—';
  return parsedDate.toLocaleString('vi-VN', { hour12: false, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDate(isoDate?: string | null): string {
  if (!isoDate) return '—';
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) return '—';
  return parsedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatShortDay(isoDate: string): string {
  const parsedDate = new Date(isoDate);
  return `${String(parsedDate.getDate()).padStart(2, '0')}/${String(parsedDate.getMonth() + 1).padStart(2, '0')}`;
}

export function toDateInputValue(isoDate?: string | null): string {
  if (!isoDate) return '';
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) return '';
  return parsedDate.toISOString().slice(0, 10);
}

export function daysFromNowIso(dayOffset: number): string {
  return new Date(Date.now() + dayOffset * 86_400_000).toISOString();
}
