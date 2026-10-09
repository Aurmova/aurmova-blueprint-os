import test from "node:test";
import assert from "node:assert/strict";
import { calculateGoldenYearSnapshot } from "../src/engine/blueprint.js";
import { FIVE_ELEMENT_LIBRARY,calculateAnnualFiveElementDistribution,renderAnnualFiveElementPanel } from "../src/five-elements.js";

test("课程五行仍按 1/6金、2/7水、3/8火、4/9木、5土",()=>{
  assert.deepEqual(FIVE_ELEMENT_LIBRARY.elements.map(x=>[x.label,x.digits]),[
    ["金",[1,6]],["水",[2,7]],["火",[3,8]],["木",[4,9]],["土",[5]]
  ]);
});
test("只读取同一流年盘 M、N、O、P、Q、R 六个独立位置",()=>{
  const snap=calculateGoldenYearSnapshot("18/08/1985",2027);
  const r=calculateAnnualFiveElementDistribution(snap);
  assert.deepEqual(r.points.map(x=>x.slot),["M","N","O","P","Q","R"]);
  assert.deepEqual(r.points.map(x=>x.digit),["M","N","O","P","Q","R"].map(x=>snap.yearPositions[x]));
  assert.equal(r.rows.reduce((sum,x)=>sum+x.count,0),6);
  assert.equal(r.positionCount,6);
});
test("相同号码重复，与同五行不同数字分开计算",()=>{
  const fake={year:2027,yearPositions:{M:1,N:6,O:1,P:7,Q:2,R:5}};
  const r=calculateAnnualFiveElementDistribution(fake);
  assert.deepEqual(r.repeatDigits.map(x=>({digit:x.digit,count:x.count,slots:x.slots})),
    [{digit:1,count:2,slots:["M","O"]}]);
  const metal=r.rows.find(x=>x.label==="金"),water=r.rows.find(x=>x.label==="水");
  assert.equal(metal.count,3);
  assert.equal(water.count,2);
  assert.equal(r.healthRisk,null);
  assert.equal(r.diagnostic,false);
});
test("选择不同流年，按年份重新排盘，而非固定出生盘",()=>{
  const x=calculateAnnualFiveElementDistribution(calculateGoldenYearSnapshot("18/08/1985",2026));
  const y=calculateAnnualFiveElementDistribution(calculateGoldenYearSnapshot("18/08/1985",2027));
  assert.equal(x.year,2026);
  assert.equal(y.year,2027);
  assert.notDeepEqual(x.points.map(z=>z.digit),y.points.map(z=>z.digit));
});
test("成人、儿童健康提示不预测疾病事故；无效位置不输出",()=>{
  const snap=calculateGoldenYearSnapshot("18/08/1985",2027);
  for(const childMode of [false,true]){
    const html=renderAnnualFiveElementPanel(snap,childMode);
    assert.ok(html.includes("流年五行"));
    assert.ok(html.includes("M=3")||html.includes("M="));
    assert.ok(html.includes("Josephine白话"));
    assert.ok(html.includes("不能说明当年的疾病"));
  }
  assert.equal(calculateAnnualFiveElementDistribution(null),null);
  assert.equal(calculateAnnualFiveElementDistribution({year:2027,yearPositions:{M:1}}),null);
});
