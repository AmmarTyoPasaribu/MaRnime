'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Media } from '@/lib/anilist/types';
import { cleanDescription } from '@/lib/utils';
import { Play, Star, TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface HeroBannerProps {
  anime: Media[];
}

export default function HeroBanner({ anime }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const featured = anime[current];

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % anime.length);
  }, [anime.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (!featured) return null;

  const title = featured.title.english || featured.title.romaji;
  const desc = cleanDescription(featured.description);
  const scoreClass = featured.averageScore
    ? featured.averageScore >= 75 ? 'score-high' : featured.averageScore >= 50 ? 'score-mid' : 'score-low'
    : '';

  return (
    <div className="relative w-full h-[500px] sm:h-[600px] overflow-hidden">
      {/* Background Image */}
      <Image
        src={featured.bannerImage || featured.coverImage.extraLarge}
        alt={title}
        fill
        className="object-cover transition-all duration-1000"
        priority
      />

      {/* Aurora-tinted gradient overlay */}
      <div className="absolute inset-0" style={{
        background: `
          linear-gradient(to top, #0b0b14 0%, rgba(11,11,20,0.85) 35%, rgba(11,11,20,0.4) 60%, rgba(11,11,20,0.3) 100%),
          linear-gradient(135deg, rgba(45,212,191,0.08) 0%, transparent 50%, rgba(167,139,250,0.06) 100%)
        `,
      }} />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="max-w-2xl animate-fade-in">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold" style={{
              background: 'rgba(45, 212, 191, 0.12)',
              border: '1px solid rgba(45, 212, 191, 0.25)',
              color: 'var(--color-aurora-teal)',
            }}>
              <TrendingUp className="w-3 h-3" />
              Trending #{current + 1}
            </span>
            {featured.averageScore && (
              <span className={`score-badge ${scoreClass}`}>
                <Star className="w-3 h-3" />
                {(featured.averageScore / 10).toFixed(1)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-black mb-3 leading-tight tracking-tight">
            {title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-3">
            {featured.genres?.slice(0, 4).map((g) => (
              <span key={g} className="text-xs px-2.5 py-1 rounded-lg" style={{
                background: 'rgba(167, 139, 250, 0.1)',
                color: 'var(--color-aurora-purple)',
                border: '1px solid rgba(167, 139, 250, 0.15)',
              }}>
                {g}
              </span>
            ))}
          </div>

          {/* Description */}
          {desc && (
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-6 max-w-lg leading-relaxed">
              {desc}
            </p>
          )}

          {/* CTA */}
          <Link href={`/anime/${featured.id}`} className="btn-primary">
            <Play className="w-4 h-4" />
            View Details
          </Link>
        </div>

        {/* Slide Indicators */}
        <div className="flex gap-1.5 mt-8">
          {anime.slice(0, 6).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: i === current ? '32px' : '12px',
                background: i === current
                  ? 'var(--color-aurora-teal)'
                  : 'rgba(255, 255, 255, 0.15)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
