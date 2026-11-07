import { NextResponse } from 'next/server';
import { anilistFetch, AniListError } from '@/lib/anilist/client';
import { ANIME_INDEX } from '@/lib/anilist/queries';

interface IndexMedia {
  id: number;
  title: { romaji: string; english: string | null };
  status: string | null;
  format: string | null;
  seasonYear: number | null;
}

export interface IndexItem {
  /** id */ i: number;
  /** romaji */ r: string;
  /** english */ e: string | null;
  /** status */ s: string | null;
  /** format */ f: string | null;
  /** year */ y: number | null;
}

export interface IndexPage {
  page: number;
  hasNext: boolean;
  items: IndexItem[];
}

/**
 * One page (50 titles) of the A–Z anime index. Each page is cached for a day in
 * Next's data cache and at the CDN, so AniList is only hit once per page per day
 * no matter how many people open the list.
 */
export async function GET(request: Request) {
  const page = Math.min(200, Math.max(1, Number(new URL(request.url).searchParams.get('page')) || 1));
  try {
    const data = await anilistFetch<{ Page: { pageInfo: { hasNextPage: boolean }; media: IndexMedia[] } }>(
      ANIME_INDEX,
      { page },
      { revalidate: 86400, retries: 1 }
    );
    const body: IndexPage = {
      page,
      hasNext: data.Page.pageInfo.hasNextPage && data.Page.media.length > 0,
      items: data.Page.media.map((m) => ({ i: m.id, r: m.title.romaji, e: m.title.english, s: m.status, f: m.format, y: m.seasonYear })),
    };
    return NextResponse.json(body, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    });
  } catch (error) {
    const status = error instanceof AniListError && error.status === 429 ? 429 : 502;
    return NextResponse.json({ error: 'AniList unavailable' }, { status, headers: { 'Retry-After': '5', 'Cache-Control': 'no-store' } });
  }
}
