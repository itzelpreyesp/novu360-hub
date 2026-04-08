const API_BASE_URL = "/api";

window.CONFIG = {
  API_BASE_URL,
};

window.supabaseClient = window.createNovuSupabaseClient(API_BASE_URL);
