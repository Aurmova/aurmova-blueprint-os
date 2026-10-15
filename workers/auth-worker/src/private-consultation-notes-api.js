// Staging-only journal for explicitly saved simulated customer consultation responses.
// Owner authentication happens in index.js before calling this handler.
import { buildPrivateBlueprintPreview } from "./private-blueprint-analysis.js";

const STAGING_HOST = "aurmova-secure-api-staging.xbing5668.workers.dev";
const PROJECT = "关系蓝图解析";
const CUSTOMER_ID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const MAX_REQUEST_BYTES = 5000;
const MAX_NOTES = 50;
const timestamp = () => new Date().toISOString();

async function payloadOf(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_REQUEST_BYTES) throw new Error("bad_request");
  const data = await request.text();
  if (new TextEncoder().encode(data).byteLength > MAX_REQUEST_BYTES) throw new Error("bad_request");
  try {
    const body = JSON.parse(data);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw Error();
    return body;
  } catch { throw new Error("bad_request"); }
}
function validText(s, limit, required = false) {
  return typeof s === "string" && s.length <= limit && (!required || !!s.trim());
}

export async function handlePrivateConsultationNotes(request, env, owner, path, send) {
  try {
    if (new URL(env.API_ORIGIN).hostname !== STAGING_HOST ||
        new URL(request.url).hostname !== STAGING_HOST) return send({ error: "Staging only" }, 403);
    const ownerId = String(owner?.github_user_id || "");
    if (!/^\d+$/.test(ownerId) || ownerId !== String(env.OWNER_GITHUB_USER_ID)) {
      return send({ error: "Authentication required" }, 401);
    }
    if (request.method !== "POST" ||
      !["/private/consultation-notes", "/private/consultation-notes/list"].includes(path)) {
      return send({ error: "Method not allowed" }, 405);
    }
    const body = await payloadOf(request);
    if (!CUSTOMER_ID.test(body.customerId) || body.project !== PROJECT) {
      return send({ error: "请选择有效的关系蓝图测试顾客" }, 400);
    }
    // Verify the customer belongs to the authenticated owner even when only reading notes.
    const existing = await env.DB.prepare(
      "SELECT profile_json FROM private_customers WHERE id = ? AND owner_github_id = ?"
    ).bind(body.customerId, ownerId).first();
    if (!existing) return send({ error: "Customer not found" }, 404);

    if (path.endsWith("/list")) {
      const result = await env.DB.prepare(
        "SELECT id, project, step_id, selection_key, selection_label, answer_text, created_at FROM private_consultation_notes WHERE owner_github_id = ? AND customer_id = ? AND project = ? ORDER BY created_at DESC LIMIT ?"
      ).bind(ownerId, body.customerId, PROJECT, MAX_NOTES).all();
      const notes = (result.results || []).map(row => ({
        id: row.id, project: row.project, stepId: row.step_id,
        selectionKey: row.selection_key, selectionLabel: row.selection_label,
        answerText: row.answer_text, createdAt: row.created_at
      }));
      return send({ notes, limit: MAX_NOTES }, 200);
    }

    if (!validText(body.stepId, 80, true) || !validText(body.selectionKey, 80, true) ||
        !validText(body.answerText ?? "", 2000)) return send({ error: "请选择有效的回答或填写简短记录" }, 400);
    // Re-evaluate the consultation script server-side. A browser cannot forge a step or option label.
    const profile = JSON.parse(existing.profile_json);
    const preview = buildPrivateBlueprintPreview(profile, PROJECT);
    const script = preview.consultationScript;
    const step = script?.steps?.find(s => s.id === body.stepId);
    if (!step) return send({ error: "咨询步骤无效" }, 400);
    const options = step.interaction?.options || Object.entries(script.responseOptions || {})
      .filter(([key]) => ["fits", "differs", "unsure"].includes(key))
      .map(([key, label]) => ({ key, label }));
    const chosen = options.find(o => o.key === body.selectionKey);
    if (!chosen) return send({ error: "请选择本步骤提供的回答" }, 400);

    const record = {
      id: crypto.randomUUID(), customerId: body.customerId, project: PROJECT,
      stepId: step.id, selectionKey: chosen.key,
      selectionLabel: chosen.label, answerText: (body.answerText || "").trim(),
      createdAt: timestamp()
    };
    await env.DB.prepare(
      "INSERT INTO private_consultation_notes (id, owner_github_id, customer_id, project, step_id, selection_key, selection_label, answer_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(record.id, ownerId, record.customerId, record.project, record.stepId,
      record.selectionKey, record.selectionLabel, record.answerText, record.createdAt).run();
    return send({ note: record }, 201);
  } catch (error) {
    if (error?.message === "bad_request") return send({ error: "请求内容格式无效或过长" }, 400);
    // Missing migration must be visible as a setup issue, without returning D1 SQL or customer PII.
    if (/no such table:\s*private_consultation_notes/i.test(String(error?.message || ""))) {
      return send({ error: "测试数据库尚未建立咨询记录表，请先完成 Staging 数据库迁移。" }, 503);
    }
    return send({ error: "咨询记录暂时无法访问" }, 500);
  }
}
