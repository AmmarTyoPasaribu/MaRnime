'use client';

import type { Media } from '@/lib/anilist/types';
import HeroBanner from '@/components/anime/HeroBanner';
import AnimeSection from '@/components/anime/AnimeSection';
import { useI18n } from '@/providers/I18nProvider';
import { Flame, TrendingUp, Star, Calendar, Sparkles } from 'lucide-react';

interface HomePageClientProps {
  trending: Media[];
  seasonal: Media[];
  popular: Media[];
  topRated: Media[];
  upcoming: Media[];
  season: string;
  year: number;
}

export default function HomePageClient({
  trending, seasonal, popular, topRated, upcoming, season, year,
}: HomePageClientProps) {
  const { t } = useI18n();

  return (
    <div>
      {/* Hero Banner */}
      <HeroBanner anime={trending} />

      {/* Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 -mt-8 relative z-10 pb-8">
        <AnimeSection
          title={t('trendingNow')}
          icon={<Flame className="w-5 h-5 text-[var(--color-pink)]" />}
          anime={trending}
          viewAllLink="/browse?sort=TRENDING_DESC"
        />

        <AnimeSection
          title={t('popularThisSeason')}
          icon={<Calendar className="w-5 h-5 text-[var(--color-green)]" />}
          anime={seasonal}
          viewAllLink={`/seasonal?season=${season}&year=${year}`}
        />

        <AnimeSection
          title={t('allTimePopular')}
          icon={<TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />}
          anime={popular}
          viewAllLink="/browse?sort=POPULARITY_DESC"
        />

        <AnimeSection
          title={t('topRated')}
          icon={<Star className="w-5 h-5 text-[var(--color-yellow)]" />}
          anime={topRated}
          viewAllLink="/browse?sort=SCORE_DESC"
        />

        <AnimeSection
          title={t('upcoming')}
          icon={<Sparkles className="w-5 h-5 text-[var(--color-accent-hover)]" />}
          anime={upcoming}
          viewAllLink="/browse?status=NOT_YET_RELEASED"
        />
      </div>
    </div>
  );
}
