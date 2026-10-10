import { CUSTOMER_HTML, CUSTOMER_CSS, CUSTOMER_SCRIPT } from "./private-customers-page.js";
// Static pilot assets. Public HTML, CSS and JS contain NO OAuth credentials or customer data.
// Sensitive tokens are issued by the Worker and kept in browser memory only.
export const LOGIN_HTML = `<!doctype html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="no-referrer">
<title>AURMOVA｜私人安全登录测试</title>
<link rel="stylesheet" href="/owner-login.css">
<script src="/owner-login.js" defer></script>
</head>
<body>
<main class="card">
<div class="brand" aria-hidden="true">A</div>
<p class="eyebrow">AURMOVA · PRIVATE ACCESS PILOT</p>
<h1>私人安全登录</h1>
<p class="intro">这是独立的云端身份验证测试页面，不会修改你的 AURMOVA 正式网站。</p>
<div class="notice"><strong>测试阶段</strong><p>这里仅供测试 GitHub 身份验证与私人顾客档案管理功能。现有咨询工作台尚未迁移，请勿输入真实顾客资料。</p></div>
<div class="actions">
<button id="login" type="button">使用 GitHub 验证身份</button>
<button id="check" type="button" class="outline" disabled>检查私人连接</button>
<button id="logout" type="button" class="outline" hidden>退出安全会话</button>
</div>
<div class="status" role="status" aria-live="polite" id="message">等待 GitHub 身份验证。</div>
${CUSTOMER_HTML}
<pre id="result" hidden></pre>
<p class="footnote">身份验证只允许指定的 GitHub 账号。安全会话最长 30 分钟；刷新页面后需要重新登录。</p>
</main>
</body>
</html>`;

export const LOGIN_CSS = `
:root{color-scheme:light;font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#2c2a28;background:#f8f6f1}
*{box-sizing:border-box}body{margin:0;min-height:100dvh;padding:32px 16px;display:flex;align-items:center;justify-content:center;background:linear-gradient(155deg,#faf9f6,#f1ebe0)}
.card{width:100%;max-width:490px;padding:34px 28px 30px;border:1px solid #e3d9c7;background:white;border-radius:20px;box-shadow:0 14px 48px #5d4f3314}
.brand{width:48px;height:48px;display:grid;place-items:center;border:1px solid #b59d70;border-radius:50%;font-family:Georgia,serif;font-size:27px;color:#94754b}
.eyebrow{font-size:11px;letter-spacing:.18em;color:#92784d;font-weight:700;margin:20px 0 8px}
h1{font-size:29px;letter-spacing:.025em;margin:0 0 12px;font-weight:650}.intro{line-height:1.8;color:#6e6559;font-size:14px;margin:0 0 22px}
.notice{background:#fbf8f0;border-left:3px solid #b69c6d;padding:14px 16px;border-radius:6px;margin-bottom:22px;color:#635440}
.notice strong{font-size:13px}.notice p{margin:6px 0 0;line-height:1.7;font-size:13px}
.actions{display:grid;gap:10px}button{appearance:none;min-height:48px;width:100%;border:1px solid #8c7250;border-radius:9px;background:#8c7250;color:white;font-weight:650;font-size:15px;padding:12px;cursor:pointer}
button.outline{background:white;color:#634e33}button:disabled{opacity:.45;cursor:not-allowed}button:focus-visible{outline:3px solid #d4bb86;outline-offset:2px}
.status{background:#f4f4f2;border-radius:8px;margin-top:17px;padding:13px;font-size:14px;line-height:1.6;overflow-wrap:anywhere}
pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;background:#f7f5f0;padding:15px;border-radius:8px}
.footnote{font-size:12px;color:#82766a;line-height:1.7;margin:19px 0 0}
@media(max-width:440px){.card{padding:27px 21px}h1{font-size:26px}}
` + CUSTOMER_CSS;

export const LOGIN_SCRIPT = `
"use strict";
const message = document.getElementById("message");
const result = document.getElementById("result");
const login = document.getElementById("login");
const check = document.getElementById("check");
const logout = document.getElementById("logout");
let accessToken = "";

function show(text, details) {
  message.textContent = text;
  result.hidden = !details;
  result.textContent = details ? JSON.stringify(details, null, 2) : "";
}
function setLoggedIn(token) {
  accessToken = token;
  login.hidden = !!token;
  logout.hidden = !token;
  check.disabled = !token;
  document.getElementById("customer-panel").hidden = !token;
  if (token) {
    loadPrivateCustomerList();
  } else {
    resetPrivateCustomerState();
  }
}
async function api(path, options) {
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = "Bearer " + accessToken;
  return fetch(path, { ...options, headers, credentials: "omit", cache: "no-store" });
}

login.addEventListener("click", function () {
  window.location.assign("/auth/github/start");
});

check.addEventListener("click", async function () {
  if (!accessToken) return show("请先进行 GitHub 身份验证。");
  try {
    const response = await api("/private/status");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "验证失败");
    show("身份已验证，私人后端连接正常。", payload);
  } catch (error) {
    show("检查失败：" + error.message);
  }
});

logout.addEventListener("click", async function () {
  let remoteRevoked = false;
  try {
    const response = await api("/auth/logout", { method: "POST", body: "{}" });
    remoteRevoked = response.ok;
  } catch { /* Always discard the in-memory token. */ }
  setLoggedIn("");
  show(remoteRevoked ? "已退出，本次服务器会话已注销。" : "本机已退出。远端注销未确认；服务器会话最多在 30 分钟后失效。");
});

async function finishLogin() {
  const fragment = window.location.hash.slice(1);
  if (!fragment) return;
  const params = new URLSearchParams(fragment);
  const ticket = params.get("auth-ticket");
  const error = params.get("auth-error");
  // Remove one-use credentials from the address bar before making any network call.
  history.replaceState(null, "", window.location.pathname + window.location.search);
  if (error) return show("GitHub 授权未完成：" + error);
  if (!ticket) return;
  if (!/^[0-9a-f]{64}$/.test(ticket)) return show("登录票据格式无效。");

  try {
    const response = await api("/auth/exchange", {
      method: "POST",
      body: JSON.stringify({ ticket })
    });
    const payload = await response.json();
    if (!response.ok || !/^[0-9a-f]{64}$/.test(payload.accessToken || "")) {
      throw new Error(payload.error || "身份验证失败");
    }
    setLoggedIn(payload.accessToken);
    show("GitHub 身份验证成功。现在可以点击「检查私人连接」。", {
      githubLogin: payload.user && payload.user.githubLogin,
      expiresAt: new Date(payload.expiresAt * 1000).toLocaleString(),
      note: "登录令牌只存放在本页内存，刷新后即清除。"
    });
  } catch (error) {
    show("登录尚未完成：" + error.message);
  }
}
finishLogin();
` + CUSTOMER_SCRIPT;
