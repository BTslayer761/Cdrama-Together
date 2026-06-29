import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../services/supabase'
import RatingModal from './RatingModal'

export default function DramaCard({ drama }) {
  const user     = useAuth()
  const navigate = useNavigate()
  const [status, setStatus]         = useState(drama.userStatus || '')
  const [showModal, setShowModal]   = useState(false)
  const [pendingStatus, setPending] = useState(null)

  async function saveToList(newStatus, rating) {
    await db.from('user_lists').upsert({
      user_id:          user.id,
      drama_id:         drama.id,
      drama_title:      drama.title,
      drama_poster_url: drama.posterUrl || null,
      tmdb_score:       typeof drama.score === 'number' ? drama.score : null,
      status:           newStatus,
      user_rating:      rating,
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'user_id,drama_id' })
    setStatus(newStatus)
  }

  function handleChange(e) {
    const val = e.target.value
    if (!user) { navigate('/login'); return }
    if (!val) return
    if (val === 'completed') {
      setPending(val)
      setShowModal(true)
    } else {
      saveToList(val, null)
    }
  }

  const epsMeta = drama.eps ? `${drama.eps} eps` : 'TV Series'
  const selectClass = status ? `status-select status-${status}` : 'status-select'

  return (
    <>
      <div className="drama-card" data-id={drama.id} data-genre={drama.genre}>
        <Link to={`/drama/${drama.id}`} className="drama-card-poster-link">
          <div className="drama-card-poster">
            {drama.posterUrl
              ? <img src={drama.posterUrl} alt={drama.title} />
              : <div className="drama-card-poster-placeholder">映</div>
            }
            {drama.status === 'airing'
              ? <span className="drama-card-badge badge-airing">Airing</span>
              : <span className="drama-card-badge badge-completed">Completed</span>
            }
            <div className="drama-card-score">★ {drama.score}</div>
          </div>
        </Link>
        <div className="drama-card-info">
          <Link to={`/drama/${drama.id}`} className="drama-card-title-link">
            <div className="drama-card-title">{drama.title}</div>
          </Link>
          <div className="drama-card-meta">{drama.year} · {drama.genre} · {epsMeta}</div>
          <div className="drama-card-actions">
            <select className={selectClass} value={status} onChange={handleChange}>
              <option value="">＋ Add to List</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
        </div>
      </div>

      {showModal && (
        <RatingModal
          dramaTitle={drama.title}
          existingRating={null}
          onSave={rating => { saveToList(pendingStatus, rating); setShowModal(false) }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
