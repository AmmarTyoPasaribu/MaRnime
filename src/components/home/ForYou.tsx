'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wand2 } from 'lucide-react';
import { anilistFetch } from '@/lib/anilist/client';
import { FOR_YOU, LIST_GENRES } from '@/lib/anilist/queries';
import type { MediaSummary } from '@/lib/anilist/types';
import { useWatchlist } from '@/lib/watchlist';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import AnimeCarousel from '@/components/anime/AnimeCarousel';

/**
 * Personal picks: weighs the genres of everything in the user's list
 * (completed / watching and high scores count more), then fetches well-rated
 * anime in those genres that are not already in the list.
 */
export default function ForYou() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: list } = useWatchlist();

  const ids = useMemo(() => (list ?? []).map((e) => e.anime_id), [list]);
  const weights = useMemo(() => {
    const w = new Map<number, number>();
    for (const e of list ?? []) {
      const base = e.status === 'dropped' ? 0.2 : e.status === 'planning' ? 0.6 : 1;
      w.set(e.anime_id, base * (e.score ? e.score / 6 : 1));
    }
    return w;
  }, [list]);

  const { data } = useQuery({
    queryKey: ['for-you', ids.slice(0, 50).join(',')],
    enabled: !!user && ids.length > 0,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const g = await anilistFetch<{ Page: { media: { id: number; genres: string[] }[] } }>(LIST_GENRES, { ids: ids.slice(0, 50) });
      const score = new Map<string, number>();
      for (const m of g.Page.media) for (const genre of m.genres) score.set(genre, (score.get(genre) ?? 0) + (weights.get(m.id) ?? 1));
      const top = [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([genre]) => genre);
      if (!top.length) return { top, media: [] as MediaSummary[] };
      const res = await anilistFetch<{ Page: { media: MediaSummary[] } }>(FOR_YOU, { exclude: ids, genres: top });
      // Prefer titles matching more of the favourite genres.
      const media = res.Page.media
        .map((m) => ({ m, hits: m.genres.filter((x) => top.includes(x)).length }))
        .sort((a, b) => b.hits - a.hits || (b.m.averageScore ?? 0) - (a.m.averageScore ?? 0))
        .map((x) => x.m)
        .slice(0, 15);
      return { top, media };
    },
  });

  if (!user || !data?.media.length) return null;

  return (
    <AnimeCarousel
      title={t('forYou')}
      subtitle={`${t('forYouHint')}: ${data.top.join(', ')}`}
      icon={<Wand2 className="h-6 w-6" strokeWidth={2.5} />}
      anime={data.media}
    />
  );
}
