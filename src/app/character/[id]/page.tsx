import Image from 'next/image';
import Link from 'next/link';
import { anilistFetch } from '@/lib/anilist/client';
import { CHARACTER_DETAIL } from '@/lib/anilist/queries';
import type { CharacterDetail } from '@/lib/anilist/types';
import { cleanDescription } from '@/lib/utils';
import { Heart, Users } from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await anilistFetch<{ Character: CharacterDetail }>(CHARACTER_DETAIL, { id: parseInt(id) });
    return { title: data.Character.name.full };
  } catch {
    return { title: 'Character' };
  }
}

export const revalidate = 3600;

export default async function CharacterPage({ params }: PageProps) {
  const { id } = await params;
  const data = await anilistFetch<{ Character: CharacterDetail }>(CHARACTER_DETAIL, { id: parseInt(id) });
  const character = data.Character;
  const desc = cleanDescription(character.description);

  return (
    <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 pb-12">
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Image */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="relative w-[200px] aspect-[3/4] rounded-xl overflow-hidden ring-2 ring-[var(--color-border)]">
            <Image
              src={character.image.large}
              alt={character.name.full}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{character.name.full}</h1>
          {character.name.native && (
            <p className="text-sm text-[var(--color-text-muted)] mb-4">{character.name.native}</p>
          )}

          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
              <Heart className="w-4 h-4 text-[var(--color-pink)]" />
              {character.favourites?.toLocaleString()} favorites
            </div>
            {character.gender && (
              <span className="badge">{character.gender}</span>
            )}
            {character.age && (
              <span className="badge">Age: {character.age}</span>
            )}
          </div>

          {desc && (
            <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {desc}
            </div>
          )}
        </div>
      </div>

      {/* Appearances */}
      {character.media?.edges && character.media.edges.length > 0 && (
        <section>
          <h2 className="section-title mb-4">Appearances</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {character.media.edges.map((edge, i) => (
              <Link
                key={i}
                href={edge.node.type === 'ANIME' ? `/anime/${edge.node.id}` : '#'}
                className="glass-card flex items-center gap-3 p-3 hover:bg-[var(--color-bg-card-hover)] transition-all"
              >
                <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={edge.node.coverImage.medium}
                    alt={edge.node.title.romaji}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {edge.node.title.english || edge.node.title.romaji}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{edge.characterRole}</p>
                </div>
                {edge.voiceActors?.[0] && (
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs truncate">{edge.voiceActors[0].name.full}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{edge.voiceActors[0].languageV2}</p>
                    </div>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={edge.voiceActors[0].image.medium}
                        alt={edge.voiceActors[0].name.full}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
