import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLifeElevenSteps,LIFE_ELEVEN_TITLES} from '../src/life-eleven-stages.js';

const person={name:'测试顾客',birthday:'21/11/1995',gender:'女'};
const now=new Date('2026-10-17T08:00:00+08:00');

test('life consultation has exactly eleven ordered steps and safe closing',()=>{
 const v=buildLifeElevenSteps({customer:person,now});
 assert.equal(v.steps.length,11);
 assert.deepEqual(v.steps.map(s=>s.title),LIFE_ELEVEN_TITLES);
 assert.equal(new Set(v.steps.map(s=>s.id)).size,11);
 assert.equal(v.steps.at(-1).id,'close');
 for(const step of v.steps){
  assert.ok(step.say.length>35,step.id);
  assert.ok(step.question.length>8,step.id);
  assert.ok(step.transition.length>7,step.id);
 }
});

test('uses existing numerical engine and active 21-40 stage, not invented positions',()=>{
 const v=buildLifeElevenSteps({customer:person,now});
 assert.equal(v.metadata.age,30);
 assert.equal(v.metadata.phase,'21–40');
 assert.equal(v.metadata.main,2);
 assert.equal(v.metadata.seat,'562');
 assert.equal(v.metadata.father,'325');
 assert.equal(v.metadata.mother,'156');
 assert.match(v.steps[7].say,/325/);
 assert.match(v.steps[7].say,/358/);
 assert.match(v.steps[7].say,/257/);
 assert.match(v.steps[7].say,/876/);
});

test('unverified subconscious and talent formulas never become definitive claims',()=>{
 const v=buildLifeElevenSteps({customer:person,now});
 assert.equal(v.metadata.subconsciousFormula,'PENDING_REVIEW');
 assert.equal(v.metadata.talentFormula,'PENDING_REVIEW');
 assert.match(v.steps[5].say,/公式尚不一致/);
 assert.match(v.steps[5].say,/暂不把自动数值当作确定结果/);
});

test('under 21 does not receive adult phase interpretation',()=>{
 const v=buildLifeElevenSteps({customer:{name:'演示儿童',birthday:'01/01/2015'},now});
 assert.equal(v.metadata.phase,null);
 assert.match(v.steps[7].say,/不属于21岁起的成人三阶段/);
});

test('refuses missing or invalid birthdays',()=>{
 assert.throws(()=>buildLifeElevenSteps({customer:{}}),/生日/);
 assert.throws(()=>buildLifeElevenSteps({customer:{birthday:'99\/99\/1995'}}),/生日/);
});
