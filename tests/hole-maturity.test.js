import test from "node:test";
import assert from "node:assert/strict";
import { MATURITY_NUMBER_LIBRARY, BLACK_HOLE_NUMBER_LIBRARY, calculateMaturityProfile, inspectBlackHoleSources, renderHoleMaturityPanel } from "../src/hole-maturity-library.js";

const example={name:"MA YUN",birthday:"10/09/1964"};

test("教材例1964年9月10日生命3＋表现2＝成熟5",()=>{
  const r=calculateMaturityProfile(example,new Date(2026,9,9));
  assert.equal(r.lifeRaw,30);
  assert.equal(r.lifeNumber,3);
  assert.equal(r.nameNumber,2);
  assert.equal(r.raw,5);
  assert.equal(r.number,5);
});

test("成熟数1–9独立于主性格及坐镇码，资料与白话齐全",()=>{
  const fields=["title","core","positive","watch","talk","question","action"];
  for(let n=1;n<=9;n++)for(const field of fields)
    assert.ok(MATURITY_NUMBER_LIBRARY.numbers[n]?.[field],`Missing maturity ${n}.${field}`);
  const profile=calculateMaturityProfile(example);
  assert.ok(profile.canCalculate);
  assert.equal(profile.detail.title,MATURITY_NUMBER_LIBRARY.numbers[5].title);
});

test("黑洞六来源必须齐全，缺少个特公式时不宣称已经发现黑洞",()=>{
  const h=inspectBlackHoleSources(example);
  assert.equal(h.sources.length,6);
  assert.deepEqual(h.sources.map(x=>x.name),BLACK_HOLE_NUMBER_LIBRARY.meta.sixPositions);
  assert.ok(h.missingSources.includes("个特数字"));
  assert.equal(h.ready,false);
  assert.equal(h.confirmedBlackHoles,null);
});

test("姓名缺失和非法生日不能生成看似准确的成熟数字",()=>{
  assert.equal(calculateMaturityProfile({birthday:example.birthday,name:""}).canCalculate,false);
  assert.equal(calculateMaturityProfile({birthday:"31/02/1964",name:example.name}),null);
});

test("成人和儿童咨询面板分别遵守成熟年龄边界",()=>{
  const adult=renderHoleMaturityPanel(example,false);
  assert.ok(adult.includes("成熟数字 · 5"));
  assert.ok(adult.includes("Josephine白话"));
  assert.ok(adult.includes("暂不自动断定黑洞号码"));
  const child=renderHoleMaturityPanel({name:"TEST CHILD",birthday:"10/09/2018"},true);
  assert.ok(child.includes("儿童目前只作家长理解长期成长"));
});
