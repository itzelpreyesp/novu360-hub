const SUPABASE_URL = 'https://tmyniibsccxhfifhcqpa.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_oqhiSuKengQF6ak76JTSEg_FNQl9G79'  
const GEMINI_KEY = 'AIzaSyCY06mg8RjTju4FU9pJnZjAvbt6nsCM1Pw'
window.CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_KEY }
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
