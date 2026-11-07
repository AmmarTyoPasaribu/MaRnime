'use client';

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createT, LOCALE_COOKIE, type Locale, type TFunction } from '@/lib/i18n/translations';

interface I18nContextType {
  locale: Locale;
  t: TFunction;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  isSwitching: boolean;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: createT('en'),
  setLocale: () => {},
  toggleLocale: () => {},
  isSwitching: false,
});

export function useI18n() {
  return useContext(I18nContext);
}

export default function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isSwitching, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      // Re-render server components with the new language.
      startTransition(() => router.refresh());
    },
    [router]
  );

  const toggleLocale = useCallback(() => setLocale(locale === 'en' ? 'id' : 'en'), [locale, setLocale]);
  const t = useMemo(() => createT(locale), [locale]);

  const value = useMemo(
    () => ({ locale, t, setLocale, toggleLocale, isSwitching }),
    [locale, t, setLocale, toggleLocale, isSwitching]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
