import Image from 'next/image';
import Link from 'next/link';
import { anilistFetch } from '@/lib/anilist/client';
import { STAFF_DETAIL } from '@/lib/anilist/queries';
import type { StaffDetail } from '@/lib/anilist/types';
import { cleanDescription } from '@/lib/utils';
import { Heart, Briefcase } from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await anilistFetch<{ Staff: StaffDetail }>(STAFF_DETAIL, { id: parseInt(id) });
    return { title: data.Staff.name.full };
  } catch {
    return { title: 'Staff' };
  }
}

export const revalidate = 3600;

export default async function StaffPage({ params }: PageProps) {
  const { id } = await params;
  const data = await anilistFetch<{ Staff: StaffDetail }>(STAFF_DETAIL, { id: parseInt(id) });
  const staff = data.Staff;
  const desc = cleanDescription(staff.description);

  return (
    <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 pb-12">
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Image */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="relative w-[200px] aspect-[3/4] rounded-xl overflow-hidden ring-2 ring-[var(--color-border)]">
            <Image
              src={staff.image.large}
              alt={staff.name.full}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{staff.name.full}</h1>
          {staff.name.native && (
            <p className="text-sm text-[var(--color-text-muted)] mb-4">{staff.name.native}</p>
          )}

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
              <Heart className="w-4 h-4 text-[var(--color-pink)]" />
              {staff.favourites?.toLocaleString()} favorites
            </div>
            {staff.primaryOccupations?.map((o) => (
              <span key={o} className="badge">
                <Briefcase className="w-3 h-3 mr-1" />
                {o}
              </span>
            ))}
          </div>

          {staff.homeTown && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">📍 {staff.homeTown}</p>
          )}

          {desc && (
            <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line max-h-[300px] overflow-y-auto">
              {desc}
            </div>
          )}
        </div>
      </div>

      {/* Staff Roles (Anime) */}
      {staff.staffMedia?.edges && staff.staffMedia.edges.length > 0 && (
        <section className="mb-10">
          <h2 className="section-title mb-4">Anime Staff Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {staff.staffMedia.edges.map((edge, i) => (
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
                  <p className="text-xs text-[var(--color-text-muted)]">{edge.staffRole}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Voice Acting Roles */}
      {staff.characters?.edges && staff.characters.edges.length > 0 && (
        <section>
          <h2 className="section-title mb-4">Voice Acting Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {staff.characters.edges.map((edge, i) => (
              <div
                key={i}
                className="glass-card flex items-center gap-3 p-3"
              >
                <Link
                  href={`/character/${edge.node.id}`}
                  className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                >
                  <Image
                    src={edge.node.image.medium}
                    alt={edge.node.name.full}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/character/${edge.node.id}`} className="text-sm font-medium truncate block hover:text-[var(--color-accent)]">
                    {edge.node.name.full}
                  </Link>
                  <p className="text-xs text-[var(--color-text-muted)]">{edge.role}</p>
                </div>
                {edge.media?.[0] && (
                  <Link
                    href={edge.media[0].type === 'ANIME' ? `/anime/${edge.media[0].id}` : '#'}
                    className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <Image
                      src={edge.media[0].coverImage.medium}
                      alt={edge.media[0].title.romaji}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
