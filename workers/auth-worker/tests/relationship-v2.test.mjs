import test from "node:test";
import assert from "node:assert/strict";
import { calculateBlueprint } from "../../../src/engine/blueprint.js";
import { buildPrivateBlueprintPreview } from "../src/private-blueprint-analysis.js";
import { LOGIN_HTML, LOGIN_CSS, LOGIN_SCRIPT } from "../src/owner-login-page.js";

const person={
  id:"a01234cd-5678-4123-8123-012345678abc",
  name:"测试关系甲",gender:"女",birthday:"08/06/2000",
  consultationType:"关系蓝图解析",
  members:[{name:"测试成员乙",gender:"男",birthday:"16/09/1999",role:"伴侣"}],
  updatedAt:"2026-10-11T01:05:55Z"
};
function script(profile=person) { return buildPrivateBlueprintPreview(profile,"关系蓝图解析").consultationScript; }

test("V2 preserves AURMOVA's existing seat code, inner code and age calculations",()=>{
  const got=buildPrivateBlueprintPreview(person,"关系蓝图解析");
  const [a,b]=got.people;
  assert.equal(a.seatCode,"573");assert.equal(a.main,3);assert.equal(a.innerCode,6);
  assert.equal(b.seatCode,"718");assert.equal(b.main,8);assert.equal(b.innerCode,7);
  assert.equal(a.starting,calculateBlueprint(person.birthday).startingThoughtCode);
  assert.equal(got.consultationScript.version,"staging-relationship-prompter-v2");
  assert.deepEqual(got.consultationScript.codeEvidence.map(x=>x.courseCode),["573/753","178/718"]);
});

test("V2 has a distinct, readable explanation and cross-links at all seven stages",()=>{
  const got=script();
  assert.deepEqual(got.steps.map(s=>s.id),["opening","personality","seat","inner","loop","scenarios","summary"]);
  for(const s of got.steps){
    assert.ok(s.blocks.length>=3,s.id);
    assert.ok(s.blocks.every(b=>b.label && b.text.length>=30),s.id);
    assert.match(s.caveat,/假设/);
    assert.ok(s.interaction.options.length>=4,s.id);
    assert.equal(new Set(s.interaction.options.map(o=>o.key)).size,s.interaction.options.length);
    assert.ok(s.interaction.options.every(o=>o.label && o.ask && o.reply),s.id);
    assert.ok(s.question.endsWith("？"),s.id);
  }
  assert.match(got.steps[1].blocks[0].text,/主性格3/);
  assert.match(got.steps[1].blocks[0].text,/起始数/);
  assert.match(got.steps[1].blocks[1].text,/可能/);
  // Regression: never stringify the entire person object as "[object Object]".
  const ordered=got.steps[2].blocks[0].text;
  assert.match(ordered,/测试关系甲：因5/);
  assert.match(ordered,/测试成员乙：因7/);
  for (const part of got.steps) for (const block of part.blocks) {
    assert.doesNotMatch(block.text,/\[object Object\]/,part.id+" "+block.label);
  }
  assert.match(got.steps[2].blocks[1].text,/测试关系甲/);
  assert.match(got.steps[2].blocks[1].text,/测试成员乙/);
  assert.match(got.steps[2].blocks[2].text,/过程与 .*出发点同为数字7/);
  assert.match(got.steps[2].blocks[3].text,/573先确立方向/);
  assert.match(got.steps[2].blocks[3].text,/718较先观察/);
  assert.doesNotMatch(got.steps[2].blocks[3].text,/753先分析/);
  assert.match(got.steps[3].blocks[1].text,/照顾/);
  assert.match(got.steps[3].blocks[1].text,/信任/);
});

test("opening options are goal-oriented, not artificial yes/no for an open question",()=>{
  const got=script();
  const first=got.steps[0];
  assert.equal(first.interaction.type,"topic");
  assert.deepEqual(first.interaction.options.map(x=>x.key),[
    "communication","emotions","time","responsibility","money"
  ]);
  assert.ok(first.interaction.options.every(x=>x.label!=="符合"&&x.label!=="不符合"));
  assert.match(got.exampleByTopic.money,/预算/);
  assert.match(got.exampleByTopic.emotions,/心情不好/);
  assert.equal(got.focusTopics.communication,"沟通与误解");
});

test("every next stage offers scene-specific branches and follow-up questions",()=>{
  const got=script();
  const byId=Object.fromEntries(got.steps.map(s=>[s.id,s]));
  assert.deepEqual(byId.seat.interaction.options.map(x=>x.key),["cause","process","result","unknown"]);
  assert.deepEqual(byId.inner.interaction.options.map(x=>x.key),["company","space","help","uncertain"]);
  assert.ok(byId.loop.interaction.options.some(x=>x.key==="quiet"&&x.reply.includes("再谈")));
  assert.ok(byId.scenarios.interaction.options.some(x=>x.key==="money"&&x.ask.includes("开销")));
  assert.ok(byId.summary.interaction.options.some(x=>x.key==="listen"&&x.ask.includes("时间")));
});

test("special 3x8 and inner 6x7 samples never leak into a different couple's analysis",()=>{
  const different={...person,name:"模拟甲",birthday:"01/01/1995",
    members:[{name:"模拟乙",gender:"女",birthday:"01/01/1996",role:"朋友"}]};
  const got=script(different);
  assert.ok(got);
  assert.doesNotMatch(got.steps[1].blocks[2].text,/3号与8号.*这个组合才/);
  assert.match(got.steps[1].blocks[2].text,/不(?:要)?用3号与8号的示例套到其他组合/);
  assert.doesNotMatch(got.steps[3].blocks[1].text,/我努力做了，你却不说/);
  const [a,b]=buildPrivateBlueprintPreview(different,"关系蓝图解析").people;
  assert.ok(got.steps[2].blocks[0].text.includes("因"+a.seatCode[0]));
  assert.ok(got.steps[2].blocks[0].text.includes("因"+b.seatCode[0]));
});

test("V2 stays inside relationship project and leaves historical fake records unmodified",()=>{
  const before=JSON.stringify(person);
  assert.ok(script().steps.length);
  assert.equal(JSON.stringify(person),before);
  for(const project of ["人生蓝图解析","黄金流年蓝图解析","合作蓝图解析","亲子蓝图解析"]) {
    const got=buildPrivateBlueprintPreview(person,project);
    assert.equal(got.consultationScript,null);
  }
  assert.equal(script({...person,members:[]}),null);
});

test("UI segments use safe DOM text rendering; option choice and focus are ephemeral",()=>{
  assert.match(LOGIN_HTML,/id="private-analysis-panel"[^>]+hidden/);
  assert.match(LOGIN_CSS,/prompter-blocks/);
  assert.match(LOGIN_SCRIPT,/renderRelationshipPrompter\(data.consultationScript, data.customerId, data.project\)/);
  assert.match(LOGIN_SCRIPT,/sectionNode\("prompter-block-text", block.text\)/);
  assert.match(LOGIN_SCRIPT,/chosen\.opening/);
  assert.match(LOGIN_SCRIPT,/selected\.reply/);
  assert.match(LOGIN_SCRIPT,/selected\.ask/);
  assert.match(LOGIN_SCRIPT,/const chosen = Object.create\(null\)/);
  assert.match(LOGIN_SCRIPT,/copyFeedback\.textContent/);
  assert.doesNotThrow(()=>new Function(LOGIN_SCRIPT));
});
