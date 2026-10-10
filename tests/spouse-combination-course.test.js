import test from "node:test";
import assert from "node:assert/strict";
import {calculateBlueprint,calculateHighPeakProfile} from "../src/engine/blueprint.js";
import {
 SPOUSE_COMBINATION_META,SPOUSE_COMBINATION_GUIDES,
 calculateSpouseCombinationNumber,prepareSpouseCombination,renderSpouseCombination,buildSpouseCombinationEntries
} from "../src/spouse-combination-course.js";

const husband="21/11/1995"; // 原书示例路径29→11→2
const wife="19/07/1970"; // 路径34→7

test("原书例子29/11/2与34/7的夫妻结合数字为9",()=>{
 assert.deepEqual(calculateHighPeakProfile(husband).life,{raw:29,path:[29,11,2],number:2});
 assert.deepEqual(calculateHighPeakProfile(wife).life,{raw:34,path:[34,7],number:7});
 const s=prepareSpouseCombination(husband,wife,"已婚夫妻");
 assert.equal(s.combined.number,9);
 assert.equal(s.combined.formula,"2＋7＝9");
 assert.equal(s.calculationBasis,"life-number");
 const html=renderSpouseCombination(husband,wife,"已婚夫妻",{aName:"丈夫",bName:"妻子"});
 for(const keyword of ["夫妻结合密码 9号","丈夫 生命数 29→11→2","妻子 生命数 34→7","2＋7＝9","Josephine可直接照读","主性格O位","45组配对"])assert.ok(html.includes(keyword),keyword);
});
test("必须选已婚夫妻，不把结婚公式自动套到情侣、家人和朋友",()=>{
 for(const type of ["伴侣／感情","家人","朋友","未婚情侣","cooperation",null,undefined]){
  assert.equal(prepareSpouseCombination(husband,wife,type),null);
  assert.equal(renderSpouseCombination(husband,wife,type),"");
 }
 assert.equal(prepareSpouseCombination(husband,wife,"已婚夫妻")?.combined?.number,9);
 assert.ok(SPOUSE_COMBINATION_META.scope.includes("明确选择"));
});
test("夫妻结合不能错误地使用O位或AURMOVA合作磁场",()=>{
 const Oa=calculateBlueprint(husband).mainPersonality;
 const Ob=calculateBlueprint(wife).mainPersonality;
 assert.equal(Oa,2);
 assert.equal(Ob,7);
 const first="01/01/2000";
 const realO=calculateBlueprint(first).mainPersonality;
 const life=calculateHighPeakProfile(first).life.number;
 assert.equal(realO,9);
 assert.equal(life,4);
 const result=prepareSpouseCombination(first,husband,"已婚夫妻");
 assert.equal(result.combined.number,6);
 assert.equal(result.combined.formula,"4＋2＝6");
 const html=renderSpouseCombination(first,husband,"已婚夫妻");
 assert.ok(html.includes("4＋2＝6"));
 assert.ok(!html.includes("9＋2＝11→2"));
 assert.ok(SPOUSE_COMBINATION_META.distinction.includes("合作磁场"));
});
test("夫妻1至9完整独立说明、双方追问、行动及反宿命论边界",()=>{
 assert.deepEqual(Object.keys(SPOUSE_COMBINATION_GUIDES),["1","2","3","4","5","6","7","8","9"]);
 assert.equal(buildSpouseCombinationEntries().length,10);
 const keys=["source","theme","strengths","friction","action","questions","script","week","unsupported"];
 for(let n=1;n<=9;n++){
  const item=SPOUSE_COMBINATION_GUIDES[n];
  for(const k of keys)assert.ok(item[k],String(n)+"号没有"+k);
  assert.ok(item.questions.length>=2,String(n)+"号未提供两个追问");
  assert.ok(item.script.length>120,String(n)+"号咨询白话较短");
 }
 assert.ok(SPOUSE_COMBINATION_GUIDES[4].unsupported.includes("离婚率低"));
 assert.ok(SPOUSE_COMBINATION_GUIDES[5].unsupported.includes("假花"));
 assert.ok(SPOUSE_COMBINATION_GUIDES[6].unsupported.includes("垃圾桶"));
 assert.ok(SPOUSE_COMBINATION_GUIDES[9].unsupported.includes("寿命"));
});
test("每个合成数字1至9均可以得到且顺序交换结果不变",()=>{
 for(let a=1;a<=9;a++)for(let b=1;b<=9;b++){
  const x=calculateSpouseCombinationNumber(a,b);
  assert.ok(x&&x.number>=1&&x.number<=9);
  assert.equal(x.number,calculateSpouseCombinationNumber(b,a).number);
 }
 const values=new Set();
 for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)values.add(calculateSpouseCombinationNumber(a,b).number);
 assert.deepEqual([...values].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9]);
 assert.equal(calculateSpouseCombinationNumber(9,9).number,9);
 assert.equal(calculateSpouseCombinationNumber(6,4).number,1);
 for(const val of [0,-1,10,1.2,NaN,null,undefined])assert.equal(calculateSpouseCombinationNumber(val,2),null);
});
test("无效生日或空值不假造结果；有效闰日可计算",()=>{
 for(const birthday of ["","invalid","31/02/1995","29/02/2023","00/01/1999","32/01/1999"]){
  assert.equal(prepareSpouseCombination(birthday,husband,"已婚夫妻"),null,birthday);
 }
 assert.ok(prepareSpouseCombination("29/02/2024",husband,"已婚夫妻"));
});
test("姓名转义和教学资料只在私人版，并无宿命性许诺",()=>{
 const html=renderSpouseCombination(husband,wife,"已婚夫妻",{aName:"A<script>",bName:"B&B"});
 assert.ok(html.includes("A&lt;script&gt;"));
 assert.ok(html.includes("B&amp;B"));
 assert.ok(!html.includes("<script>"));
 assert.ok(SPOUSE_COMBINATION_META.privacy.includes("私人后台"));
 assert.ok(SPOUSE_COMBINATION_META.safeguarding.includes("不能从数字推出"));
 assert.ok(html.includes("教材观点不等于事实预测"));
});
