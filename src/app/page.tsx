import { Clapperboard, Crown, Flame, Rocket, Sparkles } from 'lucide-react';
import { anilistFetch } from '@/lib/anilist/client';
import { HOMEPAGE_QUERY } from '@/lib/anilist/queries';
import type { MediaSummary } from '@/lib/anilist/types';
import { getCurrentSeason, shiftSeason, slimMedia } from '@/lib/utils';
import { getI18n } from '@/lib/i18n/server';
import { label } from '@/lib/i18n/labels';
import HeroBanner from '@/components/anime/HeroBanner';
import AnimeCarousel from '@/components/anime/AnimeCarousel';
import TopTenPanel from '@/components/home/TopTenPanel';
import GenreGrid from '@/components/home/GenreGrid';
import ContinueWatching from '@/components/home/ContinueWatching';
import AiringSoon, { AiringRail } from '@/components/home/AiringSoon';
import ForYou from '@/components/home/ForYou';

interface HomepageData {
  trending: { media: MediaSummary[] };
  seasonal: { media: MediaSummary[] };
  nextSeason: { media: MediaSummary[] };
  popular: { media: MediaSummary[] };
  top: { media: MediaSummary[] };
  movies: { media: MediaSummary[] };
}

export default async function HomePage() {
  const { t, locale } = await getI18n();
  const { season, year } = getCurrentSeason();
  const next = shiftSeason(season, year, 1);

  const data = await anilistFetch<HomepageData>(
    HOMEPAGE_QUERY,
    { season, seasonYear: year, nextSeason: next.season, nextYear: next.year },
    { revalidate: 600 }
  );

  // Prefer trending titles with a wide banner for the hero.
  const hero = [...data.trending.media]
    .sort((a, b) => Number(!!b.bannerImage) - Number(!!a.bannerImage))
    .slice(0, 6)
    .map((m) => slimMedia(m, 300));
  const slim = (list: MediaSummary[]) => list.map((m) => slimMedia(m));
  const top = slim(data.top.media);

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_310px] xl:gap-8">
      <div className="min-w-0 space-y-14">
        <HeroBanner anime={hero} />
        <ContinueWatching />
        <AnimeCarousel title={t('trendingNow')} icon={<Flame className="h-6 w-6" strokeWidth={2.5} />} anime={slim(data.trending.media)} href="/browse?sort=TRENDING_DESC" />
        <div className="xl:hidden">
          <AiringSoon />
        </div>
        <ForYou />
        <AnimeCarousel
          title={t('popularThisSeason')}
          subtitle={`${label.season(season, locale)} ${year}`}
          icon={<Sparkles className="h-6 w-6" strokeWidth={2.5} />}
          anime={slim(data.seasonal.media)}
          href={`/seasonal?season=${season}&year=${year}`}
        />
        <div className="xl:hidden">
          <TopTenPanel anime={top} />
        </div>
        <AnimeCarousel
          title={t('upcomingNextSeason')}
          subtitle={`${label.season(next.season, locale)} ${next.year}`}
          icon={<Rocket className="h-6 w-6" strokeWidth={2.5} />}
          anime={slim(data.nextSeason.media)}
          href={`/seasonal?season=${next.season}&year=${next.year}`}
        />
        <AnimeCarousel title={t('trendingMovies')} icon={<Clapperboard className="h-6 w-6" strokeWidth={2.5} />} anime={slim(data.movies.media)} href="/browse?format=MOVIE&sort=TRENDING_DESC" />
        <AnimeCarousel title={t('allTimePopular')} icon={<Crown className="h-6 w-6" strokeWidth={2.5} />} anime={slim(data.popular.media)} href="/browse?sort=POPULARITY_DESC" />
        <GenreGrid />
      </div>

      {/* Right rail (wide screens) */}
      <aside className="no-scrollbar sticky top-5 hidden max-h-[calc(100dvh-2.5rem)] flex-col gap-6 self-start overflow-y-auto pb-3 pr-2 xl:flex">
        <AiringRail />
        <TopTenPanel anime={top} compact />
      </aside>
    </div>
  );
}
