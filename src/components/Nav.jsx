import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../services/supabase'

export default function Nav() {
  const user     = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const initials = user ? (() => {
    const raw   = user.user_metadata?.full_name || user.email || ''
    const parts = raw.trim().split(/\s+/)
    return (parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : raw.slice(0, 2)
    ).toUpperCase()
  })() : ''

  function handleSearchKey(e) {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`)
    }
  }

  async function handleSignOut() {
    await db.auth.signOut()
    navigate('/')
  }

  const isActive = path => location.pathname === path ? 'active' : undefined

  return (
    <nav className="nav">
      <Link className="nav-logo" to="/home">CDrama<span>Together</span></Link>

      <ul className="nav-links">
        <li><Link to="/home" className={isActive('/home')}>Home</Link></li>
        <li><Link to="/browse" className={isActive('/browse')}>Browse</Link></li>
        <li><a href="#">Seasonal</a></li>
        <li><a href="#">Top Rated</a></li>
        <li><Link to="/my-list" className={isActive('/my-list')}>My List</Link></li>
      </ul>

      <div className="nav-right">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search dramas…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleSearchKey}
          />
        </div>
        <div id="nav-auth">
          {user ? (
            <>
              <Link to="/my-list" className="btn btn-ghost">My List</Link>
              <span className="nav-avatar" title={user.email}>{initials}</span>
              <button className="btn btn-ghost" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
