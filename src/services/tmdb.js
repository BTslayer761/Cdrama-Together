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

export async function fetchBrowseDramas(page = 1) {
  const url  = `${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=zh&with_origin_country=CN&sort_by=popularity.desc&vote_count.gte=5&page=${page}`
  const res  = await fetch(url)
  const data = await res.json()
  return {
    results:    (data.results || []).map(s => normalizeTmdbShow(s)),
    totalPages: data.total_pages || 1,
  }
}

export async function fetchDramaDetails(id) {
  const [detail, credits, videos] = await Promise.all([
    fetch(`${TMDB_BASE}/tv/${id}?api_key=${TMDB_API_KEY}`).then(r => r.json()),
    fetch(`${TMDB_BASE}/tv/${id}/credits?api_key=${TMDB_API_KEY}`).then(r => r.json()),
    fetch(`${TMDB_BASE}/tv/${id}/videos?api_key=${TMDB_API_KEY}`).then(r => r.json()),
  ])

  const statusMap = {
    'Returning Series': 'Ongoing',
    'Ended':            'Completed',
    'Canceled':         'Cancelled',
    'In Production':    'In Production',
    'Planned':          'Planned',
  }

  return {
    id:            detail.id,
    title:         detail.name,
    originalTitle: detail.original_name,
    overview:      detail.overview || 'No synopsis available.',
    status:        statusMap[detail.status] || detail.status || 'Unknown',
    firstAirDate:  detail.first_air_date || null,
    episodes:      detail.number_of_episodes || null,
    seasons:       detail.number_of_seasons  || null,
    genres:        (detail.genres || []).map(g => g.name),
    score:         detail.vote_average ? Math.round(detail.vote_average * 10) / 10 : null,
    posterUrl:     detail.poster_path   ? `${TMDB_IMG}${detail.poster_path}` : null,
    backdropUrl:   detail.backdrop_path ? `https://image.tmdb.org/t/p/original${detail.backdrop_path}` : null,
    cast: (credits.cast || []).map(c => ({
      id:           c.id,
      name:         c.name,
      originalName: c.original_name && c.original_name !== c.name ? c.original_name : null,
      character:    c.character || '—',
      profileUrl:   c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
    })),
    crew: (() => {
      const KEY_JOBS = ['Director', 'Co-Director', 'Screenplay', 'Writer', 'Story',
                        'Executive Producer', 'Producer', 'Co-Producer',
                        'Original Music Composer', 'Music']
      const seen = new Set()
      return (credits.crew || [])
        .filter(c => {
          if (!KEY_JOBS.includes(c.job)) return false
          const key = `${c.id}-${c.job}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        .map(c => ({
          id:         c.id,
          name:       c.name,
          job:        c.job,
          department: c.department,
          profileUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
        }))
    })(),
    videos: (videos.results || []).map(v => ({
      key:  v.key,
      name: v.name,
      type: v.type,
      site: v.site,
    })),
  }
}

export async function fetchEpisodeCounts(ids) {
  const batches = []
  for (let i = 0; i < ids.length; i += 10) batches.push(ids.slice(i, i + 10))
  const all = {}
  for (const batch of batches) {
    const results = await Promise.all(
      batch.map(id =>
        fetch(`${TMDB_BASE}/tv/${id}?api_key=${TMDB_API_KEY}`)
          .then(r => r.json())
          .then(d => [id, d.number_of_episodes || null])
          .catch(() => [id, null])
      )
    )
    results.forEach(([id, count]) => { all[id] = count })
  }
  return all
}

export async function searchDramasByName(query) {
  const url  = `${TMDB_BASE}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  const res  = await fetch(url)
  const data = await res.json()
  return (data.results || [])
    .filter(s => s.original_language === 'zh')
    .map(s => normalizeTmdbShow(s))
}

export async function searchDramasByActor(actorName) {
  const personRes  = await fetch(`${TMDB_BASE}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(actorName)}`)
  const personData = await personRes.json()
  if (!personData.results?.length) return []

  const person      = personData.results[0]
  const creditsRes  = await fetch(`${TMDB_BASE}/person/${person.id}/tv_credits?api_key=${TMDB_API_KEY}`)
  const creditsData = await creditsRes.json()

  return (creditsData.cast || [])
    .filter(s => s.original_language === 'zh')
    .map(s => normalizeTmdbShow(s))
}
