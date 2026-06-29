import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../services/supabase'

export default function MyListWidget() {
  const user = useAuth()
  const [counts, setCounts] = useState({ watching: 0, completed: 0, ptw: 0, hold: 0, dropped: 0 })

  useEffect(() => {
    if (!user) return
    db.from('user_lists').select('status').eq('user_id', user.id).then(({ data }) => {
      if (!data) return
      const c = { watching: 0, completed: 0, ptw: 0, hold: 0, dropped: 0 }
      data.forEach(r => { if (c[r.status] !== undefined) c[r.status]++ })
      setCounts(c)
    })
  }, [user])

  return (
    <div className="widget">
      <div className="widget-title">My List</div>
      <div className="list-status-rows">
        <div className="list-status-row">
          <div className="list-status-dot" style={{ background: 'var(--red)' }} />
          <span className="list-status-label">Watching</span>
          <span className="list-status-count">{counts.watching}</span>
        </div>
        <div className="list-status-row">
          <div className="list-status-dot" style={{ background: '#5a9c5a' }} />
          <span className="list-status-label">Completed</span>
          <span className="list-status-count">{counts.completed}</span>
        </div>
        <div className="list-status-row">
          <div className="list-status-dot" style={{ background: '#888' }} />
          <span className="list-status-label">Plan to Watch</span>
          <span className="list-status-count">{counts.ptw}</span>
        </div>
        <div className="list-status-row">
          <div className="list-status-dot" style={{ background: 'var(--gold)' }} />
          <span className="list-status-label">On Hold</span>
          <span className="list-status-count">{counts.hold}</span>
        </div>
        <div className="list-status-row">
          <div className="list-status-dot" style={{ background: '#bbb' }} />
          <span className="list-status-label">Dropped</span>
          <span className="list-status-count">{counts.dropped}</span>
        </div>
      </div>
      <div className="widget-footer">
        <Link to="/my-list" className="btn btn-primary btn-block">Open My List</Link>
      </div>
    </div>
  )
}
