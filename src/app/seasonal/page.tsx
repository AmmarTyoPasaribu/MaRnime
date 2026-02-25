'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { anilistFetch } from '@/lib/anilist/client';
import { SEASONAL_ANIME } from '@/lib/anilist/queries';
import type { Media, MediaPage, MediaSeason } from '@/lib/anilist/types';
import AnimeCard from '@/components/anime/AnimeCard';
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const SEASONS: { value: MediaSeason; label: string; emoji: string }[] = [
  { value: 'WINTER', label: 'Winter', emoji: '❄️' },
  { value: 'SPRING', label: 'Spring', emoji: '🌸' },
  { value: 'SUMMER', label: 'Summer', emoji: '☀️' },
  { value: 'FALL', label: 'Fall', emoji: '🍂' },
];

function SeasonalContent() {
  const searchParams = useSearchParams();
  const now = new Date();
  const month = now.getMonth() + 1;

  const getDefaultSeason = (): MediaSeason => {
    if (month >= 1 && month <= 3) return 'WINTER';
    if (month >= 4 && month <= 6) return 'SPRING';
    if (month >= 7 && month <= 9) return 'SUMMER';
    return 'FALL';
  };

  const [season, setSeason] = useState<MediaSeason>(
    (searchParams.get('season') as MediaSeason) || getDefaultSeason()
  );
  const [year, setYear] = useState(
    parseInt(searchParams.get('year') || '') || now.getFullYear()
  );
  const [anime, setAnime] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await anilistFetch<{ Page: MediaPage }>(SEASONAL_ANIME, {
          season,
          seasonYear: year,
          page: 1,
          perPage: 50,
          sort: ['POPULARITY_DESC'],
        });
        setAnime(data.Page.media);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [season, year]);

  const prevSeason = () => {
    const idx = SEASONS.findIndex((s) => s.value === season);
    if (idx === 0) {
      setSeason(SEASONS[3].value);
      setYear(year - 1);
    } else {
      setSeason(SEASONS[idx - 1].value);
    }
  };

  const nextSeason = () => {
    const idx = SEASONS.findIndex((s) => s.value === season);
    if (idx === 3) {
      setSeason(SEASONS[0].value);
      setYear(year + 1);
    } else {
      setSeason(SEASONS[idx + 1].value);
    }
  };

  const currentSeasonInfo = SEASONS.find((s) => s.value === season)!;

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="w-7 h-7 text-[var(--color-accent)]" />
          Seasonal Anime
        </h1>
      </div>

      {/* Season Selector */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button onClick={prevSeason} className="btn-secondary p-2">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {SEASONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSeason(s.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                season === s.value
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] border border-[var(--color-border)]'
              }`}
            >
              <span className="hidden sm:inline">{s.emoji} </span>
              {s.label}
            </button>
          ))}
        </div>

        <button onClick={nextSeason} className="btn-secondary p-2">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Year */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setYear(year - 1)}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          {year - 1}
        </button>
        <span className="text-lg font-bold text-[var(--color-accent)]">{year}</span>
        <button
          onClick={() => setYear(year + 1)}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          {year + 1}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {anime.map((item, index) => (
            <AnimeCard key={item.id} anime={item} index={index} />
          ))}
        </div>
      )}

      {!loading && anime.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg text-[var(--color-text-muted)]">No anime found for {currentSeasonInfo.emoji} {currentSeasonInfo.label} {year}</p>
        </div>
      )}
    </div>
  );
}

export default function SeasonalPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
        </div>
      </div>
    }>
      <SeasonalContent />
    </Suspense>
  );
}
