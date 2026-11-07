'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Users } from 'lucide-react';
import type { MediaSummary } from '@/lib/anilist/types';
import { label } from '@/lib/i18n/labels';
import { cn, compactNumber, formatScore, plainText, scoreFill, titleOf } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';

const RANK_FILL = ['bg-pop-yellow', 'bg-pop-mint', 'bg-pop-pink'];

/** Horizontal list-view row used by Browse (list mode) and Top 100. */
export default function AnimeRow({ anime, rank }: { anime: MediaSummary; rank?: number }) {
  const { t, locale } = useI18n();
  const title = titleOf(anime.title);
  const score = formatScore(anime.averageScore);
  const desc = plainText(anime.description, 220);

  return (
    <Link href={`/anime/${anime.id}`} className="panel panel-hover group flex items-stretch gap-3 p-2.5 sm:gap-4 sm:p-3">
      {rank != null && (
        <div className={cn('hidden w-14 shrink-0 place-items-center border-[3px] border-ink font-display text-2xl sm:grid', RANK_FILL[rank - 1] ?? 'bg-white')}>{rank}</div>
      )}
      <div className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden border-[3px] border-ink sm:w-[76px]">
        <Image src={anime.coverImage.large} alt={title} fill sizes="80px" className="object-cover transition duration-500 group-hover:scale-105" />
        {rank != null && <span className="absolute left-0 top-0 border-b-2 border-r-2 border-ink bg-ink px-1.5 text-xs font-bold text-pop-yellow sm:hidden">#{rank}</span>}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="line-clamp-1 font-bold">
          <span className="card-title group-hover:bg-pop-yellow">{title}</span>
        </h3>
        <p className="mt-0.5 text-xs font-medium text-fg-3">
          {[
            label.format(anime.format, locale),
            anime.episodes ? t('epsCount', { n: anime.episodes }) : null,
            anime.season && anime.seasonYear ? `${label.season(anime.season, locale)} ${anime.seasonYear}` : anime.seasonYear,
            anime.studios?.nodes?.[0]?.name,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {desc && <p className="mt-1.5 hidden text-sm font-medium leading-relaxed text-fg-2 md:line-clamp-2">{desc}</p>}
        <div className="mt-2 flex flex-wrap gap-1">
          {anime.genres.slice(0, 4).map((g) => (
            <span key={g} className="tag">
              {g}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden shrink-0 flex-col items-end justify-center gap-1.5 pr-1 text-sm sm:flex">
        {score && (
          <span className="sticker" style={{ background: scoreFill(anime.averageScore), ['--r' as string]: '3deg' }}>
            ★ {score}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-bold">
          <Users className="h-3.5 w-3.5" strokeWidth={2.5} />
          {compactNumber(anime.popularity, locale)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold">
          <Heart className="h-3.5 w-3.5" strokeWidth={2.5} />
          {compactNumber(anime.favourites, locale)}
        </span>
      </div>
    </Link>
  );
}
