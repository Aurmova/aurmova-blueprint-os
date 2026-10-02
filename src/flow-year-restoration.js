import { calculateBlueprint, calculateGoldenYearSnapshot, activeFlowYear, flowYearRange } from "./engine/blueprint.js?v=48";
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
    if(Number(input.value)===now.getFullYear() && active!==now.getFullYear()){
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
      +'<div class="formula-note"><b>时间分界：</b>数字流年不是1月1日切换，也不是农历春节。按AURMOVA流年命名规则，2027流年代表2026年10月1日至2027年9月30日。当前数字流年：'+esc(active)+'（'+esc(range.start)+' → '+esc(range.end)+'）。</div>'
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

function flowConsultationLanguage(c,year,natal,snap,rows,{missing,density,direct,indirect}){
  const flow=snap.personal.number;
  const s=FLOW_CONSULT_SCRIPTS[flow]||FLOW_CONSULT_SCRIPTS[7];
  const prev=calculateGoldenYearSnapshot(c.birthday,year-1);
  const directFocus=direct.length?direct.map(x=>x.label.split("｜")[0]).join("、"):"";
  const resonance=direct.length?"直接命中":indirect.length?"间接共振":"轻触";
  const contrast='去年比较像「'+(prev?.personal?.title||"上一阶段")+'」，今年走到「'+(snap.personal.title||"新的主题")+'」。如果你觉得自己的节奏、重点甚至做决定的方式变了，这个变化在流年盘里是看得到的。';
  const opener='“我先丢一个观察给你，你听听看像不像。'+s.feel+'”';
  const map='“今天我不会一次把所有数字丢给你。我主要帮你看三件事：第一，今年最核心的主题；第二，事业、感情和个人状态哪一块最明显；第三，今年最容易重复的旧模式是什么，以及你可以怎么换一种做法。”';
  const see=s.see.map(q=>'“'+q+'”').join("<br><br>");
  const special='今年的判断不再靠“直接命中／间接共振”分级。先看 O 位年度主题，再顺着自身4组的因果→过程→结果，最后把大环境4组叠上去；一场咨询只挑2–3个最贴近顾客现实的问题深入。';

  const close='“今天如果只带走一句话，我会想留给你这句：'+s.close+'”';
  const action='“如果今年只做一个练习：'+s.action+'”';
  const openEnd='“这是我从你今年的盘和你刚刚讲的经历里看到的方向，但你对自己最了解。回去以后如果有新的感受或变化，随时告诉我，我们再继续往下看。”';

  return '<div class="foundation-block aurmova-language-kit">'
    +'<div class="card-heading"><div><small>JOSEPHINE TALK TRACK</small><h3>这一年怎么开口讲 · 可直接照读</h3></div><span>最终8组结构</span></div>'
    +'<div class="question-box"><b>① 最推荐｜感受型开场</b><br>'+opener+'</div>'
    +'<div class="question-box"><b>② 备用｜变化型开场</b><br>“'+esc(s.change)+' 我先不急着说这是好还是不好，我们先看这些变化到底在把你带去哪里。”</div>'
    +'<div class="question-box"><b>③ 备用｜去年 vs 今年</b><br>“'+esc(contrast)+'”</div>'
    +'<div class="question-box"><b>④ 开场后的地图</b><br>'+map+'</div>'
    +'<div class="formula-note"><b>今年特别需要留意：</b>'+esc(special)+'</div>'
    +'<div class="question-box"><b>⑤ 让顾客看见自己｜一次只问1题</b><br>'+see+'</div>'
    +'<div class="question-box"><b>⑥ 一句话收尾</b><br>'+close+'</div>'
    +'<div class="question-box"><b>⑦ 一个行动收尾</b><br>'+action+'</div>'
    +'<div class="question-box"><b>⑧ 开放结尾</b><br>'+openEnd+'</div>'
    +'<div class="formula-note">Josephine使用原则：先说一个观察 → 停下来等顾客回应 → 请顾客讲最近真实例子 → 再把故事挂回数字位置。不要一次把所有模式讲完，一场咨询让顾客真正看见2–3个模式就够。</div>'
    +'</div>';
}

function codeTalk(code,label){
  const k=getKnowledge(code)||{};
  return '<article class="joint-block">'
    +'<div class="joint-code-head"><div><small>'+esc(label)+'</small><h4>'+esc(code)+'</h4></div></div>'
    +(k.script?'<div class="question-box"><b>Josephine 白话：</b><br>“'+esc(k.script)+'”</div>':'')
    +(k.logic?'<p><b>核心逻辑：</b>'+esc(k.logic)+'</p>':'')
    +(k.strengths?'<p><b>正面／优势：</b>'+esc(k.strengths)+'</p>':'')
    +(k.challenges?'<p><b>负面／卡点：</b>'+esc(k.challenges)+'</p>':'')
    +'</article>';
}

function advancedFlowHtml(c,year){
  const snap=calculateGoldenYearSnapshot(c.birthday,year);
  if(!snap)return "";
  return '<div class="foundation-block aurmova-advanced-flow" data-flow-year="'+year+'">'
    +'<div class="card-heading"><div><small>JOSEPHINE YEAR TALK TRACK</small><h3>'+year+' 黄金流年 · 白话咨询提词</h3></div><span>基于最终8组结构</span></div>'
    +'<div class="formula-note"><b>结构锁定：</b>白话提词只建立在 O位年度主题＋自身 MNO／MOQ／NOP／PQR＋大环境 KLN／KNV／LNW／VWX 上。不会再调用旧版“直接命中区域、三边流年联合码、单一大环境数字”。</div>'
    +flowConsultationLanguage(c,year,null,snap,[],{missing:false,density:0,direct:[],indirect:[]})
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
