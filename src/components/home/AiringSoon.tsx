'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Radio } from 'lucide-react';
import { anilistFetch } from '@/lib/anilist/client';
import { AIRING_SCHEDULE } from '@/lib/anilist/queries';
import type { AiringScheduleItem } from '@/lib/anilist/types';
import { titleOf } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';
import { useDisplayMode } from '@/providers/DisplayModeProvider';
import Countdown from '@/components/ui/Countdown';
import { SectionHeader } from '@/components/ui/Section';

function useAiringSoon() {
  return useQuery({
    queryKey: ['airing-soon'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const now = Math.floor(Date.now() / 1000);
      const res = await anilistFetch<{ Page: { airingSchedules: AiringScheduleItem[] } }>(AIRING_SCHEDULE, { from: now, to: now + 86400, page: 1 });
      return res.Page.airingSchedules.filter((s) => !s.media.isAdult);
    },
  });
}

/** Horizontal strip (main column) — hidden on wide screens where the rail shows instead. */
export default function AiringSoon() {
  const { t, locale } = useI18n();
  const { mode } = useDisplayMode();
  const { data, isLoading } = useAiringSoon();
  if (!isLoading && (!data || data.length === 0)) return null;
  const fmt = new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <section>
      <SectionHeader title={t('airingSoon')} icon={<Radio className="h-6 w-6" strokeWidth={2.5} />} href="/schedule" linkLabel={t('schedule')} />
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-5 sm:px-5 lg:mx-0 lg:px-0">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-[96px] w-[260px] shrink-0" />)
          : data!.map((s) => (
              <Link key={s.id} href={`/anime/${s.media.id}`} className="panel panel-hover flex w-[260px] shrink-0 snap-start items-center gap-3 p-2.5">
                {mode === 'card' && (
                  <span className="relative h-[72px] w-[50px] shrink-0 overflow-hidden border-2 border-ink">
                    <Image src={s.media.coverImage.medium} alt="" fill sizes="50px" className="object-cover" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-bold">{titleOf(s.media.title)}</span>
                  <span className="mt-0.5 block text-xs font-medium text-fg-3">
                    {t('epShort', { n: s.episode })} · {fmt.format(new Date(s.airingAt * 1000))}
                  </span>
                  <Countdown to={s.airingAt} className="mt-1 inline-block bg-ink px-1.5 text-sm font-bold text-pop-yellow" />
                </span>
              </Link>
            ))}
      </div>
    </section>
  );
}

/** Vertical rail card for wide screens ("Jadwal Hari Ini"). */
export function AiringRail() {
  const { t, locale } = useI18n();
  const { data, isLoading } = useAiringSoon();
  const fmt = new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const today = new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date());

  return (
    <section className="border-[3px] border-ink bg-pop-mint p-4 shadow-brut">
      <h2 className="flex items-center gap-2 font-display text-xl uppercase">
        <CalendarDays className="h-5 w-5" strokeWidth={2.5} />
        {t('todaySchedule')}
      </h2>
      <p className="mb-3 text-sm font-bold" suppressHydrationWarning>
        {today}
      </p>
      <ol className="flex flex-col gap-2.5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <li key={i} className="skeleton h-14" />)
          : (data ?? []).slice(0, 8).map((s) => (
              <li key={s.id}>
                <Link href={`/anime/${s.media.id}`} className="flex items-center gap-2.5 border-[3px] border-ink bg-white p-2 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm">
                  <span className="shrink-0 border-2 border-ink bg-pop-yellow px-1.5 py-0.5 text-xs font-bold tabular-nums" suppressHydrationWarning>
                    {fmt.format(new Date(s.airingAt * 1000))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-bold">{titleOf(s.media.title)}</span>
                    <span className="text-xs font-medium">
                      {t('epShort', { n: s.episode })} · <Countdown to={s.airingAt} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
        {!isLoading && !data?.length && <li className="text-sm font-bold">{t('noneToday')}</li>}
      </ol>
      <Link href="/schedule" className="btn btn-sm mt-4 w-full">
        {t('fullSchedule')}
      </Link>
    </section>
  );
}
