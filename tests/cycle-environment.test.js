import test from "node:test";
import assert from "node:assert/strict";
import { calculateHighPeakProfile } from "../src/engine/blueprint.js";
import { CYCLE_ENVIRONMENT_LIBRARY, calculateCycleEnvironment, renderCycleEnvironmentPanel } from "../src/cycle-environment.js";

test("教材1985-08-18循环8-9-5：月、日、年各自化简",()=>{
  const r=calculateCycleEnvironment("18/08/1985",new Date(2026,9,9));
  assert.deepEqual(r.numbers,[8,9,5]);
  assert.deepEqual(r.cycles.map(x=>x.origin),["月","日","年"]);
  assert.deepEqual(r.cycles.map(x=>x.phaseIndices),[[1],[2,3],[4]]);
});

test("循环使用既有高峰年龄边界，且高峰与挑战对应位置正确",()=>{
  const birthday="18/08/1985", now=new Date(2026,9,9);
  const p=calculateHighPeakProfile(birthday,now);
  const r=calculateCycleEnvironment(birthday,now);
  assert.equal(r.current.phaseIndices.includes(p.current.index),true);
  assert.deepEqual(r.cycles.map(x=>x.peakNumbers),[[p.peaks[0]],[p.peaks[1],p.peaks[2]],[p.peaks[3]]]);
  assert.equal(r.cycles[0].end,p.phases[0].end);
  assert.equal(r.cycles[1].start,p.phases[1].start);
  assert.equal(r.cycles[1].end,p.phases[2].end);
  assert.equal(r.cycles[2].start,p.phases[3].start);
});

test("独立处理有效日期、不存在的日期及闰年",()=>{
  assert.equal(calculateCycleEnvironment("31/02/1985"),null);
  assert.equal(calculateCycleEnvironment("29/02/2001"),null);
  assert.equal(calculateCycleEnvironment("1985-08-18"),null);
  assert.deepEqual(calculateCycleEnvironment("29/02/2000").numbers,[2,2,2]);
});

test("1-9环境主题、亲子核对及Josephine咨询话术完整",()=>{
  const keys=["title","environment","positive","watch","first","talk","parentQuestion","adultQuestion"];
  for(let i=1;i<=9;i++)for(const key of keys)
    assert.ok(CYCLE_ENVIRONMENT_LIBRARY.numbers[i]?.[key],`Missing cycle ${i}.${key}`);
});

test("成人及儿童面板均显示三循环、年龄与咨询白话",()=>{
  for(const childMode of [false,true]){
    const html=renderCycleEnvironmentPanel({birthday:"18/08/1985"},childMode);
    for(const text of ["第一循环","第二循环","第三循环","Josephine白话","阶段规则","亲子核对"])assert.ok(html.includes(text),`Missing ${text}`);
    assert.equal((html.match(/Josephine白话/g)||[]).length,3);
  }
});
