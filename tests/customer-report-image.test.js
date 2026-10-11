import test from 'node:test';
import assert from 'node:assert/strict';
import {CUSTOMER_REPORT_TYPES,buildCustomerReport,wrapReportText,renderCustomerReportCanvases} from '../src/customer-report-image.js';
import {detailedReportSections} from '../src/customer-report-content.js';
import {calculateBlueprint} from '../src/engine/blueprint.js';
const customer={id:'a',name:'顾客甲',birthday:'02/01/1990',gender:'female',triangle:'PRIVATE_SENTINEL',consultation:'PRIVATE_SENTINEL'};
const other={name:'顾客乙',birthday:'06/05/2015',gender:'male'};
test('all five selected report projects produce their own titles',()=>{
 for(const type of Object.keys(CUSTOMER_REPORT_TYPES)){
  const report=buildCustomerReport({type,customer,other,year:2027});
  assert.equal(report.title,CUSTOMER_REPORT_TYPES[type]+' · 顾客报告');
  assert.equal(report.names.length,['life','year'].includes(type)?1:2);
  assert.ok(report.sections.length>=3);
 }
});
test('export whitelist excludes raw fields and birthdays unless selected',()=>{
 const report=buildCustomerReport({type:'life',customer,includeNumbers:false});
 assert.deepEqual(report.birthdays,[]);
 assert.ok(!report.subtitle.includes('号'));
 assert.ok(!JSON.stringify(report).includes('PRIVATE_SENTINEL'));
 assert.ok(!JSON.stringify(report).includes(customer.birthday));
 assert.deepEqual(buildCustomerReport({type:'family',customer,other,includeBirthday:true}).birthdays,[customer.birthday,other.birthday]);
});
test('selected annual year and custom client notes override defaults',()=>{
 const report=buildCustomerReport({type:'year',customer,year:2028,summary:'顾客确认的重点',action:'本周的具体约定',includeNumbers:false});
 assert.ok(report.subtitle.startsWith('2028 流年'));
 assert.ok(!report.subtitle.includes('个人流年'));
 assert.ok(report.sections.some(s=>s.body==='顾客确认的重点'));
 assert.ok(report.sections.some(s=>s.title==='约定的行动'&&s.body==='本周的具体约定'));
 assert.ok(!report.sections.some(s=>s.title==='本周行动'));
 assert.throws(()=>buildCustomerReport({type:'year',customer,year:2300}));
});
test('missing counterpart and excessive client copy are rejected',()=>{
 assert.throws(()=>buildCustomerReport({type:'relationship',customer}));
 assert.throws(()=>buildCustomerReport({type:'life',customer,summary:'长'.repeat(1201)}));
});
test('unicode wrapping preserves characters',()=>{
 const original='中文🙂报告测试';
 const lines=wrapReportText(original,t=>Array.from(t).length*10,30);
 assert.equal(lines.join(''),original);
 assert.ok(lines.every(s=>Array.from(s).length<=3));
});
test('full reports add substantial project-specific content while brief reports remain available',()=>{
 for(const type of Object.keys(CUSTOMER_REPORT_TYPES)){
  const full=buildCustomerReport({type,customer,other,year:2027});
  const brief=buildCustomerReport({type,customer,other,year:2027,detail:'brief'});
  assert.ok(full.sections.length>=11);
  assert.ok(full.sections.map(s=>s.body).join('').length>=500);
  assert.ok(brief.sections.length<=4);
  assert.ok(full.sections.some(s=>/七天|30天/.test(s.title)));
  assert.ok(!JSON.stringify(full).includes('PRIVATE_SENTINEL'));
 }
});
test('all nine personality and annual themes have usable detailed content',()=>{
 const people=new Map();
 for(let day=1;day<=28;day++){const birthday=String(day).padStart(2,'0')+'/01/1990';people.set(calculateBlueprint(birthday).mainPersonality,{...customer,birthday});}
 assert.equal(people.size,9);
 const distinct=new Set();
 for(const person of people.values()){
  const report=buildCustomerReport({type:'life',customer:person});
  distinct.add(report.sections.find(s=>s.title==='压力出现时，先看见什么').body);
  for(const year of [2026,2027,2028,2029,2030,2031,2032,2033,2034]){
   assert.ok(buildCustomerReport({type:'year',customer:person,year}).sections.every(s=>s.body));
  }
 }
 assert.equal(distinct.size,9);
});
test('family report distinguishes young children, school children, teenagers and adult children',()=>{
 const base=buildCustomerReport({type:'family',customer,other,detail:'brief'}).sections;
 for(const [birthday,expected] of [['01/01/2023','幼儿'],['01/01/2018','小学'],['01/01/2010','青少年'],['01/01/2000','成年子女']]){
  const sections=detailedReportSections({type:'family',a:6,b:1,base,customerName:'家长',otherName:'孩子',birthday,now:new Date('2026-10-11T12:00:00Z')});
  assert.ok(sections.find(s=>s.title==='孩子的发展阶段').body.startsWith(expected));
 }
});
test('pair-specific needs change when the selected counterpart changes',()=>{
 const a=buildCustomerReport({type:'cooperation',customer,other});
 const b=buildCustomerReport({type:'cooperation',customer,other:{...other,birthday:'01/01/1990'}});
 assert.notEqual(a.sections.find(s=>s.title.startsWith('双方差异')).body,b.sections.find(s=>s.title.startsWith('双方差异')).body);
});
test('long copy paginates at full image resolution and preserves all body lines',async()=>{
 const canvases=[];
 const document={fonts:{ready:Promise.resolve()},createElement(){
  const records=[];
  const ctx={font:'',fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},measureText(t){return {width:Array.from(t).length*43};},fillText(t,x,y){records.push({t,x,y});}};
  const canvas={records,getContext(){return ctx;}};canvases.push(canvas);return canvas;
 }};
 const body='测'.repeat(1200);
 const model=buildCustomerReport({type:'life',customer,summary:body,action:body});
 const result=await renderCustomerReportCanvases(model,{document});
 assert.ok(result.pages.length>=2);
 for(const canvas of canvases){assert.equal(canvas.width,2480);assert.equal(canvas.height,3508);assert.ok(canvas.records.every(r=>r.y<3508));}
 const drawn=canvases.flatMap(c=>c.records).filter(r=>/^测+$/.test(r.t));
 assert.equal(drawn.map(r=>r.t).join('').length,2400);
 assert.ok(drawn.every(r=>r.y<=3180));
});
