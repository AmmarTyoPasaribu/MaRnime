import Image from 'next/image';
import Link from 'next/link';
import type { Media } from '@/lib/anilist/types';
import { Star, Clock, Tv, Film, Monitor } from 'lucide-react';

function formatLabel(format: string | undefined): string {
  if (!format) return '';
  const map: Record<string, string> = {
    TV: 'TV',
    TV_SHORT: 'TV Short',
    MOVIE: 'Movie',
    SPECIAL: 'Special',
    OVA: 'OVA',
    ONA: 'ONA',
    MUSIC: 'Music',
  };
  return map[format] || format.replace(/_/g, ' ');
}

export default function AnimeCard({ anime, index = 0 }: { anime: Media; index?: number }) {
  const title = anime.title.english || anime.title.romaji;
  const scoreClass = anime.averageScore
    ? anime.averageScore >= 75 ? 'score-high' : anime.averageScore >= 50 ? 'score-mid' : 'score-low'
    : '';

  const airing = anime.nextAiringEpisode;
  const format = formatLabel(anime.format);

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="anime-card group aurora-glow"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: 'fadeInUp 0.4s ease-out both',
      }}
    >
      {/* Poster */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-[14px]">
        <Image
          src={anime.coverImage.large}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />

        {/* Score badge — solid dark bg for contrast */}
        {anime.averageScore && (
          <div className={`absolute top-2 left-2 score-badge text-[11px] ${scoreClass}`} style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            <Star className="w-3 h-3" />
            {(anime.averageScore / 10).toFixed(1)}
          </div>
        )}

        {/* Airing countdown badge — solid dark bg */}
        {airing && (
          <div className="absolute top-2 right-2" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            padding: '2px 7px',
            borderRadius: '6px',
            fontSize: '0.6rem',
            fontWeight: 600,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'var(--color-aurora-teal)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
          }}>
            <Clock className="w-2.5 h-2.5" />
            Ep {airing.episode} in {(() => {
              const diff = airing.airingAt - Math.floor(Date.now() / 1000);
              if (diff <= 0) return 'now';
              const d = Math.floor(diff / 86400);
              const h = Math.floor((diff % 86400) / 3600);
              return d > 0 ? `${d}d ${h}h` : `${h}h`;
            })()}
          </div>
        )}

        {/* Bottom gradient — always visible info */}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 pt-8" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
        }}>
          <div className="flex items-center justify-end gap-1.5 text-[10px] font-medium text-gray-300">
            {format && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}>
                {anime.format === 'MOVIE' ? <Film className="w-2.5 h-2.5" /> : 
                 anime.format === 'ONA' ? <Monitor className="w-2.5 h-2.5" /> :
                 <Tv className="w-2.5 h-2.5" />}
                {format}
              </span>
            )}
            {anime.episodes && (
              <span className="px-1.5 py-0.5 rounded" style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}>
                {anime.episodes} eps
              </span>
            )}
          </div>
        </div>

        {/* Hover overlay — studio info */}
        <div className="anime-card-overlay">
          {anime.studios?.nodes?.[0] && (
            <p className="text-[10px] text-[var(--color-aurora-teal)] mt-0.5">
              {anime.studios.nodes[0].name}
            </p>
          )}
        </div>
      </div>

      {/* Title + Season */}
      <div className="p-2.5">
        <h3 className="text-sm font-medium truncate text-[var(--color-text-primary)] group-hover:text-[var(--color-aurora-teal)] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {anime.season && anime.seasonYear
            ? `${anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} ${anime.seasonYear}`
            : format || '—'
          }
        </p>
      </div>
    </Link>
  );
}
