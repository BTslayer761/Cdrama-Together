// Initialise the Supabase client as a true global so all scripts can access it.
// Requires config.js (SUPABASE_URL, SUPABASE_ANON_KEY) and the Supabase CDN to load first.
window.db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
