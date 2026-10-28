export interface TokenStore {
  read: () => string | null;
  write: (token: string) => void;
  clear: () => void;
}

export function createTokenStore(storageKey: string): TokenStore {
  return {
    read: () => {
      try {
        return window.localStorage.getItem(storageKey);
      } catch (storageError) {
        console.error('[Auth] Không đọc được token từ localStorage', storageError);
        return null;
      }
    },
    write: (token) => {
      try {
        window.localStorage.setItem(storageKey, token);
      } catch (storageError) {
        console.error('[Auth] Không lưu được token', storageError);
      }
    },
    clear: () => {
      try {
        window.localStorage.removeItem(storageKey);
      } catch (storageError) {
        console.error('[Auth] Không xoá được token', storageError);
      }
    },
  };
}
