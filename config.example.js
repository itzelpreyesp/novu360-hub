// NOVU 360 HUB - config.example.js
// Template to configure Supabase and Gemini API credentials

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; 
const GEMINI_KEY = 'YOUR_GEMINI_API_KEY_HERE';

// Export for usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_URL, SUPABASE_KEY, GEMINI_KEY };
} else {
    window.CONFIG = { SUPABASE_URL, SUPABASE_KEY, GEMINI_KEY };
}
