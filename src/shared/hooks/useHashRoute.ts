import { useCallback, useEffect, useState } from 'react';

function readHashPath(defaultPath: string): string {
  const hashPath = window.location.hash.replace(/^#/, '');
  return hashPath || defaultPath;
}

/** Router dạng hash (`#/dashboard`) — không cần cấu hình rewrite ở dev server cho multi-page. */
export function useHashRoute(defaultPath: string): [string, (path: string) => void] {
  const [currentPath, setCurrentPath] = useState(() => readHashPath(defaultPath));

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(readHashPath(defaultPath));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [defaultPath]);

  const navigateTo = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return [currentPath, navigateTo];
}
