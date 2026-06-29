import { useState } from 'react'

const GENRES = [
  'Drama', 'Romance', 'Action', 'Comedy', 'Mystery',
  'Fantasy', 'Crime', 'Family', 'War & Politics', 'Thriller', 'Historical', 'Sci-Fi',
]

export default function GenreCloud() {
  const [active, setActive] = useState(new Set([GENRES[0]]))

  function toggle(genre) {
    setActive(prev => {
      const next = new Set(prev)
      next.has(genre) ? next.delete(genre) : next.add(genre)
      return next
    })
  }

  return (
    <div className="genre-cloud">
      {GENRES.map(g => (
        <span
          key={g}
          className={`genre-tag${active.has(g) ? ' active' : ''}`}
          onClick={() => toggle(g)}
        >{g}</span>
      ))}
    </div>
  )
}
