const SUPABASE_URL = 'https://tmyniibsccxhfifhcqpa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jY3aG232zXsij1o2zDAWig_bbhfLIjO';
const GEMINI_KEY = 'AIzaSyCmkUoSEGxz9UafGtTfd0idhXSnpabL9_M';

window.CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_KEY };

document.addEventListener('DOMContentLoaded', function() {
  if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(
      SUPABASE_URL, 
      SUPABASE_ANON_KEY
    );
  }
});
