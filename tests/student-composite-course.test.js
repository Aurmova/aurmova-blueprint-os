import test from "node:test";
import assert from "node:assert/strict";
import { STUDENT_COMPOSITE_COURSE, buildStudentCompositeEntries } from "../src/student-composite-course.js";

test("合成数字学员教材应是跨位置同号，不是生日月加日",()=>{
  assert.match(STUDENT_COMPOSITE_COURSE.meta.definition,/不同数字位置/);
  assert.match(STUDENT_COMPOSITE_COURSE.meta.correction,/黑洞=495\/6174/);
  assert.match(STUDENT_COMPOSITE_COURSE.meta.correction,/成熟=第一循环\+第二循环/);
});

test("第十五章25组配对完整且无重复",()=>{
  const pairs=STUDENT_COMPOSITE_COURSE.pairs;
  assert.equal(pairs.length,25);
  assert.deepEqual(Object.entries(pairs.reduce((groups,p)=>{(groups[p.left]??=[]).push(p);return groups;},{})).map(([name,arr])=>[name,arr.length]),
    [["生命道路",7],["高峰",6],["挑战",5],["个人年",4],["表现",2],["内驱",1]]);
  const ids=pairs.map(p=>[p.left,p.right].join(":"));
  assert.equal(new Set(ids).size,25);
});

test("未核实个人特质位置不得自动判定",()=>{
  for(const p of STUDENT_COMPOSITE_COURSE.pairs){
    const needs=p.left==="个人特质"||p.right==="个人特质";
    assert.equal(p.pending,needs);
  }
});

test("48条学员基础教材可检索且不含私人客户信息",()=>{
  const entries=buildStudentCompositeEntries();
  assert.equal(entries.length,48);
  assert.ok(entries.every(x=>x.category==="学员教材｜合成数字"&&x.title&&x.text));
  assert.equal(new Set(entries.map(x=>x.title)).size,48);
  assert.ok(entries.some(x=>x.title.includes("课堂练习")));
  assert.ok(entries.some(x=>x.title.includes("考核")));
  assert.ok(entries.every(x=>!x.text.includes("+6010-5651465")));
});
