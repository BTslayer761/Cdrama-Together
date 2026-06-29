import { useState } from 'react'

const LABELS = ['', 'Appalling', 'Horrible', 'Very Bad', 'Bad', 'Average',
                 'Fine', 'Good', 'Very Good', 'Great', 'Masterpiece']

export default function RatingModal({ dramaTitle, existingRating, onSave, onClose }) {
  const [selected, setSelected] = useState(existingRating || null)
  const [hovered, setHovered]   = useState(null)

  const active = hovered ?? selected ?? 0

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-title">Rate this drama</div>
        <div className="modal-drama-name">{dramaTitle}</div>
        <p className="modal-subtitle">How would you rate it? (optional)</p>
        <div className="rating-stars">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={`rating-star${active > i ? ' active' : ''}`}
              onMouseEnter={() => setHovered(i + 1)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(i + 1)}
            >★</span>
          ))}
        </div>
        <div className="rating-label">
          {selected ? `${selected}/10 — ${LABELS[selected]}` : ' '}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => { onClose(); onSave(null) }}>Skip</button>
          <button className="btn btn-primary" onClick={() => { onClose(); onSave(selected) }}>Save Rating</button>
        </div>
      </div>
    </div>
  )
}
