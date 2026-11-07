import Link from 'next/link';
import { Compass, Home } from 'lucide-react';
import { getI18n } from '@/lib/i18n/server';

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="grid min-h-[70vh] place-items-center py-16">
      <div className="text-center">
        <p className="inline-block select-none border-[3px] border-ink bg-pop-yellow px-6 font-display text-[7rem] leading-none shadow-brut-lg [transform:rotate(-3deg)] sm:text-[10rem]">404</p>
        <h1 className="mt-8 font-display text-3xl uppercase">{t('pageNotFound')}</h1>
        <p className="mx-auto mt-3 max-w-md text-fg-3">{t('pageNotFoundDesc')}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            <Home className="h-4 w-4" />
            {t('goHome')}
          </Link>
          <Link href="/browse" className="btn btn-secondary">
            <Compass className="h-4 w-4" />
            {t('browseAnime')}
          </Link>
        </div>
      </div>
    </div>
  );
}
