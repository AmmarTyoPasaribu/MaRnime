const ANILIST_API = 'https://graphql.anilist.co';

export class AniListError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AniListError';
    this.status = status;
  }
}

interface GraphQLResponse<T> {
  data: T | null;
  errors?: { message: string; status?: number }[];
}

interface FetchOptions {
  /** Seconds to keep the response in Next's data cache (server only). */
  revalidate?: number;
  signal?: AbortSignal;
  retries?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Typed AniList GraphQL fetcher.
 * - Retries on 429 (honouring Retry-After), 5xx and network errors.
 * - Never retries client errors such as "Not Found" (404).
 * - Works on both server (cached via Next data cache) and browser.
 */
export async function anilistFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  { revalidate = 600, signal, retries = 2 }: FetchOptions = {}
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(ANILIST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables }),
        signal,
        ...(typeof window === 'undefined' ? { next: { revalidate } } : {}),
      });

      if (response.status === 429) {
        const wait = Math.min(parseInt(response.headers.get('Retry-After') || '3', 10) || 3, 10);
        lastError = new AniListError('Rate limited by AniList. Please try again shortly.', 429);
        if (attempt < retries) {
          await sleep(wait * 1000);
          continue;
        }
        throw lastError;
      }

      const json = (await response.json().catch(() => null)) as GraphQLResponse<T> | null;

      if (json?.errors?.length) {
        const status = json.errors[0].status ?? response.status;
        throw new AniListError(json.errors.map((e) => e.message).join(', '), status);
      }
      if (!response.ok || !json?.data) {
        throw new AniListError(`AniList API error: ${response.status}`, response.status);
      }
      return json.data;
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error instanceof Error ? error : new Error(String(error));
      const status = error instanceof AniListError ? error.status : 0;
      const retryable = status === 0 || status === 429 || status >= 500;
      if (!retryable || attempt >= retries) break;
      await sleep(700 * (attempt + 1));
    }
  }

  throw lastError ?? new Error('Failed to fetch from AniList');
}

export function isNotFound(error: unknown) {
  return error instanceof AniListError && error.status === 404;
}
