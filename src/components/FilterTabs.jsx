export default function FilterTabs({ genres, active, onSelect }) {
  return (
    <div className="filter-tabs">
      {['all', ...genres].map(g => (
        <button
          key={g}
          className={`filter-tab${active === g ? ' active' : ''}`}
          onClick={() => onSelect(g)}
        >
          {g === 'all' ? 'All' : g}
        </button>
      ))}
    </div>
  )
}
