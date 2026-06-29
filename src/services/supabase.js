import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = 'https://audfwezwftclcrbzovdt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZGZ3ZXp3ZnRjbGNyYnpvdmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDYzOTUsImV4cCI6MjA5ODA4MjM5NX0.vZSlBa4ulwp98CaZzGkYBtG1dTYLoiZE_-obu_f38A4'

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
