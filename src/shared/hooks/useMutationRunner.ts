import { useCallback, useState } from 'react';
import { getFriendlyErrorMessage } from '../api/apiError';
import { useToast } from '../ui/Toast';

interface RunOptions {
  successMessage?: string;
  failureLogLabel: string;
}

/** Bọc thao tác ghi: trạng thái busy + toast thành công/thất bại + log console cho CTO. */
export function useMutationRunner() {
  const toast = useToast();
  const [isBusy, setIsBusy] = useState(false);

  const run = useCallback(
    async <T,>(action: () => Promise<T>, options: RunOptions): Promise<T | undefined> => {
      setIsBusy(true);
      try {
        const result = await action();
        if (options.successMessage) toast.showSuccess(options.successMessage);
        return result;
      } catch (actionError) {
        console.error(`[Mutation] ${options.failureLogLabel}`, actionError);
        toast.showError(getFriendlyErrorMessage(actionError));
        return undefined;
      } finally {
        setIsBusy(false);
      }
    },
    [toast],
  );

  return { run, isBusy };
}
