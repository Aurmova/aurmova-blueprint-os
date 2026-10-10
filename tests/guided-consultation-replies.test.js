import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {GUIDED_QUESTIONS,buildGuidedReply,guidedRecordKey} from "../src/guided-consultation-replies.js";
const source=fs.readFileSync(new URL("../src/v6-enhancements.js",import.meta.url),"utf8");
const a={name:"Alice",officialName:"ALICE TAN",birthday:"01/01/1990"};
const b={name:"Mary",officialName:"MARY LIM",birthday:"01/01/2018"};
test("three consultation banks produce topic-specific replies, questions, action and name/birthday basis",()=>{
 for(const mode of ["relationship","family","cooperation"]){
 assert.equal(GUIDED_QUESTIONS[mode].length,6);
 for(const q of GUIDED_QUESTIONS[mode]){
 const reply=buildGuidedReply({mode,topicId:q.id,answer:"最近发生了一件具体事情",a,b});
 assert.equal(reply.valid,true);assert.equal(reply.title,q.title);
 assert.ok(reply.parts.some(([_,body])=>body.includes(q.follow)));
 assert.ok(reply.parts.some(([_,body])=>body.includes(q.action)));
 assert.ok(reply.basis[0].expression);assert.ok(reply.basis[1].expression);
 assert.ok(reply.readText.includes("Alice"));assert.ok(reply.readText.includes("Mary"));
 }
 }
});
test("denial and uncertainty do not force the proposed interpretation",()=>{
 for(const mode of ["relationship","family","cooperation"]){
 for(const answer of ["没有","不是这样","不认同"]){
 const r=buildGuidedReply({mode,topicId:"communication",answer,a,b});
 assert.equal(r.state,"denied");assert.ok(r.readText.includes("先放下"));assert.ok(!r.readText.includes("连接双方资料"));
 }
 for(const answer of ["不确定","不知道","嗯"]){
 assert.equal(buildGuidedReply({mode,topicId:"communication",answer,a,b}).state,"uncertain");
 }
 }
 assert.equal(buildGuidedReply({mode:"family",answer:"  ",a,b}).valid,false);
});
test("automatic classification and manually chosen topic stay reviewable",()=>{
 const auto=buildGuidedReply({mode:"cooperation",topicId:"auto",question:"费用怎样算？",answer:"付款和分润都没有讲清楚",a,b});
 assert.equal(auto.topic,"money");assert.equal(auto.question,"费用怎样算？");assert.ok(auto.method.includes("关键词"));
 const manual=buildGuidedReply({mode:"cooperation",topicId:"boundary",answer:"付款没有讲清楚",a,b});
 assert.equal(manual.topic,"boundary");
});
test("reported harm prioritizes safety and does not suggest confronting the other party",()=>{
 const r=buildGuidedReply({mode:"relationship",topicId:"conflict",answer:"他说生气就会打我",a,b});
 assert.ok(r.readText.includes("目前安全吗"));assert.ok(r.readText.includes("不安排双方当面对质"));assert.ok(!r.readText.includes("下次升级时暂停"));
});
test("record keys isolate question, pair, blueprint and customer drafts preserve original answer",()=>{
 assert.notEqual(guidedRecordKey("family","A-B","emotion"),guidedRecordKey("relationship","A-B","emotion"));
 assert.notEqual(guidedRecordKey("family","A-B","emotion"),guidedRecordKey("family","A-C","emotion"));
 const store=new Map(),context={GUIDED_QUESTIONS,buildGuidedReply,guidedRecordKey,
 localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},document:{addEventListener:()=>{}}};
 vm.createContext(context);
 const ui=source.slice(source.indexOf("function guidedContexts"),source.indexOf("function renderModule"));
 vm.runInContext(ui,context);
 const key=guidedRecordKey("family","A-B","emotion");
 const panel={dataset:{guidedRecord:key},querySelector:s=>({value:s.includes("answer")?"孩子昨天哭了":s.includes("question")?"先发生什么？":"家长"})};
 context.guidedSaveDraft(panel,{id:"customer-1"});
 assert.equal(context.loadGuidedState({id:"customer-1"}).records[key].answer,"孩子昨天哭了");
 assert.equal(context.loadGuidedState({id:"customer-2"}).records,undefined);
});
test("all three panels contain reply UI and rendering escapes answer text",()=>{
 new vm.Script(source.replace(/^import .*;$/gm,""));
 assert.ok(source.includes('guidedReplyPanel("relationship",c)'));assert.ok(source.includes('guidedReplyPanel("family",c)'));assert.ok(source.includes('guidedReplyPanel("cooperation",c)'));
 const context={esc:v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))};
 vm.createContext(context);
 const renderer=source.slice(source.indexOf("function guidedResultHtml"),source.indexOf("function guidedReplyPanel"));
 vm.runInContext(renderer,context);
 const reply=buildGuidedReply({mode:"relationship",topicId:"communication",answer:'<img src=x onerror=alert(1)>',a,b});
 const html=context.guidedResultHtml(reply);
 assert.ok(!html.includes("<img"));assert.ok(html.includes("&lt;img"));assert.ok(html.includes("data-guided-copy"));
});
