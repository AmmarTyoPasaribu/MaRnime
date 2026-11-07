import type { MetadataRoute } from 'next';
import { anilistFetch } from '@/lib/anilist/client';
import { siteConfig } from '@/lib/site';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticRoutes: MetadataRoute.Sitemap = ['', '/browse', '/seasonal', '/schedule', '/top', '/anime-list'].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.8,
  }));

  try {
    const data = await anilistFetch<{ Page: { media: { id: number }[] } }>(
      `query { Page(page: 1, perPage: 50) { media(type: ANIME, isAdult: false, sort: POPULARITY_DESC) { id } } }`,
      {},
      { revalidate: 86400 }
    );
    return [
      ...staticRoutes,
      ...data.Page.media.map((m) => ({ url: `${base}/anime/${m.id}`, changeFrequency: 'weekly' as const, priority: 0.6 })),
    ];
  } catch {
    return staticRoutes;
  }
}
