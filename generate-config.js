const fs = require('fs');

const configContent = `const SUPABASE_URL = '${process.env.SUPABASE_URL || ""}';
const SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY || ""}';
const GEMINI_KEY = '${process.env.GEMINI_KEY || ""}';

window.CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_KEY };

document.addEventListener('DOMContentLoaded', function() {
  if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(
      SUPABASE_URL, 
      SUPABASE_ANON_KEY
    );
  }
});
`;

fs.writeFileSync('config.js', configContent);
console.log('config.js generated from environment variables');
