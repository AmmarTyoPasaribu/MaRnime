'use client';

import type { MediaSummary } from '@/lib/anilist/types';
import { useDisplayMode } from '@/providers/DisplayModeProvider';
import AnimeRow from './AnimeRow';
import AnimeTextList from './AnimeTextList';

/** Top-100 style ranked list: rich rows in card mode, numbered titles in text mode. */
export default function RankedList({ anime }: { anime: MediaSummary[] }) {
  const { mode } = useDisplayMode();
  if (mode === 'text') return <AnimeTextList anime={anime} numbered columns={2} />;
  return (
    <ol className="stagger space-y-4">
      {anime.map((a, i) => (
        <li key={a.id}>
          <AnimeRow anime={a} rank={i + 1} />
        </li>
      ))}
    </ol>
  );
}
