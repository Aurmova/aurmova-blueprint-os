// Pilot owner login. Access tokens stay in JavaScript memory only:
// reloads / closing the page end the local sign-in session.
const apiInput = document.getElementById("api-url");
const message = document.getElementById("message");
const result = document.getElementById("result");
const loginButton = document.getElementById("login-button");
const checkButton = document.getElementById("check-button");
const logoutButton = document.getElementById("logout-button");
const API_STORAGE_KEY = "aurmova.pilotApiOrigin";
let activeToken = "";

function show(text, details = null) {
  message.textContent = text;
  if (details) {
    result.textContent = JSON.stringify(details, null, 2);
    result.hidden = false;
  } else {
    result.textContent = "";
    result.hidden = true;
  }
}

function getApiOrigin() {
  let url;
  try { url = new URL(apiInput.value.trim()); }
  catch { throw new Error("请输入部署后的 HTTPS Worker 地址。"); }
  // The pilot only permits *.workers.dev; enable a custom domain after a CSP review.
  if (url.protocol !== "https:" || !url.hostname.endsWith(".workers.dev") ||
      url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("请填写完整的 HTTPS workers.dev 根地址，不包含额外路径或参数。");
  }
  return url.origin;
}

async function apiFetch(path, options = {}) {
  const origin = getApiOrigin();
  return fetch(origin + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(activeToken ? { Authorization: "Bearer " + activeToken } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
}

apiInput.value = localStorage.getItem(API_STORAGE_KEY) || "";

loginButton.addEventListener("click", () => {
  try {
    const origin = getApiOrigin();
    localStorage.setItem(API_STORAGE_KEY, origin);
    window.location.assign(origin + "/auth/github/start");
  } catch (error) { show(error.message); }
});

checkButton.addEventListener("click", async () => {
  try {
    const response = await apiFetch("/private/status");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "安全连接失败");
    show("已通过 GitHub 身份验证。私人安全后端连接正常。", data);
  } catch (error) { show("无法完成身份验证：" + error.message); }
});

logoutButton.addEventListener("click", async () => {
  try { await apiFetch("/auth/logout", { method: "POST", body: "{}" }); }
  catch { /* Access token is destroyed locally even if the network is offline. */ }
  activeToken = "";
  checkButton.disabled = true;
  logoutButton.hidden = true;
  show("已退出本次安全会话。");
});

async function finishLogin() {
  const fragment = window.location.hash.slice(1);
  const params = new URLSearchParams(fragment);
  const ticket = params.get("auth-ticket");
  const error = params.get("auth-error");
  if (!ticket && !error) return;

  // Remove one-time credential before any asynchronous work, navigation or logging.
  history.replaceState(null, "", window.location.pathname + window.location.search);

  if (error) { show("GitHub 授权未完成：" + error); return; }
  if (!/^[0-9a-f]{64}$/.test(ticket)) { show("登录凭证格式无效。"); return; }

  try {
    const response = await apiFetch("/auth/exchange", {
      method: "POST",
      body: JSON.stringify({ ticket }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.accessToken) throw new Error(payload.error || "登录失败");
    activeToken = payload.accessToken;
    checkButton.disabled = false;
    logoutButton.hidden = false;
    show("已登录。你可以检查与私人云端后端的连接。", {
      githubLogin: payload.user?.githubLogin,
      expiresAt: new Date(payload.expiresAt * 1000).toLocaleString(),
      note: "会话仅保存在当前页面内存中，刷新页面后需要重新登录。",
    });
  } catch (error) { show("登录未完成：" + error.message); }
}

finishLogin();
