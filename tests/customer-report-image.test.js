import test from 'node:test';
import assert from 'node:assert/strict';
import {CUSTOMER_REPORT_TYPES,buildCustomerReport,wrapReportText,renderCustomerReportCanvases} from '../src/customer-report-image.js';
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
