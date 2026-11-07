'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { ExternalLink, Star } from 'lucide-react';
import type { MalEpisode } from '@/lib/jikan';
import type { StreamingEpisode } from '@/lib/anilist/types';
import { useI18n } from '@/providers/I18nProvider';

export function MalEpisodeList({ episodes }: { episodes: MalEpisode[] }) {
  const { t, locale } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? episodes : episodes.slice(0, 12);
  const fmt = new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'medium' });

  return (
    <div>
      <ol className="panel divide-y divide-line overflow-hidden">
        {list.map((ep) => (
          <li key={ep.mal_id} className="flex items-center gap-3 px-4 py-3">
            <span className="w-9 shrink-0 font-display text-lg tabular-nums">{ep.mal_id}</span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium">{ep.title || `Episode ${ep.mal_id}`}</p>
              <p className="line-clamp-1 text-xs text-fg-3">
                {[ep.title_japanese, ep.aired ? fmt.format(new Date(ep.aired)) : null].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {ep.filler && <span className="tag bg-pop-orange">{t('filler')}</span>}
              {ep.recap && <span className="tag bg-pop-lilac">{t('recap')}</span>}
              {ep.score ? (
                <span className="hidden items-center gap-1 text-xs font-bold text-fg-2 sm:inline-flex">
                  <Star className="h-3 w-3 fill-pop-yellow" strokeWidth={2.5} />
                  {ep.score.toFixed(2)}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      {episodes.length > 12 && (
        <div className="mt-4 flex justify-center">
          <button onClick={() => setShowAll((s) => !s)} className="btn btn-secondary btn-sm">
            {showAll ? t('showLess') : `${t('loadMore')} (${episodes.length - 12})`}
          </button>
        </div>
      )}
    </div>
  );
}

export function StreamingEpisodeGrid({ episodes }: { episodes: StreamingEpisode[] }) {
  const { t } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? episodes : episodes.slice(0, 8);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((ep, i) => (
          <a
            key={`${ep.url}-${i}`}
            href={ep.url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden border-2 border-ink bg-surface transition hover:-translate-y-0.5 hover:shadow-brut-sm"
          >
            <div className="relative aspect-video bg-surface-2">
              {ep.thumbnail && <img src={ep.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
              <span className="absolute right-2 top-2 border-2 border-ink bg-white px-1.5 py-0.5 text-[10px] font-bold">{ep.site}</span>
            </div>
            <p className="line-clamp-2 p-2.5 text-xs font-medium leading-snug group-hover:bg-pop-yellow">
              {ep.title}
              <ExternalLink className="ml-1 inline h-3 w-3 opacity-50" />
            </p>
          </a>
        ))}
      </div>
      {episodes.length > 8 && (
        <div className="mt-4 flex justify-center">
          <button onClick={() => setShowAll((s) => !s)} className="btn btn-secondary btn-sm">
            {showAll ? t('showLess') : `${t('loadMore')} (${episodes.length - 8})`}
          </button>
        </div>
      )}
    </div>
  );
}
