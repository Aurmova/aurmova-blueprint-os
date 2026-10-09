import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const ORIGIN = "https://aurmova.github.io";
const API = "https://aurmova-secure-api.example.workers.dev";
const mockEnvironment = (db = {}) => ({
  API_ORIGIN: API,
  FRONTEND_LOGIN_URL: API + "/owner-login",
  GITHUB_CLIENT_ID: "test-client-id",
  GITHUB_CLIENT_SECRET: "not-a-real-secret",
  OWNER_GITHUB_USER_ID: "1234",
  DB: db,
});
const request = (path, opts = {}) => new Request(API + path, opts);

function createDb() {
  const loginTickets = new Map();
  const sessions = new Map();
  const db = {
    loginTickets, sessions,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              if (sql.startsWith("SELECT github_user_id, github_login FROM login_tickets")) {
                const row = loginTickets.get(args[0]);
                return row && row.expires_at > args[1] ? row : null;
              }
              if (sql.startsWith("SELECT github_user_id, github_login, expires_at FROM owner_sessions")) {
                const row = sessions.get(args[0]);
                return row && row.expires_at > args[1] ? row : null;
              }
              throw new Error("unexpected mock SQL: " + sql);
            },
            async run() {
              if (sql.startsWith("DELETE FROM login_tickets")) {
                const row = loginTickets.get(args[0]);
                if (!row || row.expires_at <= args[1]) return { meta: { changes: 0 } };
                loginTickets.delete(args[0]);
                return { meta: { changes: 1 } };
              }
              if (sql.startsWith("INSERT INTO owner_sessions")) {
                sessions.set(args[0], {
                  github_user_id: args[1],
                  github_login: args[2],
                  expires_at: args[3],
                });
                return { meta: { changes: 1 } };
              }
              if (sql.startsWith("DELETE FROM owner_sessions")) {
                const existed = sessions.delete(args[0]);
                return { meta: { changes: existed ? 1 : 0 } };
              }
              throw new Error("unexpected mock SQL: " + sql);
            },
          };
        },
      };
    },
  };
  return db;
}

async function hashed(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

test("public health endpoint works without exposing environment config", async () => {
  const res = await worker.fetch(request("/health"), {});
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
  assert.equal(JSON.stringify(data).includes("secret"), false);
  assert.equal(res.headers.get("cache-control"), "no-store");
});

test("private endpoint rejects calls without valid credentials", async () => {
  const res = await worker.fetch(request("/private/status", {
    headers: { Origin: ORIGIN },
  }), mockEnvironment());
  assert.equal(res.status, 401);
});

test("cross-site origin cannot exchange a one-time login ticket", async () => {
  const res = await worker.fetch(request("/auth/exchange", {
    method: "POST",
    headers: { Origin: "https://example.net", "Content-Type": "application/json" },
    body: JSON.stringify({ ticket: "a".repeat(64) }),
  }), mockEnvironment());
  assert.equal(res.status, 403);
  assert.equal(res.headers.get("access-control-allow-origin"), null);
});

test("preflight only allows the exact AURMOVA frontend origin", async () => {
  const permitted = await worker.fetch(request("/auth/exchange", {
    method: "OPTIONS", headers: { Origin: ORIGIN },
  }), {});
  assert.equal(permitted.status, 204);
  assert.equal(permitted.headers.get("access-control-allow-origin"), ORIGIN);
  const blocked = await worker.fetch(request("/auth/exchange", {
    method: "OPTIONS", headers: { Origin: "https://untrusted.invalid" },
  }), {});
  assert.equal(blocked.status, 403);
});

test("misconfigured Worker denies auth instead of falling back to an open page", async () => {
  const res = await worker.fetch(request("/private/status", {
    headers: { Origin: ORIGIN },
  }), { GITHUB_CLIENT_ID: "x" });
  assert.equal(res.status, 503);
});

test("ticket is single-use; private status requires token; logout revokes session", async () => {
  const db = createDb();
  const env = mockEnvironment(db);
  const ticket = "a".repeat(64);
  db.loginTickets.set(await hashed(ticket), {
    github_user_id: "1234",
    github_login: "aurmova-owner",
    expires_at: Math.floor(Date.now() / 1000) + 90,
  });

  const exchange = () => worker.fetch(request("/auth/exchange", {
    method: "POST",
    headers: { Origin: ORIGIN, "Content-Type": "application/json" },
    body: JSON.stringify({ ticket }),
  }), env);

  const first = await exchange();
  assert.equal(first.status, 200);
  const payload = await first.json();
  assert.match(payload.accessToken, /^[0-9a-f]{64}$/);

  const replay = await exchange();
  assert.equal(replay.status, 401);

  const securedRequest = (path, method = "GET") => request(path, {
    method,
    headers: {
      Origin: ORIGIN,
      Authorization: "Bearer " + payload.accessToken,
      ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
    },
    ...(method === "POST" ? { body: "{}" } : {}),
  });
  const status = await worker.fetch(securedRequest("/private/status"), env);
  assert.equal(status.status, 200);
  const privateData = await status.json();
  assert.equal(privateData.authenticated, true);
  assert.equal(privateData.instagram, "not_connected");
  assert.equal(privateData.customerMigration, "not_started");

  const out = await worker.fetch(securedRequest("/auth/logout", "POST"), env);
  assert.equal(out.status, 200);
  const after = await worker.fetch(securedRequest("/private/status"), env);
  assert.equal(after.status, 401);
});


test("Worker-hosted owner login is served with strict CSP and no secrets", async () => {
  const html = await worker.fetch(request("/owner-login"), {});
  assert.equal(html.status, 200);
  assert.match(html.headers.get("content-type"), /^text\/html/);
  assert.match(html.headers.get("content-security-policy"), /script-src 'self'/);
  assert.match(html.headers.get("content-security-policy"), /connect-src 'self'/);
  assert.match(html.headers.get("x-frame-options"), /DENY/);
  const body = await html.text();
  assert.match(body, /私人安全登录/);
  assert.match(body, /\/owner-login.js/);
  assert.doesNotMatch(body, /GITHUB_CLIENT_SECRET/);

  const script = await worker.fetch(request("/owner-login.js"), {});
  assert.equal(script.status, 200);
  const source = await script.text();
  assert.match(source, /\/auth\/exchange/);
  assert.doesNotMatch(source, /localStorage|sessionStorage/);
  assert.doesNotMatch(source, /GITHUB_CLIENT_SECRET/);
  assert.doesNotThrow(() => new Function(source));

  const css = await worker.fetch(request("/owner-login.css"), {});
  assert.equal(css.status, 200);
  assert.match(css.headers.get("content-type"), /^text\/css/);
});

test("same-origin owner login can exchange ticket and read private status", async () => {
  const db = createDb();
  const env = mockEnvironment(db);
  const ticket = "b".repeat(64);
  db.loginTickets.set(await hashed(ticket), {
    github_user_id: "1234",
    github_login: "Aurmova",
    expires_at: Math.floor(Date.now() / 1000) + 80,
  });
  const exchange = await worker.fetch(request("/auth/exchange", {
    method: "POST",
    headers: { Origin: API, "Content-Type": "application/json" },
    body: JSON.stringify({ ticket }),
  }), env);
  assert.equal(exchange.status, 200);
  const payload = await exchange.json();

  // A same-origin browser GET commonly does not send an Origin header.
  const response = await worker.fetch(request("/private/status", {
    headers: { Authorization: "Bearer " + payload.accessToken },
  }), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).authenticated, true);

  const blocked = await worker.fetch(request("/private/status", {
    headers: { Origin: "https://untrusted.example", Authorization: "Bearer " + payload.accessToken },
  }), env);
  assert.equal(blocked.status, 403);

  const out = await worker.fetch(request("/auth/logout", {
    method: "POST",
    headers: { Origin: API, Authorization: "Bearer " + payload.accessToken },
    body: "{}",
  }), env);
  assert.equal(out.status, 200);
});
