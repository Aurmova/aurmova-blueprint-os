import test from "node:test";
import assert from "node:assert/strict";
import { calculateHighPeakProfile, calculateBlueprint } from "../src/engine/blueprint.js";
import {
 COOP_MAGNETIC_META, COOP_MAGNETIC_GUIDES, COOP_MAGNETIC_PARENT_CHILD_GUIDES, COOP_MAGNETIC_FRIEND_GUIDES,
 calculateMagneticNumber, prepareCooperationMagneticField, renderCooperationMagneticField, buildCooperationMagneticEntries
} from "../src/cooperation-magnetic-field.js";

test("O位合作磁场的1–9加法与化简不变",()=>{
 assert.equal(calculateMagneticNumber(6,4).number,1);
 assert.equal(calculateMagneticNumber(6,4).formula,"6＋4＝10→1");
 assert.equal(calculateMagneticNumber(7,3).number,1);
 assert.equal(calculateMagneticNumber(9,9).number,9);
 assert.equal(calculateMagneticNumber(9,9).formula,"9＋9＝18→9");
 assert.equal(calculateMagneticNumber(1,1).number,2);
 assert.equal(calculateMagneticNumber(0,4),null);
 assert.equal(calculateMagneticNumber(11,4),null);
 assert.equal(calculateMagneticNumber(1.2,4),null);
});

test("2000年生日O位9不同于生命数4，合作磁场须用O位9",()=>{
 const a="01/01/2000",b="21/11/1995";
 assert.equal(calculateHighPeakProfile(a).life.number,4);
 assert.equal(calculateBlueprint(a).mainPersonality,9);
 assert.equal(calculateBlueprint(b).mainPersonality,2);
 const value=prepareCooperationMagneticField(a,b,"cooperation",{mainA:4,mainB:2});
 assert.equal(value.mainA,9);
 assert.equal(value.mainB,2);
 assert.equal(value.numberInfo.number,2);
 assert.equal(value.numberInfo.formula,"9＋2＝11→2");
 assert.equal(value.calculationBasis,"O");
 assert.equal(value.method,"AURMOVA主性格O位合成（非原书生命数）");
 // 不能被缓存的旧数字或外部字段覆盖。
 const html=renderCooperationMagneticField(a,b,"cooperation",{mainA:4,mainB:2});
 assert.ok(html.includes("统一使用主性格O位"));
 assert.ok(html.includes("O=9"));
 assert.ok(html.includes("O=2"));
 assert.ok(html.includes("9＋2＝11→2"));
 assert.ok(html.includes("合作密码（性格磁场）2号"));
 assert.ok(!html.includes("4＋2＝6"));
 assert.ok(!html.includes("双方各自生命数"));
 assert.ok(!html.includes("路径"));
 assert.ok(!html.includes("合作密码（性格磁场）6号"));
});

test("原书生命数算法只留教材，实时界面不计算第二个结果",()=>{
 const records=buildCooperationMagneticEntries();
 assert.equal(records.length,10);
 assert.ok(COOP_MAGNETIC_META.formula.includes("O位"));
 assert.ok(COOP_MAGNETIC_META.textbookFormula.includes("33/6"));
 assert.ok(COOP_MAGNETIC_META.textbookFormula.includes("31/4"));
 assert.ok(records[0].text.includes("【原书不同算法·仅留档】"));
 assert.ok(records[0].text.includes("【AURMOVA正式算法】"));
 const active=renderCooperationMagneticField("01/01/2000","21/11/1995","cooperation");
 assert.ok(!active.includes("33/6"));
 assert.ok(!active.includes("31/4"));
 assert.ok(active.includes("与45组配对区别"));
});

test("9组合作磁场含义与9组独立儿童/朋友话术保留",()=>{
 for(const x of [COOP_MAGNETIC_GUIDES,COOP_MAGNETIC_PARENT_CHILD_GUIDES,COOP_MAGNETIC_FRIEND_GUIDES]){
  assert.deepEqual(Object.keys(x),["1","2","3","4","5","6","7","8","9"]);
 }
 for(let n=1;n<=9;n++){
  const a=COOP_MAGNETIC_GUIDES[n],b=COOP_MAGNETIC_PARENT_CHILD_GUIDES[n],c=COOP_MAGNETIC_FRIEND_GUIDES[n];
  assert.ok(a.sourceMeaning&&a.script&&a.questions.length>=2&&a.action,String(n));
  assert.ok(b.meaning&&b.script&&b.action&&b.question,String(n));
  assert.ok(c.meaning&&c.script&&c.action&&c.question,String(n));
 }
 assert.ok(COOP_MAGNETIC_GUIDES[6].sourceMeaning.includes("合财"));
 assert.ok(COOP_MAGNETIC_GUIDES[8].sourceMeaning.includes("压力"));
 assert.ok(COOP_MAGNETIC_GUIDES[9].sourceMeaning.includes("成功"));
});

test("夫妻／情侣不自动套合作磁场，但45组配对独立保留",()=>{
 const a="18/08/1985",b="21/11/1995";
 for(const relation of ["spouse","romance","伴侣／感情","marriage"]){
  assert.equal(prepareCooperationMagneticField(a,b,relation),null);
  assert.equal(renderCooperationMagneticField(a,b,relation),"");
 }
 assert.ok(COOP_MAGNETIC_META.scope.includes("夫妻／情侣"));
});

test("朋友使用亲密关系白话，不照搬生意版的合财结论",()=>{
 const a="18/08/1985",b="21/11/1995"; // O4+O2=6
 const coop=renderCooperationMagneticField(a,b,"cooperation",{aName:"Alpha",bName:"Beta"});
 const friend=renderCooperationMagneticField(a,b,"friendship",{aName:"Alpha",bName:"Beta"});
 assert.ok(coop.includes("合作密码（性格磁场）6号"));
 assert.ok(coop.includes("合财"));
 assert.ok(friend.includes("关怀与相互付出"));
 assert.ok(friend.includes("朋友关系合成6"));
 assert.ok(friend.includes("朋友版提醒"));
 assert.ok(!friend.includes("原书简写为「合财，能见钱」"));
 assert.notEqual(coop,friend);
});

test("亲子使用独立白话，不说孩子带财或放大事业",()=>{
 const a="18/08/1985",b="21/11/1995";
 const html=renderCooperationMagneticField(a,b,"parentChild",{
  aName:"A<script>",bName:"B&B",collapsed:true
 });
 assert.ok(html.includes("照顾与责任分担"));
 assert.ok(html.includes("没有所谓孩子会给父母带财"));
 assert.ok(html.includes("&lt;script&gt;"));
 assert.ok(html.includes("B&amp;B"));
 assert.ok(!html.includes("<script>"));
 assert.ok(!html.includes('<details class="foundation-block coop-magnetic-reading" open>'));
});

test("生日无效时不硬算；闰日按公历核对",()=>{
 for(const s of ["31/02/1995","00/10/1995","29/02/2023","invalid",""]){
  assert.equal(prepareCooperationMagneticField(s,"21/11/1995","friendship"),null,s);
 }
 assert.ok(prepareCooperationMagneticField("29/02/2024","21/11/1995","friendship"));
 assert.equal(renderCooperationMagneticField("","21/11/1995","cooperation"),"");
});
