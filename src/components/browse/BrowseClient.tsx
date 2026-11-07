'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AlignLeft, LayoutGrid, List, Loader2, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { anilistFetch } from '@/lib/anilist/client';
import { SEARCH_ANIME } from '@/lib/anilist/queries';
import type { MediaPage, MediaSort } from '@/lib/anilist/types';
import { label } from '@/lib/i18n/labels';
import { cn, SEASONS } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import AnimeCard from '@/components/anime/AnimeCard';
import AnimeRow from '@/components/anime/AnimeRow';
import AnimeTextList from '@/components/anime/AnimeTextList';
import { useDisplayMode } from '@/providers/DisplayModeProvider';
import Modal from '@/components/ui/Modal';
import { CardGridSkeleton, EmptyState } from '@/components/ui/Section';
import { GENRES } from '@/components/home/GenreGrid';

const FORMATS = ['TV', 'TV_SHORT', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC'];
const STATUSES = ['RELEASING', 'FINISHED', 'NOT_YET_RELEASED', 'HIATUS', 'CANCELLED'];
const SORTS: MediaSort[] = ['TRENDING_DESC', 'POPULARITY_DESC', 'SCORE_DESC', 'FAVOURITES_DESC', 'START_DATE_DESC', 'START_DATE', 'TITLE_ROMAJI'];
const COUNTRIES = ['JP', 'KR', 'CN', 'TW'];
const SCORES = [50, 60, 70, 75, 80, 85];
const PER_PAGE = 30;

type Filters = {
  search: string;
  genres: string[];
  tags: string[];
  formats: string[];
  status: string;
  season: string;
  year: string;
  country: string;
  score: string;
  sort: string;
};

function readFilters(params: URLSearchParams): Filters {
  const list = (k: string) => params.get(k)?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
  return {
    search: params.get('search') ?? '',
    genres: list('genres'),
    tags: list('tags'),
    formats: list('format').filter((f) => FORMATS.includes(f)),
    status: STATUSES.includes(params.get('status') ?? '') ? params.get('status')! : '',
    season: (SEASONS as string[]).includes(params.get('season') ?? '') ? params.get('season')! : '',
    year: /^\d{4}$/.test(params.get('year') ?? '') ? params.get('year')! : '',
    country: COUNTRIES.includes(params.get('country') ?? '') ? params.get('country')! : '',
    score: /^\d+$/.test(params.get('score') ?? '') ? params.get('score')! : '',
    sort: SORTS.includes(params.get('sort') as MediaSort) ? params.get('sort')! : '',
  };
}

function useDebounced<T>(value: T, delay: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function BrowseClient() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => readFilters(new URLSearchParams(params.toString())), [params]);
  const { mode } = useDisplayMode();
  const viewParam = params.get('view');
  const view: 'grid' | 'list' | 'text' = viewParam === 'list' || viewParam === 'text' || viewParam === 'grid' ? viewParam : mode === 'text' ? 'text' : 'grid';

  const [searchInput, setSearchInput] = useState(filters.search);
  const [sheet, setSheet] = useState(false);
  const debouncedSearch = useDebounced(searchInput.trim(), 450);

  const update = useCallback(
    (patch: Partial<Record<keyof Filters | 'view', string | string[]>>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        const v = Array.isArray(value) ? value.join(',') : value;
        const urlKey = key === 'formats' ? 'format' : key;
        if (v) next.set(urlKey, v);
        else next.delete(urlKey);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  // Keep the input in sync when the URL changes from elsewhere (navbar search, back button).
  const lastUrlSearch = useRef(filters.search);
  useEffect(() => {
    if (filters.search !== lastUrlSearch.current) {
      lastUrlSearch.current = filters.search;
      setSearchInput(filters.search);
    }
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      lastUrlSearch.current = debouncedSearch;
      update({ search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const sort = (filters.sort || (filters.search ? 'SEARCH_MATCH' : 'TRENDING_DESC')) as MediaSort;

  const variables = useMemo(() => {
    const v: Record<string, unknown> = { perPage: PER_PAGE, sort: sort === 'SEARCH_MATCH' ? ['SEARCH_MATCH', 'POPULARITY_DESC'] : [sort] };
    if (filters.search) v.search = filters.search;
    if (filters.genres.length) v.genre_in = filters.genres;
    if (filters.tags.length) v.tag_in = filters.tags;
    if (filters.formats.length) v.format_in = filters.formats;
    if (filters.status) v.status = filters.status;
    if (filters.season) v.season = filters.season;
    if (filters.year) v.seasonYear = Number(filters.year);
    if (filters.country) v.countryOfOrigin = filters.country;
    if (filters.score) v.averageScore_greater = Number(filters.score) - 1;
    return v;
  }, [filters, sort]);

  const query = useInfiniteQuery({
    queryKey: ['browse', variables],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      anilistFetch<{ Page: MediaPage }>(SEARCH_ANIME, { ...variables, page: pageParam }, { signal }).then((d) => d.Page),
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? last.pageInfo.currentPage + 1 : undefined),
  });

  const items = useMemo(() => {
    const seen = new Set<number>();
    return (query.data?.pages ?? []).flatMap((p) => p.media).filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
  }, [query.data]);

  // Infinite scroll
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && !isFetchingNextPage && fetchNextPage(),
      { rootMargin: '600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggle = (key: 'genres' | 'formats' | 'tags', value: string) => {
    const current = filters[key];
    update({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
  };

  const activeChips: { key: string; label: string; remove: () => void }[] = [
    ...filters.genres.map((g) => ({ key: `g-${g}`, label: g, remove: () => toggle('genres', g) })),
    ...filters.tags.map((g) => ({ key: `t-${g}`, label: `#${g}`, remove: () => toggle('tags', g) })),
    ...filters.formats.map((f) => ({ key: `f-${f}`, label: label.format(f, locale), remove: () => toggle('formats', f) })),
    ...(filters.status ? [{ key: 'status', label: label.status(filters.status, locale), remove: () => update({ status: '' }) }] : []),
    ...(filters.season ? [{ key: 'season', label: label.season(filters.season, locale), remove: () => update({ season: '' }) }] : []),
    ...(filters.year ? [{ key: 'year', label: filters.year, remove: () => update({ year: '' }) }] : []),
    ...(filters.country ? [{ key: 'country', label: label.country(filters.country, locale), remove: () => update({ country: '' }) }] : []),
    ...(filters.score ? [{ key: 'score', label: `★ ${Number(filters.score) / 10}+`, remove: () => update({ score: '' }) }] : []),
  ];

  const clearAll = () => {
    setSearchInput('');
    lastUrlSearch.current = '';
    router.replace(viewParam ? `${pathname}?view=${viewParam}` : pathname, { scroll: false });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear + 2 - 1960 }, (_, i) => String(currentYear + 1 - i));

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <span className="label">{t('genres')}</span>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => (
            <button key={g} onClick={() => toggle('genres', g)} data-active={filters.genres.includes(g)} className="chip h-8 text-xs">
              {g}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="label">{t('format')}</span>
        <div className="flex flex-wrap gap-1.5">
          {FORMATS.map((f) => (
            <button key={f} onClick={() => toggle('formats', f)} data-active={filters.formats.includes(f)} className="chip h-8 text-xs">
              {label.format(f, locale)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="label">{t('status')}</span>
          <select value={filters.status} onChange={(e) => update({ status: e.target.value })} className="input h-10">
            <option value="">{t('any')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {label.status(s, locale)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">{t('country')}</span>
          <select value={filters.country} onChange={(e) => update({ country: e.target.value })} className="input h-10">
            <option value="">{t('any')}</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {label.country(c, locale)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">{t('season')}</span>
          <select value={filters.season} onChange={(e) => update({ season: e.target.value })} className="input h-10">
            <option value="">{t('any')}</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {label.season(s, locale)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">{t('year')}</span>
          <select value={filters.year} onChange={(e) => update({ year: e.target.value })} className="input h-10">
            <option value="">{t('any')}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <span className="label">{t('minScore')}</span>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => update({ score: '' })} data-active={!filters.score} className="chip h-8 text-xs">
            {t('any')}
          </button>
          {SCORES.map((s) => (
            <button key={s} onClick={() => update({ score: String(s) })} data-active={filters.score === String(s)} className="chip h-8 text-xs">
              ★ {s / 10}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-4">
      <header className="mb-6">
        <h1 className="font-display text-3xl uppercase sm:text-4xl">
          {filters.search ? t('resultsFor', { q: filters.search }) : t('browseTitle')}
        </h1>
        <p className="mt-1.5 font-medium text-fg-2">{t('browseSubtitle')}</p>
      </header>

      {/* Toolbar */}
      <div className="glass sticky top-[68px] z-30 mb-6 flex flex-wrap items-center gap-2 bg-pop-yellow p-3 shadow-brut lg:top-3">
        <div className="relative min-w-0 flex-1 basis-60">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="input pl-10 pr-9"
            type="search"
            aria-label={t('search')}
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-fg-3 hover:text-fg" aria-label={t('clearAll')}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={filters.sort || (filters.search ? 'SEARCH_MATCH' : 'TRENDING_DESC')}
          onChange={(e) => update({ sort: e.target.value === 'TRENDING_DESC' && !filters.search ? '' : e.target.value })}
          className="input h-11 w-auto min-w-40"
          aria-label={t('sortBy')}
        >
          {filters.search && <option value="SEARCH_MATCH">{label.sort('SEARCH_MATCH', locale)}</option>}
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {label.sort(s, locale)}
            </option>
          ))}
        </select>
        <div className="flex border-[3px] border-ink bg-white">
          {(
            [
              { id: 'grid', icon: LayoutGrid, label: t('gridView') },
              { id: 'list', icon: List, label: t('listView') },
              { id: 'text', icon: AlignLeft, label: t('textView') },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              onClick={() => update({ view: v.id })}
              aria-pressed={view === v.id}
              aria-label={v.label}
              title={v.label}
              className={cn('grid h-[2.6rem] w-10 place-items-center transition-colors', view === v.id ? 'bg-ink text-white' : 'hover:bg-pop-yellow')}
            >
              <v.icon className="h-4 w-4" strokeWidth={2.5} />
            </button>
          ))}
        </div>
        <button onClick={() => setSheet(true)} className="btn btn-secondary relative lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          {t('filters')}
          {activeChips.length > 0 && (
            <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center border-2 border-ink bg-pop-pink px-1 text-[11px] font-bold">
              {activeChips.length}
            </span>
          )}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="panel sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2 font-display uppercase">
                <SlidersHorizontal className="h-4 w-4" strokeWidth={2.5} />
                {t('filters')}
              </span>
              {activeChips.length > 0 && (
                <button onClick={clearAll} className="text-xs font-bold underline underline-offset-2 hover:bg-pop-yellow">
                  {t('clearAll')}
                </button>
              )}
            </div>
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex min-h-8 flex-wrap items-center gap-2">
            {activeChips.map((c) => (
              <button key={c.key} onClick={c.remove} className="chip h-8 bg-pop-mint text-xs">
                {c.label}
                <X className="h-3 w-3" />
              </button>
            ))}
            {activeChips.length > 1 && (
              <button onClick={clearAll} className="text-xs font-bold underline underline-offset-2 hover:bg-pop-yellow">
                {t('clearAll')}
              </button>
            )}
          </div>

          {query.isPending ? (
            <CardGridSkeleton count={15} className="xl:grid-cols-4 2xl:grid-cols-5" />
          ) : query.isError && items.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title={t('somethingWrong')}
              description={t('somethingWrongDesc')}
              action={
                <button onClick={() => query.refetch()} className="btn btn-primary">
                  {t('tryAgain')}
                </button>
              }
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title={t('noResults')}
              description={t('noResultsHint')}
              action={
                activeChips.length > 0 || filters.search ? (
                  <button onClick={clearAll} className="btn btn-secondary">
                    {t('clearAll')}
                  </button>
                ) : undefined
              }
            />
          ) : view === 'text' ? (
            <AnimeTextList anime={items} columns={2} />
          ) : view === 'list' ? (
            <div className="space-y-2.5">
              {items.map((a) => (
                <AnimeRow key={a.id} anime={a} />
              ))}
            </div>
          ) : (
            <div className="stagger grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {items.map((a, i) => (
                <AnimeCard key={a.id} anime={a} priority={i < 5} />
              ))}
            </div>
          )}

          <div ref={sentinel} className="h-px" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          )}
          {hasNextPage && !isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <button onClick={() => fetchNextPage()} className="btn btn-secondary">
                {t('loadMore')}
              </button>
            </div>
          )}
          {!hasNextPage && items.length > PER_PAGE && <p className="py-8 text-center text-sm text-fg-3">{t('endOfResults')}</p>}
        </div>
      </div>

      <Modal
        open={sheet}
        onClose={() => setSheet(false)}
        title={
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-accent" />
            {t('filters')}
          </span>
        }
      >
        {filterPanel}
        <div className="sticky bottom-0 -mx-5 mt-6 flex gap-2 border-t-[3px] border-ink bg-white px-5 pb-1 pt-4 sm:-mx-6 sm:px-6">
          <button onClick={clearAll} className="btn btn-ghost">
            {t('clearAll')}
          </button>
          <button onClick={() => setSheet(false)} className="btn btn-primary flex-1">
            {t('showResults')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
