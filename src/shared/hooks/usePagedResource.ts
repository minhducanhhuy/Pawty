import { useEffect, useState } from 'react';
import { DEFAULT_PAGE_SIZE, type PageQuery, type PagedResult } from '../api/paged';
import { useAsyncResource } from './useAsyncResource';
import { useDebouncedValue } from './useDebouncedValue';

export interface PagedResourceState<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  searchText: string;
  isLoading: boolean;
  errorMessage: string | null;
  setPage: (page: number) => void;
  setSearchText: (text: string) => void;
  reload: () => void;
}

/**
 * Quản lý trang + tìm kiếm cho mọi bảng; `filters` là bộ lọc bổ sung (status, type…).
 * Khi đổi từ khoá hoặc bộ lọc luôn quay về trang 1 để tránh trang rỗng.
 */
export function usePagedResource<T>(
  fetchPage: (query: PageQuery) => Promise<PagedResult<T>>,
  filters: unknown[] = [],
  limit: number = DEFAULT_PAGE_SIZE,
): PagedResourceState<T> {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebouncedValue(searchText);
  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchText, filterKey]);

  const { data, isLoading, errorMessage, reload } = useAsyncResource(
    () => fetchPage({ page, limit, q: debouncedSearchText.trim() || undefined }),
    [page, limit, debouncedSearchText, filterKey],
  );

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    limit,
    searchText,
    isLoading,
    errorMessage,
    setPage,
    setSearchText,
    reload,
  };
}
