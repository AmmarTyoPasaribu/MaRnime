import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { createT, LOCALE_COOKIE, type Locale } from './translations';

/** Locale from cookie, falling back to the browser's Accept-Language. */
export const getLocale = cache(async (): Promise<Locale> => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (saved === 'en' || saved === 'id') return saved;
  const accept = (await headers()).get('accept-language') ?? '';
  return /^(id|ms)\b/i.test(accept.trim()) ? 'id' : 'en';
});

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: createT(locale) };
}
