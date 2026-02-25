import { anilistFetch } from '@/lib/anilist/client';
import { HOMEPAGE_QUERY } from '@/lib/anilist/queries';
import { getCurrentSeason } from '@/lib/utils';
import type { Media } from '@/lib/anilist/types';
import HomePageClient from '@/components/home/HomePageClient';

interface HomepageData {
  trending: { media: Media[] };
  popular: { media: Media[] };
  topRated: { media: Media[] };
  seasonal: { media: Media[] };
  upcoming: { media: Media[] };
}

export const revalidate = 300;

export default async function HomePage() {
  const { season, year } = getCurrentSeason();

  const data = await anilistFetch<HomepageData>(HOMEPAGE_QUERY, {
    season,
    seasonYear: year,
  });

  return (
    <HomePageClient
      trending={data.trending.media}
      seasonal={data.seasonal.media}
      popular={data.popular.media}
      topRated={data.topRated.media}
      upcoming={data.upcoming.media}
      season={season}
      year={year}
    />
  );
}
