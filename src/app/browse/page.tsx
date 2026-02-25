'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { anilistFetch } from '@/lib/anilist/client';
import { SEARCH_ANIME } from '@/lib/anilist/queries';
import type { Media, MediaPage, MediaSort, MediaFormat, MediaStatus, MediaSeason } from '@/lib/anilist/types';
import AnimeCard from '@/components/anime/AnimeCard';
import { Search, Filter, X, ChevronDown, Loader2 } from 'lucide-react';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy',
  'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];

const FORMATS: { value: MediaFormat; label: string }[] = [
  { value: 'TV', label: 'TV' },
  { value: 'TV_SHORT', label: 'TV Short' },
  { value: 'MOVIE', label: 'Movie' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'SPECIAL', label: 'Special' },
  { value: 'MUSIC', label: 'Music' },
];

const STATUSES: { value: MediaStatus; label: string }[] = [
  { value: 'RELEASING', label: 'Airing' },
  { value: 'FINISHED', label: 'Finished' },
  { value: 'NOT_YET_RELEASED', label: 'Upcoming' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const SORTS: { value: MediaSort; label: string }[] = [
  { value: 'TRENDING_DESC', label: 'Trending' },
  { value: 'POPULARITY_DESC', label: 'Popularity' },
  { value: 'SCORE_DESC', label: 'Score' },
  { value: 'FAVOURITES_DESC', label: 'Favourites' },
  { value: 'START_DATE_DESC', label: 'Newest' },
];

const SEASONS: { value: MediaSeason; label: string }[] = [
  { value: 'WINTER', label: 'Winter' },
  { value: 'SPRING', label: 'Spring' },
  { value: 'SUMMER', label: 'Summer' },
  { value: 'FALL', label: 'Fall' },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [anime, setAnime] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filters from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get('genres')?.split(',').filter(Boolean) || []
  );
  const [format, setFormat] = useState<MediaFormat | ''>(
    (searchParams.get('format') as MediaFormat) || ''
  );
  const [status, setStatus] = useState<MediaStatus | ''>(
    (searchParams.get('status') as MediaStatus) || ''
  );
  const [season, setSeason] = useState<MediaSeason | ''>(
    (searchParams.get('season') as MediaSeason) || ''
  );
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [sort, setSort] = useState<MediaSort>(
    (searchParams.get('sort') as MediaSort) || 'TRENDING_DESC'
  );

  const fetchAnime = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      const variables: Record<string, unknown> = {
        page: pageNum,
        perPage: 20,
        sort: search ? ['SEARCH_MATCH'] : [sort],
        isAdult: false,
      };
      if (search) variables.search = search;
      if (selectedGenres.length > 0) variables.genre_in = selectedGenres;
      if (format) variables.format = format;
      if (status) variables.status = status;
      if (season) variables.season = season;
      if (year) variables.seasonYear = parseInt(year);

      const data = await anilistFetch<{ Page: MediaPage }>(SEARCH_ANIME, variables);

      if (append) {
        setAnime((prev) => [...prev, ...data.Page.media]);
      } else {
        setAnime(data.Page.media);
      }
      setHasNext(data.Page.pageInfo.hasNextPage);
      setTotalResults(data.Page.pageInfo.total);
      setPage(pageNum);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedGenres, format, status, season, year, sort]);

  useEffect(() => {
    fetchAnime(1);
  }, [fetchAnime]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedGenres([]);
    setFormat('');
    setStatus('');
    setSeason('');
    setYear('');
    setSort('TRENDING_DESC');
  };

  const activeFilterCount =
    selectedGenres.length +
    (format ? 1 : 0) +
    (status ? 1 : 0) +
    (season ? 1 : 0) +
    (year ? 1 : 0);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear + 1 - i);

  return (
    <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <h1 className="text-3xl font-bold mb-6">Browse Anime</h1>

      {/* Search + Filter Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anime..."
            className="input-field pl-11"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary relative ${showFilters ? 'border-[var(--color-accent)]' : ''}`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-card p-4 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Filters</span>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-[var(--color-accent)] hover:underline">
                Clear All
              </button>
            )}
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Sort By</label>
            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSort(s.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    sort === s.value
                      ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedGenres.includes(g)
                      ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Format, Status, Season, Year */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as MediaFormat | '')}
                className="input-field text-sm"
              >
                <option value="">All</option>
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MediaStatus | '')}
                className="input-field text-sm"
              >
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as MediaSeason | '')}
                className="input-field text-sm"
              >
                <option value="">All</option>
                {SEASONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">All</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && (
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          {totalResults.toLocaleString()} results found
        </p>
      )}

      {/* Results Grid */}
      {loading && anime.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[3/4] rounded-xl" />
              <div className="skeleton h-4 mt-2 w-3/4 rounded" />
              <div className="skeleton h-3 mt-1 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {anime.map((item, index) => (
              <AnimeCard key={item.id} anime={item} index={index} />
            ))}
          </div>

          {anime.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-lg text-[var(--color-text-muted)]">No anime found</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Try adjusting your filters</p>
            </div>
          )}

          {/* Load More */}
          {hasNext && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchAnime(page + 1, true)}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="skeleton h-10 w-48 rounded-lg mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[3/4] rounded-xl" />
              <div className="skeleton h-4 mt-2 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
