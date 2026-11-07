'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Flower2, Leaf, Loader2, SearchX, Snowflake, Sun } from 'lucide-react';
import { anilistFetch } from '@/lib/anilist/client';
import { SEARCH_ANIME } from '@/lib/anilist/queries';
import type { MediaPage, MediaSeason, MediaSort } from '@/lib/anilist/types';
import { label } from '@/lib/i18n/labels';
import { cn, getCurrentSeason, isSeason, SEASONS, shiftSeason } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import { AnimeGrid } from '@/components/anime/AnimeCarousel';
import { useDisplayMode } from '@/providers/DisplayModeProvider';
import { CardGridSkeleton, EmptyState } from '@/components/ui/Section';

const ICONS: Record<MediaSeason, typeof Sun> = { WINTER: Snowflake, SPRING: Flower2, SUMMER: Sun, FALL: Leaf };
const COLORS: Record<MediaSeason, string> = { WINTER: '#a8d8ff', SPRING: '#ffb3cf', SUMMER: '#ffe94d', FALL: '#ffb46b' };
const FORMAT_TABS = ['', 'TV', 'MOVIE', 'ONA', 'OVA', 'SPECIAL', 'TV_SHORT'];
const SORTS: MediaSort[] = ['POPULARITY_DESC', 'SCORE_DESC', 'TRENDING_DESC', 'FAVOURITES_DESC', 'START_DATE', 'TITLE_ROMAJI'];

export default function SeasonalClient() {
  const { t, locale } = useI18n();
  const { mode } = useDisplayMode();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = getCurrentSeason();
  const season: MediaSeason = isSeason(params.get('season')) ? (params.get('season') as MediaSeason) : current.season;
  const yearParam = Number(params.get('year'));
  const year = Number.isInteger(yearParam) && yearParam > 1940 && yearParam < 2100 ? yearParam : current.year;
  const format = FORMAT_TABS.includes(params.get('format') ?? '') ? params.get('format') ?? '' : '';
  const sort = SORTS.includes(params.get('sort') as MediaSort) ? (params.get('sort') as MediaSort) : 'POPULARITY_DESC';

  const update = (patch: Record<string, string | number>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === '' || v == null) next.delete(k);
      else next.set(k, String(v));
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const variables = useMemo(
    () => ({
      season,
      seasonYear: year,
      perPage: 50,
      sort: [sort],
      ...(format ? { format_in: [format] } : {}),
    }),
    [season, year, sort, format]
  );

  const query = useInfiniteQuery({
    queryKey: ['seasonal', variables],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      anilistFetch<{ Page: MediaPage }>(SEARCH_ANIME, { ...variables, page: pageParam }, { signal }).then((d) => d.Page),
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? last.pageInfo.currentPage + 1 : undefined),
  });
  const items = (query.data?.pages ?? []).flatMap((p) => p.media);

  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && !isFetchingNextPage && fetchNextPage(), { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const go = (delta: number) => {
    const n = shiftSeason(season, year, delta);
    update({ season: n.season, year: n.year });
  };
  const isCurrent = season === current.season && year === current.year;
  const Icon = ICONS[season];
  const years = Array.from({ length: current.year + 2 - 1970 }, (_, i) => current.year + 1 - i);

  return (
    <div className="pb-4">
      <header className="relative mb-8 overflow-hidden border-[3px] border-ink p-6 shadow-brut-lg transition-colors duration-500 sm:p-8" style={{ background: COLORS[season] }}>
        <Icon aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 rotate-12 opacity-20" strokeWidth={2.5} />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="sticker bg-white text-xs" style={{ ['--r' as string]: '-3deg' }}>
              <Icon className="h-3.5 w-3.5" strokeWidth={3} />
              {isCurrent ? t('currentSeason') : t('seasonalTitle')}
            </span>
            <h1 className="mt-4 font-display text-4xl uppercase sm:text-6xl">
              {label.season(season, locale)} {year}
            </h1>
            <p className="mt-2 font-bold">{t('seasonalSubtitle')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => go(-1)} className="btn w-11 px-0" aria-label={t('prevSeason')}>
              <ChevronLeft className="h-5 w-5" strokeWidth={3} />
            </button>
            <div className="flex border-[3px] border-ink bg-white shadow-brut-sm">
              {SEASONS.map((s) => {
                const SIcon = ICONS[s];
                return (
                  <button
                    key={s}
                    onClick={() => update({ season: s, year })}
                    aria-pressed={s === season}
                    className={cn('flex h-10 items-center gap-1.5 px-2.5 text-sm font-bold transition-colors sm:px-3', s === season ? 'bg-ink text-white' : 'hover:bg-pop-yellow')}
                  >
                    <SIcon className="h-4 w-4" strokeWidth={2.5} />
                    <span className="hidden sm:inline">{label.season(s, locale)}</span>
                  </button>
                );
              })}
            </div>
            <select value={year} onChange={(e) => update({ season, year: e.target.value })} className="input h-[2.9rem] w-28 shadow-brut-sm" aria-label={t('year')}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button onClick={() => go(1)} className="btn w-11 px-0" aria-label={t('nextSeasonLabel')}>
              <ChevronRight className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="no-scrollbar -mx-4 flex flex-1 gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0">
          {FORMAT_TABS.map((f) => (
            <button key={f || 'all'} onClick={() => update({ format: f })} data-active={format === f} className="chip">
              {f ? label.format(f, locale) : t('allFormats')}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => update({ sort: e.target.value === 'POPULARITY_DESC' ? '' : e.target.value })} className="input h-11 w-auto" aria-label={t('sortBy')}>
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {label.sort(s, locale)}
            </option>
          ))}
        </select>
      </div>

      {query.isPending ? (
        <CardGridSkeleton count={18} />
      ) : items.length === 0 ? (
        <EmptyState icon={<SearchX className="h-6 w-6" />} title={t('noResults')} description={t('noResultsHint')} />
      ) : (
        <AnimeGrid anime={items} groupByLetter={mode === 'text'} textColumns={2} />
      )}

      <div ref={sentinel} className="h-px" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-7 w-7 animate-spin" strokeWidth={3} />
        </div>
      )}
    </div>
  );
}
