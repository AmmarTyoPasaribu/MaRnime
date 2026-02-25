// Shared fragments
const MEDIA_FRAGMENT = `
  fragment MediaFields on Media {
    id
    idMal
    title {
      romaji
      english
      native
    }
    coverImage {
      extraLarge
      large
      medium
      color
    }
    bannerImage
    format
    status
    episodes
    duration
    season
    seasonYear
    averageScore
    meanScore
    popularity
    favourites
    trending
    genres
    source
    type
    isAdult
    nextAiringEpisode {
      airingAt
      timeUntilAiring
      episode
    }
    studios(isMain: true) {
      nodes {
        id
        name
        isAnimationStudio
      }
    }
  }
`;

// ============ HOME PAGE QUERIES ============

export const TRENDING_ANIME = `
  ${MEDIA_FRAGMENT}
  query TrendingAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
  }
`;

export const POPULAR_ANIME = `
  ${MEDIA_FRAGMENT}
  query PopularAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
  }
`;

export const TOP_RATED_ANIME = `
  ${MEDIA_FRAGMENT}
  query TopRatedAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(sort: SCORE_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
  }
`;

export const SEASONAL_ANIME = `
  ${MEDIA_FRAGMENT}
  query SeasonalAnime($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int, $sort: [MediaSort]) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: $sort, isAdult: false) {
        ...MediaFields
      }
    }
  }
`;

// ============ SEARCH / BROWSE ============

export const SEARCH_ANIME = `
  ${MEDIA_FRAGMENT}
  query SearchAnime(
    $search: String,
    $genre_in: [String],
    $format: MediaFormat,
    $status: MediaStatus,
    $season: MediaSeason,
    $seasonYear: Int,
    $sort: [MediaSort],
    $page: Int,
    $perPage: Int,
    $isAdult: Boolean
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        search: $search,
        genre_in: $genre_in,
        format: $format,
        status: $status,
        season: $season,
        seasonYear: $seasonYear,
        sort: $sort,
        type: ANIME,
        isAdult: $isAdult
      ) {
        ...MediaFields
        description(asHtml: false)
      }
    }
  }
`;

// ============ ANIME DETAIL ============

export const ANIME_DETAIL = `
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      description(asHtml: false)
      format
      status
      episodes
      duration
      season
      seasonYear
      startDate { year month day }
      endDate { year month day }
      averageScore
      meanScore
      popularity
      favourites
      trending
      genres
      tags {
        id
        name
        category
        rank
      }
      source
      type
      isAdult
      trailer {
        id
        site
        thumbnail
      }
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      studios {
        nodes {
          id
          name
          isAnimationStudio
        }
      }
      characters(sort: [ROLE, RELEVANCE], perPage: 24) {
        edges {
          id
          role
          node {
            id
            name { full native }
            image { large medium }
          }
          voiceActors(language: JAPANESE, sort: [RELEVANCE]) {
            id
            name { full native }
            image { large medium }
            languageV2
          }
        }
      }
      staff(sort: RELEVANCE, perPage: 12) {
        edges {
          id
          role
          node {
            id
            name { full native }
            image { large medium }
          }
        }
      }
      relations {
        edges {
          id
          relationType(version: 2)
          node {
            id
            title { romaji english native }
            coverImage { large medium }
            format
            status
            type
          }
        }
      }
      recommendations(sort: RATING_DESC, perPage: 12) {
        nodes {
          id
          rating
          mediaRecommendation {
            id
            title { romaji english }
            coverImage { large medium }
            format
            episodes
            averageScore
          }
        }
      }
    }
  }
`;

// ============ CHARACTER DETAIL ============

export const CHARACTER_DETAIL = `
  query CharacterDetail($id: Int) {
    Character(id: $id) {
      id
      name { full native }
      image { large medium }
      description(asHtml: false)
      gender
      dateOfBirth { year month day }
      age
      favourites
      media(sort: POPULARITY_DESC, perPage: 24) {
        edges {
          characterRole
          voiceActors(language: JAPANESE, sort: RELEVANCE) {
            id
            name { full native }
            image { large medium }
            languageV2
          }
          node {
            id
            title { romaji english native }
            coverImage { large medium }
            format
            type
          }
        }
      }
    }
  }
`;

// ============ STAFF DETAIL ============

export const STAFF_DETAIL = `
  query StaffDetail($id: Int) {
    Staff(id: $id) {
      id
      name { full native }
      image { large medium }
      description(asHtml: false)
      primaryOccupations
      gender
      dateOfBirth { year month day }
      age
      yearsActive
      homeTown
      favourites
      staffMedia(sort: POPULARITY_DESC, perPage: 24) {
        edges {
          staffRole
          node {
            id
            title { romaji english native }
            coverImage { large medium }
            format
            type
          }
        }
      }
      characters(sort: FAVOURITES_DESC, perPage: 24) {
        edges {
          role
          node {
            id
            name { full native }
            image { large medium }
          }
          media {
            id
            title { romaji english }
            coverImage { large medium }
            type
          }
        }
      }
    }
  }
`;

// ============ HOMEPAGE COMBINED ============

export const HOMEPAGE_QUERY = `
  ${MEDIA_FRAGMENT}
  query Homepage($season: MediaSeason, $seasonYear: Int) {
    trending: Page(page: 1, perPage: 6) {
      media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
        description(asHtml: false)
      }
    }
    popular: Page(page: 1, perPage: 10) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
    topRated: Page(page: 1, perPage: 10) {
      media(sort: SCORE_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
    seasonal: Page(page: 1, perPage: 10) {
      media(season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
    upcoming: Page(page: 1, perPage: 10) {
      media(status: NOT_YET_RELEASED, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
  }
`;
