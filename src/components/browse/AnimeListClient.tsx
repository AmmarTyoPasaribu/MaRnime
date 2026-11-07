'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowUp, ListOrdered, Loader2, RotateCcw, Search, X } from 'lucide-react';
import type { IndexItem, IndexPage } from '@/app/api/anime-index/route';
import { label } from '@/lib/i18n/labels';
import { cn, formatNumber } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import { useWatchlistMap, STATUS_COLOR } from '@/lib/watchlist';

const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
const ESTIMATED_PAGES = 70;
type StatusFilter = 'all' | 'RELEASING' | 'FINISHED' | 'NOT_YET_RELEASED';
type TitleLang = 'romaji' | 'english';

async function fetchPage(page: number): Promise<IndexPage> {
  const res = await fetch(`/api/anime-index?page=${page}`);
  if (!res.ok) throw new Error(`index ${res.status}`);
  return res.json();
}

function letterOf(title: string) {
  const c = title.trim().charAt(0).toUpperCase();
  return c >= 'A' && c <= 'Z' ? c : '#';
}

export default function AnimeListClient() {
  const { t, locale } = useI18n();
  const listMap = useWatchlistMap();
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [lang, setLang] = useState<TitleLang>('romaji');
  const deferredFilter = useDeferredValue(filter.trim().toLowerCase());

  const query = useInfiniteQuery({
    queryKey: ['anime-index'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 6,
    retryDelay: (n) => Math.min(2000 * 2 ** n, 20000),
  });

  // Keep pulling pages (they arrive alphabetically) until the index is complete.
  const { hasNextPage, isFetchingNextPage, isFetching, isError, fetchNextPage } = query;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching && !isError) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isFetching, isError, fetchNextPage]);

  const all = useMemo(() => {
    const seen = new Set<number>();
    const out: IndexItem[] = [];
    for (const p of query.data?.pages ?? []) {
      for (const it of p.items) {
        if (seen.has(it.i)) continue;
        seen.add(it.i);
        out.push(it);
      }
    }
    return out;
  }, [query.data]);

  const loading = !!hasNextPage || query.isPending;
  const pagesLoaded = query.data?.pages.length ?? 0;
  const progress = loading ? Math.min(96, (pagesLoaded / ESTIMATED_PAGES) * 100) : 100;

  const titleFor = (it: IndexItem) => (lang === 'english' && it.e ? it.e : it.r);

  const groups = useMemo(() => {
    const map = new Map<string, IndexItem[]>();
    for (const it of all) {
      if (status !== 'all' && it.s !== status) continue;
      const title = lang === 'english' && it.e ? it.e : it.r;
      if (deferredFilter && !it.r.toLowerCase().includes(deferredFilter) && !(it.e ?? '').toLowerCase().includes(deferredFilter)) continue;
      const key = letterOf(title);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    if (lang === 'english') for (const items of map.values()) items.sort((a, b) => (a.e || a.r).localeCompare(b.e || b.r));
    return map;
  }, [all, status, lang, deferredFilter]);

  const shownCount = [...groups.values()].reduce((n, g) => n + g.length, 0);
  // With romaji sorting, a letter is "pending" if pages before it haven't finished yet.
  const lastLoadedLetter = all.length ? letterOf(all[all.length - 1].r) : '#';
  const isPendingLetter = (l: string) => loading && lang === 'romaji' && LETTERS.indexOf(l) > LETTERS.indexOf(lastLoadedLetter);

  const statuses: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: t('all') },
    { id: 'RELEASING', label: t('ongoing') },
    { id: 'FINISHED', label: label.status('FINISHED', locale) },
    { id: 'NOT_YET_RELEASED', label: label.status('NOT_YET_RELEASED', locale) },
  ];

  return (
    <div id="az-top" className="pb-4">
      {/* Header */}
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl uppercase sm:text-4xl">
            <span className="grid h-12 w-12 rotate-[-6deg] place-items-center border-[3px] border-ink bg-pop-yellow shadow-brut-sm">
              <ListOrdered className="h-6 w-6" strokeWidth={2.5} />
            </span>
            {t('animeListTitle')}
          </h1>
          <p className="mt-2 font-bold text-fg-2" aria-live="polite">
            {loading ? t('loadingIndex', { n: formatNumber(all.length, locale) }) : t('animeListSubtitle', { n: formatNumber(all.length, locale) })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 basis-56 lg:w-72 lg:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" strokeWidth={2.5} />
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t('filterTitles')} aria-label={t('filterTitles')} className="input h-11 pl-9 pr-9" />
            {filter && (
              <button onClick={() => setFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" aria-label={t('clearAll')}>
                <X className="h-4 w-4" strokeWidth={3} />
              </button>
            )}
          </label>
          <div role="group" aria-label={t('titleLanguage')} className="flex border-[3px] border-ink bg-white text-xs font-bold">
            {(['romaji', 'english'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={cn('h-[2.45rem] px-3 transition-colors', lang === l ? 'bg-ink text-white' : 'hover:bg-pop-yellow')}>
                {l === 'romaji' ? t('romaji') : t('english')}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Status filter + progress */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statuses.map((s) => (
          <button key={s.id} onClick={() => setStatus(s.id)} data-active={status === s.id} className="chip">
            {s.id === 'RELEASING' && <span className="h-2.5 w-2.5 border-2 border-ink bg-pop-mint" />}
            {s.label}
          </button>
        ))}
        {(filter || status !== 'all') && <span className="ml-1 text-sm font-bold">{formatNumber(shownCount, locale)}</span>}
      </div>
      {loading && (
        <div className="mb-4 h-4 overflow-hidden border-[3px] border-ink bg-white" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-pop-mint transition-[width] duration-500" style={{ width: `${progress}%`, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 8px, rgba(17,17,17,.15) 8px 16px)' }} />
        </div>
      )}
      {isError && (
        <div className="mb-4 flex items-center justify-between gap-3 border-[3px] border-ink bg-pop-pink p-3 text-sm font-bold">
          {t('somethingWrongDesc')}
          <button onClick={() => (query.data ? fetchNextPage() : query.refetch())} className="btn btn-sm">
            <RotateCcw className="h-4 w-4" strokeWidth={3} />
            {t('tryAgain')}
          </button>
        </div>
      )}

      {/* Letter bar */}
      <nav aria-label={t('jumpTo')} className="glass sticky top-[68px] z-30 mb-6 p-2 shadow-brut lg:top-3">
        <div className="flex flex-wrap gap-1">
          {LETTERS.map((l) => {
            const count = groups.get(l)?.length ?? 0;
            const pending = isPendingLetter(l);
            return (
              <a
                key={l}
                href={`#az-${l === '#' ? 'num' : l}`}
                aria-disabled={!count && !pending}
                title={pending ? t('loading') : `${l} · ${count}`}
                className={cn(
                  'grid h-8 min-w-8 flex-1 place-items-center border-2 border-ink px-1 font-display text-sm transition',
                  count ? 'bg-white hover:-translate-y-0.5 hover:bg-pop-yellow hover:shadow-brut-sm' : 'pointer-events-none bg-surface-2 text-fg-3/50',
                  pending && 'animate-pulse'
                )}
              >
                {l}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Groups */}
      {query.isPending ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton mb-3 h-9 w-full" />
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 16 }).map((_, k) => (
                  <div key={k} className="skeleton h-5" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : shownCount === 0 && !loading ? (
        <p className="border-[3px] border-ink bg-white p-6 text-center font-bold shadow-brut">{t('noLetterMatches')}</p>
      ) : (
        <div className="space-y-7">
          {LETTERS.filter((l) => groups.has(l)).map((l) => {
            const items = groups.get(l)!;
            return (
              <section key={l} id={`az-${l === '#' ? 'num' : l}`} className="scroll-mt-28 lg:scroll-mt-24">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="grid h-10 min-w-10 place-items-center border-[3px] border-ink bg-pop-yellow px-2 font-display text-xl shadow-brut-sm">{l}</h2>
                  <span className="h-[3px] flex-1 bg-ink" />
                  <span className="border-2 border-ink bg-white px-2 text-xs font-bold">{items.length}</span>
                  <a href="#az-top" className="grid h-8 w-8 place-items-center border-2 border-ink bg-white transition hover:bg-pop-yellow" aria-label={t('backToTop')}>
                    <ArrowUp className="h-4 w-4" strokeWidth={3} />
                  </a>
                </div>
                <ul className="columns-1 gap-x-8 sm:columns-2 lg:columns-3 2xl:columns-4 min-[1900px]:columns-5">
                  {items.map((it) => {
                    const entry = listMap.get(it.i);
                    const title = titleFor(it);
                    return (
                      <li key={it.i} className="break-inside-avoid">
                        <Link
                          href={`/anime/${it.i}`}
                          title={lang === 'romaji' && it.e && it.e !== it.r ? it.e : it.e && lang === 'english' ? it.r : undefined}
                          className="group flex items-baseline gap-2 py-[3px] text-[13.5px] leading-snug"
                        >
                          <span aria-hidden className="mt-[5px] h-2 w-2 shrink-0 rotate-45 border-[1.5px] border-ink bg-pop-pink transition-transform group-hover:rotate-[135deg] group-hover:bg-pop-yellow" />
                          <span className="min-w-0">
                            <span className="font-medium decoration-2 underline-offset-2 group-hover:bg-pop-yellow group-hover:underline">{title}</span>
                            {it.s === 'RELEASING' && <span className="ml-1.5 whitespace-nowrap border border-ink bg-pop-mint px-1 text-[10px] font-bold uppercase">{t('ongoing')}</span>}
                            {it.s === 'NOT_YET_RELEASED' && <span className="ml-1.5 whitespace-nowrap border border-ink bg-pop-lilac px-1 text-[10px] font-bold uppercase">{label.status(it.s, locale)}</span>}
                            {it.f && it.f !== 'TV' && <span className="ml-1.5 whitespace-nowrap text-[11px] font-bold text-fg-3">{label.format(it.f, locale)}</span>}
                            {entry && <span title={label.listStatus(entry.status, locale)} className="ml-1.5 inline-block h-2.5 w-2.5 border border-ink align-middle" style={{ background: STATUS_COLOR[entry.status] }} />}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-6 font-bold">
              <Loader2 className="h-6 w-6 animate-spin" strokeWidth={3} />
              {t('loadingIndex', { n: formatNumber(all.length, locale) })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
