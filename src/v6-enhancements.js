import { calculateBlueprint, ageFromBirthday, phaseForAge, calculateYearCycleSet, calculateEnvironmentYear, compareYearClimate, calculateYearJointCode, yearSourceAxes, calculateGoldenYearSnapshot, activeFlowYear, flowYearRange, YEAR_THEMES, PHASE_META } from "./engine/blueprint.js?v=48";
import { ENERGY_LIBRARY, describeEnergySet } from "./energy-library.js?v=28";
import { PERSONALITY_LIBRARY } from "./personality-library.js?v=28";
import { findJointCode, CHILD } from "./aurmova-knowledge.js?v=28";
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
const blueprintAudienceKey=id=>"aurmova.blueprint.audience."+id;
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
  const p=INNER_DIGIT_POLARITY[number]||{};
  return '<article class="triangle-pattern-card">'
    +'<div class="triangle-pattern-number">'+number+'</div>'
    +'<div class="triangle-pattern-main"><div class="triangle-pattern-state">'+esc(result.state)+'</div>'
    +'<p>'+esc(result.description)+'</p>'
    +'<div class="pattern-polarity"><p><b>正面：</b>'+esc(p.positive||"")+'</p><p><b>压力／用过头：</b>'+esc(p.negative||"")+'</p></div>'
    +'<div class="triangle-pattern-counts"><span>内 '+innerCount+'次</span><span>外 '+outerCount+'次</span></div></div>'
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
    ? '<div class="consult-opener-card"><div class="source-tag">'+(pick.diff>=3?"首选开场":"当前最明显反差")+'</div><h4>数字 '+pick.n+'｜内 '+pick.inner+' 次 · 外 '+pick.outer+' 次</h4><blockquote>'+esc(opener)+'</blockquote><p>'+esc(alignment?.body||"先用这句开场，再让顾客用自己的故事来验证。")+'</p><div class="question-box"><b>你可以这样说：</b><br>“我看到这个数字在你里面和外面的表现差得比较明显，所以我想先从这里问你。它不是好坏，而是可能代表‘真实的你’和‘现实中活出来的你’不完全一样。”</div><div class="question-box"><b>你可以这样问：</b><br>'+esc(contrastProbe(alignment?.mode||pick.direction))+'<br>“这种反差你自己有感觉吗？通常在哪些人／哪些场景最明显？”<br>“你觉得哪一边比较像最放松、最不用顾虑别人的你？”</div></div>'
    : '<div class="empty-mini">这张盘目前没有明显内外反差。开场不要硬找冲突，优先从高密度一致数字、缺失数或顾客主动提出的问题开始。</div>';

  return '<div class="quick-consultation">'
    +'<div class="card-heading"><div><small>INNER × OUTER CONTRAST</small><h3>内外反差最明显的数字</h3></div><span>咨询切入点 · 不是新算法</span></div>'
    +'<div class="contrast-table"><div class="contrast-head"><b>数字</b><span>内</span><span>外</span><span>差</span><em>优先级</em></div>'+table+'</div>'
    +'<div class="formula-note"><b>这不是新的数字码。</b>它只是比较同一个数字在三角形内和外出现次数的差异，帮你快速找“里面的自己”和“现实表现”最不一样的地方。差异明显时适合拿来当咨询切入点；正式解读仍以主性格、起始数、坐镇码、父母基因、缺失／挑战、内外结构与联合码为主。</div>'
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
  return '<section id="v11-triangle-patterns" class="foundation-block">'
    +'<div class="section-head"><div><p class="eyebrow">TRIANGLE INNER × OUTER</p><h2>三角形内外模式 · 只讲一次</h2></div><span class="source-tag">综合读取</span></div>'
    +quickConsultationSection(a)
    +'<details class="blueprint-expander reference-only"><summary>展开完整1–9内外模式参考（需要时才看）</summary>'
      +'<div class="triangle-definition card"><div><b>三角形内</b><span>I · J · K · L · M · N · O</span><p>内在性格、比较自然的反应。</p></div><div><b>三角形外</b><span>X · W · S · Q · P · R · V · U · T</span><p>现实表现、环境适应与别人较容易看到的一面。</p></div></div>'
      +'<div class="triangle-pattern-grid">'+DIGITS.map(n=>trianglePatternCard(a,n)).join("")+'</div>'
    +'</details>'
    +'</section>';
}
function jointPositionMeaning(label){
  const x=String(label||"");
  if(x.includes("因果")) return "这个位置先看『为什么会启动』。它更像这段阶段的起点、惯性或背后动机，不是最后结果。";
  if(x.includes("过程")) return "这个位置看『事情怎么展开』。重点是行为、互动和中途反应，不要把过程当成命定结果。";
  if(x.includes("结果")) return "这个位置看『长期累积后容易呈现什么』。它是趋势和结果面，不等于一定发生。";
  if(x.includes("父亲")) return "放在父亲基因时，优先看父系经验、权威关系、上级／规则与早年学会的做事方式。";
  if(x.includes("母亲")) return "放在母亲基因时，优先看情感支持、安全感、照顾方式与亲密关系里的重复模式。";
  if(x.includes("主性格")||x.includes("坐镇")) return "放在核心位置时，这组模式更接近长期惯性，会比偶发情境更常被顾客自己认出来。";
  if(x.includes("工作")||x.includes("朋友")) return "放在工作／朋友位时，优先看职场合作、客户、人脉、表达方式与现实资源交换。";
  if(x.includes("下属")||x.includes("子女")) return "放在下属／子女位时，优先看带人、教人、授权、控制与期待别人怎么做。";
  return "这个位置要结合顾客真实发生的场景来解释。先看它落在哪一段人生／关系，再决定重点讲事业、关系还是自我模式。";
}

function jointCodeDigits(c){
  return String(c||"").split("").map(Number).filter(n=>n>=1&&n<=9);
}

function jointWhiteBundle(c,structured,label){
  const ds=jointCodeDigits(c);
  const d1=DIGIT_CORE[ds[0]]||{}, d2=DIGIT_CORE[ds[1]]||{}, d3=DIGIT_CORE[ds[2]]||{};
  const digitLine=ds.length===3
    ?"第一位 "+ds[0]+"＝"+(d1.core||"")+"；第二位 "+ds[1]+"＝"+(d2.core||"")+"；第三位 "+ds[2]+"＝"+(d3.core||"")+"。"
    :"";
  const defaultQuestions=[
    "这组特质在你身上，最明显是在工作、关系，还是家庭里？",
    "顺的时候，你最常用到哪一个优势？",
    "压力大的时候，刚才说的卡点有没有出现过？最近一次是什么情况？"
  ];
  const qs=(TALK_QUESTIONS[c]&&TALK_QUESTIONS[c].length?TALK_QUESTIONS[c]:defaultQuestions).slice(0,3);
  const challenge=structured?.challenges||"压力下可能把原本的优势用过头，出现节奏、边界或沟通上的卡点。";
  const strength=structured?.strengths||"这组数字有自己稳定的优势，但要结合真实场景验证。";
  const growth=structured?.growth||"先看真实场景，再决定要加强哪一个能力、放松哪一个惯性。";
  const script=structured?.script||"我先丢一个观察给你，你听听看像不像。这个组合不是在定义你好不好，而是在看你遇到事情时最容易用哪一套方式。";
  const work=ds.map(n=>DIGIT_CORE[n]?.work).filter(Boolean).join("；");
  return {
    digitLine,
    position:jointPositionMeaning(label),
    scene:"顺的时候，这组码比较容易表现为："+strength+"；压力一上来，则要留意："+challenge,
    work:work?("工作／事业上可以观察："+work+"。不是说只能做这些，而是这些能力比较容易被调用。"):"",
    relationship:"关系里不要只看『合不合』，更要看这组码在沟通、边界、责任和期待上怎么运作。尤其当压力出现时，"+challenge,
    pressure:"压力反应的重点不是给顾客贴标签，而是看优势什么时候开始用过头。可以直接追问：『你最近一次这样反应，是发生在谁身上／哪件事上？』",
    script:"“我先丢一个观察给你，你听听看像不像。"+script+"”",
    yes:"“那就对上了。重点不是说你有这个问题，而是你这组优势一旦用过头，就容易从『"+strength+"』走到『"+challenge+"』。我们现在要找的是那个转折点。”",
    no:"“没关系，我不会硬套。那我们换一个角度看：这组模式是不是只会在特定的人、工作压力或某个阶段出现？如果还是不像，我们就以你的真实经历为准。”",
    growth:"“你不用把自己变成另外一种人。你真正要做的是："+growth+"”",
    mnemonic:ds.length===3?(ds[0]+" "+(d1.core||"")+" → "+ds[1]+" "+(d2.core||"")+" → "+ds[2]+" "+(d3.core||"")):"",
    questions:qs
  };
}


const SALES_CODE_NOTES = {
  "213":{type:"表达／市场开发型",note:"课程把213放在销售、市场开发、讲师场景。更适合靠表达、解释、带动与把复杂内容讲清楚来影响客户。",watch:"讲话太快、太多，或把表达当成交本身。",q:"你在介绍产品、教学或提案时，是不是越讲越容易进入状态？"},
  "123":{type:"表达／市场开发型",note:"课程把123放在销售、市场开发、讲师场景。更适合靠沟通、说明与互动打开客户。",watch:"情绪或语速过快时，客户可能跟不上重点。",q:"你是不是在面对客户时，只要对方愿意互动，你就比较容易把价值讲出来？"},
  "483":{type:"专业顾问型",note:"课程把483看成专业销售路线，重点不是讨好客户，而是靠专业度、判断与价值建立信任。",watch:"专业感用过头时，容易显得强势或距离太远。",q:"客户会不会常常因为觉得你专业、判断清楚，而愿意听你的建议？"},
  "843":{type:"专业顾问型",note:"课程把843看成专业销售路线，适合用能力、结构与结果感建立信任。",watch:"容易太快替客户下结论，需要先确认真实需求。",q:"你比较习惯先分析问题、给方案，而不是先跟客户聊很久吗？"},
  "246":{type:"问题解决／服务型",note:"课程把246放在传统销售、解决问题、服务与持续提供价值的场景。",watch:"服务很多却不敢推进成交，容易把销售做成无限售后。",q:"你是不是比较容易靠认真跟进、把问题处理好，让客户最后主动决定？"},
  "426":{type:"问题解决／服务型",note:"课程把426放在传统销售、服务与解决问题的场景，强调可靠、细节和持续价值。",watch:"容易因为想把每个细节做到完美，拖慢成交节奏。",q:"客户是不是常因为你做事稳、愿意处理细节，而比较信任你？"},
  "279":{type:"关系／人格魅力型",note:"课程把279看成靠关系感、人格魅力与信任促进成交的方式。",watch:"人情和生意界线容易混在一起。",q:"你的客户会不会常常是先喜欢你、信任你，后来才愿意买你的东西？"},
  "729":{type:"关系／人格魅力型",note:"课程把729看成关系与信任驱动的成交方式，客户经营、人脉连接会比较重要。",watch:"为了维持关系而不好意思谈价格或条件。",q:"你是不是比较擅长长期经营客户，而不是一次性硬推成交？"},
  "573":{type:"高价值／高客单型",note:"课程把573放在较高客单、高价值产品或服务场景。AURMOVA只保留为销售方式参考，不代表号码本身保证高收入。",watch:"容易把高价当成价值；真正能不能卖高客单仍要看专业、产品、客户群和交付。",q:"当价格提高时，你能不能很清楚解释客户到底多得到什么价值？"},
  "281":{type:"需求放大／方案型",note:"课程把281放在重新定义客户需求、放大方案价值与提升性价比感的场景。",watch:"不能制造焦虑或诱导客户买不需要的东西。",q:"你是不是很会从客户原本的小需求里，看出更完整的解决方案？"},
  "821":{type:"需求放大／方案型",note:"课程把821放在扩大客户视角、做方案升级与价值重构的场景。",watch:"要避免因为太想推进结果，而忽略客户真实预算与边界。",q:"你会不会很自然地帮客户从‘买一个产品’升级成‘解决一个完整问题’？"},
  "382":{type:"关系经营／服务型",note:"课程把382看成需要花时间建立关系、服务与信任的销售方式。",watch:"陪伴很多但没有成交节点，时间成本容易过高。",q:"你是不是愿意花比较多时间了解客户，关系建立好后成交反而更顺？"},
  "832":{type:"关系经营／服务型",note:"课程把832放在客户关系经营、长期服务和信任累积的场景。",watch:"要有边界、流程和跟进节点，避免无限消耗。",q:"你的客户是不是越熟、越信任你，后续合作就越容易继续？"}
};
function salesSceneSupplement(c){
  const x=SALES_CODE_NOTES[String(c||"")];
  if(!x) return "";
  return '<div class="ai-supplement sales-scene"><div class="source-tag">课程补充｜销售场景</div>'
    +'<p><b>销售方式：</b>'+esc(x.type)+'</p>'
    +'<p><b>课程应用：</b>'+esc(x.note)+'</p>'
    +'<p><b>要留意：</b>'+esc(x.watch)+'</p>'
    +'<div class="question-box"><b>Josephine 可追问：</b><br>“'+esc(x.q)+'”</div>'
    +'<div class="formula-note">这不是“看到号码＝一定适合做销售”。还要结合这个号码所在位置、完整盘、职业经历、产品价值和客户真实反馈验证。</div>'
    +'</div>';
}

function jointBlock(c,label){
  const structured=getFlootKnowledge(c);
  const legacy=findJointCode(c);
  let body="";
  let source="系统计算结果";
  if(structured){
    const white=jointWhiteBundle(c,structured,label);
    source=structured.aiSupplement?"AURMOVA原始主题＋AI整合补全":"AURMOVA结构化资料＋AI咨询白话";
    body='<h4>'+esc(structured.title||c)+'</h4>'
      +'<div class="notion-consult-grid">'
        +'<div><small>① 数字结构</small><p>'+esc(white.digitLine||structured.logic||"")+'</p></div>'
        +'<div><small>② 核心逻辑</small><p>'+esc(structured.logic||"")+'</p></div>'
        +'<div><small>③ 正面／优势</small><p>'+esc(structured.strengths||"")+'</p></div>'
        +'<div><small>④ 负面／卡点</small><p>'+esc(structured.challenges||"")+'</p></div>'
      +'</div>'
      +(structured.order?'<p><b>排列顺序差异：</b>'+esc(structured.order)+'</p>':"")
      +'<div class="position-explain"><b>⑤ 这个位置怎么解｜'+esc(label)+'</b><p>'+esc(white.position)+'</p></div>'
      +(structured.positions?'<p><b>原始／位置资料：</b>'+esc(structured.positions)+'</p>':"")
      +'<div class="ai-supplement"><div class="source-tag">AI整合补充｜不是原书原句</div>'
        +'<p><b>生活里会怎么表现：</b>'+esc(white.scene)+'</p>'
        +(white.work?'<p><b>事业／工作：</b>'+esc(white.work)+'</p>':"")
        +'<p><b>关系／沟通：</b>'+esc(white.relationship)+'</p>'
        +'<p><b>压力时：</b>'+esc(white.pressure)+'</p>'
      +'</div>'
      +'<div class="question-box"><b>⑥ Josephine 白话｜可以直接照读：</b><br>'+white.script+'</div>'
      +white.questions.map((q,i)=>'<p><b>验证问题 '+(i+1)+'：</b>'+esc(q)+'</p>').join("")
      +'<div class="answer-branches"><div><b>顾客说「有」：</b><p>'+white.yes+'</p></div><div><b>顾客说「没有／不像」：</b><p>'+white.no+'</p></div></div>'
      +'<div class="question-box"><b>⑦ 开解／成长方向：</b><br>'+white.growth+'</div>'
      +(white.mnemonic?'<p class="memory-line"><b>学员记忆：</b>'+esc(white.mnemonic)+'</p>':"");
  }else if(legacy&&legacy.text){
    source="AURMOVA旧版资料＋AI待整合";
    body='<p>'+esc(legacy.text).replace(/\n/g,"<br>")+'</p>'
      +'<div class="question-box"><b>Josephine 白话：</b><br>“这组资料我会先以你真实发生的事情来验证，不会只因为看到号码就替你下结论。你先告诉我，最近最卡的是工作、关系还是自己的状态？”</div>';
  }else{
    const empty={logic:"",strengths:"",challenges:"",growth:"",script:""};
    const white=jointWhiteBundle(c,empty,label);
    source="AI结构补充｜原书来源待核对";
    body='<div class="ai-supplement"><p><b>数字结构：</b>'+esc(white.digitLine)+'</p><p><b>位置：</b>'+esc(white.position)+'</p></div>'
      +'<div class="question-box"><b>Josephine 可直接照读：</b><br>'+white.script+'</div>'
      +'<p><b>验证：</b>'+esc(white.questions[0])+'</p>'
      +'<div class="formula-note">这部分是AI根据数字结构与位置生成的咨询补充，不冒充原书。后续找到原始课程内容时，以原书为底稿再更新。</div>';
  }
  body+=salesSceneSupplement(c);
  const preview=structured?.script||legacy?.text?.split("\n")[0]||"点击展开查看白话、卡点、追问与开解";
  return '<details class="joint-entry"><summary><span><b>'+esc(c)+'</b> · '+esc(label)+'<small style="display:block;font-weight:400;margin-top:4px;opacity:.72">白话：'+esc(preview)+'</small></span><span>'+(structured||legacy?"完整咨询":"AI补充")+'</span></summary><div class="joint-body"><div class="source-tag">'+source+'</div>'+body+'</div></details>';
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

function synthesizeFlowCodeReading(codeValue,label=""){
  const ds=String(codeValue||"").split("").map(Number).filter(n=>n>=1&&n<=9);
  const [a,b,c]=ds;
  const A=DIGIT_CORE[a]||{},B=DIGIT_CORE[b]||{},C=DIGIT_CORE[c]||{};
  return {
    source:"AURMOVA结构化白话补充",
    strengths:"起因偏向「"+(A.core||a)+"」，过程会用「"+(B.gift||B.core||b)+"」推进，最后更容易把课题带到「"+(C.core||c)+"」这一层。优势是把"+(A.gift||A.core||"起点能力")+"、"+(B.gift||B.core||"过程能力")+"与"+(C.gift||C.core||"结果能力")+"串起来。",
    challenges:"压力下要留意：起点可能出现「"+(A.shadow||"反应过度")+"」，过程中可能变成「"+(B.shadow||"用力过头")+"」，最后容易卡在「"+(C.shadow||"结果焦虑")+"」。这不是命定结果，而是需要用真实事件验证的反模式。",
    growth:"先看事情是怎么开始的，再观察自己惯用的处理方式，最后确认这个做法把结果带去哪里。把最容易过度的那一位数字往正面能力拉回来。",
    script:"这组 "+codeValue+" 我会分三层看：前面是事情为什么被触发，中间是你通常怎么处理，最后是这件事最容易把你带到哪里。你听听看，最近有没有一件事刚好很像这条路径？"
  };
}

function axisGroupsHtml(groups,labels,activeNumber=null,allEnvironment=false){
  return '<div class="golden-axis-grid">'+Object.entries(groups).map(([name,arr],i)=>{
    const codeValue=arr.join("");
    const hit=activeNumber!==null && activeNumber!==undefined && arr.includes(activeNumber);
    const data=getFlootKnowledge(codeValue)||findJointCode(codeValue);
    const derived=synthesizeFlowCodeReading(codeValue,(labels||[])[i]||"");
    const positive=data?.strengths||data?.text||derived.strengths;
    const negative=data?.challenges||derived.challenges;
    const growth=data?.growth||derived.growth;
    const script=data?.script||derived.script;
    const source=data?"原资料／既有资料库":"AI结构化补充";
    return '<article class="golden-axis-code '+(hit?'hit':'')+' '+(allEnvironment?'environment-code':'')+'"><small>'+esc(labels[i]||"")+' · '+esc(name)+'</small><strong>'+esc(codeValue)+'</strong>'
      +(hit?'<em>O位数字 '+activeNumber+' 在这组出现</em>':'')
      +(allEnvironment?'<em>大环境四码之一 · 四组一起读</em>':'')
      +'<span class="source-tag">'+source+'</span>'
      +'<div class="question-box"><b>Josephine 白话：</b><br>“'+esc(script)+'”</div>'
      +'<p><b>正面／优势：</b>'+esc(positive)+'</p><p><b>负面／卡点：</b>'+esc(negative)+'</p>'
      +'<p><b>成长／开解：</b>'+esc(growth)+'</p>'
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
  const personalCodes=Object.entries(snap.personalAxis.groups).map(([k,v])=>k+" "+v.join("")).join(" · ");
  const environmentCodes=Object.entries(snap.environmentAxis.groups).map(([k,v])=>k+" "+v.join("")).join(" · ");
  return '<section class="golden-year-sheet '+(label==="当前查看"?"current":"")+'">'
    +'<div class="golden-year-sheet-head"><div><small>'+esc(label)+' · '+year+'</small><h3>自身流年 O='+p.number+' · '+esc(p.title)+'</h3></div><div class="golden-weather"><small>大环境因果 · KLN</small><b>'+esc(snap.environmentMainCode)+'</b><span>不是“大环境数字”；必须连同 KNV / LNW / VWX 一起读</span></div></div>'
    +'<div class="formula-note"><b>AURMOVA唯一结构：</b>这一年只用同一张重排年盘。自身固定读取 <b>MNO → MOQ / NOP → PQR</b>；大环境固定读取 <b>KLN → KNV / LNW → VWX</b>。不再加入外三角三边流年码、直接命中主场、单一大环境数字或人为权重。</div>'
    +'<div class="year-positive-negative"><div><small>O位年度主题 · 正面</small><b>'+esc(p.role)+'</b><p>'+esc(p.summary)+'</p></div><div><small>O位年度主题 · 反模式</small><b>'+esc(p.pit)+'</b><p>'+esc(p.advice)+'</p></div></div>'
    +goldenYearVisual(snap)
    +'<div class="golden-master-summary"><div><small>自身4组</small><b>'+esc(personalCodes)+'</b><p>因果 → 两个过程 → 结果</p></div><div><small>大环境4组</small><b>'+esc(environmentCodes)+'</b><p>因果 → 两个过程 → 结果</p></div></div>'
    +'<div class="golden-axis-title"><div><small>SELF YEAR AXIS</small><h4>自身流年 · MNO → MOQ / NOP → PQR</h4></div><span>4组全部计算</span></div>'
    +axisGroupsHtml(snap.personalAxis.groups,snap.personalAxis.labels,p.number,false)
    +'<div class="golden-axis-title"><div><small>ENVIRONMENT YEAR AXIS</small><h4>大环境／天气 · KLN → KNV / LNW → VWX</h4></div><span>4组全部计算</span></div>'
    +axisGroupsHtml(snap.environmentAxis.groups,snap.environmentAxis.labels,null,true)
    +'<div class="question-box"><b>Josephine 收束：</b><br>“我先看你这一年的自身4组——为什么发生、过程怎么走、最后走到哪里；再看外面的大环境4组——共同的天气是什么。最后只挑2–3个最值得讲的模式，跟你真实经历做验证。”</div>'
    +'</section>';
}

function yearPanel(c,target){
  const active=activeFlowYear(new Date());
  const year=Number(target)||active;
  const current=calculateGoldenYearSnapshot(c.birthday,year);
  const prev=calculateGoldenYearSnapshot(c.birthday,year-1);
  const next=calculateGoldenYearSnapshot(c.birthday,year+1);
  const envCodes=current.environmentCodes.map(x=>x.code).join(" · ");
  const range=flowYearRange(year);
  const quick=[active-1,active,active+1,active+2];
  const compare=[["上一流年",prev],["当前查看",current],["下一流年",next]].map(([label,x])=>'<div><small>'+label+' · '+x.year+'</small><b>O='+x.personal.number+' · '+esc(x.personal.title)+'</b><span>自身结果 '+x.personalAxis.groups.PQR.join("")+'｜大环境结果 '+x.environmentAxis.groups.VWX.join("")+'</span></div>').join("");
  return '<div class="module-render golden-year-v22">'
    +'<div class="card-heading"><div><small>AURMOVA GOLDEN YEAR BLUEPRINT</small><h2>黄金流年蓝图 · 只保留最终确认结构</h2></div><span>当前流年 '+active+'</span></div>'
    +'<div class="year-control"><label>查看哪个流年年度 <input type="number" id="v6-year-target" min="1900" max="2200" value="'+year+'"></label><button type="button" class="btn btn-light" id="v6-recalc-year">重新计算</button></div>'
    +'<div class="flow-year-quick">'+quick.map(y=>'<button type="button" class="flow-year-chip '+(y===year?'active':'')+'" data-v6-flow-year="'+y+'">'+y+(y===active?' · 当前':'')+'</button>').join("")+'</div>'
    +'<div class="formula-note"><b>'+year+' 流年期间：</b>'+esc(range.start)+' → '+esc(range.end)+'。AURMOVA按10月1日切换；现在已进入 '+active+' 流年。<br><b>计算：</b>保留出生“日＋月”，把年份替换成目标流年年度，重新计算同一张完整三角盘；O位＝个人年度主题。</div>'
    +'<div class="formula-note"><b>本次清理：</b>旧版“单一大环境数字／直接命中六区域／外三角三边流年码／50-25-15-10权重”等旧逻辑已从流年页面停用，避免和你最终规则打架。</div>'
    +'<div class="golden-master-summary"><div><small>'+year+' 自身流年</small><strong>'+current.personal.number+'</strong><span>O位 · '+esc(current.personal.title)+'</span></div><div><small>'+year+' 大环境因果</small><strong>'+esc(current.environmentMainCode)+'</strong><span>KLN · 只代表因果，不代表整个大环境</span></div><div><small>大环境四组</small><b>'+esc(envCodes)+'</b><p>KLN → KNV / LNW → VWX 四组共同定义这一年的“天气”。</p></div></div>'
    +'<div class="golden-support-grid">'+compare+'</div>'
    +yearTeachingPanel()
    +yearSnapshotCard(c,year,"当前查看")
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


const SEAT_SPECIAL = {
  "167":{
    nickname:"有头脑的开拓者",
    visible:"这组不是只会想。1给独立判断，6让行动带品质、责任与价值标准，7负责研究、洞察与人际判断。比较常见的状态是：先自己想明白，再决定要不要出手；一旦认定，通常会希望把事情做得有质量。",
    work:"能力比较容易落在需要“专业判断＋人际连接＋品质感”的场景，例如顾问／咨询、教育培训、品牌公关、客户关系、资源对接、内容策划、设计审美或需要专业信任的销售。不是说只能做这些，而是这些场景较容易同时调用1、6、7的优势。",
    money:"167不是看到一个数字就能断定“会不会理财”。6会让人重价值与品质，7会先分析，1会按自己的判断决定。真正的资源管理仍要看三角形里有没有4、8等修正，以及真实的预算和习惯。",
    core:"AURMOVA白话可以把167理解成“有头脑的开拓者”：有自己的方向，不喜欢盲从；会先观察和研究，但不是纯想不做，认准后会用自己的标准把事情推进。"
  }
};

function seatRoleCopy(n,role){
  const d=DIGIT_CORE[n]||{};
  if(role===0) return "第一位（"+n+"）｜开端／开拓基因：事情一来时，比较容易先启动「"+(d.core||"")+"」。优势是"+(d.gift||"")+"；用过头时要留意"+(d.shadow||"")+"。";
  if(role===1) return "第二位（"+n+"）｜行动风格：真正做事时，比较常用「"+(d.core||"")+"」推进。优势是"+(d.gift||"")+"；压力大时可能出现"+(d.shadow||"")+"。";
  return "第三位（"+n+"）｜主性格／长期底色：这是最常被自己和身边人认出来的一层——"+(d.core||"")+"。顺的时候是"+(d.gift||"")+"；卡住时容易"+(d.shadow||"")+"。";
}

function mainModifierCopy(main,n){
  const m=MAIN_DETAIL[main]||{}, d=DIGIT_CORE[n]||{};
  const key=String(main)+"-"+String(n);
  const special={
    "2-1":{
      title:"2号主性格＋内三角1｜关系感里有自己的主见",
      text:"2会先顾关系、看别人感受；1会在真正需要决定时把自主和主见拉出来。所以不是没主见，而是主见通常不会第一秒出现。",
      money:"谈合作或金钱时，前面可能先顾关系，最后才自己拍板。要练的是更早说出条件与想法。",
      q:"重大事情到最后，你是不是常常还是会自己决定？",
      after:"那就说明2负责先顾关系，1负责最后定方向。以后可以更早一点把自己的想法说出来，不用等到最后才突然很确定。"
    },
    "2-2":{
      title:"2号主性格＋内三角2｜同号强化",
      text:"主性格本来就是2，内三角里的2又重复，所以顾人、看关系、听气氛很容易变成自动能力。优势是协调和同理；用过头时容易先处理别人，再处理自己。",
      money:"关系感会直接进入合作、报价和资源决定。要特别留意因为不好意思而太晚谈条件。",
      q:"你有没有明明不太愿意，却因为怕别人失望，最后还是答应？",
      after:"你的问题不是没有主见，而是关系感太快进入决定。接下来练的是先确认自己愿不愿意，再决定怎么顾别人。"
    },
    "2-3":{
      title:"2号主性格＋内三角3｜温和里有表达与行动",
      text:"你不是完全被动的2号。熟悉、安全的时候，3会让你讲话快、反应快，也会马上处理事情。",
      money:"适合把沟通、表达、内容、销售或临场处理转成价值；但要避免因为太快而答应过多。",
      q:"你是不是面对陌生人比较收，但跟熟人或熟悉工作时其实很会讲、也很快处理？",
      after:"所以以后不能简单把你定义成内向或被动。你需要先有安全感，安全以后3就会出来。"
    },
    "2-5":{
      title:"2号主性格＋内三角5｜关系与自由同时存在",
      text:"你会顾关系，但里面的5又很需要选择权、空间和自己的方向。容易出现一边怕别人不开心，一边又很怕自己被困住。",
      money:"选择多时要先定筛选标准，不要为了关系一直配合，也不要因为压太久突然换方向。",
      q:"你会不会一开始先配合，配合久了以后突然很想推开、换方向或离开？",
      after:"真正要练的不是一直忍，也不是忍到最后突然走掉，而是前面就把自己的选择和界线讲出来。"
    },
    "2-6":{
      title:"2号主性格＋内三角6｜容易把关系变成责任",
      text:"2会先理解人，6会进一步想把事情做好、照顾、补位。所以别人只是来讲问题，最后很容易变成你在负责。",
      money:"财富和资源上要分清支持与承担。不是每个关系都要用钱、时间或责任去证明。",
      q:"别人来跟你讲问题，讲着讲着最后事情会不会变成你在处理？",
      after:"你有照顾人的能力，但以后要分清：听别人讲是支持，替别人处理是承担，两件事不一样。"
    },
    "7-4":{
      title:"7号主性格＋内三角4｜深度被结构托住",
      text:"7本来就会分析、研究、想透，4再进来，会把这种深度变得更有规划、秩序和收尾能力。压力面是7的多想叠加4的怕错，容易反复检查、迟迟不决定。",
      money:"这会增加预算、规则和规划意识，但不等于“有4就一定会理财”。是否真的能把钱留住，仍要看实际习惯、其他数字与现实选择。",
      q:"你是不是越重要的事情越想先规划清楚，甚至有时因为怕错而迟迟不开始？",
      after:"那重点不是再想更多，而是设一个决定期限，让规划真正服务行动。"
    },
    "7-8":{
      title:"7号主性格＋内三角8｜洞察开始往成果与资源走",
      text:"7负责看深、判断与专业，8把注意力拉到成果、责任、资源和规模。好的时候会从“我看懂了”进一步走到“我要怎样做成结果”；压力大时可能一边想很多、一边又逼自己要有成绩。",
      money:"在事业和资源上，这组更容易关注专业怎样转成价值、资源怎样放大，但不代表数字本身保证赚钱。",
      q:"你会不会对自己有一种要求：不只要懂，还希望最后真的做出成绩、证明这个判断有价值？",
      after:"这组真正的成长是把专业变结果，但别让结果压力反过来压住判断。"
    }
  };
  if(special[key]) return special[key];
  if(Number(main)===Number(n)){
    return {
      title:main+"号主性格＋内三角"+n+"｜同号强化",
      text:"你的主性格本来就是"+main+"号，内三角又再次出现"+n+"，所以「"+(d.core||"这股能量")+"」会更容易变成惯用能力。优势是"+(d.gift||"更熟练")+"；用过头时要留意"+(d.shadow||"过度反应")+"。",
      money:"资源与事业仍要看整张盘和现实经历，不因为同号强化就直接断定收入结果。",
      q:"你会不会觉得这一类反应不是偶尔，而是很多场景都会自动出现？",
      after:"那这就是同号强化。重点不是压掉它，而是看什么时候它从优势开始变成用过头。"
    };
  }
  return {
    title:main+"号主性格＋内三角"+n+"｜"+(d.core||"补充能量"),
    text:"主性格"+main+"的底色仍然是「"+(m.title||"")+"」，但内三角里的"+n+"会提供「"+(d.gift||d.core||"")+"」这一层能力。它不是把你变成"+n+"号人，而是在特定场景里修正你的做事方式。",
    money:"资源与事业要看整张盘和现实经历，不能只因为出现"+n+"就直接断定收入、理财或职业结果。",
    q:"你有没有发现，虽然你核心还是"+main+"号，但碰到某些事情时会明显用到"+n+"号这种「"+(d.core||"")+"」的方式？",
    after:"如果顾客确认，就把它当作主性格的修正层；如果不像，就以顾客真实经历为准，不硬套。"
  };
}
function seatCodeDeepPanel(a){
  const codeValue=String(a.seatCode||"");
  const ds=jointCodeDigits(codeValue);
  const structured=getFlootKnowledge(codeValue)||{};
  const main=Number(a.mainPersonality||ds[2]||0);
  const start=Number(a.startingThoughtCode||0);
  const mainD=MAIN_DETAIL[main]||{};
  const startD=DIGIT_CORE[start]||{};
  const counts=a.innerEnergy?.counts||{};
  const present=DIGITS.filter(n=>Number(counts[n]||0)>0);
  const modifierHtml=present.map(n=>{
    const x=mainModifierCopy(main,n);
    return '<article><small>'+(n===main?'主性格同号强化':'三角形内修正数字')+' '+n+' · '+Number(counts[n]||0)+'次</small><h4>'+esc(x.title)+'</h4><p>'+esc(x.text)+'</p><p><b>事业／资源提醒：</b>'+esc(x.money)+'</p><div class="question-box"><b>验证顾客：</b><br>“'+esc(x.q)+'”</div><div class="question-box"><b>顾客说「有」以后：</b><br>“'+esc(x.after)+'”</div></article>';
  }).join("");
  return '<div class="foundation-block seat-deep-panel">'
    +'<div class="card-heading"><div><small>SEAT CODE · FULL CONSULTATION</small><h3>坐镇码 '+esc(codeValue)+' × 主性格 '+main+'</h3></div><span>内三角全部数字都分析</span></div>'
    +'<div class="formula-note"><b>已修正：</b>坐镇码负责讲三位组合路径；“主性格被内三角怎样修正”则要看内三角实际出现的所有数字。不会再因为数字已经在坐镇码里出现，就把2、5、6这类数字过滤掉。</div>'
    +'<div class="notion-consult-grid">'
      +'<div><small>① 第一位</small><p>'+esc(seatRoleCopy(ds[0],0))+'</p></div>'
      +'<div><small>② 第二位</small><p>'+esc(seatRoleCopy(ds[1],1))+'</p></div>'
      +'<div><small>③ 第三位／主性格</small><p>'+esc(seatRoleCopy(ds[2],2))+'</p></div>'
      +'<div><small>④ 主性格 '+main+' × 起始数 '+start+'</small><p>'+esc("你的长期底色是"+(mainD.title||main+"号")+"；进入新环境或事情刚发生时，又会先启动「"+(startD.core||start)+"」。")+'</p></div>'
    +'</div>'
    +'<div class="question-box"><b>整组坐镇码白话：</b><br>“'+esc(structured.script||structured.logic||"这组三位数字要连起来看：前面看怎么启动，中间看怎么推进，最后看长期主性格。")+'”</div>'
    +'<div class="card-heading"><div><small>INNER TRIANGLE MODIFIERS</small><h4>主性格 '+main+' 被内三角所有出现数字怎样修正</h4></div><span>'+present.join(" · ")+'</span></div>'
    +'<div class="v23-detail-grid">'+modifierHtml+'</div>'
    +'</div>';
}
function innerCodeDeepPanel(a){
  const main=Number(a.mainPersonality||0), inner=Number(a.innerCode||0), sub=Number(a.subconsciousCode||0);
  const md=MAIN_DETAIL[main]||{}, id=DIGIT_CORE[inner]||{}, sd=DIGIT_CORE[sub]||{};
  const special={
    "2-4-1":{
      thinking:"你会先考虑别人怎么想、关系会不会受影响；但心里面其实很需要事情清楚、稳定、有秩序。真正到时间很急时，你又会突然自己拍板。",
      action:"平时会配合环境，不喜欢一开始就硬碰硬；真正行动前希望有把握、有结构。可是现场真的没人处理时，你反而会站出来接手。",
      speech:"平时讲话会铺垫、顾感受；越重要的事越想把细节确认清楚。被逼急以后，最后一句可能突然很直接。",
      stress:"压力常是2先担心关系，4再担心出错；累积到一定程度以后，1会出来硬撑、自己决定，甚至不想再解释。",
      need:"你里面真正需要的是稳定、确定、可预测，但外面很多人先看到的是你会配合、会顾人。",
      contrast:"所以你很容易出现：别人以为你很好说话，其实你心里面有自己的秩序和底线；只是通常不会第一秒讲出来。"
    }
  }[main+"-"+inner+"-"+sub];

  const x=special||{
    thinking:(md.thinking||"")+" 内心又需要「"+(id.core||inner)+"」；事情突然发生时，会先启动「"+(sd.core||sub)+"」。",
    action:(md.behavior||"")+" 真正愿意行动前会受内心「"+(id.core||inner)+"」影响；紧急时潜意识「"+(sd.core||sub)+"」会抢先出来。",
    speech:(md.speech||"")+" 越在意的事情，越会被内心对「"+(id.core||inner)+"」的需要修正；被逼急时会出现"+(sd.core||sub)+"式第一反应。",
    stress:(md.stress||"")+" 同时要留意内心的"+(id.shadow||"压力")+"与潜意识的"+(sd.shadow||"自动反应")+"叠在一起。",
    need:"外面较容易看到主性格"+main+"；里面真正想要的是「"+(id.core||inner)+"」，突发时先启动的是「"+(sd.core||sub)+"」。",
    contrast:"三层不一样时，不代表矛盾，而是平时、内心和突发情境分别由不同层接管。"
  };

  const cards=[
    ["思考模式",x.thinking,"你会不会平时先想很多人和关系，但最后真正到决定点时又会自己拍板？","那你不是没有决定力，而是前面先处理关系／安全感，到了决定点才把自己的判断放出来。"],
    ["行动模式",x.action,"你平时不一定最先抢着做，但现场真的没人处理时，是不是最后又会由你站出来？","那你的行动不是慢，而是平常需要确认；一旦情境逼到行动点，自动反应会启动。"],
    ["说话／沟通模式",x.speech,"你有没有试过前面解释很久、很温和，最后突然一句很直接，讲完自己又觉得是不是太重？","那不是突然变成另一个人，而是前面几层已经撑太久，最后自动反应接管。"],
    ["面对压力",x.stress,"你很累的时候，会不会前面一直顾别人，后来突然变成“算了，我自己来”？","所以压力管理不是只叫自己放松，而是更早看见什么时候已经开始委屈、焦虑或硬撑。"]
  ];

  return '<div class="foundation-block">'
    +'<div class="card-heading"><div><small>MAIN × INNER × SUBCONSCIOUS</small><h3>主性格 '+main+' × 内心码 '+inner+' × 潜意识 '+sub+'｜整合成真实行为</h3></div><span>思考 · 行动 · 说话 · 压力</span></div>'
    +'<div class="formula-note"><b>判断顺序：</b>主性格＝长期底色；内心码＝里面真正需要；潜意识＝事情突然发生时最先自动启动。三层同向会加强，方向不同就会出现明显反差。</div>'
    +'<div class="notion-consult-grid"><div><small>内在真正需要</small><p>'+esc(x.need)+'</p></div><div><small>外面看起来 vs 里面真实感受</small><p>'+esc(x.contrast)+'</p></div></div>'
    +'<div class="v23-detail-grid">'+cards.map(r=>'<article><h4>'+r[0]+'</h4><p>'+esc(r[1])+'</p><div class="question-box"><b>验证顾客：</b><br>“'+esc(r[2])+'”</div><div class="question-box"><b>顾客说「有」以后：</b><br>“'+esc(r[3])+'”</div></article>').join("")+'</div>'
    +'<div class="answer-branches"><div><b>顾客说「很像」</b><p>“好，那这层先当成被你的真实经历验证到了。最近一次最明显是什么时候？”</p></div><div><b>顾客说「有一点」</b><p>“哪一个场景像、哪一个场景不像？工作和家里会不会刚好不一样？”</p></div><div><b>顾客说「完全不像」</b><p>“好，那我们不硬套，这层先放下，以你的真实经验为准。”</p></div><div><b>顾客说「不知道」</b><p>“那我们直接找最近一个真实场景，不问抽象的。”</p></div></div>'
    +'</div>';
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

function unifiedJointCodes(a){
  const alreadyExplained=new Set([a.fatherCode,a.motherCode,a.seatCode]);
  const rows=[
    ["21–40 过程1",a.phases["21–40"].process1],
    ["21–40 过程2",a.phases["21–40"].process2],
    ["21–40 结果",a.phases["21–40"].result],
    ["41–60 过程1",a.phases["41–60"].process1],
    ["41–60 过程2",a.phases["41–60"].process2],
    ["41–60 结果",a.phases["41–60"].result],
    ["61+ 过程1",a.phases["61+"].process1],
    ["61+ 过程2",a.phases["61+"].process2],
    ["61+ 结果",a.phases["61+"].result]
  ].map(([label,arr])=>({label,code:(arr||[]).join("")})).filter(x=>!alreadyExplained.has(x.code));
  const map=new Map();
  rows.forEach(r=>{
    if(!map.has(r.code)) map.set(r.code,{code:r.code,labels:[]});
    map.get(r.code).labels.push(r.label);
  });
  const unique=[...map.values()];
  return '<div class="foundation-block"><div class="card-heading"><div><small>JOINT CODES · DEDUPED</small><h3>联合码完整解析 · 每组只出现一次</h3></div><span>'+unique.length+'组待展开</span></div>'
    +'<div class="formula-note"><b>去重规则：</b>父亲基因、母亲基因、坐镇码已经在前面各自的正式位置讲过，所以这里不再重复。其余过程／结果联合码如果号码相同，也只出现一次，并把所有位置合并到标题。</div>'
    +'<div class="joint-stack">'+(unique.length?unique.map(x=>jointBlock(x.code,x.labels.join("｜"))).join(""):'<div class="empty-mini">其余阶段码都已在前面出现，不需要重复展开。</div>')+'</div></div>';
}

function phaseOverview(a,name){
  const m=PHASE_META[name];
  return '<div class="phase-overview"><div class="phase-detail-title"><div><small>'+esc(m.label)+' · '+esc(m.theme)+'</small><h3>'+esc(m.description)+'</h3></div><span>只讲阶段主题 · 不再重复号码</span></div>'
    +'<div class="formula-note">这个年龄阶段的因果／过程／结果号码已经在上方“联合码完整解析”讲过，这里只保留阶段重点，现场咨询不再把同一组号码重新念一次。</div></div>';
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
  const plain={
    1:{name:"独立／主见／开创",cw:"你本来就很会自己判断、自己开始。挑战不是没有主见，而是主见用过头时容易变成硬撑、太快自己扛、不容易求助。",cq:"你是不是越重要的事越容易自己决定，甚至明明有人可以帮，你还是会先想“我自己来”？",ca:"保留决定力，但重大决定前固定多一个动作：先问一个可信任的人“我有没有漏掉什么？”",mw:"1没有明显出现，不代表你没主见，而是“自己先决定、先开始”未必是最自动的第一反应。",mq:"遇到没有人给标准的事情时，你会不会容易先等、先问，心里比较难马上定下来？",ma:"每天练一个小决定由自己完成，不先问别人；从低风险选择开始。"},
    2:{name:"关系／感受／协调",cw:"你很会感受别人、顾关系，也很会协调。挑战是这份能力用过头时，会把别人的情绪和期待放得太前面。",cq:"你有没有明明不太愿意，却先想“如果我拒绝，他会不会不开心？”最后还是答应？",ca:"不是变冷淡，而是把顺序换成：先确认自己愿不愿意，再决定怎样温和表达。",mw:"2没有明显出现，不代表你不会体贴，而是“先感觉别人、先顾关系”未必是最自然的起点。",mq:"别人不开心时，你会马上察觉并调整自己，还是要对方讲出来你才比较容易知道？",ma:"沟通里多问一句“你现在最需要我怎么配合？”也练习说出自己的需要。"},
    3:{name:"表达／行动／创意",cw:"你反应快、点子多、也比较敢表达。挑战是快用过头时，容易冲太快、分心、讲完才发现还没整理清楚。",cq:"你是不是有时很快答应、很快开始，做到一半又发现方向要改？",ca:"保留速度，但重要事情先停30秒，写下“我现在真正要完成的是什么”。",mw:"3没有明显出现，不代表你不会说，而是“马上表达、马上行动”不一定是最自动的方式。",mq:"你是不是常常脑里已经有想法，但需要准备一下、熟一点，才比较容易说出来？",ma:"每天把一个想法用3句话讲清楚，不求完美，先练习开口。"},
    4:{name:"规划／秩序／稳定",cw:"你很会规划、守规则、把事情做稳。挑战是稳定用过头时，容易怕错、卡细节、一直准备却迟迟不动。",cq:"越重要的事情，你会不会越想先准备完整，结果反而开始得更慢？",ca:"把“完整计划”改成“下一步计划”；先做30分钟，再回来调整。",mw:"4没有明显出现，不代表你不会规划，而是长期记录、固定流程、持续复盘通常需要靠工具和习惯来维持。",mq:"你是不是很喜欢事情有秩序，但真正忙起来以后，记录、流程和固定复盘比较容易断掉？",ma:"只建立一个最小系统：固定记账、固定周复盘或固定待办，先连续做30天。"},
    5:{name:"方向／选择／自由",cw:"你很会看选择、找新路、适应变化。挑战是选择能力用过头时，会变成方向太多、不断比较、很难真正走深。",cq:"最近有没有一件事，不是没有选择，而是选择太多，反而一直没有真正定下来？",ca:"先设筛选标准，再限定一个方向走一段时间；不要每天重新选择。",mw:"5没有明显出现，不代表你不能改变，而是主动换方向、冒险尝试未必是最自然的第一反应。",mq:"环境变动时，你会比较兴奋，还是需要更长时间确认安全才愿意换？",ma:"做低风险的小实验，不用等到百分百确定才改变。"},
    6:{name:"责任／品质／资源",cw:"你愿意负责、照顾、把事情做好。挑战是责任感用过头时，容易把别人的问题也变成自己的责任。",cq:"别人只是来跟你讲问题，讲着讲着最后事情会不会变成你在处理？",ca:"先问“这是我要支持，还是我要负责？”支持不等于接手。",mw:"6没有明显出现，不代表你不负责，而是长期照顾、品质标准和资源安排可能不是最自动的主轴。",mq:"别人把事情交给你时，你会自然接下，还是需要先确认“为什么是我负责”？",ma:"重要合作写清楚责任、时间和资源，不用靠默契承担。"},
    7:{name:"研究／洞察／人脉",cw:"你会研究、观察、想深，也有独立判断。挑战是深度用过头时，容易想太久、怀疑太多、自己消化到内耗。",cq:"你有没有一件事其实已经掌握七八成资料，却还是一直想再确认一点才肯决定？",ca:"给自己决定期限：想七成就开始验证，让现实帮你补答案。",mw:"7没有明显出现，不代表你不会分析，而是“先停下来研究很深”未必是最自动的第一反应。",mq:"你遇到事情是比较倾向先解决，还是一开始就会研究很多可能性？",ma:"重要问题固定多问两次“为什么”，再做决定，训练深度而不拖延。"},
    8:{name:"成果／管理／权责",cw:"你对结果、资源和责任很敏感，也比较能扛。挑战是成果导向用过头时，会变成控制、给自己压力太大，或只看结果不看过程。",cq:"事情没有达到标准时，你会不会第一反应就是“我来管、我来收尾”，很难真的放手？",ca:"练习授权和阶段检查，不要所有事情都等到最后自己收。",mw:"8没有明显出现，不代表你不能赚钱或管理，而是谈条件、权责、成果和资源配置通常需要后天刻意训练。",mq:"合作开始时，你会不会先顾关系和事情，做到后面才发现费用、责任或条件一开始没讲清楚？",ma:"所有合作先写清三件事：谁负责什么、什么时候交付、钱怎么算。"},
    9:{name:"机会／格局／影响",cw:"你会看大局、趋势和更多可能。挑战是格局用过头时，会同时抓太多机会、承诺太多，最后难聚焦。",cq:"你是不是很容易看到很多可能，反而最难的是决定什么现在不要做？",ca:"每个阶段只留1–2个主目标，其他机会先放进“以后清单”。",mw:"9没有明显出现，不代表你没有机会，而是你可能更习惯从眼前可处理的事情开始，不会自动把视角拉到很远很大。",mq:"别人问你三五年后的规划时，你会很有画面，还是比较习惯先把眼前做好再说？",ma:"每季度做一次大局复盘：现在做的事情，哪一件真的值得继续放大？"}
  };
  const challengeCards=challenges.map(n=>{
    const p=plain[n]||{}, d=ENERGY_LIBRARY[n]||{};
    return '<article><small>挑战数字 '+n+' · 出现 '+Number(a.innerEnergy?.counts?.[n]||0)+' 次</small><h4>'+esc(p.name||d.name||"")+'</h4>'
      +'<p><b>正向能力：</b>'+esc(d.gift||"这股能量较容易成为惯用能力。")+'</p>'
      +'<p><b>用过头：</b>'+esc(d.high||p.cw||"需要留意优势过度。")+'</p>'
      +'<div class="question-box"><b>Josephine 白话：</b><br>“'+esc(p.cw||"这不是缺点，而是熟练能力用过头时容易卡住。")+'”</div>'
      +'<div class="question-box"><b>验证顾客：</b><br>“'+esc(p.cq||"最近一次这股能力用过头是什么时候？")+'”</div>'
      +'<div class="question-box"><b>顾客说「有」以后：</b><br>“好，这里不是叫你不要用它，而是把它从自动反应变成有选择地使用。'+esc(p.ca||"先找到转折点再调整。")+'”</div>'
      +'</article>';
  }).join("");
  const missingCards=missing.map(n=>{
    const p=plain[n]||{}, d=ENERGY_LIBRARY[n]||{};
    return '<article><small>缺失数字 '+n+'</small><h4>'+esc(p.name||d.name||"")+'</h4>'
      +'<div class="question-box"><b>Josephine 白话：</b><br>“'+esc(p.mw||"缺失不代表没有能力，而是通常不是最自然的第一反应，需要后天练习。")+'”</div>'
      +'<div class="question-box"><b>验证顾客：</b><br>“'+esc(p.mq||"这项能力是不是需要你刻意提醒自己才会做？")+'”</div>'
      +'<div class="question-box"><b>如果顾客说「我现在很会」：</b><br>“很好，这就代表这项能力已经被你后天训练出来。缺失数字不是一辈子没有，只是它不是最自动的起点。”</div>'
      +'<p><b>练习：</b>'+esc(p.ma||"用一个可执行的小习惯来补。")+'</p>'
      +'</article>';
  }).join("");
  return '<div class="foundation-block">'
    +'<div class="card-heading"><div><small>CHALLENGE + MISSING · DEDUPED</small><h3>挑战数字与缺失数字 · 只讲一次</h3></div><span>挑战≥2次才显示</span></div>'
    +'<div class="formula-note"><b>固定规则：</b>不再另外显示“天赋数字”或“重复能量”。同一数字重复2次以上，只在“挑战数字”出现一次；里面同时讲正向能力和优势用过头的卡点。</div>'
    +'<h4>挑战数字</h4><div class="v23-detail-grid">'+(challengeCards||'<div class="empty-mini">目前没有重复2次以上的挑战数字。</div>')+'</div>'
    +'<h4>缺失数字</h4><div class="v23-detail-grid">'+(missingCards||'<div class="empty-mini">目前没有明显缺失数字。</div>')+'</div>'
    +'</div>';
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

const GOLDEN_20_CODES = {
  "966":{label:"少年得志",stage:"前段成果较早",strength:"较早遇到成绩、机会或被看见的阶段；容易较早建立自信与成果经验。",challenge:"早期顺利后，容易把旧方法当成长期答案；后续阶段节奏变化时可能出现比较与失落。",script:"你的黄金20年比较像前段容易出成绩。不是说年轻就一定大富大贵，而是你会比较早遇到需要证明自己、拿结果或被看见的机会。真正重要的是，后面每换一个阶段，都要重新升级做法。"},
  "933":{label:"少年得志",stage:"前段成果较早",strength:"早期表达、行动、曝光或人脉资源较容易形成可见成绩。",challenge:"容易因为早期被肯定而急着维持高峰，忽略后面阶段真正需要的调整。",script:"你这条线也是偏早发型。年轻阶段容易先被看见，但你后面不能一直复制以前的成功方式，要看每个阶段真正要你练的是什么。"},
  "339":{label:"先苦后甜",stage:"前段磨练、后段更稳",strength:"前期经验值高，越往后越懂得筛选方向、把过去的磨练转成判断力。",challenge:"前期容易怀疑自己，觉得别人比自己快；也可能因为吃过苦而越来越不敢冒险。",script:"你这条线比较像前面先练功，后面越来越稳。年轻时不一定没有机会，只是很多东西要靠经验一点点磨出来。后面真正值钱的，往往就是你前面走过的路。"},
  "669":{label:"先苦后甜",stage:"前段累积、后段放大",strength:"早中期的责任、资源与实践经验，后面更容易累积成稳定成果。",challenge:"容易在前段把责任扛太多，导致觉得自己一直在付出却没有马上回报。",script:"你的结构不是一开始就轻松，而是越做越有底。前面的责任和经验会慢慢累积，后面更容易看见成果，所以不要因为前段慢，就否定自己。"},
  "693":{label:"中年致富",stage:"中段资源放大",strength:"41–60阶段更值得观察事业成熟、资源整合、收入结构、专业与影响力的放大。",challenge:"容易把成功只等同金钱或位置，忽略真正想做的事、关系与身体节奏。",script:"你的黄金20年更像中段发力。前面累积的东西，到了中间这个阶段比较容易整合起来。这里不只是钱，也可能是专业成熟、客户累积、位置提升，或者终于知道什么值得长期做。"},
  "396":{label:"中年致富",stage:"中段资源放大",strength:"中段较适合把早期经验、关系与专业转成更大规模的成果。",challenge:"容易在中段为了证明成绩而过度追逐规模、收入或外在认可。",script:"你这个结构的重点在中段。年轻时做过的尝试，到了中间阶段比较容易变成真正能承接的资源。越到这里，越要分清楚什么是你要的成果，什么只是别人眼里的成功。"},
  "363":{label:"中年致富",stage:"中段资源放大",strength:"中段的表达、行动与资源整合更容易进入成熟期，适合把已验证的能力放大。",challenge:"机会增加时容易同时抓太多方向，造成分散。",script:"你的中段比较像把已经练熟的能力放大。机会可能会变多，但不是每个都要拿。真正重要的是，把最能复利的那一两件事做深。"},
  "636":{label:"天降大任",stage:"关键阶段责任／挑战放大",strength:"关键阶段更容易承担复杂责任、处理转折，并把压力转成成熟度。",challenge:"容易觉得事情全压在自己身上，或把一次挫折解释成整个人生都不好。",script:"这组不是说一定会遇到灾难，更像是人生某个关键阶段事情会变大、责任会变重。接得住，它会变成成熟和位置升级；接不住，就会觉得压力特别集中。"},
  "999":{label:"天降大任",stage:"关键阶段责任／格局放大",strength:"容易在关键阶段面对更大范围的选择、影响与责任，需要更高层次的取舍。",challenge:"容易理想拉太大、同时想抓很多机会，或把阶段压力看成必须马上翻盘。",script:"你的结构会把‘格局’和‘责任’放得比较大。不是命定大起大落，而是关键阶段更需要做取舍。越是机会多，越要聚焦，不要急着证明所有事情都能做到。"}
};

function golden20Code(a){
  const p=a?.positions||{};
  return [p.U,p.R,p.X].map(v=>v??"").join("");
}
function golden20Panel(a){
  const p=a?.positions||{};
  const g=golden20Code(a);
  const info=GOLDEN_20_CODES[g];
  const stageLine='<div class="phase-code-grid"><div><small>21–40结果 U</small><strong>'+esc(p.U??"—")+'</strong></div><div><small>41–60结果 R</small><strong>'+esc(p.R??"—")+'</strong></div><div><small>61+结果 X</small><strong>'+esc(p.X??"—")+'</strong></div></div>';
  if(!info){
    return '<div class="foundation-block"><div class="card-heading"><div><small>GOLDEN 20 YEARS · U→R→X</small><h3>黄金20年趋势码 · '+esc(g||"—")+'</h3></div><span>阶段趋势</span></div>'
      +stageLine
      +'<div class="formula-note"><b>读取方法：</b>按人生时间顺序读取 U（21–40结果）→ R（41–60结果）→ X（61岁以后结果）。这组码用于观察三个阶段的成果／责任重心，不替代每个阶段的“因果 → 过程 → 结果”完整分析。</div>'
      +'<div class="question-box"><b>Josephine 白话：</b><br>“我会先把你三个20年阶段的结果位排成一条线，看哪一个阶段比较容易把前面的累积放大。它不是在告诉你哪一段一定发财或一定辛苦，而是提醒你：不同阶段，适合用的策略不一样。”</div>'
      +'<p class="panel-note">目前这组 '+esc(g||"—")+' 不在本次课程截图列出的四类重点组合中，因此不硬套标签，继续按三个阶段本身解读。</p></div>';
  }
  return '<div class="foundation-block golden20-panel"><div class="card-heading"><div><small>GOLDEN 20 YEARS · U→R→X</small><h3>黄金20年趋势码 · '+g+' · '+esc(info.label)+'</h3></div><span>'+esc(info.stage)+'</span></div>'
    +stageLine
    +'<div class="year-positive-negative"><div><small>正面／优势</small><p>'+esc(info.strength)+'</p></div><div><small>负面／卡点</small><p>'+esc(info.challenge)+'</p></div></div>'
    +'<div class="question-box"><b>Josephine 可以直接照读：</b><br>“'+esc(info.script)+'”</div>'
    +'<div class="formula-note"><b>课程标签不等于命定结果：</b>'+esc(info.label)+'只是课程里的阶段归类。AURMOVA不会把它说成一定发财、一定成名、一定受苦或一定遇到大事；还要结合四组阶段码、现实经历、能力、资源与行动验证。</div>'
    +'<p><b>验证顾客：</b>“回头看你前一个阶段，你觉得自己最大的累积是什么？它有没有正在影响你现在？”</p>'
    +'</div>';
}


function talentNumbersPanel(a){
  const repeated=(a.innerEnergy?.repeated||[]);
  const cards=repeated.map(n=>{
    const d=ENERGY_LIBRARY[n]||{};
    return '<article><b>'+n+' · 天赋／挑战双面</b><p><strong>天赋面：</strong>'+esc(d.gift||"这股能量重复出现，代表它比较容易成为可被调用的能力。")+'</p><p><strong>挑战面：</strong>'+esc(d.high||d.low||"能量用过头时容易变成压力模式。")+'</p><small>出现次数：'+Number(a.innerEnergy?.counts?.[n]||0)+' 次</small></article>';
  }).join("");
  return '<div class="foundation-block"><div class="card-heading"><div><small>TALENT × CHALLENGE</small><h3>天赋数字 · 挑战数字</h3></div><span>同一股能量看两面</span></div>'
    +'<div class="formula-note">AURMOVA读取方式：内三角重复2次以上的数字，不只当“挑战数”看，也先看它的正向天赋。重复越多，越容易成为惯用能力；同时也越要留意“优势用过头”的反模式。</div>'
    +'<div class="v23-detail-grid">'+(cards||'<div class="empty-mini">目前没有重复2次以上的数字；继续看主性格、起始数、缺失数与内外差异。</div>')+'</div></div>';
}

function outerPolarityPanel(a){
  const present=DIGITS.filter(n=>(a.outerEnergy?.counts?.[n]||0)>0);
  return '<div class="foundation-block"><div class="card-heading"><div><small>OUTER DIGITS</small><h3>三角形外数字 · 正面与负面</h3></div><span>现实表现／社交面</span></div>'
    +'<div class="polarity-grid">'+present.map(n=>{const d=INNER_DIGIT_POLARITY[n]||{};const count=a.outerEnergy.counts[n];return '<div><b>'+n+' · '+count+'次</b><p><strong>外在正面：</strong>'+esc(d.positive||"这股能量在现实环境中比较容易被别人看见。")+'</p><p><strong>外在过度时：</strong>'+esc(d.negative||"压力下可能把这股能力用得太满。")+'</p></div>'}).join("")+'</div>'
    +'<div class="formula-note">这里看的是“别人比较容易看到的你”。同一个数字在内三角和外三角都出现时，再回到“内外都有”的模式解释；只在外面出现时，优先看后天适应、环境训练或社交面具。</div></div>';
}

function emotionCodePanel(a){
  const c=a.innerEnergy?.counts||{};
  const inward=(c[2]||0)+(c[7]||0);
  const outward=(c[3]||0)+(c[8]||0);
  let type="情绪码较少";
  let script="你的内三角里2／7／3／8不算集中，所以情绪表达不是这张盘最需要优先放大的主题。";
  if(inward>0||outward>0){
    if(inward>outward){type="情绪内收偏强";script="你的情绪比较容易先往里面收。你不是没感觉，而是先消化、先观察，真正说出来通常会慢一点。";}
    else if(outward>inward){type="情绪外放偏强";script="你的情绪比较容易直接显出来。好处是反应快、不会全部压在里面；要留意的是情绪比整理速度更快时，话可能先出去。";}
    else {type="内收／外放切换型";script="你的内收和外放力量比较接近，所以不是固定一种模式。你可能平时先忍、先想，但踩到底线时又会突然直接表达。";}
  }
  return '<div class="foundation-block"><div class="card-heading"><div><small>EMOTION CODES</small><h3>三角形内情绪码 · 2／7／3／8</h3></div><span>'+esc(type)+'</span></div>'
    +'<div class="origin-grid"><div><span>2 · 小水</span><p>出现 '+(c[2]||0)+' 次｜敏感、顾感受、容易先收住。</p></div><div><span>7 · 大水</span><p>出现 '+(c[7]||0)+' 次｜分析、内化、用思考消化情绪。</p></div><div><span>3 · 小火</span><p>出现 '+(c[3]||0)+' 次｜情绪反应快、表达直接、来得快。</p></div><div><span>8 · 大火</span><p>出现 '+(c[8]||0)+' 次｜立场与力量感强，被挑战时反应更明显。</p></div></div>'
    +'<div class="question-box"><b>Josephine 白话：</b><br>“'+esc(script)+'”</div>'
    +'<div class="question-box"><b>验证顾客：</b><br>“你不舒服的时候，通常是先忍着自己消化，还是会马上说出来？如果两种都会，什么人／什么场景最容易让你从忍变成爆？”</div></div>';
}

function genderForcePanel(c,a){
  const counts=a.innerEnergy?.counts||{};
  const maleDigits=[1,3,5,7,8,9], femaleDigits=[2,4,6,7,8];
  const male=maleDigits.reduce((sum,n)=>sum+Number(counts[n]||0),0);
  const female=femaleDigits.reduce((sum,n)=>sum+Number(counts[n]||0),0);
  const g=String(c?.gender||"");
  let focus="先看两组力量如何同时存在";
  let white="这里不做“好／坏”判断，而是看你更自然用哪一种行动与关系方式。";
  if(/男/.test(g)){
    focus=male>female?"男性力量组偏强":male<female?"女性力量组偏强":"两组接近";
    white=male>=female
      ?"按这套课程框架，你比较容易用主导、行动、目标与承担去面对事业。7如果明显，会让男性力量里多一点柔和、思考与感受。"
      :"按这套课程框架，你的关系感、稳定感与照顾面比较突出；事业动力不能只凭这一项下结论，要继续结合父亲关系、坐镇码、事业阶段与真实经历验证。";
  }else if(/女/.test(g)){
    focus=female>male?"女性力量组偏强":female<male?"男性力量组偏强":"两组接近";
    white=female>=male
      ?"按这套课程框架，你比较容易用承接、稳定、关系与细节去建立力量。7如果明显，会让女性力量里多一点刚性、独立判断与边界。"
      :"按这套课程框架，你的主导、目标与事业推进感会比较明显；财富／资源不能只凭这一项下结论，要继续结合母亲关系、资源模式、事业阶段与现实收入结构验证。";
  }
  return '<div class="foundation-block"><div class="card-heading"><div><small>GENDER ENERGY · COURSE FRAMEWORK</small><h3>男性力量 × 女性力量</h3></div><span>'+esc(focus)+'</span></div>'
    +'<div class="formula-note"><b>内部课程框架：</b>男性力量数字＝1、3、5、7、8、9；女性力量数字＝2、4、6、7、8。7在男性盘里偏柔、在女性盘里偏刚；7与8同时属于两组，因此这里看“力量构成”，不是简单二选一。</div>'
    +'<div class="golden-support-grid"><div><small>男性力量组</small><b>'+male+'</b><span>1／3／5／7／8／9</span></div><div><small>女性力量组</small><b>'+female+'</b><span>2／4／6／7／8</span></div><div><small>顾客性别</small><b>'+esc(g||"未填")+'</b><span>按对应组重点验证</span></div></div>'
    +'<div class="question-box"><b>Josephine 白话：</b><br>“'+esc(white)+'”</div>'
    +'<div class="question-box"><b>父母关系验证：</b><br>'+(/男/.test(g)
      ?'“你跟爸爸的关系，会不会影响你对事业、责任、证明自己的方式？你跟妈妈的关系，会不会影响你在一个环境里能不能稳定待住、长期承接？”'
      :/女/.test(g)
        ?'“你跟妈妈的关系，会不会影响你对资源、价值感、接住成果的方式？你跟爸爸的关系，又会不会影响你做决定、推进事业和争取位置的方式？”'
        :'“你跟父亲、母亲分别是什么关系？哪一边更影响你的事业、稳定感、价值感和承担方式？”')+'</div>'
    +'<p class="panel-note">重要：这部分属于AURMOVA课程里的阴阳／性别力量象征框架，不当作科学因果，也不把“男性力量强＝一定更有钱”“父母关系不好＝一定事业／财富不好”当成事实。顾客端必须用验证式语言，不贴“男不男／女不女”的标签。</p></div>';
}


function countGroup(arr,group){
  const set=new Set(group);
  return (arr||[]).reduce((sum,n)=>sum+(set.has(Number(n))?1:0),0);
}
function codeArray(c){
  return String(c||"").split("").map(Number).filter(n=>n>=1&&n<=9);
}
function parentGeneProfile(code,role){
  const arr=codeArray(code);
  const yang=countGroup(arr,[1,3,5,9]);
  const yin=countGroup(arr,[2,4,6]);
  const shared8=countGroup(arr,[8]);
  const seven=countGroup(arr,[7]);

  // Parent-gene family power is role-aware:
  // father + 7 = softer; mother + 7 = stronger/more firm.
  let score=yang-yin;
  if(role==="father") score-=seven*0.5;
  if(role==="mother") score+=seven*0.5;

  const level=score>=1?"strong":score<=-1?"soft":"mixed";
  let title=level==="strong"?"力量偏强／主导":level==="soft"?"力量偏柔／承接":"力量混合／看场景";
  let note="";
  if(seven){
    note=role==="father"
      ?"这组父亲基因里有7。按你的体系，男性有7会柔一点，所以即使有主导力，也会多一层思考、感受或退一步观察。"
      :"这组母亲基因里有7。按你的体系，女性有7会更刚、更有边界，所以遇到原则或责任时会更容易站出来。";
  }
  if(shared8){
    note+=(note?" ":"")+"8同时属于男性／女性力量，不拿来硬判哪一边，而是看成结果感、责任感与掌控感的共同放大。";
  }
  return {arr,yang,yin,shared8,seven,score,level,title,note};
}

function geneInheritedCopy(code,label,role){
  const structured=getFlootKnowledge(code);
  const p=parentGeneProfile(code,role);
  const gifts=structured?.strengths||p.arr.map(n=>DIGIT_CORE[n]?.gift||DIGIT_CORE[n]?.core).filter(Boolean).join("；")||"这组基因需要结合真实家庭互动验证。";
  const challenges=structured?.challenges||p.arr.map(n=>DIGIT_CORE[n]?.shadow).filter(Boolean).join("；")||"压力下可能把原本的优势用过头。";
  const script=structured?.script||"这组父母基因要先看三位数字合在一起形成的行为模式，再回到家庭里验证。";
  return '<div class="gene-inherit-card"><div class="card-heading"><div><small>'+esc(label)+'</small><h4>'+esc(code)+' · '+esc(p.title)+'</h4></div></div>'
    +'<p><b>整组基因怎么读：</b>'+esc(script)+'</p>'
    +'<p><b>比较容易拿到的优点：</b>'+esc(gifts)+'</p>'
    +'<p><b>容易一起带下来的卡点：</b>'+esc(challenges)+'</p>'
    +(p.note?'<div class="ai-supplement"><div class="source-tag">力量修正</div><p>'+esc(p.note)+'</p></div>':'')
    +'</div>';
}

function parentGeneBalancePanel(a){
  const father=parentGeneProfile(a.fatherCode,"father");
  const mother=parentGeneProfile(a.motherCode,"mother");
  const fk=getFlootKnowledge(a.fatherCode)||{};
  const mk=getFlootKnowledge(a.motherCode)||{};

  let family="父母力量结构较混合";
  let familyCopy="两边都不是单一的强或柔，家庭里谁主导、谁承接要看真实场景。";
  if(father.level==="strong"&&mother.level==="soft"){
    family="父系较强 · 母系较柔";
    familyCopy="父亲这边比较容易承担决定、推进、定方向；母亲这边更容易承接关系、稳定家庭、照顾细节。";
  }else if(father.level==="soft"&&mother.level==="strong"){
    family="母系较强 · 父系较柔";
    familyCopy="母亲这边比较容易承担决定、推动和守原则；父亲这边相对更柔、更会退一步或承接。";
  }else if(father.level==="strong"&&mother.level==="strong"){
    family="父母双方都偏强";
    familyCopy="两边都有主见和推进力，家庭里可能出现双主导；优势是行动快，卡点是意见不同时谁都不想退。";
  }else if(father.level==="soft"&&mother.level==="soft"){
    family="父母双方都偏柔";
    familyCopy="两边都比较重关系、承接和稳定；卡点是遇到需要拍板的事情时，容易互相等或把决定拖久。";
  }

  const integrated='“父亲基因 '+a.fatherCode+' 和母亲基因 '+a.motherCode+' 都要先当成完整三位联合码来看。数字只是给我一个观察入口，真正要确认的是：小时候家里谁负责什么、你后来拿走了哪一套做事方式。你这张盘目前比较像：'+family+'。'+familyCopy+'”';

  return '<div class="foundation-block"><div class="card-heading"><div><small>PARENT GENE · LIVE DIALOGUE</small><h3>父亲基因 × 母亲基因 · 问完以后怎么接</h3></div><span>'+esc(family)+'</span></div>'
    +'<div class="gene-balance-grid">'
      +'<div class="gene-inherit-card"><h4>父亲基因 '+a.fatherCode+'</h4><p><b>核心：</b>'+esc(fk.script||fk.logic||"先用真实父系／权威经验验证。")+'</p><p><b>优势：</b>'+esc(fk.strengths||"结合完整联合码与现实经历。")+'</p><p><b>卡点：</b>'+esc(fk.challenges||"压力下可能把原本优势用过头。")+'</p></div>'
      +'<div class="gene-inherit-card"><h4>母亲基因 '+a.motherCode+'</h4><p><b>核心：</b>'+esc(mk.script||mk.logic||"先用真实母系／照顾经验验证。")+'</p><p><b>优势：</b>'+esc(mk.strengths||"结合完整联合码与现实经历。")+'</p><p><b>卡点：</b>'+esc(mk.challenges||"压力下可能把原本优势用过头。")+'</p></div>'
    +'</div>'
    +'<div class="question-box"><b>Josephine 白话｜先这样说：</b><br>'+esc(integrated)+'</div>'
    +'<div class="question-box"><b>先这样问顾客：</b><br>“你小时候家里遇到大事，通常是谁拍板？谁比较坚持自己的方式？谁比较常负责缓和关系、照顾情绪或收尾？”</div>'
    +'<div class="answer-branches">'
      +'<div><b>顾客说「爸爸比较明显」</b><p>“好，那父亲这条先被现实验证到了。接下来我不只看爸爸，我要看你有没有把这套做事方式带走。你现在遇到问题，会不会也很快进入同样的处理模式？”</p></div>'
      +'<div><b>顾客说「妈妈比较明显」</b><p>“好，那我们以真实家庭为准。数字给的是家庭模式，不代表现实角色一定严格由爸爸本人演。接下来我看的是：这套模式有没有变成你的习惯？”</p></div>'
      +'<div><b>顾客说「两边都有」</b><p>“那就不要再分谁比较像。我们看你什么时候用爸爸这套、什么时候用妈妈这套：工作出问题时你像谁？关系有冲突时又像谁？”</p></div>'
      +'<div><b>顾客说「不像／不知道」</b><p>“没关系，我们换成生活画面。你小时候犯错时谁先讲话？买贵的东西、搬家、选学校或处理亲戚问题时，通常谁出来处理？”</p></div>'
    +'</div>'
    +'<div class="question-box"><b>再往遗传模式这样接：</b><br>“好，现在我们不再停在爸爸妈妈身上。我想看的是，这套模式后来有没有变成你自己的习惯。最近一次你用同样方式处理事情，是什么时候？”</div>'
    +'<div class="formula-note"><b>固定承接公式：</b>接住顾客原话 → 确认哪条家庭模式被验证 → 拉回顾客自己 → 问最近一次真实例子 → 才给开解。不要问完家庭故事就直接换下一张卡。</div>'
    +'</div>';
}
function modeProfile(arr){
  const active=countGroup(arr,[1,3,5,7,9]);
  const passive=countGroup(arr,[2,4,6,8]);
  const rational=countGroup(arr,[1,4,6,7]);
  const emotional=countGroup(arr,[2,3,5,8]);
  const vision=countGroup(arr,[9]);
  return {
    active,passive,rational,emotional,vision,
    action:active>passive?"主动型":active<passive?"被动／观察型":"主动被动平衡",
    mind:rational>emotional?"理性主导":rational<emotional?"感性主导":"理性感性平衡"
  };
}
function modeWhite(p){
  let x="";
  if(p.active>p.passive && p.rational>p.emotional) x="你的底层比较像“主动＋理性”：会先判断、抓重点，然后推进事情。";
  else if(p.active>p.passive && p.rational<p.emotional) x="你的底层比较像“主动＋感性”：感觉一来会比较快行动，也容易靠直觉和当下感受推动选择。";
  else if(p.active<p.passive && p.rational>p.emotional) x="你的底层比较像“观察＋理性”：不会急着出手，通常会先评估、确认条件与风险，再决定要不要动。";
  else if(p.active<p.passive && p.rational<p.emotional) x="你的底层比较像“观察＋感性”：会先感受环境、人和关系，确认安全与感觉对了才比较愿意行动。";
  else x="你的主动／被动或理性／感性比较接近，所以你不是固定一种做法，会根据场景切换。";
  if(p.vision) x+=" 另外你的盘里有9，9我会独立看成远见／大局视角，不硬塞进理性或感性。";
  return x;
}
function personalModePanel(a){
  const inner=modeProfile(a.innerTriangle);
  const outer=modeProfile(a.outerTriangle);
  const diff=(inner.action!==outer.action||inner.mind!==outer.mind);
  return '<div class="foundation-block"><div class="card-heading"><div><small>PERSONAL MODE</small><h3>主动／被动 × 理性／感性 × 远见</h3></div><span>'+esc(inner.action)+' · '+esc(inner.mind)+'</span></div>'
    +'<div class="formula-note"><b>最新固定分组：</b>主动＝1、3、5、7、9；被动＝2、4、6、8。理性＝1、4、6、7；感性＝2、3、5、8；9独立看“远见／大局”。人生蓝图先以三角形内判断本能底色，再用三角形外检查现实表现有没有变化。</div>'
    +'<div class="golden-support-grid"><div><small>主动</small><b>'+inner.active+'</b><span>1／3／5／7／9</span></div><div><small>被动</small><b>'+inner.passive+'</b><span>2／4／6／8</span></div><div><small>理性</small><b>'+inner.rational+'</b><span>1／4／6／7</span></div><div><small>感性</small><b>'+inner.emotional+'</b><span>2／3／5／8</span></div><div><small>远见</small><b>'+inner.vision+'</b><span>9独立读取</span></div></div>'
    +'<div class="question-box"><b>Josephine 白话：</b><br>“'+esc(modeWhite(inner))+'”</div>'
    +(diff?'<div class="ai-supplement"><div class="source-tag">内外反差提醒</div><p>三角形内：'+esc(inner.action)+'／'+esc(inner.mind)+'；三角形外：'+esc(outer.action)+'／'+esc(outer.mind)+'。这代表顾客在真实本能和现实表现之间可能有切换，优先用生活场景验证，不直接说成“戴面具”。</p></div>':'')
    +'<div class="question-box"><b>验证顾客：</b><br>“你做决定时更像哪一种：先动起来再调整，还是先观察清楚才动？你真正下决定的时候，是比较相信逻辑和条件，还是更看自己的感觉？如果工作和家里不一样，我们就继续看内外三角为什么会切换。”</div></div>';
}

function directBehaviorSynthesisPanel(c,a){
  const counts=a.innerEnergy?.counts||{};
  const sum=arr=>arr.reduce((t,n)=>t+Number(counts[n]||0),0);
  const inSet=(n,arr)=>arr.includes(Number(n));

  // Josephine fixed grouping — read ONLY from the inner triangle.
  const MALE=[1,3,5,7,8,9], FEMALE=[2,4,6,7,8];
  const BRAVE=[1,3,5,8,9], TACTIC=[2,4,6,7];
  const ACTIVE=[1,3,5,7,9], PASSIVE=[2,4,6,8];
  const RATIONAL=[1,4,6,7], EMOTIONAL=[2,3,5,8];

  const male=sum(MALE), female=sum(FEMALE);
  const brave=sum(BRAVE), tactic=sum(TACTIC);
  const active=sum(ACTIVE), passive=sum(PASSIVE);
  const rational=sum(RATIONAL), emotional=sum(EMOTIONAL);
  const vision=Number(counts[9]||0);
  const seven=Number(counts[7]||0);

  const main=Number(a.mainPersonality||0);
  const inner=Number(a.innerCode||0);
  const coreActive=(inSet(main,ACTIVE)?1:0)+(inSet(inner,ACTIVE)?1:0);
  const corePassive=(inSet(main,PASSIVE)?1:0)+(inSet(inner,PASSIVE)?1:0);
  const coreRational=(inSet(main,RATIONAL)?1:0)+(inSet(inner,RATIONAL)?1:0);
  const coreEmotional=(inSet(main,EMOTIONAL)?1:0)+(inSet(inner,EMOTIONAL)?1:0);

  const g=String(c?.gender||"");
  const isMale=/男/.test(g), isFemale=/女/.test(g);

  const genderTitle=isMale
    ?(male>female?"男性力量偏强":male<female?"女性力量偏强":"男性／女性力量接近")
    :isFemale
      ?(male>female?"男性力量在女性盘里偏强":male<female?"女性力量偏强":"男性／女性力量接近")
      :(male>female?"男性力量偏强":male<female?"女性力量偏强":"男性／女性力量接近");

  let genderText="";
  if(isMale){
    genderText=male>female
      ?"这张男性盘的推进、主导、目标和独立感比较明显。"
      :male<female
        ?"这张男性盘在承接、关系感、稳定与照顾层面更突出，做事不一定靠强攻。"
        :"这张男性盘的推进与承接力量比较接近，会明显看场景切换。";
    if(seven) genderText+=" 同时内三角有7，按你的体系，男性的力量会多一点柔和、思考和感受，不会只是硬推。";
  }else if(isFemale){
    genderText=male>female
      ?"这张女性盘的男性力量偏强，所以在做事时比较容易出现目标感、主导性、推进力和事业行动感。"
      :male<female
        ?"这张女性盘的女性力量更明显，比较容易从关系、承接、稳定、照顾和细节中建立力量。"
        :"这张女性盘的两组力量比较接近，既能推进，也能承接。";
    if(seven) genderText+=" 同时内三角有7，按你的体系，女性会多一点刚、边界感和独立判断。";
  }else{
    genderText=male>female
      ?"整体更偏主导、推进、目标和独立路线。"
      :male<female
        ?"整体更偏承接、关系、稳定和细节路线。"
        :"推进与承接两组力量比较接近。";
  }

  const actionBase=active>passive?"主动型":active<passive?"被动／观察型":"主动与被动接近";
  let actionTitle=actionBase, actionText="";
  if(active>passive){
    if(corePassive===2){
      actionTitle="整体主动，但核心会转被动";
      actionText="从三角形内整体看，你是主动型，遇到事情通常愿意推进、处理、做决定；但你的主性格 "+main+" 和内心码 "+inner+" 都落在被动组，所以到了关系压力、需要确认安全感、怕做错或怕影响别人时，你会突然慢下来，先观察、先等、先确认。也就是说，你不是没有行动力，而是『外在能推进，核心遇到顾虑时会收回来』。";
    }else if(corePassive===1){
      actionTitle="主动为主，核心带观察";
      actionText="整体底盘偏主动，但主性格／内心码里有一层被动能量，所以你不是盲目往前冲；越重要的事，越可能先看人、看风险或确认安全感，再决定怎么动。";
    }else{
      actionText="整体行动能量偏主动，遇到事情比较容易先推进、先处理，再边做边调整。";
    }
  }else if(active<passive){
    if(coreActive===2){
      actionTitle="整体偏观察，但核心会主动出手";
      actionText="整体更习惯先看、先确认，但主性格 "+main+" 和内心码 "+inner+" 都带主动能量；一旦碰到自己真正重视的事、底线或目标，你会突然变得很明确，甚至主动接管局面。";
    }else if(coreActive===1){
      actionTitle="观察为主，关键时会主动";
      actionText="你平时比较会先观察和确认，但核心并不是完全被动；当事情与你真正重视的目标有关时，你还是会出手。";
    }else{
      actionText="你比较习惯先观察、先确认、等条件清楚后才动，行动不是慢，而是需要心里有把握。";
    }
  }else{
    actionText="主动和观察两种能力都在，通常会看场景切换：熟悉或有把握时主动，不确定或关系风险高时会先观察。";
  }

  const mindBase=rational>emotional?"理性主导":rational<emotional?"感性主导":"理性与感性接近";
  let mindTitle=mindBase, mindText="";
  if(emotional>rational){
    if(coreRational===2){
      mindTitle="整体感性，核心有很强理性校准";
      mindText="三角形内整体明显偏感性，你会先感受到人、气氛、关系和自己的感觉；但主性格 "+main+" 与内心码 "+inner+" 又带理性组，所以真正做重要决定时，你会再把感受拿回来检查逻辑、规则和安全性。";
    }else if(coreRational===1){
      mindTitle="感性主导，带理性校准";
      mindText="整体偏感性，你通常先有感觉，再去思考对不对；不过核心里有一层理性，会让你在重要决定前多做一次现实检查。";
    }else{
      mindText="你做决定比较看感觉、人、关系和当下体验。优势是感受快、共情强；要留意不要把当下情绪直接当成最终答案。";
    }
  }else if(rational>emotional){
    if(coreEmotional===2){
      mindTitle="整体理性，但核心很有感觉";
      mindText="整体判断偏理性，习惯看条件、逻辑和可控性；但主性格 "+main+" 与内心码 "+inner+" 都有感性成分，所以关系和真正重要的人仍会明显影响你的判断。";
    }else if(coreEmotional===1){
      mindTitle="理性主导，内里仍会被感受触动";
      mindText="整体偏理性，但核心不是没有感觉。碰到亲密关系、价值感或自己很在乎的人时，感受仍然会进入你的决定。";
    }else{
      mindText="你做决定更依赖逻辑、条件、结构与可控性，通常不会让一时情绪直接替你下决定。";
    }
  }else{
    mindText="理性和感性都能调用，所以你通常看得很全面；卡点是两边都想顾时，容易想久一点才决定。";
  }

  const braveTitle=brave>tactic?"战略【勇】偏强":brave<tactic?"战术【谋】偏强":"勇谋接近";
  let braveText=brave>tactic
    ?"整体比较像先抓方向、敢决定、敢推进的人。"
    :brave<tactic
      ?"整体比较像先拆步骤、看风险、想清楚怎么做的人。"
      :"方向感和执行规划都比较接近，能看大局也能顾过程。";
  if(brave>tactic && corePassive===2) braveText+=" 但因为主性格与内心码都偏被动，你不是每一次都马上出手；越涉及关系、安全感或怕做错时，『谋』会先出来。";
  if(tactic>brave && coreActive===2) braveText+=" 不过核心主动性不弱，真的认定目标后，行动速度会明显加快。";

  const visionTitle=vision>=2?"远见明显":vision===1?"有远见视角":"远见9不突出";
  const visionText=vision>=2
    ?"9在内三角重复，比较容易自然看趋势、长期和更大的可能性；要留意不要因为想得太远而分散当下执行。"
    :vision===1
      ?"内三角有9，所以会有一定的大局、趋势与长线视角，但它不是整张盘唯一主轴。"
      :"内三角没有9，所以远见不是最自动的第一反应；这不代表没有长线能力，而是通常更从眼前条件和实际经验开始判断。";

  const integrated='“我先帮你把这几组综合起来看。你的三角形内，'+genderTitle+'；做事方式是'+actionTitle+'；思考与决定偏'+mindTitle+'；整体是'+braveTitle+'；'+visionTitle+'。'+genderText+' '+actionText+' '+mindText+' '+braveText+' '+visionText+'”';

  const probe1=active>passive&&corePassive===2
    ?"“你是不是平常看起来很能做、也愿意推进，但一碰到关系、怕做错、怕影响别人时，就会突然慢下来，甚至先等别人反应？”"
    :"“你遇到一件重要的事，通常是马上推进，还是会先观察到心里比较有把握才动？”";
  const probe2=emotional>rational
    ?"“你做决定的时候，是不是常常先有一个感觉，然后才开始找理由、条件或规则来确认这个感觉能不能执行？”"
    :"“你做重要决定时，会不会先把条件、风险和逻辑想清楚，之后才允许自己去看感受？”";

  return '<div class="foundation-block direct-behavior-panel"><div class="card-heading"><div><small>DIRECT SYNTHESIS · INNER TRIANGLE</small><h3>三角形内综合模式 · 系统直接替你判读</h3></div><span>不需要Josephine自己再数</span></div>'
    +'<div class="direct-insight-grid">'
      +'<article><small>性别力量</small><h4>'+esc(genderTitle)+'</h4><p>'+esc(genderText)+'</p></article>'
      +'<article><small>主动／被动</small><h4>'+esc(actionTitle)+'</h4><p>'+esc(actionText)+'</p></article>'
      +'<article><small>理性／感性</small><h4>'+esc(mindTitle)+'</h4><p>'+esc(mindText)+'</p></article>'
      +'<article><small>战略／战术</small><h4>'+esc(braveTitle)+'</h4><p>'+esc(braveText)+'</p></article>'
      +'<article><small>远见9</small><h4>'+esc(visionTitle)+'</h4><p>'+esc(visionText)+'</p></article>'
    +'</div>'
    +'<div class="question-box"><b>Josephine 专业白话｜可以直接照读：</b><br>'+esc(integrated)+'</div>'
    +'<div class="answer-branches"><div><b>验证顾客 1</b><p>'+esc(probe1)+'</p></div><div><b>验证顾客 2</b><p>'+esc(probe2)+'</p></div></div>'
    +'<div class="formula-note"><b>系统判断顺序：</b>先用三角形内全部数字看整体倾向，再用主性格 '+main+' ＋ 内心码 '+inner+' 做“核心修正”。所以不会再出现“整体算主动，就硬说这个人永远主动”的情况。</div>'
    +'<details class="reference-only"><summary>查看系统计算依据（现场咨询默认不展开）</summary>'
      +'<p>男性力量 '+male+'｜女性力量 '+female+'｜主动 '+active+'｜被动 '+passive+'｜理性 '+rational+'｜感性 '+emotional+'｜战略【勇】 '+brave+'｜战术【谋】 '+tactic+'｜9 '+vision+'</p>'
      +'<p>主性格 '+main+'｜内心码 '+inner+'｜核心主动命中 '+coreActive+'｜核心被动命中 '+corePassive+'｜核心理性命中 '+coreRational+'｜核心感性命中 '+coreEmotional+'</p>'
    +'</details>'
    +'</div>';
}

function strategyTacticPanel(a){
  const c=a.innerEnergy?.counts||{};
  const strategyDigits=[1,3,5,8,9], tacticDigits=[2,4,6,7];
  const strategy=strategyDigits.reduce((sum,n)=>sum+Number(c[n]||0),0);
  const tactic=tacticDigits.reduce((sum,n)=>sum+Number(c[n]||0),0);
  const type=strategy>tactic?"战略【勇】偏强":strategy<tactic?"战术【谋】偏强":"勇谋相对平衡";
  const script=strategy>tactic
    ?"你比较容易先定方向、先出手、先推动。你的优势是敢做决定；要补的是细节、节奏与执行路径。"
    :strategy<tactic
      ?"你比较容易先观察、规划、拆步骤、看风险。你的优势是谋得细；要补的是决定时点与出手速度。"
      :"你的“勇”和“谋”比较接近，既能看方向，也会顾过程。真正要留意的是压力下会不会两边都想顾，反而变慢。";
  return '<div class="foundation-block"><div class="card-heading"><div><small>STRATEGY × TACTICS</small><h3>战略【勇】 × 战术【谋】</h3></div><span>'+esc(type)+'</span></div>'
    +'<div class="golden-support-grid"><div><small>战略【勇】</small><b>'+strategy+'</b><span>1／3／5／8／9</span></div><div><small>战术【谋】</small><b>'+tactic+'</b><span>2／4／6／7</span></div></div>'
    +'<div class="question-box"><b>Josephine 白话：</b><br>“'+esc(script)+'”</div>'
    +'<div class="question-box"><b>验证顾客：</b><br>“你遇到一件新事情，通常是先决定方向再边做边调，还是会先把资料、步骤、风险想清楚才动？”</div></div>';
}

function lifeCoreFrameworkPanel(c,a){
  return '<div class="foundation-block"><div class="card-heading"><div><small>LIFE BLUEPRINT · READING ORDER</small><h3>人生蓝图标准解读顺序</h3></div><span>一项只讲一次</span></div>'
    +'<div class="formula-note">1 坐镇码三位拆解＋主性格＋起始数 → 2 父母基因／家庭力量 → 3 天赋＋缺失＋挑战 → 4 内心码＋潜意识码 → 5 内外三角综合 → 6 情绪码 → 7 性别力量＋主动／被动＋理性／感性＋远见＋勇谋（系统直接给结论） → 8 其余联合码（自动去重，只出现一次） → 9 原生家庭／679／黄金20年／三阶段主题。</div>'
    +'<div class="question-box"><b>咨询原则：</b><br>同一个数字、同一组联合码、同一个内外模式不重复讲。前面已经完整解释过的内容，后面只引用，不重新展开。这样顾客听到的是一条完整故事，不会觉得你在重复同样的料。</div></div>';
}


const CHILD_MODE_PROFILE = {
  1:{exam:"有目标和竞争感时比较容易进入状态；如果被否定、输给别人或觉得自己做不到，可能会急、顶嘴或直接放弃。考试前适合把目标拆成小关卡，让他看到自己一步一步赢回来。",speech:"说话直接、有主见，想到什么比较容易马上说；压力大时语气可能像命令，不一定是故意没礼貌，而是想快点把事情推进。",pressure:"压力一来容易更想自己做、自己决定，不喜欢被管太多；如果连续失败，会用逞强或不服输保护自信。"},
  2:{exam:"情绪和环境很影响发挥。关系安心、有人鼓励时会比较稳定；如果怕让父母失望，容易反复检查、犹豫或临场紧张。",speech:"语气通常比较柔，会先看别人反应才决定说多少；不开心时也可能先忍着，不一定当场讲。",pressure:"压力大时容易敏感、委屈、担心别人怎么看自己，可能先配合或退让，过后才难受。"},
  3:{exam:"有兴趣、画面感、互动感的学习方式比较容易吸收；但容易因为心急、分心或想快点完成而粗心。考试适合短段复习、即时反馈和完成感。",speech:"表达快、活泼、反应直接，容易把情绪写在脸上；兴奋时会讲很多，受批评时也可能马上反应。",pressure:"压力来得快，情绪也来得快；容易烦、急、分心，过一阵又恢复。"},
  4:{exam:"有固定流程、清楚范围和准备时间时表现最好。遇到陌生题型、临时变化或怕出错时，容易卡住、反复确认。",speech:"说话比较谨慎、讲事实、重对错和细节；不确定时宁可少说，也不喜欢被逼着马上回答。",pressure:"压力大时会更抓规则、细节和控制感，容易焦虑或因为怕错而变慢。"},
  5:{exam:"对新鲜、有变化、有互动的内容学得快，但重复性高时容易失去耐性。复习适合短冲刺、变化题型和明确完成线。",speech:"说话灵活、反应快、容易跳题，喜欢自由发挥；被限制太多时可能显得不耐烦。",pressure:"压力大时会想换方法、换环境、先逃开不舒服，容易用“我不要了”保护自己。"},
  6:{exam:"责任感强，通常会想把成绩做好；越在意父母和老师的期待，越可能给自己压力。适合把“考好”拆成过程目标，不只看分数。",speech:"说话会带照顾和提醒，也容易纠正别人；压力大时可能碎念、要求高，或把别人的事也当自己的责任。",pressure:"容易把“我应该做好”放得很重，做不到时自责、操心，甚至替别人一起担心。"},
  7:{exam:"理解型学习很强，喜欢先弄懂为什么；如果只靠死背会比较抗拒。考试时容易想太多、审题太久或怀疑第一答案。",speech:"不一定话多，但问的问题常常很深；不熟时比较安静，熟悉后会讲很多自己真正有兴趣的内容。",pressure:"压力大时容易退回自己的世界、想很多、不说，外面看起来安静，里面其实一直在分析。"},
  8:{exam:"目标、成绩、排名和“我要做到”会很有推动力；但越在意输赢，越容易把考试变成压力。适合设结果目标，也要同时设过程目标。",speech:"说话有力量、重点明确，容易像在下结论；紧张时语气会更强，别人可能觉得有压迫感。",pressure:"压力一来会更想控制、解决和赢回来，不喜欢承认自己怕或累。"},
  9:{exam:"理解整体、联想和创意通常不错，但容易想太多方向、忽略细节或时间管理。考试适合先抓大框架，再用清单收尾。",speech:"说话容易带故事、想法和大方向，常常从一个点联想到很多可能。",pressure:"压力大时容易一下想很多结果、很多可能，或者因为理想太大而不知道先做哪一步。"}
};


function childDigitLayer(n,role){
  const d=DIGIT_CORE[n]||{}, m=CHILD_MODE_PROFILE[n]||{}, detail=MAIN_DETAIL[n]||{};
  if(role==="cause"){
    return {
      title:n+"号｜因／为什么会这样反应",
      text:"孩子遇到事情时，内在比较容易先从「"+(d.core||"")+"」启动。也就是说，事情还没真正展开，他已经会先在意："+(detail.reaction||d.core||"")+"。",
      home:"在家里常见：当规则、期待或关系碰到这一点时，反应会特别明显。",
      school:"在学校／学习上可观察："+(m.exam||"先看真实学习反应。")
    };
  }
  if(role==="process"){
    return {
      title:n+"号｜过程／他怎么处理",
      text:"事情发生后，他比较容易用「"+(d.core||"")+"」来处理。顺的时候会变成"+(d.gift||"优势")+"；压力大时则可能走向"+(d.shadow||"过度反应")+"。",
      home:"家长要看的不是“他听不听话”，而是他正在用什么方式让自己重新有安全感／掌控感。",
      school:"在学习和考试压力里："+(m.pressure||detail.stress||"需要结合真实场景观察。")
    };
  }
  return {
    title:n+"号｜结果／别人最后看到的样子",
    text:"处理到最后，外面比较容易看到「"+(d.core||"")+"」这一面。这个数字如果同时是主性格，就会成为比较稳定的长期底色。",
    home:"家长最容易把这一层当成“他的性格”，但其实前面还有因和过程。",
    school:"说话／表达上："+(m.speech||detail.speech||"需要结合真实沟通场景验证。")
  };
}

const CHILD_SEAT_OVERRIDES={
  "461":{
    name:"规则感＋责任感＋自主意识",
    summary:"461的小朋友常常不是一开始就强势。4让他先想“这样对不对、会不会出错、有没有规则”；6让他在过程中想把事情做好、顾责任、顾标准；最后落到1，所以外面看到的往往是一个很有主见、想自己决定、说话直接的孩子。",
    speech:"说话最后会带1号的直接和结论感，尤其当他已经想清楚时，会觉得“我知道了，我自己来”。但因为过程有6，他也可能很爱提醒、纠正或告诉别人“应该怎样做”。如果内心码再落到2，就会出现一个反差：嘴上很硬、很有主见，里面其实很在意别人有没有不开心、有没有理解他。",
    learning:"学习上，4需要清楚规则和结构，6会让他想把事情做好，1则希望自己掌握方法。最适合的是：先给框架，再让他自己完成；最容易卡的是家长一直纠正、一直替他决定，让1号觉得被控制。",
    pressure:"压力大时可能变成“4怕错＋6觉得自己应该做好＋1不想输”。表现出来就是固执、顶嘴、急着证明自己，或者明明很紧张却说“我会，我自己来”。",
    parent:"带461小朋友，不要只跟1号硬碰硬。先把规则讲清楚（4），再肯定他的认真和责任感（6），最后给他两个可选择的方案，让1有自主权。"
  }
};

function childSeatCodeDeepPanel(a){
  const c=String(a.seatCode||"");
  const ds=jointCodeDigits(c);
  const cause=childDigitLayer(ds[0],"cause"), process=childDigitLayer(ds[1],"process"), result=childDigitLayer(ds[2],"result");
  const main=Number(a.mainPersonality||ds[2]||0);
  const inner=Number(a.innerCode||0);
  const sub=Number(a.subconsciousCode||0);
  const mainD=MAIN_DETAIL[main]||{}, mainM=CHILD_MODE_PROFILE[main]||{}, innerD=DIGIT_CORE[inner]||{}, innerM=CHILD_MODE_PROFILE[inner]||{}, subD=DIGIT_CORE[sub]||{}, subM=CHILD_MODE_PROFILE[sub]||{};
  const ov=CHILD_SEAT_OVERRIDES[c]||{};
  const summary=ov.summary||("这组"+c+"可以直接按『"+ds[0]+"是因 → "+ds[1]+"是过程 → "+ds[2]+"是结果／主性格』来读。孩子不是突然变成"+main+"号，而是前面两层一路把反应推到最后，形成你最常看到的"+main+"号表现。");
  const speech=ov.speech||("说话方式主要会被结果位／主性格"+main+"带出来："+(mainM.speech||mainD.speech||"")+"；但内心码"+inner+"会让他说完以后在里面再经历一层「"+(innerD.core||"")+"」，潜意识"+sub+"又会在突发情况下自动启动「"+(subD.core||"")+"」。所以不要只听他说出来的那一句，要看他说之前在担心什么、说完后又怎么消化。");
  const learning=ov.learning||("学习上先看因位"+ds[0]+"需要什么条件，再看过程位"+ds[1]+"怎样处理压力，最后看主性格"+main+"怎样把结果表现出来。"+(mainM.exam||""));
  const pressure=ov.pressure||("压力下，因位可能先出现"+(DIGIT_CORE[ds[0]]?.shadow||"不安")+"，过程位可能走到"+(DIGIT_CORE[ds[1]]?.shadow||"用力过度")+"，最后由主性格"+main+"表现成："+(mainM.pressure||mainD.stress||"需要结合真实场景验证。"));
  const parent=ov.parent||("家长要做的是先满足因位需要的安全条件，再帮助过程位换一种更省力的处理方式，最后给主性格"+main+"保留健康表达空间。不是压掉他的性格，而是教他怎么把同一组能量用得更成熟。");

  let innerText="";
  if(inner){
    innerText="内心码 "+inner+" 不等于外面看到的他。里面真正比较在意的是「"+(innerD.core||"")+"」。顺的时候是"+(innerD.gift||"")+"；不安时会"+(innerD.shadow||"")+"。"+
      (innerM.pressure?("所以当他嘴上说没事时，里面可能其实会"+innerM.pressure):"");
  }
  let subText="";
  if(sub){
    subText="潜意识码 "+sub+" 是事情突然发生、还没来得及想时最容易先启动的反应。这里是「"+(subD.core||"")+"」；顺的时候会"+(subD.gift||"")+"，压力下可能"+(subD.shadow||"")+"。"+
      (subM.speech?("这也会影响他当下的语气："+subM.speech):"");
  }

  return '<div class="foundation-block child-seat-deep">'
    +'<div class="card-heading"><div><small>CHILD SEAT CODE · 因 → 过程 → 结果</small><h3>儿童坐镇码 '+esc(c)+' × 主性格 '+main+'</h3></div><span>'+esc(ov.name||"儿童组合模式")+'</span></div>'
    +'<div class="formula-note"><b>儿童版联合码不是成人版换几个字。</b>这里固定看：为什么这样反应 → 他怎么处理 → 最后大人看到什么；再叠加主性格、内心码、潜意识码，最后才形成这个孩子完整的行为模式。</div>'
    +'<div class="notion-consult-grid">'
      +'<div><small>① 因</small><h4>'+esc(cause.title)+'</h4><p>'+esc(cause.text)+'</p><p>'+esc(cause.school)+'</p></div>'
      +'<div><small>② 过程</small><h4>'+esc(process.title)+'</h4><p>'+esc(process.text)+'</p><p>'+esc(process.school)+'</p></div>'
      +'<div><small>③ 结果／主性格</small><h4>'+esc(result.title)+'</h4><p>'+esc(result.text)+'</p><p>'+esc(result.school)+'</p></div>'
      +'<div><small>④ 整组模式</small><h4>'+esc(c)+'怎么连起来</h4><p>'+esc(summary)+'</p></div>'
    +'</div>'
    +'<div class="child-insight-grid">'
      +'<div><small>主性格 '+main+' 会把他变成什么样</small><p>'+esc((mainD.behavior||"")+' '+(mainD.reaction||""))+'</p></div>'
      +'<div><small>说话方式</small><p>'+esc(speech)+'</p></div>'
      +'<div><small>内心码 '+inner+'</small><p>'+esc(innerText)+'</p></div>'
      +'<div><small>潜意识码 '+sub+'</small><p>'+esc(subText)+'</p></div>'
      +'<div><small>学习／考试</small><p>'+esc(learning)+'</p></div>'
      +'<div><small>面对压力</small><p>'+esc(pressure)+'</p></div>'
      +'<div><small>家长怎么带</small><p>'+esc(parent)+'</p></div>'
      +'<div><small>优势怎么发挥</small><p>'+esc("不要只纠正结果位"+main+"的行为。先把"+ds[0]+"的需要看见，再教"+ds[1]+"更好的处理方法，"+main+"的优势才会真正出来。")+'</p></div>'
    +'</div>'
    +'<div class="question-box"><b>Josephine 可以直接跟家长说：</b><br>“我不会只告诉你他是'+main+'号。这个孩子是'+ds[0]+'先启动、'+ds[1]+'负责处理，最后才表现成'+main+'。所以你看到的强势、敏感、慢、急，很多时候只是最后一层。我们要找的是他前面为什么会变成这样。”</div>'
    +'<div class="answer-branches"><div><b>可以问家长 1</b><p>“他一被纠正的时候，是先紧张、先解释、先顶嘴，还是先不说话？我想看的是他‘第一秒’怎么反应。”</p></div><div><b>可以问家长 2</b><p>“他在学校和在家说话是一样的吗？跟老师、同学、爸爸妈妈分别会不会像不同的人？”</p></div><div><b>可以问家长 3</b><p>“考试前最容易出现的是怕错、拖延、急躁、想自己来，还是一直需要你确认？”</p></div></div>'
    +'</div>';
}

function childJointPositionMeaning(label){
  const x=String(label||"");
  if(x.includes("父亲")) return "放在父亲基因时，不讲成人事业，优先观察孩子怎样理解权威、规则、爸爸／男性照顾者，以及被要求时的反应。";
  if(x.includes("母亲")) return "放在母亲基因时，优先观察孩子怎样接收照顾、安全感、情绪回应，以及和妈妈／主要照顾者之间的互动。";
  if(x.includes("坐镇")||x.includes("主性格")) return "放在坐镇／主性格位置时，是孩子最常重复的核心行为链：为什么这样反应 → 怎么处理 → 最后表现成什么。";
  if(x.includes("21–40")||x.includes("41–60")||x.includes("61")) return "这组在儿童咨询里不拿来预测成年事业／财富，只作为成长后的结构参考；现场仍然先用孩子现在的学习、表达、关系和压力反应验证。";
  return "儿童版只拿来观察学习、表达、家庭、同伴、规则和压力反应，不套成人财富／婚姻／事业结论。";
}

function childJointBlock(c,label){
  const ds=jointCodeDigits(c);
  if(ds.length!==3) return "";
  const first=childDigitLayer(ds[0],"cause"), second=childDigitLayer(ds[1],"process"), third=childDigitLayer(ds[2],"result");
  const s=getFlootKnowledge(c)||{};
  const adultCore=s.logic||"";
  const strengths=ds.map(n=>DIGIT_CORE[n]?.gift).filter(Boolean).join("＋");
  const shadows=ds.map(n=>DIGIT_CORE[n]?.shadow).filter(Boolean).join("；");
  const speech=CHILD_MODE_PROFILE[ds[2]]?.speech||"";
  const exam=[CHILD_MODE_PROFILE[ds[0]]?.exam,CHILD_MODE_PROFILE[ds[1]]?.exam,CHILD_MODE_PROFILE[ds[2]]?.exam].filter(Boolean).join(" ");
  const parentGuide="先处理"+ds[0]+"的触发点，再教"+ds[1]+"更健康的处理方式，最后给"+ds[2]+"一个可以表达但有边界的出口。";
  return '<details class="joint-entry child-joint-entry"><summary><span><b>'+esc(c)+'</b> · '+esc(label)+'<small style="display:block;font-weight:400;margin-top:4px;opacity:.72">儿童白话：'+ds[0]+'是因 → '+ds[1]+'是过程 → '+ds[2]+'是结果</small></span><span>儿童版</span></summary>'
    +'<div class="joint-body"><div class="source-tag">儿童联合码｜不套成人事业财富婚姻</div>'
      +'<div class="notion-consult-grid"><div><small>因</small><p>'+esc(first.text)+'</p></div><div><small>过程</small><p>'+esc(second.text)+'</p></div><div><small>结果</small><p>'+esc(third.text)+'</p></div><div><small>这个位置</small><p>'+esc(childJointPositionMeaning(label))+'</p></div></div>'
      +(adultCore?'<div class="formula-note"><b>原组合逻辑只保留结构参考：</b>'+esc(adultCore)+'<br>儿童咨询不会直接沿用其中的成人财富／事业／关系结论。</div>':'')
      +'<div class="child-insight-grid"><div><small>正面潜力</small><p>'+esc(strengths)+'</p></div><div><small>压力卡点</small><p>'+esc(shadows)+'</p></div><div><small>说话表现</small><p>'+esc(speech)+'</p></div><div><small>学习／考试</small><p>'+esc(exam)+'</p></div></div>'
      +'<div class="question-box"><b>Josephine 儿童白话：</b><br>“这组'+esc(c)+'我不会用成人方式去讲。对孩子来说，我先看'+ds[0]+'为什么被触发，再看'+ds[1]+'怎么处理，最后才看到'+ds[2]+'表现出来。真正要帮他的，不是把最后那个行为压掉，而是从前面两步开始调整。”</div>'
      +'<div class="question-box"><b>家长开解方向：</b><br>“'+esc(parentGuide)+'”</div>'
    +'</div></details>';
}

function childUnifiedJointCodes(a){
  const rows=[
    ["父亲基因",a.fatherCode],
    ["母亲基因",a.motherCode],
    ["坐镇码／主性格",a.seatCode],
    ["21–40 因果",code(a.phases?.["21–40"]?.cause||[])],
    ["21–40 过程1",code(a.phases?.["21–40"]?.process1||[])],
    ["21–40 过程2",code(a.phases?.["21–40"]?.process2||[])],
    ["21–40 结果",code(a.phases?.["21–40"]?.result||[])],
    ["41–60 因果",code(a.phases?.["41–60"]?.cause||[])],
    ["41–60 过程1",code(a.phases?.["41–60"]?.process1||[])],
    ["41–60 过程2",code(a.phases?.["41–60"]?.process2||[])],
    ["41–60 结果",code(a.phases?.["41–60"]?.result||[])],
    ["61+ 因果",code(a.phases?.["61+"]?.cause||[])],
    ["61+ 过程1",code(a.phases?.["61+"]?.process1||[])],
    ["61+ 过程2",code(a.phases?.["61+"]?.process2||[])],
    ["61+ 结果",code(a.phases?.["61+"]?.result||[])]
  ].filter(x=>x[1]);
  const map=new Map();
  rows.forEach(([label,cv])=>{
    if(!map.has(cv)) map.set(cv,{code:cv,labels:[]});
    map.get(cv).labels.push(label);
  });
  const unique=[...map.values()].filter(x=>x.code!==String(a.seatCode)); // seat already deeply explained above
  return '<div class="foundation-block"><div class="card-heading"><div><small>CHILD JOINT CODES · DEDUPED</small><h3>儿童联合码完整解析 · 每组只出现一次</h3></div><span>学习 · 表达 · 压力 · 家庭</span></div>'
    +'<div class="formula-note">坐镇码已经在上面完整讲过，这里不重复。其他联合码如果号码一样，也只出现一次，把所有位置合并在标题。儿童版不会出现“发财、桃花、高管、婚姻结果”这类成人话术。</div>'
    +'<div class="joint-stack">'+(unique.length?unique.map(x=>childJointBlock(x.code,x.labels.join("｜"))).join(""):'<div class="empty-mini">其余联合码已在前面出现，不需要重复。</div>')+'</div></div>';
}

function childAudience(c){
  return localStorage.getItem(blueprintAudienceKey(c.id))||"adult";
}
function childModifierSummary(a){
  const repeated=(a.innerEnergy?.repeated||[]);
  const missing=(a.innerEnergy?.missing||[]);
  const emotion=a.innerEnergy?.counts||{};
  const inCount=Number(emotion[2]||0)+Number(emotion[7]||0);
  const outCount=Number(emotion[3]||0)+Number(emotion[8]||0);
  const e=inCount>outCount?"情绪更容易先往内收":outCount>inCount?"情绪更容易直接表现出来":(inCount+outCount?"内收与外放会看场景切换":"情绪码不是这张盘最突出的主题");
  return {
    repeated:repeated.length?("重复较明显："+repeated.join("、")+"。这些数字会把对应天赋和卡点一起放大。"):"没有特别高密度的重复数字。",
    missing:missing.length?("需要后天练习的领域："+missing.join("、")+"。这不代表不会，而是通常不是最自然的第一反应。"):"没有明显缺失数字。",
    emotion:e
  };
}
function childBlueprintPanel(c){
  const a=calculateBlueprint(c.birthday);
  const n=a.mainPersonality;
  const child=CHILD?.[n]||CHILD?.[String(n)]||{};
  const adult=MAIN_DETAIL[n]||{};
  const mode=CHILD_MODE_PROFILE[n]||{};
  const mods=childModifierSummary(a);
  const positive=child.strength||adult.talents||"";
  const negative=child.watch||adult.watch||"";
  const traits=(child.keywords||[]).join("、");
  const talk='“这个孩子我不会只看成 '+n+' 号。我会先看坐镇码为什么启动、怎么处理、最后怎样表现，再叠加内心码和潜意识码。这样你会知道：你现在看到的是他的本性、压力反应，还是为了适应环境长出来的做法。”';
  return '<div class="module-render child-blueprint-mode">'
    +'<div class="card-heading"><div><small>CHILD BLUEPRINT MODE</small><h2>小朋友蓝图 · '+esc(c.name)+'</h2></div><span>联合码儿童化 · 深度版</span></div>'
    +'<div class="blueprint-audience-switch"><button type="button" data-blueprint-audience="adult">成人蓝图</button><button type="button" class="active" data-blueprint-audience="child">小朋友蓝图</button></div>'
    +'<div class="formula-note"><b>儿童模式现在固定分层：</b>坐镇码因→过程→结果／主性格 → 内心码 → 潜意识码 → 学习考试 → 说话方式 → 压力反应 → 家长怎么带 → 其他联合码儿童版。成人事业、财富、婚姻话术不会直接带进来。</div>'
    +blueprintSheet(c,a,"小朋友蓝图 · "+c.name)
    +childSeatCodeDeepPanel(a)
    +'<div class="foundation-block"><div class="card-heading"><div><small>CHILD CORE</small><h3>'+n+'号儿童 · '+esc(child.name||adult.title||"")+'</h3></div><span>'+esc(traits||"儿童核心模式")+'</span></div>'
      +'<div class="child-insight-grid">'
        +'<div><small>特性</small><p>'+esc(traits||child.strength||"")+'</p></div>'
        +'<div><small>性格底色</small><p>'+esc(child.strength||adult.behavior||"")+'</p></div>'
        +'<div><small>正面</small><p>'+esc(positive)+'</p></div>'
        +'<div><small>负面／用过头</small><p>'+esc(negative)+'</p></div>'
        +'<div><small>面对压力</small><p>'+esc(mode.pressure||adult.stress||"")+'</p></div>'
        +'<div><small>考试／学习反应</small><p>'+esc(mode.exam||"要结合孩子真实学习方式验证。")+'</p></div>'
        +'<div><small>跟人说话的态度</small><p>'+esc(mode.speech||adult.speech||"")+'</p></div>'
        +'<div><small>核心优势</small><p>'+esc(child.strength||adult.talents||"")+'</p></div>'
        +'<div><small>主要卡点</small><p>'+esc(child.watch||adult.watch||"")+'</p></div>'
      +'</div>'
      +'<div class="question-box"><b>Josephine 可以直接跟家长说：</b><br>'+esc(talk)+'</div>'
    +'</div>'
    +'<div class="foundation-block"><div class="card-heading"><div><small>WHOLE CHART MODIFIERS</small><h3>整张盘怎样修正这个孩子</h3></div><span>重复 · 缺失 · 情绪</span></div>'
      +'<div class="child-insight-grid"><div><small>重复／天赋放大</small><p>'+esc(mods.repeated)+'</p></div><div><small>缺失／需要练习</small><p>'+esc(mods.missing)+'</p></div><div><small>情绪模式</small><p>'+esc(mods.emotion)+'</p></div></div>'
      +'<div class="question-box"><b>验证家长：</b><br>“这些里面，哪一项在学校最明显？哪一项只在家里出现？如果学校和家里完全不一样，我们就继续看内外三角和环境影响。”</div>'
    +'</div>'
    +childUnifiedJointCodes(a)
    +'<div class="foundation-block"><div class="card-heading"><div><small>PARENT GUIDANCE</small><h3>家长怎么带 · 从原因开始，不只纠正结果</h3></div></div>'
      +'<div class="question-box"><b>教育方向：</b><br>'+esc(child.guide||"先顺着优势建立信心，再训练较弱的部分。")+'</div>'
      +'<div class="question-box"><b>可以问家长：</b><br>“他被催的时候第一秒是什么反应？”<br>“考试前最常出现的是拖延、紧张、急躁，还是过度检查？”<br>“老师眼里的他，跟你在家里看到的是同一个样子吗？”<br>“他说完很硬的话以后，会不会其实很在意别人有没有生气？”<br>“他最容易因为什么被批评后马上关掉自己？”</div>'
      +'<div class="formula-note">如果孩子持续出现明显学习困难、情绪困扰、睡眠／身体症状或发展问题，数字咨询不代替老师、儿科医生、教育心理或心理专业评估。</div>'
    +'</div>'
    +'</div>';
}


function consultationStartPanel(c,a){
  const age=ageFromBirthday(c.birthday), phase=phaseForAge(age), meta=PHASE_META[phase]||{};
  return '<div class="foundation-block">'
    +'<div class="card-heading"><div><small>LIVE CONSULTATION · START HERE</small><h3>咨询从这里直接开始 · 不是全部解读完才问</h3></div><span>'+age+'岁 · '+esc(meta.label||phase)+'</span></div>'
    +'<div class="question-box"><b>开场可以直接照读：</b><br>“'+esc(c.name||"顾客")+'，今天我不会一开始就丢很多数字给你。我会先听你现在最想解决什么，再用你的盘去找相关模式。数字只是给我观察方向，如果跟你的真实经历不一样，我们就以你的经历为准。”</div>'
    +'<div class="question-box"><b>第一题直接问：</b><br>“你今天最想解决的是工作／事业、关系、钱、家庭，还是自己的方向？”</div>'
    +'<div class="notion-consult-grid">'
      +'<div><small>顾客说「工作」</small><p>“好，那我先看你做决定、行动、责任和当前年龄阶段，找出真正卡在哪一层。”</p></div>'
      +'<div><small>顾客说「关系」</small><p>“好，我先看你怎么顾关系、怎么表达需要，再看原生模式和内外反差。”</p></div>'
      +'<div><small>顾客说「钱」</small><p>“好，我不会只看一个财运数字，我会把赚钱方式、选择、边界、资源管理和当前阶段一起看。”</p></div>'
      +'<div><small>顾客说「不知道」</small><p>“没关系，那我先给你一个最明显的观察，你听听看像不像，再从你的故事进去。”</p></div>'
    +'</div>'
    +'<div class="formula-note"><b>固定节奏：</b>先问 → 顾客回答 → 接住原话 → 连回数字／位置 → 问最近一个真实例子 → 才给建议。不要把所有解释念完才让顾客讲话。</div>'
    +'</div>';
}


function currentPhaseConsultationPanel(c,a){
  const age=ageFromBirthday(c.birthday), phase=phaseForAge(age), meta=PHASE_META[phase]||{}, v=a.phases[phase]||{};
  const codes=[code(v.cause||[]),code(v.process1||[]),code(v.process2||[]),code(v.result||[])];
  const ks=codes.map(cv=>getFlootKnowledge(cv)||{});
  const all=codes.join("");
  const has=n=>all.includes(String(n));
  const stageLine=codes.map((cv,i)=>{
    const label=["因／为什么会启动","过程一／事情怎样展开","过程二／另一条展开线","结果／长期容易走到"][i];
    const k=ks[i]||{};
    return '<div><small>'+label+'</small><strong>'+esc(cv)+'</strong><p>'+esc(k.script||k.logic||"结合这个位置与真实经历验证。")+'</p></div>';
  }).join("");
  const career=(has(3)||has(5)||has(8)||has(1))
    ?"这一阶段比较值得验证推进、变化、成果和自主决定有没有同时变多。能力越强，越要分清什么值得做，什么只是因为你做得到就接下来。"
    :"这一阶段更值得看稳定、协调、专业深度与长期累积，不一定要用很快的扩张证明自己。";
  const relation=(has(2)||has(6)||has(7))
    ?"关系、合作、照顾与判断边界会明显参与决定。重点不是有没有人缘，而是会不会因为顾关系把自己的条件讲得太晚。"
    :"关系不是这一阶段唯一主轴，仍要用真实合作和亲密关系验证。";
  const wealth=(has(4)||has(6)||has(8))
    ?"财富更值得看制度、责任、资源和结果；越往后越不能只靠人情与临场处理。"
    :"财富先看机会怎样进来、怎样选择与执行，再补制度和长期管理。";
  const responsibility=(has(6)||has(8))
    ?"这一阶段比较容易进入“别人越来越把事情交给你”的状态。课题是责任边界，不是证明自己能扛多少。"
    :"责任压力未必是主轴，但仍要看有没有把不属于自己的事情接进来。";
  const network=(has(2)||has(3)||has(7)||has(9))
    ?"人脉、沟通、识人或机会连接值得重点验证。重点不是认识越多人越好，而是哪些关系真的能互相支持。"
    :"人脉不是自动优势时，更适合经营少量稳定关系，而不是追求数量。";
  const inner="当前阶段要和主性格"+a.mainPersonality+"、内心码"+a.innerCode+"、潜意识"+a.subconsciousCode+"一起读：外面的阶段要求与里面真正需要不一致时，体感通常会更累。";
  const aspects=[
    ["事业／工作",career,"这几年你的工作是越来越被交付责任，还是仍然主要靠临场救火？"],
    ["关系／合作",relation,"合作开始时，你会不会先顾气氛，做到后面才谈条件或边界？"],
    ["财富／资源",wealth,"现在你的钱更卡在机会不够、选择太多，还是制度和管理跟不上？"],
    ["责任",responsibility,"有没有越来越多事情因为你做得到，最后就自然变成你负责？"],
    ["人际／朋友",network,"你现在的人际是越多越好，还是圈子变小但更精准？"],
    ["内在状态",inner,"外面要求你做的，和你里面真正想要的，是同一个方向吗？"]
  ];
  return '<div class="foundation-block">'
    +'<div class="card-heading"><div><small>CURRENT LIFE PHASE · AUTO AGE</small><h3>当前阶段｜'+age+'岁｜'+esc(meta.label||phase)+'｜'+esc(meta.theme||"")+'</h3></div><span>只展开当前阶段</span></div>'
    +'<div class="formula-note"><b>系统已自动判断年龄：</b>不会再只是告诉你“这个阶段看事业／孩子／家庭”。下面直接用这个顾客当前阶段的四组码做咨询：'+esc(codes.join(" → "))+'。</div>'
    +'<div class="phase-code-grid">'+stageLine+'</div>'
    +'<div class="v23-detail-grid">'+aspects.map(x=>'<article><h4>'+x[0]+'</h4><p>'+esc(x[1])+'</p><div class="question-box"><b>验证顾客：</b><br>“'+esc(x[2])+'”</div><div class="question-box"><b>顾客确认后：</b><br>“好，那这就是你当前阶段正在放大的现实课题。我们不讲命定结果，直接看现在要调整哪一个选择、边界或习惯。”</div></article>').join("")+'</div>'
    +'<details class="blueprint-expander reference-only"><summary>查看其他两个年龄阶段（未来参考，不是当前主场）</summary>'+Object.keys(a.phases).filter(p=>p!==phase).map(p=>phaseDetails(a,p)).join("")+'</details>'
    +'</div>';
}


function wealthWholeChartPanel(c,a){
  const age=ageFromBirthday(c.birthday), phase=phaseForAge(age), v=a.phases[phase]||{};
  const resultCode=code(v.result||[]);
  const father=getFlootKnowledge(a.fatherCode)||{}, mother=getFlootKnowledge(a.motherCode)||{};
  const challenges=a.innerEnergy?.repeated||[], missing=a.innerEnergy?.missing||[];
  const mainD=MAIN_DETAIL[a.mainPersonality]||{}, innerD=DIGIT_CORE[a.innerCode]||{}, subD=DIGIT_CORE[a.subconsciousCode]||{};
  const flowYear=activeFlowYear(new Date()), snap=calculateGoldenYearSnapshot(c.birthday,flowYear), flow=snap?.personal||{};
  const challengeText=challenges.length?challenges.map(n=>(ENERGY_LIBRARY[n]?.name||n)).join("、"):"没有明显重复挑战数";
  const missingText=missing.length?missing.map(n=>(ENERGY_LIBRARY[n]?.name||n)).join("、"):"没有明显缺失数";
  const earning="主性格"+a.mainPersonality+"的优势是"+(mainD.talents||"把自然能力转成价值")+"。再看父亲基因"+a.fatherCode+"与母亲基因"+a.motherCode+"，比较适合从沟通、服务、专业、解决问题、资源与合作中找“别人愿意为什么付钱”，而不是只找一个所谓财运数字。";
  const leakage=challenges.length
    ?"真正要防的不是“漏财数字”，而是惯用能力用过头："+challengeText+"。它会先表现成关系优先、选择过多、责任过重或控制过强等行为，再影响定价、合作和资源分配。"
    :"目前没有明显重复挑战数，财富卡点更要从缺失能力与现实习惯验证。";
  const decision="内心码"+a.innerCode+"代表真正想要「"+(innerD.core||"")+"」；潜意识"+a.subconsciousCode+"在突发时先启动「"+(subD.core||"")+"」。所以花钱、投资或合作决定不能只看嘴上说什么，要看当时是在追求安全、关系、自由，还是想马上解决问题。";
  const cooperation="父亲基因"+a.fatherCode+"："+(father.script||father.logic||"看处理问题与权威经验")+"；母亲基因"+a.motherCode+"："+(mother.script||mother.logic||"看照顾、方向与资源经验")+"。财富合作要验证有没有把家庭里学来的责任、沟通或主导方式带进客户与伙伴关系。";
  let habit="";
  if(missing.includes(4)) habit+="先建立固定记录、预算与复盘；";
  if(missing.includes(8)) habit+="合作前先写清权责、报价与交付；";
  if(missing.includes(7)) habit+="重大决定多做一次研究与风险检查；";
  if(missing.includes(9)) habit+="每季度做一次长期方向复盘；";
  if(!habit) habit="保留一个固定财务习惯，并用真实数据复盘。";
  const full="你的财富模式我不会只看你是"+a.mainPersonality+"号。先看你怎样创造价值，再看你为什么会接机会、怎样做决定、会不会把关系和责任放到条件前面。你现在是"+age+"岁，当前阶段结果码是"+resultCode+"；今年流年主题是"+(flow.number||"")+" "+(flow.title||"")+"。所以我们看的是能力怎么变成收入、收入怎么被管理、合作怎样不消耗，而不是保证哪一年一定发财。";
  return '<div class="foundation-block">'
    +'<div class="card-heading"><div><small>WEALTH CONSULTATION · WHOLE CHART</small><h3>财富模式｜整张盘综合，不再只看主性格</h3></div><span>不作收益保证</span></div>'
    +'<div class="formula-note"><b>分析顺序：</b>主性格／坐镇码 → 内心与潜意识 → 父母基因 → 挑战／缺失 → 当前年龄阶段 → 当前流年 → 最后回到现实收入、职业、报价、消费与合作验证。679不参与自动财富结论。</div>'
    +'<div class="v23-detail-grid">'
      +'<article><h4>赚钱方式／优势</h4><p>'+esc(earning)+'</p></article>'
      +'<article><h4>容易卡财的行为</h4><p>'+esc(leakage)+'</p><small>当前挑战：'+esc(challengeText)+'</small></article>'
      +'<article><h4>做决定／花钱模式</h4><p>'+esc(decision)+'</p></article>'
      +'<article><h4>合作／客户／资源模式</h4><p>'+esc(cooperation)+'</p></article>'
      +'<article><h4>当前阶段</h4><p>'+esc(age+"岁 · "+phase+" · 结果码 "+resultCode+"。今年流年 "+(flow.number||"")+" "+(flow.title||"")+"。")+'</p></article>'
      +'<article><h4>财富习惯建议</h4><p>'+esc(habit)+'</p><small>当前缺失：'+esc(missingText)+'</small></article>'
    +'</div>'
    +'<div class="question-box"><b>Josephine完整白话｜可以直接照读：</b><br>“'+esc(full)+'”</div>'
    +'<div class="answer-branches">'
      +'<div><b>验证1｜机会</b><p>“你现在赚钱最大的卡点，是机会不够，还是机会来了以后很难筛？”</p></div>'
      +'<div><b>验证2｜条件</b><p>“合作开始时，你会不会不好意思谈太细，做到后面才觉得条件不公平？”</p></div>'
      +'<div><b>验证3｜花钱</b><p>“你花钱最容易花在人情、家人、品质、自由体验，还是突然想换方向？”</p></div>'
      +'<div><b>验证4｜系统</b><p>“你现在有没有一个固定方法知道每个月的钱到底流去哪里？”</p></div>'
    +'</div>'
    +'<div class="question-box"><b>顾客回答后这样接：</b><br>“好，那现在我们已经知道你的财富问题属于哪一层了。不是继续找更多‘财运’，而是把这个行为模式改成制度、边界或筛选标准。先改一个最影响钱的动作，比再看十个数字更有用。”</div>'
    +'</div>';
}

function lifeBlueprintPanel(c){
  if(childAudience(c)==="child") return childBlueprintPanel(c);
  const a=calculateBlueprint(c.birthday);
  return '<div class="module-render">'
    +'<div class="card-heading"><div><small>LIFE BLUEPRINT</small><h2>人生蓝图 · Josephine 标准咨询版</h2></div><span>一项只讲一次 · 白话完整保留</span></div>'
    +'<div class="blueprint-audience-switch"><button type="button" class="active" data-blueprint-audience="adult">成人蓝图</button><button type="button" data-blueprint-audience="child">小朋友蓝图</button></div>'
    +blueprintSheet(c,a,"人生蓝图 · "+c.name)
    +lifeCoreFrameworkPanel(c,a)
    +seatCodeDeepPanel(a)
    +parentGeneBalancePanel(a)
    +talentNumbersPanel(a)
    +detailedEnergyPanel(a)
    +innerCodeDeepPanel(a)
    +trianglePatternSection(a)
    +emotionCodePanel(a)
    +directBehaviorSynthesisPanel(c,a)
    +unifiedJointCodes(a)
    +originalFamilyPanel(a)
    +energy679Panel(a)
    +golden20Panel(a)
    +'<div class="foundation-block"><div class="card-heading"><div><small>THREE PHASES</small><h3>三阶段主题总览</h3></div><span>号码不重复出现</span></div>'
      +phaseOverview(a,"21–40")+phaseOverview(a,"41–60")+phaseOverview(a,"61+")
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
  if(key==="儿童蓝图") panel.innerHTML=childBlueprintPanel(c);
  else if(key==="黄金流年") panel.innerHTML=yearPanel(c);
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

function smartIntent(answer,c){
  const t=String(answer||"").trim();
  const tests=[
    ["wealth_timing",/(什么时候|几岁|哪一年|哪年|多久).*(发达|发财|有钱|赚钱|赚大钱|收入|财富|起飞|翻身)|(?:发达|发财|有钱|赚钱|财富).*(什么时候|几岁|哪一年|哪年|多久)/],
    ["wealth",/(发达|发财|有钱|赚钱|赚大钱|收入|财富|财运|钱|资产|生意|业绩)/],
    ["career_fit",/(适合.*(?:工作|行业|职业|做什么)|做什么.*适合|要不要转行|换工作|辞职|创业|事业方向|职业方向)/],
    ["relationship_decision",/(要不要.*(?:分手|离婚|在一起|结婚)|该不该.*(?:分手|离婚|在一起|结婚)|适不适合.*(?:在一起|结婚)|正缘|配不配)/],
    ["relationship_timing",/(什么时候|几岁|哪一年|哪年).*(结婚|恋爱|遇到|对象|感情)|(?:结婚|恋爱|对象|感情).*(什么时候|几岁|哪一年|哪年)/],
    ["flow_year",/(今年|明年|后年|202[6-9]|流年|今年会|今年适合|明年适合)/],
    ["health",/(健康|生病|身体|失眠|焦虑|抑郁|胃|心脏|头痛|月经|怀孕|疾病|癌|血压)/],
    ["family",/(孩子|小孩|儿子|女儿|父母|爸爸|妈妈|家人|家庭|亲子)/],
    ["boundary",/(拒绝|不好意思|怕得罪|怕别人|委屈|答应|不敢说不|讨好|边界|不敢拒绝)/],
    ["career",/(工作|事业|同事|朋友|客户|老板|上司|下属|团队|销售|生意|公司)/],
    ["communicate",/(沟通|解释|说|讲|表达|问|谈|吵架)/],
    ["observe",/(观察|想很多|考虑|分析|担心|看看|沉默|不说|先想|纠结|犹豫)/],
    ["action",/(先行动|马上|处理|解决|负责|帮忙|扛|做掉|搞定|冲动)/],
    ["self",/(我是谁|为什么我|性格|改变|成长|方向|迷茫|不知道自己|看不懂自己)/]
  ];
  for(const [key,re] of tests) if(re.test(t)) return key;
  if(c?.consultationTheme==="事业／工作"||c?.consultationTheme==="金钱／资源") return "career";
  if(c?.consultationTheme==="感情／关系") return "relationship_decision";
  if(c?.consultationTheme==="家庭／亲子") return "family";
  return "general";
}
function smartGoldenContext(a){
  const p=a?.positions||{};
  return [p.U,p.R,p.X].map(v=>v??"—").join("");
}
function currentYearContext(c){
  const y=activeFlowYear();
  const snap=calculateGoldenYearSnapshot(c.birthday,y);
  const cur=snap?.personal||{};
  return {year:y,number:cur.number,title:cur.title||YEAR_THEMES?.[cur.number]?.title||""};
}
function buildSmartJosephineReply(c,a,phase,step,answer){
  const intent=smartIntent(answer,c);
  const meta=PHASE_META[phase]||{label:phase,theme:""};
  const yc=currentYearContext(c);
  const golden=smartGoldenContext(a);
  const quote=String(answer||"").trim();
  const ctx='当前：'+activeModuleName()+' · '+meta.label+' · '+meta.theme+' · 主性格 '+a.mainPersonality+' · 黄金20年 '+golden+' · '+yc.year+'流年 '+yc.number+(yc.title?(' '+yc.title):'');
  const common={
    wealth_timing:{
      catch:"我听到你真正想问的是：不是“我有没有机会”，而是“哪个阶段比较容易把事业和财富做起来”。这个问题可以看，但我不会只凭一个数字告诉你某一年一定发财。",
      connect:"要看“什么时候比较容易出成果”，我会把三个层次叠在一起：你现在走到哪个20年阶段、黄金20年的 U→R→X 结果线，以及当下流年的个人四组与大环境四组。这样看的是发力窗口和累积节奏，不是保证某年暴富。",
      next:"你说的“发达”具体是指哪一种：收入明显提高、事业位置提升、创业稳定、资产累积，还是知名度／客户量上来？你先定义结果，我才不会答偏。",
      action:"先把“发达”定义清楚，再看当前阶段适合累积、扩张还是收尾。系统下一步应该围绕这个目标去挑最相关的阶段码和流年码，而不是继续问一个无关的性格问题。"
    },
    wealth:{
      catch:"你现在关心的是钱和成果，我会直接把问题放到事业／资源这一层，不绕去问无关的人际问题。",
      connect:"财富不能只看一个“财运码”。我会同时看你当前20年阶段的结果、相关联合码、6／7／9等资源线索，以及今年流年的实际节奏，再结合你的职业和现实收入模式验证。",
      next:"你现在最想改善的是哪一块：收入不够、赚得到但留不住、客户不稳定、事业卡住，还是想把规模做大？",
      action:"不同问题的解法完全不同。先分清是“赚钱能力、留钱能力、机会来源、定价／成交，还是资源管理”，再回到盘里找对应证据。"
    },
    career_fit:{
      catch:"这个问题我不会只用一句“适合／不适合”回答，因为职业选择不能只靠号码决定。",
      connect:"我会先看你的自然工作方式、当前阶段和相关事业联合码，再用四个现实条件校准：趋势、价值、天赋、热爱。盘负责告诉我们你怎么做事比较顺，现实负责告诉我们这个行业值不值得做。",
      next:"你现在考虑的具体行业／工作是什么？你最犹豫的是收入、能力、稳定、兴趣，还是怕转了以后后悔？",
      action:"把行业说具体后，我们再分成“你做起来顺不顺”和“市场上值不值得做”两层判断，不会把性格倾向当成职业命令。"
    },
    relationship_decision:{
      catch:"我知道你现在很想要一个明确答案，但关系里的“要不要”我不会替你拍板。我能帮你的是把真正让你犹豫的地方看清楚。",
      connect:"盘可以帮助我们看你在关系里的重复模式、边界、情绪和需求，但不能代替对方的真实行为，也不能替你决定留下还是离开。",
      next:"先不要问“要不要”。你告诉我：现在最让你不舒服的那件事是什么？它是偶尔发生，还是已经重复很多次？",
      action:"我们会把问题缩小到安全感、尊重、信任、沟通、价值观和边界，再让你自己做决定。"
    },
    relationship_timing:{
      catch:"如果你问的是“什么时候比较容易出现关系机会”，我可以看时间节奏，但不会把它说成某年一定结婚或一定遇到某个人。",
      connect:"我会结合当前20年阶段、个人流年四组、大环境四组，以及关系相关的联合码看“关系议题什么时候比较被放大”。这代表关注度和机会窗口，不是命定事件。",
      next:"你现在问时间，是因为目前单身想遇到对象，还是已经有对象、想知道关系什么时候会更稳定？",
      action:"先分清“遇见机会”和“关系稳定”是两件事，再去找对应的流年重点。"
    },
    flow_year:{
      catch:"你现在问的是时间节奏，我会直接切到流年，不再用固定性格问题绕一圈。",
      connect:"AURMOVA的流年以10月1日切换。现在系统会用你的目标年份重新排完整三角，再看个人 MNO／MOQ／NOP／PQR 和大环境 KLN／KNV／LNW／VWX，两边一起读。",
      next:"你最想知道这一年哪一块：事业、钱、感情、家庭，还是自己的状态？我会只抓最相关的2–3个重点讲。",
      action:"先定主题，再从8组流年码中挑最相关的重点，不把整张流年一次塞给顾客。"
    },
    health:{
      catch:"这个问题如果牵涉身体或症状，我会先把数字放在辅助理解的位置，不会用号码替你判断有没有疾病。",
      connect:"数字资料最多只能帮助我们讨论压力、作息、情绪和生活习惯的可能模式；真正的症状、诊断和治疗要交给医生或合资格专业人员。",
      next:"你现在说的是已经出现的身体症状，还是只是担心未来会不会有问题？如果已经有症状，持续多久、有没有看过医生？",
      action:"咨询里可以继续看压力与生活模式，但有持续、严重或恶化的症状时，优先做医学评估。"
    },
    family:{
      catch:"你刚才讲的是家庭／亲子场景，我会直接把它挂回家庭关系，而不是继续套一个通用问题。",
      connect:"家庭里要同时看你的主性格、父母基因、孩子／下属区或家庭区，再看彼此真实互动。数字是用来找重复模式，不是用来判谁对谁错。",
      next:"这件事发生时，你最希望对方怎么做？而对方实际做了什么，让你最受不了？",
      action:"先把双方期待说清楚，再看是沟通、边界、控制、责任还是安全感的问题。"
    },
    boundary:{
      catch:"你这句话里面最明显的不是“不会拒绝”，而是你在拒绝之前已经先想到关系会不会变差。",
      connect:"我会把它放回关系边界、情绪表达和主性格一起看。重点不是给你贴“讨好型”的标签，而是找出你每次从不舒服走到答应的那一个转折点。",
      next:"你最怕拒绝以后发生什么？是别人不开心、觉得你不好，还是关系真的会断？",
      action:"练习不是突然变强硬，而是把“感觉到不愿意”到“说出来”之间的距离缩短。"
    },
    career:{
      catch:"你讲的是工作／事业，我会先围绕真实工作场景接，不会硬把话题拉回一个固定性格题。",
      connect:"事业要结合当前阶段、事业／朋友位置、相关联合码、主性格和现实职业。数字告诉我们你习惯怎么做事，经历告诉我们哪种能力已经被你练出来。",
      next:"你现在最卡的是哪一个：方向、收入、客户、上司／团队、能力发挥，还是做很多却没有结果？",
      action:"先找真正的瓶颈，再决定要看职业方向、销售方式、合作模式还是流年节奏。"
    },
    communicate:{
      catch:"我听到的重点是“怎么把话说清楚／怎么让对方听懂”，所以这次先处理沟通，不先讲别的。",
      connect:"沟通要分清楚你是在表达事实、表达感受、提出需求，还是想马上解决问题。不同目的会调用不同的数字优势和卡点。",
      next:"当对方没有理解你时，你通常会继续解释、提高语气，还是干脆不说了？",
      action:"先确认沟通目的，再决定要说事实、感受还是需求；目的越清楚，越不容易越讲越乱。"
    },
    observe:{
      catch:"你不是没有答案，而是会先观察、分析、反复确认。这个过程本身是你的保护方式。",
      connect:"我会把这段放回思考、情绪内收和安全感一起看，判断你是在做必要分析，还是已经进入反复内耗。",
      next:"你现在最缺的到底是更多资料，还是其实资料已经够了，只是还不敢做决定？",
      action:"如果资料已经够，就把下一步缩小到一个低风险动作，不需要等到100%确定才动。"
    },
    action:{
      catch:"你遇到事情时会很快进入处理模式，这既是执行力，也可能让你太早把责任扛过来。",
      connect:"我会看行动、责任、主导与结果相关的数字，再用真实事件确认：你是在有效推进，还是因为焦虑所以急着把事情做掉。",
      next:"这件事真的需要你马上处理，还是你只是不舒服它悬在那里？",
      action:"多加一个停顿：先确认责任归谁、结果要什么，再行动。"
    },
    self:{
      catch:"你现在问的是“我到底是什么样的人／为什么我会这样”。这个问题不能只靠一个主性格号码解释。",
      connect:"我会把主性格、内心码、起始数、内外三角反差、缺失和高密度一起看，再用你的真实经历确认哪些是底色、哪些是后天适应。",
      next:"你最近最常觉得“这不像我”是在什么场景？工作、家庭、感情，还是一个人独处的时候？",
      action:"目标不是找一个标签，而是分清你的本能、习惯和保护机制，知道什么时候可以多一种选择。"
    },
    general:{
      catch:"我先接你原本这句话，不急着把你拉回固定问题。你刚才真正想问的是：“"+quote+"”。",
      connect:"我会先判断这是事业、关系、时间、钱、家庭还是自我模式，再把它挂回你的主性格、当前阶段和对应位置。这样下一句才会跟你的问题在同一条线上。",
      next:"如果只让我先帮你弄清楚一件事，你最想先得到哪一个答案？",
      action:"先把问题缩小，再进盘找证据；不确定时宁可多问一句，也不要系统自己乱猜。"
    }
  };
  const b=common[intent]||common.general;
  let extra="";
  if(intent==="wealth_timing"){
    extra='<div class="question-box"><b>这位顾客目前可见的时间线：</b><br>当前阶段：'+esc(meta.label)+' · 黄金20年结果线：'+esc(golden)+' · 当前 '+yc.year+' 流年：'+esc(String(yc.number))+(yc.title?' · '+esc(yc.title):'')+'</div>';
  }else if(intent==="flow_year"){
    extra='<div class="question-box"><b>当前流年：</b><br>'+yc.year+' · '+esc(String(yc.number))+(yc.title?' · '+esc(yc.title):'')+'</div>';
  }
  return {
    theme:intent,
    html:'<div class="reply-part"><small>AI语义识别</small><p><b>系统理解：</b>'+esc(intent.replaceAll("_","／"))+'｜顾客原话：“'+esc(quote)+'”</p></div>'
      +'<div class="reply-part"><small>① 先接顾客原话</small><p>'+esc(b.catch)+'</p></div>'
      +'<div class="reply-part"><small>② 连接这张盘</small><p>'+esc(b.connect)+'</p><span class="reply-context">'+esc(ctx)+'</span></div>'
      +extra
      +'<div class="reply-part"><small>③ 下一句就问这个</small><div class="question-box">'+esc(b.next)+'</div></div>'
      +'<div class="reply-part"><small>④ Josephine 开解方向</small><p>'+esc(b.action)+'</p></div>'
      +'<div class="formula-note">智能模式会先理解顾客原句，再决定要连接哪一个模块；若顾客意思不清楚，优先追问，不硬套数字。</div>'
  };
}

function consultationConsole(c,a,phase,step=0){
  const saved=loadConsultation(c.id);
  const item=saved[String(step)]||{};
  const mode=item.replyMode||"smart";
  return '<section class="answer-console" id="v7-answer-console" data-step="'+step+'">'
    +'<div class="answer-head"><div><p class="eyebrow">LIVE CONSULTATION</p><h3>顾客回答后 · Josephine 怎么接</h3></div><span>先理解原话 → 再连接蓝图</span></div>'
    +'<div class="formula-note"><b>智能接话模式：</b>不会再只靠几个关键词跳固定模板。系统会先判断顾客到底在问钱、时间、事业、感情、家庭、流年还是自我模式，再选择对应的盘与追问。</div>'
    +'<label class="answer-label">记录顾客刚才的原话<textarea id="v7-customer-answer" placeholder="例如：我什么时候可以发达？／我到底要不要换工作？／为什么我每次都不敢拒绝？">'+esc(item.answer||"")+'</textarea></label>'
    +'<label class="answer-label">回应模式<select id="v7-reply-mode"><option value="smart" '+(mode==="smart"?"selected":"")+'>智能语义模式（推荐）</option><option value="template" '+(mode==="template"?"selected":"")+'>固定模板模式（备用）</option></select></label>'
    +'<div class="answer-actions"><button type="button" class="btn btn-light" id="v7-save-answer">保存回答</button><button type="button" class="btn btn-primary" id="v7-generate-reply">智能生成下一句回应</button></div>'
    +'<div id="v7-reply-output" class="reply-output">'+(item.replyHtml||'<div class="empty-mini">输入顾客真实原话。智能模式会先理解她在问什么，再给你“怎么接、连接哪一层、下一题问什么、怎么开解”。</div>')+'</div>'
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
  const y=calculateGoldenYearSnapshot(c.birthday,activeFlowYear(new Date())).personal;
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

    ["02 内外反差",
      '<h2>先讲一个最值得验证的内外反差</h2>'
      +(pick?'<p>内外反差最明显：<b>数字 '+pick.n+'｜内 '+pick.inner+' · 外 '+pick.outer+' · 差 '+pick.diff+'</b></p>':'')
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
    const names=["人生蓝图","黄金流年","关系蓝图","亲子蓝图","合作蓝图","儿童蓝图"];
    const selectedProjects=(c.consultationTypes?.length?c.consultationTypes:[c.consultationType]).filter(Boolean);
    const first=selectedProjects[0]||"人生蓝图";
    const initialModule=/儿童/.test(first)?"儿童蓝图":/黄金/.test(first)?"黄金流年":/关系/.test(first)?"关系蓝图":/亲子/.test(first)?"亲子蓝图":/合作/.test(first)?"合作蓝图":"人生蓝图";
    [...tabs.querySelectorAll(".module-tab")].forEach((b,i)=>{b.dataset.v6Module=names[i]||"人生蓝图";b.textContent=names[i]||b.textContent;b.classList.toggle("active",(names[i]||"人生蓝图")===initialModule)});
    const panel=document.createElement("section");panel.id="v6-module-panel";panel.className="card module-info-panel";tabs.after(panel);renderModule(initialModule,c);setWorkspaceModuleMode(initialModule);
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
  const audience=event.target.closest("[data-blueprint-audience]"); if(audience){const c=currentCustomer();if(!c)return;localStorage.setItem(blueprintAudienceKey(c.id),audience.dataset.blueprintAudience||"adult");renderModule("人生蓝图",c);return}
    const mod=event.target.closest("[data-v6-module]"); if(mod){document.querySelectorAll("[data-v6-module]").forEach(x=>x.classList.toggle("active",x===mod));renderModule(mod.dataset.v6Module,currentCustomer());setWorkspaceModuleMode(mod.dataset.v6Module);document.querySelector("#v6-module-panel")?.scrollIntoView({behavior:"smooth",block:"start"});return}
  const ph=event.target.closest("[data-v6-phase]"); if(ph){document.querySelectorAll("[data-v6-phase]").forEach(x=>x.classList.toggle("selected",x===ph));const c=currentCustomer(),a=c&&calculateBlueprint(c.birthday);if(a){const box=document.querySelector("#v6-phase-detail");if(box)box.innerHTML=phaseDetails(a,ph.dataset.v6Phase)}return}
  const st=event.target.closest("[data-v6-script-step]"); if(st){const i=st.dataset.v6ScriptStep;document.querySelectorAll("[data-v6-script-step]").forEach(x=>x.classList.toggle("active",x===st));document.querySelectorAll("[data-v6-script-content]").forEach(x=>x.hidden=x.dataset.v6ScriptContent!==i);refreshConsultationConsole(i);return}
  const saveAnswer=event.target.closest("#v7-save-answer"); if(saveAnswer){
    const c=currentCustomer(); if(!c)return;
    const box=document.querySelector("#v7-answer-console"),step=Number(box?.dataset.step||0),answer=document.querySelector("#v7-customer-answer")?.value.trim()||"";
    const mode=document.querySelector("#v7-reply-mode")?.value||"smart";
    const data=loadConsultation(c.id); data[String(step)]={...(data[String(step)]||{}),answer,replyMode:mode}; saveConsultation(c.id,data);
    saveAnswer.textContent="已保存 ✓"; setTimeout(()=>saveAnswer.textContent="保存回答",1200); return
  }
  const generateReply=event.target.closest("#v7-generate-reply"); if(generateReply){
    const c=currentCustomer(); if(!c)return;
    const a=calculateBlueprint(c.birthday),phase=phaseForAge(ageFromBirthday(c.birthday));
    const box=document.querySelector("#v7-answer-console"),step=Number(box?.dataset.step||0),answer=document.querySelector("#v7-customer-answer")?.value.trim()||"";
    if(!answer){document.querySelector("#v7-reply-output").innerHTML='<div class="empty-mini">请先记录顾客的回答。</div>';return}
    const mode=document.querySelector("#v7-reply-mode")?.value||"smart";
    const reply=mode==="smart"?buildSmartJosephineReply(c,a,phase,step,answer):buildJosephineReply(c,a,phase,step,answer),data=loadConsultation(c.id);
    data[String(step)]={answer,replyHtml:reply.html,theme:reply.theme,replyMode:mode,updatedAt:new Date().toISOString()}; saveConsultation(c.id,data);
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
    const target=Number(document.querySelector("#v6-year-target")?.value)||activeFlowYear(new Date());
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
    const target=Number(document.querySelector("#v6-year-target")?.value)||activeFlowYear(new Date());
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
  const quickYear=event.target.closest("[data-v6-flow-year]"); if(quickYear){const c=currentCustomer();if(!c)return;const val=Number(quickYear.dataset.v6FlowYear)||activeFlowYear(new Date());const panel=document.querySelector("#v6-module-panel");if(panel)panel.innerHTML=yearPanel(c,val);return}
  const yr=event.target.closest("#v6-recalc-year"); if(yr){const c=currentCustomer();if(!c)return;const val=Number(document.querySelector("#v6-year-target")?.value)||activeFlowYear(new Date());const panel=document.querySelector("#v6-module-panel");if(panel)panel.innerHTML=yearPanel(c,val);return}
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
