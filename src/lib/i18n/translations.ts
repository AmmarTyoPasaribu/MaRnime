export type Locale = 'en' | 'id';

export const translations = {
  en: {
    // Navbar
    browse: 'Browse',
    seasonal: 'Seasonal',
    profile: 'Profile',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    searchAnime: 'Search anime...',

    // Homepage
    trendingNow: 'Trending Now',
    popularThisSeason: 'Popular This Season',
    allTimePopular: 'All-Time Popular',
    topRated: 'Top Rated',
    upcoming: 'Upcoming',
    viewAll: 'View All',
    viewDetails: 'View Details',

    // Anime Detail
    synopsis: 'Synopsis',
    characters: 'Characters',
    staff: 'Staff',
    relations: 'Relations',
    recommendations: 'Recommendations',
    trailer: 'Trailer',
    episodes: 'Episodes',
    duration: 'Duration',
    favorites: 'Favorites',
    members: 'Members',
    studio: 'Studio',
    source: 'Source',

    // Browse
    searchResults: 'Search Results',
    filters: 'Filters',
    genres: 'Genres',
    format: 'Format',
    status: 'Status',
    season: 'Season',
    year: 'Year',
    sortBy: 'Sort By',
    loadMore: 'Load More',
    noResults: 'No results found',

    // Watchlist
    addToList: 'Add to List',
    planning: 'Planning',
    watching: 'Watching',
    completed: 'Completed',
    onHold: 'On Hold',
    dropped: 'Dropped',
    removeFromList: 'Remove from List',
    signInToAdd: 'Sign in to add',

    // Auth
    welcomeBack: 'Welcome Back',
    signInDesc: 'Sign in to manage your anime list',
    email: 'Email',
    password: 'Password',
    createAccount: 'Create Account',
    joinDesc: 'Join MaRnime to track your anime',
    username: 'Username',
    confirmPassword: 'Confirm Password',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign up',

    // Profile
    myAnimeList: 'My Anime List',
    all: 'All',
    stats: 'Stats',
    totalAnime: 'Total Anime',
    avgScore: 'Avg Score',
    episodesWatched: 'Episodes Watched',

    // Footer
    footerDesc: 'Discover, track, and explore anime with an elegant aurora-inspired experience.',
    quickLinks: 'Quick Links',
    dataSource: 'Data Source',
    poweredBy: 'Powered by AniList',

    // Common
    loading: 'Loading...',
    pageNotFound: 'Page Not Found',
    pageNotFoundDesc: "The page you're looking for doesn't exist or has been moved.",
    goHome: 'Go Home',
    browseAnime: 'Browse Anime',
    somethingWrong: 'Something went wrong',
    tryAgain: 'Try Again',
  },
  id: {
    // Navbar
    browse: 'Jelajahi',
    seasonal: 'Musiman',
    profile: 'Profil',
    signIn: 'Masuk',
    signOut: 'Keluar',
    searchAnime: 'Cari anime...',

    // Homepage
    trendingNow: 'Sedang Trending',
    popularThisSeason: 'Populer Musim Ini',
    allTimePopular: 'Paling Populer',
    topRated: 'Rating Tertinggi',
    upcoming: 'Akan Datang',
    viewAll: 'Lihat Semua',
    viewDetails: 'Lihat Detail',

    // Anime Detail
    synopsis: 'Sinopsis',
    characters: 'Karakter',
    staff: 'Staf',
    relations: 'Relasi',
    recommendations: 'Rekomendasi',
    trailer: 'Trailer',
    episodes: 'Episode',
    duration: 'Durasi',
    favorites: 'Favorit',
    members: 'Anggota',
    studio: 'Studio',
    source: 'Sumber',

    // Browse
    searchResults: 'Hasil Pencarian',
    filters: 'Filter',
    genres: 'Genre',
    format: 'Format',
    status: 'Status',
    season: 'Musim',
    year: 'Tahun',
    sortBy: 'Urutkan',
    loadMore: 'Muat Lebih',
    noResults: 'Tidak ada hasil',

    // Watchlist
    addToList: 'Tambah ke Daftar',
    planning: 'Direncanakan',
    watching: 'Ditonton',
    completed: 'Selesai',
    onHold: 'Ditunda',
    dropped: 'Dihentikan',
    removeFromList: 'Hapus dari Daftar',
    signInToAdd: 'Masuk untuk menambah',

    // Auth
    welcomeBack: 'Selamat Datang Kembali',
    signInDesc: 'Masuk untuk kelola daftar anime kamu',
    email: 'Email',
    password: 'Kata Sandi',
    createAccount: 'Buat Akun',
    joinDesc: 'Gabung MaRnime untuk lacak anime kamu',
    username: 'Username',
    confirmPassword: 'Konfirmasi Kata Sandi',
    alreadyHaveAccount: 'Sudah punya akun?',
    dontHaveAccount: 'Belum punya akun?',
    signUp: 'Daftar',

    // Profile
    myAnimeList: 'Daftar Anime Saya',
    all: 'Semua',
    stats: 'Statistik',
    totalAnime: 'Total Anime',
    avgScore: 'Rata-rata Skor',
    episodesWatched: 'Episode Ditonton',

    // Footer
    footerDesc: 'Temukan, lacak, dan jelajahi anime dengan pengalaman bertema aurora yang elegan.',
    quickLinks: 'Tautan Cepat',
    dataSource: 'Sumber Data',
    poweredBy: 'Didukung oleh AniList',

    // Common
    loading: 'Memuat...',
    pageNotFound: 'Halaman Tidak Ditemukan',
    pageNotFoundDesc: 'Halaman yang kamu cari tidak ada atau telah dipindahkan.',
    goHome: 'Ke Beranda',
    browseAnime: 'Jelajahi Anime',
    somethingWrong: 'Terjadi Kesalahan',
    tryAgain: 'Coba Lagi',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
