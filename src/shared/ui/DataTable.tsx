import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Button } from './Button';
import { Card, EmptyState, ErrorState, Spinner } from './feedback';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const firstItemNumber = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItemNumber = Math.min(page * limit, total);

  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
      <span>
        {firstItemNumber}–{lastItemNumber} / {total} kết quả
      </span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-16 text-center font-bold">
          {page} / {totalPages}
        </span>
        <Button variant="secondary" size="sm" aria-label="Trang sau" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Tìm kiếm…' }: SearchInputProps) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        aria-label={placeholder}
        value={value}
        onChange={(changeEvent) => onChange(changeEvent.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-coral"
      />
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(changeEvent) => onChange(changeEvent.target.value)}
      className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 focus:border-coral"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface DataTableProps<T> {
  columns: Array<TableColumn<T>>;
  rows: T[];
  getRowKey: (row: T) => string;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  toolbar?: ReactNode;
  pagination?: PaginationProps;
}

export function DataTable<T>({ columns, rows, getRowKey, isLoading, errorMessage, onRetry, emptyTitle, emptyDescription, toolbar, pagination }: DataTableProps<T>) {
  const hasRows = rows.length > 0;
  return (
    <Card className="space-y-4 p-4">
      {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
      {isLoading && !hasRows && <Spinner />}
      {!isLoading && errorMessage && <ErrorState message={errorMessage} onRetry={onRetry} />}
      {!isLoading && !errorMessage && !hasRows && <EmptyState title={emptyTitle} description={emptyDescription} />}
      {hasRows && !errorMessage && (
        <div className={cn('overflow-x-auto transition-opacity', isLoading && 'opacity-50')}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                {columns.map((column) => (
                  <th key={column.key} scope="col" className={cn('px-3 py-2.5 font-bold', column.className)}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={getRowKey(row)} className="border-b border-slate-100 last:border-0 hover:bg-cream">
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-3 py-3 align-middle', column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && pagination.total > 0 && <Pagination {...pagination} />}
    </Card>
  );
}
