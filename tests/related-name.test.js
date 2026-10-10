import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import * as engine from "../src/engine/blueprint.js";
const source=fs.readFileSync(new URL("../src/v6-enhancements.js",import.meta.url),"utf8");
const helpers=source.slice(source.indexOf("const RELATED_NAME_FIELDS"),source.indexOf("function partnerRow"));
function setup(fields=[]){
 const context={...engine,esc:v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])),
 EXPRESSION_NUMBER_LIBRARY:{},INNER_DRIVE_NUMBER_LIBRARY:{},
 document:{querySelectorAll:()=>fields}};
 vm.createContext(context);vm.runInContext(helpers,context);return context;
}
test("all related people use official/current/former name and the existing transition rule",()=>{
 const c=setup(), p={name:"Nickname",officialName:"ALICE TAN",formerName:"MARY LIM",nameChangedYear:String(new Date().getFullYear()-1)};
 const input=c.relatedNameInput(p);
 for(const calculate of [engine.calculateExpressionProfile,engine.calculateInnerDriveProfile,engine.calculateTemperamentProfile]){
 const actual=calculate(input), expected=calculate({displayName:p.name,officialName:p.officialName,formerName:p.formerName,nameChangedYear:p.nameChangedYear});
 assert.equal(actual.primary.compound,expected.primary.compound);
 assert.equal(actual.primary.input,p.formerName);
 }
 assert.equal(engine.calculateExpressionProfile(c.relatedNameInput({name:"ALICE TAN"})).primary.input,"ALICE TAN");
});
test("saving related name fields preserves prior record and isolates each person",()=>{
 const fields=[{dataset:{relatedNameKey:"child:1",relatedNameField:"officialName"},value:" ALICE TAN "},{dataset:{relatedNameKey:"child:0",relatedNameField:"officialName"},value:"MARY LIM"},{dataset:{relatedNameKey:"child:1",relatedNameField:"formerName"},value:" JANE TAN "}];
 const c=setup(fields),p=c.readRelatedNameFields("child:1",{name:"Child",birthday:"01/01/2018",note:"keep"});
 assert.equal(p.officialName,"ALICE TAN");assert.equal(p.formerName,"JANE TAN");assert.equal(p.note,"keep");assert.equal(p.birthday,"01/01/2018");
});
test("both names are calculated and comparisons use distinct consultation contexts",()=>{
 const c=setup(),a={name:"A",officialName:"ALICE TAN"},b={name:"B",officialName:"MARY LIM"};
 for(const [mode,label] of [["cooperation","合作分工与决策"],["relationship","关系沟通与需要"],["family","亲子沟通与学习支持"]]){
 const html=c.relatedNamePairPanel(a,b,mode);
 assert.ok(html.includes("ALICE TAN"));assert.ok(html.includes("MARY LIM"));assert.ok(html.includes(label));
 assert.ok(html.includes(engine.calculateExpressionProfile(c.relatedNameInput(b)).primary.compound));
 }
 assert.ok(c.relatedNamePairPanel(a,{name:""}, "family").includes("姓名资料还不完整"));
 assert.ok(!c.relatedNameFields({officialName:'<img src=x>'},"partner:0").includes('value="<img'));
});
test("all three input flows save formal name metadata and relationship inner drive uses the shared source",()=>{
 assert.ok(source.includes('readRelatedNameFields("relation"'));
 assert.ok(source.includes('readRelatedNameFields("partner:"+i'));
 assert.ok(source.includes('readRelatedNameFields("father"'));
 assert.ok(source.includes('readRelatedNameFields("mother"'));
 assert.ok(source.includes('readRelatedNameFields("child:"+i'));
 assert.ok(source.includes('const bCalc=calculateInnerDriveProfile(relatedNameInput(r))'));
 new vm.Script(source.replace(/^import .*;$/gm,""));
});
