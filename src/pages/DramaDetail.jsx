import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { fetchDramaDetails } from '../services/tmdb'
import '../styles/drama-detail.css'

const STATUS_COLOR = {
  'Ongoing':       '#d4830a',
  'Completed':     '#3d8c3d',
  'Cancelled':     '#888',
  'In Production': '#5b8dd9',
  'Planned':       '#9b6dc5',
}

const CREW_ORDER = ['Director', 'Co-Director', 'Screenplay', 'Writer', 'Story',
                    'Executive Producer', 'Producer', 'Co-Producer',
                    'Original Music Composer', 'Music']

const CAST_PAGE_SIZE = 12

export default function DramaDetail() {
  const { id }    = useParams()
  const [drama, setDrama]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState(null)   // 'cast' | 'crew' | 'ost'
  const [castExpanded, setCastExpanded] = useState(false)

  useEffect(() => {
    setLoading(true)
    setTab(null)
    setCastExpanded(false)
    fetchDramaDetails(id)
      .then(d => { setDrama(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <>
      <Nav />
      <div className="detail-loading">Loading drama details…</div>
    </>
  )

  if (!drama) return (
    <>
      <Nav />
      <div className="detail-loading">Drama not found.</div>
    </>
  )

  const statusColor  = STATUS_COLOR[drama.status] || '#888'
  const visibleCast  = castExpanded ? drama.cast : drama.cast.slice(0, CAST_PAGE_SIZE)
  const hasMoreCast  = drama.cast.length > CAST_PAGE_SIZE

  // Group crew by department for cleaner display
  const crewByDept = drama.crew.reduce((acc, c) => {
    const dept = c.department || 'Other'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(c)
    return acc
  }, {})

  function toggleTab(name) {
    setTab(t => t === name ? null : name)
  }

  return (
    <>
      <Nav />

      {drama.backdropUrl && (
        <div
          className="detail-backdrop"
          style={{ backgroundImage: `url(${drama.backdropUrl})` }}
        >
          <div className="detail-backdrop-fade" />
        </div>
      )}

      <div className="detail-page">
        <div className="container">
          <Link to="/browse" className="detail-back">← Back to Browse</Link>

          <div className="detail-main">

            {/* Poster */}
            <div className="detail-poster">
              {drama.posterUrl
                ? <img src={drama.posterUrl} alt={drama.title} />
                : <div className="detail-poster-placeholder">映</div>
              }
            </div>

            {/* Info */}
            <div className="detail-info">
              <h1 className="detail-title">{drama.title}</h1>
              {drama.originalTitle && drama.originalTitle !== drama.title && (
                <p className="detail-original">{drama.originalTitle}</p>
              )}

              <div className="detail-chips">
                <span className="detail-status" style={{ background: statusColor }}>
                  {drama.status}
                </span>
                {drama.score && <span className="detail-score">★ {drama.score}</span>}
                {drama.firstAirDate && (
                  <span className="detail-chip">{drama.firstAirDate.slice(0, 4)}</span>
                )}
              </div>

              <div className="detail-facts">
                {drama.firstAirDate && (
                  <div className="detail-fact">
                    <span className="detail-fact-label">Release Date</span>
                    <span className="detail-fact-val">{drama.firstAirDate}</span>
                  </div>
                )}
                {drama.episodes && (
                  <div className="detail-fact">
                    <span className="detail-fact-label">Episodes</span>
                    <span className="detail-fact-val">{drama.episodes}</span>
                  </div>
                )}
                {drama.seasons && (
                  <div className="detail-fact">
                    <span className="detail-fact-label">Seasons</span>
                    <span className="detail-fact-val">{drama.seasons}</span>
                  </div>
                )}
                {drama.genres.length > 0 && (
                  <div className="detail-fact">
                    <span className="detail-fact-label">Genres</span>
                    <span className="detail-fact-val">{drama.genres.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="detail-synopsis">
                <h3 className="detail-section-label">Synopsis</h3>
                <p>{drama.overview}</p>
              </div>

              {/* Toggle buttons */}
              <div className="detail-tab-row">
                <button
                  className={`detail-tab-btn${tab === 'cast' ? ' active' : ''}`}
                  onClick={() => toggleTab('cast')}
                >
                  {tab === 'cast' ? '▲' : '▼'} Cast ({drama.cast.length})
                </button>
                <button
                  className={`detail-tab-btn${tab === 'crew' ? ' active' : ''}`}
                  onClick={() => toggleTab('crew')}
                >
                  {tab === 'crew' ? '▲' : '▼'} Staff &amp; Crew ({drama.crew.length})
                </button>
                <button
                  className={`detail-tab-btn${tab === 'ost' ? ' active' : ''}`}
                  onClick={() => toggleTab('ost')}
                >
                  {tab === 'ost' ? '▲' : '▼'} OST / Videos ({drama.videos.length})
                </button>
              </div>

              {/* ── Cast panel ── */}
              {tab === 'cast' && (
                <div className="cast-panel">
                  {drama.cast.length === 0
                    ? <p className="detail-empty">No cast data available.</p>
                    : (
                      <>
                        <div className="cast-grid">
                          {visibleCast.map(c => (
                            <div key={c.id} className="cast-card">
                              <div className="cast-card-photo">
                                {c.profileUrl
                                  ? <img src={c.profileUrl} alt={c.name} />
                                  : <div className="cast-card-photo-ph">{c.name[0]}</div>
                                }
                              </div>
                              <div className="cast-card-body">
                                <div className="cast-card-name">{c.name}</div>
                                {c.originalName && (
                                  <div className="cast-card-original">{c.originalName}</div>
                                )}
                                <div className="cast-card-character">as {c.character}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {hasMoreCast && (
                          <button
                            className="cast-expand-btn"
                            onClick={() => setCastExpanded(e => !e)}
                          >
                            {castExpanded
                              ? `Show less`
                              : `Show all ${drama.cast.length} cast members`}
                          </button>
                        )}
                      </>
                    )
                  }
                </div>
              )}

              {/* ── Crew panel ── */}
              {tab === 'crew' && (
                <div className="crew-panel">
                  {drama.crew.length === 0
                    ? <p className="detail-empty">No staff / crew data available.</p>
                    : Object.entries(crewByDept)
                        .sort(([a], [b]) => {
                          const order = ['Directing', 'Writing', 'Production', 'Sound']
                          return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) -
                                 (order.indexOf(b) === -1 ? 99 : order.indexOf(b))
                        })
                        .map(([dept, members]) => (
                          <div key={dept} className="crew-dept">
                            <div className="crew-dept-label">{dept}</div>
                            <div className="crew-list">
                              {members
                                .sort((a, b) => CREW_ORDER.indexOf(a.job) - CREW_ORDER.indexOf(b.job))
                                .map(c => (
                                  <div key={`${c.id}-${c.job}`} className="crew-card">
                                    <div className="crew-card-photo">
                                      {c.profileUrl
                                        ? <img src={c.profileUrl} alt={c.name} />
                                        : <div className="crew-card-photo-ph">{c.name[0]}</div>
                                      }
                                    </div>
                                    <div className="crew-card-body">
                                      <div className="crew-card-name">{c.name}</div>
                                      <div className="crew-card-job">{c.job}</div>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        ))
                  }
                </div>
              )}

              {/* ── OST panel ── */}
              {tab === 'ost' && (
                <div className="detail-ost">
                  {drama.videos.length ? (
                    <ul className="ost-list">
                      {drama.videos.map((v, i) => (
                        <li key={i} className="ost-item">
                          <span className="ost-type">{v.type}</span>
                          <span className="ost-name">{v.name}</span>
                          {v.site === 'YouTube' && (
                            <a
                              href={`https://www.youtube.com/watch?v=${v.key}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ost-link"
                            >Watch ↗</a>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="detail-empty">
                      TMDB does not carry OST song titles. For full soundtracks, check dedicated CDrama databases.
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <footer>
        <p>DramaList &copy; 2025 &nbsp;·&nbsp; <a href="#">About</a> &nbsp;·&nbsp; <a href="#">Privacy</a></p>
      </footer>
    </>
  )
}
