// AURMOVA STAGING ONLY: authenticated private customer records.
// No public/customer-facing route, production database access, or automatic data migration.
const TYPES = new Set([
  "人生蓝图解析", "黄金流年蓝图解析", "关系蓝图解析",
  "亲子蓝图解析", "合作蓝图解析", "儿童蓝图解析"
]);
const FIELDS = [
  "officialName", "formerName", "nameChangedYear", "birthCity",
  "occupation", "consultationTheme", "customerQuestion", "consultationFocus"
];
const MAX_JSON_BYTES = 16000;
const MAX_RESULTS = 30;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

function cleanText(value, maxLength) {
  if (value == null) return "";
  if (typeof value !== "string") throw new Error("字段必须是文字");
  const text = value.trim();
  if (text.length > maxLength) throw new Error("字段内容过长");
  return text;
}
function validBirthday(value) {
  if (typeof value !== "string") return false;
  const match = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/.exec(value);
  if (!match) return false;
  const d = Number(match[1]), m = Number(match[2]), y = Number(match[3]);
  if (y < 1900 || y > new Date().getUTCFullYear()) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d && date.getTime() <= Date.now();
}

export function normalizePrivateCustomer(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("档案格式无效");
  const name = cleanText(body.name, 100);
  const gender = cleanText(body.gender, 30);
  const birthday = cleanText(body.birthday, 10);
  const whatsapp = cleanText(body.whatsapp, 35);
  if (!name || !gender || !validBirthday(birthday)) throw new Error("请填写有效的姓名、性别及生日");
  const rawTypes = Array.isArray(body.consultationTypes) ? body.consultationTypes : [body.consultationType];
  if (!rawTypes.length || rawTypes.length > 6 || rawTypes.some(t => typeof t !== "string" || !TYPES.has(t))) {
    throw new Error("请选择有效的咨询项目");
  }
  const consultationTypes = [...new Set(rawTypes)];
  const profile = { name, gender, birthday, whatsapp, consultationTypes, consultationType: consultationTypes[0], status: "准备中" };
  for (const field of FIELDS) {
    if (field === "consultationFocus") {
      if (body[field] !== undefined && (!Array.isArray(body[field]) || body[field].length > 10 ||
        body[field].some(v => typeof v !== "string" || v.length > 80))) throw new Error("咨询重点格式无效");
      profile[field] = Array.isArray(body[field]) ? body[field].map(x => x.trim()) : [];
    } else {
      profile[field] = cleanText(body[field], field === "customerQuestion" ? 1800 : 240);
    }
  }
  return profile;
}

async function parseBody(request) {
  if (Number(request.headers.get("content-length") || 0) > MAX_JSON_BYTES) throw new Error("请求内容过长");
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_JSON_BYTES) throw new Error("请求内容过长");
  try { return JSON.parse(text); } catch { throw new Error("JSON 格式无效"); }
}
const viewRow = row => ({
  id: row.id, name: row.name, gender: row.gender, birthday: row.birthday,
  whatsapp: row.whatsapp, consultationType: row.consultation_type,
  createdAt: row.created_at, updatedAt: row.updated_at
});
function escapeLike(value) {
  return value.replace(/[\\%_]/g, x => "\\" + x);
}

export async function handlePrivateCustomers(request, env, owner, path, send) {
  // Fail closed, even if this module is accidentally included in a production Worker.
  const configured = new URL(env.API_ORIGIN).hostname;
  if (configured !== "aurmova-secure-api-staging.xbing5668.workers.dev") {
    return send({ error: "Staging only" }, 403);
  }
  const ownerId = String(owner.github_user_id || "");
  if (!/^\d+$/.test(ownerId) || ownerId !== String(env.OWNER_GITHUB_USER_ID)) {
    return send({ error: "Authentication required" }, 401);
  }
  const route = /^\/private\/customers(?:\/([a-f0-9-]{36}|search))?$/.exec(path);
  if (!route) return send({ error: "Not found" }, 404);
  const suffix = route[1] || "";
  try {
    if (request.method === "POST" && !suffix) {
      const payload = normalizePrivateCustomer(await parseBody(request));
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const row = { id, ...payload, createdAt, updatedAt: createdAt };
      await env.DB.prepare(
        "INSERT INTO private_customers (id, owner_github_id, name, birthday, gender, whatsapp, consultation_type, profile_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(id, ownerId, row.name, row.birthday, row.gender, row.whatsapp,
        row.consultationType, JSON.stringify(row), createdAt, createdAt).run();
      return send({ customer: row }, 201);
    }
    if (request.method === "GET" && !suffix) {
      const data = await env.DB.prepare(
        "SELECT id, name, gender, birthday, whatsapp, consultation_type, created_at, updated_at FROM private_customers WHERE owner_github_id = ? ORDER BY created_at DESC LIMIT ?"
      ).bind(ownerId, MAX_RESULTS).all();
      return send({ customers: (data.results || []).map(viewRow), limit: MAX_RESULTS }, 200);
    }
    // Search uses POST so customer names and phone numbers do not appear in URLs/logs.
    if (request.method === "POST" && suffix === "search") {
      const body = await parseBody(request);
      const query = cleanText(body?.query, 100);
      if (!query) return send({ customers: [], limit: MAX_RESULTS }, 200);
      const search = "%" + escapeLike(query) + "%";
      const data = await env.DB.prepare(
        "SELECT id, name, gender, birthday, whatsapp, consultation_type, created_at, updated_at FROM private_customers WHERE owner_github_id = ? AND (name LIKE ? ESCAPE '\\' OR whatsapp LIKE ? ESCAPE '\\') ORDER BY created_at DESC LIMIT ?"
      ).bind(ownerId, search, search, MAX_RESULTS).all();
      return send({ customers: (data.results || []).map(viewRow), limit: MAX_RESULTS }, 200);
    }
    if (request.method === "GET" && UUID.test(suffix)) {
      const row = await env.DB.prepare(
        "SELECT profile_json FROM private_customers WHERE id = ? AND owner_github_id = ?"
      ).bind(suffix, ownerId).first();
      return row ? send({ customer: JSON.parse(row.profile_json) }, 200) : send({ error: "Not found" }, 404);
    }
    return send({ error: "Method not allowed" }, 405);
  } catch (error) {
    if (error instanceof Error && /^(档案格式无效|字段必须是文字|字段内容过长|请填写有效|请选择有效|咨询重点格式无效|请求内容过长|JSON 格式无效)/.test(error.message)) {
      return send({ error: error.message }, 400);
    }
    // Avoid accidentally exposing PII, D1 SQL errors, or tokens.
    return send({ error: "Customer request failed" }, 500);
  }
}
