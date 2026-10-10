import test from "node:test";
import assert from "node:assert/strict";
import { calculateHighPeakProfile, calculateBlueprint } from "../src/engine/blueprint.js";
import {
 COOP_MAGNETIC_META, COOP_MAGNETIC_GUIDES, COOP_MAGNETIC_PARENT_CHILD_GUIDES,
 calculateMagneticNumber, prepareCooperationMagneticField, renderCooperationMagneticField, buildCooperationMagneticEntries
} from "../src/cooperation-magnetic-field.js";

test("The textbook formula sums two individual life numbers (not O or 45-group labels)",()=>{
 assert.equal(calculateMagneticNumber(6,4).number,1);
 assert.equal(calculateMagneticNumber(6,4).formula,"6＋4＝10→1");
 assert.equal(calculateMagneticNumber(7,3).number,1);
 assert.equal(calculateMagneticNumber(9,9).number,9);
 assert.equal(calculateMagneticNumber(9,9).formula,"9＋9＝18→9");
 assert.equal(calculateMagneticNumber(1,1).number,2);
 assert.equal(calculateMagneticNumber(5,4).number,9);
 assert.equal(calculateMagneticNumber(0,4),null);
 assert.equal(calculateMagneticNumber(11,4),null);
 assert.equal(calculateMagneticNumber(1.2,4),null);
});

test("Year 2000 has divergent AURMOVA O code, so use life number and show difference",()=>{
 const birthdayA="01/01/2000",birthdayB="21/11/1995";
 const original=calculateHighPeakProfile(birthdayA);
 const O=calculateBlueprint(birthdayA).mainPersonality;
 assert.equal(original.life.raw,4);
 assert.equal(original.life.number,4);
 assert.equal(O,9);
 const value=prepareCooperationMagneticField(birthdayA,birthdayB,"cooperation",{
   mainA:O,mainB:calculateBlueprint(birthdayB).mainPersonality
 });
 assert.equal(value.lifeA.number,4);
 assert.equal(value.lifeB.number,2);
 assert.equal(value.numberInfo.number,6);
 assert.equal(value.isSameAsMainPersonality,false);
 const html=renderCooperationMagneticField(birthdayA,birthdayB,"cooperation",{mainA:O,mainB:2});
 assert.ok(html.includes("数字来源差异"));
 assert.ok(html.includes("4＋2＝6"));
});

test("All nine sourced code summaries plus nine original parent-child rewrites exist",()=>{
 assert.deepEqual(Object.keys(COOP_MAGNETIC_GUIDES),["1","2","3","4","5","6","7","8","9"]);
 assert.deepEqual(Object.keys(COOP_MAGNETIC_PARENT_CHILD_GUIDES),["1","2","3","4","5","6","7","8","9"]);
 assert.equal(buildCooperationMagneticEntries().length,10);
 for(let n=1;n<=9;n++){
  const a=COOP_MAGNETIC_GUIDES[n],b=COOP_MAGNETIC_PARENT_CHILD_GUIDES[n];
  assert.ok(a.title&&a.sourceMeaning&&a.friction&&a.script&&a.questions?.length>=2&&a.action,String(n));
  assert.ok(b.title&&b.meaning&&b.script&&b.question&&b.action,String(n));
 }
 assert.ok(COOP_MAGNETIC_GUIDES[6].sourceMeaning.includes("合财"));
 assert.ok(COOP_MAGNETIC_GUIDES[8].sourceMeaning.includes("压力"));
 assert.ok(COOP_MAGNETIC_GUIDES[9].sourceMeaning.includes("成功"));
 assert.deepEqual(COOP_MAGNETIC_META.active,[1,3,5,7,9]);
 assert.deepEqual(COOP_MAGNETIC_META.passive,[2,4,6,8]);
});

test("Never use magnetic field for couples or unverified relationship kinds",()=>{
 for(const relation of ["spouse","romance","伴侣／感情","marriage",undefined]){
  if(relation===undefined)continue; // default is explicitly cooperation
  assert.equal(prepareCooperationMagneticField("01/01/2000","21/11/1995",relation),null);
  assert.equal(renderCooperationMagneticField("01/01/2000","21/11/1995",relation),"");
 }
 assert.ok(COOP_MAGNETIC_META.scope.includes("夫妻／情侣"));
});

test("Friend and partners use the same life method but context-specific advice",()=>{
 const a=renderCooperationMagneticField("01/01/2000","21/11/1995","cooperation",{aName:"Alpha",bName:"Beta"});
 const b=renderCooperationMagneticField("01/01/2000","21/11/1995","friendship",{aName:"Alpha",bName:"Beta"});
 assert.ok(a.includes("合作版提醒"));
 assert.ok(b.includes("朋友版提醒"));
 assert.ok(a.includes("合作密码（性格磁场）6号"));
 assert.ok(b.includes("朋友关系"));
 assert.ok(a.includes("独立的课程"));
});

test("Parent-child never sells adult money predictions, uses own speech and privacy-safe names",()=>{
 const html=renderCooperationMagneticField("01/01/2000","21/11/1995","parentChild",{
  aName:"A<script>",bName:"B&B",collapsed:true
 });
 assert.ok(html.includes("照顾与责任分担"));
 assert.ok(html.includes("没有所谓孩子会给父母带财"));
 assert.ok(html.includes("&lt;script&gt;"));
 assert.ok(html.includes("B&amp;B"));
 assert.ok(!html.includes("<script>"));
 assert.ok(!html.includes('<details class="foundation-block coop-magnetic-reading" open>'));
 assert.ok(!html.includes("原书简写为「合财，能见钱」"));
});

test("Reject invalid calendar days and missing birthday; do not fabricate magnetic numbers",()=>{
 for(const s of ["31/02/1995","00/10/1995","29/02/2023","invalid",""]) {
  assert.equal(prepareCooperationMagneticField(s,"21/11/1995","friendship"),null,s);
 }
 assert.equal(prepareCooperationMagneticField("29/02/2024","21/11/1995","friendship")?.numberInfo?.number>0,true);
 assert.equal(renderCooperationMagneticField("","21/11/1995","cooperation"),"");
});
