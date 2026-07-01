import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import DramaCard from '../components/DramaCard'
import { fetchBrowseDramas, fetchEpisodeCounts, searchDramasByName, searchDramasByActor } from '../services/tmdb'
import '../styles/browse.css'

const GENRES   = ['All', 'Action', 'Animation', 'Comedy', 'Crime', 'Drama', 'Family', 'Fantasy', 'Mystery', 'War & Politics', 'Western']
const EP_MAX   = 200
const YEAR_MIN = 2000
const YEAR_MAX = new Date().getFullYear()

export default function Browse() {
  const [browseDramas, setBrowseDramas] = useState([])
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [page, setPage]                 = useState(3)
  const [totalPages, setTotalPages]     = useState(1)

  const [searchInput, setSearchInput]   = useState('')
  const [searchResults, setSearchResults] = useState(null) // null = not in search mode
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeGenre, setActiveGenre]   = useState('All')

  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [epRange, setEpRange]           = useState([0, EP_MAX])
  const [epCounts, setEpCounts]         = useState({})
  const [fetchingEps, setFetchingEps]   = useState(false)

  const [actorInput, setActorInput]     = useState('')
  const [actorResults, setActorResults] = useState(null)
  const [actorLoading, setActorLoading] = useState(false)

  const [yearRange, setYearRange] = useState([YEAR_MIN, YEAR_MAX])

  const epFilterActive   = epRange[0] > 0 || epRange[1] < EP_MAX
  const yearFilterActive = yearRange[0] > YEAR_MIN || yearRange[1] < YEAR_MAX

  // Load first 3 pages on mount
  useEffect(() => {
    Promise.all([fetchBrowseDramas(1), fetchBrowseDramas(2), fetchBrowseDramas(3)])
      .then(([p1, p2, p3]) => {
        const seen = new Set()
        const all  = [...p1.results, ...p2.results, ...p3.results].filter(d => {
          if (seen.has(d.id)) return false
          seen.add(d.id)
          return true
        })
        setBrowseDramas(all)
        setTotalPages(p1.totalPages)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Search TMDB when the user types (debounced 500ms)
  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchResults(null)
      return
    }
    setSearchLoading(true)
    const timer = setTimeout(() => {
      searchDramasByName(searchInput.trim()).then(results => {
        setSearchResults(results)
        setSearchLoading(false)
      }).catch(() => { setSearchResults([]); setSearchLoading(false) })
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Lazy-fetch episode counts when the filter becomes active
  useEffect(() => {
    if (!epFilterActive) return
    const source  = actorResults !== null ? actorResults : browseDramas
    const missing = source.filter(d => !(d.id in epCounts)).map(d => d.id)
    if (!missing.length) return
    setFetchingEps(true)
    fetchEpisodeCounts(missing).then(counts => {
      setEpCounts(prev => ({ ...prev, ...counts }))
      setFetchingEps(false)
    })
  }, [epFilterActive, browseDramas, actorResults])

  async function loadMore() {
    const next = page + 1
    setLoadingMore(true)
    const { results } = await fetchBrowseDramas(next)
    setBrowseDramas(prev => {
      const ids = new Set(prev.map(d => d.id))
      return [...prev, ...results.filter(d => !ids.has(d.id))]
    })
    setPage(next)
    setLoadingMore(false)
  }

  async function handleActorSearch() {
    const q = actorInput.trim()
    if (!q) return
    setActorLoading(true)
    setActorResults(null)
    const results = await searchDramasByActor(q).catch(() => [])
    setActorResults(results)
    setActorLoading(false)
  }

  function clearActor() {
    setActorResults(null)
    setActorInput('')
  }

  // Determine source and apply filters
  const source = searchResults !== null ? searchResults :
                 actorResults  !== null ? actorResults  :
                 browseDramas

  let displayed = source
  if (activeGenre !== 'All') {
    displayed = displayed.filter(d => d.genre === activeGenre)
  }
  if (epFilterActive && !fetchingEps) {
    displayed = displayed.filter(d => {
      const count = epCounts[d.id]
      if (count == null) return true
      return count >= epRange[0] && count <= epRange[1]
    })
  }
  if (yearFilterActive) {
    displayed = displayed.filter(d => {
      const y = parseInt(d.year)
      if (isNaN(y)) return true
      return y >= yearRange[0] && y <= yearRange[1]
    })
  }

  const showLoadMore = searchResults === null && actorResults === null && page < totalPages

  return (
    <>
      <Nav />
      <div className="browse-page">

        {/* Search */}
        <div className="browse-search-wrap">
          <div className="browse-search-box">
            <span className="browse-search-icon">🔍</span>
            <input
              className="browse-search-input"
              type="text"
              placeholder="Search Chinese drama titles…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button className="browse-search-clear" onClick={() => setSearchInput('')}>✕</button>
            )}
          </div>
        </div>

        {/* Genre tabs */}
        <div className="browse-genre-row">
          {GENRES.map(g => (
            <button
              key={g}
              className={`filter-tab${activeGenre === g ? ' active' : ''}`}
              onClick={() => setActiveGenre(g)}
            >{g}</button>
          ))}
        </div>

        {/* Advanced filter toggle */}
        <div className="browse-adv-toggle-row">
          <button
            className={`browse-adv-toggle${advancedOpen ? ' open' : ''}`}
            onClick={() => setAdvancedOpen(o => !o)}
          >
            Advanced Filters {advancedOpen ? '▲' : '▼'}
          </button>
        </div>

        {/* Advanced filter panel */}
        {advancedOpen && (
          <div className="browse-adv-panel">

            {/* Episode range */}
            <div className="browse-adv-group">
              <div className="browse-adv-label">
                Episodes
                <span className="browse-adv-range-val">
                  {epRange[0] === 0 ? 'Any' : epRange[0]} – {epRange[1] >= EP_MAX ? 'Any' : epRange[1]}
                </span>
                {fetchingEps && <span className="browse-adv-hint"> loading…</span>}
              </div>
              <div className="browse-range-row">
                <span className="browse-range-label">Min</span>
                <input
                  type="range" min={0} max={EP_MAX} step={5}
                  value={epRange[0]}
                  onChange={e => {
                    const v = +e.target.value
                    setEpRange([Math.min(v, epRange[1] - 5), epRange[1]])
                  }}
                />
                <input
                  type="range" min={0} max={EP_MAX} step={5}
                  value={epRange[1]}
                  onChange={e => {
                    const v = +e.target.value
                    setEpRange([epRange[0], Math.max(v, epRange[0] + 5)])
                  }}
                />
                <span className="browse-range-label">Max</span>
              </div>
              {epFilterActive && (
                <button className="browse-reset-link" onClick={() => setEpRange([0, EP_MAX])}>
                  Reset episode filter
                </button>
              )}
            </div>

            {/* Year range */}
            <div className="browse-adv-group">
              <div className="browse-adv-label">
                Year
                <span className="browse-adv-range-val">
                  {yearRange[0]} – {yearRange[1]}
                </span>
              </div>
              <div className="browse-range-row">
                <span className="browse-range-label">From</span>
                <input
                  type="range" min={YEAR_MIN} max={YEAR_MAX} step={1}
                  value={yearRange[0]}
                  onChange={e => {
                    const v = +e.target.value
                    setYearRange([Math.min(v, yearRange[1] - 1), yearRange[1]])
                  }}
                />
                <input
                  type="range" min={YEAR_MIN} max={YEAR_MAX} step={1}
                  value={yearRange[1]}
                  onChange={e => {
                    const v = +e.target.value
                    setYearRange([yearRange[0], Math.max(v, yearRange[0] + 1)])
                  }}
                />
                <span className="browse-range-label">To</span>
              </div>
              {yearFilterActive && (
                <button className="browse-reset-link" onClick={() => setYearRange([YEAR_MIN, YEAR_MAX])}>
                  Reset year filter
                </button>
              )}
            </div>

            {/* Actor search */}
            <div className="browse-adv-group">
              <div className="browse-adv-label">Filter by Actor / Actress</div>
              <div className="browse-actor-row">
                <input
                  className="browse-actor-input"
                  type="text"
                  placeholder="e.g. Xiao Zhan, Dilraba…"
                  value={actorInput}
                  onChange={e => setActorInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleActorSearch()}
                />
                <button className="btn btn-primary" onClick={handleActorSearch} disabled={actorLoading}>
                  {actorLoading ? 'Searching…' : 'Search'}
                </button>
                {actorResults !== null && (
                  <button className="btn btn-ghost" onClick={clearActor}>Clear</button>
                )}
              </div>
              {actorResults !== null && (
                <p className="browse-adv-hint">
                  {actorResults.length
                    ? `${actorResults.length} dramas featuring "${actorInput}"`
                    : `No Chinese dramas found for "${actorInput}"`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="container">
          <div className="browse-results-bar">
            <span className="browse-results-count">
              {searchResults  !== null && `Search results · `}
              {actorResults   !== null && `Actor results · `}
              {displayed.length} drama{displayed.length !== 1 ? 's' : ''}
              {searchInput.trim() && ` for "${searchInput}"`}
            </span>
          </div>

          {loading || searchLoading ? (
            <p className="browse-empty">{searchLoading ? `Searching for "${searchInput}"…` : 'Loading dramas…'}</p>
          ) : displayed.length === 0 ? (
            <p className="browse-empty">No dramas match your filters.</p>
          ) : (
            <div className="drama-grid">
              {displayed.map(d => <DramaCard key={d.id} drama={d} />)}
            </div>
          )}

          {showLoadMore && !loading && (
            <div className="browse-load-more">
              <button className="btn btn-outline-browse" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>

      <footer>
        <p>DramaList &copy; 2025 &nbsp;·&nbsp; <a href="#">About</a> &nbsp;·&nbsp; <a href="#">Privacy</a></p>
      </footer>
    </>
  )
}
