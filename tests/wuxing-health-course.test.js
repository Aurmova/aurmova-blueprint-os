import test from "node:test";
import assert from "node:assert/strict";
import { calculateGoldenYearSnapshot } from "../src/engine/blueprint.js";
import { calculateAnnualFiveElementDistribution } from "../src/five-elements.js";
import { analyzeWuxingHealthReference, renderWuxingHealthReference, buildWuxingHealthLibraryEntries, WUXING_HEALTH_COURSE } from "../src/wuxing-health-course.js";

const fixture=year=>calculateAnnualFiveElementDistribution(calculateGoldenYearSnapshot("18/08/1985",year));

test("5 original health-course groups are complete and indexed",()=>{
  assert.deepEqual(WUXING_HEALTH_COURSE.entries.map(x=>[x.element,x.digits]),[
    ["金",[1,6]],["水",[2,7]],["火",[3,8]],["木",[4,9]],["土",[5]]
  ]);
  for(const e of WUXING_HEALTH_COURSE.entries){
    assert.ok(e.organs.length);
    assert.ok(e.courseDiseases.length);
    assert.ok(e.courseSigns.length);
    assert.ok(e.consultAdult.length);
    assert.ok(e.consultChild.length);
  }
  assert.equal(buildWuxingHealthLibraryEntries().length,6);
});

test("2027 flow-year six positions render full health-course references, including absent earth",()=>{
  const data=analyzeWuxingHealthReference(fixture(2027));
  assert.equal(data.details.length,5);
  assert.equal(data.details.reduce((n,x)=>n+x.count,0),6);
  assert.equal(data.details.find(x=>x.element==="火").count,3);
  assert.equal(data.details.find(x=>x.element==="土").count,0);
  assert.equal(data.diseasePrediction,false);
  const html=renderWuxingHealthReference(fixture(2027));
  for(const phrase of ["肺","肾","心脏","肝","脾","小肠","原书列举的病痛范围","原书列举的不适或征象","⑥ 五行对应身体健康"]){
    assert.ok(html.includes(phrase),phrase);
  }
  assert.ok(html.includes("未出现（不等于器官问题）"));
  assert.ok(html.includes("不是本人的疾病"));
});

test("2026 and 2027 health course references follow the selected year",()=>{
  const x=analyzeWuxingHealthReference(fixture(2026));
  const y=analyzeWuxingHealthReference(fixture(2027));
  assert.equal(x.details.find(z=>z.element==="水").count,0);
  assert.equal(y.details.find(z=>z.element==="水").count,1);
  assert.notEqual(renderWuxingHealthReference(fixture(2026)),renderWuxingHealthReference(fixture(2027)));
});

test("adult and child questions differ and neither claims diagnosis",()=>{
  const adult=renderWuxingHealthReference(fixture(2027),false);
  const child=renderWuxingHealthReference(fixture(2027),true);
  assert.notEqual(adult,child);
  assert.ok(adult.includes("Josephine身体关怀白话"));
  assert.ok(child.includes("孩子的土数字"));
  assert.ok(child.includes("由医生"));
  assert.ok(WUXING_HEALTH_COURSE.frequentRule.includes("无法判断"));
  assert.ok(WUXING_HEALTH_COURSE.missingRule.includes("不表示"));
});

test("invalid flow-year six-slot snapshot gets no health narrative",()=>{
  assert.equal(analyzeWuxingHealthReference(null),null);
  assert.equal(analyzeWuxingHealthReference({positionCount:6,rows:[]}),null);
  assert.equal(renderWuxingHealthReference({positionCount:5,rows:[]}),"");
});
