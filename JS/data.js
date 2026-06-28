/**
 * js/data.js
 * ─────────────────────────────────────────────────────────────
 * DATA LAYER — fetches live drama data from the TMDB API.
 *
 * DEPENDS ON: js/config.js (TMDB_API_KEY, TMDB_BASE, TMDB_IMG)
 *
 * Exports (as global async functions):
 *   fetchAiringDramas()  → recently aired Chinese dramas
 *   fetchTopRatedDramas() → highest-rated Chinese dramas
 *   fetchSeasonDramas()  → popular dramas for the sidebar widget
 *
 * Static data (GENRES, ACTIVITY_FEED) stays here as plain arrays.
 * ─────────────────────────────────────────────────────────────
 */


// Maps TMDB's numeric genre IDs to readable labels.
// Full list: https://developer.themoviedb.org/reference/genre-tv-list
const TMDB_GENRE_MAP = {
  10759: 'Action',
  16:    'Animation',
  35:    'Comedy',
  80:    'Crime',
  18:    'Drama',
  10751: 'Family',
  9648:  'Mystery',
  10765: 'Fantasy',
  10768: 'War & Politics',
  37:    'Western',
};


/**
 * normalizeTmdbShow(show, statusOverride)
 * ────────────────────────────────────────
 * Converts a raw TMDB TV result into the drama object shape
 * the rest of the app expects.
 */
function normalizeTmdbShow(show, statusOverride) {
  const genreId = show.genre_ids && show.genre_ids[0];
  return {
    id:        show.id,
    title:     show.name,
    year:      show.first_air_date ? show.first_air_date.split('-')[0] : '—',
    eps:       null,
    status:    statusOverride || 'completed',
    genre:     TMDB_GENRE_MAP[genreId] || 'Drama',
    score:     show.vote_average ? Math.round(show.vote_average * 10) / 10 : '—',
    posterUrl: show.poster_path ? `${TMDB_IMG}${show.poster_path}` : null,
    watching:  false,
  };
}


/**
 * fetchAiringDramas()
 * ────────────────────
 * Returns Chinese dramas that first aired within the last 12 months,
 * sorted by newest first.
 */
async function fetchAiringDramas() {
  const today       = new Date().toISOString().split('T')[0];
  const oneYearAgo  = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const url = `${TMDB_BASE}/discover/tv`
    + `?api_key=${TMDB_API_KEY}`
    + `&with_original_language=zh`
    + `&with_origin_country=CN`
    + `&sort_by=first_air_date.desc`
    + `&first_air_date.lte=${today}`
    + `&first_air_date.gte=${oneYearAgo}`
    + `&vote_count.gte=5`;

  const res  = await fetch(url);
  const data = await res.json();
  return (data.results || []).map(show => normalizeTmdbShow(show, 'airing'));
}


/**
 * fetchTopRatedDramas()
 * ──────────────────────
 * Returns the highest-rated Chinese dramas of all time,
 * requiring at least 100 votes so obscure titles don't skew results.
 */
async function fetchTopRatedDramas() {
  const url = `${TMDB_BASE}/discover/tv`
    + `?api_key=${TMDB_API_KEY}`
    + `&with_original_language=zh`
    + `&with_origin_country=CN`
    + `&sort_by=vote_average.desc`
    + `&vote_count.gte=100`;

  const res  = await fetch(url);
  const data = await res.json();
  return (data.results || []).slice(0, 8).map(show => normalizeTmdbShow(show, 'completed'));
}


/**
 * fetchSeasonDramas()
 * ────────────────────
 * Returns the 4 most popular Chinese dramas right now,
 * used for the "Top Picks" sidebar widget.
 */
async function fetchSeasonDramas() {
  const url = `${TMDB_BASE}/discover/tv`
    + `?api_key=${TMDB_API_KEY}`
    + `&with_original_language=zh`
    + `&with_origin_country=CN`
    + `&sort_by=popularity.desc`
    + `&vote_count.gte=5`;

  const res  = await fetch(url);
  const data = await res.json();
  return (data.results || []).slice(0, 4).map(show => ({
    title: show.name,
    score: show.vote_average ? Math.round(show.vote_average * 10) / 10 : 0,
  }));
}


// ── Static data ───────────────────────────────────────────────
// These don't come from TMDB so they stay as plain arrays.

const GENRES = [
  'Drama',
  'Romance',
  'Action',
  'Comedy',
  'Mystery',
  'Fantasy',
  'Crime',
  'Family',
  'War & Politics',
  'Thriller',
  'Historical',
  'Sci-Fi',
];

const ACTIVITY_FEED = [
  {
    initials: 'YL',
    user:     'YunLan',
    action:   'rated',
    drama:    'The Story of Minglan',
    detail:   '★9.2',
    time:     '2 minutes ago',
  },
  {
    initials: 'SS',
    user:     'StarSienna',
    action:   'started watching',
    drama:    'Nirvana in Fire',
    detail:   null,
    time:     '14 minutes ago',
  },
  {
    initials: 'XH',
    user:     'XiaoHu',
    action:   'added a review for',
    drama:    'Love Like the Galaxy',
    detail:   null,
    time:     '32 minutes ago',
  },
  {
    initials: 'DR',
    user:     'DramaRain',
    action:   'completed',
    drama:    'Go Ahead',
    detail:   null,
    time:     '1 hour ago',
  },
];
