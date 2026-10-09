import test from "node:test";
import assert from "node:assert/strict";
import { calculateBlueprint } from "../src/engine/blueprint.js";
import { FIVE_ELEMENT_LIBRARY,calculateFiveElementDistribution,renderFiveElementPanel } from "../src/five-elements.js";

test("原书金水火木土数值映射不可更改",()=>{
  assert.deepEqual(FIVE_ELEMENT_LIBRARY.elements.map(x=>[x.label,x.digits]),[
    ["金",[1,6]],["水",[2,7]],["火",[3,8]],["木",[4,9]],["土",[5]]
  ]);
});
test("按内7外9分开计算，累计次数正确",()=>{
  const a=calculateBlueprint("18/08/1985");
  const d=calculateFiveElementDistribution(a);
  assert.equal(d.innerCount,7);
  assert.equal(d.outerCount,9);
  assert.equal(d.totalCount,16);
  assert.equal(d.rows.reduce((sum,r)=>sum+r.inner,0),7);
  assert.equal(d.rows.reduce((sum,r)=>sum+r.outer,0),9);
  assert.equal(d.rows.reduce((sum,r)=>sum+r.total,0),16);
  for(const row of d.rows){
    assert.equal(row.total,row.inner+row.outer);
    assert.equal(row.innerDigits.length,row.inner);
    assert.equal(row.outerDigits.length,row.outer);
  }
});
test("五行归类只看数字盘位置，不推断健康或八字",()=>{
  const a=calculateBlueprint("18/08/1985");
  const d=calculateFiveElementDistribution(a);
  assert.equal(d.diagnostic,false);
  assert.ok(FIVE_ELEMENT_LIBRARY.meta.limitation.includes("不是八字五行"));
  assert.ok(FIVE_ELEMENT_LIBRARY.meta.limitation.includes("不凭任何数字预测疾病"));
  for(const childMode of [true,false]){
    const html=renderFiveElementPanel(a,childMode);
    assert.ok(html.includes("五行数字分布"));
    assert.ok(html.includes("内7位"));
    assert.ok(html.includes("外9位"));
    assert.ok(html.includes("Josephine白话"));
  }
});
test("不正确的数字盘不能生成误导表格",()=>{
  assert.equal(calculateFiveElementDistribution(null),null);
  assert.equal(calculateFiveElementDistribution({innerTriangle:[1,2,3],outerTriangle:[1]}),null);
});
