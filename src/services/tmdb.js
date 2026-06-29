const TMDB_API_KEY = 'd1bf65a008d823062cfa9b8d04b18665'
const TMDB_BASE    = 'https://api.themoviedb.org/3'
const TMDB_IMG     = 'https://image.tmdb.org/t/p/w500'

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
}

function normalizeTmdbShow(show, statusOverride) {
  const genreId = show.genre_ids && show.genre_ids[0]
  return {
    id:        show.id,
    title:     show.name,
    year:      show.first_air_date ? show.first_air_date.split('-')[0] : '—',
    eps:       null,
    status:    statusOverride || 'completed',
    genre:     TMDB_GENRE_MAP[genreId] || 'Drama',
    score:     show.vote_average ? Math.round(show.vote_average * 10) / 10 : '—',
    posterUrl: show.poster_path ? `${TMDB_IMG}${show.poster_path}` : null,
  }
}

export async function fetchAiringDramas() {
  const today      = new Date().toISOString().split('T')[0]
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const url = `${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=zh&with_origin_country=CN&sort_by=first_air_date.desc&first_air_date.lte=${today}&first_air_date.gte=${oneYearAgo}&vote_count.gte=5`
  const res  = await fetch(url)
  const data = await res.json()
  return (data.results || []).map(show => normalizeTmdbShow(show, 'airing'))
}

export async function fetchTopRatedDramas() {
  const url = `${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=zh&with_origin_country=CN&sort_by=vote_average.desc&vote_count.gte=100`
  const res  = await fetch(url)
  const data = await res.json()
  return (data.results || []).slice(0, 8).map(show => normalizeTmdbShow(show, 'completed'))
}

export async function fetchDramaCount() {
  const url = `${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=zh&with_origin_country=CN&page=1`
  const res  = await fetch(url)
  const data = await res.json()
  return data.total_results || 0
}

export async function fetchBackdropImages() {
  const url = `${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=zh&with_origin_country=CN&sort_by=popularity.desc&vote_count.gte=20`
  const res  = await fetch(url)
  const data = await res.json()
  return (data.results || [])
    .filter(show => show.backdrop_path)
    .slice(0, 8)
    .map(show => ({
      url:   `https://image.tmdb.org/t/p/original${show.backdrop_path}`,
      title: show.name,
    }))
}

export async function fetchSeasonDramas() {
  const url = `${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=zh&with_origin_country=CN&sort_by=popularity.desc&vote_count.gte=5`
  const res  = await fetch(url)
  const data = await res.json()
  return (data.results || []).slice(0, 4).map(show => ({
    title: show.name,
    score: show.vote_average ? Math.round(show.vote_average * 10) / 10 : 0,
  }))
}
