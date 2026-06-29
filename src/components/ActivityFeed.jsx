const ACTIVITY_FEED = [
  { initials: 'YL', user: 'YunLan',     action: 'rated',             drama: 'The Story of Minglan',  detail: '★9.2', time: '2 minutes ago' },
  { initials: 'SS', user: 'StarSienna', action: 'started watching',  drama: 'Nirvana in Fire',        detail: null,   time: '14 minutes ago' },
  { initials: 'XH', user: 'XiaoHu',    action: 'added a review for', drama: 'Love Like the Galaxy', detail: null,   time: '32 minutes ago' },
  { initials: 'DR', user: 'DramaRain', action: 'completed',          drama: 'Go Ahead',               detail: null,   time: '1 hour ago' },
]

export default function ActivityFeed() {
  return (
    <div className="activity-list">
      {ACTIVITY_FEED.map((item, i) => (
        <div key={i} className="activity-item">
          <div className="activity-avatar">{item.initials}</div>
          <div className="activity-text">
            <strong>{item.user}</strong> {item.action} <strong>{item.drama}</strong>
            {item.detail && ` ${item.detail}`}
            <div className="activity-time">{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
