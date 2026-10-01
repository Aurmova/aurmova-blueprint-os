import { calculateBlueprint, calculateGoldenYearSnapshot, activeFlowYear, flowYearRange } from "./engine/blueprint.js?v=32";
import { getKnowledge } from "./floot-knowledge.js?v=34";

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function addFlowNotes(){
  const root=document.querySelector(".golden-year-v22");
  if(!root) return;
  const input=document.querySelector("#v6-year-target");
  if(input && !input.dataset.aurmovaBoundaryChecked){
    input.dataset.aurmovaBoundaryChecked="1";
    const now=new Date();
    const active=activeFlowYear(now);
    if(now.getMonth()+1<10 && Number(input.value)===now.getFullYear()){
      input.value=String(active);
      document.querySelector("#v6-recalc-year")?.click();
      return;
    }
  }
  if(!root.querySelector(".aurmova-flow-rule")){
    const control=root.querySelector(".year-control");
    const active=activeFlowYear(new Date());
    const range=flowYearRange(active);
    const box=document.createElement("div");
    box.className="foundation-block aurmova-flow-rule";
    box.innerHTML='<div class="card-heading"><div><small>ORIGINAL YEAR METHOD</small><h3>数字流年计算方法</h3></div><span>原书页13–15</span></div>'
      +'<div class="question-box"><b>Josephine 可以直接这样讲：</b><br>“流年不是另外一套算法，而是把出生年份换成要看的年份，日和月保持不变，再用同一套密码盘重新计算。O位就是这一年的主流年数字。”</div>'
      +'<div class="formula-note"><b>时间分界：</b>数字流年不是1月1日切换，也不是农历春节。按原书规则，每年阳历10月1日开始，到次年9月30日结束。当前数字流年：'+esc(active)+'（'+esc(range.start)+' → '+esc(range.end)+'）。</div>'
      +'<div class="formula-note">原书提醒：不建议把重点放在流月、流日；AURMOVA继续以去年／今年／明年与年度大方向为主。</div>';
    control?.insertAdjacentElement("afterend",box);
  }
  if(!root.querySelector(".aurmova-baseline-rule")){
    const teaching=root.querySelector(".year-teaching-note") || root.querySelector(".aurmova-flow-rule");
    const box=document.createElement("div");
    box.className="foundation-block aurmova-baseline-rule";
    box.innerHTML='<div class="card-heading"><div><small>BASELINE</small><h3>起点海拔／基准点</h3></div><span>不可由数字自动判定</span></div>'
      +'<div class="question-box"><b>Josephine 可以直接这样讲：</b><br>“同样走一个流年，不代表两个人会发生一样的事。流年像这一年的天气，但你平时的心态、抗压、行动习惯和稳定程度，就是自己的起点海拔。起点不同，同一个机会最后能接到多少也会不同。”</div>'
      +'<div class="question-box"><b>验证顾客：</b><br>“你平时遇到突发事情时，是比较稳得住、会处理，还是容易先慌、先抱怨、先乱掉？最近半年有没有一个很明显的例子？”</div>'
      +'<div class="formula-note">基准点不是天生固定，也不是由号码直接算出来。原书强调可以透过阅读、锻炼、积极想法、调整心态与长期习惯提升。</div>';
    teaching?.insertAdjacentElement("afterend",box);
  }
  root.querySelectorAll(".golden-year-sheet").forEach(sheet=>{
    const small=sheet.querySelector(".golden-year-sheet-head small");
    if(!small || small.dataset.rangeDone) return;
    const m=small.textContent.match(/(\d{4})/);
    if(!m) return;
    const y=Number(m[1]), range=flowYearRange(y);
    small.textContent=small.textContent+"｜"+range.start+" → "+range.end;
    small.dataset.rangeDone="1";
  });
}

function correctOuterHeart(){
  document.querySelectorAll(".filled-blueprint").forEach(section=>{
    const meta=section.querySelector(".filled-blueprint-head p")?.textContent||"";
    const m=meta.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    if(!m) return;
    const a=calculateBlueprint(m[1]);
    if(!a) return;
    section.querySelectorAll(".bp-core-grid>div").forEach(card=>{
      if(card.querySelector("span")?.textContent.trim()!=="外心数") return;
      const b=card.querySelector("b"),small=card.querySelector("small");
      if(b) b.textContent=String(a.outerHeartCode);
      if(small) small.textContent=a.outerHeartMeaning||"";
    });
  });
}


const reduceDigit=n=>{let x=Math.abs(Number(n)||0);while(x>9)x=String(x).split("").reduce((a,b)=>a+Number(b),0);return x||9;};

function currentCustomer(){
  const id=new URLSearchParams((location.hash.split("?")[1]||"")).get("id");
  if(!id)return null;
  try{return (JSON.parse(localStorage.getItem("aurmova.customers")||"[]")||[]).find(x=>x.id===id)||null}catch{return null}
}

function yearJointCode(flow,digit){
  return String(flow)+String(digit)+String(reduceDigit(Number(flow)+Number(digit)));
}

function regionReading(label,digit,flow){
  const code=yearJointCode(flow,digit);
  const k=getKnowledge(code)||{};
  const result=reduceDigit(Number(flow)+Number(digit));
  return {
    label,digit,flow,code,result,
    script:k.script||"",
    logic:k.logic||"",
    strength:k.strengths||"",
    challenge:k.challenges||""
  };
}

function advancedFlowHtml(c,year){
  const natal=calculateBlueprint(c.birthday);
  const snap=calculateGoldenYearSnapshot(c.birthday,year);
  if(!natal||!snap)return "";
  const flow=snap.personal.number;
  const p=natal.positions||{};
  const rows=[
    regionReading("父亲基因区｜事业・权威・方向",p.M,flow),
    regionReading("母亲基因区｜家庭・感情・安全感",p.N,flow),
    regionReading("主性格区｜工作・朋友・表达",p.O,flow)
  ];
  const direct=rows.filter(x=>x.digit===flow);
  const density=Number(natal.innerEnergy?.counts?.[flow]||0);
  const missing=(natal.innerEnergy?.missing||[]).includes(flow);
  const indirect=rows.filter(x=>(natal.innerEnergy?.counts?.[x.result]||0)>=2);
  let resonance="轻触";
  if(direct.length) resonance="直接命中";
  else if(indirect.length) resonance="间接共振";
  const densityLabel=density>=4?"极强放大":density===3?"强烈放大":density===2?"温和放大":density===1?"正常触发":"本命七魄未出现";
  const environment=Object.entries(snap.environmentAxis?.groups||{}).map(([k,v])=>k+" "+v.join("")).join(" · ");

  const cards=rows.map(x=>'<article class="joint-block">'
    +'<div class="joint-code-head"><div><small>'+esc(x.label)+'</small><h4>'+esc(x.code)+'</h4></div><span>流年 '+flow+' ＋ 本命 '+x.digit+' → '+x.result+'</span></div>'
    +'<p><b>百位：</b>'+flow+'＝今年触发能量｜<b>十位：</b>'+x.digit+'＝这个区域原本的反应模式｜<b>个位：</b>'+x.result+'＝两股能量相加化简后的走向</p>'
    +(x.script?'<div class="question-box"><b>Josephine 白话：</b><br>“'+esc(x.script)+'”</div>':'')
    +(x.logic?'<p class="panel-note"><b>核心逻辑：</b>'+esc(x.logic)+'</p>':'')
    +'</article>').join("");

  const missingHtml=missing
    ?'<div class="question-box"><b>缺失数叠加｜补课年：</b><br>“你的本命七魄里缺'+flow+'，而今年个人流年刚好也是'+flow+'。这不是坏事，也不是自动的好运，而是你平时比较少用的一项能力，今年被摆到台面上练习。刚开始可能别扭，但配合得越好，这一年越容易把弱项练扎实。”</div>'
    :'<div class="formula-note"><b>缺失数叠加：</b>个人流年'+flow+'不是本命缺失数，今年不属于这个数字的典型“补课年”。</div>';

  let densityText='本命七魄里这个数字没有重复放大。';
  if(density===1)densityText='本命七魄里出现1次，属于正常触发。';
  if(density===2)densityText='本命七魄里出现2次，属于温和放大；今年相关主题会更明显。';
  if(density===3)densityText='本命七魄里出现3次，属于强烈放大；今年要同时看优势和用过头的风险。';
  if(density>=4)densityText='本命七魄里出现'+density+'次，属于极强放大；系统只标为高优先级验证区，不把它直接说成必然人生转折。';

  const resonanceText=direct.length
    ?'个人流年'+flow+'直接命中：'+direct.map(x=>x.label).join('、')+'。这些领域优先问顾客今年发生了什么。'
    :indirect.length
      ?'个人流年没有直接命中M／N／O，但联合码结果碰到本命高频数字：'+indirect.map(x=>x.code+'→'+x.result).join('、')+'，属于间接共振。'
      :'个人流年既没有直接命中M／N／O，三区域联合码结果也没有碰到本命高频数字，当前标记为轻触。';

  return '<div class="foundation-block aurmova-advanced-flow" data-flow-year="'+year+'">'
    +'<div class="card-heading"><div><small>YEAR JOINT CODES</small><h3>'+year+' 流年联合码 · 三区域剧情代码</h3></div><span>'+esc(resonance)+'</span></div>'
    +'<div class="formula-note"><b>算法：</b>百位＝个人流年数；十位＝本命M／N／O区域数字；个位＝前两位相加后继续化简到1–9。例：7＋5＝12→3，所以是753，不是752。</div>'
    +'<div class="formula-note"><b>今年大环境：</b>'+esc(environment)+'。AURMOVA继续以KLN→KNV／LNW→VWX四组一起看，不用一个单独“坐镇核心数”取代整套大环境。</div>'
    +'<div class="joint-stack">'+cards+'</div>'
    +missingHtml
    +'<div class="question-box"><b>高密度触发｜'+esc(densityLabel)+'：</b><br>'+esc(densityText)+'</div>'
    +'<div class="question-box"><b>共振判断：</b><br>'+esc(resonanceText)+'</div>'
    +'<div class="question-box"><b>Josephine 收束顺序：</b><br>“先看今年O位的核心主题，再看大环境四组；接着看缺失数有没有被补课、高密度有没有被放大；再讲三区域联合码和直接命中；最后回到你今年真实发生的事情，确认哪一个领域最明显。”</div>'
    +'</div>';
}

function addAdvancedFlowReading(){
  const c=currentCustomer();
  const root=document.querySelector(".golden-year-v22");
  if(!c||!root)return;
  root.querySelectorAll(".golden-year-sheet").forEach(sheet=>{
    const small=sheet.querySelector(".golden-year-sheet-head small");
    const m=(small?.textContent||"").match(/(\d{4})/);
    if(!m)return;
    const year=Number(m[1]);
    if(sheet.querySelector('.aurmova-advanced-flow[data-flow-year="'+year+'"]'))return;
    const wrap=document.createElement("div");
    wrap.innerHTML=advancedFlowHtml(c,year);
    if(wrap.firstElementChild)sheet.appendChild(wrap.firstElementChild);
  });
}

function enhance(){
  addFlowNotes();
  correctOuterHeart();
  addAdvancedFlowReading();
}

document.addEventListener("click",()=>setTimeout(enhance,120),true);
window.addEventListener("hashchange",()=>setTimeout(enhance,150));
setTimeout(enhance,250);
