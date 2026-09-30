import { calculateBlueprint, ageFromBirthday, phaseForAge, calculateYearCycleSet, PHASE_META } from "./engine/blueprint.js?v=20260930-v6";
import { ENERGY_LIBRARY, describeEnergySet } from "./energy-library.js?v=20260930-v6";
import { PERSONALITY_LIBRARY } from "./personality-library.js?v=20260930-v6";
import { findJointCode } from "./aurmova-knowledge.js?v=20260930-v6";
import { getKnowledge as getFlootKnowledge, MAIN_DETAIL, DIGIT_CORE, TALK_QUESTIONS } from "./floot-knowledge.js?v=20260930-v7";

const DIGITS=[1,2,3,4,5,6,7,8,9];
const customerKey="aurmova.customers";
const partnerKey=id=>"aurmova.partners."+id;
const consultationKey=id=>"aurmova.consultation."+id;
const loadConsultation=id=>{try{return JSON.parse(localStorage.getItem(consultationKey(id))||"{}")}catch{return{}}};
const saveConsultation=(id,data)=>localStorage.setItem(consultationKey(id),JSON.stringify(data));
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const code=arr=>Array.isArray(arr)?arr.join(""):"";
const loadCustomers=()=>{try{return JSON.parse(localStorage.getItem(customerKey)||"[]")}catch{return[]}};
const saveCustomers=v=>localStorage.setItem(customerKey,JSON.stringify(v));
const loadPartners=id=>{try{return JSON.parse(localStorage.getItem(partnerKey(id))||"[]")}catch{return[]}};
const savePartners=(id,v)=>localStorage.setItem(partnerKey(id),JSON.stringify(v));
const currentId=()=>new URLSearchParams((location.hash.split("?")[1]||"")).get("id");
const currentCustomer=()=>loadCustomers().find(x=>String(x.id)===String(currentId()));

function groupList(v){return [code(v.cause),code(v.process1),code(v.process2),code(v.result)]}
function pill(n,type){return '<span class="energy-pill '+type+'">'+n+'</span>'}
function energyBlock(scan,scope){
  const info=describeEnergySet(scan,scope);
  const present=info.present.map(x=>pill(x.number,"present")).join("")||'<span class="energy-empty">无</span>';
  const missing=info.missing.map(x=>pill(x.number,"missing")).join("")||'<span class="energy-empty">无</span>';
  const repeated=info.repeated.map(x=>pill(x.number,"repeated")).join("")||'<span class="energy-empty">无</span>';
  const notes=(info.missing.length?info.missing:[{number:"✓",name:"没有明显缺失",low:"这一层1–9都有出现，继续结合位置与重复次数判断。"}]).map(x=>'<div><strong>'+esc(x.number)+' · '+esc(x.name)+'</strong><span>'+esc(x.low)+'</span></div>').join("");
  return '<article class="card energy-card"><div class="energy-head"><div><small>SYSTEM DERIVATION</small><h3>'+esc(info.title)+'</h3></div><span>'+esc((scan.values||[]).join(" · "))+'</span></div><p>'+esc(info.note)+'</p><div class="energy-line"><b>拥有的能量</b><div>'+present+'</div></div><div class="energy-line"><b>缺少的能量</b><div>'+missing+'</div></div><div class="energy-line"><b>重复放大的能量</b><div>'+repeated+'</div></div><div class="energy-meaning-grid">'+notes+'</div></article>';
}
function jointBlock(c,label){
  const structured=getFlootKnowledge(c);
  const legacy=findJointCode(c);
  let body="";
  let source="系统计算结果";
  if(structured){
    source="Floot × AURMOVA 结构化资料";
    body='<h4>'+esc(structured.title||c)+'</h4>'
      +'<p><b>核心逻辑：</b>'+esc(structured.logic||"")+'</p>'
      +'<p><b>正向优势：</b>'+esc(structured.strengths||"")+'</p>'
      +'<p><b>常见卡点：</b>'+esc(structured.challenges||"")+'</p>'
      +(structured.order?'<p><b>顺序差异：</b>'+esc(structured.order)+'</p>':"")
      +'<p><b>成长方向：</b>'+esc(structured.growth||"")+'</p>'
      +(structured.positions?'<p><b>位置资料：</b>'+esc(structured.positions)+'</p>':"")
      +(structured.script?'<div class="question-box"><b>Josephine 可直接照读：</b><br>'+esc(structured.script)+'</div>':"")
      +((TALK_QUESTIONS[c]||[]).map((q,i)=>'<p><b>追问 '+(i+1)+'：</b>'+esc(q)+'</p>').join(""));
  }else if(legacy&&legacy.text){
    source="AURMOVA 旧版资料库";
    body='<p>'+esc(legacy.text).replace(/\n/g,"<br>")+'</p>';
  }else{
    body='<p>这组号码已经由公式计算出来，详细原始课程资料仍按来源逐条复核，不会用AI臆测冒充原始课程内容。</p>';
  }
  return '<details class="joint-entry"><summary><span><b>'+esc(c)+'</b> · '+esc(label)+'</span><span>'+(structured||legacy?"已有资料":"待复核")+'</span></summary><div class="joint-body"><div class="source-tag">'+source+'</div>'+body+'</div></details>';
}
function phaseDetails(a,name){
  const v=a.phases[name],m=PHASE_META[name],groups=groupList(v),labels=m.groupLabels;
  return '<div class="phase-detail-title"><div><small>'+esc(m.label)+' · '+esc(m.theme)+'</small><h3>'+esc(m.description)+'</h3></div><span>因果 → 过程 → 结果</span></div><div class="phase-code-grid">'+groups.map((g,i)=>'<div><small>'+esc(labels[i])+'</small><strong>'+g+'</strong></div>').join("")+'</div><div class="joint-stack">'+groups.map((g,i)=>jointBlock(g,labels[i])).join("")+'</div>';
}
function phaseButtons(a,current){
  return Object.entries(a.phases).map(([name,v])=>{
    const m=PHASE_META[name];
    return '<button type="button" class="phase-card '+(name===current?"current selected":"")+'" data-v6-phase="'+name+'"><small>'+name+(name===current?" · 当前":"")+'</small><b>'+esc(m.theme)+'</b><span>因果 '+code(v.cause)+'</span><span>过程 '+code(v.process1)+' · '+code(v.process2)+'</span><span>结果 '+code(v.result)+'</span><em>点击查看完整解析 →</em></button>';
  }).join("");
}
function yearPanel(c,target){
  const set=calculateYearCycleSet(c.birthday,target||new Date().getFullYear());
  const cards=[["去年",set.previous],["今年",set.current],["明年",set.next]].map(([label,y])=>'<article class="year-card '+(label==="今年"?"current-year":"")+'"><small>'+label+'</small><h3>'+y.year+' · 流年 '+y.number+'</h3><b>'+esc(y.title)+'</b><p>'+esc(y.summary)+'</p></article>').join("");
  return '<div class="module-render"><div class="card-heading"><div><small>GOLDEN YEAR</small><h2>黄金流年 · 自动运算</h2></div><span>已确认公式</span></div><div class="year-control"><label>分析年份 <input type="number" id="v6-year-target" min="1900" max="2200" value="'+(target||new Date().getFullYear())+'"></label><button type="button" class="btn btn-light" id="v6-recalc-year">重新计算</button></div><div class="formula-note">个人流年 = 出生日数字和 + 出生月份数字和 + 分析年份数字和 → 化简至 1–9。此公式来自你旧版 AURMOVA 已保存算法；未确认来源的流年公式不会自行杜撰。</div><div class="year-cycle-grid">'+cards+'</div></div>';
}
function partnerRow(p,i){
  let result='<div class="partner-result empty-mini">填写生日后自动计算这位伙伴。</div>';
  if(p.birthday){
    const a=calculateBlueprint(p.birthday);
    if(a) result='<div class="partner-result"><span>伙伴 '+(i+1)+'</span><b>主性格 '+a.mainPersonality+'</b><span>坐镇码 '+a.seatCode+'</span><span>父亲基因 '+code(Object.values(a.fatherGenes))+'</span><span>母亲基因 '+code(Object.values(a.motherGenes))+'</span></div>';
  }
  return '<article class="partner-card" data-v6-partner="'+i+'"><div class="partner-title"><b>合作伙伴 '+(i+1)+'</b><button type="button" class="danger-lite" data-v6-remove-partner="'+i+'">移除</button></div><div class="partner-fields"><label>姓名<input data-v6-partner-name="'+i+'" value="'+esc(p.name||"")+'" placeholder="伙伴姓名"></label><label>生日（日/月/年）<input inputmode="numeric" data-v6-partner-birthday="'+i+'" value="'+esc(p.birthday||"")+'" placeholder="21/11/1995"></label></div>'+result+'</article>';
}
function cooperationPanel(c){
  const ps=loadPartners(c.id);
  return '<div class="module-render"><div class="card-heading"><div><small>COOPERATION BLUEPRINT</small><h2>多人合作蓝图</h2></div><span>伙伴人数不设上限</span></div><p class="panel-note">每位伙伴保留自己的完整结构。系统不会为了凑结果而把多人硬合成一个没有课程依据的新号码；会逐一比较主性格、坐镇码、父母基因、阶段和合作位置。</p><div id="v6-partners">'+(ps.length?ps.map(partnerRow).join(""):'<div class="empty-mini">还没有合作伙伴。</div>')+'</div><div class="actions"><button type="button" class="btn btn-primary" id="v6-add-partner">＋ 增加合作伙伴</button><button type="button" class="btn btn-light" id="v6-save-partners">保存合作伙伴</button></div></div>';
}
function renderModule(key,c){
  const panel=document.querySelector("#v6-module-panel");
  if(!panel||!c) return;
  if(key==="黄金流年") panel.innerHTML=yearPanel(c);
  else if(key==="合作蓝图") panel.innerHTML=cooperationPanel(c);
  else if(key==="关系蓝图") panel.innerHTML='<div class="module-render"><div class="card-heading"><div><small>RELATIONSHIP BLUEPRINT</small><h2>关系蓝图</h2></div><span>双方独立计算后交叉解读</span></div><p>关系模块会结合双方主性格、内心需要、原生家庭、位置与真实互动，不用单一合数替关系下定论。</p></div>';
  else if(key==="亲子蓝图") panel.innerHTML='<div class="module-render"><div class="card-heading"><div><small>PARENT CHILD BLUEPRINT</small><h2>亲子蓝图</h2></div><span>儿童资料持续接入</span></div><p>这里会接入你已经整理的儿童1–9天赋、生活场景、父母模式、家庭系统、规则与边界资料。</p></div>';
  else panel.innerHTML='<div class="module-render"><div class="card-heading"><div><small>LIFE BLUEPRINT</small><h2>人生蓝图</h2></div><span>Josephine Only</span></div><p>完整位置、三阶段、81组、缺失／挑战、内外能量与咨询提词全部保留在私人后台。</p></div>';
}
function activeModuleName(){
  return document.querySelector("[data-v6-module].active")?.dataset.v6Module || "人生蓝图";
}
function answerTheme(answer,phase){
  const text=String(answer||"");
  if(/拒绝|不好意思|怕得罪|怕别人|委屈|答应|不敢说不|讨好|关系/.test(text)) return "boundary";
  if(/先行动|马上|处理|解决|负责|帮忙|扛|做掉|搞定/.test(text)) return "action";
  if(/观察|想很多|考虑|分析|担心|看看|沉默|不说|先想/.test(text)) return "observe";
  if(/沟通|解释|说|讲|表达|问|谈/.test(text)) return "communicate";
  if(/孩子|下属|员工|团队|带人|教育/.test(text)) return "lead";
  if(/家庭|家人|晚年|父母|伴侣/.test(text)) return "family";
  if(/工作|事业|同事|朋友|客户/.test(text)) return "career";
  return phase==="41–60"?"lead":phase==="61+"?"family":"general";
}
function buildJosephineReply(c,a,phase,step,answer){
  const profile=PERSONALITY_LIBRARY[a.mainPersonality];
  const meta=PHASE_META[phase];
  const theme=answerTheme(answer,phase);
  const branches={
    boundary:{
      catch:"你刚才这句话很关键。你不是不知道自己累，而是你在“自己的需要”和“关系会不会受影响”之间，会先去顾关系。",
      connect:"这可以和我们刚才看到的主性格 "+a.mainPersonality+"、内心码 "+a.innerCode+"，以及关系／边界这一层一起验证。数字不是在替你下结论，而是在帮我们找到你为什么会重复这个选择。",
      next:"当你真的想拒绝一个人的时候，你最担心发生什么？是怕别人失望、觉得你不好，还是怕关系变掉？",
      action:"接下来不是练习变得冷淡，而是练习“先确认自己愿不愿意，再决定怎样温和表达”。"
    },
    action:{
      catch:"我听到的是，你遇到事情时很快会进入“我要把它处理好”的状态。这个是能力，也是你很容易被别人依赖的原因。",
      connect:"这可以和你盘里行动、责任与结果相关的能量一起看。重点不是你会不会做，而是你会不会太快把别人的问题也变成自己的责任。",
      next:"有没有发生过，你明明是想帮忙，最后对方却觉得你太快决定，或者你自己后来觉得“为什么又是我在收尾”？",
      action:"以后可以多一个步骤：先问“你想要我听你说，还是需要我一起想办法？”再决定要不要出手。"
    },
    observe:{
      catch:"你不是没有反应，而是会先收集资讯、看气氛、判断再行动。这个模式本身有它的优势。",
      connect:"这可以和你盘里的观察、分析与安全感需求一起验证。要留意的是，如果观察太久，别人可能根本不知道你已经想了很多。",
      next:"你是不是常常已经看出问题了，却会先等一等，直到事情比较明显才开口？那段等待里你最担心什么？",
      action:"你的练习不是逼自己冲动，而是在还没有想完100分时，先表达30分的真实感受。"
    },
    communicate:{
      catch:"你会先沟通，说明你很重视把情况讲清楚，也会在意彼此有没有理解到同一件事。",
      connect:"这可以和你盘里的表达、人际和协调方式一起看。我要分清楚的是：你是在沟通解决问题，还是压力大时会因为太急着解释而越讲越多。",
      next:"当别人还是听不懂你时，你通常会继续解释，还是会突然觉得“算了，不讲了”？",
      action:"沟通前先确认目的：我是想被理解、想解决问题，还是只是想把情绪说出来。目的清楚，表达会更有力量。"
    },
    lead:{
      catch:"你刚才的回答很适合放进“孩子／下属”这一层看，因为带人时最容易把自己的标准变成对别人的期待。",
      connect:"41–60岁的阶段除了看年龄能量，也看你怎么带孩子、下属或团队。我们要验证的是，你比较偏向亲自处理、要求结果、先讲规则，还是先照顾感受。",
      next:"当孩子或下属没有按你的方法做时，你第一反应通常是提醒、接手、责备，还是先问原因？",
      action:"带人不只是把事情做对，而是分清楚“这是我要负责的”与“这是对方要学习负责的”。"
    },
    family:{
      catch:"这个回答放在家庭关系里很重要，因为越亲近的人，越容易触发我们最自动的反应。",
      connect:"61岁以后的阶段不只看晚年能量，也看家庭关系、生活品质与资源怎么沉淀。这里更重视“怎样相处得舒服”，而不只是把事情处理完。",
      next:"在家人面前，你最常扮演照顾者、决定者、协调者，还是那个把很多话放在心里的人？",
      action:"家庭里的调整通常不是一次讲大道理，而是把一个最常重复的互动模式换一种做法。"
    },
    career:{
      catch:"你刚才讲的这个场景，很适合放回事业／朋友这一层，因为工作里最容易看见一个人真实的责任、边界和合作方式。",
      connect:"21–40岁的阶段除了看年龄能量，也看事业、工作、朋友和同事相处。我们会把你刚才的回答和四组阶段号码一起验证。",
      next:"在工作或朋友关系里，你最常是主动带头、负责收尾、协调大家，还是先观察局势的人？这个角色是你主动选的，还是别人慢慢放到你身上的？",
      action:"接下来要看的不是“你适不适合某行业”，而是哪一种工作角色最容易让你的优势发挥，又不会长期透支。"
    },
    general:{
      catch:"你刚才的回答已经给了我们一个很重要的真实线索。",
      connect:"我会把这句话放回主性格 "+a.mainPersonality+"、当前 "+phase+" 阶段，以及你这次的咨询主题一起看，而不是只用一个数字解释你。",
      next:"这种情况最近一次发生是什么时候？当时你真正想要的是什么，最后又为什么做了那个选择？",
      action:"我们先找到一个最常重复的反应，再从一个现实场景开始调整，比一次想改很多东西更有效。"
    }
  };
  const b=branches[theme]||branches.general;
  return {
    theme,
    html:'<div class="reply-part"><small>① 接住顾客</small><p>'+esc(b.catch)+'</p></div>'
      +'<div class="reply-part"><small>② 连接数字／位置</small><p>'+esc(b.connect)+'</p><span class="reply-context">当前：'+esc(activeModuleName())+' · '+esc(meta.label)+' · '+esc(meta.theme)+' · 主性格 '+a.mainPersonality+'</span></div>'
      +'<div class="reply-part"><small>③ 再追一层</small><div class="question-box">'+esc(b.next)+'</div></div>'
      +'<div class="reply-part"><small>④ 开解方向</small><p>'+esc(b.action)+'</p></div>'
  };
}
function consultationConsole(c,a,phase,step=0){
  const saved=loadConsultation(c.id);
  const item=saved[String(step)]||{};
  return '<section class="answer-console" id="v7-answer-console" data-step="'+step+'">'
    +'<div class="answer-head"><div><p class="eyebrow">LIVE CONSULTATION</p><h3>顾客回答后 · Josephine 怎么接</h3></div><span>回答 → 接住 → 连接 → 深挖 → 开解</span></div>'
    +'<label class="answer-label">记录顾客刚才的回答<textarea id="v7-customer-answer" placeholder="例如：我其实很不想答应，但我怕拒绝以后别人会觉得我很难相处。">'+esc(item.answer||"")+'</textarea></label>'
    +'<div class="answer-actions"><button type="button" class="btn btn-light" id="v7-save-answer">保存回答</button><button type="button" class="btn btn-primary" id="v7-generate-reply">生成下一句回应话术</button></div>'
    +'<div id="v7-reply-output" class="reply-output">'+(item.replyHtml||'<div class="empty-mini">输入顾客回答后，系统会给你“怎么接、怎么解释、下一题问什么、怎么开解”。</div>')+'</div>'
    +'</section>';
}
function refreshConsultationConsole(step){
  const c=currentCustomer(); if(!c)return;
  const a=calculateBlueprint(c.birthday),phase=phaseForAge(ageFromBirthday(c.birthday)); if(!a)return;
  const old=document.querySelector("#v7-answer-console"); if(old) old.outerHTML=consultationConsole(c,a,phase,Number(step)||0);
}
function scriptMarkup(c,a,phase){
  const profile=PERSONALITY_LIBRARY[a.mainPersonality],mainDetail=MAIN_DETAIL[a.mainPersonality],meta=PHASE_META[phase],groups=groupList(a.phases[phase]),missing=a.combinedEnergy.missing;
  const y=calculateYearCycleSet(c.birthday,new Date().getFullYear()).current;
  const items=[
    ["01 核心主题",'<h2>先从顾客现在真正想解决的事情开始</h2><p>主性格 '+a.mainPersonality+' · '+esc(profile.title)+'。当前处于 '+phase+'：'+esc(meta.theme)+'。</p><div class="question-box">今天我不会一开始就告诉你“你是什么样的人”。我想先听你现在最想看懂的一件事，再把数字与真实经历一层层对上。</div>'],
    ["02 数字解析",'<h2>数字结构不是单看一个号码</h2><p>父亲基因 '+code(Object.values(a.fatherGenes))+' · 母亲基因 '+code(Object.values(a.motherGenes))+' · 坐镇码 '+a.seatCode+' · 内心码 '+a.innerCode+' · 潜意识码 '+a.subconsciousCode+'。</p><p>当前阶段四组：'+groups.join(" → ")+'。</p>'+(mainDetail?'<div class="question-box"><b>主性格 '+a.mainPersonality+'：</b> '+esc(mainDetail.thinking)+' '+esc(mainDetail.behavior)+'<br><b>压力时：</b>'+esc(mainDetail.stress)+'<br><b>天赋：</b>'+esc(mainDetail.talents)+'</div>':"")],
    ["03 生活场景",'<h2>'+phase+' · '+esc(meta.theme)+'</h2><p>'+esc(meta.description)+'</p><div class="question-box">最近在这个领域有没有一件事情反复发生？你当时通常先顾自己、顾关系、顾结果，还是先观察再决定？</div>'],
    ["04 开解方向",'<h2>从缺少与过强的能量找平衡</h2><p>内外综合缺少：'+(missing.length?missing.join("、"):"无明显缺失")+'。缺失不等于“没有能力”，而是比较不自动，需要通过选择、练习与环境来建立。</p><div class="question-box">'+(missing.slice(0,3).map(n=>n+'号：'+esc(ENERGY_LIBRARY[n].low)).join("<br>")||"这一盘内外1–9都有出现，重点转向重复次数与位置。")+'</div>'],
    ["05 提问顾客",'<h2>用真实经历验证，而不是替顾客下结论</h2><div class="question-box">1）你最近最卡的是关系、事业、金钱、家庭，还是自己的方向？<br>2）压力最大的时候，你最常重复哪一种反应？<br>3）'+(phase==="21–40"?"你在工作和朋友关系里最容易承担什么角色？":phase==="41–60"?"你带孩子或下属时最容易要求他们做到什么？":"现在的家庭关系与晚年生活里，你最想保留和调整的是什么？")+'</div>'],
    ["06 总结建议",'<h2>把数字翻译成现实行动</h2><p>今年个人流年 '+y.number+' · '+esc(y.title)+'：'+esc(y.summary)+'</p><div class="question-box">数字不是替你决定，而是帮你看见自己最容易重复的模式。今天先选一个最需要调整的地方，把它变成下一步行动。</div>']
  ];
  return {nav:items.map((x,i)=>'<button type="button" data-v6-script-step="'+i+'" class="'+(i===0?"active":"")+'">'+x[0]+'</button>').join(""),body:items.map((x,i)=>'<section data-v6-script-content="'+i+'" '+(i===0?"":"hidden")+'><p class="eyebrow">Josephine Consultation Notes</p>'+x[1]+'</section>').join("")+consultationConsole(c,a,phase,0)};
}
function deleteCustomer(id){
  const c=loadCustomers().find(x=>String(x.id)===String(id));
  if(!c) return;
  if(!confirm("确定删除 "+c.name+" 的顾客档案吗？\n删除后此装置上的这份资料会移除。")) return;
  saveCustomers(loadCustomers().filter(x=>String(x.id)!==String(id)));
  localStorage.removeItem(partnerKey(id));
  if(location.hash.startsWith("#workspace")) location.hash="history"; else location.dispatchEvent(new HashChangeEvent("hashchange"));
}
function enhanceHistory(){
  if(!location.hash.startsWith("#history")) return;
  document.querySelectorAll(".customer-table tbody tr").forEach(row=>{
    if(row.querySelector("[data-v6-delete]")) return;
    const link=row.querySelector('a[href*="#workspace?id="]');
    if(!link) return;
    const id=new URLSearchParams(link.getAttribute("href").split("?")[1]).get("id");
    const btn=document.createElement("button");
    btn.type="button"; btn.className="danger-lite"; btn.dataset.v6Delete=id; btn.textContent="删除";
    link.parentElement.appendChild(btn);
  });
}
function enhanceWorkspace(){
  if(!location.hash.startsWith("#workspace")) return;
  const c=currentCustomer();
  if(!c) return;
  const a=calculateBlueprint(c.birthday),age=ageFromBirthday(c.birthday),phase=phaseForAge(age);
  if(!a) return;

  const quick=document.querySelector(".quick-actions");
  if(quick&&!quick.querySelector("[data-v6-delete]")){
    const btn=document.createElement("button");btn.type="button";btn.className="btn btn-light danger-text";btn.dataset.v6Delete=c.id;btn.textContent="删除顾客";quick.appendChild(btn);
  }

  const tabs=document.querySelector(".module-tabs");
  if(tabs&&!tabs.dataset.v6){
    tabs.dataset.v6="1";
    const names=["人生蓝图","黄金流年","关系蓝图","亲子蓝图","合作蓝图"];
    [...tabs.querySelectorAll(".module-tab")].forEach((b,i)=>{b.dataset.v6Module=names[i]||"人生蓝图";b.textContent=names[i]||b.textContent});
    const panel=document.createElement("section");panel.id="v6-module-panel";panel.className="card module-info-panel";tabs.after(panel);renderModule("人生蓝图",c);
  }

  const structure=document.querySelector(".structure-grid");
  if(structure&&!document.querySelector(".secondary-code-row")){
    const row=document.createElement("div");row.className="secondary-code-row";
    row.innerHTML='<div><span>潜意识码</span><b>'+a.subconsciousCode+'</b></div><div><span>家庭码</span><b>'+a.familyCode+'</b></div><div><span>对内性格</span><b>'+a.insidePersonalityCode+'</b></div><div><span>对外性格</span><b>'+a.outsidePersonalityCode+'</b></div><div><span>外心码</span><b>'+a.outerHeartCode+'</b></div>';
    structure.after(row);
  }

  const phases=document.querySelector(".phases");
  if(phases&&!phases.dataset.v6){
    phases.dataset.v6="1";
    const grid=phases.querySelector(".phase-grid");
    if(grid){grid.innerHTML=phaseButtons(a,phase);const detail=document.createElement("div");detail.className="phase-details";detail.id="v6-phase-detail";detail.innerHTML=phaseDetails(a,phase);grid.after(detail)}
    const badge=phases.querySelector(".card-heading>span");if(badge)badge.textContent="三个阶段都可以点击";
  }

  if(phases&&!document.querySelector("#v6-energy")){
    const wrap=document.createElement("section");wrap.id="v6-energy";wrap.innerHTML='<div class="section-head"><div><p class="eyebrow">Energy Map</p><h2>内三角 × 外三角 × 内外综合</h2></div><span class="source-tag">系统推导｜依据你的公式与位置结构</span></div><div class="energy-grid">'+energyBlock(a.innerEnergy,"inner")+energyBlock(a.outerEnergy,"outer")+energyBlock(a.combinedEnergy,"combined")+'</div>';
    phases.after(wrap);
  }

  const script=document.querySelector("#script-panel");
  if(script&&!script.dataset.v6){
    script.dataset.v6="1";
    const s=scriptMarkup(c,a,phase),nav=script.querySelector(".script-nav"),body=script.querySelector(".script-body");
    if(nav)nav.innerHTML='<b>咨询提词稿</b>'+s.nav;
    if(body)body.innerHTML=s.body;
  }
}
let queued=false;
function enhance(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhanceHistory();enhanceWorkspace()})}
window.addEventListener("hashchange",()=>setTimeout(enhance,0));
new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
setTimeout(enhance,0);

document.addEventListener("click",event=>{
  const del=event.target.closest("[data-v6-delete]"); if(del){deleteCustomer(del.dataset.v6Delete);return}
  const mod=event.target.closest("[data-v6-module]"); if(mod){document.querySelectorAll("[data-v6-module]").forEach(x=>x.classList.toggle("active",x===mod));renderModule(mod.dataset.v6Module,currentCustomer());document.querySelector("#v6-module-panel")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  const ph=event.target.closest("[data-v6-phase]"); if(ph){document.querySelectorAll("[data-v6-phase]").forEach(x=>x.classList.toggle("selected",x===ph));const c=currentCustomer(),a=c&&calculateBlueprint(c.birthday);if(a){const box=document.querySelector("#v6-phase-detail");if(box)box.innerHTML=phaseDetails(a,ph.dataset.v6Phase)}return}
  const st=event.target.closest("[data-v6-script-step]"); if(st){const i=st.dataset.v6ScriptStep;document.querySelectorAll("[data-v6-script-step]").forEach(x=>x.classList.toggle("active",x===st));document.querySelectorAll("[data-v6-script-content]").forEach(x=>x.hidden=x.dataset.v6ScriptContent!==i);refreshConsultationConsole(i);return}
  const saveAnswer=event.target.closest("#v7-save-answer"); if(saveAnswer){
    const c=currentCustomer(); if(!c)return;
    const box=document.querySelector("#v7-answer-console"),step=Number(box?.dataset.step||0),answer=document.querySelector("#v7-customer-answer")?.value.trim()||"";
    const data=loadConsultation(c.id); data[String(step)]={...(data[String(step)]||{}),answer}; saveConsultation(c.id,data);
    saveAnswer.textContent="已保存 ✓"; setTimeout(()=>saveAnswer.textContent="保存回答",1200); return
  }
  const generateReply=event.target.closest("#v7-generate-reply"); if(generateReply){
    const c=currentCustomer(); if(!c)return;
    const a=calculateBlueprint(c.birthday),phase=phaseForAge(ageFromBirthday(c.birthday));
    const box=document.querySelector("#v7-answer-console"),step=Number(box?.dataset.step||0),answer=document.querySelector("#v7-customer-answer")?.value.trim()||"";
    if(!answer){document.querySelector("#v7-reply-output").innerHTML='<div class="empty-mini">请先记录顾客的回答。</div>';return}
    const reply=buildJosephineReply(c,a,phase,step,answer),data=loadConsultation(c.id);
    data[String(step)]={answer,replyHtml:reply.html,theme:reply.theme,updatedAt:new Date().toISOString()}; saveConsultation(c.id,data);
    document.querySelector("#v7-reply-output").innerHTML=reply.html; return
  }
  const gen=event.target.closest("#generate-script"); if(gen){setTimeout(()=>{document.querySelector("#script-panel")?.scrollIntoView({behavior:"smooth",block:"start"})},0);return}
  const add=event.target.closest("#v6-add-partner"); if(add){const c=currentCustomer();if(!c)return;const ps=loadPartners(c.id);ps.push({name:"",birthday:""});savePartners(c.id,ps);renderModule("合作蓝图",c);return}
  const rm=event.target.closest("[data-v6-remove-partner]"); if(rm){const c=currentCustomer();if(!c)return;const ps=loadPartners(c.id);ps.splice(Number(rm.dataset.v6RemovePartner),1);savePartners(c.id,ps);renderModule("合作蓝图",c);return}
  const save=event.target.closest("#v6-save-partners"); if(save){const c=currentCustomer();if(!c)return;const ps=[...document.querySelectorAll("[data-v6-partner]")].map(card=>{const i=card.dataset.v6Partner;return{name:card.querySelector("[data-v6-partner-name='"+i+"']")?.value.trim()||"",birthday:card.querySelector("[data-v6-partner-birthday='"+i+"']")?.value.trim()||""}});savePartners(c.id,ps);renderModule("合作蓝图",c);return}
  const yr=event.target.closest("#v6-recalc-year"); if(yr){const c=currentCustomer();if(!c)return;const val=Number(document.querySelector("#v6-year-target")?.value)||new Date().getFullYear();const panel=document.querySelector("#v6-module-panel");if(panel)panel.innerHTML=yearPanel(c,val);return}
});
document.addEventListener("input",event=>{
  const el=event.target.closest("[data-v6-partner-name],[data-v6-partner-birthday]"); if(!el)return;
  const c=currentCustomer();if(!c)return;const i=Number(el.dataset.v6PartnerName??el.dataset.v6PartnerBirthday),ps=loadPartners(c.id);if(!ps[i])ps[i]={name:"",birthday:""};
  if(el.matches("[data-v6-partner-name]"))ps[i].name=el.value;else ps[i].birthday=el.value;savePartners(c.id,ps);
});
document.addEventListener("change",event=>{
  const el=event.target.closest("[data-v6-partner-birthday]");if(!el)return;const c=currentCustomer();if(c)renderModule("合作蓝图",c);
});
