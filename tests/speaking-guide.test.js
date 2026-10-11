import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildSpeakingSteps,speakingReply,speakingSummary,speakingSessionKey} from '../src/speaking-guide.js';
import {calculateBlueprint} from '../src/engine/blueprint.js';
const customer={id:'qa',name:'顾客甲',birthday:'02/01/1990',gender:'female'};
const other={name:'顾客乙',birthday:'06/05/2015',gender:'male'};
test('all five projects start with Josephine’s requested foundation order, then application and closing',()=>{
 for(const type of ['life','year','relationship','family','cooperation']){
  const {steps}=buildSpeakingSteps({type,customer,other,year:2028});
  assert.equal(steps.length,type==='life'?14:16);
  assert.deepEqual(steps.slice(0,7).map(s=>s.id),['main','main-start','inner','triangle','thinking','pressure','communication']);
  assert.deepEqual(steps.slice(-3).map(s=>s.id),['action','agreement','close']);
  assert.ok(steps.every(s=>s.say&&s.question&&s.transition));
  assert.equal(new Set(steps.map(s=>s.title)).size,steps.length);
 }
});
test('project-specific script keeps annual year, selected pair and child context',()=>{
 assert.ok(buildSpeakingSteps({type:'year',customer,year:2030}).frame.includes('2030'));
 assert.ok(buildSpeakingSteps({type:'relationship',customer,other}).steps[0].say.includes(other.name));
 const child=buildSpeakingSteps({type:'life',customer:other,child:true});
 assert.ok(child.frame.includes('孩子'));
 assert.ok(!child.steps[0].say.includes('工作'));
 assert.ok(child.steps.find(s=>s.id==='action').say.includes('适合孩子年龄'));
});
test('responses honor denied and uncertain answers and quote actual detail',()=>{
 const step=buildSpeakingSteps({type:'life',customer}).steps[3];
 assert.ok(speakingReply({type:'life',step,answer:'不像',customer}).includes('这一条先放下'));
 assert.ok(speakingReply({type:'life',step,answer:'不确定',customer}).includes('不急着下结论'));
 assert.ok(speakingReply({type:'life',step,answer:'最近工作很多，我很累',customer}).includes('最近工作很多，我很累'));
 assert.ok(speakingReply({type:'life',step,answer:'',customer}).includes('先记录'));
});
test('pair replies use current topic and keep calculation detail out of the spoken reply',()=>{
 const step=buildSpeakingSteps({type:'cooperation',customer,other}).steps.find(s=>s.id==='topic0');
 const reply=speakingReply({type:'cooperation',step,answer:'我们最近经常漏做任务，没有说明谁负责',customer,other});
 assert.ok(reply.includes('负责人'));
 assert.ok(!reply.includes('表现 '));
 const denied=speakingReply({type:'family',step:{...step,topic:'learning'},answer:'没有',customer,other});
 assert.ok(denied.includes('这一条先放下'));
});
test('reported harm interrupts interpretation with safety rather than relationship advice',()=>{
 const step=buildSpeakingSteps({type:'relationship',customer,other}).steps[3];
 const reply=speakingReply({type:'relationship',step,answer:'他说会打我',customer,other});
 assert.ok(reply.includes('安全'));
 assert.ok(!reply.includes('当面对质。我们'));
});
test('summary repeats recorded issue and agreed action without inventing a conclusion',()=>{
 const summary=speakingSummary({problem:{answer:'想改善工作分工'},agreement:{answer:'明天确认一次负责人'}});
 assert.ok(summary.includes('想改善工作分工'));
 assert.ok(summary.includes('明天确认一次负责人'));
 assert.ok(speakingSummary({}).includes('行动还没有确认'));
});
test('session drafts are isolated by customer, project, selected pair and annual year',()=>{
 const a=speakingSessionKey(customer.id,'year',customer,other,2027);
 assert.notEqual(a,speakingSessionKey(customer.id,'year',customer,other,2028));
 assert.notEqual(a,speakingSessionKey('other','year',customer,other,2027));
 assert.notEqual(a,speakingSessionKey(customer.id,'family',customer,other,2027));
 assert.notEqual(a,speakingSessionKey(customer.id,'year',customer,{...other,name:'顾客丙'},2027));
});
test('starting and inner codes come from their actual positions, not the constraint number',()=>{
 const chart=calculateBlueprint(customer.birthday),steps=buildSpeakingSteps({type:'life',customer}).steps;
 assert.notEqual(chart.startingThoughtCode,chart.constraintCode);
 assert.ok(steps[1].say.includes('起始数'+chart.startingThoughtCode+'来自三角形的I位'));
 assert.ok(steps[2].say.includes('内心码是'+chart.innerCode));
 assert.ok(steps.find(s=>s.id==='seat').say.includes('坐镇码'+chart.seatCode));
});
test('triangle strengths use inner counts and show selected directions; optional modules can be skipped',()=>{
 const chart=calculateBlueprint(customer.birthday),steps=buildSpeakingSteps({type:'life',customer}).steps;
 const selected=Object.entries(chart.innerEnergy.counts).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]||Number(a[0])-Number(b[0])).slice(0,3).map(([n])=>Number(n));
 assert.ok(steps[3].say.includes('三角形内的七个位置'));
 for(const n of selected)assert.ok(steps[3].say.includes(n+'的「'));
 assert.ok(steps.slice(7,10).every(s=>s.optional));
 const source=fs.readFileSync(new URL('../src/speaking-guide.js',import.meta.url),'utf8');
 assert.ok(source.includes('这一层先略过'));
 assert.ok(source.includes('state.schema!==2'));
});
test('all module mounts include the guide, including annual recalculations; mode hides only its own panel',()=>{
 const v6=fs.readFileSync(new URL('../src/v6-enhancements.js',import.meta.url),'utf8');
 const source=fs.readFileSync(new URL('../src/speaking-guide.js',import.meta.url),'utf8');
 assert.ok(v6.includes('mountSpeakingGuide(panel,'));
 assert.ok(v6.includes('mountReportForCustomer(panel,"黄金流年",c)'));
 assert.ok(source.includes('.speaking-active>:not(.speaking-guide)'));
 assert.ok(source.includes('查看完整资料'));
 assert.ok(source.includes('data-speak-report'));
});
