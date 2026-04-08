const SUPABASE_URL = 'https://tmyniibsccxhfifhcqpa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jY3aG232zXsij1o2zDAWig_bbhfLIjO';
const GEMINI_KEY = '[AIzaSyCmkUoSEGxz9UafGtTfd0idhXSnpabL9_M]';
window.CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_KEY };

// Variable global para el cliente de Supabase
window.supabaseClient = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase Client initialized in config.js');
    } else {
        console.error('❌ Supabase library missing. Check index.html imports.');
    }
});