'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import type { MediaSummary } from '@/lib/anilist/types';
import { label } from '@/lib/i18n/labels';
import { cn, formatScore, titleOf } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import { useDisplayMode } from '@/providers/DisplayModeProvider';

const RANK_FILL = ['bg-pop-yellow', 'bg-pop-mint', 'bg-pop-pink'];

export default function TopTenPanel({ anime, compact }: { anime: MediaSummary[]; compact?: boolean }) {
  const { t, locale } = useI18n();
  const { mode } = useDisplayMode();
  const showCovers = mode === 'card';
  return (
    <section className="border-[3px] border-ink bg-white shadow-brut">
      <div className="flex items-center justify-between gap-3 border-b-[3px] border-ink bg-pop-mint px-4 py-3">
        <h2 className="flex items-center gap-2 font-display text-xl uppercase">
          <Trophy className="h-5 w-5" strokeWidth={2.5} />
          {t('top10')}
        </h2>
        <Link href="/top" className="text-sm font-bold underline underline-offset-4 hover:bg-pop-yellow">
          {t('viewAll')}
        </Link>
      </div>
      <ol>
        {anime.slice(0, 10).map((a, i) => (
          <li key={a.id}>
            <Link href={`/anime/${a.id}`} className="text-row group items-center gap-3 border-b-2 last:border-b-0">
              <span className={cn('grid h-8 w-8 shrink-0 place-items-center border-2 border-ink font-display text-sm', RANK_FILL[i] ?? 'bg-white')}>{i + 1}</span>
              {showCovers && !compact && (
                <span className="relative h-14 w-10 shrink-0 overflow-hidden border-2 border-ink">
                  <Image src={a.coverImage.medium} alt="" fill sizes="40px" className="object-cover" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 text-sm font-bold">{titleOf(a.title)}</span>
                <span className="line-clamp-1 text-xs font-medium text-fg-3">
                  {[label.format(a.format, locale), a.seasonYear, a.genres.slice(0, 2).join(', ')].filter(Boolean).join(' · ')}
                </span>
              </span>
              {a.averageScore && <span className="shrink-0 text-sm font-bold">★ {formatScore(a.averageScore)}</span>}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
