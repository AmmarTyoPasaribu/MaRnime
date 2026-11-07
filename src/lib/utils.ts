import type { FuzzyDate, MediaSeason, MediaTitle } from './anilist/types';
import type { Locale } from './i18n/translations';

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const SEASONS: MediaSeason[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

export function getCurrentSeason(date = new Date()): { season: MediaSeason; year: number } {
  const month = date.getMonth(); // 0-11
  return { season: SEASONS[Math.floor(month / 3)], year: date.getFullYear() };
}

export function shiftSeason(season: MediaSeason, year: number, delta: number) {
  const index = SEASONS.indexOf(season) + delta;
  const yearShift = Math.floor(index / 4);
  return { season: SEASONS[((index % 4) + 4) % 4], year: year + yearShift };
}

export function isSeason(value: string | null | undefined): value is MediaSeason {
  return !!value && (SEASONS as string[]).includes(value);
}

export function titleOf(title: Pick<MediaTitle, 'romaji' | 'english'> | null | undefined) {
  if (!title) return '';
  return title.english || title.romaji;
}

/** AniList scores are 0-100; show them as 0-10 with one decimal. */
export function formatScore(score: number | null | undefined) {
  if (!score) return null;
  return (score / 10).toFixed(1);
}

export function scoreColor(score: number | null | undefined) {
  if (!score) return 'var(--color-fg-3)';
  if (score >= 75) return 'var(--color-success)';
  if (score >= 60) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

/** Pop colour for a score sticker (black text on top). */
export function scoreFill(score: number | null | undefined) {
  if (!score) return '#ffffff';
  if (score >= 80) return 'var(--color-pop-mint)';
  if (score >= 70) return 'var(--color-pop-yellow)';
  if (score >= 60) return 'var(--color-pop-orange)';
  return 'var(--color-pop-pink)';
}

export function compactNumber(n: number | null | undefined, locale: Locale = 'en') {
  if (n == null) return '–';
  return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatNumber(n: number | null | undefined, locale: Locale = 'en') {
  if (n == null) return '–';
  return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US').format(n);
}

export function formatCountdown(seconds: number, locale: Locale = 'en') {
  if (seconds <= 0) return locale === 'id' ? 'sekarang' : 'now';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const day = locale === 'id' ? 'h' : 'd';
  const hour = locale === 'id' ? 'j' : 'h';
  if (d > 0) return `${d}${day} ${h}${hour}`;
  if (h > 0) return `${h}${hour} ${m}m`;
  return `${Math.max(m, 1)}m`;
}

export function formatFuzzyDate(date: FuzzyDate | null | undefined, locale: Locale = 'en') {
  if (!date?.year) return null;
  const tag = locale === 'id' ? 'id-ID' : 'en-US';
  if (!date.month) return String(date.year);
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day ?? 1));
  return new Intl.DateTimeFormat(tag, {
    year: 'numeric',
    month: 'short',
    ...(date.day ? { day: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(d);
}

export function formatBirthday(date: FuzzyDate | null | undefined, locale: Locale = 'en') {
  if (!date?.month) return date?.year ? String(date.year) : null;
  const tag = locale === 'id' ? 'id-ID' : 'en-US';
  const d = new Date(Date.UTC(date.year ?? 2000, date.month - 1, date.day ?? 1));
  return new Intl.DateTimeFormat(tag, {
    month: 'long',
    ...(date.day ? { day: 'numeric' } : {}),
    ...(date.year ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(d);
}

/** Strip AniList's HTML from descriptions (keeps line breaks). */
export function cleanDescription(desc: string | null | undefined) {
  if (!desc) return '';
  return desc
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Plain-text version for meta descriptions. */
export function plainText(desc: string | null | undefined, max = 160) {
  const text = cleanDescription(desc)
    .replace(/~!([\s\S]*?)!~/g, '')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Shrink a media object before it is serialised to the client (smaller HTML/RSC payload). */
export function slimMedia<T extends { description?: string | null; coverImage: { extraLarge?: string } }>(m: T, descLength = 0): T {
  return {
    ...m,
    description: descLength ? plainText(m.description, descLength) : null,
    coverImage: { ...m.coverImage, extraLarge: descLength ? m.coverImage.extraLarge : '' },
  };
}

/** "#2dd4bf" -> "45, 212, 191" for use in rgba(var(--x), a). */
export function hexToRgb(hex: string | null | undefined, fallback = '45, 212, 191') {
  if (!hex) return fallback;
  const m = hex.replace('#', '').match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return fallback;
  const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16));
  // Lift very dark colours so glows stay visible on the dark theme.
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum < 60) return fallback;
  return `${r}, ${g}, ${b}`;
}

export function safeRedirect(path: string | null | undefined, fallback = '/') {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return fallback;
  return path;
}
