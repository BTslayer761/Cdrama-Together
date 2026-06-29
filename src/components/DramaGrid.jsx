import DramaCard from './DramaCard'

export default function DramaGrid({ dramas, loading }) {
  if (loading) {
    return <p style={{ color: 'var(--ink-3)', fontSize: '0.875rem', padding: '1rem 0' }}>Loading dramas…</p>
  }
  if (!dramas.length) {
    return <p style={{ color: 'var(--ink-3)', fontSize: '0.875rem', padding: '1rem 0' }}>No dramas found.</p>
  }
  return (
    <div className="drama-grid">
      {dramas.map(d => <DramaCard key={d.id} drama={d} />)}
    </div>
  )
}
