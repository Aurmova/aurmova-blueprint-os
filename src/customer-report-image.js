// Customer-visible report whitelist and high-resolution PNG renderer.
import {calculateBlueprint,calculateGoldenYearSnapshot,activeFlowYear,flowYearRange} from "./engine/blueprint.js?v=54";
export const CUSTOMER_REPORT_TYPES={life:"人生蓝图",year:"黄金流年蓝图",relationship:"关系蓝图",family:"亲子蓝图",cooperation:"合作蓝图"};
const PUBLIC_PERSONALITY={
 1:{strength:"自主、主动与推动事情的能力。",watch:"需要留意自己推进得很快时，别人是否有参与和表达的空间。",action:"选一件想推进的小事，写清目标与第一步；同时邀请相关的人说出需要。",communication:"更容易接住清楚的重点、选择与自主空间。"},
 2:{strength:"观察感受、倾听与协调的能力。",watch:"关照别人时，也要确认自己的意愿、需要与界线。",action:"练习先说出一个真实需要，再决定怎样配合别人。",communication:"可以先确认感受与需要，再说明希望怎样配合。"},
 3:{strength:"表达、创意与让交流更有活力的能力。",watch:"想法和情绪很多时，需要把重点落到具体行动。",action:"把一个想法拆成可以完成的小步骤，并选一个平静时段讲清需要。",communication:"给表达和分享留空间，再一起抓住一个明确重点。"},
 4:{strength:"建立秩序、稳步执行与重视细节的能力。",watch:"重视确定感时，也要允许合理调整和不同的方法。",action:"保留一项稳定习惯，同时为变化准备一个可接受的替代方案。",communication:"把规则、步骤和时间讲清楚，也说明哪里可以商量。"},
 5:{strength:"适应变化、探索与尝试不同方法的能力。",watch:"选择很多时，需要分清值得坚持的方向与临时冲动。",action:"为一次尝试设小范围、期限与复盘时间，再决定要不要继续。",communication:"提供可接受的选择，并说清自由与责任的范围。"},
 6:{strength:"照顾、责任与重视关系品质的能力。",watch:"承担责任时，需要区分支持、包办和自己的休息。",action:"列出一项愿意承担的责任，以及一项需要协商分担的任务。",communication:"认可具体付出，再讨论责任和支持怎样分配。"},
 7:{strength:"思考、观察与深入理解问题的能力。",watch:"想清楚很重要，也需要让别人知道自己正在考虑什么。",action:"为一件事设思考期限；先说出已经确定的一部分，再补充后续判断。",communication:"给整理思路的时间，再邀请对方说出考虑依据。"},
 8:{strength:"安排资源、推动成果与承担任务的能力。",watch:"关注结果时，也要看见过程、感受与分工是否公平。",action:"写清一项目标、资源与职责；复盘时同时看成果和合作体验。",communication:"明确目标与责任，再核对压力、资源和支持。"},
 9:{strength:"理解整体、同理与连结不同观点的能力。",watch:"顾及整体时，需要把理想落实到自己的范围与行动。",action:"从一个值得投入的方向选出本周能完成的小行动。",communication:"先对齐共同方向，再明确每个人能负责的一小步。"}
};
const PUBLIC_YEAR={
 1:["主动开启","整理目标与新的尝试。","避免同时启动太多事情。","选择一个重点，先完成可验证的第一步。"],
 2:["合作与耐心","沟通、协调与关系经营。","不要因为顾关系而忽略自己的需要。","确认一项合作的角色、界线与节奏。"],
 3:["表达与创意","让想法被理解，也把创意落实。","留意注意力分散与情绪化表达。","选一个想法，完成一个小成果。"],
 4:["基础与秩序","流程、习惯与长期基础。","避免把计划当成不能调整的规定。","整理一个最影响效率的日常流程。"],
 5:["变化与探索","观察变化，尝试新的方法。","先评估条件，减少冲动切换。","小范围试行，并约定复盘时间。"],
 6:["责任与品质","家庭、关系、服务与承诺。","区分自己的责任与过度承担。","协商一项分工，保留必要的休息。"],
 7:["整理与深化","思考、学习与打磨专业。","避免一直分析而迟迟不表达。","完成一项学习，并实践一次。"],
 8:["成果与资源","目标、执行与资源配置。","避免只看成果而忽视过程成本。","复盘时间、资源和结果，再调整重点。"],
 9:["收尾与整合","整理经验，完成阶段任务。","别为了维持旧安排而忽略现实需要。","完成一项收尾，再决定下一步保留什么。"]
};
function mainOf(person){
 if(!person?.birthday)return null;
 try{return calculateBlueprint(person.birthday)?.mainPersonality||null;}catch{return null;}
}
export function buildCustomerReport({type,customer={},other={},year,includeNumbers=true,includeBirthday=false,summary="",action=""}){
 if(!CUSTOMER_REPORT_TYPES[type])throw new Error("请选择有效的报告项目。");
 const paired=["relationship","family","cooperation"].includes(type);
 if(!String(customer.name||"").trim()||!customer.birthday)throw new Error("先保存顾客姓名与生日。");
 if(paired&&(!String(other.name||"").trim()||!other.birthday))throw new Error("先保存所选双方的姓名与生日。");
 const a=mainOf(customer),b=paired?mainOf(other):null;
 if(!a||(paired&&!b))throw new Error("生日资料无法计算，请先检查档案。");
 const p=PUBLIC_PERSONALITY[a],q=PUBLIC_PERSONALITY[b];
 if(String(customer.name).length>100||(paired&&String(other.name).length>100))throw new Error("报告姓名请控制在100字以内。");
 if(String(summary).length>1200||String(action).length>1200)throw new Error("总结与行动建议各请控制在1200字以内。");
 const names=paired?[String(customer.name),String(other.name)]:[String(customer.name)];
 let subtitle="",sections=[];
 if(type==="life"){
 subtitle=includeNumbers?"主性格 "+a+"号｜自我认识与行动梳理":"自我认识与行动梳理";
 sections=[{title:"自然优势 · 观察方向",body:p.strength},{title:"需要留意的模式",body:p.watch},{title:"本周行动",body:p.action}];
 }else if(type==="year"){
 const target=Number(year)||activeFlowYear();
 if(!Number.isInteger(target)||target<1900||target>2200)throw new Error("请输入1900–2200之间的流年年度。");
 const snap=calculateGoldenYearSnapshot(customer.birthday,target),n=snap.personal.number,v=PUBLIC_YEAR[n],range=flowYearRange(target);
 subtitle=target+" 流年｜"+range.start+" 至 "+range.end+(includeNumbers?"｜个人流年 "+n+"号":"");
 sections=[{title:"年度关注方向 · "+v[0],body:v[1]},{title:"需要留意",body:v[2]},{title:"本周行动",body:v[3]},{title:"使用方式",body:"年度主题用于安排关注重点，不代表某一年必然发生某件事；请结合现实条件、已有计划与实际进展调整。"}];
 }else{
 const contexts={relationship:["理解彼此 · 沟通与相处","表达需要与相处节奏","各说一个希望对方具体做到的行为，并确认双方愿意实践的范围。"],
 family:["理解孩子 · 亲子沟通与支持","家长怎么说，孩子怎样接得住","选一个年龄合适的小任务，让孩子先试；家长给清楚的一步指引，并具体回应努力。"],
 cooperation:["认识搭档 · 分工与沟通","双方分工与交接方式","选一项任务写清负责人、交付标准、期限和验收人，再约定复盘时间。"]};
 const ctx=contexts[type];subtitle=ctx[0];
 const first=type==="family"?"家长的沟通方式 · 待验证":"第一位的沟通方式 · 待验证";
 const second=type==="family"?"孩子的回应与支持 · 待验证":"第二位的沟通方式 · 待验证";
 sections=[{title:first,body:customer.name+"："+p.communication},
 {title:second,body:other.name+"："+q.communication},
 {title:ctx[1],body:a===b?"双方观察方向相近，可以验证共同需要是否被看见；相近也可能让两个人重复承担同一角色。":"双方观察方向不同，可以先找互补，也确认哪一个说话或行动差异容易产生误会。"},
 {title:"共同练习",body:ctx[2]}];
 }
 if(summary.trim())sections.splice(sections.length-1,0,{title:"本次咨询总结",body:String(summary).trim()});
 if(action.trim())sections=sections.filter(s=>!["本周行动","共同练习"].includes(s.title)).concat({title:"约定的行动",body:String(action).trim()});
 // Build only explicitly allowed output fields. Never spread the raw customer or internal blueprint.
 return {type,title:CUSTOMER_REPORT_TYPES[type]+" · 顾客报告",names,subtitle,
 birthdays:includeBirthday?[String(customer.birthday),...(paired?[String(other.birthday)]:[])]:[],
 sections,footer:"本报告用于自我认识与行动梳理；实际情况与个人选择为准。"};
}
export function wrapReportText(text,measure,maxWidth){
 const lines=[];
 for(const paragraph of String(text||"").split("\n")){
 let line="";
 for(const char of Array.from(paragraph)){
 if(line&&measure(line+char)>maxWidth){lines.push(line);line=char;}else line+=char;
 }
 lines.push(line);
 }
 return lines;
}
export async function renderCustomerReportCanvases(model,{document:doc=globalThis.document,logoUrl=""}={}){
 await doc.fonts?.ready;
 const W=2480,H=3508,margin=170,width=W-margin*2,limit=3180;
 let logo=null;
 if(logoUrl&&typeof Image!=="undefined"){
 logo=await new Promise(resolve=>{
 const img=new Image();img.crossOrigin="anonymous";const timer=setTimeout(()=>resolve(null),5000);
 img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);resolve(null);};img.src=logoUrl;
 });
 }
 const pages=[];let ctx,y;
 const font=(size,weight="400")=>weight+" "+size+'px "Noto Serif TC", "PingFang SC", "Microsoft YaHei", sans-serif';
 function text(text,size,weight,x,pos){
 ctx.font=font(size,weight);ctx.fillText(text,x,pos);
 }
 function newPage(){
 const canvas=doc.createElement("canvas");canvas.width=W;canvas.height=H;
 ctx=canvas.getContext("2d");if(!ctx)throw new Error("当前浏览器无法生成报告图。");
 pages.push(canvas);ctx.fillStyle="#fffdf9";ctx.fillRect(0,0,W,H);
 ctx.strokeStyle="#c0a577";ctx.lineWidth=3;ctx.strokeRect(100,100,W-200,H-200);
 if(logo){const ratio=Math.min(190/logo.width,190/logo.height);ctx.drawImage(logo,margin,160,logo.width*ratio,logo.height*ratio);}
 ctx.fillStyle="#9c7f4d";text("AURMOVA",70,"600",logo?margin+230:margin,260);
 text("JOSEPHINE TAN  ·  CONSULTATION REPORT",25,"400",margin,340);
 ctx.fillStyle="#342e27";y=460;
 ctx.font=font(68,"600");
 for(const line of wrapReportText(model.title,t=>ctx.measureText(t).width,width)){ctx.fillText(line,margin,y);y+=90;}
 ctx.font=font(50,"500");
 for(const line of wrapReportText(model.names.join(" × "),t=>ctx.measureText(t).width,width)){ctx.fillText(line,margin,y);y+=70;}
 ctx.fillStyle="#796b58";ctx.font=font(33);
 for(const line of wrapReportText(model.subtitle,t=>ctx.measureText(t).width,width)){ctx.fillText(line,margin,y);y+=48;}
 if(model.birthdays.length){text("生日："+model.birthdays.join(" / "),32,"400",margin,y);y+=48;}
 y+=40;ctx.strokeStyle="#e6ddcf";ctx.beginPath();ctx.moveTo(margin,y);ctx.lineTo(W-margin,y);ctx.stroke();y+=90;
 }
 newPage();
 for(const section of model.sections){
 if(y+170>limit)newPage();
 ctx.fillStyle="#9c7f4d";text(section.title,46,"600",margin,y);y+=80;
 ctx.font=font(43);ctx.fillStyle="#342e27";
 const lines=wrapReportText(section.body,t=>ctx.measureText(t).width,width);
 for(const line of lines){
 if(y>limit){
 newPage();ctx.fillStyle="#9c7f4d";text(section.title+"（续）",46,"600",margin,y);y+=80;ctx.font=font(43);ctx.fillStyle="#342e27";
 }
 ctx.fillText(line,margin,y);y+=70;
 }
 y+=65;
 }
 for(let i=0;i<pages.length;i++){
 const c=pages[i].getContext("2d");c.fillStyle="#796b58";c.font=font(27);
 c.fillText(model.footer,margin,3320);c.font=font(28);
 c.fillText("AURMOVA  ·  "+(i+1)+" / "+pages.length,margin,3380);
 }
 return {pages,logoLoaded:!!logo};
}
const e=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function mountCustomerReportTool(panel,{customer,defaultType="life",defaultYear=activeFlowYear(),getPairs=()=>[]}){
 const root=panel.ownerDocument.createElement("details");
 root.className="customer-report-tool";
 const key="aurmova.customerReportOptions."+customer.id;
 let saved={};try{saved=JSON.parse(localStorage.getItem(key)||"{}")||{};}catch{}
 const type=Object.hasOwn(CUSTOMER_REPORT_TYPES,defaultType)?defaultType:"life";
 root.innerHTML='<summary>生成顾客报告图｜切换项目、预览、下载</summary><div class="report-controls"><p>先保存最新顾客资料。报告项目由你选择，预览并确认内容后才能下载。</p><label>要给顾客哪一种报告<select data-report-type>'+Object.entries(CUSTOMER_REPORT_TYPES).map(([id,title])=>'<option value="'+id+'" '+(id===type?"selected":"")+'>'+title+'</option>').join("")+'</select></label><label data-report-year-wrap>流年年度<input data-report-year type="number" min="1900" max="2200" value="'+e(defaultYear)+'"></label><label data-report-pair-wrap>报告中的双方<select data-report-pair></select></label><label><input type="checkbox" data-report-numbers checked>人生／流年报告显示主性格或个人流年号码</label><label><input type="checkbox" data-report-birthday>报告显示生日</label><label>本次咨询总结（可自行修改）<textarea rows="3" maxlength="1200" data-report-summary placeholder="只写你决定给顾客看的重点"></textarea></label><label>约定的行动（可自行修改）<textarea rows="3" maxlength="1200" data-report-action placeholder="例如：本周先练习一次清楚表达需要"></textarea></label><button type="button" class="btn btn-primary" data-report-preview>生成报告预览</button><p data-report-status role="status" aria-live="polite"></p><div data-report-images></div><label><input type="checkbox" data-report-confirm disabled>我已检查以上内容，确认可以交给顾客</label><div data-report-downloads></div><p class="panel-note">高清PNG：每页2480 × 3508像素，适合A4打印。手机也可长按预览图保存。三角形、联合码、父母基因、坐镇码、姓名算法和咨询提词不会自动放入顾客报告。</p></div>';
 const style=panel.ownerDocument.createElement("style");
 style.textContent=".customer-report-tool{border:1px solid #c9b38c;border-radius:12px;margin:0 0 22px;padding:16px;background:#fffdf9}.customer-report-tool summary{font-weight:650;cursor:pointer;color:#80633b}.report-controls>label{display:block;margin:15px 0}.report-controls select,.report-controls input[type=number],.report-controls textarea{display:block;width:100%;box-sizing:border-box;padding:10px;margin-top:7px;border:1px solid #d6c39b;border-radius:8px;background:white;font:inherit}.report-controls input[type=checkbox]{margin-right:8px}.report-controls img{display:block;max-width:100%;height:auto;border:1px solid #e6ddcf;margin:12px 0}.report-controls [data-report-downloads] a{display:inline-block;margin:6px;padding:12px 18px;background:#a68750;color:white;border-radius:8px;text-decoration:none}";
 root.prepend(style);panel.prepend(root);
 const $=s=>root.querySelector(s),status=$("[data-report-status]"),images=$("[data-report-images]"),downloads=$("[data-report-downloads]"),confirmation=$("[data-report-confirm]");
 let urls=[],prepared=[],busy=false,revision=0;
 function revoke(){for(const url of urls)URL.revokeObjectURL(url);urls=[];prepared=[];}
 function invalidate(){
 revision++;revoke();images.replaceChildren();downloads.replaceChildren();confirmation.checked=false;confirmation.disabled=true;
 status.textContent="内容已修改，请重新生成预览。";
 }
 function draftKey(){
 const type=$("[data-report-type]").value,pair=getPairs(type)[Number($("[data-report-pair]").value)];
 return JSON.stringify([type,pair?.a?.name||customer.name,pair?.a?.birthday||customer.birthday,pair?.b?.name||"",pair?.b?.birthday||""]);
 }
 function saveDraft(){
 saved.drafts=saved.drafts||{};saved.drafts[draftKey()]={summary:$("[data-report-summary]").value,action:$("[data-report-action]").value};
 localStorage.setItem(key,JSON.stringify(saved));
 }
 function restoreDraft(){
 const draft=saved.drafts?.[draftKey()]||{};$("[data-report-summary]").value=draft.summary||"";$("[data-report-action]").value=draft.action||"";
 }
 function updateControls(){
 const selected=$("[data-report-type]").value,paired=["relationship","family","cooperation"].includes(selected);
 $("[data-report-year-wrap]").hidden=selected!=="year";$("[data-report-pair-wrap]").hidden=!paired;
 $("[data-report-pair]").innerHTML=getPairs(selected).map((pair,i)=>'<option value="'+i+'">'+e(pair.label)+'</option>').join("");
 restoreDraft();
 }
 updateControls();
 root.addEventListener("input",event=>{
 if(event.target.matches("[data-report-summary],[data-report-action]"))saveDraft();
 if(event.target!==confirmation)invalidate();
 });
 root.addEventListener("change",event=>{
 if(event.target===confirmation){
 downloads.replaceChildren();
 if(confirmation.checked)for(const item of prepared){
 const link=panel.ownerDocument.createElement("a");link.href=item.url;link.download=item.filename;link.textContent="下载报告图 · 第"+item.page+"页";downloads.append(link);
 }
 return;
 }
 if(event.target.matches("[data-report-type]"))updateControls();
 if(event.target.matches("[data-report-pair]"))restoreDraft();
 invalidate();
 });
 $("[data-report-preview]").addEventListener("click",async()=>{
 if(busy)return;busy=true;const button=$("[data-report-preview]");button.disabled=true;invalidate();status.textContent="正在生成高清报告图…";const token=revision;
 try{
 const selected=$("[data-report-type]").value,paired=["relationship","family","cooperation"].includes(selected);
 const pair=paired?getPairs(selected)[Number($("[data-report-pair]").value)]:null;
 if(paired&&!pair)throw new Error("先保存所选项目的双方资料。");
 const model=buildCustomerReport({type:selected,customer:pair?.a||customer,other:pair?.b||{},year:$("[data-report-year]").value,includeNumbers:$("[data-report-numbers]").checked,includeBirthday:$("[data-report-birthday]").checked,summary:$("[data-report-summary]").value,action:$("[data-report-action]").value});
 const logoUrl=panel.ownerDocument.querySelector(".brand-logo")?.src||"";
 const result=await renderCustomerReportCanvases(model,{document:panel.ownerDocument,logoUrl});
 if(token!==revision)return;
 for(let i=0;i<result.pages.length;i++){
 const blob=await new Promise(resolve=>result.pages[i].toBlob(resolve,"image/png"));
 if(token!==revision)return;
 if(!blob)throw new Error("报告图未生成，请重试。");
 const url=URL.createObjectURL(blob);urls.push(url);
 const img=panel.ownerDocument.createElement("img");img.src=url;img.alt=model.title+" · 第"+(i+1)+"页";images.append(img);
 prepared.push({url,page:i+1,filename:"AURMOVA_"+CUSTOMER_REPORT_TYPES[selected]+"_"+model.names.join("_").replace(/[^a-zA-Z0-9\u3400-\u9fff_-]/g,"_")+(selected==="year"?"_"+$("[data-report-year]").value:"")+"_"+(i+1)+".png"});
 }
 confirmation.disabled=false;status.textContent="已生成 "+result.pages.length+" 页。检查内容后勾选确认，即可下载。"+(logoUrl&&!result.logoLoaded?" LOGO未载入，本次使用AURMOVA品牌文字。":"");
 }catch(error){revoke();images.replaceChildren();downloads.replaceChildren();status.textContent=error.message;}
 finally{busy=false;button.disabled=false;}
 });
}
