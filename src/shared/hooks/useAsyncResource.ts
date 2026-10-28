import { useCallback, useEffect, useRef, useState } from 'react';
import { getFriendlyErrorMessage } from '../api/apiError';

export interface AsyncResource<T> {
  data: T | null;
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => void;
}

export function useAsyncResource<T>(fetcher: () => Promise<T>, dependencies: unknown[]): AsyncResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const latestRequestId = useRef(0);

  useEffect(() => {
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    setErrorMessage(null);

    fetcher()
      .then((result) => {
        if (requestId === latestRequestId.current) setData(result);
      })
      .catch((fetchError: unknown) => {
        console.error('[useAsyncResource] tải dữ liệu thất bại', fetchError);
        if (requestId === latestRequestId.current) setErrorMessage(getFriendlyErrorMessage(fetchError));
      })
      .finally(() => {
        if (requestId === latestRequestId.current) setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, isLoading, errorMessage, reload };
}
