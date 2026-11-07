import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronLeft, ChevronRight, ExternalLink, Heart, Building2 } from 'lucide-react';
import { getStudio, parseId } from '@/lib/anilist/server';
import { getI18n } from '@/lib/i18n/server';
import { compactNumber } from '@/lib/utils';
import { AnimeGrid } from '@/components/anime/AnimeCarousel';
import { AniListIcon } from '@/components/ui/BrandIcons';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const studio = await getStudio(parseId((await params).id));
  return { title: studio.name, description: `Anime produced by ${studio.name}.` };
}

export default async function StudioPage({ params, searchParams }: PageProps) {
  const id = parseId((await params).id);
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [studio, { t, locale }] = await Promise.all([getStudio(id, page), getI18n()]);
  const media = studio.media.edges.map((e) => e.node).filter((m) => !m.isAdult);
  const info = studio.media.pageInfo;

  return (
    <div className="pb-4">
      <header className="relative mb-8 overflow-hidden border-[3px] border-ink bg-pop-lilac p-6 shadow-brut-lg sm:p-8">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 rotate-[-6deg] place-items-center border-[3px] border-ink bg-pop-yellow shadow-brut-sm">
            <Building2 className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="w-fit border-2 border-ink bg-white px-2 text-xs font-bold uppercase">{studio.isAnimationStudio ? t('animationStudio') : t('productionCompany')}</p>
            <h1 className="mt-2 font-display text-3xl uppercase sm:text-5xl">{studio.name}</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm font-bold">
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-4 w-4 fill-pop-pink" strokeWidth={2.5} />
                {compactNumber(studio.favourites, locale)} {t('favorites')}
              </span>
            </div>
          </div>
          <a href={studio.siteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary self-start sm:self-auto">
            <AniListIcon className="h-4 w-4 text-[#3db4f2]" />
            {t('viewOnAniList')}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <AnimeGrid anime={media} />

      {(page > 1 || info.hasNextPage) && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link href={`/studio/${id}?page=${page - 1}`} className="btn btn-secondary">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : null}
          <span className="text-sm text-fg-3">
            {page}
          </span>
          {info.hasNextPage ? (
            <Link href={`/studio/${id}?page=${page + 1}`} className="btn btn-secondary">
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
