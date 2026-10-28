import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storage from '../utils/storage';
import { vi, TranslationKey } from './vi';
import { en } from './en';
import { LocaleCode } from '../types';
import { setClientLocale } from '../api/client';
import { api } from '../api/endpoints';

const LOCALE_STORAGE_KEY = '@pawty_locale';

interface I18nContextType {
  locale: LocaleCode;
  setLocale: (next: LocaleCode) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'vi',
  setLocale: async () => {},
  t: (key) => vi[key] || key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleCode>('vi');

  useEffect(() => {
    storage.getItem(LOCALE_STORAGE_KEY)
      .then((saved: string | null) => {
        if (saved === 'en' || saved === 'vi') {
          setLocaleState(saved);
          setClientLocale(saved);
        }
      })
      .catch((err: unknown) => console.error('Failed to read locale:', err));
  }, []);

  const setLocale = useCallback(async (next: LocaleCode) => {
    try {
      setLocaleState(next);
      setClientLocale(next);
      await storage.setItem(LOCALE_STORAGE_KEY, next);
      await api.updateMe({ locale: next });
    } catch (err) {
      console.error('Failed to persist locale:', err);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = locale === 'en' ? en : vi;
      return dict[key] ?? vi[key] ?? key;
    },
    [locale],
  );

  return React.createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
};

export const useTranslation = () => useContext(I18nContext);
export type { TranslationKey };
