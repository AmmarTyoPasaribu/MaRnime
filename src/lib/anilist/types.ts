// AniList GraphQL API types (only the fields MaRnime queries)

export type MediaSort =
  | 'TRENDING_DESC'
  | 'POPULARITY_DESC'
  | 'SCORE_DESC'
  | 'FAVOURITES_DESC'
  | 'START_DATE_DESC'
  | 'START_DATE'
  | 'TITLE_ROMAJI'
  | 'EPISODES_DESC'
  | 'UPDATED_AT_DESC'
  | 'SEARCH_MATCH';

export type MediaFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';
export type MediaStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
export type MediaSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
export type CharacterRole = 'MAIN' | 'SUPPORTING' | 'BACKGROUND';

export interface FuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface MediaTitle {
  romaji: string;
  english: string | null;
  native: string | null;
  userPreferred?: string;
}

export interface MediaCoverImage {
  extraLarge: string;
  large: string;
  medium: string;
  color: string | null;
}

export interface Studio {
  id: number;
  name: string;
  isAnimationStudio: boolean;
}

export interface AiringSchedule {
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
}

/** Fields returned by the shared MediaFields fragment (cards, lists). */
export interface MediaSummary {
  id: number;
  idMal: number | null;
  title: MediaTitle;
  coverImage: MediaCoverImage;
  bannerImage: string | null;
  format: MediaFormat | null;
  status: MediaStatus | null;
  episodes: number | null;
  duration: number | null;
  season: MediaSeason | null;
  seasonYear: number | null;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number;
  favourites: number;
  genres: string[];
  isAdult: boolean;
  countryOfOrigin: string | null;
  nextAiringEpisode: AiringSchedule | null;
  studios: { nodes: Studio[] };
  description?: string | null;
  startDate?: FuzzyDate;
  type?: 'ANIME' | 'MANGA';
}

export interface Tag {
  id: number;
  name: string;
  description: string | null;
  category: string;
  rank: number;
  isMediaSpoiler: boolean;
  isGeneralSpoiler: boolean;
}

export interface Person {
  id: number;
  name: { full: string; native: string | null };
  image: { large: string; medium: string };
}

export interface VoiceActor extends Person {
  languageV2: string;
}

export interface CharacterEdge {
  id: number;
  role: CharacterRole;
  node: Person;
  voiceActors: VoiceActor[];
}

export interface StaffEdge {
  id: number;
  role: string;
  node: Person;
}

export interface RelatedMedia {
  id: number;
  type: 'ANIME' | 'MANGA';
  title: MediaTitle;
  coverImage: MediaCoverImage;
  format: MediaFormat | string | null;
  status: MediaStatus | null;
  siteUrl?: string;
}

export interface MediaRelationEdge {
  id: number;
  relationType: string;
  node: RelatedMedia;
}

export interface Recommendation {
  id: number;
  rating: number;
  mediaRecommendation: MediaSummary | null;
}

export interface ExternalLink {
  id: number;
  site: string;
  url: string;
  type: 'INFO' | 'STREAMING' | 'SOCIAL';
  language: string | null;
  color: string | null;
  icon: string | null;
}

export interface StreamingEpisode {
  title: string | null;
  thumbnail: string | null;
  url: string | null;
  site: string | null;
}

export interface MediaRank {
  id: number;
  rank: number;
  type: 'RATED' | 'POPULAR';
  allTime: boolean;
  context: string;
  season: MediaSeason | null;
  year: number | null;
  format: string;
}

export interface MediaStats {
  scoreDistribution: { score: number; amount: number }[] | null;
  statusDistribution: { status: string; amount: number }[] | null;
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface MediaDetail extends Omit<MediaSummary, 'studios'> {
  description: string | null;
  synonyms: string[];
  hashtag: string | null;
  source: string | null;
  siteUrl: string;
  startDate: FuzzyDate;
  endDate: FuzzyDate;
  trending: number;
  tags: Tag[];
  trailer: { id: string; site: string; thumbnail: string | null } | null;
  studios: { edges: { isMain: boolean; node: Studio }[] };
  characters: { pageInfo: { hasNextPage: boolean }; edges: CharacterEdge[] };
  staff: { pageInfo: { hasNextPage: boolean }; edges: StaffEdge[] };
  relations: { edges: MediaRelationEdge[] };
  recommendations: { nodes: Recommendation[] };
  externalLinks: ExternalLink[];
  streamingEpisodes: StreamingEpisode[];
  rankings: MediaRank[];
  stats: MediaStats | null;
}

export interface MediaPage<T = MediaSummary> {
  pageInfo: PageInfo;
  media: T[];
}

export interface CharacterDetail {
  id: number;
  name: { full: string; native: string | null; alternative: string[] };
  image: { large: string; medium: string };
  description: string | null;
  gender: string | null;
  dateOfBirth: FuzzyDate;
  age: string | null;
  bloodType: string | null;
  favourites: number;
  siteUrl: string;
  media: {
    edges: {
      id: number;
      characterRole: CharacterRole;
      voiceActors: VoiceActor[];
      node: MediaSummary;
    }[];
  };
}

export interface StaffDetail {
  id: number;
  name: { full: string; native: string | null; alternative: string[] };
  image: { large: string; medium: string };
  description: string | null;
  primaryOccupations: string[];
  gender: string | null;
  dateOfBirth: FuzzyDate;
  dateOfDeath: FuzzyDate;
  age: number | null;
  yearsActive: number[];
  homeTown: string | null;
  bloodType: string | null;
  languageV2: string | null;
  favourites: number;
  siteUrl: string;
  staffMedia: {
    edges: { id: number; staffRole: string; node: MediaSummary }[];
  };
  characterMedia: {
    edges: {
      id: number;
      characterRole: CharacterRole;
      node: MediaSummary;
      characters: Person[];
    }[];
  };
}

export interface StudioDetail {
  id: number;
  name: string;
  isAnimationStudio: boolean;
  favourites: number;
  siteUrl: string;
  media: {
    pageInfo: PageInfo;
    edges: { isMainStudio: boolean; node: MediaSummary }[];
  };
}

export interface AiringScheduleItem {
  id: number;
  airingAt: number;
  episode: number;
  timeUntilAiring: number;
  media: MediaSummary;
}
