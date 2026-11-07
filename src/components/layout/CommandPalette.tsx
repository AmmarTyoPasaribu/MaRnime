'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Clock, Compass, CornerDownLeft, ListOrdered, Loader2, Search, Sparkles, Trophy, X } from 'lucide-react';
import { anilistFetch } from '@/lib/anilist/client';
import { QUICK_SEARCH } from '@/lib/anilist/queries';
import type { MediaCoverImage, MediaTitle } from '@/lib/anilist/types';
import { label } from '@/lib/i18n/labels';
import { cn, formatScore, titleOf } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';

interface QuickResult {
  id: number;
  title: MediaTitle;
  coverImage: Pick<MediaCoverImage, 'medium' | 'color'>;
  format: string | null;
  status: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  episodes: number | null;
}

const RECENT_KEY = 'marnime-recent-searches';

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function useDebounced<T>(value: T, delay: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (typeof document === 'undefined') return null;
  // The body mounts fresh on every open, so its state always starts clean.
  return createPortal(<AnimatePresence>{open && <PaletteBody key="palette" onClose={onClose} />}</AnimatePresence>, document.body);
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(readRecent);
  const debounced = useDebounced(query.trim(), 350);

  const { data, isFetching } = useQuery({
    queryKey: ['quick-search', debounced],
    enabled: debounced.length >= 2,
    staleTime: 10 * 60 * 1000,
    queryFn: ({ signal }) =>
      anilistFetch<{ Page: { media: QuickResult[] } }>(QUICK_SEARCH, { search: debounced }, { signal, retries: 1 }).then(
        (d) => d.Page.media
      ),
  });

  // Highlighted row resets whenever the result set changes.
  const listKey = `${debounced}|${data?.length ?? 0}`;
  const [cursor, setCursor] = useState({ key: listKey, i: 0 });
  const active = cursor.key === listKey ? cursor.i : 0;
  const setActive = (next: number | ((i: number) => number)) =>
    setCursor((c) => ({ key: listKey, i: typeof next === 'function' ? next(c.key === listKey ? c.i : 0) : next }));

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const remember = (q: string) => {
    const next = [q, ...readRecent().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
    setRecent(next);
  };

  const quickLinks = useMemo(
    () => [
      { href: '/browse', label: t('browse'), icon: Compass },
      { href: '/seasonal', label: t('seasonal'), icon: Sparkles },
      { href: '/schedule', label: t('schedule'), icon: CalendarDays },
      { href: '/top', label: t('top'), icon: Trophy },
      { href: '/anime-list', label: t('animeList'), icon: ListOrdered },
    ],
    [t]
  );

  const showResults = debounced.length >= 2;
  const results = useMemo(() => (showResults ? data ?? [] : []), [showResults, data]);

  type Item = { key: string; run: () => void };
  const items: Item[] = useMemo(() => {
    const go = (href: string) => () => {
      onClose();
      setQuery('');
      router.push(href);
    };
    if (showResults) {
      const list: Item[] = results.map((r) => ({
        key: `a-${r.id}`,
        run: () => {
          remember(query.trim());
          go(`/anime/${r.id}`)();
        },
      }));
      list.push({
        key: 'all',
        run: () => {
          remember(query.trim());
          go(`/browse?search=${encodeURIComponent(query.trim())}`)();
        },
      });
      return list;
    }
    return [
      ...recent.map((r) => ({ key: `r-${r}`, run: () => setQuery(r) })),
      ...quickLinks.map((l) => ({ key: `l-${l.href}`, run: go(l.href) })),
    ];
  }, [showResults, results, recent, quickLinks, query, router, onClose]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[active]) items[active].run();
      else if (query.trim()) {
        remember(query.trim());
        onClose();
        router.push(`/browse?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const itemProps = (i: number) => ({
    'data-index': i,
    'aria-current': active === i ? ('true' as const) : undefined,
    onMouseMove: () => setActive(i),
    onClick: () => items[i]?.run(),
    className: cn(
      'flex w-full items-center gap-3 border-2 px-3 py-2.5 text-left transition-colors',
      active === i ? 'border-ink bg-pop-yellow text-ink' : 'border-transparent text-fg-2'
    ),
  });

  return (
        <div className="fixed inset-0 z-[95] flex items-start justify-center px-3 pt-[8vh] sm:pt-[12vh]" onKeyDown={onKeyDown}>
          <motion.div
            className="absolute inset-0 bg-ink/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('search')}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="relative z-10 flex max-h-[76vh] w-full max-w-2xl flex-col overflow-hidden border-[3px] border-ink bg-white shadow-[8px_8px_0_#111]"
          >
            <div className="flex items-center gap-3 border-b-[3px] border-ink bg-pop-yellow px-4 sm:px-5">
              {isFetching ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : <Search className="h-5 w-5" strokeWidth={3} />}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="h-16 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-ink/50 sm:text-lg"
                aria-label={t('search')}
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button onClick={() => setQuery('')} className="icon-btn h-8 w-8" aria-label={t('clearRecent')}>
                  <X className="h-4 w-4" />
                </button>
              )}
              <button onClick={onClose} className="kbd hidden sm:inline-flex">
                ESC
              </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-2">
              {showResults ? (
                <>
                  {results.map((r, i) => (
                    <button key={r.id} {...itemProps(i)}>
                      <span className="relative h-14 w-10 shrink-0 overflow-hidden border-2 border-ink bg-surface-2">
                        <Image src={r.coverImage.medium} alt="" fill sizes="40px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 font-bold text-ink">{titleOf(r.title)}</span>
                        <span className="line-clamp-1 text-xs text-fg-3">
                          {[label.format(r.format, locale), r.seasonYear, label.status(r.status, locale)].filter(Boolean).join(' · ')}
                          {r.title.native ? ` · ${r.title.native}` : ''}
                        </span>
                      </span>
                      {r.averageScore ? (
                        <span className="border-2 border-ink bg-white px-1.5 text-sm font-bold">★ {formatScore(r.averageScore)}</span>
                      ) : null}
                    </button>
                  ))}
                  {!isFetching && results.length === 0 && (
                    <p className="px-3 py-8 text-center text-sm text-fg-3">{t('noMatches', { q: debounced })}</p>
                  )}
                  <button {...itemProps(results.length)}>
                    <span className="grid h-10 w-10 place-items-center border-2 border-ink bg-pop-mint">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium">{t('seeAllResults', { q: query.trim() })}</span>
                  </button>
                </>
              ) : (
                <>
                  {recent.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between px-3 pb-1 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ink">{t('recentSearches')}</span>
                        <button
                          className="text-xs text-fg-3 hover:text-fg"
                          onClick={() => {
                            try {
                              localStorage.removeItem(RECENT_KEY);
                            } catch {}
                            setRecent([]);
                          }}
                        >
                          {t('clearRecent')}
                        </button>
                      </div>
                      {recent.map((r, i) => (
                        <button key={r} {...itemProps(i)}>
                          <Clock className="h-4 w-4 text-fg-3" />
                          <span className="text-sm">{r}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-ink">{t('quickLinks')}</div>
                  {quickLinks.map((l, i) => (
                    <button key={l.href} {...itemProps(recent.length + i)}>
                      <span className="grid h-9 w-9 place-items-center border-2 border-ink bg-white">
                        <l.icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">{l.label}</span>
                    </button>
                  ))}
                  <p className="px-3 pb-2 pt-4 text-xs text-fg-3">{t('searchHint')}</p>
                </>
              )}
            </div>

            <div className="hidden items-center gap-4 border-t-[3px] border-ink px-5 py-2.5 text-xs font-bold sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="kbd">↑</span>
                <span className="kbd">↓</span> {t('toNavigate')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="kbd">
                  <CornerDownLeft className="h-3 w-3" />
                </span>
                {t('toSelect')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="kbd">esc</span> {t('toClose')}
              </span>
            </div>
          </motion.div>
        </div>
  );
}
