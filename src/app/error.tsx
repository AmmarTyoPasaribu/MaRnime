'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { useI18n } from '@/providers/I18nProvider';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 rotate-[-6deg] place-items-center border-[3px] border-ink bg-pop-pink shadow-brut">
          <AlertTriangle className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <h1 className="font-display text-3xl uppercase">{t('somethingWrong')}</h1>
        <p className="mt-3 text-fg-3">{t('somethingWrongDesc')}</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-fg-3">#{error.digest}</p>}
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">
            <RotateCcw className="h-4 w-4" />
            {t('tryAgain')}
          </button>
          <Link href="/" className="btn btn-secondary">
            <Home className="h-4 w-4" />
            {t('goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
