import { db } from './supabase'

export async function fetchMemberCount() {
  const { data } = await db.from('user_lists').select('user_id')
  if (!data) return 0
  return new Set(data.map(r => r.user_id)).size
}

export async function fetchRatingCount() {
  const { count } = await db
    .from('user_lists')
    .select('*', { count: 'exact', head: true })
    .not('user_rating', 'is', null)
  return count || 0
}
