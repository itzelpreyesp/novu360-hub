const fs = require('fs');

const configContent = `const SUPABASE_URL = '${process.env.SUPABASE_URL || ""}';
const SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY || ""}';
const GEMINI_API_URL = '${process.env.GEMINI_API_URL || ""}';

window.CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_URL };

if (window.supabase) {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL, 
    SUPABASE_ANON_KEY
  );
} else {
  console.error('Supabase CDN not loaded before config.js');
}
`;

fs.writeFileSync('config.js', configContent);
console.log('config.js generated from environment variables');
