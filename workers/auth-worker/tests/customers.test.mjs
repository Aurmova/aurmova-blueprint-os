import test from "node:test";
import assert from "node:assert/strict";
import { normalizePrivateCustomer, handlePrivateCustomers } from "../src/private-customers-api.js";
import worker from "../src/index.js";

const STAGING = "https://aurmova-secure-api-staging.xbing5668.workers.dev";
function fakeDb() {
  const records = new Map();
  const db = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() {
              if (sql.startsWith("INSERT INTO private_customers")) {
                const [id, ownerId, name, birthday, gender, whatsapp, type, profile, created, updated] = args;
                records.set(id, { id, owner_github_id: ownerId, name, birthday, gender, whatsapp, consultation_type: type, profile_json: profile, created_at: created, updated_at: updated });
                return { meta: { changes: 1 } };
              }
              throw new Error("Unexpected SQL run");
            },
            async all() {
              if (!sql.includes("FROM private_customers")) throw new Error("Unexpected SQL all");
              let rows = [...records.values()].filter(r => r.owner_github_id === args[0]);
              if (sql.includes("LIKE")) {
                const term = args[1].slice(1, -1).replace(/\\([%_\\])/g, "$1").toLowerCase();
                rows = rows.filter(r => r.name.toLowerCase().includes(term) || r.whatsapp.toLowerCase().includes(term));
              }
              rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
              return { results: rows.slice(0, args.at(-1)) };
            },
            async first() {
              const row = records.get(args[0]);
              return row && row.owner_github_id === args[1] ? { profile_json: row.profile_json } : null;
            }
          };
        }
      };
    }
  };
  return { db, records };
}
const send = (value, status = 200) => ({ status, body: value });
const valid = {
  name: "测试顾客甲", gender: "女", birthday: "21/11/1995",
  whatsapp: "000-TEST-001", consultationType: "人生蓝图解析",
  customerQuestion: "这是一条虚构咨询问题"
};
const envFor = db => ({
  API_ORIGIN: STAGING,
  OWNER_GITHUB_USER_ID: "1234",
  DB: db
});
const owner = { github_user_id: "1234", github_login: "Aurmova" };
function req(path, method = "GET", body) {
  return new Request(STAGING + path, {
    method,
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {})
  });
}
function call(db, path, method = "GET", body, customEnv = {}) {
  return handlePrivateCustomers(req(path, method, body), { ...envFor(db), ...customEnv }, owner, path, send);
}

test("private customer model keeps day/month/year and rejects invalid calendar dates", () => {
  const profile = normalizePrivateCustomer(valid);
  assert.equal(profile.birthday, "21/11/1995");
  assert.equal(profile.consultationTypes[0], "人生蓝图解析");
  assert.equal(profile.customerQuestion, "这是一条虚构咨询问题");
  assert.throws(() => normalizePrivateCustomer({ ...valid, birthday: "31/02/2001" }));
  assert.throws(() => normalizePrivateCustomer({ ...valid, consultationType: "未知项目" }));
  assert.throws(() => normalizePrivateCustomer({ ...valid, name: " " }));
  assert.throws(() => normalizePrivateCustomer({ ...valid, birthday: "2020-11-21" }));
  assert.throws(() => normalizePrivateCustomer({ ...valid, whatsapp: "1".repeat(200) }));
});

test("staging customer workflow: create, list, search, private detail", async () => {
  const { db, records } = fakeDb();
  const saved = await call(db, "/private/customers", "POST", valid);
  assert.equal(saved.status, 201);
  const id = saved.body.customer.id;
  assert.equal(records.size, 1);
  assert.equal(saved.body.customer.birthday, "21/11/1995");
  assert.equal(saved.body.customer.createdAt, saved.body.customer.updatedAt);

  const list = await call(db, "/private/customers");
  assert.equal(list.status, 200);
  assert.equal(list.body.customers.length, 1);
  assert.equal(list.body.customers[0].whatsapp, "000-TEST-001");
  assert.equal(list.body.customers[0].customerQuestion, undefined);

  const search = await call(db, "/private/customers/search", "POST", { query: "顾客甲" });
  assert.equal(search.status, 200);
  assert.equal(search.body.customers.length, 1);
  const notFound = await call(db, "/private/customers/search", "POST", { query: "不存在" });
  assert.equal(notFound.body.customers.length, 0);

  const detail = await call(db, "/private/customers/" + id);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.customer.customerQuestion, "这是一条虚构咨询问题");
  assert.equal((await call(db, "/private/customers/00000000-0000-4000-8000-000000000000")).status, 404);
});

test("customer APIs fail closed outside staging and for unauthorized owners", async () => {
  const { db } = fakeDb();
  assert.equal((await call(db, "/private/customers", "POST", valid, {
    API_ORIGIN: "https://aurmova-secure-api.xbing5668.workers.dev"
  })).status, 403);
  const unauthorized = await handlePrivateCustomers(req("/private/customers"), envFor(db),
    { github_user_id: "9876" }, "/private/customers", send);
  assert.equal(unauthorized.status, 401);
});

test("customer API rejects invalid input and unrecognized methods", async () => {
  const { db } = fakeDb();
  assert.equal((await call(db, "/private/customers", "POST", { ...valid, birthday: "31/02/2001" })).status, 400);
  assert.equal((await call(db, "/private/customers", "DELETE")).status, 405);
  assert.equal((await call(db, "/private/customers/search", "POST", { query: "" })).status, 200);
});

test("Worker endpoints cannot list or create customers without GitHub owner token", async () => {
  const { db } = fakeDb();
  const env = {
    ...envFor(db),
    FRONTEND_LOGIN_URL: STAGING + "/owner-login",
    GITHUB_CLIENT_ID: "test-id",
    GITHUB_CLIENT_SECRET: "test-secret"
  };
  const list = await worker.fetch(req("/private/customers"), env);
  assert.equal(list.status, 401);
  const create = await worker.fetch(req("/private/customers", "POST", valid), env);
  assert.equal(create.status, 401);
  const notMyOrigin = await worker.fetch(new Request(STAGING + "/private/customers", {
    headers: { Origin: "https://untrusted.invalid" }
  }), env);
  assert.equal(notMyOrigin.status, 403);
});
