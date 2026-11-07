'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, CalendarX2, ListVideo } from 'lucide-react';
import { anilistFetch } from '@/lib/anilist/client';
import { AIRING_SCHEDULE } from '@/lib/anilist/queries';
import type { AiringScheduleItem, PageInfo } from '@/lib/anilist/types';
import { label } from '@/lib/i18n/labels';
import { cn, titleOf } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useDisplayMode } from '@/providers/DisplayModeProvider';
import { useWatchlistMap, STATUS_COLOR } from '@/lib/watchlist';
import Countdown, { useNow } from '@/components/ui/Countdown';
import { EmptyState } from '@/components/ui/Section';

const DAY_FILLS = ['#ffe94d', '#2de2a6', '#ff5c8a', '#b9a6ff', '#ff9f45', '#a8d8ff', '#ffffff'];

function startOfToday() {
  const x = new Date();
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}
const noop = () => () => {};

async function fetchWeek(from: number, to: number) {
  const all: AiringScheduleItem[] = [];
  for (let page = 1; page <= 8; page++) {
    const data = await anilistFetch<{ Page: { pageInfo: PageInfo; airingSchedules: AiringScheduleItem[] } }>(AIRING_SCHEDULE, { from, to, page });
    all.push(...data.Page.airingSchedules);
    if (!data.Page.pageInfo.hasNextPage) break;
  }
  return all.filter((s) => !s.media.isAdult);
}

export default function ScheduleClient() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { mode } = useDisplayMode();
  const listMap = useWatchlistMap();
  const now = useNow(60_000);
  const [day, setDay] = useState(0);
  const [mineOnly, setMineOnly] = useState(false);
  // Local midnight only exists in the browser (time zone), so read it client-side.
  const startMs = useSyncExternalStore(noop, startOfToday, () => null);

  const from = startMs ? Math.floor(startMs / 1000) - 1 : 0;
  const to = from + 7 * 86400 + 1;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['schedule-week', from],
    enabled: !!startMs,
    staleTime: 15 * 60 * 1000,
    queryFn: () => fetchWeek(from, to),
  });

  const tag = locale === 'id' ? 'id-ID' : 'en-US';
  const days = useMemo(() => {
    if (!startMs) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startMs);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startMs]);

  const grouped = useMemo(() => {
    const map: AiringScheduleItem[][] = Array.from({ length: 7 }, () => []);
    if (!startMs || !data) return map;
    for (const s of data) {
      if (mineOnly && !listMap.has(s.media.id)) continue;
      const d = new Date(s.airingAt * 1000);
      d.setHours(0, 0, 0, 0);
      const idx = Math.round((d.getTime() - startMs) / 86400000);
      if (idx >= 0 && idx < 7) map[idx].push(s);
    }
    return map;
  }, [data, startMs, mineOnly, listMap]);

  const timeFmt = new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit' });
  const dayName = (d: Date, i: number) => (i === 0 ? t('today') : i === 1 ? t('tomorrow') : new Intl.DateTimeFormat(tag, { weekday: 'long' }).format(d));
  const tz = startMs ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';
  const items = grouped[day] ?? [];

  return (
    <div className="pb-4">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl uppercase sm:text-4xl">
            <span className="grid h-12 w-12 rotate-[-6deg] place-items-center border-[3px] border-ink bg-pop-mint shadow-brut-sm">
              <CalendarDays className="h-6 w-6" strokeWidth={2.5} />
            </span>
            {t('scheduleTitle')}
          </h1>
          <p className="mt-2 font-medium text-fg-2">
            {t('scheduleSubtitle')} {tz && <span className="text-xs font-bold">· {t('timezoneNote', { tz })}</span>}
          </p>
        </div>
        {user && (
          <button onClick={() => setMineOnly((m) => !m)} data-active={mineOnly} className="chip h-10 self-start sm:self-auto">
            <ListVideo className="h-4 w-4" strokeWidth={2.5} />
            {t('myList')}
          </button>
        )}
      </header>

      {isError ? (
        <EmptyState
          icon={<CalendarX2 className="h-6 w-6" />}
          title={t('somethingWrong')}
          description={t('somethingWrongDesc')}
          action={
            <button onClick={() => refetch()} className="btn btn-primary">
              {t('tryAgain')}
            </button>
          }
        />
      ) : mode === 'text' ? (
        /* ---------- Text mode: the whole week at once ---------- */
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {(days.length ? days : Array.from({ length: 7 }, () => null)).map((d, i) => (
            <section key={i} className="self-start border-[3px] border-ink bg-white shadow-brut">
              <h2 className="flex items-center justify-between border-b-[3px] border-ink px-3 py-2 font-display text-lg uppercase" style={{ background: DAY_FILLS[i] }}>
                {d ? dayName(d, i) : <span className="skeleton h-5 w-24" />}
                <span className="bg-ink px-1.5 font-sans text-xs font-bold text-white">{grouped[i]?.length ?? 0}</span>
              </h2>
              {isPending ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 4 }).map((_, k) => (
                    <div key={k} className="skeleton h-5" />
                  ))}
                </div>
              ) : grouped[i].length === 0 ? (
                <p className="p-3 text-sm font-bold text-fg-3">{t('noSchedule')}</p>
              ) : (
                <ul className="[&>li:last-child_a]:border-b-0">
                  {grouped[i].map((s) => {
                    const aired = now != null && s.airingAt <= now;
                    const entry = listMap.get(s.media.id);
                    return (
                      <li key={s.id}>
                        <Link href={`/anime/${s.media.id}`} className={cn('text-row items-center py-2', aired && 'text-fg-3')}>
                          <span className="w-[4.25rem] shrink-0 whitespace-nowrap text-xs font-bold tabular-nums">{timeFmt.format(new Date(s.airingAt * 1000))}</span>
                          <span className="min-w-0 flex-1 text-sm leading-snug">
                            {titleOf(s.media.title)} <span className="whitespace-nowrap text-xs text-fg-3">· {t('epShort', { n: s.episode })}</span>
                          </span>
                          {entry && <span className="h-3 w-3 shrink-0 border-2 border-ink" style={{ background: STATUS_COLOR[entry.status] }} />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      ) : (
        /* ---------- Card mode: one day at a time, timeline ---------- */
        <>
          <div className="glass no-scrollbar sticky top-[68px] z-30 mb-6 flex gap-2 overflow-x-auto p-2 shadow-brut lg:top-3">
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => setDay(i)}
                aria-pressed={day === i}
                className={cn('flex min-w-[92px] flex-1 flex-col items-center border-[3px] px-3 py-1.5 transition', day === i ? 'border-ink bg-ink text-white' : 'border-transparent hover:border-ink hover:bg-pop-yellow')}
              >
                <span className="text-xs font-bold uppercase">{i < 2 ? dayName(d, i) : new Intl.DateTimeFormat(tag, { weekday: 'short' }).format(d)}</span>
                <span className="text-[11px] font-medium">
                  {new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short' }).format(d)} · {grouped[i]?.length ?? 0}
                </span>
              </button>
            ))}
            {!startMs && Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton h-12 min-w-[92px] flex-1" />)}
          </div>

          {isPending ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-24" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon={<CalendarX2 className="h-6 w-6" />} title={t('noSchedule')} />
          ) : (
            <ol className="stagger relative space-y-4 before:absolute before:bottom-2 before:left-[5.25rem] before:top-2 before:w-[3px] before:bg-ink sm:before:left-[6.75rem]">
              {items.map((s) => {
                const aired = now != null && s.airingAt <= now;
                const entry = listMap.get(s.media.id);
                return (
                  <li key={s.id} className={cn('relative flex items-center gap-3 sm:gap-5', aired && 'opacity-60')}>
                    <time className="w-16 shrink-0 whitespace-nowrap text-right font-display text-xs tabular-nums sm:w-20 sm:text-base">
                      {timeFmt.format(new Date(s.airingAt * 1000))}
                    </time>
                    <span className={cn('relative z-10 h-4 w-4 shrink-0 rotate-45 border-[3px] border-ink', aired ? 'bg-white' : 'bg-pop-pink')} />
                    <Link href={`/anime/${s.media.id}`} className="panel panel-hover group flex min-w-0 flex-1 items-center gap-3 p-2.5 sm:gap-4">
                      <span className="relative h-20 w-14 shrink-0 overflow-hidden border-2 border-ink">
                        <Image src={s.media.coverImage.medium} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 font-bold">
                          <span className="card-title group-hover:bg-pop-yellow">{titleOf(s.media.title)}</span>
                        </span>
                        <span className="mt-0.5 block text-xs font-medium text-fg-3">
                          {t('epShort', { n: s.episode })}
                          {s.media.episodes ? ` / ${s.media.episodes}` : ''} · {label.format(s.media.format, locale)}
                          {s.media.studios.nodes[0] ? ` · ${s.media.studios.nodes[0].name}` : ''}
                        </span>
                        {entry && (
                          <span className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold">
                            <span className="h-3 w-3 border-2 border-ink" style={{ background: STATUS_COLOR[entry.status] }} />
                            {label.listStatus(entry.status, locale)}
                          </span>
                        )}
                      </span>
                      <span className="hidden shrink-0 text-right sm:block">
                        {aired ? (
                          <span className="border-2 border-ink bg-white px-2 py-0.5 text-xs font-bold">{t('airedAgo')}</span>
                        ) : (
                          <Countdown to={s.airingAt} className="border-2 border-ink bg-pop-yellow px-2 py-0.5 text-sm font-bold" />
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
