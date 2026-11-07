'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { useToast } from '@/providers/ToastProvider';
import { useSaveEntry, useWatchlist } from '@/lib/watchlist';
import { SectionHeader } from '@/components/ui/Section';

const FILLS = ['#ff5c8a', '#2de2a6', '#ffe94d', '#b9a6ff'];

export default function ContinueWatching() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const { data } = useWatchlist();
  const save = useSaveEntry();

  const watching = (data ?? []).filter((e) => e.status === 'watching').slice(0, 12);
  if (!user || watching.length === 0) return null;

  return (
    <section>
      <SectionHeader title={t('continueWatching')} icon={<Play className="h-6 w-6 fill-current" />} href="/profile?tab=watching" linkLabel={t('myList')} />
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-5 sm:px-5 lg:mx-0 lg:px-0">
        {watching.map((e, i) => {
          const total = e.anime_total_episodes;
          const pct = total ? Math.min(100, (e.episodes_watched / total) * 100) : 0;
          return (
            <div key={e.anime_id} className="flex w-[290px] shrink-0 snap-start gap-3 border-[3px] border-ink p-2.5 shadow-brut" style={{ background: i % 2 ? '#fff' : '#fffbe0' }}>
              <Link href={`/anime/${e.anime_id}`} className="relative h-[92px] w-[64px] shrink-0 overflow-hidden border-[3px] border-ink bg-surface-3">
                {e.anime_image && <Image src={e.anime_image} alt="" fill sizes="64px" className="object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <Link href={`/anime/${e.anime_id}`} className="line-clamp-2 text-sm font-bold leading-snug hover:bg-pop-yellow">
                  {e.anime_title}
                </Link>
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>
                      {t('epShort', { n: e.episodes_watched })} / {total ?? '?'}
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          await save.mutateAsync({
                            anime: { id: e.anime_id, title: e.anime_title, image: e.anime_image, episodes: total },
                            patch: { episodes_watched: e.episodes_watched + 1 },
                          });
                        } catch {
                          toast(t('actionFailed'), 'error');
                        }
                      }}
                      disabled={!!total && e.episodes_watched >= total}
                      className="inline-flex items-center gap-1 border-2 border-ink bg-pop-mint px-1.5 py-0.5 transition hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-40"
                      title={t('plusOneEpisode')}
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={3} />1 ep
                    </button>
                  </div>
                  <div className="mt-1.5 h-3 border-2 border-ink bg-white">
                    <div className="h-full transition-[width] duration-500" style={{ width: `${pct}%`, background: FILLS[i % FILLS.length] }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
