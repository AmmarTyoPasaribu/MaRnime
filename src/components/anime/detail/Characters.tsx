'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { anilistFetch } from '@/lib/anilist/client';
import { ANIME_CHARACTERS_PAGE, ANIME_STAFF_PAGE } from '@/lib/anilist/queries';
import type { CharacterEdge, StaffEdge } from '@/lib/anilist/types';
import { label } from '@/lib/i18n/labels';
import { cn } from '@/lib/utils';
import { useI18n } from '@/providers/I18nProvider';

export function CharactersSection({
  animeId,
  initial,
  initialHasNext,
}: {
  animeId: number;
  initial: CharacterEdge[];
  initialHasNext: boolean;
}) {
  const { t, locale } = useI18n();
  const [edges, setEdges] = useState(initial);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    edges.forEach((e) => e.voiceActors.forEach((v) => counts.set(v.languageV2, (counts.get(v.languageV2) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([l]) => l);
  }, [edges]);
  const [lang, setLang] = useState('Japanese');
  const activeLang = languages.includes(lang) ? lang : languages[0];

  const loadMore = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await anilistFetch<{ Media: { characters: { pageInfo: { hasNextPage: boolean }; edges: CharacterEdge[] } } }>(
        ANIME_CHARACTERS_PAGE,
        { id: animeId, page: page + 1 }
      );
      const next = data.Media.characters;
      // Page 1 server-side used perPage 12, client pages use 24 — dedupe by id.
      setEdges((prev) => {
        const seen = new Set(prev.map((e) => e.id));
        return [...prev, ...next.edges.filter((e) => !seen.has(e.id))];
      });
      setHasNext(next.pageInfo.hasNextPage);
      setPage((p) => p + 1);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {languages.length > 1 && (
        <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
          {languages.map((l) => (
            <button key={l} onClick={() => setLang(l)} data-active={activeLang === l} className="chip">
              {label.language(l, locale)}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {edges.map((edge) => {
          const va = edge.voiceActors.find((v) => v.languageV2 === activeLang);
          return (
            <div key={edge.id} className="panel flex items-stretch overflow-hidden">
              <Link href={`/character/${edge.node.id}`} className="group flex min-w-0 flex-1 items-center gap-3 p-2 pr-1">
                <span className="relative h-[72px] w-12 shrink-0 overflow-hidden border-2 border-ink bg-surface-2">
                  <Image src={edge.node.image.medium} alt={edge.node.name.full} fill sizes="48px" className="object-cover transition duration-500 group-hover:scale-110" />
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-bold leading-snug group-hover:bg-pop-yellow">{edge.node.name.full}</span>
                  <span className={cn('mt-1 block w-fit text-xs font-bold', edge.role === 'MAIN' ? 'border-2 border-ink bg-pop-yellow px-1' : 'text-fg-3')}>
                    {label.role(edge.role, locale)}
                  </span>
                </span>
              </Link>
              {va && (
                <Link href={`/staff/${va.id}`} className="group flex min-w-0 flex-1 items-center justify-end gap-3 p-2 pl-1 text-right">
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-medium leading-snug group-hover:bg-pop-yellow">{va.name.full}</span>
                    <span className="mt-0.5 block text-xs text-fg-3">{label.language(va.languageV2, locale)}</span>
                  </span>
                  <span className="relative h-[72px] w-12 shrink-0 overflow-hidden border-2 border-ink bg-surface-2">
                    <Image src={va.image.medium} alt={va.name.full} fill sizes="48px" className="object-cover transition duration-500 group-hover:scale-110" />
                  </span>
                </Link>
              )}
            </div>
          );
        })}
      </div>
      {hasNext && (
        <div className="mt-5 flex flex-col items-center gap-2">
          <button onClick={loadMore} disabled={loading} className="btn btn-secondary">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t('loading') : t('loadMore')}
          </button>
          {error && <p className="text-xs text-danger">{t('actionFailed')}</p>}
        </div>
      )}
    </div>
  );
}

export function StaffSection({ animeId, initial, initialHasNext }: { animeId: number; initial: StaffEdge[]; initialHasNext: boolean }) {
  const { t } = useI18n();
  const [edges, setEdges] = useState(initial);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const data = await anilistFetch<{ Media: { staff: { pageInfo: { hasNextPage: boolean }; edges: StaffEdge[] } } }>(ANIME_STAFF_PAGE, {
        id: animeId,
        page: page + 1,
      });
      setEdges((prev) => {
        const seen = new Set(prev.map((e) => e.id));
        return [...prev, ...data.Media.staff.edges.filter((e) => !seen.has(e.id))];
      });
      setHasNext(data.Media.staff.pageInfo.hasNextPage);
      setPage((p) => p + 1);
    } catch {
      // keep current list
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {edges.map((edge) => (
          <Link key={edge.id} href={`/staff/${edge.node.id}`} className="panel panel-hover group flex items-center gap-3 p-2">
            <span className="relative h-[72px] w-12 shrink-0 overflow-hidden border-2 border-ink bg-surface-2">
              <Image src={edge.node.image.medium} alt={edge.node.name.full} fill sizes="48px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <span className="line-clamp-1 text-sm font-bold group-hover:bg-pop-yellow">{edge.node.name.full}</span>
              <span className="mt-0.5 line-clamp-2 text-xs text-fg-3">{edge.role}</span>
            </span>
          </Link>
        ))}
      </div>
      {hasNext && (
        <div className="mt-5 flex justify-center">
          <button onClick={loadMore} disabled={loading} className="btn btn-secondary">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t('loading') : t('loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
