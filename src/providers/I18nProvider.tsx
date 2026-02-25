'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, type Locale, type TranslationKey } from '@/lib/i18n/translations';

interface I18nContextType {
  locale: Locale;
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: (key) => key,
  setLocale: () => {},
  toggleLocale: () => {},
});

export function useI18n() {
  return useContext(I18nContext);
}

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem('marnime-lang') as Locale;
    if (saved && (saved === 'en' || saved === 'id')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('marnime-lang', newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === 'en' ? 'id' : 'en';
    setLocale(newLocale);
  }, [locale, setLocale]);

  const t = useCallback((key: TranslationKey): string => {
    return translations[locale][key] || translations.en[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}
