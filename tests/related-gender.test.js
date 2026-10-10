import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const source=fs.readFileSync(new URL("../src/v6-enhancements.js",import.meta.url),"utf8");
const core=source.slice(source.indexOf("const RELATED_NAME_FIELDS"),source.indexOf("function partnerRow"));
const helpers=source.slice(source.indexOf("function relatedPersonHasData"),source.indexOf("function cooperationPanel"));
function context(doc={}){
 const c={esc:v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])),document:{addEventListener:()=>{},querySelectorAll:()=>[],...doc}};
 vm.createContext(c);vm.runInContext(core+helpers,c);return c;
}
test("each person has an explicit gender selection; father and mother roles do not guess it",()=>{
 const c=context();
 for(const key of ["partner:0","partner:3","child:0","child:4","father","mother"]){
 const html=c.relatedNameFields({},key);
 assert.ok(html.includes('data-related-name-key="'+key+'" data-related-name-field="gender" required'));
 assert.ok(html.includes('value="" selected'));assert.ok(!html.includes('value="男" selected'));assert.ok(!html.includes('value="女" selected'));
 }
 assert.ok(c.relatedNameFields({gender:"女"},"partner:0").includes('value="女" selected'));
});
test("partner drafts retain each person's own gender and existing metadata",()=>{
 const fields=["女","男"].map((gender,i)=>({dataset:{relatedNameKey:"partner:"+i,relatedNameField:"gender"},value:gender}));
 const cards=["A","B"].map((name,i)=>({dataset:{v6Partner:String(i)},querySelector:s=>({value:s.includes("name")?name:"01/01/1990"})}));
 const c=context({querySelectorAll:s=>s==="[data-v6-partner]"?cards:fields});
 c.loadPartners=()=>[{note:"keep-a",gender:"男"},{note:"keep-b",gender:"女"}];
 const draft=c.collectRelatedGenderDrafts({id:"1"},"cooperation");
 assert.equal(draft[0].gender,"女");assert.equal(draft[1].gender,"男");assert.equal(draft[0].note,"keep-a");
});
test("missing gender blocks save and points at the specific person; empty parent placeholders are allowed",()=>{
 const selects=["partner:0","partner:1","father","mother","child:0"].map(key=>({dataset:{relatedNameKey:key},nextElementSibling:{textContent:""},focus(){this.focused=true;},reportValidity(){this.reported=true;}}));
 const c=context({querySelectorAll:()=>selects});
 c.collectRelatedGenderDrafts=()=>[{name:"A",gender:"女"},{name:"B",gender:""}];
 assert.equal(c.validateRelatedGenders({id:"1"},"cooperation"),false);
 assert.equal(selects[1].focused,true);assert.ok(selects[1].nextElementSibling.textContent.includes("选择性别"));
 c.collectRelatedGenderDrafts=()=>({father:{},mother:{},children:[{name:"Child",gender:"男"}]});
 assert.equal(c.validateRelatedGenders({id:"1"},"family"),true);
 c.collectRelatedGenderDrafts=()=>({father:{name:"Parent",gender:""},mother:{},children:[]});
 assert.equal(c.validateRelatedGenders({id:"1"},"family"),false);assert.equal(selects[2].reported,true);
});
