'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AnimeCard, { type CardMedia } from './AnimeCard';
import AnimeTextList from './AnimeTextList';
import { SectionHeader } from '@/components/ui/Section';
import { useI18n } from '@/providers/I18nProvider';
import { useDisplayMode } from '@/providers/DisplayModeProvider';
import { cn } from '@/lib/utils';

interface Props {
  title: React.ReactNode;
  icon?: React.ReactNode;
  anime: CardMedia[];
  href?: string;
  subtitle?: React.ReactNode;
  ranked?: boolean;
  /** Columns used when the global display mode is "text". */
  textColumns?: 1 | 2 | 3;
}

/** A section that is a swipeable card row in card mode, or a title list in text mode. */
export default function AnimeCarousel({ title, icon, anime, href, subtitle, ranked, textColumns = 2 }: Props) {
  const { t } = useI18n();
  const { mode } = useDisplayMode();
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, mode]);

  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: 'smooth' });

  if (!anime.length) return null;

  return (
    <section>
      <SectionHeader
        title={title}
        icon={icon}
        href={href}
        linkLabel={t('viewAll')}
        subtitle={subtitle}
        action={
          mode === 'card' ? (
            <div className="mr-1 hidden gap-2 md:flex">
              <button onClick={() => scroll(-1)} disabled={edges.start} className="btn btn-sm w-9 px-0 disabled:opacity-30" aria-label={t('scrollLeft')}>
                <ArrowLeft className="h-4 w-4" strokeWidth={3} />
              </button>
              <button onClick={() => scroll(1)} disabled={edges.end} className="btn btn-sm w-9 px-0 disabled:opacity-30" aria-label={t('scrollRight')}>
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </button>
            </div>
          ) : null
        }
      />
      {mode === 'text' ? (
        <AnimeTextList anime={anime} numbered={ranked} columns={textColumns} />
      ) : (
        <div
          ref={track}
          onScroll={update}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 pt-1 sm:-mx-5 sm:scroll-px-5 sm:gap-5 sm:px-5 lg:mx-0 lg:scroll-px-0 lg:px-0"
        >
          {anime.map((item, i) => (
            <AnimeCard
              key={item.id}
              anime={item}
              rank={ranked ? i + 1 : undefined}
              className="w-[42vw] shrink-0 snap-start sm:w-[176px]"
              style={{ animation: `fade-up 0.5s var(--ease-out-expo) ${Math.min(i, 8) * 45}ms backwards` }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** Grid of cards, or a text list (optionally A–Z grouped) in text mode. */
export function AnimeGrid({ anime, className, groupByLetter, textColumns = 2 }: { anime: CardMedia[]; className?: string; groupByLetter?: boolean; textColumns?: 1 | 2 | 3 }) {
  const { mode } = useDisplayMode();
  if (mode === 'text') return <AnimeTextList anime={anime} groupByLetter={groupByLetter} columns={textColumns} className={className} />;
  return (
    <div className={cn('stagger grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6', className)}>
      {anime.map((item, i) => (
        <AnimeCard key={item.id} anime={item} priority={i < 6} />
      ))}
    </div>
  );
}
