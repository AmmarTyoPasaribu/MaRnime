/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CalendarClock, ExternalLink, Heart, Star, TrendingUp, Trophy, Users } from 'lucide-react';
import { getAnime, parseId } from '@/lib/anilist/server';
import type { MediaDetail } from '@/lib/anilist/types';
import { getI18n } from '@/lib/i18n/server';
import { label } from '@/lib/i18n/labels';
import { compactNumber, formatFuzzyDate, formatScore, hexToRgb, plainText, scoreFill, titleOf } from '@/lib/utils';
import WatchlistButton, { FavoriteButton } from '@/components/watchlist/WatchlistButton';
import AnimeCarousel from '@/components/anime/AnimeCarousel';
import Countdown from '@/components/ui/Countdown';
import { AniListIcon } from '@/components/ui/BrandIcons';
import SectionNav from '@/components/anime/detail/SectionNav';
import Synopsis from '@/components/anime/detail/Synopsis';
import { CharactersSection, StaffSection } from '@/components/anime/detail/Characters';
import TagList from '@/components/anime/detail/TagList';
import Trailer from '@/components/anime/detail/Trailer';
import ShareButton from '@/components/anime/detail/ShareButton';
import Stats from '@/components/anime/detail/Stats';
import { EpisodesSection, MalInfoCard, MusicSection } from '@/components/anime/detail/MalSections';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const anime = await getAnime(parseId((await params).id));
  const title = titleOf(anime.title);
  const description = plainText(anime.description, 180) || `${title} on MaRnime`;
  const image = anime.bannerImage || anime.coverImage.extraLarge;
  return {
    title,
    description,
    alternates: { canonical: `/anime/${anime.id}` },
    openGraph: { title, description, images: [{ url: image }], type: anime.format === 'MOVIE' ? 'video.movie' : 'video.tv_show' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="grid h-16 w-16 rotate-[-4deg] place-items-center border-[3px] border-ink font-display text-2xl shadow-brut-sm" style={{ background: scoreFill(score) }}>
      {formatScore(score)}
    </div>
  );
}

function InfoRow({ k, children }: { k: string; children: React.ReactNode }) {
  if (children == null || children === '' || children === false) return null;
  return (
    <div className="flex gap-3 py-2 text-sm sm:block lg:flex xl:block">
      <dt className="w-28 shrink-0 text-xs font-bold uppercase text-fg-3 sm:mb-0.5 sm:w-auto lg:w-28 xl:w-auto">{k}</dt>
      <dd className="min-w-0 font-medium">{children}</dd>
    </div>
  );
}

function jsonLd(anime: MediaDetail) {
  return {
    '@context': 'https://schema.org',
    '@type': anime.format === 'MOVIE' ? 'Movie' : 'TVSeries',
    name: titleOf(anime.title),
    alternateName: [anime.title.romaji, anime.title.native].filter(Boolean),
    image: anime.coverImage.extraLarge,
    description: plainText(anime.description, 300),
    genre: anime.genres,
    ...(anime.episodes ? { numberOfEpisodes: anime.episodes } : {}),
    ...(anime.startDate.year ? { datePublished: String(anime.startDate.year) } : {}),
    ...(anime.averageScore
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: anime.averageScore / 10, bestRating: 10, ratingCount: anime.popularity } }
      : {}),
  };
}

export default async function AnimeDetailPage({ params }: PageProps) {
  const anime = await getAnime(parseId((await params).id));
  const { t, locale } = await getI18n();

  const title = titleOf(anime.title);
  const accent = hexToRgb(anime.coverImage.color);
  const mainStudios = anime.studios.edges.filter((e) => e.isMain).map((e) => e.node);
  const producers = anime.studios.edges.filter((e) => !e.isMain).map((e) => e.node);
  const streaming = anime.externalLinks.filter((l) => l.type === 'STREAMING');
  const otherLinks = anime.externalLinks.filter((l) => l.type !== 'STREAMING');
  const rankings = [...anime.rankings].sort((a, b) => Number(b.allTime) - Number(a.allTime) || a.rank - b.rank).slice(0, 4);
  const recommendations = anime.recommendations.nodes
    .map((n) => n.mediaRecommendation)
    .filter((m): m is NonNullable<typeof m> => !!m && !m.isAdult);
  const relations = anime.relations.edges;
  const animeRef = { id: anime.id, title, image: anime.coverImage.large, episodes: anime.episodes };

  const sections = [
    { id: 'overview', label: t('overview') },
    { id: 'relations', label: t('relations') },
    { id: 'characters', label: t('characters') },
    { id: 'staff', label: t('staff') },
    { id: 'episodes', label: t('episodes') },
    { id: 'stats', label: t('stats') },
    { id: 'music', label: t('music') },
    { id: 'recommendations', label: t('recommendations') },
  ];

  return (
    <div style={{ '--card-accent': accent } as React.CSSProperties}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(anime)).replace(/</g, '\\u003c') }} />

      {/* Banner */}
      <div className="relative h-[170px] w-full overflow-hidden border-[3px] border-ink bg-ink shadow-brut sm:h-[250px] lg:h-[290px]">
        {anime.bannerImage ? (
          <Image src={anime.bannerImage} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <Image src={anime.coverImage.extraLarge} alt="" fill priority sizes="100vw" className="scale-125 object-cover blur-3xl" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
      </div>

      <div className="relative -mt-20 px-3 sm:-mt-28 sm:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* ---------- Sidebar (top: poster & actions) ---------- */}
          <div className="space-y-5 lg:col-start-1 lg:row-start-1">
            <div className="flex gap-4 lg:block">
              <div
                className="relative aspect-[2/3] w-36 shrink-0 overflow-hidden border-[3px] border-ink bg-surface-3 shadow-brut-lg sm:w-44 lg:w-full"
              >
                <Image src={anime.coverImage.extraLarge} alt={title} fill priority sizes="(max-width: 1024px) 180px, 280px" className="object-cover" />
              </div>
              {/* Mobile title block */}
              <div className="flex min-w-0 flex-1 flex-col justify-end pb-1 lg:hidden">
                <h1 className="font-display text-2xl uppercase leading-tight sm:text-3xl">{title}</h1>
                {anime.title.native && <p className="mt-1 text-sm text-fg-3">{anime.title.native}</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <WatchlistButton anime={animeRef} className="flex-1" />
              <FavoriteButton anime={animeRef} />
              <ShareButton title={title} />
            </div>

            {anime.nextAiringEpisode && (
              <div className="panel bg-pop-yellow p-4 text-center">
                <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-bold uppercase">
                  <CalendarClock className="h-4 w-4" strokeWidth={2.5} />
                  {t('nextEpisodeIn', { ep: anime.nextAiringEpisode.episode })}
                </p>
                <Countdown to={anime.nextAiringEpisode.airingAt} live className="flex justify-center gap-4" />
              </div>
            )}

          </div>

          {/* ---------- Main ---------- */}
          <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-32">
            <div className="hidden lg:block">
              <h1 className="text-balance font-display text-4xl uppercase leading-[1.05] xl:text-5xl">{title}</h1>
              {(anime.title.native || (anime.title.english && anime.title.romaji !== anime.title.english)) && (
                <p className="mt-2 font-bold text-fg-3">
                  {[anime.title.english ? anime.title.romaji : null, anime.title.native].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            {/* Stat strip */}
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4">
              {anime.averageScore ? (
                <div className="flex items-center gap-3">
                  <ScoreBadge score={anime.averageScore} />
                  <div>
                    <p className="text-xs font-bold uppercase">{t('averageScore')}</p>
                    {anime.meanScore ? (
                      <p className="text-sm text-fg-2">
                        {t('meanScore')}: <span className="font-semibold text-fg">{formatScore(anime.meanScore)}</span>
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" strokeWidth={2.5} />
                <span className="font-semibold">{compactNumber(anime.popularity, locale)}</span>
                <span className="text-fg-3">{t('members')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 fill-pop-pink" strokeWidth={2.5} />
                <span className="font-semibold">{compactNumber(anime.favourites, locale)}</span>
                <span className="text-fg-3">{t('favorites')}</span>
              </div>
              {anime.trending > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
                  <span className="font-semibold">{anime.trending}</span>
                  <span className="text-fg-3">{t('trendingLabel')}</span>
                </div>
              )}
            </div>

            {rankings.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {rankings.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-1.5 border-2 border-ink bg-white px-2.5 py-1 text-xs font-medium shadow-brut-sm">
                    {r.type === 'RATED' ? <Star className="h-3.5 w-3.5 fill-pop-yellow" strokeWidth={2.5} /> : <Trophy className="h-3.5 w-3.5 fill-pop-mint" strokeWidth={2.5} />}
                    <span className="font-bold text-fg">#{r.rank}</span>
                    {r.type === 'RATED' ? t('rankHighestRated') : t('rankMostPopular')}{' '}
                    {r.allTime ? t('rankAllTime') : [r.season ? label.season(r.season, locale) : null, r.year].filter(Boolean).join(' ')}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <Link
                  key={g}
                  href={`/browse?genres=${encodeURIComponent(g)}`}
                  className="chip h-8"
                >
                  {g}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <SectionNav sections={sections} />
            </div>

            <div className="space-y-14">
              <section id="overview" className="scroll-mt-32 space-y-8">
                <div>
                  <h2 className="section-heading mb-3">
                    <span className="bar" />
                    {t('synopsis')}
                  </h2>
                  <Synopsis text={anime.description} />
                </div>
                {anime.trailer?.site === 'youtube' && (
                  <div>
                    <h3 className="mb-3 font-display text-base uppercase">{t('trailer')}</h3>
                    <div className="max-w-3xl">
                      <Trailer id={anime.trailer.id} title={title} />
                    </div>
                  </div>
                )}
                {anime.tags.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-display text-base uppercase">{t('tags')}</h3>
                    <TagList tags={anime.tags} />
                  </div>
                )}
              </section>

              {relations.length > 0 && (
                <section id="relations" className="scroll-mt-32">
                  <h2 className="section-heading mb-4">
                    <span className="bar" />
                    {t('relations')}
                  </h2>
                  <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3">
                    {relations.map((edge) => {
                      const node = edge.node;
                      const internal = node.type === 'ANIME';
                      const content = (
                        <>
                          <span className="relative h-24 w-16 shrink-0 overflow-hidden border-2 border-ink bg-surface-2">
                            <Image src={node.coverImage.large} alt="" fill sizes="64px" className="object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="bg-pop-yellow px-1 text-[11px] font-bold uppercase tracking-wider">
                              {label.relation(edge.relationType, locale)}
                            </span>
                            <span className="mt-1 line-clamp-2 text-sm font-bold leading-snug">{titleOf(node.title)}</span>
                            <span className="mt-1 block text-xs text-fg-3">
                              {[label.format(node.format, locale), label.status(node.status, locale)].filter(Boolean).join(' · ')}
                              {!internal && <ExternalLink className="ml-1 inline h-3 w-3" />}
                            </span>
                          </span>
                        </>
                      );
                      return internal ? (
                        <Link key={edge.id} href={`/anime/${node.id}`} className="panel panel-hover flex w-[280px] shrink-0 items-center gap-3 p-2.5 sm:w-auto">
                          {content}
                        </Link>
                      ) : (
                        <a
                          key={edge.id}
                          href={node.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="panel panel-hover flex w-[280px] shrink-0 items-center gap-3 p-2.5 sm:w-auto"
                        >
                          {content}
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

              {anime.characters.edges.length > 0 && (
                <section id="characters" className="scroll-mt-32">
                  <h2 className="section-heading mb-4">
                    <span className="bar" />
                    {t('characters')}
                  </h2>
                  <CharactersSection animeId={anime.id} initial={anime.characters.edges} initialHasNext={anime.characters.pageInfo.hasNextPage} />
                </section>
              )}

              {anime.staff.edges.length > 0 && (
                <section id="staff" className="scroll-mt-32">
                  <h2 className="section-heading mb-4">
                    <span className="bar" />
                    {t('staff')}
                  </h2>
                  <StaffSection animeId={anime.id} initial={anime.staff.edges} initialHasNext={anime.staff.pageInfo.hasNextPage} />
                </section>
              )}

              <Suspense fallback={<div className="skeleton h-64" />}>
                <EpisodesSection idMal={anime.status === 'NOT_YET_RELEASED' ? null : anime.idMal} streaming={anime.streamingEpisodes} />
              </Suspense>

              {anime.stats && ((anime.stats.scoreDistribution?.length ?? 0) > 0 || (anime.stats.statusDistribution?.length ?? 0) > 0) && (
                <section id="stats" className="scroll-mt-32">
                  <h2 className="section-heading mb-4">
                    <span className="bar" />
                    {t('stats')}
                  </h2>
                  <Stats stats={anime.stats} />
                </section>
              )}

              <Suspense fallback={null}>
                <MusicSection idMal={anime.idMal} />
              </Suspense>

              {recommendations.length > 0 && (
                <div id="recommendations" className="scroll-mt-32">
                  <AnimeCarousel title={t('recommendations')} anime={recommendations} />
                </div>
              )}
            </div>
          </div>

          {/* ---------- Sidebar (details) — after main content on mobile ---------- */}
          <aside className="space-y-5 lg:col-start-1 lg:row-start-2">
            {streaming.length > 0 && (
              <div className="panel p-4">
                <h3 className="mb-3 font-display text-base uppercase">{t('whereToWatch')}</h3>
                <div className="grid gap-2">
                  {streaming.map((l) => (
                    <a
                      key={l.id}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 border-2 border-ink bg-white px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-pop-yellow"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center border-2 border-ink" style={{ background: l.color ?? '#333' }}>
                        {l.icon ? <img src={l.icon} alt="" className="h-4 w-4" loading="lazy" /> : <ExternalLink className="h-3.5 w-3.5" />}
                      </span>
                      <span className="flex-1 truncate">{l.site}</span>
                      {l.language && <span className="text-[10px] text-fg-3">{l.language}</span>}
                      <ExternalLink className="h-3.5 w-3.5 text-fg-3 opacity-0 transition group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="panel px-4 py-2">
              <h3 className="pb-1 pt-2 font-display text-base uppercase">{t('information')}</h3>
              <dl className="divide-y divide-line sm:grid sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0 lg:block lg:divide-y">
                <InfoRow k={t('format')}>{label.format(anime.format, locale)}</InfoRow>
                <InfoRow k={t('episodeCount')}>{anime.episodes}</InfoRow>
                <InfoRow k={t('duration')}>{anime.duration ? t(anime.episodes === 1 ? 'minutes' : 'perEpisode', { n: anime.duration }) : null}</InfoRow>
                <InfoRow k={t('status')}>{label.status(anime.status, locale)}</InfoRow>
                <InfoRow k={t('startDate')}>{formatFuzzyDate(anime.startDate, locale)}</InfoRow>
                <InfoRow k={t('endDate')}>{formatFuzzyDate(anime.endDate, locale)}</InfoRow>
                <InfoRow k={t('season')}>
                  {anime.season && anime.seasonYear ? (
                    <Link href={`/seasonal?season=${anime.season}&year=${anime.seasonYear}`} className="hover:text-accent">
                      {label.season(anime.season, locale)} {anime.seasonYear}
                    </Link>
                  ) : null}
                </InfoRow>
                <InfoRow k={t('studios')}>
                  {mainStudios.length
                    ? mainStudios.map((s, i) => (
                        <span key={s.id}>
                          {i > 0 && ', '}
                          <Link href={`/studio/${s.id}`} className="bg-pop-mint px-1 font-bold hover:bg-pop-yellow">
                            {s.name}
                          </Link>
                        </span>
                      ))
                    : null}
                </InfoRow>
                <InfoRow k={t('producers')}>
                  {producers.length
                    ? producers.map((s, i) => (
                        <span key={s.id}>
                          {i > 0 && ', '}
                          <Link href={`/studio/${s.id}`} className="hover:text-accent">
                            {s.name}
                          </Link>
                        </span>
                      ))
                    : null}
                </InfoRow>
                <InfoRow k={t('source')}>{label.source(anime.source, locale)}</InfoRow>
                <InfoRow k={t('country')}>{label.country(anime.countryOfOrigin, locale)}</InfoRow>
                <InfoRow k={t('hashtag')}>{anime.hashtag}</InfoRow>
                <InfoRow k={t('romaji')}>{anime.title.romaji}</InfoRow>
                <InfoRow k={t('english')}>{anime.title.english}</InfoRow>
                <InfoRow k={t('native')}>{anime.title.native}</InfoRow>
                <InfoRow k={t('synonyms')}>
                  {anime.synonyms.length ? (
                    <span className="flex flex-col gap-0.5">
                      {anime.synonyms.slice(0, 6).map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </span>
                  ) : null}
                </InfoRow>
              </dl>
            </div>

            <Suspense fallback={<div className="skeleton h-40" />}>
              <MalInfoCard idMal={anime.idMal} />
            </Suspense>

            {(otherLinks.length > 0 || anime.siteUrl) && (
              <div className="panel p-4">
                <h3 className="mb-3 font-display text-base uppercase">{t('externalLinks')}</h3>
                <div className="flex flex-wrap gap-2">
                  <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer" className="chip">
                    <AniListIcon className="h-3.5 w-3.5 text-[#3db4f2]" /> AniList
                  </a>
                  {otherLinks.map((l) => (
                    <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="chip">
                      {l.icon ? (
                        <span className="grid h-4 w-4 place-items-center " style={{ background: l.color ?? 'transparent' }}>
                          <img src={l.icon} alt="" className="h-3 w-3" loading="lazy" />
                        </span>
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                      {l.site}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
