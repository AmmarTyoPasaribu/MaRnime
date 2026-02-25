// AniList GraphQL API Types

export interface MediaTitle {
  romaji: string;
  english: string | null;
  native: string | null;
}

export interface MediaCoverImage {
  extraLarge: string;
  large: string;
  medium: string;
  color: string | null;
}

export interface MediaTrailer {
  id: string;
  site: string;
  thumbnail: string;
}

export interface Studio {
  id: number;
  name: string;
  isAnimationStudio: boolean;
}

export interface StudioConnection {
  nodes: Studio[];
}

export interface Genre {
  genre: string;
}

export interface Tag {
  id: number;
  name: string;
  category: string;
  rank: number;
}

export interface AiringSchedule {
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
}

export interface CharacterName {
  full: string;
  native: string | null;
}

export interface CharacterImage {
  large: string;
  medium: string;
}

export interface VoiceActor {
  id: number;
  name: {
    full: string;
    native: string | null;
  };
  image: {
    large: string;
    medium: string;
  };
  languageV2: string;
}

export interface CharacterEdge {
  id: number;
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  node: {
    id: number;
    name: CharacterName;
    image: CharacterImage;
  };
  voiceActors: VoiceActor[];
}

export interface StaffName {
  full: string;
  native: string | null;
}

export interface StaffImage {
  large: string;
  medium: string;
}

export interface StaffEdge {
  id: number;
  role: string;
  node: {
    id: number;
    name: StaffName;
    image: StaffImage;
  };
}

export interface MediaRelation {
  id: number;
  relationType: string;
  node: {
    id: number;
    title: MediaTitle;
    coverImage: MediaCoverImage;
    format: string;
    status: string;
    type: string;
  };
}

export interface Recommendation {
  id: number;
  rating: number;
  mediaRecommendation: {
    id: number;
    title: MediaTitle;
    coverImage: MediaCoverImage;
    format: string;
    episodes: number | null;
    averageScore: number | null;
  };
}

export interface Media {
  id: number;
  idMal: number | null;
  title: MediaTitle;
  coverImage: MediaCoverImage;
  bannerImage: string | null;
  description: string | null;
  format: string;
  status: string;
  episodes: number | null;
  duration: number | null;
  season: string | null;
  seasonYear: number | null;
  startDate: { year: number | null; month: number | null; day: number | null };
  endDate: { year: number | null; month: number | null; day: number | null };
  averageScore: number | null;
  meanScore: number | null;
  popularity: number;
  favourites: number;
  trending: number;
  genres: string[];
  tags: Tag[];
  studios: StudioConnection;
  source: string | null;
  trailer: MediaTrailer | null;
  nextAiringEpisode: AiringSchedule | null;
  type: string;
  isAdult: boolean;
  // For detail page
  characters?: { edges: CharacterEdge[] };
  staff?: { edges: StaffEdge[] };
  relations?: { edges: MediaRelation[] };
  recommendations?: { nodes: Recommendation[] };
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface MediaPage {
  pageInfo: PageInfo;
  media: Media[];
}

export interface CharacterDetail {
  id: number;
  name: CharacterName;
  image: CharacterImage;
  description: string | null;
  gender: string | null;
  dateOfBirth: { year: number | null; month: number | null; day: number | null };
  age: string | null;
  favourites: number;
  media: {
    edges: {
      characterRole: string;
      voiceActors: VoiceActor[];
      node: {
        id: number;
        title: MediaTitle;
        coverImage: MediaCoverImage;
        format: string;
        type: string;
      };
    }[];
  };
}

export interface StaffDetail {
  id: number;
  name: StaffName;
  image: StaffImage;
  description: string | null;
  primaryOccupations: string[];
  gender: string | null;
  dateOfBirth: { year: number | null; month: number | null; day: number | null };
  age: number | null;
  yearsActive: number[];
  homeTown: string | null;
  favourites: number;
  staffMedia: {
    edges: {
      staffRole: string;
      node: {
        id: number;
        title: MediaTitle;
        coverImage: MediaCoverImage;
        format: string;
        type: string;
      };
    }[];
  };
  characters: {
    edges: {
      role: string;
      node: {
        id: number;
        name: CharacterName;
        image: CharacterImage;
      };
      media: {
        id: number;
        title: MediaTitle;
        coverImage: MediaCoverImage;
        type: string;
      }[];
    }[];
  };
}

// Search/Filter types
export type MediaSort =
  | 'TRENDING_DESC'
  | 'POPULARITY_DESC'
  | 'SCORE_DESC'
  | 'FAVOURITES_DESC'
  | 'START_DATE_DESC'
  | 'UPDATED_AT_DESC'
  | 'SEARCH_MATCH';

export type MediaFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC';
export type MediaStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
export type MediaSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export interface SearchFilters {
  search?: string;
  genres?: string[];
  format?: MediaFormat;
  status?: MediaStatus;
  season?: MediaSeason;
  seasonYear?: number;
  sort?: MediaSort[];
  page?: number;
  perPage?: number;
  isAdult?: boolean;
}
