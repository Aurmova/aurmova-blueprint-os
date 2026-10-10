import test from "node:test";
import assert from "node:assert/strict";
import { calculateBlueprint } from "../src/engine/blueprint.js";
import {PARTNER_PAIR_COURSE,getPartnerPair,createPartnerPairReading,renderPartnerPairReading,buildPartnerPairCourseEntries} from "../src/partner-pair-course.js";

test("校核原书第233–241页涵盖45组不重复的1–9配对",()=>{
 const keys=Object.keys(PARTNER_PAIR_COURSE.pairs);
 assert.equal(keys.length,45);
 assert.equal(buildPartnerPairCourseEntries().length,45);
 const expected=[];
 for(let a=1;a<=9;a++)for(let b=a;b<=9;b++)expected.push(""+a+b);
 assert.deepEqual(keys,expected);
 for(const pair of Object.values(PARTNER_PAIR_COURSE.pairs)){
  assert.ok(pair.page&&pair.positive&&pair.challenge&&pair.action&&pair.question,pair.key);
  assert.ok(pair.positive.length>20&&pair.challenge.length>20&&pair.action.length>15,pair.key);
 }
 assert.equal(PARTNER_PAIR_COURSE.pairs["14"].page,"233–234");
 assert.equal(PARTNER_PAIR_COURSE.pairs["88"].page,"240–241");
 assert.equal(PARTNER_PAIR_COURSE.pairs["99"].page,"241");
});

test("低号＋高号与反过来取得同一组来源，45组不混编号",()=>{
 for(let a=1;a<=9;a++)for(let b=1;b<=9;b++){
  const expected=""+Math.min(a,b)+Math.max(a,b);
  assert.equal(getPartnerPair(a,b).key,expected,String(a)+"+"+String(b));
  assert.equal(getPartnerPair(b,a).key,expected,String(b)+"+"+String(a));
 }
 for(const val of [0,10,-1,1.5,NaN,"abc",null,undefined]){
  assert.equal(getPartnerPair(val,3),null);
 }
});
test("3和4合作点、摩擦与后天建议都正确呈现，不只重念个人性格",()=>{
 const p=getPartnerPair(3,4);
 assert.ok(p.positive.includes("落实"));
 assert.ok(p.challenge.includes("稳定"));
 assert.ok(p.action.includes("小试验"));
 const r=createPartnerPairReading(4,3,"relationship",{aName:"甲",bName:"乙"});
 assert.equal(r.pair.key,"34");
 assert.equal(r.a,4);
 assert.equal(r.b,3);
 assert.ok(r.script.includes("甲的主性格是4号"));
 assert.ok(r.script.includes("乙的主性格是3号"));
 assert.ok(r.script.includes(p.positive));
 assert.ok(r.script.includes(p.challenge));
 assert.ok(r.script.includes(p.question));
});
test("关系版与合作版话术分开，保留双方界线与实务行动",()=>{
 const c={aName:"客户甲",bName:"伙伴乙"};
 const a=renderPartnerPairReading(2,8,"relationship",c);
 const b=renderPartnerPairReading(2,8,"cooperation",c);
 assert.notEqual(a,b);
 for(const html of [a,b]){
  for(const t of ["客户甲","伙伴乙","原书合作点","原书不合点","Josephine完整咨询白话","第236页","主性格O","咨询界线"]){
   assert.ok(html.includes(t),t);
  }
 }
 assert.ok(a.includes("说话方式"));
 assert.ok(b.includes("预算"));
 assert.ok(b.includes("决定权"));
 assert.ok(a.includes("2号＋8号"));
});
test("合作多人可折叠其后分析，用户姓名不会注入HTML",()=>{
 const h=renderPartnerPairReading(1,9,"cooperation",{aName:"A<script>",bName:"B&B",collapsed:true});
 assert.ok(h.includes("&lt;script&gt;"));
 assert.ok(h.includes("B&amp;B"));
 assert.ok(!h.includes("<script>"));
 assert.ok(!h.includes('<details class="foundation-block partner-pair-reading" open>'));
 assert.ok(renderPartnerPairReading(1,9,"cooperation").includes('<details class="foundation-block partner-pair-reading" open>'));
 assert.equal(renderPartnerPairReading(3,12,"relationship"),"");
});
test("主性格来自两人的独立生日O位，而非联合码、个人流年或新合数",()=>{
 const a=calculateBlueprint("21/11/1995"),b=calculateBlueprint("18/08/1985");
 assert.ok(a?.mainPersonality>=1&&b?.mainPersonality>=1);
 const r=createPartnerPairReading(a.mainPersonality,b.mainPersonality,"relationship");
 assert.equal(r.pair.key,""+Math.min(a.mainPersonality,b.mainPersonality)+Math.max(a.mainPersonality,b.mainPersonality));
 assert.ok(PARTNER_PAIR_COURSE.meta.rule.includes("主性格O位"));
 assert.ok(PARTNER_PAIR_COURSE.meta.rule.includes("不生成新的关系联合码"));
 assert.ok(PARTNER_PAIR_COURSE.meta.safeguard.includes("不能保证"));
});
