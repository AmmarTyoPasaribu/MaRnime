import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Archivo_Black, Space_Grotesk } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';
import QueryProvider from '@/providers/QueryProvider';
import AuthProvider from '@/providers/AuthProvider';
import I18nProvider from '@/providers/I18nProvider';
import ToastProvider from '@/providers/ToastProvider';
import DisplayModeProvider from '@/providers/DisplayModeProvider';
import { VIEW_COOKIE, type DisplayMode } from '@/lib/display';
import { getLocale } from '@/lib/i18n/server';
import { siteConfig } from '@/lib/site';

const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' });
const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--font-archivo', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'MaRnime — Discover & Track Anime',
    template: '%s · MaRnime',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ['anime', 'anime tracker', 'watchlist', 'anilist', 'myanimelist', 'seasonal anime', 'airing schedule', 'jadwal anime'],
  authors: [{ name: siteConfig.author.name }],
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: 'MaRnime — Discover & Track Anime',
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaRnime — Discover & Track Anime',
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#ffe94d',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const view: DisplayMode = (await cookies()).get(VIEW_COOKIE)?.value === 'text' ? 'text' : 'card';

  return (
    <html lang={locale} className={`${grotesk.variable} ${archivo.variable}`}>
      <body>
        <QueryProvider>
          <I18nProvider initialLocale={locale}>
            <DisplayModeProvider initialMode={view}>
              <AuthProvider>
                <ToastProvider>
                  <AppShell>{children}</AppShell>
                </ToastProvider>
              </AuthProvider>
            </DisplayModeProvider>
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
