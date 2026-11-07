'use client';

import Link from 'next/link';
import { Shapes } from 'lucide-react';
import { useI18n } from '@/providers/I18nProvider';
import { SectionHeader } from '@/components/ui/Section';

export const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Ecchi',
  'Fantasy',
  'Horror',
  'Mahou Shoujo',
  'Mecha',
  'Music',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
];

const FILLS = ['#ffe94d', '#ff5c8a', '#2de2a6', '#ffffff', '#b9a6ff', '#ff9f45'];

export default function GenreGrid() {
  const { t } = useI18n();
  const featured = GENRES.filter((g) => g !== 'Ecchi');
  return (
    <section>
      <SectionHeader title={t('browseByGenre')} icon={<Shapes className="h-6 w-6" strokeWidth={2.5} />} href="/browse" linkLabel={t('browse')} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {featured.map((g, i) => (
          <Link
            key={g}
            href={`/browse?genres=${encodeURIComponent(g)}`}
            className="group flex h-14 items-center justify-between border-[3px] border-ink px-3 text-sm font-bold shadow-brut-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut"
            style={{ background: FILLS[i % FILLS.length] }}
          >
            {g}
            <span aria-hidden className="h-3 w-3 rotate-45 border-2 border-ink bg-white transition-transform duration-300 group-hover:rotate-[225deg]" />
          </Link>
        ))}
      </div>
    </section>
  );
}
