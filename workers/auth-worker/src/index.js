// AURMOVA secure pilot API.
// This Worker is NOT part of the public GitHub Pages static bundle.
// Only this server can validate GitHub identity and issue private API tokens.
// Tokens, OAuth client secrets, and database connection information never enter GitHub Pages.

const FRONTEND_ORIGIN = "https://aurmova.github.io";
const LOGIN_PATH = "/aurmova-blueprint-os/secure-login.html";
const STATE_TTL_SECONDS = 10 * 60;
const TICKET_TTL_SECONDS = 2 * 60;
const SESSION_TTL_SECONDS = 30 * 60;

function now() {
  return Math.floor(Date.now() / 1000);
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

async function tokenHash(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

function json(payload, status = 200, origin = "") {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Vary": "Origin",
  });
  if (origin === FRONTEND_ORIGIN) {
    headers.set("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  }
  return new Response(JSON.stringify(payload), { status, headers });
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function validConfig(env) {
  try {
    const api = new URL(env.API_ORIGIN);
    const login = new URL(env.FRONTEND_LOGIN_URL);
    return api.protocol === "https:" &&
      api.pathname === "/" &&
      login.origin === FRONTEND_ORIGIN &&
      login.pathname === LOGIN_PATH &&
      !!env.DB &&
      !!env.GITHUB_CLIENT_ID &&
      !!env.GITHUB_CLIENT_SECRET &&
      /^[0-9]+$/.test(String(env.OWNER_GITHUB_USER_ID || ""));
  } catch {
    return false;
  }
}

function loginRedirect(env, errorCode) {
  return redirect(env.FRONTEND_LOGIN_URL + "#auth-error=" + encodeURIComponent(errorCode));
}

async function startGithubLogin(env) {
  // Each random OAuth state is stored hashed and has a short expiry.
  const state = randomToken();
  await env.DB.prepare(
    "INSERT INTO auth_states (state_hash, expires_at) VALUES (?, ?)"
  ).bind(await tokenHash(state), now() + STATE_TTL_SECONDS).run();

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.API_ORIGIN + "/auth/github/callback");
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "read:user");
  return redirect(url.toString());
}

async function callbackGithub(request, env) {
  const input = new URL(request.url).searchParams;
  const code = input.get("code") || "";
  const state = input.get("state") || "";
  if (!/^[a-zA-Z0-9_-]{10,255}$/.test(code) ||
      !/^[0-9a-f]{64}$/.test(state)) {
    return loginRedirect(env, "invalid_request");
  }

  // Atomic consume: prevents re-use of the same OAuth state.
  const deletion = await env.DB.prepare(
    "DELETE FROM auth_states WHERE state_hash = ? AND expires_at > ?"
  ).bind(await tokenHash(state), now()).run();
  if (deletion.meta?.changes !== 1) {
    return loginRedirect(env, "expired_or_reused_login");
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.API_ORIGIN + "/auth/github/callback",
    }),
  });
  if (!tokenResponse.ok) return loginRedirect(env, "github_not_available");
  const tokenJson = await tokenResponse.json();
  if (!tokenJson.access_token) return loginRedirect(env, "github_login_failed");

  const profileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: "Bearer " + tokenJson.access_token,
      Accept: "application/vnd.github+json",
      "User-Agent": "AURMOVA-Secure-Owner-Auth",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!profileResponse.ok) return loginRedirect(env, "identity_check_failed");
  const profile = await profileResponse.json();
  if (String(profile.id) !== String(env.OWNER_GITHUB_USER_ID)) {
    return loginRedirect(env, "not_authorized");
  }

  // One-use ticket returned in the fragment, not the URL query or a cookie.
  const ticket = randomToken();
  await env.DB.prepare(
    "INSERT INTO login_tickets (ticket_hash, github_user_id, github_login, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(await tokenHash(ticket), String(profile.id), String(profile.login || "owner"), now() + TICKET_TTL_SECONDS).run();
  return redirect(env.FRONTEND_LOGIN_URL + "#auth-ticket=" + ticket);
}

async function exchangeTicket(request, env, origin) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, origin); }
  const ticket = body && typeof body.ticket === "string" ? body.ticket : "";
  if (!/^[0-9a-f]{64}$/.test(ticket)) return json({ error: "Invalid ticket" }, 400, origin);

  const digest = await tokenHash(ticket);
  const row = await env.DB.prepare(
    "SELECT github_user_id, github_login FROM login_tickets WHERE ticket_hash = ? AND expires_at > ?"
  ).bind(digest, now()).first();

  const deletion = await env.DB.prepare(
    "DELETE FROM login_tickets WHERE ticket_hash = ? AND expires_at > ?"
  ).bind(digest, now()).run();
  if (!row || deletion.meta?.changes !== 1) {
    return json({ error: "Expired or already used ticket" }, 401, origin);
  }

  // Server-issued bearer token is hashed at rest and kept in memory by the pilot UI.
  const accessToken = randomToken();
  const expiresAt = now() + SESSION_TTL_SECONDS;
  await env.DB.prepare(
    "INSERT INTO owner_sessions (token_hash, github_user_id, github_login, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(await tokenHash(accessToken), row.github_user_id, row.github_login, expiresAt, now()).run();

  return json({
    accessToken,
    expiresAt,
    user: { githubLogin: row.github_login },
  }, 200, origin);
}

async function authenticatedSession(request, env) {
  const match = /^Bearer ([0-9a-f]{64})$/.exec(request.headers.get("Authorization") || "");
  if (!match) return null;
  const hashed = await tokenHash(match[1]);
  const session = await env.DB.prepare(
    "SELECT github_user_id, github_login, expires_at FROM owner_sessions WHERE token_hash = ? AND expires_at > ?"
  ).bind(hashed, now()).first();
  if (!session || String(session.github_user_id) !== String(env.OWNER_GITHUB_USER_ID)) return null;
  return { session, hashed };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      if (origin !== FRONTEND_ORIGIN) return json({ error: "Forbidden origin" }, 403);
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
          "Access-Control-Max-Age": "600",
          Vary: "Origin",
        },
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "aurmova-secure-api", stage: "auth-pilot" }, 200, origin);
    }

    if (!validConfig(env)) return json({ error: "Service is not configured" }, 503, origin);

    try {
      if (request.method === "GET" && url.pathname === "/auth/github/start") {
        return await startGithubLogin(env);
      }
      if (request.method === "GET" && url.pathname === "/auth/github/callback") {
        return await callbackGithub(request, env);
      }

      // All non-navigation private operations require our exact GitHub Pages origin.
      if (origin !== FRONTEND_ORIGIN) return json({ error: "Forbidden origin" }, 403);

      if (request.method === "POST" && url.pathname === "/auth/exchange") {
        return await exchangeTicket(request, env, origin);
      }

      if (url.pathname === "/private/status" || url.pathname === "/auth/logout") {
        const session = await authenticatedSession(request, env);
        if (!session) return json({ error: "Authentication required" }, 401, origin);

        if (request.method === "GET" && url.pathname === "/private/status") {
          return json({
            authenticated: true,
            githubLogin: session.session.github_login,
            privateDatabase: "connected",
            instagram: "not_connected",
            tngPaymentLink: "pending_provider_approval",
            customerMigration: "not_started",
          }, 200, origin);
        }
        if (request.method === "POST" && url.pathname === "/auth/logout") {
          await env.DB.prepare("DELETE FROM owner_sessions WHERE token_hash = ?")
            .bind(session.hashed).run();
          return json({ signedOut: true }, 200, origin);
        }
      }

      return json({ error: "Not found" }, 404, origin);
    } catch {
      // Never return OAuth credentials, bearer tokens, or raw database failures.
      return json({ error: "Request failed" }, 500, origin);
    }
  },
};
