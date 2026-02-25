const ANILIST_API = 'https://graphql.anilist.co';

interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string; status: number }[];
}

export async function anilistFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  retries = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(ANILIST_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, retryAfter * 1000));
            continue;
          }
          throw new Error(`Rate limited. Please try again later.`);
        }
        throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
      }

      const json: GraphQLResponse<T> = await response.json();

      if (json.errors) {
        throw new Error(json.errors.map((e) => e.message).join(', '));
      }

      return json.data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to fetch from AniList');
}
