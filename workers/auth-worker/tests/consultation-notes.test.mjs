import test from "node:test";
import assert from "node:assert/strict";
import { buildPrivateBlueprintPreview } from "../src/private-blueprint-analysis.js";
import { handlePrivateConsultationNotes } from "../src/private-consultation-notes-api.js";
import { LOGIN_SCRIPT } from "../src/owner-login-page.js";
import worker from "../src/index.js";

const origin = "https://aurmova-secure-api-staging.xbing5668.workers.dev";
const id = "0135d490-e6c4-4239-b121-acce6d91cc44";
const owner = { github_user_id: "1234", github_login: "Aurmova" };
const project = "关系蓝图解析";
const profile = {
  id, name: "虚构顾客甲", gender: "女", birthday: "15/04/2001",
  consultationType: project, consultationTypes: [project],
  members: [{ name: "虚构成员乙", gender: "男", birthday: "10/09/1999", role: "伴侣" }]
};
const script = buildPrivateBlueprintPreview(profile, project).consultationScript;
assert.ok(script?.steps?.length);
const step = script.steps.find(s => Array.isArray(s.interaction?.options) && s.interaction.options.length) || script.steps[0];
const selected = step.interaction?.options?.[0] || Object.entries(script.responseOptions).map(([key,label])=>({key,label}))[0];

function makeDb() {
  const notes = [];
  let noTable = false;
  const db = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              if (!sql.startsWith("SELECT profile_json FROM private_customers")) throw Error("Unexpected lookup");
              return args[0] === id && args[1] === "1234" ? { profile_json: JSON.stringify(profile) } : null;
            },
            async run() {
              if (noTable) throw Error("D1_ERROR: no such table: private_consultation_notes");
              if (!sql.startsWith("INSERT INTO private_consultation_notes")) throw Error("Unexpected insert");
              const [noteId, owner_github_id, customer_id, project, step_id, selection_key,
                selection_label, answer_text, created_at] = args;
              notes.push({ id:noteId, owner_github_id, customer_id, project,
                step_id, selection_key, selection_label, answer_text, created_at });
              return { meta: { changes: 1 } };
            },
            async all() {
              if (noTable) throw Error("D1_ERROR: no such table: private_consultation_notes");
              if (!sql.startsWith("SELECT id, project, step_id")) throw Error("Unexpected list");
              return { results: notes.filter(n => n.owner_github_id === args[0] && n.customer_id === args[1] && n.project === args[2]).slice(0, args[3]) };
            }
          };
        }
      };
    }
  };
  return { db, notes, setNoTable: flag => { noTable = flag; } };
}
function request(path, payload = null, method = "POST") {
  return new Request(origin + path, {
    method, ...(method === "POST" ? { headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(payload ?? {}) } : {})
  });
}
function invoke(db, path, body, who = owner, configOrigin = origin) {
  return handlePrivateConsultationNotes(request(path, body),
    { DB: db, API_ORIGIN: configOrigin, OWNER_GITHUB_USER_ID: "1234" },
    who, path, (obj, status = 200) => ({ status, body: obj }));
}
const valid = { customerId:id, project, stepId: step.id,
  selectionKey: selected.key, answerText: "这是一条虚构顾客的模拟回应。" };

test("relationship consultation notes are explicitly saved and can be re-read", async () => {
  const { db, notes } = makeDb();
  const save = await invoke(db, "/private/consultation-notes", {...valid, selectionLabel:"伪造描述"});
  assert.equal(save.status, 201);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].selection_label, selected.label);
  assert.equal(notes[0].answer_text, valid.answerText);
  const list = await invoke(db, "/private/consultation-notes/list", {customerId:id,project});
  assert.equal(list.status, 200);
  assert.equal(list.body.notes.length, 1);
  assert.equal(list.body.notes[0].stepId, step.id);
  assert.equal(list.body.notes[0].answerText, valid.answerText);
  assert.equal(typeof list.body.notes[0].createdAt, "string");
});

test("cannot save invented responses or another owner's records", async () => {
  const { db, notes } = makeDb();
  assert.equal((await invoke(db, "/private/consultation-notes", {...valid, stepId:"invalid"})).status, 400);
  assert.equal((await invoke(db, "/private/consultation-notes", {...valid, selectionKey:"made-up"})).status, 400);
  assert.equal((await invoke(db, "/private/consultation-notes", {...valid, answerText:"x".repeat(2001)})).status, 400);
  assert.equal((await invoke(db, "/private/consultation-notes", {...valid, customerId:"11111111-1111-4111-8111-111111111111"})).status, 404);
  assert.equal((await invoke(db, "/private/consultation-notes", valid, {github_user_id:"9999"})).status, 401);
  assert.equal((await invoke(db, "/private/consultation-notes", valid, owner, "https://aurmova-secure-api.xbing5668.workers.dev")).status, 403);
  assert.equal((await invoke(db, "/private/consultation-notes", {...valid, project:"亲子蓝图解析"})).status, 400);
  assert.equal(notes.length, 0);
});

test("missing D1 migration surfaces safe setup error without claiming saved", async () => {
  const {db,setNoTable} = makeDb();
  setNoTable(true);
  const save = await invoke(db, "/private/consultation-notes", valid);
  assert.equal(save.status, 503);
  assert.match(save.body.error, /数据库迁移/);
  assert.doesNotMatch(save.body.error, /D1_ERROR|SELECT|INSERT/);
});

test("login UI has explicit save button, optional simulated answer, and readback", () => {
  assert.match(LOGIN_SCRIPT, /保存本段模拟回答到顾客档案/);
  assert.match(LOGIN_SCRIPT, /读取已保存记录/);
  assert.match(LOGIN_SCRIPT, /noteAnswer\.maxLength = 2000/);
  assert.match(LOGIN_SCRIPT, /不会自动保存/);
  assert.doesNotThrow(() => new Function(LOGIN_SCRIPT));
});

test("unauthenticated HTTP route cannot save customer notes", async () => {
  const { db } = makeDb();
  const response = await worker.fetch(request("/private/consultation-notes", valid), {
    DB: db, API_ORIGIN: origin, FRONTEND_LOGIN_URL: origin + "/owner-login",
    GITHUB_CLIENT_ID: "test", GITHUB_CLIENT_SECRET: "test", OWNER_GITHUB_USER_ID: "1234"
  });
  assert.equal(response.status, 401);
});


test("consultation history reload reports a visible success count and fresh timestamp", () => {
  assert.match(LOGIN_SCRIPT, /notesFeedback\.setAttribute\("role", "status"\)/);
  assert.match(LOGIN_SCRIPT, /读取成功：共/);
  assert.match(LOGIN_SCRIPT, /本次读取时间/);
  assert.match(LOGIN_SCRIPT, /读取失败：/);
});
