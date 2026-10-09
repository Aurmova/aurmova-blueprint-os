import test from "node:test";
import assert from "node:assert/strict";
import { calculateGoldenYearSnapshot } from "../src/engine/blueprint.js";
import { calculateAnnualFiveElementDistribution } from "../src/five-elements.js";
import { analyzeWuxingHealthReference, renderWuxingHealthReference, buildWuxingHealthLibraryEntries, WUXING_HEALTH_COURSE, WUXING_TRADITIONAL_ORGAN_PAIRS } from "../src/wuxing-health-course.js";

const annual=year=>calculateAnnualFiveElementDistribution(calculateGoldenYearSnapshot("18/08/1985",year));

test("All five traditional zang-fu pairings are stored with 5 course categories",()=>{
 assert.deepEqual(WUXING_HEALTH_COURSE.entries.map(e=>[e.element,e.digits]),[
  ["金",[1,6]],["水",[2,7]],["火",[3,8]],["木",[4,9]],["土",[5]]
 ]);
 assert.deepEqual(WUXING_TRADITIONAL_ORGAN_PAIRS.fire,["心","小肠"]);
 assert.deepEqual(WUXING_TRADITIONAL_ORGAN_PAIRS.wood,["肝","胆"]);
 assert.deepEqual(WUXING_TRADITIONAL_ORGAN_PAIRS.earth,["脾","胃"]);
 assert.deepEqual(WUXING_TRADITIONAL_ORGAN_PAIRS.metal,["肺","大肠"]);
 assert.deepEqual(WUXING_TRADITIONAL_ORGAN_PAIRS.water,["肾","膀胱"]);
 assert.equal(buildWuxingHealthLibraryEntries().length,6);
});

test("2027 shows only Fire despite other elements being singletons or absent",()=>{
 const data=analyzeWuxingHealthReference(annual(2027));
 assert.equal(data.details.length,5); // All source data remains available for library.
 assert.equal(data.details.reduce((v,e)=>v+e.count,0),6);
 assert.deepEqual(data.focused.map(e=>[e.element,e.count]),[["火",3]]);
 assert.deepEqual(data.focused[0].numberCounts,[{digit:3,count:2},{digit:8,count:1}]);
 assert.equal(data.diseasePrediction,false);
 const html=renderWuxingHealthReference(annual(2027));
 for(const phrase of ["火五行","3号×2","8号×1","心","小肠","传统五行脏腑主对应","原书列举的病痛范围","⑥ 五行对应身体健康"]){
  assert.ok(html.includes(phrase),phrase);
 }
 for(const excluded of ["金五行｜1次","水五行｜1次","木五行｜1次","土五行｜0次"]){
  assert.ok(!html.includes(excluded),excluded);
 }
});

test("3+8 counts as two Fire elements even when no digit repeats",()=>{
 const year={year:2027,yearPositions:{M:3,N:8,O:1,P:2,Q:4,R:5}};
 const dist=calculateAnnualFiveElementDistribution(year);
 assert.deepEqual(dist.repeatDigits,[]);
 const result=analyzeWuxingHealthReference(dist);
 assert.deepEqual(result.focused.map(e=>[e.element,e.count]),[["火",2]]);
 assert.deepEqual(result.focused[0].numberCounts,[{digit:3,count:1},{digit:8,count:1}]);
 const html=renderWuxingHealthReference(dist);
 assert.ok(html.includes("火五行｜2次"));
 assert.ok(html.includes("M=3"));
 assert.ok(html.includes("N=8"));
 assert.ok(html.includes("心"));
 assert.ok(!html.includes("肺"));
 assert.ok(!html.includes("肾"));
});

test("Different years reflect different element focuses",()=>{
 const x=analyzeWuxingHealthReference(annual(2026));
 const y=analyzeWuxingHealthReference(annual(2027));
 assert.deepEqual(x.focused.map(r=>[r.element,r.count]),[["金",2],["火",2],["木",2]]);
 assert.deepEqual(y.focused.map(r=>[r.element,r.count]),[["火",3]]);
 assert.notEqual(renderWuxingHealthReference(annual(2026)),renderWuxingHealthReference(annual(2027)));
});

test("Adult child prompts differ, with no clinical outcome claims",()=>{
 const a=renderWuxingHealthReference(annual(2027),false);
 const b=renderWuxingHealthReference(annual(2027),true);
 assert.notEqual(a,b);
 assert.ok(a.includes("Josephine身体关怀白话"));
 assert.ok(b.includes("孩子"));
 assert.ok(a.includes("不是疾病风险"));
 assert.equal(analyzeWuxingHealthReference(null),null);
 assert.equal(analyzeWuxingHealthReference({positionCount:6,rows:[]}),null);
});
