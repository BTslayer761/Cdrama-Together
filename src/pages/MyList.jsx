import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import RatingModal from '../components/RatingModal'
import { db } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS_LABELS = { watching: 'Watching', completed: 'Completed', dropped: 'Dropped' }

export default function MyList() {
  const user     = useAuth()
  const navigate = useNavigate()
  const [items, setItems]     = useState([])
  const [filter, setFilter]   = useState('all')
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)

  useEffect(() => {
    if (user === null) { navigate('/'); return }
    if (!user) return

    db.from('user_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setItems(data || [])
        setLoading(false)
      })
  }, [user])

  const counts = { watching: 0, completed: 0, dropped: 0 }
  items.forEach(i => { if (counts[i.status] !== undefined) counts[i.status]++ })

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)

  async function doUpdate(dramaId, status, rating, withRating) {
    const payload = { status, updated_at: new Date().toISOString() }
    if (withRating) payload.user_rating = rating
    await db.from('user_lists').update(payload).eq('user_id', user.id).eq('drama_id', dramaId)
    setItems(prev => prev.map(i =>
      i.drama_id === dramaId ? { ...i, status, ...(withRating ? { user_rating: rating } : {}) } : i
    ))
  }

  function handleStatusChange(dramaId, newStatus) {
    if (newStatus === 'completed') {
      const item = items.find(i => i.drama_id === dramaId)
      setModal({ dramaId, title: item?.drama_title || '', existing: item?.user_rating || null, newStatus })
    } else {
      doUpdate(dramaId, newStatus, null, false)
    }
  }

  async function removeItem(dramaId) {
    await db.from('user_lists').delete().eq('user_id', user.id).eq('drama_id', dramaId)
    setItems(prev => prev.filter(i => i.drama_id !== dramaId))
  }

  return (
    <>
      <Nav />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div className="page-header">
          <h1>My List</h1>
          <p>Track the dramas you're watching, have completed, or dropped.</p>
        </div>

        <div className="list-summary">
          <div className="list-summary-item">
            <span className="list-summary-count">{items.length}</span>
            <span className="list-summary-label">Total</span>
          </div>
          <div className="list-summary-item">
            <span className="list-summary-count" style={{ color: 'var(--red)' }}>{counts.watching}</span>
            <span className="list-summary-label">Watching</span>
          </div>
          <div className="list-summary-item">
            <span className="list-summary-count" style={{ color: '#3d7a3d' }}>{counts.completed}</span>
            <span className="list-summary-label">Completed</span>
          </div>
          <div className="list-summary-item">
            <span className="list-summary-count" style={{ color: '#888' }}>{counts.dropped}</span>
            <span className="list-summary-label">Dropped</span>
          </div>
        </div>

        <div className="filter-tabs" style={{ marginTop: '1.5rem' }}>
          {['all', 'watching', 'completed', 'dropped'].map(f => (
            <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="my-list">
          {loading && <p style={{ color: 'var(--ink-3)', padding: '2rem 0' }}>Loading your list…</p>}
          {!loading && filtered.length === 0 && (
            <p style={{ color: 'var(--ink-3)', padding: '2rem 0' }}>No dramas here yet.</p>
          )}
          {filtered.map(item => (
            <div key={item.drama_id} className="my-list-item">
              <div className="my-list-poster">
                {item.drama_poster_url
                  ? <img src={item.drama_poster_url} alt={item.drama_title} />
                  : <div className="my-list-poster-placeholder">映</div>
                }
              </div>
              <div className="my-list-info">
                <div className="my-list-title">{item.drama_title}</div>
                <div className="my-list-meta">
                  <span className={`badge badge-${item.status}`}>{STATUS_LABELS[item.status]}</span>
                </div>
              </div>
              <div className="my-list-scores">
                {item.tmdb_score && <span className="score-pill score-tmdb">★ {item.tmdb_score}</span>}
                {item.status === 'completed' && item.user_rating && (
                  <span className="score-pill score-user">★ {item.user_rating}</span>
                )}
                {item.status === 'completed' && (
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    onClick={() => setModal({ dramaId: item.drama_id, title: item.drama_title, existing: item.user_rating, newStatus: 'completed' })}
                  >
                    {item.user_rating ? 'Re-rate' : 'Rate'}
                  </button>
                )}
              </div>
              <div className="my-list-actions">
                <select
                  className={`status-select status-${item.status}`}
                  value={item.status}
                  onChange={e => handleStatusChange(item.drama_id, e.target.value)}
                >
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => removeItem(item.drama_id)}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer>
        <p>DramaList &copy; 2025 &nbsp;·&nbsp; <a href="#">About</a> &nbsp;·&nbsp; <a href="#">Privacy</a></p>
      </footer>

      {modal && (
        <RatingModal
          dramaTitle={modal.title}
          existingRating={modal.existing}
          onSave={rating => { doUpdate(modal.dramaId, modal.newStatus, rating, true); setModal(null) }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
