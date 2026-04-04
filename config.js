const SUPABASE_URL = '[REDACTED]';
const SUPABASE_KEY = '[REDACTED]'; 
const GEMINI_KEY = '[REDACTED]';

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_URL, SUPABASE_KEY, GEMINI_KEY };
} else {
    window.CONFIG = { SUPABASE_URL, SUPABASE_KEY, GEMINI_KEY };
}
