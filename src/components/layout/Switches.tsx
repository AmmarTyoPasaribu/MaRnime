'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlignLeft, LayoutGrid, Loader2 } from 'lucide-react';
import { useI18n } from '@/providers/I18nProvider';
import { useDisplayMode } from '@/providers/DisplayModeProvider';
import { anilistFetch } from '@/lib/anilist/client';
import { RANDOM_POOL } from '@/lib/anilist/queries';
import { cn } from '@/lib/utils';

export function useRandomAnime() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const go = useCallback(async () => {
    setLoading(true);
    try {
      const page = 1 + Math.floor(Math.random() * 30);
      const data = await anilistFetch<{ Page: { media: { id: number }[] } }>(RANDOM_POOL, { page });
      const pool = data.Page.media;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) router.push(`/anime/${pick.id}`);
    } catch {
      // AniList busy — ignore
    } finally {
      setLoading(false);
    }
  }, [router]);
  return { go, loading };
}

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t, isSwitching } = useI18n();
  return (
    <div role="group" aria-label={t('language')} className={cn('flex border-[3px] border-ink bg-white text-xs font-bold', className)}>
      {(['id', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => l !== locale && setLocale(l)}
          aria-pressed={locale === l}
          className={cn('h-9 w-10 uppercase transition-colors', locale === l ? 'bg-ink text-white' : 'hover:bg-pop-yellow')}
        >
          {isSwitching && locale === l ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : l}
        </button>
      ))}
    </div>
  );
}

export function DisplayModeSwitch({ className, compact }: { className?: string; compact?: boolean }) {
  const { mode, setMode } = useDisplayMode();
  const { t } = useI18n();
  const opts = [
    { id: 'card' as const, label: t('cardView'), icon: LayoutGrid },
    { id: 'text' as const, label: t('textView'), icon: AlignLeft },
  ];
  return (
    <div role="group" aria-label={t('displayMode')} className={cn('flex border-[3px] border-ink bg-white text-xs font-bold', className)}>
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => setMode(o.id)}
          aria-pressed={mode === o.id}
          title={o.label}
          className={cn(
            'flex h-9 flex-1 items-center justify-center gap-1.5 px-2.5 transition-colors',
            mode === o.id ? 'bg-ink text-white' : 'hover:bg-pop-yellow'
          )}
        >
          <o.icon className="h-4 w-4" />
          {!compact && o.label}
          {compact && <span className="sr-only">{o.label}</span>}
        </button>
      ))}
    </div>
  );
}

