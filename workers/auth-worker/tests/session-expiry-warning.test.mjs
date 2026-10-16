import test from "node:test";
import assert from "node:assert/strict";
import { LOGIN_HTML, LOGIN_CSS, LOGIN_SCRIPT } from "../src/owner-login-page.js";

test("expired owner sessions receive a visible Chinese warning before another save", () => {
  assert.match(LOGIN_HTML, /id="session-warning"/);
  assert.match(LOGIN_HTML, /aria-live="polite"/);
  assert.match(LOGIN_SCRIPT, /payload\.expiresAt/);
  assert.match(LOGIN_SCRIPT, /sessionExpiresAtMs - Date\.now\(\)/);
  assert.match(LOGIN_SCRIPT, /minutes > 5/);
  assert.match(LOGIN_SCRIPT, /setInterval\(updateSessionNotice, 15000\)/);
  assert.match(LOGIN_SCRIPT, /markSessionExpired\(\)/);
  assert.match(LOGIN_SCRIPT, /response\.status === 401/);
  assert.match(LOGIN_SCRIPT, /本次操作未保存/);
  assert.match(LOGIN_SCRIPT, /请先复制尚未保存的文字/);
  assert.match(LOGIN_CSS, /\.session-warning:not\(\[hidden\]\)/);
  assert.doesNotMatch(LOGIN_SCRIPT, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotThrow(() => new Function(LOGIN_SCRIPT));
});

test("expired session remains a server enforced 401; UI must not erase the editing form on unauthorized response", () => {
  const segment = LOGIN_SCRIPT.slice(
    LOGIN_SCRIPT.indexOf("function markSessionExpired()"),
    LOGIN_SCRIPT.indexOf("function updateSessionNotice()")
  );
  assert.ok(segment.length > 100);
  assert.match(segment, /login\.hidden = false/);
  assert.doesNotMatch(segment, /resetCustomerEditor|resetPrivateCustomerState|setLoggedIn\(""/);
});
