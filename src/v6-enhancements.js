import { calculateBlueprint, ageFromBirthday, phaseForAge, calculateYearCycleSet, calculateEnvironmentYear, compareYearClimate, calculateYearJointCode, yearSourceAxes, calculateGoldenYearSnapshot, YEAR_THEMES, PHASE_META } from "./engine/blueprint.js?v=28";
import { ENERGY_LIBRARY, describeEnergySet } from "./energy-library.js?v=28";
import { PERSONALITY_LIBRARY } from "./personality-library.js?v=28";
import { findJointCode } from "./aurmova-knowledge.js?v=28";
import { getKnowledge as getFlootKnowledge, MAIN_DETAIL, DIGIT_CORE, TALK_QUESTIONS } from "./floot-knowledge.js?v=28";
import { getTrianglePattern, getDensityReading, getInnerOuterAlignment } from "./triangle-pattern-library.js?v=28";
import { CONSTRAINT_NOTES, CHILDHOOD_MODES, INNER_DIGIT_POLARITY, PERSONALITY_QUESTIONS, YEAR_TEACHING_ANALOGIES, ENVIRONMENT_YEAR_EXAMPLES } from "./consultation-library.js?v=28";

const DIGITS=[1,2,3,4,5,6,7,8,9];
const customerKey="aurmova.customers";
const partnerKey=id=>"aurmova.partners."+id;
const consultationKey=id=>"aurmova.consultation."+id;
const serviceKey=id=>"aurmova.serviceflow."+id;
const relationshipKey=id=>"aurmova.relationship."+id;
const familyKey=id=>"aurmova.family."+id;
const loadConsultation=id=>{try{return JSON.parse(localStorage.getItem(consultationKey(id))||"{}")}catch{return{}}};
const saveConsultation=(id,data)=>localStorage.setItem(consultationKey(id),JSON.stringify(data));
const loadService=id=>{try{return JSON.parse(localStorage.getItem(serviceKey(id))||"{}")}catch{return{}}};
const saveService=(id,data)=>localStorage.setItem(serviceKey(id),JSON.stringify(data));
const loadRelationship=id=>{try{return JSON.parse(localStorage.getItem(relationshipKey(id))||'{"name":"","birthday":"","type":"伴侣／感情"}')}catch{return{name:"",birthday:"",type:"伴侣／感情"}}};
const saveRelationship=(id,data)=>localStorage.setItem(relationshipKey(id),JSON.stringify(data));
const loadFamily=id=>{try{return JSON.parse(localStorage.getItem(familyKey(id))||'{"father":{"name":"","birthday":""},"mother":{"name":"","birthday":""},"children":[]}')}catch{return{father:{name:"",birthday:""},mother:{name:"",birthday:""},children:[]}}};
const saveFamily=(id,data)=>localStorage.setItem(familyKey(id),JSON.stringify(data));
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
function trianglePatternCard(a,number){
  const innerCount=Number(a.innerEnergy?.counts?.[number]||0);
  const outerCount=Number(a.outerEnergy?.counts?.[number]||0);
  const result=getTrianglePattern(number,innerCount,outerCount);
  if(!result) return "";
  return '<article class="triangle-pattern-card">'
    +'<div class="triangle-pattern-number">'+number+'</div>'
    +'<div class="triangle-pattern-main"><div class="triangle-pattern-state">'+esc(result.state)+'</div>'
    +'<p>'+esc(result.description)+'</p>'
    +'<div class="triangle-pattern-counts"><span>三角形内：'+innerCount+'个</span><span>三角形外：'+outerCount+'个</span><span>'+esc(result.source)+'</span></div></div>'
    +'</article>';
}
function outerDensityAreas(a,number){
  const areas=[];
  const entries=[
    ["事业／朋友",a.jointCodes6?.SWX||[]],
    ["孩子／下属",a.jointCodes6?.RQP||[]],
    ["家庭／晚年",a.jointCodes6?.TVU||[]]
  ];
  for(const [label,values] of entries){
    const count=values.filter(v=>Number(v)===Number(number)).length;
    if(count) areas.push(label+(count>1?" ×"+count:""));
  }
  return areas;
}

function densityCard(a,number,scope){
  const count=Number((scope==="inner"?a.innerEnergy:a.outerEnergy)?.counts?.[number]||0);
  if(!count) return "";
  const r=getDensityReading(number,count,scope);
  if(!r) return "";
  const extra=scope==="outer"?outerDensityAreas(a,number):[];
  return '<article class="density-card">'
    +'<div class="density-card-top"><span>'+number+'</span><div><b>'+esc(r.level)+'</b><small>'+esc(r.core)+'</small></div><em>'+count+'个</em></div>'
    +'<p>'+esc(r.description)+'</p>'
    +(scope==="outer"&&extra.length?'<div class="density-areas">主要出现：'+esc(extra.join(" · "))+'</div>':'')
    +(r.exact?'':'<div class="density-warning">实际出现 '+count+' 次，超过目前1–4级资料；系统先按4级高密度参考，并保留真实次数。</div>')
    +'</article>';
}

function alignmentCard(a,number){
  const innerCount=Number(a.innerEnergy?.counts?.[number]||0);
  const outerCount=Number(a.outerEnergy?.counts?.[number]||0);
  const r=getInnerOuterAlignment(number,innerCount,outerCount);
  if(!r||r.mode==="low") return "";
  return '<article class="alignment-card '+r.mode+'">'
    +'<div class="alignment-card-top"><span>'+number+'</span><div><b>'+esc(r.modeName)+'</b><small>'+esc(r.label)+'</small></div><em>内'+innerCount+' · 外'+outerCount+'</em></div>'
    +'<h4>'+esc(r.hook)+'</h4>'
    +'<p>'+esc(r.body)+'</p>'
    +'<div class="alignment-focus">'+esc(r.focus)+'</div>'
    +'</article>';
}

function innerOuterAlignmentSection(a){
  const cards=DIGITS.map(n=>alignmentCard(a,n)).filter(Boolean).join("");
  return '<div class="alignment-section">'
    +'<div class="card-heading"><div><small>INNER × OUTER ALIGNMENT</small><h3>内外一致／压抑／补偿</h3></div><span>咨询突破层</span></div>'
    +'<div class="formula-note">目前系统以“1次=轻触型、2次以上=高密度”作为“少／多”的判断：内≥2、外≥2＝内外一致；内≥2、外≤1＝内在压抑；内≤1、外≥2＝外在补偿。内外都≤1时不强行套模式。</div>'
    +'<div class="alignment-grid">'+(cards||'<div class="empty-mini">当前没有形成明显的内外高密度组合。</div>')+'</div>'
    +'</div>';
}

function contrastRows(a){
  const inner=a.innerEnergy?.counts||{},outer=a.outerEnergy?.counts||{};
  return DIGITS.map(n=>{
    const i=Number(inner[n]||0),o=Number(outer[n]||0),diff=Math.abs(i-o);
    const direction=i>o?"suppressed":o>i?"compensating":"balanced";
    const priority=diff>=3?"core":diff===2?"assist":"low";
    return {n,inner:i,outer:o,diff,direction,priority};
  });
}

function contrastProbe(mode){
  if(mode==="suppressed") return "你有没有觉得，在某些场合你其实有自己的想法或感受，但最后没有说出来，或没有照自己的方式做？";
  if(mode==="compensating") return "别人看到的你，和你自己觉得的那个你，是不是其实有一点不一样？";
  return "你身边真正熟悉你的人，是不是通常觉得你里外都差不多？";
}

function quickConsultationSection(a){
  const rows=contrastRows(a);
  const core=rows.filter(x=>x.priority==="core").sort((x,y)=>y.diff-x.diff);
  const assist=rows.filter(x=>x.priority==="assist").sort((x,y)=>y.diff-x.diff);
  const pick=(core[0]||assist[0]||rows.slice().sort((x,y)=>y.diff-x.diff)[0]);
  let opener="";
  let alignment=null;
  if(pick&&pick.diff>0){
    alignment=getInnerOuterAlignment(pick.n,pick.inner,pick.outer);
    opener=alignment?.hook||"你内在和外在的表现，在这个数字上有明显反差。";
  }

  const table=rows.map(x=>{
    const mark=x.priority==="core"?"核心张力":x.priority==="assist"?"辅助话题":"低优先";
    return '<div class="contrast-row '+x.priority+'"><b>'+x.n+'</b><span>'+x.inner+'</span><span>'+x.outer+'</span><span>'+x.diff+'</span><em>'+mark+'</em></div>';
  }).join("");

  const focus=pick&&pick.diff>0
    ? '<div class="consult-opener-card"><div class="source-tag">'+(pick.diff>=3?"首选开场":"当前最明显反差")+'</div><h4>数字 '+pick.n+'｜内 '+pick.inner+' · 外 '+pick.outer+' · 差 '+pick.diff+'</h4><blockquote>'+esc(opener)+'</blockquote><p>'+esc(alignment?.body||"先用这句开场，再让顾客用自己的故事来验证。")+'</p><div class="question-box"><b>探针问题：</b><br>'+esc(contrastProbe(alignment?.mode||pick.direction))+'</div></div>'
    : '<div class="empty-mini">这张盘目前没有明显内外反差。开场不要硬找冲突，优先从高密度一致数字、缺失数或顾客主动提出的问题开始。</div>';

  return '<div class="quick-consultation">'
    +'<div class="card-heading"><div><small>30-SECOND SCAN</small><h3>30秒内外计数 · 找最大反差</h3></div><span>先找故事最多的地方</span></div>'
    +'<div class="contrast-table"><div class="contrast-head"><b>数字</b><span>内</span><span>外</span><span>差</span><em>优先级</em></div>'+table+'</div>'
    +'<div class="formula-note">实战优先级：差3个以上＝核心张力点；差2个＝辅助话题；差0–1＝通常先跳过。若有多个并列核心张力点，系统会保留并列，不硬选唯一答案。</div>'
    +focus
    +'<div class="consult-flow"><div><small>STEP 1 · 先说一句</small><b>把数字翻译成人话</b><p>用“你其实是___的人，但你习惯了___”切入，不先解释方法论。</p></div><div><small>STEP 2 · 让顾客讲</small><b>追问真实故事</b><p>可以问：从什么时候开始？最早发生在家庭、学校还是工作？后来这个模式有没有一直重复？</p></div><div><small>STEP 3 · 拉回盘</small><b>把故事挂回位置</b><p>再把顾客刚才讲的经历放回父亲基因、母亲基因、主性格、事业朋友、孩子下属或家庭晚年的对应位置验证。</p></div></div>'
    +'<div class="formula-note">原则：先用盘提出“可能的模式”，再让顾客用经历确认或修正。目标不是让顾客被一句话“说中”，而是让她看见自己反复出现的模式。</div>'
    +'</div>';
}

function densityComparison(a){
  const innerCounts=a.innerEnergy?.counts||{},outerCounts=a.outerEnergy?.counts||{};
  const innerMax=Math.max(...DIGITS.map(n=>Number(innerCounts[n]||0)));
  const outerMax=Math.max(...DIGITS.map(n=>Number(outerCounts[n]||0)));
  const innerTop=DIGITS.filter(n=>Number(innerCounts[n]||0)===innerMax&&innerMax>0);
  const outerTop=DIGITS.filter(n=>Number(outerCounts[n]||0)===outerMax&&outerMax>0);
  const overlap=innerTop.filter(n=>outerTop.includes(n));
  const title=overlap.length?"内外一致线索":"内外张力线索";
  const text=overlap.length
    ?"三角形内外的高密度数字有重合（"+overlap.join("、")+"），代表真实自我与外在表现有较明显的一致面。"
    :"三角形内高密度偏向 "+innerTop.join("、")+"，外三角高密度偏向 "+outerTop.join("、")+"。这不代表矛盾不好，而是提示“骨子里的你”和“现实中活出来的你”可能存在值得咨询的张力。";
  return '<div class="density-comparison card"><b>'+title+'</b><p>'+esc(text)+'</p><span>内三角高密度 = 骨子里更像这样｜外三角高密度 = 在现实世界更常活成这样</span></div>';
}

function digitDensitySection(a){
  return '<section id="v16-density">'
    +'<div class="section-head"><div><p class="eyebrow">DIGIT DENSITY</p><h2>数字能量密度 · 出现次数</h2></div><span class="source-tag">1–4级｜内外分开看</span></div>'
    +'<div class="formula-note">数量不是越多越好。1次=轻触型，2次=常驻型，3次=主导型，4次=核心驱动型。密度越高，天赋更明显，反模式也更容易被放大。</div>'
    +'<div class="density-columns"><div><h3>三角形内｜骨子里的你</h3><div class="density-grid">'+DIGITS.map(n=>densityCard(a,n,"inner")).join("")+'</div></div>'
    +'<div><h3>三角形外｜现实中活出来的你</h3><div class="density-grid">'+DIGITS.map(n=>densityCard(a,n,"outer")).join("")+'</div></div></div>'
    +densityComparison(a)
    +innerOuterAlignmentSection(a)
    +quickConsultationSection(a)
    +'<div class="formula-note">流年命中高密度数字时，体感通常会更明显；黄金流年会把“流年数 × 内外密度”一起提示。密度与内外模式是AURMOVA咨询框架中的读取维度，不等同于确定事件。</div>'
    +'</section>';
}

function trianglePatternSection(a){
  return '<section id="v11-triangle-patterns">'
    +'<div class="section-head"><div><p class="eyebrow">TRIANGLE INNER × OUTER</p><h2>三角形内外数字表现</h2></div><span class="source-tag">按你提供的“6种精准表现”资料读取</span></div>'
    +'<div class="triangle-definition card"><div><b>三角形内</b><span>I · J · K · L · M · N · O</span><p>代表内在性格、真实自我。</p></div><div><b>三角形外</b><span>X · W · S · Q · P · R · V · U · T</span><p>代表外在表现、社交面具。</p></div></div>'
    +'<div class="formula-note">系统不是把“内、外、内外”当成三种能量，而是先看每一个数字在三角形内／外有没有出现：内缺外有、内有外缺、内外都缺；如果内外都有，再按三角形内出现1次、2次、3次读取对应表现。超过3次时先保留实际次数，不自行杜撰解释。</div>'
    +'<div class="triangle-pattern-grid">'+[1,2,3,4,5,6,7,8,9].map(n=>trianglePatternCard(a,n)).join("")+'</div>'
    +digitDensitySection(a)
    +'</section>';
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
      +'<p><b>正面／优势：</b>'+esc(structured.strengths||"")+'</p>'
      +'<p><b>负面／卡点：</b>'+esc(structured.challenges||"")+'</p>'
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
const YEAR_REGION_META = {
  father:{label:"内三角形左侧",title:"父亲基因／权威关系",focus:"父亲、上级、权威人物、早年习得的独立行动模式",lesson:"从外在要求回到自己的判断"},
  mother:{label:"内三角形右侧",title:"母亲基因／情感支持",focus:"母亲、亲密关系、安全感、被照顾与照顾人的模式",lesson:"看清关系里的重复反应与情感需求"},
  core:{label:"内三角形核心",title:"主性格／核心行为",focus:"最核心的性格底色、选择方式与长期行为习惯",lesson:"核心性格正在被这一年的主题重新整理"},
  career:{label:"外三角形左侧",title:"事业／朋友 · 21–40岁",focus:"事业、工作、朋友、同事、社交圈与专业发展",lesson:"今年的主场更容易落在工作与人际发展的现实场景"},
  team:{label:"外三角形上方",title:"孩子／下属 · 41–60岁",focus:"孩子、下属、团队、培养别人、管理与授权",lesson:"今年更容易透过带人、教人、放手或管理方式看到课题"},
  family:{label:"外三角形右侧",title:"家庭／晚年 · 61岁+",focus:"家庭关系、长期生活方式、资源沉淀与晚年生活品质",lesson:"今年更容易从家庭与长期生活规划看见真正想要的状态"}
};

const YEAR7_REGION_EXAMPLES = {
  father:"重新审视父亲、上级或权威关系；从“别人告诉我的”转向“我自己想通的”。",
  mother:"重新审视亲密关系中的情感模式；练习先想清楚再回应，而不是本能反应。",
  core:"核心性格进入向内整理期；适合深度学习、研究、写作与重新想清楚方向。",
  career:"事业节奏可能放慢，更适合打磨专业、筛选关系与想明白下一步，而不是只冲业绩。",
  team:"带孩子／下属的方式需要从“手把手控制”转向“给空间、让对方尝试”。",
  family:"家庭与长远生活进入思考期；关系中的留白、空间与认真沟通会变得重要。"
};

function yearRegions(a){
  return [
    {key:"father",code:a.fatherCode},
    {key:"mother",code:a.motherCode},
    {key:"core",code:a.seatCode},
    {key:"career",code:(a.jointCodes6?.STU||[]).join("")},
    {key:"team",code:(a.jointCodes6?.PQR||[]).join("")},
    {key:"family",code:(a.jointCodes6?.VWX||[]).join("")}
  ].map(x=>({...x,...YEAR_REGION_META[x.key]}));
}

const YEAR_CODE_POSITION = ["起因","过程","结果"];
const MISSING_YEAR_ACTIVATION = {
  1:{feel:"不敢做决定、不敢当领导",pattern:"什么都让别人定",growth:"练习自己决定、承担结果与主动表达"},
  2:{feel:"害怕合作、自来熟或过度防备",pattern:"要么拒人千里，要么讨好过度",growth:"练习合作边界、表达需要与保持自我"},
  3:{feel:"想表达的冲动很强，但一开口就卡住",pattern:"要么憋着不说，要么说太多",growth:"练习清楚表达、稳定输出与先想后说"},
  4:{feel:"被逼坐下来坚持做一件无聊但重要的事",pattern:"要么拖延到底，要么半途而废",growth:"练习耐心、流程、纪律与长期完成"},
  5:{feel:"生活突然变，被迫应对变化",pattern:"要么死守不变，要么冲动乱变",growth:"练习弹性、判断变化与有边界地尝试"},
  6:{feel:"家庭／关系责任突然加重",pattern:"要么逃避责任，要么扛太多",growth:"练习责任边界、照顾自己与可持续付出"},
  7:{feel:"信息过载但看不懂，需要深度思考",pattern:"要么拒绝思考，要么钻牛角尖",growth:"练习筛选资讯、独立思考与把研究落地"},
  8:{feel:"和钱／权力相关的事躲不掉",pattern:"要么不敢谈钱，要么急功近利",growth:"练习谈条件、资源管理、风险意识与承担权责"},
  9:{feel:"被推到利他、帮助或更大格局的位置上",pattern:"要么只为自己，要么过度牺牲",growth:"练习理想与现实并行，帮助别人也保留边界"}
};

function countDigitInCode(code,number){
  return String(code||"").split("").filter(x=>Number(x)===Number(number)).length;
}

function digitPositionsInCode(code,number){
  return String(code||"").split("").map((x,i)=>Number(x)===Number(number)?i:null).filter(i=>i!==null);
}

function analyzeYearLocationPriority(a,number){
  const regions=yearRegions(a).map(r=>{
    const positions=digitPositionsInCode(r.code,number);
    const inner=["father","mother","core"].includes(r.key);
    return {...r,inner,positions,count:positions.length,direct:positions.length>0};
  });
  const hits=regions.filter(r=>r.direct);
  if(!hits.length) return {regions,hits,primary:[],secondary:[],background:[],note:"六个主要区域没有直接命中这个流年数。"};

  let pool=hits;
  let secondary=[];
  const innerHits=hits.filter(r=>r.inner);
  const outerHits=hits.filter(r=>!r.inner);

  if(innerHits.length){
    pool=innerHits;
    secondary=outerHits;
  }

  let primary=[];
  const core=pool.find(r=>r.key==="core");
  if(core){
    primary=[core];
    secondary=[...pool.filter(r=>r.key!=="core"),...secondary];
  }else{
    const maxCount=Math.max(...pool.map(r=>r.count));
    primary=pool.filter(r=>r.count===maxCount);
    secondary=[...pool.filter(r=>r.count<maxCount),...secondary];
  }

  const background=[];
  if(primary.some(r=>r.key==="core")){
    for(const key of ["father","mother"]){
      const r=regions.find(x=>x.key===key);
      if(r&&!hits.some(h=>h.key===key)) background.push(r);
    }
  }

  const note=primary.length===1
    ? "主场："+primary[0].title+"。判断依据：先看直接命中，再看内三角优先；主性格区命中时优先级更高。"
    : "目前有多个并列主场："+primary.map(x=>x.title).join("、")+"。它们的直接命中强度相近；系统保留并列，不擅自编造未确认的额外权重。";

  return {regions,hits,primary,secondary,background,note};
}

function missingActivationSummary(a,personalNumber,jointCode=""){
  const missing=a.innerEnergy?.missing||[];
  const joint=String(jointCode||"").replace(/\D/g,"").slice(0,3);
  const direct=missing.includes(Number(personalNumber));
  const jointHits=missing.filter(n=>joint.includes(String(n)));

  const rows=missing.map(n=>{
    const cfg=MISSING_YEAR_ACTIVATION[n];
    const positions=digitPositionsInCode(joint,n);
    const directHit=n===Number(personalNumber);
    let level="休眠";
    let detail="个人流年没有直接命中；"+(joint?"流年联合码里也没有出现。":"等待输入流年联合码后再判断中等激活。");
    if(directHit){
      level="最强激活";
      detail="流年数本身 = 缺失数。属于“补课年”式的强触发：今年更容易遇到这股能量相关的现实课题。";
    }else if(positions.length){
      level="中等激活";
      detail="缺失数出现在流年联合码的"+positions.map(i=>"第"+(i+1)+"位（"+YEAR_CODE_POSITION[i]+"）").join("、")+"。";
    }
    return {n,cfg,level,detail,directHit,positions};
  });

  return {missing,direct,jointHits,rows};
}

function yearDensityResonance(a,personal){
  const n=personal.number;
  const innerCount=Number(a.innerEnergy?.counts?.[n]||0);
  const outerCount=Number(a.outerEnergy?.counts?.[n]||0);
  const inner=getDensityReading(n,innerCount,"inner");
  const outer=getDensityReading(n,outerCount,"outer");
  const total=innerCount+outerCount;
  let level="普通共振";
  if(innerCount>=3||outerCount>=3||total>=5) level="强共振";
  else if(innerCount>=2||outerCount>=2||total>=3) level="明显共振";
  else if(total===0) level="无直接密度共振";
  const lines=[];
  if(inner) lines.push("三角形内 "+innerCount+" 个"+n+"（"+inner.level+"）："+inner.description);
  if(outer) lines.push("三角形外 "+outerCount+" 个"+n+"（"+outer.level+"）："+outer.description);
  if(!lines.length) lines.push("这个流年数字在内外三角形都没有出现，体感更像“今年外部来了一股平时不熟悉的能量”。");
  return '<div class="year-density-resonance"><div class="card-heading"><div><small>YEAR × DENSITY</small><h3>流年 × 数字密度共振</h3></div><span>'+esc(level)+'</span></div>'
    +'<div class="formula-note">流年命中高密度数字时，反应通常会更明显：正面天赋更容易被调用，反模式也更容易被放大。密度高不等于一定发生某件事，而是这个主题今年更容易“有感觉”。</div>'
    +'<div class="year-density-lines">'+lines.map(x=>'<p>'+esc(x)+'</p>').join("")+'</div></div>';
}

function missingActivationPanel(a,personal){
  const result=missingActivationSummary(a,personal.number);
  if(!result.missing.length){
    return '<div class="year-missing-wrap"><div class="card-heading"><div><small>MISSING NUMBER ACTIVATION</small><h3>流年 × 缺失数激活</h3></div><span>补课机制</span></div><div class="empty-mini">三角形内目前没有缺失数，因此没有“流年直接命中缺失数”的判断。</div></div>';
  }
  return '<div class="year-missing-wrap"><div class="card-heading"><div><small>MISSING NUMBER ACTIVATION</small><h3>流年 × 缺失数激活</h3></div><span>直接命中 ＞ 联合码激活 ＞ 未激活</span></div>'
    +'<p class="panel-note">当流年数正好等于缺失数，是最强激活；流年联合码里出现缺失数，是次一级激活。这里的“激活”不是坏事，而是今年更容易被现实推着练习原本不熟悉的能力。</p>'
    +'<div class="missing-activation-grid">'+result.rows.map(x=>'<div class="missing-activation-card '+(x.directHit?'strong':'')+'"><div><strong>缺失 '+x.n+'</strong><span>'+esc(x.level)+'</span></div><p>'+esc(x.cfg.feel)+'</p><small>反模式：'+esc(x.cfg.pattern)+'</small><em>'+esc(x.detail)+'</em></div>').join("")+'</div>'
    +'<div class="formula-note">输入“流年联合码”后，系统会继续判断缺失数落在第1位起因、第2位过程还是第3位结果，并把卡点位置一起显示。</div>'
    +'</div>';
}

function regionYearCopy(number,region){
  if(number===7 && YEAR7_REGION_EXAMPLES[region.key]) return YEAR7_REGION_EXAMPLES[region.key];
  const y=YEAR_THEMES[number];
  return "流年"+number+"「"+y.title+"」落在这里时，会把“"+region.focus+"”放到今年更明显的位置。重点是："+region.lesson+"。";
}

function yearSourcePanel(a,personal,environment){
  const axes=yearSourceAxes(a);
  const count=Number(a.combinedEnergy?.counts?.[environment.number]||0);
  const personalDerived=Object.entries(axes.personal.derived).map(([k,v])=>k+" "+v.join("")).join(" · ");
  return '<div class="year-source-panel"><div class="card-heading"><div><small>YEAR SOURCE</small><h3>自身流年 × 大环境流年</h3></div><span>两套来源</span></div>'
    +'<div class="year-source-grid"><div><small>自身流年</small><b>MNO '+esc(axes.personal.baseCode)+'</b><p>从 MNO 主轴开始，再看这条主轴衍生出去的位置。</p><span>'+esc(personalDerived)+'</span></div>'
    +'<div><small>大环境流年</small><b>KLM '+esc(axes.environment.baseCode)+'</b><p>从 KLM 主轴开始，再看 KLM 衍生出去的位置。</p><span>'+(count>0?'命盘中有今年的大环境数字 '+environment.number:'命盘中没有今年的大环境数字 '+environment.number)+'</span></div></div>'
    +'<div class="formula-note">大环境像共同天气，个人流年像个人体感。两层要一起看。</div></div>';
}

function yearPriorityTable(){
  return '<div class="year-priority card"><div class="card-heading"><div><small>READING WEIGHT</small><h3>黄金流年解读权重</h3></div><span>100% 主体判断</span></div>'
    +'<div class="priority-row"><b>流年数本身</b><span>50%</span><em>全年主旋律／9年循环位置</em></div>'
    +'<div class="priority-row"><b>流年落位</b><span>25%</span><em>今年的主场与生活领域</em></div>'
    +'<div class="priority-row"><b>流年联合码</b><span>15%</span><em>起因 → 过程 → 结果</em></div>'
    +'<div class="priority-row"><b>缺失数叠加</b><span>10%</span><em>顺手年还是补课年</em></div>'
    +'<div class="priority-row auxiliary"><b>大环境流年</b><span>辅助</span><em>看同向加速、节奏拉扯或过渡气候，不计入上面100%</em></div>'
    +'</div>';
}

function yearNineCycle(currentNumber){
  return '<div class="nine-cycle">'+[1,2,3,4,5,6,7,8,9].map(n=>{
    const y=YEAR_THEMES[n];
    return '<div class="nine-year '+(n===currentNumber?'active':'')+'"><strong>'+n+'</strong><span>'+esc(y.title)+'</span><small>'+esc(y.cycle)+' · '+esc(y.rhythm)+'</small></div>';
  }).join("")+'</div>';
}

function yearLocationPanel(a,personal){
  const analysis=analyzeYearLocationPriority(a,personal.number);
  const primaryKeys=new Set(analysis.primary.map(x=>x.key));
  const secondaryKeys=new Set(analysis.secondary.map(x=>x.key));
  const backgroundKeys=new Set(analysis.background.map(x=>x.key));

  const cards=analysis.regions.map(r=>{
    const roles=r.positions.map(i=>YEAR_CODE_POSITION[i]).join("／");
    const cls=primaryKeys.has(r.key)?"primary-hit":secondaryKeys.has(r.key)?"secondary-hit":backgroundKeys.has(r.key)?"background-hit":r.direct?"hit":"";
    return '<button type="button" class="year-region-card '+cls+'" data-v12-year-region="'+r.key+'">'
      +'<small>'+esc(r.label)+'</small><b>'+esc(r.title)+'</b><span>'+esc(r.code)+'</span>'
      +(r.direct?'<em>直接命中 '+personal.number+(roles?' · '+esc(roles):'')+(r.count>1?' · 出现'+r.count+'次':'')+'</em>':'')
      +(backgroundKeys.has(r.key)?'<em>相邻连带／背景音</em>':'')
      +'</button>';
  }).join("");

  const hierarchy='<div class="year-hit-hierarchy"><span>① 直接命中 ＞ ② 流年联合码共振 ＞ ③ 相邻连带</span><span>内外同时触动：内三角优先</span><span>主性格区直接命中：主场优先</span></div>';

  return '<div class="year-location-wrap"><div class="card-heading"><div><small>YEAR POSITION</small><h3>第二优先 · 流年数落在命盘哪里</h3></div><span>流年数 = 什么能量｜位置 = 哪个领域</span></div>'
    +hierarchy
    +'<div class="year-region-grid">'+cards+'</div>'
    +'<div class="formula-note">'+esc(analysis.note)+'</div>'
    +'<div id="v12-year-region-detail" class="year-region-detail"><div class="empty-mini">点击一个区域，查看这个流年数字落在该生活领域时怎么解读。</div></div></div>';
}

function yearJointExample(){
  const left=calculateYearJointCode(8,7,6);
  const right=calculateYearJointCode(4,7,8);
  const bottom=calculateYearJointCode(6,7,4);
  return '<div class="year-joint-example"><div><small>左边</small><b>'+left.code+'</b><span>8 → 7 → 6</span></div><div><small>右边</small><b>'+right.code+'</b><span>4 → 7 → 8</span></div><div><small>底边</small><b>'+bottom.code+'</b><span>6 → 7 → 4</span></div></div>';
}

function yearJointPanel(){
  return '<div class="year-joint-wrap"><div class="card-heading"><div><small>YEAR JOINT CODE</small><h3>第三优先 · 流年联合码</h3></div><span>权重15% · 起因 → 过程 → 结果</span></div>'
    +'<p class="panel-note">已确认完整公式：每条外三角形边都有两个固定端点，把流年数放在中间，按“端点A → 流年数 → 端点B”组成三位码。百位=起因／触发点，十位=过程／经历方式，个位=结果／功课。</p>'
    +'<div class="formula-note">示例：左边端点8与6，流年7 → 8·7·6 = 876；右边端点4与8 → 478；底边端点6与4 → 674。每9年再次遇到同一个流年数时，这三组联合码会重复出现。</div>'
    +yearJointExample()+'<div class="year-joint-control"><input id="v12-year-joint-input" inputmode="numeric" maxlength="3" placeholder="例如 573"><button type="button" class="btn btn-light" id="v12-year-joint-lookup">读取联合码</button></div>'
    +'<div id="v12-year-joint-output" class="year-region-detail"><div class="empty-mini">输入3位流年联合码后，会显示对应的AURMOVA资料，并检查缺失数是否在起因／过程／结果被激活。</div></div></div>';
}

function yearFinalSummary(a,personal,environment,climate){
  const location=analyzeYearLocationPriority(a,personal.number);
  const primary=location.primary.length?location.primary.map(x=>x.title).join("、"):"未出现直接主场";
  const missing=(a.innerEnergy?.missing||[]).includes(personal.number);
  const lesson=missing?"补课年":"顺手年";
  const action=missing
    ? "今年最重要的是不要逃开不熟悉的能力，而是把这股能量练成新的工具。"
    : "今年可以优先调用自己已经比较熟悉的能力推进，再用流年提醒自己避免过度。";
  return '<div class="year-final-summary card"><div class="card-heading"><div><small>FINAL READING FLOW</small><h3>完整解读总结</h3></div><span>6步整合</span></div>'
    +'<ol class="year-summary-steps">'
    +'<li><b>流年数：</b>'+personal.number+' · '+esc(personal.title)+'，属于'+esc(personal.cycle)+'，今年节奏偏“'+esc(personal.rhythm)+'”。</li>'
    +'<li><b>流年主场：</b>'+esc(primary)+'。</li>'
    +'<li><b>流年联合码：</b>外三角每条边用“端点A → 流年数 → 端点B”生成三位码，再按“起因 → 过程 → 结果”读取。</li>'
    +'<li><b>缺失数叠加：</b>'+lesson+'。'+(missing?'流年数正好命中缺失数，属于最强激活。':'流年数没有直接命中缺失数，整体更容易用已有能力推进。')+'</li>'
    +'<li><b>大环境：</b>'+environment.number+' · '+esc(environment.title)+'；与个人流年的关系是“'+esc(climate.type)+'”。</li>'
    +'<li><b>一句话：</b>今年是“'+esc(personal.title)+'”年，最重要的是'+esc(action)+'</li>'
    +'</ol></div>';
}

function axisGroupsHtml(groups,labels,activeNumber=null,allEnvironment=false){
  return '<div class="golden-axis-grid">'+Object.entries(groups).map(([name,arr],i)=>{
    const codeValue=arr.join("");
    const hit=activeNumber!==null && activeNumber!==undefined && arr.includes(activeNumber);
    const data=getFlootKnowledge(codeValue)||findJointCode(codeValue);
    const positive=data?.strengths||data?.text||"这组联合码已计算完成；详细正向资料按AURMOVA资料库读取。";
    const negative=data?.challenges||"负面／卡点资料若原始库未写明，系统不会自行杜撰。";
    return '<article class="golden-axis-code '+(hit?'hit':'')+' '+(allEnvironment?'environment-code':'')+'"><small>'+esc(labels[i]||"")+' · '+esc(name)+'</small><strong>'+esc(codeValue)+'</strong>'
      +(hit?'<em>个人流年数 '+activeNumber+' 在这组出现</em>':'')
      +(allEnvironment?'<em>大环境四码之一 · 全年都要看</em>':'')
      +'<p><b>正面：</b>'+esc(positive)+'</p><p><b>负面／卡点：</b>'+esc(negative)+'</p>'
      +(data?.growth?'<p><b>修正方向：</b>'+esc(data.growth)+'</p>':'')
      +'</article>';
  }).join("")+'</div>';
}

function goldenYearVisual(snap){
  const p=snap.yearPositions||{};
  const faux={positions:p,birthDigits:[p.A,p.B,p.C,p.D,p.E,p.F,p.G,p.H],mainPersonality:snap.mainPersonality};
  const personalCodes=Object.entries(snap.personalAxis.groups).map(([k,v])=>k+" "+v.join("")).join(" · ");
  const envCodes=snap.environmentCodes.map(x=>x.key+" "+x.code).join(" · ");
  return '<div class="golden-chart-visual"><div class="formula-note"><b>同一张固定基础数字盘</b><br>自身流年：'+esc(personalCodes)+'<br>大环境：'+esc(envCodes)+'</div>'+blueprintMap(faux)+'</div>';
}

function yearTeachingPanel(){
  const soup=YEAR_TEACHING_ANALOGIES.soup,weather=YEAR_TEACHING_ANALOGIES.weather;
  return '<details class="year-teaching-note"><summary>学员教学解释 · 为什么个人流年要和大环境一起看？</summary>'
    +'<div class="teaching-analogy"><div><small>'+esc(soup.title)+'</small><b>'+esc(soup.short)+'</b><p>'+esc(soup.script)+'</p></div>'
    +'<div><small>'+esc(weather.title)+'</small><b>'+esc(weather.short)+'</b><p>'+esc(weather.script)+'</p></div></div>'
    +'<div class="formula-note">教学重点：汤底＝KLN／KNV／LNW／VWX四组大环境码；个人加料＝MNO／MOQ／NOP／PQR四组自身流年码。不是“一个大环境数字＋一个个人数字”这么简单。</div>'
    +'</details>';
}

function yearSnapshotCard(c,year,label){
  const snap=calculateGoldenYearSnapshot(c.birthday,year);
  if(!snap) return "";
  const p=snap.personal;
  const missing=snap.innerEnergy?.missing||[],repeated=snap.innerEnergy?.repeated||[];
  const personalHits=snap.personalHits.length?snap.personalHits.map(x=>x.key+" "+x.code).join(" · "):"没有直接重复命中";
  return '<section class="golden-year-sheet '+(label==="今年"?"current":"")+'">'
    +'<div class="golden-year-sheet-head"><div><small>'+esc(label)+' · '+year+'</small><h3>自身流年 O='+p.number+' · '+esc(p.title)+'</h3></div><div class="golden-weather"><small>大环境主码 KLN</small><b>'+esc(snap.environmentMainCode)+'</b><span>再连同 KNV / LNW / VWX 一起看</span></div></div>'
    +'<div class="year-positive-negative"><div><small>自身流年正面</small><b>'+esc(p.role)+'</b><p>'+esc(p.summary)+'</p></div><div><small>自身流年负面／反模式</small><b>'+esc(p.pit)+'</b><p>'+esc(p.advice)+'</p></div></div>'
    +goldenYearVisual(snap)
    +'<div class="golden-axis-title"><div><small>SELF YEAR AXIS</small><h4>自身流年 · MNO → MOQ / NOP → PQR</h4></div><span>个人这年的料</span></div>'
    +'<p class="panel-note">MNO看因果；MOQ、NOP看过程；PQR看结果。个人流年数直接读取这张年盘的O位，不再另外计算另一套数字。</p>'
    +axisGroupsHtml(snap.personalAxis.groups,snap.personalAxis.labels,p.number,false)
    +'<div class="formula-note">O位／个人流年＝'+p.number+'｜在四组自身流年码中的重复命中：'+esc(personalHits)+'。</div>'
    +'<div class="golden-axis-title"><div><small>ENVIRONMENT YEAR AXIS</small><h4>大环境／天气 · KLN → KNV / LNW → VWX</h4></div><span>所有人的共同汤底</span></div>'
    +'<p class="panel-note">KLN是大环境因果主码；KNV、LNW是两个过程；VWX是结果。四组一起才是这一年的整体大环境，不能只抽一个数字代表整年。</p>'
    +axisGroupsHtml(snap.environmentAxis.groups,snap.environmentAxis.labels,null,true)
    +environmentSynthesis(snap)
    +'<div class="golden-support-grid">'
      +'<div><span>固定 IJM</span><b>'+snap.fixedFatherCode+'</b></div>'
      +'<div><span>起始数</span><b>'+snap.startingThoughtCode+'</b></div>'
      +'<div><span>制约数</span><b>'+snap.constraintCode+'</b></div>'
      +'<div><span>内心码</span><b>'+snap.innerCode+'</b></div>'
      +'<div><span>潜意识</span><b>'+snap.subconsciousCode+'</b></div>'
      +'<div><span>年盘内三角</span><b>'+snap.yearTriangle.join("")+'</b></div>'
      +'<div><span>缺失数</span><b>'+(missing.length?missing.join(" · "):"无")+'</b></div>'
      +'<div><span>过强／挑战</span><b>'+(repeated.length?repeated.join(" · "):"无")+'</b></div>'
    +'</div>'
    +goldenInnerDensityPanel(snap)
    +missingActivationPanel({innerEnergy:snap.innerEnergy},p)
    +'</section>';
}

function yearPanel(c,target){
  const year=Number(target)||new Date().getFullYear();
  const current=calculateGoldenYearSnapshot(c.birthday,year);
  const envCodes=current.environmentCodes.map(x=>x.code).join(" · ");
  return '<div class="module-render golden-year-v22">'
    +'<div class="card-heading"><div><small>AURMOVA GOLDEN YEAR BLUEPRINT</small><h2>黄金流年蓝图 · 个人流年 × 大环境四码</h2></div><span>去年 · 今年 · 明年</span></div>'
    +'<div class="year-control"><label>以哪一年为“今年” <input type="number" id="v6-year-target" min="1900" max="2200" value="'+year+'"></label><button type="button" class="btn btn-light" id="v6-recalc-year">重新计算</button></div>'
    +'<div class="formula-note"><b>固定图版：</b>黄金流年也使用与人生／关系／亲子／合作完全相同的方框数字盘，只把年份替换为目标年份重新排盘。计算逻辑：保留顾客出生的“日＋月”；自身流年看 MNO／MOQ／NOP／PQR；大环境直接看 KLN／KNV／LNW／VWX。大环境不再另算一个单独数字来代表整年。</div>'
    +'<div class="golden-master-summary"><div><small>今年自身流年</small><strong>'+current.personal.number+'</strong><span>O位 · '+esc(current.personal.title)+'</span></div><div><small>今年大环境主码</small><strong>'+esc(current.environmentMainCode)+'</strong><span>KLN · 因果</span></div><div><small>大环境四组</small><b>'+esc(envCodes)+'</b><p>KLN因果 → KNV / LNW过程 → VWX结果；四组共同定义今年的“天气”。</p></div></div>'
    +yearTeachingPanel()
    +yearSnapshotCard(c,year-1,"去年")
    +yearSnapshotCard(c,year,"今年")
    +yearSnapshotCard(c,year+1,"明年")
    +'</div>';
}

function partnerRow(p,i){
  let result='<div class="partner-result empty-mini">填写生日后自动计算这位伙伴。</div>';
  if(p.birthday){
    const a=calculateBlueprint(p.birthday);
    if(a) result='<div class="partner-result">'+blueprintMap(a,true)+'<span>伙伴 '+(i+1)+'</span><b>主性格 '+a.mainPersonality+'</b><span>坐镇码 '+a.seatCode+'</span><span>父亲基因 '+code(Object.values(a.fatherGenes))+'</span><span>母亲基因 '+code(Object.values(a.motherGenes))+'</span></div>';
  }
  return '<article class="partner-card" data-v6-partner="'+i+'"><div class="partner-title"><b>合作伙伴 '+(i+1)+'</b><button type="button" class="danger-lite" data-v6-remove-partner="'+i+'">移除</button></div><div class="partner-fields"><label>姓名<input data-v6-partner-name="'+i+'" value="'+esc(p.name||"")+'" placeholder="伙伴姓名"></label><label>生日（日/月/年）<input inputmode="numeric" data-v6-partner-birthday="'+i+'" value="'+esc(p.birthday||"")+'" placeholder="21/11/1995"></label></div>'+result+'</article>';
}
function cooperationPanel(c){
  const ps=loadPartners(c.id),a=calculateBlueprint(c.birthday);
  return '<div class="module-render"><div class="card-heading"><div><small>COOPERATION BLUEPRINT</small><h2>多人合作蓝图</h2></div><span>伙伴人数不设上限</span></div>'
    +blueprintSheet(c,a,"合作蓝图 · "+c.name)
    +plainLanguagePanel(a)
    +'<p class="panel-note">每位伙伴保留自己的完整结构。系统不会为了凑结果而把多人硬合成一个没有课程依据的新号码；会逐一比较主性格、坐镇码、父母基因、阶段和合作位置。</p>'
    +'<div id="v6-partners">'+(ps.length?ps.map(partnerRow).join(""):'<div class="empty-mini">还没有合作伙伴。</div>')+'</div>'
    +'<div class="actions"><button type="button" class="btn btn-primary" id="v6-add-partner">＋ 增加合作伙伴</button><button type="button" class="btn btn-light" id="v6-save-partners">保存合作伙伴</button></div></div>';
}

function mapBox(x,y,value,w=42,h=50,extra=""){
  const v=value===undefined||value===null?"":value;
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1" fill="#fffdf8" stroke="#d6c39b" stroke-width="1.5" '+extra+'/><text x="'+(x+w/2)+'" y="'+(y+h/2+9)+'" text-anchor="middle" font-family="Georgia,serif" font-size="24" fill="#292621">'+esc(v)+'</text>';
}
function blueprintMap(a,compact=false){
  const p=a.positions||{};
  const b=(a.birthDigits&&a.birthDigits.length?a.birthDigits:[p.A,p.B,p.C,p.D,p.E,p.F,p.G,p.H]).map(v=>v??"");
  const base=b.map((n,i)=>mapBox(238+i*45,420,n,38,48)).join("");
  return '<div class="aurmova-fixed-map'+(compact?' compact':'')+'" style="overflow-x:auto">'
    +'<svg viewBox="0 0 840 490" role="img" aria-label="AURMOVA 固定基础数字盘" style="width:100%;min-width:'+(compact?'560':'700')+'px;height:auto;display:block;margin:auto">'
      +'<g fill="none" stroke="#c99a45" stroke-width="3">'
        +'<polygon points="390,135 210,390 570,390"/>'
        +'<line x1="312" y1="245" x2="468" y2="245"/>'
        +'<line x1="260" y1="320" x2="520" y2="320"/>'
        +'<line x1="390" y1="245" x2="390" y2="390"/>'
      +'</g>'
      +'<g fill="none" stroke="#d7b878" stroke-width="1.5" stroke-dasharray="5 5">'
        +'<line x1="390" y1="88" x2="390" y2="135"/>'
        +'<line x1="207" y1="338" x2="210" y2="390"/>'
        +'<line x1="602" y1="338" x2="570" y2="390"/>'
      +'</g>'
      +'<g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="13" font-weight="600" fill="#a67d3e">'
        +'<text x="390" y="22" text-anchor="middle">【41岁–60岁】</text>'
        +'<text x="100" y="270" text-anchor="middle">【21岁–40岁】</text>'
        +'<text x="690" y="270" text-anchor="middle">【61岁以后】</text>'
      +'</g>'
      +'<g>'+mapBox(369,36,p.R)+mapBox(301,82,p.P)+mapBox(437,82,p.Q)+'</g>'
      +'<g>'+mapBox(31,286,p.U)+mapBox(112,286,p.S)+mapBox(166,286,p.T)+'<text x="92" y="318" text-anchor="middle" font-size="20" fill="#8c795d">=</text></g>'
      +'<g>'+mapBox(602,286,p.V)+mapBox(656,286,p.W)+mapBox(727,286,p.X)+'<text x="714" y="318" text-anchor="middle" font-size="20" fill="#8c795d">=</text></g>'
      +'<g>'+mapBox(369,166,p.O,42,52)+mapBox(325,258,p.M)+mapBox(413,258,p.N)+mapBox(270,333,p.I)+mapBox(326,333,p.J)+mapBox(412,333,p.K)+mapBox(468,333,p.L)+'</g>'
      +'<g>'+base+'</g>'
    +'</svg></div>';
}
function blueprintSheet(c,a,title="完整人生蓝图"){
  return '<section class="filled-blueprint">'
    +'<div class="filled-blueprint-head"><div><small>AURMOVA BLUEPRINT</small><h3>'+esc(title)+'</h3><p>'+esc(c.name||"")+' · '+esc(c.birthday||"")+'</p></div><div class="bp-main-number"><span>主性格</span><b>'+a.mainPersonality+'</b></div></div>'
    +'<div class="bp-core-grid">'
      +'<div><span>父亲基因</span><b>'+a.fatherCode+'</b></div><div><span>母亲基因</span><b>'+a.motherCode+'</b></div><div><span>坐镇码</span><b>'+a.seatCode+'</b></div>'
      +'<div><span>起始数</span><b>'+a.startingThoughtCode+'</b></div><div><span>制约数</span><b>'+a.constraintCode+'</b></div><div><span>内心码</span><b>'+a.innerCode+'</b></div>'
      +'<div><span>潜意识</span><b>'+a.subconsciousCode+'</b></div><div><span>外心数</span><b>'+a.outerHeartCode+'</b><small>'+esc(a.outerHeartMeaning||"")+'</small></div><div><span>缺失数</span><b>'+(a.innerEnergy.missing.length?a.innerEnergy.missing.join(" · "):"无")+'</b></div>'
    +'</div>'
    +'<div class="formula-note">固定图版：所有蓝图统一使用 Josephine 指定的方框结构。21–40：U = S + T；41–60：R = P + Q；61岁以后：V + W = X。</div>'
    +blueprintMap(a)
    +'</section>';
}

function innerPolarityPanel(a){
  const present=DIGITS.filter(n=>(a.innerEnergy.counts[n]||0)>0);
  return '<div class="foundation-block"><div class="card-heading"><div><small>INNER DIGITS</small><h3>三角形内数字 · 正面与负面</h3></div><span>自动读取</span></div>'
    +'<div class="polarity-grid">'+present.map(n=>{const d=INNER_DIGIT_POLARITY[n],count=a.innerEnergy.counts[n];return '<div><b>'+n+' · '+count+'次</b><p><strong>正面：</strong>'+esc(d.positive)+'</p><p><strong>负面：</strong>'+esc(d.negative)+'</p></div>'}).join("")+'</div></div>';
}

function originalFamilyPanel(a){
  const n=a.constraintCode,d=CHILDHOOD_MODES[n];
  return '<div class="foundation-block"><div class="card-heading"><div><small>ORIGIN PATTERN</small><h3>制约数 '+n+' · 原生家庭模式</h3></div><span>基础必讲</span></div>'
    +'<p><b>制约数：</b>'+esc(CONSTRAINT_NOTES[n]||"")+'</p>'
    +(d?'<div class="origin-grid"><div><span>小时候发生的模式</span><p>'+esc(d.pattern)+'</p></div><div><span>小时候真正需要</span><p>'+esc(d.need)+'</p></div><div><span>长大后容易重复</span><p>'+esc(d.adult)+'</p></div><div><span>开解方向</span><p>'+esc(d.guide)+'</p></div></div>':'')
    +'<div class="formula-note">原生家庭看“成长环境发生了什么”；制约数看这些经历在当事人身上留下了什么反应模式。两者分开讲。</div></div>';
}

function energy679Panel(a){
  return '<div class="foundation-block"><div class="card-heading"><div><small>679 · SOURCE RETAINED</small><h3>679综合</h3></div><span>原资料保留 · 不再用错误计数法</span></div>'
    +'<div class="formula-note"><b>已找回的课程索引：</b>现有资料曾记录“679是人生的福禄寿”，并保留6／7／9分别与财富敏锐度、人缘贵人、机会认同有关的基础关键词；但同一段原文又出现“两个7一个9”的矛盾句，因此不能把它简化成“数一数6、7、9出现几次就下结论”。</div>'
    +'<div class="question-box"><b>Josephine 目前可这样说：</b><br>“679这一组我会看资源、人际和机会怎样互相承接，但不会只凭某个数字出现几次就断定好坏。这里要配合它落在哪个位置、跟哪些组合一起出现，再回到你的真实经历验证。”</div>'
    +'<p class="panel-note">原拍照页的完整判断条件仍标记为“待找回原页逐条复核”，不会再用旧版简化规则顶替。</p></div>';
}

function mandatoryJointCodes(a){
  const all=[
    ...Object.values(a.phases["21–40"]),
    ...Object.values(a.phases["41–60"]),
    ...Object.values(a.phases["61+"])
  ].map(x=>x.join(""));
  const unique=[...new Set(all)];
  return '<div class="foundation-block"><div class="card-heading"><div><small>81 JOINT CODES</small><h3>联合码 · 正面 + 负面一起讲</h3></div><span>自动必读</span></div>'
    +'<div class="joint-stack">'+unique.map((x,i)=>jointBlock(x,"联合码 "+(i+1))).join("")+'</div></div>';
}

function detailedEnergyPanel(a){
  const missing=a.innerEnergy?.missing||[], challenges=a.innerEnergy?.repeated||[];
  const card=(n,type)=>{const d=ENERGY_LIBRARY[n]||{};return '<article><b>'+(type==="missing"?"缺失 ":"挑战 ")+n+' · '+esc(d.name||"")+'</b>'
    +(type==="missing"?'<p><strong>常见表现：</strong>'+esc(d.low||"")+'</p><p><strong>成长／补足方向：</strong>'+esc(d.gift||"")+'</p>':'<p><strong>正向潜力：</strong>'+esc(d.gift||"")+'</p><p><strong>过强时：</strong>'+esc(d.high||"")+'</p>')
    +'<small>咨询时先用生活场景验证，不把数字当成定论。</small></article>';};
  return '<div class="foundation-block"><div class="card-heading"><div><small>MISSING & CHALLENGE</small><h3>缺失数 · 挑战数 · 完整白话</h3></div><span>可直接咨询</span></div>'
    +'<h4>缺失数</h4><div class="v23-detail-grid">'+(missing.length?missing.map(n=>card(n,"missing")).join(""):'<div class="empty-mini">没有明显缺失数。</div>')+'</div>'
    +'<h4>挑战数／重复能量</h4><div class="v23-detail-grid">'+(challenges.length?challenges.map(n=>card(n,"challenge")).join(""):'<div class="empty-mini">目前没有重复2次以上的挑战数。</div>')+'</div></div>';
}
function plainLanguagePanel(a){
  const d=MAIN_DETAIL[a.mainPersonality]||{}, start=DIGIT_CORE[a.startingThoughtCode]||{}, inner=DIGIT_CORE[a.innerCode]||{}, sub=DIGIT_CORE[a.subconsciousCode]||{};
  return '<div class="foundation-block aurmova-plain"><div class="card-heading"><div><small>JOSEPHINE PLAIN LANGUAGE</small><h3>白话咨询版 · 从数字直接讲到生活</h3></div><span>可照读</span></div>'
    +'<div class="question-box"><b>主性格 '+a.mainPersonality+' × 起始数 '+a.startingThoughtCode+'：</b><br>“你的核心比较像'+esc(d.title||"")+'，平时会有'+esc(d.behavior||"")+'。但你一进入新环境或碰到新事情，第一步更容易先启动‘'+esc(start.core||"")+'’这一套。它的优势是'+esc(start.gift||"")+'；压力大时要留意'+esc(start.shadow||"")+'。”</div>'
    +'<div class="origin-grid">'
      +'<div><span>内驱力</span><p>'+esc(d.drive||"")+'</p></div>'
      +'<div><span>情感需求</span><p>'+esc(d.emotion||"")+'</p></div>'
      +'<div><span>童年模式</span><p>'+esc(d.childhood||"")+'</p></div>'
      +'<div><span>核心天赋</span><p>'+esc(d.talents||"")+'</p></div>'
      +'<div><span>内心码 '+a.innerCode+'</span><p>'+esc(inner.core||"")+'｜优势：'+esc(inner.gift||"")+'｜卡点：'+esc(inner.shadow||"")+'</p></div>'
      +'<div><span>潜意识码 '+a.subconsciousCode+'</span><p>'+esc(sub.core||"")+'｜优势：'+esc(sub.gift||"")+'｜卡点：'+esc(sub.shadow||"")+'</p></div>'
    +'</div>'
    +'<div class="question-box"><b>Josephine 可以直接收尾：</b><br>'+esc(d.script||"")+'</div>'
    +'<div class="question-box"><b>验证顾客：</b><br>“这些里面，哪一段最像你最近真实发生的事情？你给我一个最近的例子，我再顺着你的实际情况往下解。”</div>'
    +'</div>';
}
function lifeBlueprintPanel(c){
  const a=calculateBlueprint(c.birthday);
  const profile=PERSONALITY_LIBRARY[a.mainPersonality];
  const detail=MAIN_DETAIL[a.mainPersonality];
  const qs=PERSONALITY_QUESTIONS[a.mainPersonality]||[];
  const challenges=a.innerEnergy.repeated||[];
  return '<div class="module-render">'
    +'<div class="card-heading"><div><small>LIFE BLUEPRINT</small><h2>人生蓝图 · 完整自动解析</h2></div><span>不是勾选项 · 每次必读</span></div>'
    +blueprintSheet(c,a,"人生蓝图 · "+c.name)
    +plainLanguagePanel(a)
    +'<div class="foundation-block"><div class="card-heading"><div><small>MAIN PERSONALITY</small><h3>主性格 '+a.mainPersonality+' · '+esc(profile?.title||"")+'</h3></div><span>正面 + 负面</span></div>'
      +'<div class="year-positive-negative"><div><small>正面优势</small><p>'+esc((profile?.positive||[]).join("；"))+'</p></div><div><small>负面／压力模式</small><p>'+esc((profile?.negative||[]).join("；"))+'</p></div></div>'
      +(detail?'<div class="origin-grid"><div><span>思考／行为</span><p>'+esc(detail.thinking||"")+' '+esc(detail.behavior||"")+'</p></div><div><span>说话／压力</span><p>'+esc(detail.speech||"")+' '+esc(detail.stress||"")+'</p></div><div><span>情感需求</span><p>'+esc(detail.emotion||"")+'</p></div><div><span>核心天赋</span><p>'+esc(detail.talents||"")+'</p></div></div>':'')
      +'<div class="question-box"><b>'+a.mainPersonality+'号人专属提问：</b><br>'+qs.map((q,i)=>(i+1)+"）"+esc(q)).join("<br>")+'</div>'
    +'</div>'
    +'<div class="foundation-block"><div class="card-heading"><div><small>GENE & SEAT</small><h3>父母基因影响 · 坐镇码</h3></div><span>基础必讲</span></div><div class="joint-stack">'+jointBlock(a.fatherCode,"父亲基因")+jointBlock(a.motherCode,"母亲基因")+jointBlock(a.seatCode,"坐镇码／主性格结构")+'</div></div>'
    +originalFamilyPanel(a)
    +innerPolarityPanel(a)
    +detailedEnergyPanel(a)
    +energy679Panel(a)
    +'<div class="foundation-block"><div class="card-heading"><div><small>THREE PHASES</small><h3>三阶段能量 · 全部表达</h3></div><span>21–40 · 41–60 · 61+</span></div>'
      +phaseDetails(a,"21–40")+phaseDetails(a,"41–60")+phaseDetails(a,"61+")
    +'</div>'
    +'</div>';
}

function miniBlueprint(person){
  if(!person?.birthday) return '<div class="empty-mini">填写生日后生成蓝图。</div>';
  const a=calculateBlueprint(person.birthday); if(!a)return '<div class="empty-mini">生日格式请用 日/月/年。</div>';
  return '<div class="mini-blueprint fixed-map-mini">'+blueprintMap(a,true)
    +'<div class="mini-blueprint-meta"><span>主性格 <b>'+a.mainPersonality+'</b></span><span>坐镇码 <b>'+a.seatCode+'</b></span><span>父亲 <b>'+a.fatherCode+'</b></span><span>母亲 <b>'+a.motherCode+'</b></span></div></div>';
}

function relationshipCross(a,b){
  const shared=DIGITS.filter(n=>a.innerEnergy.present.includes(n)&&b.innerEnergy.present.includes(n));
  const tensionA=DIGITS.filter(n=>(a.innerEnergy.counts[n]||0)>=2&&b.innerEnergy.missing.includes(n));
  const tensionB=DIGITS.filter(n=>(b.innerEnergy.counts[n]||0)>=2&&a.innerEnergy.missing.includes(n));
  return '<div class="relationship-cross"><div><small>共同容易理解的数字</small><b>'+(shared.length?shared.join(" · "):"暂无明显重合")+'</b></div><div><small>A强／B缺</small><b>'+(tensionA.length?tensionA.join(" · "):"无")+'</b></div><div><small>B强／A缺</small><b>'+(tensionB.length?tensionB.join(" · "):"无")+'</b></div></div>'
    +'<div class="formula-note">这里是双方蓝图的交叉观察线索，不用单一合数替关系下结论。重点继续结合两人的负面模式、制约数、原生家庭和真实互动验证。</div>';
}

function relationshipPanel(c){
  const r=loadRelationship(c.id),a=calculateBlueprint(c.birthday),b=r.birthday?calculateBlueprint(r.birthday):null;
  return '<div class="module-render"><div class="card-heading"><div><small>RELATIONSHIP BLUEPRINT</small><h2>关系蓝图 · 双方资料</h2></div><span>两张蓝图交叉看</span></div>'
    +blueprintSheet(c,a,"关系蓝图 · "+c.name)
    +plainLanguagePanel(a)
    +'<div class="relation-form card"><label>关系类型<select id="v20-relation-type"><option '+(r.type==="伴侣／感情"?"selected":"")+'>伴侣／感情</option><option '+(r.type==="家人"?"selected":"")+'>家人</option><option '+(r.type==="朋友"?"selected":"")+'>朋友</option></select></label><label>对方姓名<input id="v20-relation-name" value="'+esc(r.name||"")+'" placeholder="对方姓名"></label><label>对方生日（日/月/年）<input id="v20-relation-birthday" value="'+esc(r.birthday||"")+'" placeholder="21/11/1995"></label><button type="button" class="btn btn-primary" id="v20-save-relation">保存并生成双方蓝图</button></div>'
    +'<div class="two-blueprints"><div><h3>'+esc(c.name)+' · 当事人</h3>'+miniBlueprint({birthday:c.birthday})+'</div><div><h3>'+esc(r.name||"对方")+'</h3>'+miniBlueprint(r)+'</div></div>'
    +(b?relationshipCross(a,b):'<div class="empty-mini">填写对方资料后，系统会把双方主性格、内心码、制约数、原生模式、缺失／过强与共同数字放在一起比较。</div>')
    +(b?'<details class="blueprint-expander"><summary>展开双方完整蓝图</summary>'+blueprintSheet(c,a,c.name+' · 关系蓝图个人盘')+blueprintSheet({name:r.name||"对方",birthday:r.birthday},b,(r.name||"对方")+' · 关系蓝图个人盘')+'</details>':'')
    +'</div>';
}

function familyMemberCard(role,prefix,person){
  return '<article class="family-member"><h4>'+esc(role)+'</h4><label>姓名<input data-family-field="'+prefix+'.name" value="'+esc(person?.name||"")+'"></label><label>生日（日/月/年）<input data-family-field="'+prefix+'.birthday" value="'+esc(person?.birthday||"")+'" placeholder="21/11/1995"></label>'+miniBlueprint(person)+'</article>';
}

function familyPanel(c){
  const f=loadFamily(c.id),selfA=calculateBlueprint(c.birthday);
  const childCards=(f.children||[]).map((ch,i)=>'<article class="family-member"><div class="partner-title"><h4>孩子 '+(i+1)+'</h4><button type="button" class="danger-lite" data-v20-remove-child="'+i+'">移除</button></div><label>姓名<input data-family-child-name="'+i+'" value="'+esc(ch.name||"")+'"></label><label>生日（日/月/年）<input data-family-child-birthday="'+i+'" value="'+esc(ch.birthday||"")+'" placeholder="21/11/1995"></label>'+miniBlueprint(ch)+'</article>').join("");
  const adults=[f.father?.birthday?calculateBlueprint(f.father.birthday):null,f.mother?.birthday?calculateBlueprint(f.mother.birthday):null].filter(Boolean);
  const kids=(f.children||[]).map(x=>x.birthday?calculateBlueprint(x.birthday):null).filter(Boolean);
  let familyInsight='<div class="empty-mini">填写爸爸、妈妈和孩子资料后，系统会把全家的蓝图放在一起看。</div>';
  if(adults.length&&kids.length){
    const parentMains=adults.map(x=>x.mainPersonality).join(" / ");
    const kidMains=kids.map(x=>x.mainPersonality).join(" / ");
    const parentStrong=DIGITS.filter(n=>adults.some(x=>(x.innerEnergy.counts[n]||0)>=2));
    const kidSensitive=DIGITS.filter(n=>kids.some(x=>x.innerEnergy.missing.includes(n)));
    const overlap=parentStrong.filter(n=>kidSensitive.includes(n));
    familyInsight='<div class="family-insight"><h4>家庭系统观察</h4><p>父母主性格：'+parentMains+'｜孩子主性格：'+kidMains+'</p><p>父母较强数字：'+(parentStrong.join(" · ")||"—")+'｜孩子缺失数字：'+(kidSensitive.join(" · ")||"—")+'</p><p><b>需要特别验证的互动：</b>'+(overlap.length?overlap.join(" · ")+" 在父母较强、孩子较弱，容易形成“父母觉得理所当然，孩子却需要后天学习”的落差。":"目前没有明显的“父母强／孩子缺”重合，继续看主性格、制约数与真实互动。")+'</p></div>';
  }
  return '<div class="module-render"><div class="card-heading"><div><small>PARENT CHILD BLUEPRINT</small><h2>亲子蓝图 · 全家一起看</h2></div><span>爸爸 + 妈妈 + 多个孩子</span></div>'
    +blueprintSheet(c,selfA,"亲子蓝图 · "+c.name)
    +plainLanguagePanel(selfA)
    +'<div class="family-grid">'+familyMemberCard("爸爸","father",f.father||{})+familyMemberCard("妈妈","mother",f.mother||{})+childCards+'</div>'
    +'<div class="actions"><button type="button" class="btn btn-primary" id="v20-add-child">＋ 增加孩子</button><button type="button" class="btn btn-light" id="v20-save-family">保存并重新解析全家</button></div>'
    +familyInsight+'</div>';
}

function renderModule(key,c){
  const panel=document.querySelector("#v6-module-panel");
  if(!panel||!c) return;
  if(key==="黄金流年") panel.innerHTML=yearPanel(c);
  else if(key==="合作蓝图") panel.innerHTML=cooperationPanel(c);
  else if(key==="关系蓝图") panel.innerHTML=relationshipPanel(c);
  else if(key==="亲子蓝图") panel.innerHTML=familyPanel(c);
  else panel.innerHTML=lifeBlueprintPanel(c);
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
      +'<div class="reply-part"><small>③ 再追一层</small><div class="question-box">'+esc(b.next)+'</div>'+(PERSONALITY_QUESTIONS[a.mainPersonality]?.length?'<div class="question-box"><b>'+a.mainPersonality+'号人专属追问：</b><br>'+esc(PERSONALITY_QUESTIONS[a.mainPersonality][Math.min(Number(step)||0,PERSONALITY_QUESTIONS[a.mainPersonality].length-1)])+'</div>':'')+'</div>'
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
function serviceChecklist(c){
  const state=loadService(c.id);
  const items=[
    ["intake","资料已确认"],
    ["chart","完整排盘完成"],
    ["contrast","最大反差已标记"],
    ["opening","开场句已准备"],
    ["session","咨询已完成"],
    ["summary","会后总结已发送"],
    ["followup","1–2天跟进已完成"]
  ];
  return '<div class="service-checklist"><div class="card-heading"><div><small>CONSULTATION SERVICE FLOW</small><h3>从预约到跟进 · 服务进度</h3></div><span>Josephine 私人使用</span></div>'
    +'<div class="service-check-grid">'+items.map(([key,label])=>'<label><input type="checkbox" data-v18-service-check="'+key+'" '+(state[key]?'checked':'')+'><span>'+label+'</span></label>').join("")+'</div>'
    +'</div>';
}

function scriptMarkup(c,a,phase){
  const profile=PERSONALITY_LIBRARY[a.mainPersonality],meta=PHASE_META[phase];
  const y=calculateYearCycleSet(c.birthday,new Date().getFullYear()).current;
  const rows=contrastRows(a).sort((x,y)=>y.diff-x.diff);
  const pick=rows[0];
  const alignment=pick&&pick.diff>0?getInnerOuterAlignment(pick.n,pick.inner,pick.outer):null;
  const opener=alignment?.hook||"这张盘目前没有特别大的内外反差，我们先从你现在最想聊的事情开始。";
  const focusList=(c.consultationFocus||[]).filter(Boolean);
  const focusText=focusList.length?focusList.join(" · "):(c.consultationTheme||"未指定");
  const projectText=(c.consultationTypes?.length?c.consultationTypes:[c.consultationType]).filter(Boolean).join(" / ");
  const birthExtra=c.birthCity?("出生城市 "+c.birthCity):"";
  const personalityQs=PERSONALITY_QUESTIONS[a.mainPersonality]||[];

  const items=[
    ["00 会前准备",
      '<h2>预约前先把资料与重点准备好</h2>'
      +'<p><b>顾客资料：</b>'+esc(c.name)+' · '+esc(c.birthday)+(birthExtra?' · '+esc(birthExtra):'')+'</p>'
      +'<p><b>咨询项目：</b>'+esc(projectText||"未选择")+'</p>'
      +'<p><b>本次咨询重点：</b>'+esc(focusText)+'</p>'
      +'<div class="question-box"><b>5分钟会前准备：</b><br>①确认资料 → ②完整排盘 → ③快速数内外三角 → ④找最大反差 → ⑤标记2–3个重点区域 → ⑥准备一句开场白。</div>'
      +'<p class="panel-note">系统统一按阳历生日计算；不需要出生时间。</p>'],

    ["01 开场破冰",
      '<h2>先让顾客知道：这里不是考试，也不是命运宣判</h2>'
      +'<div class="question-box">你好，我是 Josephine，做心理数字学咨询。今天大概40–60分钟，我会先看你的盘，再帮你看见一些你可能已经感受到、但还没有整理清楚的模式。你不需要懂这套理论，也不用记任何数字；如果我说的和你的真实感受不一样，你随时告诉我——你的经历比这张盘更重要。</div>'
      +'<p><b>如果顾客紧张：</b>“第一次做这种咨询有一点紧张很正常。今天就是聊天，我会带着你走。”</p>'
      +'<p><b>如果顾客观望：</b>不要讲一堆理论，直接给一个小洞察，再问“你听听看像不像你”。</p>'
      +'<p><b>如果判断不出来：</b>“你想直接开始，还是先聊几句热热身？你说了算。”</p>'],

    ["02 最大反差",
      '<h2>先讲一个最值得验证的内外反差</h2>'
      +(pick?'<p>当前最大差距：<b>数字 '+pick.n+'｜内 '+pick.inner+' · 外 '+pick.outer+' · 差 '+pick.diff+'</b></p>':'')
      +'<div class="question-box"><b>开场可以这样说：</b><br>'+esc(opener)+'</div>'
      +'<p>说完后不要马上解释。停一下，让顾客自己回应。重点不是“说中”，而是看顾客的真实经验是否和这个线索对得上。</p>'
      +'<div class="question-box"><b>验证问题：</b><br>'+esc(contrastProbe(alignment?.mode||pick?.direction||"balanced"))+'</div>'
      +'<div class="question-box"><b>'+a.mainPersonality+'号人专属追问：</b><br>'+personalityQs.map((q,i)=>(i+1)+"）"+esc(q)).join("<br>")+'</div>'],

    ["03 故事挂盘",
      '<h2>顾客讲故事后，把故事放回对应区域</h2>'
      +'<p>家庭／父母故事 → 父亲基因或母亲基因；事业故事 → 事业／朋友区；关系／家庭故事 → 家庭区；“我一直都这样” → 主性格与内三角。</p>'
      +'<div class="question-box">“你刚刚讲的这件事，其实可以放回你盘里的这个位置看。这里比较像你骨子里的反应，而这里是你在现实环境里形成的做法。你刚才那个故事，就是这两边差距的一个例子。”</div>'
      +'<p><b>追问：</b>“这个模式最早出现在哪里——家庭、学校，还是工作？”／“你从什么时候开始发现自己会这样？”</p>'],

    ["04 重复模式",
      '<h2>不要急着换主题，先看同一个模式有没有出现在别的领域</h2>'
      +'<div class="question-box">“你发现没有，刚刚讲的这个模式，好像不只发生在一个地方。它有没有也出现在工作、感情、家庭，或你跟朋友相处的时候？”</div>'
      +'<p>如果顾客讲出第二个场景，再把两个位置放在一起看。重点是让顾客自己发现“我一直用同一套模式在面对不同关系”，而不是你替她下结论。</p>'
      +'<p><b>推进顺序：</b>原生家庭 → 当前影响 → 接下来可以怎么调整。</p>'],

    ["05 流年搭配",
      '<h2>再把“长期模式”放进“今年的时间节奏”里</h2>'
      +'<p>今年个人流年：<b>'+y.number+' · '+esc(y.title)+'</b>。'+esc(y.summary)+'</p>'
      +'<div class="question-box">“你今年刚好走到一个 '+esc(y.title)+' 的年份，所以最近这些感受会更明显。我们再看看这个流年数在你的命盘里触动了哪里，以及大环境和你是不是同一个节奏。”</div>'
      +'<p>如果顾客这次主要问事业／感情／家庭，就优先讲那个领域，不需要把整张流年一次全部讲完。</p>'],

    ["06 给出路",
      '<h2>给“选择”，不要给“命令”</h2>'
      +'<div class="question-box">“所以你接下来可以试着换一个做法，不是要你彻底变成另一个人，而是给自己多一个选择。”</div>'
      +'<p><b>内在压抑型：</b>可以试着多表达一点，不是每个场合都要藏住自己。</p>'
      +'<p><b>外在补偿型：</b>可以允许自己不那么“能干”一会儿，不是所有事情都必须由你扛。</p>'
      +'<p><b>内外一致型：</b>优势很顺，但越强的数字越要留意过满时的反模式，给自己一点缓冲。</p>'],

    ["07 收尾总结",
      '<h2>最后只收一个核心，不把整张盘塞给顾客</h2>'
      +'<div class="question-box">“今天聊下来，我觉得你身上最值得继续观察的模式是___。它可能从___开始，现在影响到你的___。接下来你不需要一下子改很多，只要先留意___。”</div>'
      +'<p><b>确认状态：</b>“你今天听完之后感觉怎么样？有没有哪一部分还没想通？”</p>'
      +'<p>如果顾客情绪上来，停一下，不急着解释。可以问：“你想继续聊这个，还是先跳过？你来决定。”</p>'],

    ["08 会后跟进",
      '<h2>咨询结束后，让理解继续发酵，但不要追着顾客跑</h2>'
      +'<div class="question-box"><b>1–2天后：</b><br>“上次聊完之后，有没有什么新的感受或想法？”</div>'
      +'<p>如果顾客有反馈，可以轻量交流；如果没有回复，不需要追问。合适的时候再分享与她当前主题真正有关的笔记或内容。</p>'
      +'<p><b>会后资料：</b>可以整理一份简单总结，让顾客回顾“核心模式、今年重点、下一步练习”，而不是把全部内部计算交出去。</p>']
  ];

  return {
    nav:items.map((x,i)=>'<button type="button" data-v6-script-step="'+i+'" class="'+(i===0?"active":"")+'">'+x[0]+'</button>').join(""),
    body:serviceChecklist(c)+items.map((x,i)=>'<section data-v6-script-content="'+i+'" '+(i===0?"":"hidden")+'><p class="eyebrow">Josephine Consultation Flow</p>'+x[1]+'</section>').join("")+consultationConsole(c,a,phase,0)
  };
}
function deleteCustomer(id){
  const c=loadCustomers().find(x=>String(x.id)===String(id));
  if(!c) return;
  if(!confirm("确定删除 "+c.name+" 的顾客档案吗？\n删除后此装置上的这份资料会移除。")) return;
  saveCustomers(loadCustomers().filter(x=>String(x.id)!==String(id)));
  localStorage.removeItem(partnerKey(id));
  localStorage.removeItem(consultationKey(id));
  localStorage.removeItem(serviceKey(id));
  localStorage.removeItem(relationshipKey(id));
  localStorage.removeItem(familyKey(id));
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
    const selectedProjects=(c.consultationTypes?.length?c.consultationTypes:[c.consultationType]).filter(Boolean);
    const first=selectedProjects[0]||"人生蓝图";
    const initialModule=/黄金/.test(first)?"黄金流年":/关系/.test(first)?"关系蓝图":/亲子/.test(first)?"亲子蓝图":/合作/.test(first)?"合作蓝图":"人生蓝图";
    [...tabs.querySelectorAll(".module-tab")].forEach((b,i)=>{b.dataset.v6Module=names[i]||"人生蓝图";b.textContent=names[i]||b.textContent;b.classList.toggle("active",(names[i]||"人生蓝图")===initialModule)});
    const panel=document.createElement("section");panel.id="v6-module-panel";panel.className="card module-info-panel";tabs.after(panel);renderModule(initialModule,c);
  }

  const structure=document.querySelector(".structure-grid");
  if(structure&&!document.querySelector(".secondary-code-row")){
    const row=document.createElement("div");row.className="secondary-code-row";
    row.innerHTML='<div><span>起心动念</span><b>'+a.startingThoughtCode+'</b></div><div><span>内心数字</span><b>'+a.innerCode+'</b></div><div><span>外心数字</span><b>'+a.outerHeartCode+'</b><small>'+esc(a.outerHeartMeaning||"")+'</small></div><div><span>潜意识码</span><b>'+a.subconsciousCode+'</b></div><div><span>家庭码</span><b>'+a.familyCode+'</b></div><div><span>对内性格</span><b>'+a.insidePersonalityCode+'</b></div><div><span>对外性格</span><b>'+a.outsidePersonalityCode+'</b></div>';
    structure.after(row);

    const six=document.createElement("section");six.className="card six-joint-codes";
    six.innerHTML='<div class="card-heading"><div><small>6 CORE JOINT CODES</small><h2>6组基础联合数字</h2></div><span>内部3组 · 外圈3组</span></div><div class="six-code-grid">'
      +Object.entries(a.jointCodes6).map(([label,arr])=>'<div><small>'+label+'</small><strong>'+arr.join("")+'</strong></div>').join("")
      +'</div><div class="formula-note">内部：IJM · KLN · MNO｜外圈：SWX · RQP · TVU。联合数字不是重新算生日，而是按三角形固定位置读取。</div>';
    row.after(six);
  }

  const phases=document.querySelector(".phases");
  if(phases&&!phases.dataset.v6){
    phases.dataset.v6="1";
    const grid=phases.querySelector(".phase-grid");
    if(grid){grid.innerHTML=phaseButtons(a,phase);const detail=document.createElement("div");detail.className="phase-details";detail.id="v6-phase-detail";detail.innerHTML=phaseDetails(a,phase);grid.after(detail)}
    const badge=phases.querySelector(".card-heading>span");if(badge)badge.textContent="三个阶段都可以点击";
  }

  if(phases&&!document.querySelector("#v11-triangle-patterns")){
    const wrap=document.createElement("div");
    wrap.innerHTML=trianglePatternSection(a);
    phases.after(wrap.firstElementChild);
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
  const saveRelation=event.target.closest("#v20-save-relation"); if(saveRelation){
    const c=currentCustomer(); if(!c)return;
    const data={
      type:document.querySelector("#v20-relation-type")?.value||"伴侣／感情",
      name:document.querySelector("#v20-relation-name")?.value.trim()||"",
      birthday:document.querySelector("#v20-relation-birthday")?.value.trim()||""
    };
    saveRelationship(c.id,data); renderModule("关系蓝图",c); return
  }
  const addChild=event.target.closest("#v20-add-child"); if(addChild){
    const c=currentCustomer(); if(!c)return;
    const f=loadFamily(c.id); f.children=f.children||[]; f.children.push({name:"",birthday:""}); saveFamily(c.id,f); renderModule("亲子蓝图",c); return
  }
  const removeChild=event.target.closest("[data-v20-remove-child]"); if(removeChild){
    const c=currentCustomer(); if(!c)return;
    const f=loadFamily(c.id); f.children=f.children||[]; f.children.splice(Number(removeChild.dataset.v20RemoveChild),1); saveFamily(c.id,f); renderModule("亲子蓝图",c); return
  }
  const saveFamilyBtn=event.target.closest("#v20-save-family"); if(saveFamilyBtn){
    const c=currentCustomer(); if(!c)return;
    const current=loadFamily(c.id);
    const father={
      name:document.querySelector('[data-family-field="father.name"]')?.value.trim()||"",
      birthday:document.querySelector('[data-family-field="father.birthday"]')?.value.trim()||""
    };
    const mother={
      name:document.querySelector('[data-family-field="mother.name"]')?.value.trim()||"",
      birthday:document.querySelector('[data-family-field="mother.birthday"]')?.value.trim()||""
    };
    const children=[...document.querySelectorAll("[data-family-child-name]")].map(el=>{
      const i=Number(el.dataset.familyChildName);
      return {name:el.value.trim(),birthday:document.querySelector('[data-family-child-birthday="'+i+'"]')?.value.trim()||""};
    });
    saveFamily(c.id,{...current,father,mother,children}); renderModule("亲子蓝图",c); return
  }
  const add=event.target.closest("#v6-add-partner"); if(add){const c=currentCustomer();if(!c)return;const ps=loadPartners(c.id);ps.push({name:"",birthday:""});savePartners(c.id,ps);renderModule("合作蓝图",c);return}
  const rm=event.target.closest("[data-v6-remove-partner]"); if(rm){const c=currentCustomer();if(!c)return;const ps=loadPartners(c.id);ps.splice(Number(rm.dataset.v6RemovePartner),1);savePartners(c.id,ps);renderModule("合作蓝图",c);return}
  const save=event.target.closest("#v6-save-partners"); if(save){const c=currentCustomer();if(!c)return;const ps=[...document.querySelectorAll("[data-v6-partner]")].map(card=>{const i=card.dataset.v6Partner;return{name:card.querySelector("[data-v6-partner-name='"+i+"']")?.value.trim()||"",birthday:card.querySelector("[data-v6-partner-birthday='"+i+"']")?.value.trim()||""}});savePartners(c.id,ps);renderModule("合作蓝图",c);return}
  const regionBtn=event.target.closest("[data-v12-year-region]"); if(regionBtn){
    const c=currentCustomer(); if(!c)return;
    const target=Number(document.querySelector("#v6-year-target")?.value)||new Date().getFullYear();
    const personal=calculateYearCycleSet(c.birthday,target).current;
    const a=calculateBlueprint(c.birthday);
    const region=yearRegions(a).find(x=>x.key===regionBtn.dataset.v12YearRegion);
    document.querySelectorAll("[data-v12-year-region]").forEach(x=>x.classList.toggle("selected",x===regionBtn));
    const box=document.querySelector("#v12-year-region-detail");
    if(box&&region){
      box.innerHTML='<div class="source-tag">系统整合解读</div><h4>'+esc(region.title)+' · 流年'+personal.number+'</h4><p>'+esc(regionYearCopy(personal.number,region))+'</p><div class="question-box"><b>Josephine 可追问：</b><br>今年在“'+esc(region.focus)+'”这件事上，有没有一件事情让你特别想重新决定、重新整理或改变做法？</div>';
    }
    return
  }
  const jointLookup=event.target.closest("#v12-year-joint-lookup"); if(jointLookup){
    const input=(document.querySelector("#v12-year-joint-input")?.value||"").replace(/\D/g,"").slice(0,3);
    const box=document.querySelector("#v12-year-joint-output"); if(!box)return;
    if(input.length!==3){box.innerHTML='<div class="empty-mini">请输入完整3位流年联合码。</div>';return}
    const structured=getFlootKnowledge(input),legacy=findJointCode(input);
    const target=Number(document.querySelector("#v6-year-target")?.value)||new Date().getFullYear();
    const personal=calculateYearCycleSet(c.birthday,target).current;
    const a=calculateBlueprint(c.birthday);
    const activation=missingActivationSummary(a,personal.number,input);
    const activationHtml=activation.rows.filter(x=>x.directHit||x.positions.length).map(x=>'<div class="joint-activation"><b>缺失 '+x.n+' · '+esc(x.level)+'</b><span>'+esc(x.detail)+'</span><small>体感：'+esc(x.cfg.feel)+'｜反模式：'+esc(x.cfg.pattern)+'</small></div>').join("");
    if(structured){
      box.innerHTML='<div class="source-tag">AURMOVA 资料库</div><h4>'+esc(input)+' · '+esc(structured.title||"联合码")+'</h4><p><b>起因：</b>'+esc(structured.logic||"")+'</p><p><b>优势：</b>'+esc(structured.strengths||"")+'</p><p><b>卡点：</b>'+esc(structured.challenges||"")+'</p><p><b>成长方向：</b>'+esc(structured.growth||"")+'</p>'+(activationHtml?'<div class="joint-activation-wrap"><h5>缺失数被流年激活</h5>'+activationHtml+'</div>':'');
    }else if(legacy?.text){
      box.innerHTML='<div class="source-tag">AURMOVA 旧版资料库</div><h4>'+esc(input)+'</h4><p>'+esc(legacy.text).replace(/\n/g,"<br>")+'</p>'+(activationHtml?'<div class="joint-activation-wrap"><h5>缺失数被流年激活</h5>'+activationHtml+'</div>':'');
    }else{
      box.innerHTML='<div class="empty-mini">这组流年联合码暂时没有命中现有81组资料。</div>'+(activationHtml?'<div class="joint-activation-wrap"><h5>但已检测到缺失数激活</h5>'+activationHtml+'</div>':'');
    }
    return
  }
  const yr=event.target.closest("#v6-recalc-year"); if(yr){const c=currentCustomer();if(!c)return;const val=Number(document.querySelector("#v6-year-target")?.value)||new Date().getFullYear();const panel=document.querySelector("#v6-module-panel");if(panel)panel.innerHTML=yearPanel(c,val);return}
});
document.addEventListener("input",event=>{
  const el=event.target.closest("[data-v6-partner-name],[data-v6-partner-birthday]"); if(!el)return;
  const c=currentCustomer();if(!c)return;const i=Number(el.dataset.v6PartnerName??el.dataset.v6PartnerBirthday),ps=loadPartners(c.id);if(!ps[i])ps[i]={name:"",birthday:""};
  if(el.matches("[data-v6-partner-name]"))ps[i].name=el.value;else ps[i].birthday=el.value;savePartners(c.id,ps);
});
document.addEventListener("change",event=>{
  const service=event.target.closest("[data-v18-service-check]");
  if(service){
    const c=currentCustomer(); if(!c)return;
    const state=loadService(c.id); state[service.dataset.v18ServiceCheck]=service.checked; state.updatedAt=new Date().toISOString(); saveService(c.id,state); return;
  }
  const el=event.target.closest("[data-v6-partner-birthday]");if(!el)return;const c=currentCustomer();if(c)renderModule("合作蓝图",c);
});
