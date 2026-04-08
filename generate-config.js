const fs = require("fs");

const apiBaseUrl = process.env.API_BASE_URL || "/api";

const configContent = `const API_BASE_URL = '${apiBaseUrl}';

window.CONFIG = {
  API_BASE_URL,
};

if (typeof window.createNovuSupabaseClient === 'function') {
  window.supabaseClient = window.createNovuSupabaseClient(API_BASE_URL);
} else {
  console.error('novu-client.js must load before config.js');
}
`;

fs.writeFileSync("config.js", configContent);
console.log("config.js generated from environment variables");
