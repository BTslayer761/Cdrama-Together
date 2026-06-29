import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchBackdropImages } from '../services/tmdb'
import { useStats } from '../hooks/useStats'
import '../styles/landing.css'

export default function Landing() {
  const user     = useAuth()
  const navigate = useNavigate()

  const stats = useStats()
  const [slides, setSlides]         = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    if (user) navigate('/home')
  }, [user])

  useEffect(() => {
    fetchBackdropImages().then(imgs => {
      if (imgs.length) setSlides(imgs)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (slides.length < 2) return
    const timer = setInterval(() => {
      setCurrentIdx(i => (i + 1) % slides.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [slides])

  return (
    <div className="landing">
      {/* ── Slideshow background ── */}
      <div className="landing-bg">
        {slides.map((slide, i) => (
          <div
            key={slide.url}
            className={`landing-slide${i === currentIdx ? ' active' : ''}`}
            style={{ backgroundImage: `url(${slide.url})` }}
          />
        ))}
        <div className="landing-overlay" />
      </div>

      {/* ── Slide progress bar ── */}
      <div className="landing-progress">
        <div className="landing-progress-fill" key={currentIdx} />
      </div>

      {/* ── Content ── */}
      <div className="landing-content">

        {/* Brand */}
        <div className="landing-brand">
          <div className="landing-brand-name">CDrama Together</div>
          <div className="landing-brand-tagline">Track · Rate · Discover · Connect</div>
        </div>

        {/* Hero */}
        <div className="landing-hero">
          <h1>
            Where Chinese Drama<br />
            <em>Fans Unite</em>
          </h1>
          <p>
            Track what you're watching, discover hidden gems, and connect
            with a community who shares your passion for Chinese drama.
          </p>
          <div className="landing-cta">
            <Link to="/register" className="landing-btn-primary">
              Get Started — it's free
            </Link>
            <Link to="/login" className="landing-btn-secondary">
              Sign In
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="landing-bottom">
          <div className="landing-stats">
            <div className="landing-stat">
              <span className="landing-stat-val">{stats.dramas}</span>
              <span className="landing-stat-label">Dramas</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-val">{stats.members}</span>
              <span className="landing-stat-label">Members</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-val">{stats.ratings}</span>
              <span className="landing-stat-label">Ratings</span>
            </div>
          </div>

          {slides[currentIdx] && (
            <div className="landing-caption">
              Now showing: {slides[currentIdx].title}
            </div>
          )}

          {slides.length > 1 && (
            <div className="landing-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`landing-dot${i === currentIdx ? ' active' : ''}`}
                  onClick={() => setCurrentIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
