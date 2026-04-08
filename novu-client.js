(function () {
  function joinUrl(baseUrl, path) {
    const trimmedBase = String(baseUrl || "").replace(/\/+$/, "");
    const trimmedPath = String(path || "").replace(/^\/+/, "");
    return trimmedBase ? `${trimmedBase}/${trimmedPath}` : `/${trimmedPath}`;
  }

  async function readResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => "");

    if (!response.ok) {
      const message =
        (body && typeof body === "object" && (body.error || body.message)) ||
        (typeof body === "string" && body) ||
        `Request failed (${response.status})`;
      return { data: null, error: new Error(message) };
    }

    return {
      data: body && typeof body === "object" && "data" in body ? body.data : body,
      error: body && typeof body === "object" && body.error ? new Error(body.error) : null,
    };
  }

  class NovuQuery {
    constructor(client, table) {
      this.client = client;
      this.table = table;
      this.action = "select";
      this.columns = "*";
      this.returnColumns = "*";
      this.filters = [];
      this.ordering = null;
      this.limitValue = null;
      this.payload = null;
      this.options = {};
      this.conflictTarget = null;
      this.singleMode = false;
      this.maybeSingleMode = false;
    }

    select(columns = "*", options = {}) {
      this.columns = columns || "*";
      this.returnColumns = columns || "*";
      this.options = options || {};
      if (this.action === "select") {
        this.action = "select";
      }
      return this;
    }

    insert(payload) {
      this.action = "insert";
      this.payload = payload;
      return this;
    }

    update(payload) {
      this.action = "update";
      this.payload = payload;
      return this;
    }

    upsert(payload, options = {}) {
      this.action = "upsert";
      this.payload = payload;
      this.conflictTarget = options.onConflict || options.on_conflict || null;
      return this;
    }

    delete() {
      this.action = "delete";
      return this;
    }

    eq(column, value) {
      this.filters.push({ method: "eq", column, value });
      return this;
    }

    neq(column, value) {
      this.filters.push({ method: "neq", column, value });
      return this;
    }

    gt(column, value) {
      this.filters.push({ method: "gt", column, value });
      return this;
    }

    gte(column, value) {
      this.filters.push({ method: "gte", column, value });
      return this;
    }

    lt(column, value) {
      this.filters.push({ method: "lt", column, value });
      return this;
    }

    lte(column, value) {
      this.filters.push({ method: "lte", column, value });
      return this;
    }

    order(column, options = {}) {
      this.ordering = { column, ascending: options.ascending !== false };
      return this;
    }

    limit(count) {
      this.limitValue = count;
      return this;
    }

    single() {
      this.singleMode = true;
      return this;
    }

    maybeSingle() {
      this.maybeSingleMode = true;
      return this;
    }

    then(resolve, reject) {
      return this.execute().then(resolve, reject);
    }

    catch(reject) {
      return this.execute().catch(reject);
    }

    finally(handler) {
      return this.execute().finally(handler);
    }

    async execute() {
      return this.client._dbRequest({
        table: this.table,
        action: this.action,
        columns: this.returnColumns || this.columns,
        filters: this.filters,
        ordering: this.ordering,
        limit: this.limitValue,
        payload: this.payload,
        options: this.options,
        onConflict: this.conflictTarget,
        single: this.singleMode,
        maybeSingle: this.maybeSingleMode,
      });
    }
  }

  class NovuAuth {
    constructor(client) {
      this.client = client;
    }

    async signInWithPassword({ email, password }) {
      return this.client._authRequest("login", { email, password });
    }

    async signUp({ email, password, options = {} }) {
      return this.client._authRequest("signup", {
        email,
        password,
        options,
      });
    }

    async getSession() {
      return this.client._authRequest("session", null, "GET");
    }

    async signOut() {
      return this.client._authRequest("logout", null);
    }

    async signInWithOAuth() {
      return {
        data: null,
        error: new Error("OAuth is not enabled in the secure proxy setup"),
      };
    }
  }

  class NovuSupabaseClient {
    constructor(baseUrl) {
      this.baseUrl = String(baseUrl || "/api").replace(/\/+$/, "") || "/api";
      this.auth = new NovuAuth(this);
    }

    from(table) {
      return new NovuQuery(this, table);
    }

    async _authRequest(action, body, method = "POST") {
      const url = joinUrl(this.baseUrl, `auth?action=${encodeURIComponent(action)}`);
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: method === "GET" ? undefined : { "Content-Type": "application/json" },
        body: method === "GET" || body == null ? undefined : JSON.stringify(body),
      });
      return readResponse(response);
    }

    async _dbRequest(body) {
      const response = await fetch(joinUrl(this.baseUrl, "db"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return readResponse(response);
    }
  }

  window.createNovuSupabaseClient = function createNovuSupabaseClient(baseUrl) {
    return new NovuSupabaseClient(baseUrl);
  };
})();
