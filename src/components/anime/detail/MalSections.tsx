import { Disc3, ExternalLink, Music2 } from 'lucide-react';
import { getMalAnime, getMalEpisodes, parseTheme } from '@/lib/jikan';
import type { StreamingEpisode } from '@/lib/anilist/types';
import { getI18n } from '@/lib/i18n/server';
import { compactNumber, formatNumber } from '@/lib/utils';
import { MalIcon } from '@/components/ui/BrandIcons';
import { MalEpisodeList, StreamingEpisodeGrid } from './EpisodeList';

/** Sidebar card with MyAnimeList stats (score, rank, rating, broadcast, producers). */
export async function MalInfoCard({ idMal }: { idMal: number | null }) {
  if (!idMal) return null;
  const [mal, { t, locale }] = await Promise.all([getMalAnime(idMal), getI18n()]);
  if (!mal) return null;

  const rows: [string, string | null][] = [
    [t('ageRating'), mal.rating],
    [t('broadcast'), mal.broadcast?.string && mal.broadcast.string !== 'Unknown' ? mal.broadcast.string : null],
    [t('licensors'), mal.licensors.map((p) => p.name).join(', ') || null],
  ];

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-4 border-b border-line bg-[#2e51a2]/15 p-4">
        <MalIcon className="h-6 w-6 text-[#5b7fd6]" />
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-fg-3">{t('malScore')}</p>
          <p className="font-display text-2xl font-extrabold">
            {mal.score?.toFixed(2) ?? '–'}
            {mal.scored_by ? <span className="ml-1.5 text-xs font-medium text-fg-3">{t('scoredBy', { n: compactNumber(mal.scored_by, locale) })}</span> : null}
          </p>
        </div>
        {mal.rank && (
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-fg-3">{t('malRank')}</p>
            <p className="font-display text-xl font-bold">#{formatNumber(mal.rank, locale)}</p>
          </div>
        )}
      </div>
      <dl className="space-y-3 p-4 text-sm">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-bold text-fg-3">{k}</dt>
              <dd className="mt-0.5 text-fg-2">{v}</dd>
            </div>
          ))}
      </dl>
      <a
        href={mal.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 border-t-[3px] border-ink py-2.5 text-xs font-bold text-fg-3 transition hover:bg-pop-yellow hover:text-fg"
      >
        {t('viewOnMal')}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function ThemeList({ items, icon }: { items: string[]; icon: React.ReactNode }) {
  return (
    <ol className="space-y-2">
      {items.map((raw, i) => {
        const th = parseTheme(raw);
        const q = encodeURIComponent(`${th.title} ${th.artist ?? ''}`.trim());
        return (
          <li key={i}>
            <a
              href={`https://www.youtube.com/results?search_query=${q}`}
              target="_blank"
              rel="noopener noreferrer"
              className="panel panel-hover group flex items-center gap-3 p-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-ink bg-pop-lilac">{icon}</span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 text-sm font-bold">{th.title}</span>
                <span className="line-clamp-1 text-xs text-fg-3">
                  {[th.artist, th.episodes].filter(Boolean).join(' · ')}
                </span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-fg-3 opacity-0 transition group-hover:opacity-100" />
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** Opening / ending themes from MAL. Renders nothing when unavailable. */
export async function MusicSection({ idMal }: { idMal: number | null }) {
  if (!idMal) return null;
  const [mal, { t }] = await Promise.all([getMalAnime(idMal), getI18n()]);
  const openings = mal?.theme?.openings ?? [];
  const endings = mal?.theme?.endings ?? [];
  if (!openings.length && !endings.length) return null;

  return (
    <section id="music" className="scroll-mt-32">
      <h2 className="section-heading mb-4">
        <span className="bar" />
        {t('music')}
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {openings.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-bold text-fg-2">{t('openings')}</h3>
            <ThemeList items={openings} icon={<Disc3 className="h-4 w-4" />} />
          </div>
        )}
        {endings.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-bold text-fg-2">{t('endings')}</h3>
            <ThemeList items={endings} icon={<Music2 className="h-4 w-4" />} />
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-fg-3">{t('dataFromMal')}</p>
    </section>
  );
}

/** Episode titles (MAL) with a fallback to AniList's streaming episodes. */
export async function EpisodesSection({ idMal, streaming }: { idMal: number | null; streaming: StreamingEpisode[] }) {
  const [episodes, { t }] = await Promise.all([idMal ? getMalEpisodes(idMal) : Promise.resolve(null), getI18n()]);
  if (!episodes && !streaming.length) return null;

  return (
    <section id="episodes" className="scroll-mt-32">
      <h2 className="section-heading mb-4">
        <span className="bar" />
        {episodes ? t('episodeList') : t('streamingEpisodes')}
      </h2>
      {episodes ? <MalEpisodeList episodes={episodes} /> : <StreamingEpisodeGrid episodes={streaming} />}
      {episodes && <p className="mt-3 text-xs text-fg-3">{t('dataFromMal')}</p>}
    </section>
  );
}
