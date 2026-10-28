export interface PagedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface PageQuery {
  page: number;
  limit: number;
  q?: string;
}

export const DEFAULT_PAGE_SIZE = 10;

/** Chấp nhận cả `Paged` lẫn mảng thuần (vd: /admin/sos) để UI không phụ thuộc biến thể response. */
export function normalizePagedResult<T>(raw: unknown, query: PageQuery): PagedResult<T> {
  if (Array.isArray(raw)) {
    const startIndex = (query.page - 1) * query.limit;
    return { items: raw.slice(startIndex, startIndex + query.limit) as T[], page: query.page, limit: query.limit, total: raw.length };
  }
  const paged = (raw ?? {}) as Partial<PagedResult<T>>;
  const items = paged.items ?? [];
  return { items, page: paged.page ?? query.page, limit: paged.limit ?? query.limit, total: paged.total ?? items.length };
}

/** Phân trang phía client cho mock/fixture. */
export function paginateLocally<T>(source: T[], query: PageQuery): PagedResult<T> {
  const startIndex = (query.page - 1) * query.limit;
  return { items: source.slice(startIndex, startIndex + query.limit), page: query.page, limit: query.limit, total: source.length };
}

export function textMatchesQuery(query: string | undefined, ...fields: Array<string | undefined | null>): boolean {
  if (!query?.trim()) return true;
  const needle = query.trim().toLowerCase();
  return fields.some((field) => (field ?? '').toLowerCase().includes(needle));
}
