const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'  
const GEMINI_API_URL = 'https://your-domain.vercel.app/api/gemini'
window.CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_URL }
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
