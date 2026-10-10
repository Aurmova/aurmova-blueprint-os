import test from "node:test";
import assert from "node:assert/strict";
import { normalizePrivateCustomer, handlePrivateCustomers } from "../src/private-customers-api.js";
import { LOGIN_HTML, LOGIN_CSS, LOGIN_SCRIPT } from "../src/owner-login-page.js";

const ORIGIN = "https://aurmova-secure-api-staging.xbing5668.workers.dev";
const owner = { github_user_id: "1234", github_login: "Aurmova" };
const base = { name: "测试顾客甲", birthday: "15/04/2001", gender: "女",
  whatsapp: "Test0001", consultationType: "人生蓝图解析" };
const member = { name: "测试伙伴乙", gender: "男", birthday: "01/01/1999", role: "伴侣" };
const sender = (body, status = 200) => ({ body, status });
function fakeDb() {
  const rows = new Map();
  const stats = { mutations: 0 };
  return {
    rows, stats,
    DB: { prepare(sql) { return {
      bind(...args) { return {
        async run() {
          if (sql.startsWith("INSERT INTO private_customers")) {
            const [id, owner_github_id, name, birthday, gender, whatsapp, consultation_type, profile_json, created_at, updated_at] = args;
            rows.set(id, { id, owner_github_id, name, birthday, gender, whatsapp, consultation_type, profile_json, created_at, updated_at });
            stats.mutations++;
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("UPDATE private_customers")) {
            const [name, birthday, gender, whatsapp, consultation_type, profile_json, updated_at, id, owner_github_id, previousUpdatedAt] = args;
            const old = rows.get(id);
            if (!old || old.owner_github_id !== owner_github_id || old.updated_at !== previousUpdatedAt) {
              return { meta: { changes: 0 } };
            }
            rows.set(id, { ...old, name, birthday, gender, whatsapp, consultation_type, profile_json, updated_at });
            stats.mutations++;
            return { meta: { changes: 1 } };
          }
          throw Error("Unexpected run " + sql);
        },
        async first() {
          if (sql.startsWith("SELECT profile_json, updated_at")) {
            const row = rows.get(args[0]);
            return row && row.owner_github_id === args[1] ? { profile_json: row.profile_json, updated_at: row.updated_at } : null;
          }
          if (sql.startsWith("SELECT profile_json")) {
            const row = rows.get(args[0]);
            return row && row.owner_github_id === args[1] ? { profile_json: row.profile_json } : null;
          }
          throw Error("Unexpected first " + sql);
        },
        async all() {
          let list = [...rows.values()].filter(row => row.owner_github_id === args[0]);
          if (sql.includes(" LIKE ")) {
            const query = args[1].slice(1, -1).toLowerCase();
            list = list.filter(row => row.name.toLowerCase().includes(query) || row.whatsapp.toLowerCase().includes(query));
          }
          return { results: list };
        }
      }; }
    }; } }
  };
}
function call(db, path, method = "GET", payload = null, ownerSession = owner, extra = {}) {
  const req = new Request(ORIGIN + path, {
    method, ...(method === "POST" ? {
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      body: JSON.stringify(payload || {})
    } : {})
  });
  return handlePrivateCustomers(req, {
    API_ORIGIN: ORIGIN, DB: db.DB, OWNER_GITHUB_USER_ID: "1234", ...extra
  }, ownerSession, path, sender);
}

test("white-gold customer management shell is present and browser scripts parse", () => {
  assert.match(LOGIN_HTML, /私人顾客档案管理/);
  assert.match(LOGIN_HTML, /id="private-detail-body"/);
  assert.match(LOGIN_HTML, /id="private-cancel"/);
  assert.match(LOGIN_HTML, /id="member-list"/);
  assert.match(LOGIN_HTML, /我确认本次填写的全部人物资料均为/);
  assert.match(LOGIN_CSS, /customer-hero/);
  assert.match(LOGIN_SCRIPT, /resetPrivateCustomerState\(\)/);
  assert.match(LOGIN_SCRIPT, /textContent =/);
  assert.doesNotMatch(LOGIN_HTML, /<pre id="private-customer-detail"/);
  assert.doesNotThrow(() => new Function(LOGIN_SCRIPT));
});

test("relationship members must include gender, name and valid birthday", () => {
  const payload = { ...base, consultationType: "关系蓝图解析", members: [member] };
  assert.deepEqual(normalizePrivateCustomer(payload).members, [member]);
  assert.throws(() => normalizePrivateCustomer({
    ...payload, members: [{ ...member, gender: "" }]
  }), /请填写每位成员/);
  assert.throws(() => normalizePrivateCustomer({
    ...payload, members: [{ ...member, birthday: "31/02/2001" }]
  }), /请填写每位成员/);
  assert.throws(() => normalizePrivateCustomer({
    ...payload, members: new Array(11).fill(member)
  }), /成员资料无效/);
  assert.throws(() => normalizePrivateCustomer({
    ...base, members: [member]
  }), /咨询项目不支持添加成员/);
});

test("profile updates preserve ID and createdAt, change searchable fields, block stale edits", async () => {
  const db = fakeDb();
  const create = await call(db, "/private/customers", "POST", base);
  assert.equal(create.status, 201);
  const original = create.body.customer;
  const id = original.id;
  const update = await call(db, "/private/customers/" + id + "/update", "POST", {
    updatedAt: original.updatedAt, name: "测试顾客甲（修改）",
    gender: "女", birthday: "15/04/2001", consultationType: "关系蓝图解析",
    whatsapp: "Test0099", status: "咨询中",
    consultationTheme: "模拟相处方式",
    members: [member]
  });
  assert.equal(update.status, 200);
  assert.equal(db.rows.size, 1);
  assert.equal(db.stats.mutations, 2);
  assert.equal(update.body.customer.id, id);
  assert.equal(update.body.customer.createdAt, original.createdAt);
  assert.notEqual(update.body.customer.updatedAt, original.updatedAt);
  assert.equal(update.body.customer.status, "咨询中");
  assert.deepEqual(update.body.customer.consultationTypes, ["关系蓝图解析"]);
  assert.deepEqual(update.body.customer.members, [member]);

  const detail = await call(db, "/private/customers/" + id);
  assert.equal(detail.body.customer.whatsapp, "Test0099");
  assert.equal(detail.body.customer.consultationTheme, "模拟相处方式");
  const oldSearch = await call(db, "/private/customers/search", "POST", { query: "Test0001" });
  assert.equal(oldSearch.body.customers.length, 0);
  const newSearch = await call(db, "/private/customers/search", "POST", { query: "Test0099" });
  assert.equal(newSearch.body.customers.length, 1);

  const stale = await call(db, "/private/customers/" + id + "/update", "POST", {
    updatedAt: original.updatedAt, ...base, name: "不应覆盖"
  });
  assert.equal(stale.status, 409);
  assert.equal(db.stats.mutations, 2);
  assert.equal(db.rows.get(id).name, "测试顾客甲（修改）");
});

test("unauthorized and cross-owner requests cannot edit a customer", async () => {
  const db = fakeDb();
  const created = await call(db, "/private/customers", "POST", base);
  const id = created.body.customer.id;
  const payload = { ...base, updatedAt: created.body.customer.updatedAt, name: "未经授权" };
  assert.equal((await call(db, "/private/customers/" + id + "/update", "POST", payload,
    { github_user_id: "9999" })).status, 401);
  assert.equal((await call(db, "/private/customers/" + id + "/update", "POST", payload, owner, {
    API_ORIGIN: "https://aurmova-secure-api.xbing5668.workers.dev"
  })).status, 403);
  assert.equal((await call(db, "/private/customers/00000000-0000-4000-8000-000000000000/update", "POST", payload)).status, 404);
  assert.equal(db.stats.mutations, 1);
});

test("invalid profile update never erases a previously saved customer", async () => {
  const db = fakeDb();
  const original = (await call(db, "/private/customers", "POST", base)).body.customer;
  const invalid = await call(db, "/private/customers/" + original.id + "/update", "POST", {
    ...base, updatedAt: original.updatedAt, birthday: "31/02/2001"
  });
  assert.equal(invalid.status, 400);
  assert.equal(db.rows.size, 1);
  assert.equal(db.stats.mutations, 1);
  const read = await call(db, "/private/customers/" + original.id);
  assert.equal(read.body.customer.birthday, "15/04/2001");
});
