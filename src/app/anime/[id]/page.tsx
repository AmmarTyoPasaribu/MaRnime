import Image from 'next/image';
import Link from 'next/link';
import { anilistFetch } from '@/lib/anilist/client';
import { ANIME_DETAIL } from '@/lib/anilist/queries';
import type { Media } from '@/lib/anilist/types';
import { formatFormat, formatStatus, formatSeason, cleanDescription } from '@/lib/utils';
import { Star, Heart, Users, Clock, Play, Calendar, Tv, BookOpen, ExternalLink } from 'lucide-react';
import WatchlistButton from '@/components/watchlist/WatchlistButton';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await anilistFetch<{ Media: Media }>(ANIME_DETAIL, { id: parseInt(id) });
    const anime = data.Media;
    return {
      title: anime.title.english || anime.title.romaji,
      description: cleanDescription(anime.description)?.slice(0, 160),
    };
  } catch {
    return { title: 'Anime Detail' };
  }
}

export const revalidate = 300;

export default async function AnimeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await anilistFetch<{ Media: Media }>(ANIME_DETAIL, { id: parseInt(id) });
  const anime = data.Media;
  const title = anime.title.english || anime.title.romaji;
  const desc = cleanDescription(anime.description);
  const scoreClass = anime.averageScore
    ? anime.averageScore >= 75 ? 'score-high' : anime.averageScore >= 50 ? 'score-mid' : 'score-low'
    : '';

  return (
    <div>
      {/* Banner */}
      <div className="relative w-full h-[350px] sm:h-[400px]">
        <Image
          src={anime.bannerImage || anime.coverImage.extraLarge}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, var(--color-bg-primary) 0%, rgba(10,10,15,0.5) 50%, rgba(10,10,15,0.3) 100%)',
        }} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative w-[180px] sm:w-[200px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl mx-auto md:mx-0 ring-2 ring-[var(--color-border)]">
              <Image
                src={anime.coverImage.extraLarge}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Watchlist Button */}
            <div className="mt-3 w-[180px] sm:w-[200px] mx-auto md:mx-0">
              <WatchlistButton animeId={anime.id} animeTitle={title} animeImage={anime.coverImage.large} totalEpisodes={anime.episodes} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{title}</h1>
            {anime.title.native && (
              <p className="text-sm text-[var(--color-text-muted)] mb-4">{anime.title.native}</p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {anime.averageScore && (
                <div className={`score-badge text-sm ${scoreClass}`}>
                  <Star className="w-4 h-4" />
                  {(anime.averageScore / 10).toFixed(1)}
                </div>
              )}
              <span className="badge">{formatFormat(anime.format)}</span>
              <span className="badge">{formatStatus(anime.status)}</span>
              {anime.season && anime.seasonYear && (
                <span className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatSeason(anime.season, anime.seasonYear)}
                </span>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {anime.episodes && (
                <div className="glass-card p-3 text-center">
                  <Play className="w-4 h-4 mx-auto mb-1 text-[var(--color-accent)]" />
                  <p className="text-sm font-semibold">{anime.episodes}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Episodes</p>
                </div>
              )}
              {anime.duration && (
                <div className="glass-card p-3 text-center">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-[var(--color-accent)]" />
                  <p className="text-sm font-semibold">{anime.duration} min</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Duration</p>
                </div>
              )}
              <div className="glass-card p-3 text-center">
                <Heart className="w-4 h-4 mx-auto mb-1 text-[var(--color-pink)]" />
                <p className="text-sm font-semibold">{anime.favourites?.toLocaleString()}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Favorites</p>
              </div>
              <div className="glass-card p-3 text-center">
                <Users className="w-4 h-4 mx-auto mb-1 text-[var(--color-green)]" />
                <p className="text-sm font-semibold">{anime.popularity?.toLocaleString()}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Members</p>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres?.map((g) => (
                <Link
                  key={g}
                  href={`/browse?genres=${g}`}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    background: 'rgba(45, 212, 191, 0.1)',
                    color: '#5eead4',
                    border: '1px solid rgba(45, 212, 191, 0.25)',
                  }}
                >
                  {g}
                </Link>
              ))}
            </div>

            {/* Studios */}
            {anime.studios?.nodes?.length > 0 && (
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                <Tv className="w-3.5 h-3.5 inline mr-1" />
                Studio: <span className="text-[var(--color-text-primary)] font-medium">
                  {anime.studios.nodes.map((s) => s.name).join(', ')}
                </span>
              </p>
            )}

            {/* Source */}
            {anime.source && (
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                Source: <span className="text-[var(--color-text-primary)] font-medium">
                  {anime.source.replace(/_/g, ' ')}
                </span>
              </p>
            )}

            {/* Description */}
            {desc && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                  {desc}
                </p>
              </div>
            )}

            {/* Trailer */}
            {anime.trailer && anime.trailer.site === 'youtube' && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Trailer</h2>
                <div className="relative aspect-video rounded-xl overflow-hidden max-w-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Characters */}
        {anime.characters?.edges && anime.characters.edges.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title mb-4">Characters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {anime.characters.edges.map((edge) => (
                <div
                  key={edge.id}
                  className="glass-card flex items-center gap-3 p-3"
                >
                  {/* Character */}
                  <Link href={`/character/${edge.node.id}`} className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={edge.node.image.medium}
                      alt={edge.node.name.full}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/character/${edge.node.id}`} className="text-sm font-medium truncate block hover:text-[var(--color-accent)] transition-colors">
                      {edge.node.name.full}
                    </Link>
                    <p className="text-xs text-[var(--color-text-muted)]">{edge.role}</p>
                  </div>
                  {/* Voice Actor */}
                  {edge.voiceActors?.[0] && (
                    <>
                      <div className="text-right flex-1 min-w-0">
                        <Link href={`/staff/${edge.voiceActors[0].id}`} className="text-sm truncate block hover:text-[var(--color-accent)] transition-colors">
                          {edge.voiceActors[0].name.full}
                        </Link>
                        <p className="text-xs text-[var(--color-text-muted)]">{edge.voiceActors[0].languageV2}</p>
                      </div>
                      <Link
                        href={`/staff/${edge.voiceActors[0].id}`}
                        className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <Image
                          src={edge.voiceActors[0].image.medium}
                          alt={edge.voiceActors[0].name.full}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </Link>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Staff */}
        {anime.staff?.edges && anime.staff.edges.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title mb-4">Staff</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {anime.staff.edges.map((edge) => (
                <Link
                  key={edge.id}
                  href={`/staff/${edge.node.id}`}
                  className="glass-card flex items-center gap-3 p-3 hover:bg-[var(--color-bg-card-hover)] transition-all"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={edge.node.image.medium}
                      alt={edge.node.name.full}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{edge.node.name.full}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{edge.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Relations */}
        {anime.relations?.edges && anime.relations.edges.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title mb-4">Relations</h2>
            <div className="horizontal-scroll">
              {anime.relations.edges.map((edge) => (
                <Link
                  key={edge.id}
                  href={edge.node.type === 'ANIME' ? `/anime/${edge.node.id}` : '#'}
                  className="glass-card overflow-hidden w-[140px] hover:bg-[var(--color-bg-card-hover)] transition-all"
                >
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={edge.node.coverImage.large}
                      alt={edge.node.title.romaji}
                      fill
                      className="object-cover"
                      sizes="140px"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] text-[var(--color-accent)] font-medium uppercase">
                      {edge.relationType?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs font-medium truncate mt-0.5">
                      {edge.node.title.english || edge.node.title.romaji}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {anime.recommendations?.nodes && anime.recommendations.nodes.length > 0 && (
          <section className="mt-12 pb-8">
            <h2 className="section-title mb-4">Recommendations</h2>
            <div className="horizontal-scroll">
              {anime.recommendations.nodes
                .filter((r) => r.mediaRecommendation)
                .map((rec) => (
                  <Link
                    key={rec.id}
                    href={`/anime/${rec.mediaRecommendation.id}`}
                    className="anime-card w-[160px]"
                  >
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={rec.mediaRecommendation.coverImage.large}
                        alt={rec.mediaRecommendation.title.romaji}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                      {rec.mediaRecommendation.averageScore && (
                        <div className={`absolute top-2 left-2 score-badge text-[10px] ${
                          rec.mediaRecommendation.averageScore >= 75 ? 'score-high' : rec.mediaRecommendation.averageScore >= 50 ? 'score-mid' : 'score-low'
                        }`}>
                          <Star className="w-3 h-3" />
                          {(rec.mediaRecommendation.averageScore / 10).toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium line-clamp-2">
                        {rec.mediaRecommendation.title.english || rec.mediaRecommendation.title.romaji}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
