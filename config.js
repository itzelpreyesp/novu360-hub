const SUPABASE_URL = 'https://tmyniibsccxhfifhcqpa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jY3aG232zXsij1o2zDAWig_bbhfLIjO';
const GEMINI_KEY = 'AIzaSyBYBeU37nvcDlwpzftvt2HoYGyHh2RJUSQ';
window.CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_KEY };

// Exponer variables globales sueltas para compatibilidad
window.GEMINI_KEY = GEMINI_KEY;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// Variable global para el cliente de Supabase
window.supabaseClient = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase Client initialized in config.js');
    } else {
        console.error('❌ Supabase library missing. Check index.html imports.');
    }

}

);