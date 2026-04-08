const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "";
const SESSION_COOKIE = "novu_session";

function cors(req, res) {
  const origin = req.headers.origin;
  const allowOrigin = FRONTEND_ORIGIN || origin || "";

  if (allowOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function json(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.split("=");
    const key = (rawKey || "").trim();
    if (!key) return acc;
    acc[key] = decodeURIComponent(rawValue.join("=").trim());
    return acc;
  }, {});
}

function isHttps(req) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").toLowerCase();
  const host = String(req.headers.host || "");
  return forwardedProto === "https" || host.includes("vercel.app") || process.env.NODE_ENV === "production";
}

function sessionCookie(value, req, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const secure = isHttps(req);
  const sameSite = secure ? "None" : "Lax";
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=${sameSite}; ${secure ? "Secure; " : ""}Max-Age=${maxAgeSeconds}`;
}

function clearCookie(req) {
  const secure = isHttps(req);
  const sameSite = secure ? "None" : "Lax";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=${sameSite}; ${secure ? "Secure; " : ""}Max-Age=0`;
}

async function supabaseFetch(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase server configuration");
  }

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${SUPABASE_URL.replace(/\/+$/, "")}${path}`, {
    ...options,
    headers,
  });

  return response;
}

async function supabaseJson(path, options = {}) {
  const response = await supabaseFetch(path, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (_error) {
    body = text;
  }
  return { response, body };
}

async function getUserFromAccessToken(accessToken) {
  if (!accessToken) return null;
  const { response, body } = await supabaseJson("/auth/v1/user", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return null;
  return body;
}

async function lookupRole(userId) {
  const path = `/rest/v1/usuario_roles?select=rol&usuario_id=eq.${encodeURIComponent(userId)}&limit=1`;
  const { response, body } = await supabaseJson(path, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) return null;
  return Array.isArray(body) && body[0] ? body[0].rol || null : null;
}

async function getSessionFromRequest(req) {
  const cookies = parseCookies(req);
  const sessionToken = cookies[SESSION_COOKIE];
  const user = await getUserFromAccessToken(sessionToken);
  if (!user) return null;
  const role = await lookupRole(user.id);
  return {
    access_token: sessionToken,
    user,
    role: role || "admin",
  };
}

async function authPassword(path, body) {
  return supabaseJson(`/auth/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

module.exports = {
  cors,
  json,
  parseCookies,
  clearCookie,
  sessionCookie,
  getSessionFromRequest,
  authPassword,
  supabaseJson,
  supabaseFetch,
  lookupRole,
  getUserFromAccessToken,
};
