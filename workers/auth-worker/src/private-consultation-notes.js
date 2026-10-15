// AURMOVA V3 — STAGING ONLY, authenticated private consultant notes.
// Explicit "save" action required. The model does not infer/store an answer
// just because a suggestion button was clicked. No client-facing endpoints.
const STAGING_HOST = "aurmova-secure-api-staging.xbing5668.workers.dev";
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const STEP_IDS = new Set(["opening", "personality", "seat", "inner", "loop", "scenarios", "summary"]);
const MAX_JSON_BYTES = 5000;
const MAX_RESULTS = 40;
const rowView = row => ({
  id: row.id, customerId: row.customer_id, project: row.project,
  stepId: row.step_id, selectionKey: row.selection_key,
  selectionLabel: row.selection_label, answerText: row.answer_text,
  createdAt: row.created_at
});
function field(value, max, label) {
  if (typeof value !== "string" || value.length > max) throw new Error(label + "格式无效或内容过长");
  return value.trim();
}
async function readBody(request) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_JSON_BYTES) throw new Error("记录内容过长");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_JSON_BYTES) throw new Error("记录内容过长");
  try { return JSON.parse(raw); } catch { throw new Error("JSON 格式无效"); }
}
export async function handlePrivateConsultationNotes(request, env, owner, pathname, send) {
  let host, configured;
  try {
    host = new URL(request.url).hostname;
    configured = new URL(env.API_ORIGIN).hostname;
  } catch { return send({ error: "Staging only" }, 403); }
  if (host !== STAGING_HOST || configured !== STAGING_HOST) {
    return send({ error: "Staging only" }, 403);
  }
  const ownerId = String(owner?.github_user_id || "");
  if (!/^\d+$/.test(ownerId) || ownerId !== String(env.OWNER_GITHUB_USER_ID)) {
    return send({ error: "Authentication required" }, 401);
  }
  const match = /^\/private\/consultations\/([a-f0-9-]{36})$/.exec(pathname);
  if (!match || !UUID.test(match[1])) return send({ error: "Not found" }, 404);
  const customerId = match[1];
  if (request.method !== "GET" && request.method !== "POST") return send({ error: "Method not allowed" }, 405);
  try {
    // Verify customer belongs to the logged-in GitHub owner, both when
    // reading and when saving. Do not expose any other owner's notes.
    const customer = await env.DB.prepare(
      "SELECT id, profile_json FROM private_customers WHERE id = ? AND owner_github_id = ?"
    ).bind(customerId, ownerId).first();
    if (!customer) return send({ error: "Not found" }, 404);
    if (request.method === "GET") {
      const found = await env.DB.prepare(
        "SELECT id, customer_id, project, step_id, selection_key, selection_label, answer_text, created_at FROM private_consultation_notes WHERE owner_github_id = ? AND customer_id = ? ORDER BY created_at DESC, id DESC LIMIT ?"
      ).bind(ownerId, customerId, MAX_RESULTS).all();
      return send({ notes: (found.results || []).map(rowView), limit: MAX_RESULTS }, 200);
    }
    const body = await readBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("咨询记录格式无效");
    const project = field(body.project, 60, "咨询项目");
    const stepId = field(body.stepId, 32, "咨询步骤");
    const selectionKey = field(body.selectionKey ?? "", 40, "答案选项");
    const selectionLabel = field(body.selectionLabel ?? "", 80, "答案名称");
    const answerText = field(body.answerText ?? "", 2000, "顾客原话");
    if (project !== "关系蓝图解析" || !STEP_IDS.has(stepId)) throw new Error("请选择有效的关系咨询阶段");
    if (selectionKey && !/^[a-z0-9_-]{1,40}$/.test(selectionKey)) throw new Error("答案选项格式无效");
    if (Boolean(selectionKey) !== Boolean(selectionLabel)) throw new Error("答案选项与名称不一致");
    if (!selectionKey && !answerText) throw new Error("请至少选择一项回答或填写模拟顾客原话");
    const customerProfile = JSON.parse(customer.profile_json);
    if (!Array.isArray(customerProfile.members) || !customerProfile.members.length) {
      return send({ error: "此顾客档案尚未添加共同分析成员" }, 400);
    }
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO private_consultation_notes (id, owner_github_id, customer_id, project, step_id, selection_key, selection_label, answer_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, ownerId, customerId, project, stepId, selectionKey, selectionLabel, answerText, createdAt).run();
    return send({ note: { id, customerId, project, stepId, selectionKey, selectionLabel, answerText, createdAt } }, 201);
  } catch(error) {
    if (error instanceof Error && /^(咨询记录格式无效|记录内容过长|JSON 格式无效|请选择有效|咨询项目格式无效|咨询步骤格式无效|答案选项格式无效|答案名称格式无效|顾客原话格式无效|答案选项与名称不一致|请至少选择)/.test(error.message)) {
      return send({ error:error.message }, 400);
    }
    return send({ error: "Consultation note request failed" }, 500);
  }
}
