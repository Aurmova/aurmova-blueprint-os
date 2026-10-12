import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPrivateBlueprintPreview, FIVE_BLUEPRINTS, handlePrivateBlueprintPreview
} from "../src/private-blueprint-analysis.js";
import {
  calculateBlueprint, calculateGoldenYearSnapshot, activeFlowYear, flowYearRange
} from "../../../src/engine/blueprint.js";
import { LOGIN_HTML, LOGIN_CSS, LOGIN_SCRIPT } from "../src/owner-login-page.js";
import worker from "../src/index.js";

const STAGING = "https://aurmova-secure-api-staging.xbing5668.workers.dev";
const id = "a01234cd-5678-4123-8123-012345678abc";
const base = Object.freeze({
  id, name: "测试关系甲", gender: "女", birthday: "08/06/2000",
  whatsapp: "Test0002", consultationType: "关系蓝图解析",
  members: [{ name: "测试成员乙", gender: "男", birthday: "16/09/1999", role: "伴侣" }],
  updatedAt: "2026-10-11T00:00:00.000Z"
});
function fakeDB(row = base) {
  const seen = [];
  const env = {
    API_ORIGIN: STAGING,
    OWNER_GITHUB_USER_ID: "12345",
    DB: {
      prepare(sql) {
        assert.match(sql, /^SELECT profile_json FROM private_customers WHERE id = \? AND owner_github_id = \?$/);
        return {
          bind(customerId, ownerId) {
            seen.push({ customerId, ownerId });
            return { async first() {
              if (customerId !== id || ownerId !== "12345" || !row) return null;
              return { profile_json: JSON.stringify(row) };
            } };
          }
        };
      }
    }
  };
  return { env, seen };
}
function doPreview(env, user = { github_user_id: "12345" }, body = { customerId: id, project: "关系蓝图解析" }, endpoint = STAGING + "/private/blueprints/preview") {
  return handlePrivateBlueprintPreview(new Request(endpoint, {
    method: "POST", body: JSON.stringify(body), headers: { Origin: STAGING }
  }), env, user, (body, status = 200) => ({ body, status }));
}

test("five modes exist; all use original AURMOVA blueprint engine", () => {
  assert.deepEqual(FIVE_BLUEPRINTS, [
    "人生蓝图解析", "黄金流年蓝图解析", "关系蓝图解析", "亲子蓝图解析", "合作蓝图解析"
  ]);
  for (const project of FIVE_BLUEPRINTS) {
    const result = buildPrivateBlueprintPreview(base, project, 2027);
    assert.equal(result.stage, "STAGING_ONLY");
    assert.equal(result.ownerOnly, true);
    assert.equal(result.customerId, id);
    assert.ok(result.sections.length > 0);
    assert.equal(result.clientReportAvailable, false);
    assert.match(result.disclaimer, /内部|数字学/);
    assert.equal(result.people.length, 2);
    assert.equal(result.people[0].main, calculateBlueprint(base.birthday).mainPersonality);
    assert.equal(result.people[1].seatCode, calculateBlueprint(base.members[0].birthday).seatCode);
    assert.equal(result.people[1].gender, "男");
  }
});

test("life blueprint stage code follows the current established positional rules", () => {
  const customer = { ...base, name: "LATIN NAME", birthday: "21/11/1995", members: [] };
  const result = buildPrivateBlueprintPreview(customer, "人生蓝图解析", 2027);
  const source = calculateBlueprint(customer.birthday);
  const section = result.sections.find(s => s.title.startsWith("个人核心数字"));
  assert.ok(section.rows.some(r => r.label.includes("坐镇码") && r.value === source.seatCode));
  assert.ok(section.rows.some(r => r.label === "姓名表现数字" && /^\d$/.test(r.value)));
  // Names requiring Chinese -> pinyin conversion must never be guessed.
  const missingName = buildPrivateBlueprintPreview(base, "人生蓝图解析", 2027);
  assert.ok(missingName.annotations.some(t => t.includes("拼音")));
});

test("golden year displays the year-pyramid O rather than a separate formula, and uses correct axes", () => {
  const y = 2027, expected = calculateGoldenYearSnapshot(base.birthday, y);
  const result = buildPrivateBlueprintPreview(base, "黄金流年蓝图解析", y);
  assert.ok(result.sections[0].rows[1].value.includes("O 位 " + expected.personal.number));
  const personal = result.sections[1].rows;
  assert.equal(personal[0].value, expected.personalAxis.groups.MNO.join(""));
  assert.equal(personal[1].value, expected.personalAxis.groups.MOQ.join(""));
  const environment = result.sections[2].rows;
  assert.equal(environment[0].value, expected.environmentAxis.groups.KLN.join(""));
  assert.equal(environment[3].value, expected.environmentAxis.groups.VWX.join(""));
  assert.ok(result.sections[3].rows[0].value.includes(flowYearRange(y).start));
  assert.equal(activeFlowYear(new Date("2026-10-11T02:00:00Z")), 2027);
});

test("relationship, parenting and partnership create distinct scenario questions", () => {
  const relation = buildPrivateBlueprintPreview(base, "关系蓝图解析");
  const parent = buildPrivateBlueprintPreview({ ...base, members: [{ ...base.members[0], role: "孩子" }] }, "亲子蓝图解析");
  const partner = buildPrivateBlueprintPreview(base, "合作蓝图解析");
  assert.ok(relation.questions.some(s => s.includes("意见不同")));
  assert.ok(parent.questions.some(s => s.includes("孩子")));
  assert.ok(partner.questions.some(s => s.includes("对账")));
  assert.notDeepEqual(relation.sections, partner.sections);
  const noMember = buildPrivateBlueprintPreview({ ...base, members: [] }, "关系蓝图解析");
  assert.match(noMember.completeness, /至少一位/);
  assert.equal(noMember.people.length, 1);
});

test("private API requires exact staging host, numeric owner and existing owner-scoped customer", async () => {
  const { env, seen } = fakeDB();
  const ok = await doPreview(env);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.analysis.people[1].name, "测试成员乙");
  assert.deepEqual(seen, [{ customerId: id, ownerId: "12345" }]);
  assert.equal((await doPreview(env, { github_user_id: "54321" })).status, 401);
  assert.equal((await doPreview({ ...env, API_ORIGIN: "https://aurmova-secure-api.xbing5668.workers.dev" })).status, 403);
  assert.equal((await doPreview(env, { github_user_id: "12345" }, {
    customerId: id, project: "关系蓝图解析"
  }, "https://aurmova-secure-api.xbing5668.workers.dev/private/blueprints/preview")).status, 403);
  assert.equal((await doPreview(env, { github_user_id: "12345" }, { customerId: "not-a-uuid", project: "人生蓝图解析" })).status, 400);
  assert.equal((await doPreview(env, { github_user_id: "12345" }, { customerId: id, project: "无效类型" })).status, 400);
  assert.equal((await doPreview(fakeDB(null).env)).status, 404);
  assert.equal(seen.length, 1); // Unauthorized requests never read customer rows.
});

test("integrated panel is non-public until login and browser scripts parse", () => {
  assert.match(LOGIN_HTML, /id="private-analysis-panel"/);
  assert.match(LOGIN_HTML, /id="private-analysis-run"/);
  assert.match(LOGIN_HTML, /id="private-analysis-project"/);
  assert.match(LOGIN_HTML, /id="private-analysis-panel"[^>]+hidden/);
  assert.match(LOGIN_SCRIPT, /"\/private\/blueprints\/preview"/);
  assert.match(LOGIN_SCRIPT, /textContent = entry.value/);
  assert.match(LOGIN_SCRIPT, /analysisPanel/);
  assert.match(LOGIN_CSS, /analysis-controls/);
  assert.doesNotThrow(() => new Function(LOGIN_SCRIPT));
});

test("Worker denies unauthenticated preview even on staging", async () => {
  const response = await worker.fetch(new Request(STAGING + "/private/blueprints/preview", {
    method: "POST", body: JSON.stringify({ customerId: id, project: "关系蓝图解析" }),
    headers: { Origin: STAGING, "Content-Type": "application/json" }
  }), {
    API_ORIGIN: STAGING,
    FRONTEND_LOGIN_URL: STAGING + "/owner-login",
    GITHUB_CLIENT_ID: "test-only",
    GITHUB_CLIENT_SECRET: "test-only",
    OWNER_GITHUB_USER_ID: "12345",
    DB: {}
  });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "Authentication required");
});
