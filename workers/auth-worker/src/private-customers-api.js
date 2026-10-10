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
const MAX_MEMBERS = 10;
const GROUP_TYPES = new Set(["关系蓝图解析", "亲子蓝图解析", "合作蓝图解析"]);
const STATUS_TYPES = new Set(["准备中", "咨询中", "已完成"]);
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
  const status = body.status === undefined ? "准备中" : cleanText(body.status, 20);
  if (!STATUS_TYPES.has(status)) throw new Error("档案状态无效");
  const profile = { name, gender, birthday, whatsapp, consultationTypes, consultationType: consultationTypes[0], status };
  const rawMembers = body.members === undefined ? [] : body.members;
  if (!Array.isArray(rawMembers) || rawMembers.length > MAX_MEMBERS) throw new Error("成员资料无效");
  if (rawMembers.length && !consultationTypes.some(t => GROUP_TYPES.has(t))) throw new Error("咨询项目不支持添加成员");
  profile.members = rawMembers.map(member => {
    if (!member || typeof member !== "object" || Array.isArray(member)) throw new Error("成员资料无效");
    const mName = cleanText(member.name, 100);
    const mGender = cleanText(member.gender, 30);
    const mBirthday = cleanText(member.birthday, 10);
    const mRole = cleanText(member.role, 40);
    if (!mName || !mGender || !validBirthday(mBirthday)) throw new Error("请填写每位成员的姓名、性别和有效生日");
    return { name: mName, gender: mGender, birthday: mBirthday, role: mRole };
  });
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
  const stagingHost = "aurmova-secure-api-staging.xbing5668.workers.dev";
  const configured = new URL(env.API_ORIGIN).hostname;
  const requested = new URL(request.url).hostname;
  if (configured !== stagingHost || requested !== stagingHost) {
    return send({ error: "Staging only" }, 403);
  }
  const ownerId = String(owner.github_user_id || "");
  if (!/^\d+$/.test(ownerId) || ownerId !== String(env.OWNER_GITHUB_USER_ID)) {
    return send({ error: "Authentication required" }, 401);
  }
  const route = /^\/private\/customers(?:\/([a-f0-9-]{36}|search)(?:\/(update))?)?$/.exec(path);
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
    if (request.method === "POST" && UUID.test(suffix) && route[2] === "update") {
      const body = await parseBody(request);
      const existing = await env.DB.prepare(
        "SELECT profile_json, updated_at FROM private_customers WHERE id = ? AND owner_github_id = ?"
      ).bind(suffix, ownerId).first();
      if (!existing) return send({ error: "Not found" }, 404);
      if (!body || typeof body !== "object" || Array.isArray(body) ||
          typeof body.updatedAt !== "string" || body.updatedAt !== existing.updated_at) {
        return send({ error: "档案已被修改或版本过期，请重新读取后再编辑" }, 409);
      }
      const previous = JSON.parse(existing.profile_json);
      const merged = { ...previous, ...body };
      if (body.consultationType && !Object.prototype.hasOwnProperty.call(body, "consultationTypes")) {
        merged.consultationTypes = [body.consultationType];
      }
      const normalized = normalizePrivateCustomer(merged);
      const updatedAt = new Date(Math.max(Date.now(), Date.parse(existing.updated_at) + 1)).toISOString();
      const updated = {
        ...previous, ...normalized, id: suffix, createdAt: previous.createdAt,
        updatedAt
      };
      const result = await env.DB.prepare(
        "UPDATE private_customers SET name = ?, birthday = ?, gender = ?, whatsapp = ?, consultation_type = ?, profile_json = ?, updated_at = ? WHERE id = ? AND owner_github_id = ? AND updated_at = ?"
      ).bind(updated.name, updated.birthday, updated.gender, updated.whatsapp,
        updated.consultationType, JSON.stringify(updated), updatedAt, suffix, ownerId, existing.updated_at).run();
      if (result.meta?.changes !== 1) {
        return send({ error: "档案已被修改，请重新读取后重试" }, 409);
      }
      return send({ customer: updated }, 200);
    }
    if (request.method === "GET" && UUID.test(suffix) && !route[2]) {
      const row = await env.DB.prepare(
        "SELECT profile_json FROM private_customers WHERE id = ? AND owner_github_id = ?"
      ).bind(suffix, ownerId).first();
      return row ? send({ customer: JSON.parse(row.profile_json) }, 200) : send({ error: "Not found" }, 404);
    }
    return send({ error: "Method not allowed" }, 405);
  } catch (error) {
    if (error instanceof Error && /^(档案格式无效|字段必须是文字|字段内容过长|请填写有效|请选择有效|咨询重点格式无效|成员资料无效|请填写每位成员|咨询项目不支持添加成员|档案状态无效|请求内容过长|JSON 格式无效)/.test(error.message)) {
      return send({ error: error.message }, 400);
    }
    // Avoid accidentally exposing PII, D1 SQL errors, or tokens.
    return send({ error: "Customer request failed" }, 500);
  }
}
