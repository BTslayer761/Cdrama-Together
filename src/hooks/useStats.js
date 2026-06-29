import { useEffect, useState } from 'react'
import { fetchDramaCount } from '../services/tmdb'
import { fetchMemberCount, fetchRatingCount } from '../services/stats'
import { formatStat } from '../utils/format'

export function useStats() {
  const [stats, setStats] = useState({ dramas: '…', members: '…', ratings: '…' })

  useEffect(() => {
    Promise.all([
      fetchDramaCount(),
      fetchMemberCount(),
      fetchRatingCount(),
    ]).then(([dramas, members, ratings]) => {
      setStats({
        dramas:  formatStat(dramas),
        members: formatStat(members),
        ratings: formatStat(ratings),
      })
    }).catch(() => {})
  }, [])

  return stats
}
