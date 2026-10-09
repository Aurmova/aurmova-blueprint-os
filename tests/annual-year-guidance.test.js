import test from "node:test";
import assert from "node:assert/strict";
import { calculateGoldenYearSnapshot } from "../src/engine/blueprint.js";
import { ANNUAL_YEAR_GUIDANCE,ANNUAL_YEAR_POLICY,prepareAnnualYearGuidance,renderAnnualYearGuidance,buildAnnualYearGuidanceEntries } from "../src/annual-year-guidance.js";

test("九个流年都有真正可以说、可以做、可以避免的独立课程资料",()=>{
 assert.deepEqual(Object.keys(ANNUAL_YEAR_GUIDANCE).map(Number),[1,2,3,4,5,6,7,8,9]);
 assert.equal(buildAnnualYearGuidanceEntries().length,9);
 for(let n=1;n<=9;n++){
  const g=ANNUAL_YEAR_GUIDANCE[n];
  assert.ok(g.name&&g.source&&g.meaning&&g.talk&&g.example&&g.opener&&g.week,"成人字段 "+n);
  assert.ok(g.actions.length>=3&&g.avoid.length>=3&&g.follow.length>=2,"成人行动 "+n);
  assert.ok(g.work&&g.relationships&&g.money,"成人生活场景 "+n);
  assert.ok(g.child.meaning&&g.child.talk&&g.child.question&&g.child.week,"儿童字段 "+n);
  assert.ok(g.child.actions.length>=3,"儿童行动 "+n);
 }
});

test("1号流年有清晰开始步骤和可照读白话",()=>{
 const s={year:2027,personal:{number:1},personalAxis:{groups:{MNO:[8,2,1],MOQ:[8,1,9],NOP:[2,1,3],PQR:[3,9,3]}}};
 const g=prepareAnnualYearGuidance(s,false);
 assert.equal(g.number,1);
 assert.equal(g.codes.MNO,"821");
 const html=renderAnnualYearGuidance(s,false);
 for(const x of ["破土萌芽","① 这一年建议做什么","② 这一年不建议怎么做","事业与学习","关系与家庭","金钱与资源","Josephine完整照读白话","先决定自己要往哪一条路走","MNO 821","③ 现实生活应该怎样安排","这周可以做的一件事"]){
  assert.ok(html.includes(x),x);
 }
});

test("每个1-9年度都能由个人流年O位自动读取正确的主题",()=>{
 for(let n=1;n<=9;n++){
  const fake={year:2027,personal:{number:n}};
  const x=prepareAnnualYearGuidance(fake,false);
  assert.equal(x.number,n);
  assert.ok(renderAnnualYearGuidance(fake,false).includes(n+"号｜"),"编号 "+n);
  assert.ok(renderAnnualYearGuidance(fake,false).includes(ANNUAL_YEAR_GUIDANCE[n].name));
  assert.ok(renderAnnualYearGuidance(fake,true).includes("儿童版"));
  assert.notEqual(renderAnnualYearGuidance(fake,false),renderAnnualYearGuidance(fake,true),"区分成人儿童 "+n);
 }
});

test("不同流年年份会重排盘，解读随个人O位而非某一个全球数字变化",()=>{
 const a=calculateGoldenYearSnapshot("18/08/1985",2026);
 const b=calculateGoldenYearSnapshot("18/08/1985",2027);
 assert.ok(a&&b);
 assert.notEqual(a.personal.number,b.personal.number);
 const v1=prepareAnnualYearGuidance(a,false),v2=prepareAnnualYearGuidance(b,false);
 assert.equal(v1.number,a.personal.number);
 assert.equal(v2.number,b.personal.number);
 assert.notEqual(v1.talk,v2.talk);
 assert.ok(renderAnnualYearGuidance(a,false).includes("MNO "));
});

test("流年和大环境不会被混为一个数字，也不会生成绝对预测",()=>{
 assert.ok(ANNUAL_YEAR_POLICY.calculation.includes("O位"));
 assert.ok(ANNUAL_YEAR_POLICY.calculation.includes("KLN"));
 assert.ok(ANNUAL_YEAR_POLICY.limitation.includes("不能保证"));
 assert.equal(prepareAnnualYearGuidance({year:2027,personal:{number:0}}),null);
 assert.equal(prepareAnnualYearGuidance(null),null);
});
