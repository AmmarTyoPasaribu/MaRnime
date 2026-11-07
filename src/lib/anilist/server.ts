import { cache } from 'react';
import { notFound } from 'next/navigation';
import { anilistFetch, isNotFound } from './client';
import { ANIME_DETAIL, CHARACTER_DETAIL, STAFF_DETAIL, STUDIO_DETAIL } from './queries';
import type { CharacterDetail, MediaDetail, StaffDetail, StudioDetail } from './types';

/** Parse a route id or trigger the 404 page. */
export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return id;
}

async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }
}

// React `cache` dedupes calls between generateMetadata and the page itself.

export const getAnime = cache(async (id: number) => {
  const data = await orNotFound(anilistFetch<{ Media: MediaDetail | null }>(ANIME_DETAIL, { id }, { revalidate: 900 }));
  if (!data.Media || data.Media.isAdult) notFound();
  return data.Media;
});

export const getCharacter = cache(async (id: number) => {
  const data = await orNotFound(anilistFetch<{ Character: CharacterDetail | null }>(CHARACTER_DETAIL, { id }, { revalidate: 3600 }));
  if (!data.Character) notFound();
  return data.Character;
});

export const getStaff = cache(async (id: number) => {
  const data = await orNotFound(anilistFetch<{ Staff: StaffDetail | null }>(STAFF_DETAIL, { id }, { revalidate: 3600 }));
  if (!data.Staff) notFound();
  return data.Staff;
});

export const getStudio = cache(async (id: number, page = 1) => {
  const data = await orNotFound(anilistFetch<{ Studio: StudioDetail | null }>(STUDIO_DETAIL, { id, page }, { revalidate: 3600 }));
  if (!data.Studio) notFound();
  return data.Studio;
});
