import { calculateBlueprint, ageFromBirthday, phaseForAge, calculateYearCycleSet, calculateEnvironmentYear, compareYearClimate, calculateYearJointCode, yearSourceAxes, YEAR_THEMES, PHASE_META } from "./engine/blueprint.js?v=20261001-v15";
import { ENERGY_LIBRARY, describeEnergySet } from "./energy-library.js?v=20260930-v6";
import { PERSONALITY_LIBRARY } from "./personality-library.js?v=20260930-v6";
import { findJointCode } from "./aurmova-knowledge.js?v=20260930-v6";
import { getKnowledge as getFlootKnowledge, MAIN_DETAIL, DIGIT_CORE, TALK_QUESTIONS } from "./floot-knowledge.js?v=20260930-v7";
import { getTrianglePattern, getDensityReading, getInnerOuterAlignment } from "./triangle-pattern-library.js?v=20261001-v17";

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
    {key:"career",code:(a.jointCodes6?.SWX||[]).join("")},
    {key:"team",code:(a.jointCodes6?.RQP||[]).join("")},
    {key:"family",code:(a.jointCodes6?.TVU||[]).join("")}
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

function yearPanel(c,target){
  const year=Number(target)||new Date().getFullYear();
  const set=calculateYearCycleSet(c.birthday,year);
  const personal=set.current;
  const environment=calculateEnvironmentYear(year);
  const climate=compareYearClimate(personal.number,environment.number);
  const a=calculateBlueprint(c.birthday);

  const cards=[["去年",set.previous],["今年",set.current],["明年",set.next]].map(([label,y])=>
    '<article class="year-card '+(label==="今年"?"current-year":"")+'"><small>'+label+'</small><h3>'+y.year+' · 流年 '+y.number+'</h3><b>'+esc(y.title)+'</b><p>'+esc(y.summary)+'</p><div class="year-mini-tags"><span>'+esc(y.cycle)+'</span><span>'+esc(y.rhythm)+'</span></div></article>'
  ).join("");

  return '<div class="module-render year-v12">'
    +'<div class="card-heading"><div><small>GOLDEN YEAR</small><h2>黄金流年 · 时间定位器</h2></div><span>9年循环 · 先看节奏，再看落位</span></div>'
    +'<p class="panel-note">流年的重点不是“今年好不好”，而是你现在站在9年循环的哪个位置：这一年更适合开始、积累、扎根、突破、收获、反思，还是收尾。</p>'
    +'<div class="year-control"><label>分析年份 <input type="number" id="v6-year-target" min="1900" max="2200" value="'+year+'"></label><button type="button" class="btn btn-light" id="v6-recalc-year">重新计算</button></div>'
    +'<div class="formula-note">个人流年 = 出生月份 + 出生日期 + 目标年份 → 逐位相加 → 化简至1–9。大环境流年 = 1 + 2 + 目标年份各位数字 → 化简至1–9。</div>'
    +'<div class="year-headline-grid"><div class="year-headline"><small>个人流年 · 第一优先</small><strong>'+personal.number+'</strong><b>'+esc(personal.title)+'</b><p>'+esc(personal.role)+'</p></div><div class="year-headline"><small>大环境流年</small><strong>'+environment.number+'</strong><b>'+esc(environment.title)+'</b><p>'+esc(environment.role)+'</p></div><div class="year-headline climate"><small>两者叠加</small><strong>'+esc(climate.type)+'</strong><p>'+esc(climate.description)+'</p></div></div>'
    +yearNineCycle(personal.number)
    +yearSourcePanel(a,personal,environment)
    +'<div class="year-focus-card"><div><small>今年节奏</small><b>'+esc(personal.rhythm)+'</b><p>'+esc(personal.advice)+'</p></div><div><small>今年最容易踩的坑</small><b>'+esc(personal.pit)+'</b><p>流年不是命运预言，而是提醒你今年最容易在哪种模式里失衡。</p></div></div>'
    +'<div class="year-cycle-grid">'+cards+'</div>'
    +yearPriorityTable()
    +yearLocationPanel(a,personal)
    +yearDensityResonance(a,personal)
    +missingActivationPanel(a,personal)
    +yearJointPanel()
    +yearFinalSummary(a,personal,environment,climate)
    +'</div>';
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
  const profile=PERSONALITY_LIBRARY[a.mainPersonality],mainDetail=MAIN_DETAIL[a.mainPersonality],meta=PHASE_META[phase],groups=groupList(a.phases[phase]);
  const y=calculateYearCycleSet(c.birthday,new Date().getFullYear()).current;
  const triangleHighlights=[1,2,3,4,5,6,7,8,9].map(n=>{
    const innerCount=Number(a.innerEnergy?.counts?.[n]||0),outerCount=Number(a.outerEnergy?.counts?.[n]||0);
    return {n,innerCount,outerCount,result:getTrianglePattern(n,innerCount,outerCount)};
  }).filter(x=>x.result&&(x.innerCount===0||x.outerCount===0||x.innerCount>=2));
  const items=[
    ["01 核心主题",'<h2>先从顾客现在真正想解决的事情开始</h2><p>主性格 '+a.mainPersonality+' · '+esc(profile.title)+'。当前处于 '+phase+'：'+esc(meta.theme)+'。</p><div class="question-box">今天我不会一开始就告诉你“你是什么样的人”。我想先听你现在最想看懂的一件事，再把数字与真实经历一层层对上。</div>'],
    ["02 数字解析",'<h2>数字结构不是单看一个号码</h2><p>父亲基因 '+code(Object.values(a.fatherGenes))+' · 母亲基因 '+code(Object.values(a.motherGenes))+' · 坐镇码 '+a.seatCode+' · 内心码 '+a.innerCode+' · 潜意识码 '+a.subconsciousCode+'。</p><p>当前阶段四组：'+groups.join(" → ")+'。</p>'+(mainDetail?'<div class="question-box"><b>主性格 '+a.mainPersonality+'：</b> '+esc(mainDetail.thinking)+' '+esc(mainDetail.behavior)+'<br><b>压力时：</b>'+esc(mainDetail.stress)+'<br><b>天赋：</b>'+esc(mainDetail.talents)+'</div>':"")],
    ["03 生活场景",'<h2>'+phase+' · '+esc(meta.theme)+'</h2><p>'+esc(meta.description)+'</p><div class="question-box">最近在这个领域有没有一件事情反复发生？你当时通常先顾自己、顾关系、顾结果，还是先观察再决定？</div>'],
    ["04 开解方向",'<h2>从三角形内外数字表现找调整方向</h2><p>这里不再用“内三角能量／外三角能量／内外综合能量”的读法，而是按照三角形内外有没有这个数字，以及三角形内出现次数来判断。</p><div class="question-box">'+(triangleHighlights.length?triangleHighlights.slice(0,6).map(x=>x.n+'号｜'+esc(x.result.state)+'：'+esc(x.result.description)).join("<br>"):"这张盘内外结构没有明显缺失或高重复，继续结合位置与联合码看。")+'</div>'],
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
  const el=event.target.closest("[data-v6-partner-birthday]");if(!el)return;const c=currentCustomer();if(c)renderModule("合作蓝图",c);
});
