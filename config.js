// Los valores reales los inyecta el workflow de GitHub Actions
window.SUPABASE_URL = "SUPABASE_URL_PLACEHOLDER";
window.SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY_PLACEHOLDER";
window.GEMINI_KEY = "GEMINI_KEY_PLACEHOLDER";

window.CONFIG = {
    SUPABASE_URL: window.SUPABASE_URL,
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY,
    GEMINI_KEY: window.GEMINI_KEY
};

window.supabaseClient = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log('✅ Supabase Client initialized');
    } else {
        console.error('❌ Supabase library missing');
    }
});