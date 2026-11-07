import type { Locale } from './translations';

type Dict = Record<string, { en: string; id: string }>;

const FORMAT: Dict = {
  TV: { en: 'TV', id: 'TV' },
  TV_SHORT: { en: 'TV Short', id: 'TV Pendek' },
  MOVIE: { en: 'Movie', id: 'Film' },
  SPECIAL: { en: 'Special', id: 'Spesial' },
  OVA: { en: 'OVA', id: 'OVA' },
  ONA: { en: 'ONA', id: 'ONA' },
  MUSIC: { en: 'Music', id: 'Musik' },
  MANGA: { en: 'Manga', id: 'Manga' },
  NOVEL: { en: 'Light Novel', id: 'Novel Ringan' },
  ONE_SHOT: { en: 'One Shot', id: 'One Shot' },
};

const STATUS: Dict = {
  FINISHED: { en: 'Finished', id: 'Selesai' },
  RELEASING: { en: 'Airing', id: 'Sedang Tayang' },
  NOT_YET_RELEASED: { en: 'Upcoming', id: 'Akan Datang' },
  CANCELLED: { en: 'Cancelled', id: 'Dibatalkan' },
  HIATUS: { en: 'Hiatus', id: 'Hiatus' },
};

const SEASON: Dict = {
  WINTER: { en: 'Winter', id: 'Dingin' },
  SPRING: { en: 'Spring', id: 'Semi' },
  SUMMER: { en: 'Summer', id: 'Panas' },
  FALL: { en: 'Fall', id: 'Gugur' },
};

const SOURCE: Dict = {
  ORIGINAL: { en: 'Original', id: 'Orisinal' },
  MANGA: { en: 'Manga', id: 'Manga' },
  LIGHT_NOVEL: { en: 'Light Novel', id: 'Novel Ringan' },
  VISUAL_NOVEL: { en: 'Visual Novel', id: 'Visual Novel' },
  VIDEO_GAME: { en: 'Video Game', id: 'Video Game' },
  OTHER: { en: 'Other', id: 'Lainnya' },
  NOVEL: { en: 'Novel', id: 'Novel' },
  DOUJINSHI: { en: 'Doujinshi', id: 'Doujinshi' },
  ANIME: { en: 'Anime', id: 'Anime' },
  WEB_NOVEL: { en: 'Web Novel', id: 'Novel Web' },
  LIVE_ACTION: { en: 'Live Action', id: 'Live Action' },
  GAME: { en: 'Game', id: 'Game' },
  COMIC: { en: 'Comic', id: 'Komik' },
  MULTIMEDIA_PROJECT: { en: 'Multimedia Project', id: 'Proyek Multimedia' },
  PICTURE_BOOK: { en: 'Picture Book', id: 'Buku Bergambar' },
};

const RELATION: Dict = {
  ADAPTATION: { en: 'Adaptation', id: 'Adaptasi' },
  PREQUEL: { en: 'Prequel', id: 'Prekuel' },
  SEQUEL: { en: 'Sequel', id: 'Sekuel' },
  PARENT: { en: 'Parent', id: 'Induk' },
  SIDE_STORY: { en: 'Side Story', id: 'Cerita Sampingan' },
  CHARACTER: { en: 'Character', id: 'Karakter' },
  SUMMARY: { en: 'Summary', id: 'Ringkasan' },
  ALTERNATIVE: { en: 'Alternative', id: 'Alternatif' },
  SPIN_OFF: { en: 'Spin-off', id: 'Spin-off' },
  OTHER: { en: 'Other', id: 'Lainnya' },
  SOURCE: { en: 'Source', id: 'Sumber' },
  COMPILATION: { en: 'Compilation', id: 'Kompilasi' },
  CONTAINS: { en: 'Contains', id: 'Berisi' },
};

const ROLE: Dict = {
  MAIN: { en: 'Main', id: 'Utama' },
  SUPPORTING: { en: 'Supporting', id: 'Pendukung' },
  BACKGROUND: { en: 'Background', id: 'Latar' },
};

const COUNTRY: Dict = {
  JP: { en: 'Japan', id: 'Jepang' },
  KR: { en: 'South Korea', id: 'Korea Selatan' },
  CN: { en: 'China', id: 'Tiongkok' },
  TW: { en: 'Taiwan', id: 'Taiwan' },
};

const LIST_STATUS: Dict = {
  watching: { en: 'Watching', id: 'Sedang Ditonton' },
  planning: { en: 'Plan to Watch', id: 'Rencana Ditonton' },
  completed: { en: 'Completed', id: 'Selesai' },
  on_hold: { en: 'On Hold', id: 'Ditunda' },
  dropped: { en: 'Dropped', id: 'Berhenti' },
  CURRENT: { en: 'Watching', id: 'Ditonton' },
  PLANNING: { en: 'Planning', id: 'Rencana' },
  COMPLETED: { en: 'Completed', id: 'Selesai' },
  PAUSED: { en: 'Paused', id: 'Ditunda' },
  DROPPED: { en: 'Dropped', id: 'Berhenti' },
  REPEATING: { en: 'Rewatching', id: 'Menonton Ulang' },
};

const SORT: Dict = {
  TRENDING_DESC: { en: 'Trending', id: 'Trending' },
  POPULARITY_DESC: { en: 'Popularity', id: 'Popularitas' },
  SCORE_DESC: { en: 'Score', id: 'Skor' },
  FAVOURITES_DESC: { en: 'Favorites', id: 'Favorit' },
  START_DATE_DESC: { en: 'Newest', id: 'Terbaru' },
  START_DATE: { en: 'Oldest', id: 'Terlama' },
  TITLE_ROMAJI: { en: 'Title (A–Z)', id: 'Judul (A–Z)' },
  EPISODES_DESC: { en: 'Most episodes', id: 'Episode terbanyak' },
  SEARCH_MATCH: { en: 'Best match', id: 'Paling cocok' },
};

const GENDER: Dict = {
  Male: { en: 'Male', id: 'Laki-laki' },
  Female: { en: 'Female', id: 'Perempuan' },
  'Non-binary': { en: 'Non-binary', id: 'Non-biner' },
};

const LANGUAGE: Dict = {
  Japanese: { en: 'Japanese', id: 'Jepang' },
  English: { en: 'English', id: 'Inggris' },
  Korean: { en: 'Korean', id: 'Korea' },
  Chinese: { en: 'Chinese', id: 'Mandarin' },
  Spanish: { en: 'Spanish', id: 'Spanyol' },
  Portuguese: { en: 'Portuguese', id: 'Portugis' },
  French: { en: 'French', id: 'Prancis' },
  German: { en: 'German', id: 'Jerman' },
  Italian: { en: 'Italian', id: 'Italia' },
  Hebrew: { en: 'Hebrew', id: 'Ibrani' },
  Hungarian: { en: 'Hungarian', id: 'Hungaria' },
  Arabic: { en: 'Arabic', id: 'Arab' },
  Filipino: { en: 'Filipino', id: 'Filipina' },
  Catalan: { en: 'Catalan', id: 'Katalan' },
  Finnish: { en: 'Finnish', id: 'Finlandia' },
  Turkish: { en: 'Turkish', id: 'Turki' },
  Dutch: { en: 'Dutch', id: 'Belanda' },
  Swedish: { en: 'Swedish', id: 'Swedia' },
  Thai: { en: 'Thai', id: 'Thailand' },
  Tagalog: { en: 'Tagalog', id: 'Tagalog' },
  Malaysian: { en: 'Malaysian', id: 'Melayu' },
  Indonesian: { en: 'Indonesian', id: 'Indonesia' },
  Vietnamese: { en: 'Vietnamese', id: 'Vietnam' },
  Russian: { en: 'Russian', id: 'Rusia' },
  Polish: { en: 'Polish', id: 'Polandia' },
};

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function pick(dict: Dict, value: string | null | undefined, locale: Locale) {
  if (!value) return '';
  return dict[value]?.[locale] ?? titleCase(value);
}

export const label = {
  format: (v: string | null | undefined, l: Locale) => pick(FORMAT, v, l),
  status: (v: string | null | undefined, l: Locale) => pick(STATUS, v, l),
  season: (v: string | null | undefined, l: Locale) => pick(SEASON, v, l),
  source: (v: string | null | undefined, l: Locale) => pick(SOURCE, v, l),
  relation: (v: string | null | undefined, l: Locale) => pick(RELATION, v, l),
  role: (v: string | null | undefined, l: Locale) => pick(ROLE, v, l),
  country: (v: string | null | undefined, l: Locale) => pick(COUNTRY, v, l),
  listStatus: (v: string | null | undefined, l: Locale) => pick(LIST_STATUS, v, l),
  sort: (v: string | null | undefined, l: Locale) => pick(SORT, v, l),
  gender: (v: string | null | undefined, l: Locale) => (v ? GENDER[v]?.[l] ?? v : ''),
  language: (v: string | null | undefined, l: Locale) => (v ? LANGUAGE[v]?.[l] ?? v : ''),
};
