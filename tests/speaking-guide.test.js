import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildSpeakingSteps,speakingReply,speakingSummary,speakingSessionKey} from '../src/speaking-guide.js';
const customer={id:'qa',name:'顾客甲',birthday:'02/01/1990',gender:'female'};
const other={name:'顾客乙',birthday:'06/05/2015',gender:'male'};
test('all five projects follow nine ordered steps with something to say, ask and transition',()=>{
 for(const type of ['life','year','relationship','family','cooperation']){
  const {steps}=buildSpeakingSteps({type,customer,other,year:2028});
  assert.equal(steps.length,9);
  assert.deepEqual(steps.map(s=>s.id),['open','problem','frame','topic0','topic1','topic2','action','agreement','close']);
  assert.ok(steps.every(s=>s.say&&s.question&&s.transition));
  assert.equal(new Set(steps.map(s=>s.title)).size,9);
 }
});
test('project-specific script keeps annual year, selected pair and child context',()=>{
 assert.ok(buildSpeakingSteps({type:'year',customer,year:2030}).steps[2].say.includes('2030'));
 assert.ok(buildSpeakingSteps({type:'relationship',customer,other}).steps[2].say.includes(other.name));
 const child=buildSpeakingSteps({type:'life',customer:other,child:true});
 assert.ok(child.steps[2].say.includes('孩子'));
 assert.ok(!child.steps[3].say.includes('工作'));
 assert.ok(child.steps[6].say.includes('适合孩子年龄'));
});
test('responses honor denied and uncertain answers and quote actual detail',()=>{
 const step=buildSpeakingSteps({type:'life',customer}).steps[3];
 assert.ok(speakingReply({type:'life',step,answer:'不像',customer}).includes('这一条先放下'));
 assert.ok(speakingReply({type:'life',step,answer:'不确定',customer}).includes('不急着下结论'));
 assert.ok(speakingReply({type:'life',step,answer:'最近工作很多，我很累',customer}).includes('最近工作很多，我很累'));
 assert.ok(speakingReply({type:'life',step,answer:'',customer}).includes('先记录'));
});
test('pair replies use current topic and keep calculation detail out of the spoken reply',()=>{
 const step=buildSpeakingSteps({type:'cooperation',customer,other}).steps[3];
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
test('all module mounts include the guide, including annual recalculations; mode hides only its own panel',()=>{
 const v6=fs.readFileSync(new URL('../src/v6-enhancements.js',import.meta.url),'utf8');
 const source=fs.readFileSync(new URL('../src/speaking-guide.js',import.meta.url),'utf8');
 assert.ok(v6.includes('mountSpeakingGuide(panel,'));
 assert.ok(v6.includes('mountReportForCustomer(panel,"黄金流年",c)'));
 assert.ok(source.includes('.speaking-active>:not(.speaking-guide)'));
 assert.ok(source.includes('查看完整资料'));
 assert.ok(source.includes('data-speak-report'));
});
