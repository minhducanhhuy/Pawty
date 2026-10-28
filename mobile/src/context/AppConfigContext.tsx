import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PublicConfig } from '../types';
import { DEFAULT_CONFIG } from '../api/mockStoreCore';
import { api } from '../api/endpoints';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface AppConfigContextType {
  config: PublicConfig;
  toast: ToastMessage | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

const AppConfigContext = createContext<AppConfigContextType>({
  config: DEFAULT_CONFIG,
  toast: null,
  showToast: () => {},
  hideToast: () => {},
});

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PublicConfig>(DEFAULT_CONFIG);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    api
      .getConfig()
      .then((res) => {
        if (res?.tiers) setConfig(res);
      })
      .catch((err) => console.error('Failed to load public config:', err));
  }, []);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = String(Date.now());
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3200);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <AppConfigContext.Provider value={{ config, toast, showToast, hideToast }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);
