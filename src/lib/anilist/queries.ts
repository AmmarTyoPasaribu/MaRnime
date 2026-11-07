// AniList GraphQL documents.

export const MEDIA_FRAGMENT = /* GraphQL */ `
  fragment MediaFields on Media {
    id
    idMal
    title { romaji english native }
    coverImage { extraLarge large medium color }
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
    genres
    isAdult
    countryOfOrigin
    nextAiringEpisode { airingAt timeUntilAiring episode }
    studios(isMain: true) { nodes { id name isAnimationStudio } }
  }
`;

const PAGE_INFO = `pageInfo { total currentPage lastPage hasNextPage perPage }`;

// ============ HOME ============

export const HOMEPAGE_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query Homepage($season: MediaSeason, $seasonYear: Int, $nextSeason: MediaSeason, $nextYear: Int) {
    trending: Page(page: 1, perPage: 12) {
      media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
        description(asHtml: false)
      }
    }
    seasonal: Page(page: 1, perPage: 15) {
      media(season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
    nextSeason: Page(page: 1, perPage: 15) {
      media(season: $nextSeason, seasonYear: $nextYear, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
    popular: Page(page: 1, perPage: 15) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
    top: Page(page: 1, perPage: 10) {
      media(sort: SCORE_DESC, type: ANIME, isAdult: false) {
        ...MediaFields
      }
    }
    movies: Page(page: 1, perPage: 15) {
      media(sort: TRENDING_DESC, type: ANIME, format: MOVIE, isAdult: false) {
        ...MediaFields
      }
    }
  }
`;

// ============ SEARCH / BROWSE / SEASONAL / TOP ============

export const SEARCH_ANIME = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query SearchAnime(
    $search: String
    $genre_in: [String]
    $tag_in: [String]
    $format_in: [MediaFormat]
    $status: MediaStatus
    $season: MediaSeason
    $seasonYear: Int
    $countryOfOrigin: CountryCode
    $averageScore_greater: Int
    $sort: [MediaSort]
    $page: Int
    $perPage: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      ${PAGE_INFO}
      media(
        search: $search
        genre_in: $genre_in
        tag_in: $tag_in
        format_in: $format_in
        status: $status
        season: $season
        seasonYear: $seasonYear
        countryOfOrigin: $countryOfOrigin
        averageScore_greater: $averageScore_greater
        sort: $sort
        type: ANIME
        isAdult: false
      ) {
        ...MediaFields
        description(asHtml: false)
        startDate { year month day }
      }
    }
  }
`;

/** Lightweight query for the instant-search palette. */
export const QUICK_SEARCH = /* GraphQL */ `
  query QuickSearch($search: String) {
    Page(page: 1, perPage: 8) {
      media(search: $search, type: ANIME, isAdult: false, sort: [SEARCH_MATCH, POPULARITY_DESC]) {
        id
        title { romaji english native }
        coverImage { medium color }
        format
        status
        seasonYear
        averageScore
        episodes
      }
    }
  }
`;

export const GENRE_COLLECTION = /* GraphQL */ `
  query Genres {
    GenreCollection
  }
`;

export const RANDOM_POOL = /* GraphQL */ `
  query RandomPool($page: Int) {
    Page(page: $page, perPage: 50) {
      media(type: ANIME, isAdult: false, sort: POPULARITY_DESC) { id }
    }
  }
`;

// ============ SCHEDULE ============

export const AIRING_SCHEDULE = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query AiringSchedule($from: Int, $to: Int, $page: Int) {
    Page(page: $page, perPage: 50) {
      ${PAGE_INFO}
      airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
        id
        airingAt
        episode
        timeUntilAiring
        media { ...MediaFields }
      }
    }
  }
`;

// ============ ANIME DETAIL ============

export const ANIME_DETAIL = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title { romaji english native }
      coverImage { extraLarge large medium color }
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
      synonyms
      hashtag
      source(version: 3)
      siteUrl
      isAdult
      countryOfOrigin
      tags { id name description category rank isMediaSpoiler isGeneralSpoiler }
      trailer { id site thumbnail }
      nextAiringEpisode { airingAt timeUntilAiring episode }
      studios { edges { isMain node { id name isAnimationStudio } } }
      rankings { id rank type allTime context season year format }
      stats {
        scoreDistribution { score amount }
        statusDistribution { status amount }
      }
      externalLinks { id site url type language color icon }
      streamingEpisodes { title thumbnail url site }
      characters(sort: [ROLE, RELEVANCE, ID], page: 1, perPage: 12) {
        pageInfo { hasNextPage }
        edges {
          id
          role
          node { id name { full native } image { large medium } }
          voiceActors(sort: [RELEVANCE, ID]) {
            id
            name { full native }
            image { large medium }
            languageV2
          }
        }
      }
      staff(sort: [RELEVANCE, ID], page: 1, perPage: 12) {
        pageInfo { hasNextPage }
        edges {
          id
          role
          node { id name { full native } image { large medium } }
        }
      }
      relations {
        edges {
          id
          relationType(version: 2)
          node {
            id
            type
            title { romaji english native }
            coverImage { extraLarge large medium color }
            format
            status
            siteUrl
          }
        }
      }
      recommendations(sort: RATING_DESC, perPage: 15) {
        nodes {
          id
          rating
          mediaRecommendation { ...MediaFields }
        }
      }
    }
  }
`;

export const ANIME_CHARACTERS_PAGE = /* GraphQL */ `
  query AnimeCharacters($id: Int, $page: Int) {
    Media(id: $id, type: ANIME) {
      characters(sort: [ROLE, RELEVANCE, ID], page: $page, perPage: 24) {
        pageInfo { hasNextPage }
        edges {
          id
          role
          node { id name { full native } image { large medium } }
          voiceActors(sort: [RELEVANCE, ID]) {
            id
            name { full native }
            image { large medium }
            languageV2
          }
        }
      }
    }
  }
`;

export const ANIME_STAFF_PAGE = /* GraphQL */ `
  query AnimeStaff($id: Int, $page: Int) {
    Media(id: $id, type: ANIME) {
      staff(sort: [RELEVANCE, ID], page: $page, perPage: 24) {
        pageInfo { hasNextPage }
        edges {
          id
          role
          node { id name { full native } image { large medium } }
        }
      }
    }
  }
`;

// ============ CHARACTER / STAFF / STUDIO ============

export const CHARACTER_DETAIL = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query CharacterDetail($id: Int) {
    Character(id: $id) {
      id
      name { full native alternative }
      image { large medium }
      description(asHtml: false)
      gender
      dateOfBirth { year month day }
      age
      bloodType
      favourites
      siteUrl
      media(type: ANIME, sort: [START_DATE_DESC], perPage: 30) {
        edges {
          id
          characterRole
          voiceActors(sort: [RELEVANCE, ID]) {
            id
            name { full native }
            image { large medium }
            languageV2
          }
          node { ...MediaFields }
        }
      }
    }
  }
`;

export const STAFF_DETAIL = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query StaffDetail($id: Int) {
    Staff(id: $id) {
      id
      name { full native alternative }
      image { large medium }
      description(asHtml: false)
      primaryOccupations
      gender
      dateOfBirth { year month day }
      dateOfDeath { year month day }
      age
      yearsActive
      homeTown
      bloodType
      languageV2
      favourites
      siteUrl
      staffMedia(type: ANIME, sort: [START_DATE_DESC], perPage: 30) {
        edges {
          id
          staffRole
          node { ...MediaFields }
        }
      }
      characterMedia(sort: [START_DATE_DESC], perPage: 30) {
        edges {
          id
          characterRole
          node { ...MediaFields type }
          characters { id name { full native } image { large medium } }
        }
      }
    }
  }
`;

export const STUDIO_DETAIL = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query StudioDetail($id: Int, $page: Int) {
    Studio(id: $id) {
      id
      name
      isAnimationStudio
      favourites
      siteUrl
      media(sort: [START_DATE_DESC], isMain: true, page: $page, perPage: 36) {
        ${PAGE_INFO}
        edges {
          isMainStudio
          node { ...MediaFields }
        }
      }
    }
  }
`;

// ============ PERSONAL RECOMMENDATIONS ============

export const LIST_GENRES = /* GraphQL */ `
  query ListGenres($ids: [Int]) {
    Page(page: 1, perPage: 50) {
      media(id_in: $ids, type: ANIME) { id genres }
    }
  }
`;

export const FOR_YOU = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query ForYou($exclude: [Int], $genres: [String]) {
    Page(page: 1, perPage: 18) {
      media(id_not_in: $exclude, genre_in: $genres, type: ANIME, isAdult: false, popularity_greater: 15000, sort: [SCORE_DESC]) {
        ...MediaFields
      }
    }
  }
`;

// ============ A–Z INDEX ============

/** Alphabetical index of notable anime (popularity floor keeps it ~3–4k titles). */
export const ANIME_INDEX = /* GraphQL */ `
  query AnimeIndex($page: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo { hasNextPage }
      media(
        type: ANIME
        isAdult: false
        popularity_greater: 12000
        format_in: [TV, TV_SHORT, MOVIE, OVA, ONA, SPECIAL]
        sort: [TITLE_ROMAJI, ID]
      ) {
        id
        title { romaji english }
        status
        format
        seasonYear
      }
    }
  }
`;
