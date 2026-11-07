import Link from 'next/link';
import type { Metadata } from 'next';
import { Clapperboard, Crown, Flame, Heart, Rocket, Star } from 'lucide-react';
import { anilistFetch } from '@/lib/anilist/client';
import { SEARCH_ANIME } from '@/lib/anilist/queries';
import type { MediaPage } from '@/lib/anilist/types';
import { getI18n } from '@/lib/i18n/server';
import type { TranslationKey } from '@/lib/i18n/translations';
import RankedList from '@/components/anime/RankedList';
import { cn, slimMedia } from '@/lib/utils';

const TABS: Record<string, { key: TranslationKey; icon: typeof Star; vars: Record<string, unknown> }> = {
  rated: { key: 'topAllTime', icon: Star, vars: { sort: ['SCORE_DESC'] } },
  popular: { key: 'topPopular', icon: Crown, vars: { sort: ['POPULARITY_DESC'] } },
  airing: { key: 'topAiring', icon: Flame, vars: { sort: ['SCORE_DESC'], status: 'RELEASING' } },
  upcoming: { key: 'topUpcoming', icon: Rocket, vars: { sort: ['POPULARITY_DESC'], status: 'NOT_YET_RELEASED' } },
  movies: { key: 'topMovies', icon: Clapperboard, vars: { sort: ['SCORE_DESC'], format_in: ['MOVIE'] } },
  favourites: { key: 'topFavourited', icon: Heart, vars: { sort: ['FAVOURITES_DESC'] } },
};

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('topTitle'), description: t('topSubtitle') };
}

export default async function TopPage({ searchParams }: PageProps) {
  const { type } = await searchParams;
  const active = type && TABS[type] ? type : 'rated';
  const { t } = await getI18n();
  const tab = TABS[active];

  const pages = await Promise.all(
    [1, 2].map((page) =>
      anilistFetch<{ Page: MediaPage }>(SEARCH_ANIME, { ...tab.vars, page, perPage: 50 }, { revalidate: 3600 }).then((d) => d.Page.media)
    )
  );
  const list = pages.flat().map((m) => slimMedia(m, 220));

  return (
    <div className="pb-4">
      <header className="mb-6">
        <h1 className="font-display text-3xl uppercase sm:text-5xl">
          <span className="text-gradient">{t('topTitle')}</span>
        </h1>
        <p className="mt-2 font-medium text-fg-2">{t('topSubtitle')}</p>
      </header>

      <nav className="no-scrollbar -mx-4 mb-7 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0">
        {Object.entries(TABS).map(([id, def]) => (
          <Link key={id} href={id === 'rated' ? '/top' : `/top?type=${id}`} data-active={active === id} className={cn('chip h-10 px-4')} scroll={false}>
            <def.icon className="h-4 w-4" strokeWidth={2.5} />
            {t(def.key)}
          </Link>
        ))}
      </nav>

      <RankedList anime={list} />
    </div>
  );
}
