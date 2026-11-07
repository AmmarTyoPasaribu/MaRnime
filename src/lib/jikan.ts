// Jikan (unofficial MyAnimeList API) — used to enrich AniList data with
// MAL score/rank, age rating, broadcast slot, producers, OP/ED themes and
// the full episode list. Every call is optional: failures resolve to null so
// the page never breaks when Jikan is slow or unreachable.

const JIKAN_API = 'https://api.jikan.moe/v4';

export interface MalAnime {
  mal_id: number;
  url: string;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  rating: string | null;
  broadcast: { string: string | null } | null;
  producers: { mal_id: number; name: string }[];
  licensors: { mal_id: number; name: string }[];
  theme: { openings: string[]; endings: string[] } | null;
  streaming: { name: string; url: string }[] | null;
}

export interface MalEpisode {
  mal_id: number;
  title: string | null;
  title_japanese: string | null;
  title_romanji: string | null;
  aired: string | null;
  score: number | null;
  filler: boolean;
  recap: boolean;
}

// Simple circuit breaker: after a network failure/timeout, skip Jikan for a
// few minutes instead of making every page view wait for another timeout.
let jikanDownUntil = 0;

async function jikanFetch<T>(path: string, revalidate = 86400): Promise<T | null> {
  if (Date.now() < jikanDownUntil) return null;
  try {
    const res = await fetch(`${JIKAN_API}${path}`, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate },
    });
    if (res.status >= 500) jikanDownUntil = Date.now() + 2 * 60_000;
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    jikanDownUntil = Date.now() + 5 * 60_000;
    return null;
  }
}

export function getMalAnime(idMal: number) {
  return jikanFetch<MalAnime>(`/anime/${idMal}/full`);
}

export async function getMalEpisodes(idMal: number) {
  const data = await jikanFetch<MalEpisode[]>(`/anime/${idMal}/episodes?page=1`, 43200);
  return data && data.length > 0 ? data : null;
}

/** Turn `1: "Guren no Yumiya" by Linked Horizon (eps 1-13)` into parts. */
export function parseTheme(raw: string) {
  const match = raw.match(/^(?:(\d+):\s*)?"?(.+?)"?\s+by\s+(.+?)(?:\s+\((eps?[^)]*)\))?\s*$/i);
  if (!match) return { index: null, title: raw.replace(/"/g, ''), artist: null, episodes: null };
  const [, index, title, artist, episodes] = match;
  return {
    index: index ? Number(index) : null,
    title: title.replace(/^"|"$/g, ''),
    artist: artist.trim(),
    episodes: episodes ?? null,
  };
}
