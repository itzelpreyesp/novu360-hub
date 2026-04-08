const { cors, json, getSessionFromRequest, supabaseFetch } = require("./_supabase");

const ALLOWED_TABLES = new Set([
  "aprobaciones",
  "clientes",
  "contratos",
  "expediente_cliente",
  "leads",
  "pagos",
  "portal_cliente",
  "tareas",
  "usuario_roles",
  "usuarios",
  "analisis_lead",
  "mensajes_lead",
]);

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function addFilters(url, filters = []) {
  for (const filter of filters) {
    const method = String(filter.method || filter.op || "eq").toLowerCase();
    const column = filter.column;
    if (!column) continue;
    const value = filter.value;
    url.searchParams.append(column, `${method}.${value}`);
  }
}

function addOrdering(url, ordering) {
  if (!ordering?.column) return;
  const direction = ordering.ascending === false ? "desc" : "asc";
  url.searchParams.set("order", `${ordering.column}.${direction}`);
}

module.exports = async (req, res) => {
  cors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      json(res, 401, { error: "Unauthorized" });
      return;
    }

    const body = await readBody(req);
    const table = String(body.table || "").trim();
    const action = String(body.action || "select").toLowerCase();

    if (!table || !ALLOWED_TABLES.has(table)) {
      json(res, 403, { error: "Table not allowed" });
      return;
    }

    const base = `/rest/v1/${encodeURIComponent(table)}`;

    if (action === "select") {
      const url = new URL(base, "http://localhost");
      url.searchParams.set("select", body.columns || "*");
      addFilters(url, body.filters || []);
      addOrdering(url, body.ordering);
      if (body.limit) url.searchParams.set("limit", String(body.limit));

      const headers = {
        Accept: "application/json",
        Prefer: body.options?.head ? "count=exact" : "return=representation",
      };
      const method = body.options?.head ? "HEAD" : "GET";
      const response = await supabaseFetch(url.pathname + url.search, { method, headers });
      const countHeader = response.headers.get("content-range") || "";
      const countMatch = countHeader.match(/\/(\d+|\*)$/);
      const count = countMatch && countMatch[1] !== "*" ? Number(countMatch[1]) : null;

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        json(res, response.status, { error: errorText || "Select failed" });
        return;
      }

      if (body.options?.head) {
        json(res, 200, { data: null, count, error: null });
        return;
      }

      const data = await response.json();
      const normalized = body.single || body.maybeSingle ? (Array.isArray(data) ? data[0] || null : data || null) : data;
      json(res, 200, { data: normalized, count, error: null });
      return;
    }

    if (action === "insert" || action === "update" || action === "delete" || action === "upsert") {
      const url = new URL(base, "http://localhost");
      if (action === "upsert" && body.onConflict) {
        url.searchParams.set("on_conflict", body.onConflict);
      }

      if (action !== "delete") {
        url.searchParams.set("select", body.columns || "*");
      }

      addFilters(url, body.filters || []);
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: action === "upsert" ? "resolution=merge-duplicates,return=representation" : "return=representation",
      };

      const method = action === "insert" || action === "upsert" ? "POST" : action === "update" ? "PATCH" : "DELETE";
      const response = await supabaseFetch(url.pathname + url.search, {
        method,
        headers,
        body: action === "delete" ? undefined : JSON.stringify(body.payload ?? body.values ?? body.data ?? {}),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        json(res, response.status, { error: errorText || `${action} failed` });
        return;
      }

      const responseText = await response.text().catch(() => "");
      const data = responseText ? JSON.parse(responseText) : null;
      const normalized = body.single || body.maybeSingle
        ? (Array.isArray(data) ? data[0] || null : data || null)
        : data;
      json(res, 200, { data: normalized, error: null });
      return;
    }

    json(res, 400, { error: "Unknown db action" });
  } catch (error) {
    json(res, 500, { error: error.message || "Database proxy error" });
  }
};
