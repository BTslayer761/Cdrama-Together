import { Link } from 'react-router-dom'
import { useStats } from '../hooks/useStats'

export default function Hero() {
  const stats = useStats()

  return (
    <section className="hero">
      <p className="hero-eyebrow">Track · Rate · Discover</p>
      <h1>Your home for <em>Chinese drama</em></h1>
      <p>Track what you're watching, discover hidden gems, and connect with fans who share your taste.</p>
      <div className="hero-cta">
        <Link to="/register" className="btn btn-primary btn-lg">Get started — it's free</Link>
        <a href="#" className="btn btn-outline-light btn-lg">Browse dramas</a>
      </div>
      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-val">{stats.dramas}</div>
          <div className="hero-stat-label">Dramas catalogued</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-val">{stats.members}</div>
          <div className="hero-stat-label">Active members</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-val">{stats.ratings}</div>
          <div className="hero-stat-label">Ratings logged</div>
        </div>
      </div>
    </section>
  )
}
