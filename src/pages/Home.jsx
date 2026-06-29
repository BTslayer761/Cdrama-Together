import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import DramaGrid from '../components/DramaGrid'
import FilterTabs from '../components/FilterTabs'
import GenreCloud from '../components/GenreCloud'
import SeasonBars from '../components/SeasonBars'
import ActivityFeed from '../components/ActivityFeed'
import MyListWidget from '../components/MyListWidget'
import { fetchAiringDramas, fetchTopRatedDramas, fetchSeasonDramas } from '../services/tmdb'
import { db } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const user = useAuth()
  const [airingDramas, setAiringDramas] = useState([])
  const [topRated, setTopRated]         = useState([])
  const [seasonDramas, setSeasonDramas] = useState([])
  const [activeGenre, setActiveGenre]   = useState('all')
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (user === undefined) return

    async function load() {
      try {
        const [airing, top, season] = await Promise.all([
          fetchAiringDramas(),
          fetchTopRatedDramas(),
          fetchSeasonDramas(),
        ])

        let statusMap = {}
        if (user) {
          const { data } = await db.from('user_lists').select('drama_id, status').eq('user_id', user.id)
          if (data) statusMap = Object.fromEntries(data.map(r => [r.drama_id, r.status]))
        }

        const enrich = d => ({ ...d, userStatus: statusMap[d.id] || null })
        setAiringDramas(airing.map(enrich))
        setTopRated(top.map(enrich))
        setSeasonDramas(season)
      } catch (err) {
        console.error('Failed to load dramas:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  const genres   = [...new Set(airingDramas.map(d => d.genre).filter(Boolean))].sort()
  const filtered = activeGenre === 'all' ? airingDramas : airingDramas.filter(d => d.genre === activeGenre)

  return (
    <>
      <Nav />
      <Hero />
      <div className="container">
        <div className="main-grid">
          <main>
            <div className="section-head">
              <h2>Currently Airing</h2>
              <a href="#">See all →</a>
            </div>
            {!loading && genres.length > 0 && (
              <FilterTabs genres={genres} active={activeGenre} onSelect={setActiveGenre} />
            )}
            <DramaGrid dramas={filtered} loading={loading} />

            <div className="section-head" style={{ marginTop: '2.5rem' }}>
              <h2>Top Rated All Time</h2>
              <a href="#">Full rankings →</a>
            </div>
            <DramaGrid dramas={topRated} loading={loading} />
          </main>

          <aside className="sidebar">
            <MyListWidget />

            <div className="widget">
              <div className="widget-title">Browse by Genre</div>
              <GenreCloud />
            </div>

            <div className="widget">
              <div className="widget-title">Summer 2025 — Top Picks</div>
              {seasonDramas.length > 0
                ? <SeasonBars dramas={seasonDramas} />
                : <p style={{ color: 'var(--ink-3)', fontSize: '0.8rem' }}>Loading…</p>
              }
            </div>

            <div className="widget">
              <div className="widget-title">Community Activity</div>
              <ActivityFeed />
            </div>
          </aside>
        </div>
      </div>
      <footer>
        <p>DramaList &copy; 2025 &nbsp;·&nbsp;
          <a href="#">About</a> &nbsp;·&nbsp;
          <a href="#">API</a> &nbsp;·&nbsp;
          <a href="#">Privacy</a> &nbsp;·&nbsp;
          <a href="#">Contact</a>
        </p>
      </footer>
    </>
  )
}
