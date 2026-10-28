import { useEffect, useState } from 'react';

// Debounce 400ms để không bắn API mỗi lần gõ phím trong ô tìm kiếm.
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timerId);
  }, [value, delayMs]);

  return debouncedValue;
}
