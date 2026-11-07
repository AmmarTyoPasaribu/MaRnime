'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Star } from 'lucide-react';
import type { MediaSummary } from '@/lib/anilist/types';
import { label } from '@/lib/i18n/labels';
import { cn, formatCountdown, formatScore, scoreFill } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import { useWatchlistMap, STATUS_COLOR } from '@/lib/watchlist';
import { useNow } from '@/components/ui/Countdown';

export type CardMedia = Pick<
  MediaSummary,
  'id' | 'title' | 'coverImage' | 'format' | 'episodes' | 'season' | 'seasonYear' | 'averageScore' | 'nextAiringEpisode' | 'genres' | 'studios' | 'status'
>;

export function AiringText({ airingAt, episode, className }: { airingAt: number; episode: number; className?: string }) {
  const now = useNow();
  const { t, locale } = useI18n();
  if (now == null) return null;
  const diff = airingAt - now;
  return <span className={className}>{diff > 0 ? t('epIn', { ep: episode, time: formatCountdown(diff, locale) }) : t('airingNow')}</span>;
}

function ListDot({ animeId }: { animeId: number }) {
  const map = useWatchlistMap();
  const { t, locale } = useI18n();
  const entry = map.get(animeId);
  if (!entry) return null;
  return (
    <span
      title={`${t('inYourList')}: ${label.listStatus(entry.status, locale)}`}
      className="absolute right-2 top-2 z-10 h-5 w-5 border-[3px] border-ink"
      style={{ background: STATUS_COLOR[entry.status] }}
    />
  );
}

export default function AnimeCard({
  anime,
  priority,
  className,
  rank,
  style,
}: {
  anime: CardMedia;
  priority?: boolean;
  className?: string;
  rank?: number;
  style?: React.CSSProperties;
}) {
  const { t, locale } = useI18n();
  const title = anime.title.english || anime.title.romaji;
  const score = formatScore(anime.averageScore);
  const airing = anime.nextAiringEpisode;
  const meta = [
    anime.season && anime.seasonYear ? `${label.season(anime.season, locale)} ${anime.seasonYear}` : anime.seasonYear,
    label.format(anime.format, locale),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link href={`/anime/${anime.id}`} className={cn('anime-card group', className)} style={style}>
      <div className="poster">
        <Image
          src={anime.coverImage.large}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 200px"
          className="object-cover"
        />

        {rank != null ? (
          <span className="absolute left-0 top-0 z-10 grid h-10 min-w-10 place-items-center border-b-[3px] border-r-[3px] border-ink bg-ink px-2 font-display text-lg text-pop-yellow">
            {rank}
          </span>
        ) : (
          score && (
            <span className="sticker card-sticker absolute left-2 top-2 z-10" style={{ background: scoreFill(anime.averageScore) }}>
              <Star className="h-3 w-3 fill-current" strokeWidth={3} />
              {score}
            </span>
          )
        )}
        <ListDot animeId={anime.id} />

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap gap-1 p-2">
          {airing ? (
            <span className="inline-flex items-center gap-1 border-2 border-ink bg-ink px-1.5 py-0.5 text-[10px] font-bold text-pop-yellow">
              <Clock className="h-3 w-3" strokeWidth={3} />
              <AiringText airingAt={airing.airingAt} episode={airing.episode} />
            </span>
          ) : anime.episodes ? (
            <span className="border-2 border-ink bg-white px-1.5 py-0.5 text-[10px] font-bold">{t('epsCount', { n: anime.episodes })}</span>
          ) : null}
        </div>
      </div>

      <div className="pt-3">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug sm:text-sm">
          <span className="card-title">{title}</span>
        </h3>
        <p className="mt-1 truncate text-xs font-medium text-fg-3">{meta || t('tba')}</p>
      </div>
    </Link>
  );
}
