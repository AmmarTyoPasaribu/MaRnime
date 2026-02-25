import { MediaSeason } from './anilist/types';

export function getCurrentSeason(): { season: MediaSeason; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let season: MediaSeason;
  if (month >= 1 && month <= 3) season = 'WINTER';
  else if (month >= 4 && month <= 6) season = 'SPRING';
  else if (month >= 7 && month <= 9) season = 'SUMMER';
  else season = 'FALL';

  return { season, year };
}

export function formatScore(score: number | null): string {
  if (!score) return 'N/A';
  return (score / 10).toFixed(1);
}

export function formatFormat(format: string): string {
  const map: Record<string, string> = {
    TV: 'TV',
    TV_SHORT: 'TV Short',
    MOVIE: 'Movie',
    SPECIAL: 'Special',
    OVA: 'OVA',
    ONA: 'ONA',
    MUSIC: 'Music',
  };
  return map[format] || format;
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    FINISHED: 'Finished',
    RELEASING: 'Airing',
    NOT_YET_RELEASED: 'Upcoming',
    CANCELLED: 'Cancelled',
    HIATUS: 'Hiatus',
  };
  return map[status] || status;
}

export function formatSeason(season: string | null, year: number | null): string {
  if (!season || !year) return 'TBA';
  const seasonMap: Record<string, string> = {
    WINTER: 'Winter',
    SPRING: 'Spring',
    SUMMER: 'Summer',
    FALL: 'Fall',
  };
  return `${seasonMap[season] || season} ${year}`;
}

export function getTimeUntilAiring(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

export function cleanDescription(desc: string | null): string {
  if (!desc) return '';
  // Remove HTML tags and clean up
  return desc
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}
