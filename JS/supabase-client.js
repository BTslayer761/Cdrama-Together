// Initialise the Supabase client. Requires config.js to be loaded first.
// The global `supabase` object comes from the Supabase CDN script in HTML.
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
