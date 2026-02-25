import Link from 'next/link';
import type { Media } from '@/lib/anilist/types';
import AnimeCard from './AnimeCard';
import { ChevronRight } from 'lucide-react';

interface AnimeSectionProps {
  title: string;
  icon?: React.ReactNode;
  anime: Media[];
  viewAllLink?: string;
}

export default function AnimeSection({ title, icon, anime, viewAllLink }: AnimeSectionProps) {
  if (!anime || anime.length === 0) return null;

  return (
    <section className="relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title mb-0">
          {icon}
          {title}
        </h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-aurora-teal)] transition-colors group"
          >
            View All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {anime.map((item, index) => (
          <AnimeCard key={item.id} anime={item} index={index} />
        ))}
      </div>
    </section>
  );
}
