export default function SeasonBars({ dramas }) {
  if (!dramas.length) return null
  return (
    <div className="season-bar-list">
      {dramas.map((d, i) => (
        <div key={i} className="season-bar-row">
          <div className="season-bar-labels">
            <span className="season-bar-name">{d.title}</span>
            <span className="season-bar-score">{d.score}</span>
          </div>
          <div className="season-bar-track">
            <div className="season-bar-fill" style={{ width: `${(d.score / 10) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
