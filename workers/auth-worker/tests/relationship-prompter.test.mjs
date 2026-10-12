import test from "node:test";
import assert from "node:assert/strict";
import { calculateBlueprint } from "../../../src/engine/blueprint.js";
import { buildPrivateBlueprintPreview } from "../src/private-blueprint-analysis.js";
import { makeRelationshipConsultationScript } from "../src/relationship-consultation.js";
import { LOGIN_HTML, LOGIN_CSS, LOGIN_SCRIPT } from "../src/owner-login-page.js";

const sample = {
  id:"a01234cd-5678-4123-8123-012345678abc",
  name:"测试关系甲",gender:"女",birthday:"08/06/2000",
  consultationType:"关系蓝图解析",
  members:[{name:"测试成员乙",gender:"男",birthday:"16/09/1999",role:"伴侣"}],
  updatedAt:"2026-10-11T01:05:55Z"
};
test("fixture validates correct main, inner and exact positional seat codes", () => {
  const a=calculateBlueprint(sample.birthday), b=calculateBlueprint(sample.members[0].birthday);
  assert.deepEqual([a.mainPersonality,a.innerCode,a.seatCode],[3,6,"573"]);
  assert.deepEqual([b.mainPersonality,b.innerCode,b.seatCode],[8,7,"718"]);
});

test("relationship deep preview is available exclusively when paired members exist", () => {
  const r=buildPrivateBlueprintPreview(sample,"关系蓝图解析");
  assert.equal(r.people.length,2);
  assert.equal(r.people[0].starting,calculateBlueprint(sample.birthday).startingThoughtCode);
  assert.equal(r.people[1].starting,calculateBlueprint(sample.members[0].birthday).startingThoughtCode);
  assert.ok(r.consultationScript);
  assert.equal(r.consultationScript.steps.length,7);
  const single=buildPrivateBlueprintPreview({...sample,members:[]},"关系蓝图解析");
  assert.equal(single.consultationScript,null);
  assert.equal(buildPrivateBlueprintPreview(sample,"亲子蓝图解析").consultationScript,null);
  assert.equal(buildPrivateBlueprintPreview(sample,"合作蓝图解析").consultationScript,null);
  assert.equal(buildPrivateBlueprintPreview(sample,"人生蓝图解析").consultationScript,null);
  assert.equal(buildPrivateBlueprintPreview(sample,"黄金流年蓝图解析").consultationScript,null);
});

test("strict cause-process-result ordering and source mapping avoid inverted code claims", () => {
  const p=buildPrivateBlueprintPreview(sample,"关系蓝图解析").consultationScript;
  assert.deepEqual(p.codeEvidence.map(x=>x.code),["573","718"]);
  assert.deepEqual(p.codeEvidence.map(x=>x.courseCode),["573/753","178/718"]);
  assert.equal(p.codeEvidence.every(x=>x.available),true);
  const stage=p.steps.find(x=>x.id==="seat");
  assert.match(stage.script,/因 5（方向与选择），过程 7（分析与观察），结果 3（表达与行动）/);
  assert.match(stage.script,/因 7（分析与观察），过程 1（主见与开创），结果 8（目标与成果）/);
  assert.match(stage.script,/573先确立方向/);
  assert.match(stage.script,/718较先观察/);
  assert.doesNotMatch(stage.script,/753先分析/);
});

test("main and inner steps refer to BOTH partner numbers without forcing predictions", () => {
  const p=buildPrivateBlueprintPreview(sample,"关系蓝图解析").consultationScript;
  assert.equal(p.people[0].main,3);
  assert.equal(p.people[1].main,8);
  assert.equal(p.people[0].inner,6);
  assert.equal(p.people[1].inner,7);
  const inner=p.steps.find(x=>x.id==="inner");
  assert.match(inner.script,/测试关系甲 的内心码是 6/);
  assert.match(inner.script,/测试成员乙 的内心码是 7/);
  assert.match(inner.question,/希望对方做哪一件具体的事/);
  assert.match(p.steps[0].script,/数字提供的是观察角度，不等于事实/);
  assert.doesNotMatch(JSON.stringify(p),/百分之百|必然离婚|命中注定/);
});

test("every step has consultant-ready question, three response branches and next action", () => {
  const p=buildPrivateBlueprintPreview(sample,"关系蓝图解析").consultationScript;
  assert.deepEqual(p.steps.map(x=>x.id),[
    "opening","personality","seat","inner","loop","scenarios","summary"
  ]);
  for(const step of p.steps){
    assert.ok(step.title.length>2);
    assert.ok(step.script.length>=85);
    assert.ok(step.question.includes("？"));
    for(const k of ["fits","differs","unsure"]) assert.ok(step.followUps[k].length>10);
    assert.ok(step.nextAction.length>10);
  }
  assert.match(p.notes.join(" "),/不会被保存到数据库/);
});

test("other member records stay intact and scripts use selected private record", () => {
  const alt={...sample,members:[{name:"模拟新成员",gender:"女",birthday:"01/01/1995",role:"朋友"}]};
  const p=buildPrivateBlueprintPreview(alt,"关系蓝图解析").consultationScript;
  assert.match(p.title,/模拟新成员/);
  assert.doesNotMatch(p.title,/测试成员乙/);
  assert.equal(sample.members[0].name,"测试成员乙");
});

test("private reader is only part of authenticated hidden customer panel; safe text nodes", () => {
  assert.match(LOGIN_HTML,/id="customer-panel"[^>]+hidden/);
  assert.match(LOGIN_HTML,/id="private-analysis-panel"[^>]+hidden/);
  assert.match(LOGIN_SCRIPT,/renderRelationshipPrompter\(data.consultationScript\)/);
  assert.match(LOGIN_SCRIPT,/textContent = step.script|paragraph\("可以直接照读", step.script/);
  assert.match(LOGIN_SCRIPT,/textContent = step.followUps\[chosen\[step.id\]\]/);
  assert.match(LOGIN_SCRIPT,/selected\[step.id\]/);
  assert.match(LOGIN_SCRIPT,/analysisOutput.replaceChildren\(\)/);
  assert.match(LOGIN_CSS,/prompter-wrap/);
  assert.doesNotThrow(()=>new Function(LOGIN_SCRIPT));
});
