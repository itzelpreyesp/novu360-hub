const {
  cors,
  json,
  clearCookie,
  sessionCookie,
  getSessionFromRequest,
  authPassword,
  supabaseJson,
} = require("./_supabase");

async function readBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return {};
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

async function attachRole(session) {
  if (!session?.user?.id) return session;
  const { response, body } = await supabaseJson(
    `/rest/v1/usuario_roles?select=rol&usuario_id=eq.${encodeURIComponent(session.user.id)}&limit=1`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  );

  const role = response.ok && Array.isArray(body) && body[0] ? body[0].rol || null : null;
  return { ...session, role: role || session.role || "admin" };
}

module.exports = async (req, res) => {
  cors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const action = String(url.searchParams.get("action") || "").toLowerCase();

  try {
    if (req.method === "GET" && action === "session") {
      const session = await getSessionFromRequest(req);
      if (!session) {
        json(res, 200, { data: { session: null, user: null, role: null }, error: null });
        return;
      }
      json(res, 200, { data: { session, user: session.user, role: session.role }, error: null });
      return;
    }

    if (req.method === "POST" && action === "logout") {
      res.setHeader("Set-Cookie", clearCookie(req));
      json(res, 200, { data: { success: true }, error: null });
      return;
    }

    if (req.method !== "POST") {
      json(res, 405, { error: "Method not allowed" });
      return;
    }

    const body = await readBody(req);

    if (action === "login") {
      const { response, body: authBody } = await authPassword("token?grant_type=password", {
        email: body.email,
        password: body.password,
      });

      if (!response.ok) {
        json(res, response.status, { error: authBody?.error_description || authBody?.msg || authBody?.message || "Login failed" });
        return;
      }

      const session = await attachRole(authBody?.session ? { ...authBody.session, user: authBody.user } : { user: authBody.user, session: null });
      if (session.access_token) {
        res.setHeader("Set-Cookie", sessionCookie(session.access_token, req));
      }
      json(res, 200, { data: { user: session.user, session, role: session.role }, error: null });
      return;
    }

    if (action === "signup") {
      const payload = {
        email: body.email,
        password: body.password,
        options: body.options || {},
      };
      const { response, body: signUpBody } = await authPassword("signup", payload);

      if (!response.ok) {
        json(res, response.status, { error: signUpBody?.error_description || signUpBody?.msg || signUpBody?.message || "Signup failed" });
        return;
      }

      const session = signUpBody?.session ? await attachRole({ ...signUpBody.session, user: signUpBody.user }) : null;
      if (session?.access_token) {
        res.setHeader("Set-Cookie", sessionCookie(session.access_token, req));
      }
      json(res, 200, { data: { user: signUpBody.user || null, session, role: session?.role || null }, error: null });
      return;
    }

    if (action === "oauth") {
      json(res, 501, { error: "OAuth is not enabled in this secure proxy" });
      return;
    }

    json(res, 400, { error: "Unknown auth action" });
  } catch (error) {
    json(res, 500, { error: error.message || "Auth service error" });
  }
};
