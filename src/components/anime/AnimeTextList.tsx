'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { CardMedia } from './AnimeCard';
import { AiringText } from './AnimeCard';
import { label } from '@/lib/i18n/labels';
import { cn, formatScore } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import { useWatchlistMap, STATUS_COLOR } from '@/lib/watchlist';

type Props = {
  anime: CardMedia[];
  /** Show #1, #2 … in front of titles. */
  numbered?: boolean;
  /** Group alphabetically with letter headings (otakudesu "Anime List" style). */
  groupByLetter?: boolean;
  columns?: 1 | 2 | 3;
  className?: string;
  startRank?: number;
};

function Row({ anime, rank }: { anime: CardMedia; rank?: number }) {
  const { t, locale } = useI18n();
  const map = useWatchlistMap();
  const entry = map.get(anime.id);
  const title = anime.title.english || anime.title.romaji;
  const score = formatScore(anime.averageScore);
  return (
    <li>
      <Link href={`/anime/${anime.id}`} className="text-row group">
        {rank != null ? (
          <span className="w-8 shrink-0 font-display text-sm tabular-nums">{rank}</span>
        ) : (
          <span aria-hidden className="mt-1 h-2.5 w-2.5 shrink-0 rotate-45 border-2 border-ink bg-pop-pink transition-transform group-hover:rotate-[135deg]" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block leading-snug">{title}</span>
          <span className="mt-0.5 block text-xs font-medium text-fg-3">
            {[
              label.format(anime.format, locale),
              anime.episodes ? t('epsCount', { n: anime.episodes }) : null,
              anime.seasonYear,
            ]
              .filter(Boolean)
              .join(' · ')}
            {anime.nextAiringEpisode && (
              <>
                {' · '}
                <AiringText airingAt={anime.nextAiringEpisode.airingAt} episode={anime.nextAiringEpisode.episode} className="font-bold text-ink" />
              </>
            )}
          </span>
        </span>
        {entry && <span title={label.listStatus(entry.status, locale)} className="h-3.5 w-3.5 shrink-0 self-center border-2 border-ink" style={{ background: STATUS_COLOR[entry.status] }} />}
        {score && <span className="shrink-0 self-center border-2 border-ink bg-white px-1.5 text-xs font-bold">★ {score}</span>}
      </Link>
    </li>
  );
}

const COLS = { 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 xl:grid-cols-3' };

export default function AnimeTextList({ anime, numbered, groupByLetter, columns = 1, className, startRank = 1 }: Props) {
  const groups = useMemo(() => {
    if (!groupByLetter) return null;
    const map = new Map<string, CardMedia[]>();
    const sorted = [...anime].sort((a, b) => (a.title.english || a.title.romaji).localeCompare(b.title.english || b.title.romaji));
    for (const a of sorted) {
      const first = (a.title.english || a.title.romaji).trim().charAt(0).toUpperCase();
      const key = /[A-Z]/.test(first) ? first : '#';
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return [...map.entries()].sort(([a], [b]) => (a === '#' ? -1 : b === '#' ? 1 : a.localeCompare(b)));
  }, [anime, groupByLetter]);

  if (groups) {
    return (
      <div className={className}>
        <nav aria-label="A–Z" className="mb-5 flex flex-wrap gap-1.5">
          {groups.map(([letter]) => (
            <a key={letter} href={`#letter-${letter}`} className="grid h-9 w-9 place-items-center border-2 border-ink bg-white font-display text-sm transition hover:-translate-y-0.5 hover:bg-pop-yellow">
              {letter}
            </a>
          ))}
        </nav>
        <div className={cn('grid gap-5', COLS[columns])}>
          {groups.map(([letter, items]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-24 self-start border-[3px] border-ink bg-white shadow-brut">
              <h3 className="border-b-[3px] border-ink bg-pop-yellow px-3 py-1.5 font-display text-lg">{letter}</h3>
              <ul className="[&>li:last-child_a]:border-b-0">
                {items.map((a) => (
                  <Row key={a.id} anime={a} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (columns === 1) {
    return (
      <ul className={cn('border-[3px] border-ink bg-white shadow-brut [&>li:last-child_a]:border-b-0', className)}>
        {anime.map((a, i) => (
          <Row key={a.id} anime={a} rank={numbered ? startRank + i : undefined} />
        ))}
      </ul>
    );
  }

  // Multi-column: split into balanced columns so numbering reads top-to-bottom.
  const per = Math.ceil(anime.length / columns);
  const chunks = Array.from({ length: columns }, (_, c) => anime.slice(c * per, c * per + per)).filter((c) => c.length);
  return (
    <div className={cn('grid gap-4', COLS[columns], className)}>
      {chunks.map((chunk, c) => (
        <ul key={c} className="self-start border-[3px] border-ink bg-white shadow-brut [&>li:last-child_a]:border-b-0">
          {chunk.map((a, i) => (
            <Row key={a.id} anime={a} rank={numbered ? startRank + c * per + i : undefined} />
          ))}
        </ul>
      ))}
    </div>
  );
}
