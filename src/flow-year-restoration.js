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


const FLOW_CONSULT_SCRIPTS={
  1:{feel:"你会不会觉得，今年开始有一些事情让你越来越想自己做决定？不是别人一定不好，而是你会更明显感觉到：有些路要自己选、自己开始。",change:"今年比较像一个重新开局的年份。有些事情可能不是马上看到结果，而是先把方向定下来、把第一步走出去。",see:["你有没有发现，今年别人给你的意见很多，但最后你还是比较想按自己的判断走？","你是不是有些事情其实已经想很久，只差真正开始？"],close:"今年不用等到完全准备好，先开始，边走边修正。",action:"今年最重要的一件事：选一个真正想推进的方向，做出第一个可以完成的动作。"},
  2:{feel:"你会不会觉得，今年很多事情都跟“人”有关？合作、关系、别人怎么回应你，好像比以前更容易影响你的节奏。",change:"今年不一定是冲得最快的一年，更像是在磨合关系、累积信任、把细节做稳。",see:["你有没有发现，今年你比以前更在意别人有没有理解你、配不配合你？","你是不是有时候很想维持关系，所以自己的真实想法会晚一点才说？"],close:"今年不是越快越好，关系走得稳，事情才走得远。",action:"今年最重要的一件事：合作之前先把自己的底线和需要说清楚。"},
  3:{feel:"你会不会觉得，今年想说的话、想做的事、想尝试的东西明显变多了？整个人比较容易被外界带动，也更想让别人看见你。",change:"今年的能量比较像往外展开，表达、社交、创意和行动会比以前更活跃。",see:["你有没有发现，一有灵感你会很快想开始，但后面要持续时反而比较考验你？","你是不是在状态好的时候特别有感染力，但情绪一来节奏也会被带走？"],close:"今年不是缺机会，重点是把热度变成完成。",action:"今年最重要的一件事：少开几个头，多完成几个结果。"},
  4:{feel:"你会不会觉得，今年很多事情都在要求你“稳下来”？以前可以边走边改的东西，今年好像更需要步骤、规则和长期安排。",change:"今年比较像打地基，不一定最热闹，但会逼你把生活、工作或钱的基础整理好。",see:["你有没有发现，今年越想快一点，反而越容易卡在细节和现实条件？","你是不是开始更在意稳定、规划、流程或长期安全感？"],close:"今年的快，不是冲得快，是基础稳了以后不用一直重来。",action:"今年最重要的一件事：把最重要的一件事做成可以重复的系统。"},
  5:{feel:"你会不会觉得，今年很多事情开始变得不太按原本计划走？不是每个变化都是你主动选的，但你会明显感觉到旧方法越来越不够用了。",change:"今年比较像调整、移动、突破和重新选择，重点不是变得越多越好，而是看哪些变化真的把你带到更适合的位置。",see:["你有没有发现，一旦事情太重复、太没有空间，你就会很想换？","你是不是很容易先被新鲜感吸引，真正难的是判断这个变化值不值得？"],close:"今年可以变，但不要乱变；真正的自由，是知道自己为什么要变。",action:"今年最重要的一件事：每个大变化前先问自己——我是在逃离，还是在走向更适合的方向？"},
  6:{feel:"你会不会觉得，今年很多事情都跟“责任”有关？家人、关系、工作承诺，好像更容易让你进入“我来处理”的状态。",change:"今年比较像把关系和成果接住的一年，很多事情会要求你负责、兑现、照顾品质。",see:["你有没有发现，别人一需要你，你很容易先把自己放后面？","你是不是常常做到最后才发现，自己其实已经累很久了？"],close:"今年最大的功课不是更会照顾别人，而是学会照顾别人时也不丢掉自己。",action:"今年最重要的一件事：每次答应之前先确认——这真的是我的责任吗？"},
  7:{feel:"你有没有觉得今年有一种感觉——外面很多事情在发生，但你内心其实更想安静下来？不是不想社交，而是有些场合开始让你觉得很耗。",change:"今年比较像往内整理的一年。很多答案不会靠更忙找到，而是靠停下来、学习、复盘和筛选。",see:["你有没有发现，今年你越来越不想把时间给没有意义的人和事？","你是不是会想很多，但真正需要练习的是把想明白的东西落成一个小行动？"],close:"今年不要怕慢，慢就是今年的快。",action:"今年最重要的一件事：给自己固定的安静时间，把想法整理成一个可以执行的下一步。"},
  8:{feel:"你会不会觉得，今年很多事情开始直接碰到结果、钱、责任或位置？以前可以先放着的问题，今年好像更难避开。",change:"今年比较像把能力推到现实成果的一年，资源、权责和成绩会更明显地摆到台面上。",see:["你有没有发现，今年你会更在意结果，也更容易因为结果不够快而给自己压力？","你是不是越重要的事情越想掌控，但真正需要的是把规则和资源分清楚？"],close:"今年不是证明你有多拼，而是证明你能不能把成果接得稳。",action:"今年最重要的一件事：重大决定先看风险、边界和长期成本，再看眼前收益。"},
  9:{feel:"你会不会觉得，今年有些人、事情或目标开始让你产生一种“差不多该整理了”的感觉？不是一定要失去，而是你会越来越清楚什么不想再带进下一阶段。",change:"今年比较像收尾和腾空间的一年，很多重点不在继续抓更多，而在把旧的事情完成、整理、放下。",see:["你有没有发现，有些东西你明知道已经不适合，却还是会因为舍不得而拖着？","你是不是今年更容易回头看过去，重新理解一些以前放不下的事？"],close:"今年不是抓得越多越好，该完成的完成，该放的放，新的空间才会出来。",action:"今年最重要的一件事：列出一件你知道该结束、整理或完成，却一直拖着的事，把它真正收好。"}
};

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
  let special="";
  if(missing) special='你的流年数刚好也是本命缺失数，所以今年除了主主题，还要留意“补课感”——不熟悉、不自然，但很能练出新能力。';
  else if(density>=3) special='这个数字本来就在你的本命七魄里很强，今年又被流年命中，所以不是学一个新东西，而是把原本的主旋律放大；优势和用过头的风险都要一起看。';
  else if(direct.length) special='今年有直接命中本命区域，优先从'+directFocus+'问真实事件，因为这个位置更容易成为今年体感明显的主场。';
  else if(indirect.length) special='今年没有直接命中M／N／O，但联合码结果碰到本命高频数字，属于间接共振；体感通常没有直接命中那么直白，要靠具体事件验证。';
  else special='今年目前属于轻触，没有必要硬讲成“大事件年”，更适合看哪些主题慢慢浮上来。';

  const close='“今天如果只带走一句话，我会想留给你这句：'+s.close+'”';
  const action='“如果今年只做一个练习：'+s.action+'”';
  const openEnd='“这是我从你今年的盘和你刚刚讲的经历里看到的方向，但你对自己最了解。回去以后如果有新的感受或变化，随时告诉我，我们再继续往下看。”';

  return '<div class="foundation-block aurmova-language-kit">'
    +'<div class="card-heading"><div><small>JOSEPHINE TALK TRACK</small><h3>这一年怎么开口讲 · 可直接照读</h3></div><span>'+esc(resonance)+'</span></div>'
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
    +flowConsultationLanguage(c,year,natal,snap,rows,{missing,density,direct,indirect})
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
