import test from "node:test";
import assert from "node:assert/strict";
import { calculateGoldenYearSnapshot } from "../src/engine/blueprint.js";
import { analyzeAnnualFiveElements,renderAnnualFiveElementAnalysis,WUXING_ELEMENT_ANALYSIS,WUXING_DIGIT_ANALYSIS } from "../src/five-elements-analysis.js";

test("2026 and 2027 same customer yields different explanations from selected year",()=>{
  const a=analyzeAnnualFiveElements(calculateGoldenYearSnapshot("18/08/1985",2026));
  const b=analyzeAnnualFiveElements(calculateGoldenYearSnapshot("18/08/1985",2027));
  assert.equal(a.year,2026);
  assert.equal(b.year,2027);
  assert.deepEqual(a.points.map(x=>x.digit),[8,1,9,1,8,9]);
  assert.deepEqual(b.points.map(x=>x.digit),[8,2,1,3,9,3]);
  assert.notEqual(a.speech,b.speech);
});
test("2027 fire is 3 positions but only digit 3 repeats twice at P and R",()=>{
  const a=analyzeAnnualFiveElements(calculateGoldenYearSnapshot("18/08/1985",2027));
  assert.equal(a.focusText,"火 3次");
  assert.equal(a.highlighted[0].count,3);
  assert.deepEqual(a.highlighted[0].digits,[8,3,3]);
  assert.equal(a.duplicates.length,1);
  assert.equal(a.duplicates[0].digit,3);
  assert.deepEqual(a.duplicates[0].slots,["P","R"]);
  assert.equal(a.duplicates[0].cross,false);
  assert.ok(a.duplicates[0].roleNotes.some(v=>v.includes("PQR")));
  assert.equal(a.healthRisk,null);
  assert.equal(a.diagnostic,false);
});
test("2026 3 groups tie and each number repeats across MNO and PQR",()=>{
  const a=analyzeAnnualFiveElements(calculateGoldenYearSnapshot("18/08/1985",2026));
  assert.deepEqual(a.highlighted.map(x=>[x.label,x.count]),[["金",2],["火",2],["木",2]]);
  assert.deepEqual(a.duplicates.map(x=>x.digit),[1,8,9]);
  assert.ok(a.duplicates.every(x=>x.cross));
});
test("adult and child narratives are different and specific",()=>{
  const y=calculateGoldenYearSnapshot("18/08/1985",2027);
  const adult=renderAnnualFiveElementAnalysis(y,false);
  const child=renderAnnualFiveElementAnalysis(y,true);
  for(const html of [adult,child]){
    for(const text of ["MNO 821","PQR 393","3号","火","Josephine完整咨询白话","追问","健康"])assert.ok(html.includes(text),text);
  }
  assert.ok(adult.includes("近期工作或家庭事务"));
  assert.ok(child.includes("孩子的学习活动量"));
  assert.notEqual(adult,child);
});
test("1-9 interpretations and 5 element guides complete",()=>{
  assert.deepEqual(Object.keys(WUXING_DIGIT_ANALYSIS).length,9);
  assert.deepEqual(Object.keys(WUXING_ELEMENT_ANALYSIS).length,5);
  for(let n=1;n<=9;n++)assert.ok(WUXING_DIGIT_ANALYSIS[n].questionAdult&&WUXING_DIGIT_ANALYSIS[n].questionChild);
  for(const e of Object.values(WUXING_ELEMENT_ANALYSIS))assert.ok(e.adult&&e.child&&e.tradition&&e.askAdult&&e.askChild);
});
test("invalid year snapshot does not invent analysis",()=>{
  assert.equal(analyzeAnnualFiveElements(null),null);
  assert.equal(analyzeAnnualFiveElements({year:2027,yearPositions:{M:1}}),null);
});
