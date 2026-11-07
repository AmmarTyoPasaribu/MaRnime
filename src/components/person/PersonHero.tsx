import Image from 'next/image';
import { ExternalLink, Heart } from 'lucide-react';
import { AniListIcon } from '@/components/ui/BrandIcons';
import Synopsis from '@/components/anime/detail/Synopsis';

export default function PersonHero({
  image,
  name,
  native,
  alternative,
  favourites,
  facts,
  description,
  siteUrl,
  labels,
}: {
  image: string;
  name: string;
  native: string | null;
  alternative?: string[];
  favourites: string;
  facts: [string, React.ReactNode][];
  description: string | null;
  siteUrl: string;
  labels: { favorites: string; alsoKnown: string; viewOnAniList: string };
}) {
  const shownFacts = facts.filter(([, v]) => v != null && v !== '');
  return (
    <header className="relative mb-12">
            <div className="grid gap-6 sm:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <div className="mx-auto w-44 sm:mx-0 sm:w-full">
          <div className="relative aspect-[2/3] rotate-[-1.5deg] overflow-hidden border-[3px] border-ink shadow-brut-lg transition-transform hover:rotate-0">
            <Image src={image} alt={name} fill priority sizes="240px" className="object-cover" />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-center font-display text-3xl uppercase sm:text-left sm:text-4xl lg:text-5xl">{name}</h1>
          {native && <p className="mt-1.5 text-center text-lg text-fg-3 sm:text-left">{native}</p>}
          {alternative && alternative.filter(Boolean).length > 0 && (
            <p className="mt-2 text-center text-sm text-fg-3 sm:text-left">
              <span className="text-fg-2">{labels.alsoKnown}:</span> {alternative.filter(Boolean).join(', ')}
            </p>
          )}

          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-pop-pink px-3 py-1.5 text-sm font-bold shadow-brut-sm">
              <Heart className="h-4 w-4 fill-current" />
              {favourites} {labels.favorites}
            </span>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="chip h-auto py-1.5">
              <AniListIcon className="h-3.5 w-3.5 text-[#02a9ff]" />
              {labels.viewOnAniList}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {shownFacts.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {shownFacts.map(([k, v]) => (
                <div key={k} className="panel bg-pop-yellow/40 px-4 py-3">
                  <dt className="text-[11px] font-bold uppercase tracking-wider">{k}</dt>
                  <dd className="mt-1 text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {description && (
            <div className="mt-6">
              <Synopsis text={description} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
