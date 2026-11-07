'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export type ListStatus = 'watching' | 'planning' | 'completed' | 'on_hold' | 'dropped';
export const LIST_STATUSES: ListStatus[] = ['watching', 'planning', 'completed', 'on_hold', 'dropped'];

export const STATUS_COLOR: Record<ListStatus, string> = {
  watching: '#34d399',
  planning: '#60a5fa',
  completed: '#a78bfa',
  on_hold: '#fbbf24',
  dropped: '#f87171',
};

export interface WatchlistEntry {
  id: string;
  user_id: string;
  anime_id: number;
  anime_title: string;
  anime_image: string | null;
  anime_total_episodes: number | null;
  status: ListStatus;
  score: number | null;
  episodes_watched: number;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FavoriteEntry {
  id: string;
  anime_id: number;
  anime_title: string;
  anime_image: string | null;
  created_at: string;
}

export interface AnimeRef {
  id: number;
  title: string;
  image: string | null;
  episodes: number | null;
}

export type EntryPatch = Partial<
  Pick<WatchlistEntry, 'status' | 'score' | 'episodes_watched' | 'notes' | 'started_at' | 'completed_at'>
>;

const today = () => new Date().toISOString().slice(0, 10);

function requireClient() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

// ------------------------------------------------------------------ queries

export function useWatchlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['watchlist', user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await requireClient()
        .from('watchlist')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as WatchlistEntry[];
    },
  });
}

export function useWatchlistMap() {
  const { data } = useWatchlist();
  return useMemo(() => new Map((data ?? []).map((e) => [e.anime_id, e])), [data]);
}

export function useWatchlistEntry(animeId: number) {
  const query = useWatchlist();
  const entry = useMemo(() => query.data?.find((e) => e.anime_id === animeId) ?? null, [query.data, animeId]);
  return { entry, isLoading: query.isLoading };
}

export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['favorites', user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await requireClient()
        .from('favorites')
        .select('id, anime_id, anime_title, anime_image, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as FavoriteEntry[];
    },
  });
}

// ---------------------------------------------------------------- mutations

/** Fill in sensible dates / progress when the status changes. */
export function applyAutomations(prev: WatchlistEntry | null, patch: EntryPatch, total: number | null): EntryPatch {
  const next: EntryPatch = { ...patch };

  // Logging an episode of something you only planned means you're watching it.
  if (prev?.status === 'planning' && patch.episodes_watched && patch.status === undefined) {
    next.status = 'watching';
  }
  if (next.episodes_watched != null) {
    next.episodes_watched = Math.max(0, total ? Math.min(next.episodes_watched, total) : next.episodes_watched);
  }
  // Reaching the final episode completes the show.
  const status = next.status ?? prev?.status;
  if (total && next.episodes_watched === total && status === 'watching' && patch.status === undefined) {
    next.status = 'completed';
  }

  const finalStatus = next.status ?? prev?.status;
  const episodes = next.episodes_watched ?? prev?.episodes_watched ?? 0;
  if (finalStatus === 'completed') {
    if (total && episodes < total && patch.episodes_watched === undefined) next.episodes_watched = total;
    if (!prev?.completed_at && next.completed_at === undefined) next.completed_at = today();
  }
  if ((finalStatus === 'watching' || finalStatus === 'completed') && !prev?.started_at && next.started_at === undefined) {
    next.started_at = today();
  }
  return next;
}

export function useSaveEntry() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ['watchlist', user?.id];

  return useMutation({
    mutationFn: async ({ anime, patch }: { anime: AnimeRef; patch: EntryPatch }) => {
      if (!user) throw new Error('Not signed in');
      const prev = (qc.getQueryData<WatchlistEntry[]>(key) ?? []).find((e) => e.anime_id === anime.id) ?? null;
      const final = applyAutomations(prev, patch, anime.episodes);
      const row = {
        user_id: user.id,
        anime_id: anime.id,
        anime_title: anime.title,
        anime_image: anime.image,
        anime_total_episodes: anime.episodes,
        status: final.status ?? prev?.status ?? 'planning',
        ...final,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await requireClient()
        .from('watchlist')
        .upsert(row, { onConflict: 'user_id,anime_id' })
        .select('*')
        .single();
      if (error) throw error;
      return data as WatchlistEntry;
    },
    onMutate: async ({ anime, patch }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WatchlistEntry[]>(key);
      if (previous) {
        const prev = previous.find((e) => e.anime_id === anime.id) ?? null;
        const final = applyAutomations(prev, patch, anime.episodes);
        const optimistic: WatchlistEntry = {
          id: prev?.id ?? `tmp-${anime.id}`,
          user_id: user?.id ?? '',
          anime_id: anime.id,
          anime_title: anime.title,
          anime_image: anime.image,
          anime_total_episodes: anime.episodes,
          status: 'planning',
          score: null,
          episodes_watched: 0,
          notes: null,
          started_at: null,
          completed_at: null,
          created_at: new Date().toISOString(),
          ...prev,
          ...final,
          updated_at: new Date().toISOString(),
        } as WatchlistEntry;
        qc.setQueryData<WatchlistEntry[]>(key, [optimistic, ...previous.filter((e) => e.anime_id !== anime.id)]);
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSuccess: (saved) => {
      qc.setQueryData<WatchlistEntry[]>(key, (all) =>
        all ? [saved, ...all.filter((e) => e.anime_id !== saved.anime_id)] : [saved]
      );
    },
  });
}

export function useRemoveEntry() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ['watchlist', user?.id];

  return useMutation({
    mutationFn: async (animeId: number) => {
      if (!user) throw new Error('Not signed in');
      const { error } = await requireClient().from('watchlist').delete().eq('user_id', user.id).eq('anime_id', animeId);
      if (error) throw error;
    },
    onMutate: async (animeId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WatchlistEntry[]>(key);
      qc.setQueryData<WatchlistEntry[]>(key, (all) => all?.filter((e) => e.anime_id !== animeId));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
  });
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ['favorites', user?.id];

  return useMutation({
    mutationFn: async ({ anime, favorite }: { anime: AnimeRef; favorite: boolean }) => {
      if (!user) throw new Error('Not signed in');
      const supabase = requireClient();
      if (favorite) {
        const { error } = await supabase
          .from('favorites')
          .upsert(
            { user_id: user.id, anime_id: anime.id, anime_title: anime.title, anime_image: anime.image },
            // DO NOTHING on conflict: favorites has no UPDATE RLS policy.
            { onConflict: 'user_id,anime_id', ignoreDuplicates: true }
          );
        if (error) throw error;
      } else {
        const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('anime_id', anime.id);
        if (error) throw error;
      }
    },
    onMutate: async ({ anime, favorite }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<FavoriteEntry[]>(key);
      qc.setQueryData<FavoriteEntry[]>(key, (all = []) =>
        favorite
          ? [
              {
                id: `tmp-${anime.id}`,
                anime_id: anime.id,
                anime_title: anime.title,
                anime_image: anime.image,
                created_at: new Date().toISOString(),
              },
              ...all,
            ]
          : all.filter((f) => f.anime_id !== anime.id)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
