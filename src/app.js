import { CONSULTATION_TYPES, INTERNAL_TERMS, createCustomer, validateCustomer } from "./data.js?v=28";
import { calculateBlueprint, ageFromBirthday, phaseForAge } from "./engine/blueprint.js?v=28";
import { PERSONALITY_LIBRARY, FOCUS_OPTIONS } from "./personality-library.js?v=28";
import { DB as JOINT_DB, CHILD, MAIN, INNER_PREF } from "./aurmova-knowledge.js?v=28";
import { MAIN_DETAIL, DIGIT_CORE, MODULES, getKnowledge } from "./floot-knowledge.js?v=28";
import { ENERGY_LIBRARY } from "./energy-library.js?v=28";
import { CONSTRAINT_NOTES, CHILDHOOD_MODES, INNER_DIGIT_POLARITY } from "./consultation-library.js?v=28";
import { RESTORED_PRIVATE_LIBRARY } from "./private-library.js?v=28";

const icons = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 11 12 3l9 8v9H3z"/><path d="M9 20v-6h6v6"/></svg>',
  add:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
  history:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 5h16v15H4zM8 3v4m8-4v4M4 10h16"/></svg>',
  work:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7h16v13H4zM9 7V4h6v3M4 12h16"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5m4-5v5"/></svg>'
};
const routes = [
  ["home","私人工作台","home"],
  ["new","建立顾客","add"],
  ["history","顾客档案","history"],
  ["workspace","咨询工作台","work"],
  ["library","完整资料库","work"],
  ["whiteboard","咨询白板","work"],
  ["followup","Follow-up中心","history"],
  ["delete","删除档案","trash"]
];
const app = document.querySelector("#app");
const loadCustomers = () => JSON.parse(localStorage.getItem("aurmova.customers") || "[]");
const saveCustomers = data => localStorage.setItem("aurmova.customers", JSON.stringify(data));

function escapeLibraryHtml(value){return String(value??"").replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#39;"}[c]));}

function navMarkup() { return routes.map(([route,label,icon]) => `<a class="nav-link" data-route="${route}" href="#${route}">${icons[icon]}<span>${label}</span></a>`).join(""); }
document.querySelector(".desktop-nav").innerHTML = navMarkup(); document.querySelector(".mobile-nav").innerHTML = navMarkup();

function header(eyebrow,title,subtitle) { return `<header class="topbar"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="subtitle">${subtitle}</p></div><div class="privacy-badge">私人模式 · INTERNAL</div></header>`; }
function projectCards() { return CONSULTATION_TYPES.map((x,i)=>`<article class="card project" data-project="${x}"><span class="project-num">0${i+1}</span><h3>${x}</h3><small>建立專屬諮詢檔案 →</small></article>`).join(""); }

function home() {
  const customers=loadCustomers(); const today=new Date().toDateString(); const recent=customers.filter(c=>new Date(c.createdAt).toDateString()===today).length;
  return `${header("Private Consultancy Desk","早安，Josephine。","在一個安靜、清晰的空間裡，整理今天的每一份藍圖。")}
  <section class="hero"><p class="eyebrow">AURMOVA BLUEPRINT OS · 01</p><h2>讓每一次理解，都從完整地看見一個人開始。</h2><p>你的私人數字心理學工作台。顧客資料與內部分析清楚分區，讓每次諮詢都保有專業、深度與界線。</p><div class="actions"><a class="btn btn-primary" href="#new">＋ 建立顧客檔案</a><a class="btn btn-ghost" href="#history">查看歷史檔案</a></div></section>
  <div class="metric-grid"><div class="metric"><span>全部檔案</span><strong>${customers.length}</strong><small>PRIVATE ARCHIVE</small></div><div class="metric"><span>今日新增</span><strong>${recent}</strong><small>TODAY</small></div><div class="metric"><span>待完成</span><strong>${customers.filter(c=>c.status==='準備中').length}</strong><small>IN PROGRESS</small></div></div>
  <div class="section-head"><div><p class="eyebrow">Consultation Services</p><h2>開始一份新藍圖</h2></div></div><section class="project-grid">${projectCards()}</section>`;
}

function newCustomer(selected="") {
 const years=Array.from({length:100},(_,i)=>new Date().getFullYear()-i).map(y=>`<option>${y}</option>`).join("");
 return `${header("Client Profile","建立顧客檔案","只收集本次諮詢所需資料；生日格式固定為日 / 月 / 年。")}
 <form id="customer-form" class="card form-card"><section class="form-section"><div class="form-section-title"><span class="step">01</span><h2>基本資料</h2></div><div class="fields"><div class="field"><label for="name">姓名 *</label><input id="name" name="name" autocomplete="name" placeholder="輸入顧客姓名" required></div><div class="field"><label for="gender">性別 *</label><select id="gender" name="gender" required><option value="">请选择</option><option>女性</option><option>男性</option></select></div><div class="field" style="grid-column:1/-1"><label>生日 · 日 / 月 / 年 *</label><div class="date-fields"><select name="day" aria-label="日" required><option value="">日</option>${Array.from({length:31},(_,i)=>`<option>${i+1}</option>`).join("")}</select><select name="month" aria-label="月" required><option value="">月</option>${Array.from({length:12},(_,i)=>`<option>${i+1}</option>`).join("")}</select><select name="year" aria-label="年" required><option value="">年</option>${years}</select></div></div>
 <div class="field"><label>出生城市</label><input name="birthCity" placeholder="例如 Johor Bahru"></div>
 <div class="field"><label>职业</label><input name="occupation" placeholder="例如 销售／美容师／家庭主妇"></div>
 <div class="field"><label>WhatsApp 手机号码</label><input name="whatsapp" inputmode="tel" placeholder="+60 1X-XXXX XXXX"></div>
 <div class="field"><label>本次最想聊的主题</label><select name="consultationTheme"><option value="">未指定</option><option>事业／工作</option><option>感情／关系</option><option>家庭／亲子</option><option>金钱／资源</option><option>自我方向</option><option>综合</option></select></div>
 </div><div class="notice">AURMOVA 统一使用阳历生日计算；不需要出生时间。出生城市仅作为顾客档案资料，不参与目前数字公式。</div></section>
 <section class="form-section"><div class="form-section-title"><span class="step">02</span><h2>选择咨询项目 · 可多选</h2></div><div class="radio-grid">${CONSULTATION_TYPES.map((x,i)=>`<label class="radio-card"><input type="checkbox" name="consultationTypes" value="${x}" ${selected===x?'checked':''}><span>0${i+1}　${x}</span></label>`).join("")}</div></section>
 <section class="form-section"><div class="form-section-title"><span class="step">03</span><h2>选择本次咨询重点 · 可多选</h2></div><div class="projects">${FOCUS_OPTIONS.map(x=>`<label class="chip"><input type="checkbox" name="consultationFocus" value="${x}"><span>${x}</span></label>`).join("")}</div><div class="notice">主性格、父母基因、坐镇码、三阶段、81组联合码、缺失数、挑战数、679、原生模式等属于每次咨询的基础解析，不再让你手动勾选。</div></section>
 <div class="notice">建立後，系統只會建立資料骨架，不會執行或推測任何數字心理學計算。完整分析僅保留在 Josephine 私人諮詢區。</div><div class="actions"><button class="btn btn-primary" type="submit">建立私人檔案</button><a class="btn btn-light" href="#home">取消</a></div></form>`;
}

function simpleZodiac(birthday){
 const [d,m]=birthday.split("/").map(Number);
 const signs=[["摩羯座",20],["水瓶座",19],["双鱼座",20],["白羊座",20],["金牛座",21],["双子座",21],["巨蟹座",23],["狮子座",23],["处女座",23],["天秤座",23],["天蝎座",22],["射手座",22],["摩羯座",31]];
 return d<=signs[m-1][1]?signs[m-1][0]:signs[m][0];
}
function libraryEntries(){
  const entries=[];
  (RESTORED_PRIVATE_LIBRARY||[]).forEach(x=>entries.push({category:x.category||"原书拍照资料",title:x.title||"",keywords:(x.keywords||"")+" "+(x.source||""),text:(x.source?("来源："+x.source+"\n"):"")+(x.text||"")}));
  (JOINT_DB||[]).forEach(x=>{const first=String(x.code||"").split("/")[0],k=getKnowledge(first)||{};entries.push({category:"81组联合码",title:x.code||x.title||"",keywords:String(x.code||"")+" "+String(x.title||""),text:[
    k.script&&("Josephine白话："+k.script),
    k.logic&&("核心逻辑："+k.logic),
    k.strengths&&("正面优势："+k.strengths),
    k.challenges&&("常见卡点："+k.challenges),
    k.order&&("顺序差异："+k.order),
    k.growth&&("成长方向："+k.growth),
    k.positions&&("位置资料："+k.positions),
    x.text&&("原始整理：\n"+x.text)
  ].filter(Boolean).join("\n\n")}));});
  for(let n=1;n<=9;n++){
    const d=MAIN_DETAIL[n]||{}, core=DIGIT_CORE[n]||{}, e=ENERGY_LIBRARY[n]||{}, child=CHILD?.[n]||CHILD?.[String(n)]||{}, mode=CHILDHOOD_MODES[n]||{}, polarity=INNER_DIGIT_POLARITY[n]||{};
    entries.push({category:"1–9主性格",title:"主性格 "+n+" · "+(d.title||""),keywords:"主性格"+n+" "+n+"号人 性格",text:[
      MAIN?.[n]||"", "思考："+(d.thinking||""), "行为："+(d.behavior||""), "说话："+(d.speech||""), "压力："+(d.stress||""),
      "情感需求："+(d.emotion||""), "童年模式："+(d.childhood||""), "内驱力："+(d.drive||""), "核心天赋："+(d.talents||""),
      "留意："+(d.watch||""), "Josephine白话："+(d.script||"")
    ].filter(Boolean).join("\n")});
    entries.push({category:"内驱力",title:"内驱力 "+n,keywords:"内驱 内驱力 "+n+"号",text:["核心内驱："+(d.drive||""),"内在偏好："+(INNER_PREF?.[n]||""),"咨询白话："+(d.script||"")].filter(Boolean).join("\n")});
    entries.push({category:"起始数",title:"起始数 "+n,keywords:"起始 起始数 "+n,text:["核心："+(core.core||""),"优势："+(core.gift||""),"卡点："+(core.shadow||""),"适合发挥："+(core.work||"")].filter(Boolean).join("\n")});
    entries.push({category:"缺失数",title:"缺失 "+n,keywords:"缺失"+n+" 缺失数"+n,text:["常见表现："+(e.low||""),"成长／补足方向："+(e.gift||""),"提醒：缺失不等于没有能力，而是这股能量更需要后天练习。"].join("\n")});
    entries.push({category:"挑战数",title:"挑战 "+n,keywords:"挑战"+n+" 挑战数"+n+" 重复"+n,text:["正向潜力："+(e.gift||""),"过强／失衡时："+(e.high||""),"提醒：重复出现要把天赋与过强风险一起看。"].join("\n")});
    entries.push({category:"制约数／原生家庭",title:"制约数 "+n,keywords:"制约"+n+" 制约数"+n+" 原生家庭 "+n,text:[
      CONSTRAINT_NOTES[n]||"", mode.pattern?("小时候发生的模式："+mode.pattern):"", mode.need?("小时候真正需要："+mode.need):"",
      mode.adult?("长大后容易重复："+mode.adult):"", mode.guide?("开解方向："+mode.guide):""
    ].filter(Boolean).join("\n")});
    entries.push({category:"三角形内数字",title:"数字 "+n+" · 正面／负面",keywords:"数字"+n+" 正面 负面 三角形内",text:["正面："+(polarity.positive||""),"负面："+(polarity.negative||"")].filter(Boolean).join("\n")});
    entries.push({category:"儿童天赋",title:n+"号儿童 · "+(child.name||""),keywords:"儿童"+n+" 亲子"+n+" 天赋"+n,text:[
      child.keywords?.length?("关键词："+child.keywords.join("、")):"", child.strength?("天赋／优势："+child.strength):"",
      child.watch?("需要留意："+child.watch):"", child.guide?("教育方向："+child.guide):""
    ].filter(Boolean).join("\n")});
  }

  (MODULES||[]).forEach(x=>entries.push({category:"资料库索引",title:x[0],keywords:x[0],text:x[1]||""}));
  return entries;
}
function renderLibraryResults(query=""){
  const box=document.querySelector("#library-results"); if(!box)return;
  const all=libraryEntries();
  const q=String(query||"").trim().toLowerCase().replace(/\s+/g,"");
  const filtered=q?all.filter(x=>(x.category+" "+x.title+" "+x.keywords+" "+x.text).toLowerCase().replace(/\s+/g,"").includes(q)):all;
  const grouped=new Map();
  filtered.forEach(x=>{if(!grouped.has(x.category))grouped.set(x.category,[]);grouped.get(x.category).push(x);});
  box.innerHTML='<div class="library-result-head"><b>找到 '+filtered.length+' 条资料</b><span>'+(q?"查询："+escapeLibraryHtml(query):"显示全部已恢复资料")+'</span></div>'
    +(filtered.length?[...grouped.entries()].map(([cat,items])=>'<section class="library-group"><h3>'+escapeLibraryHtml(cat)+' <small>'+items.length+'</small></h3>'
      +items.map((x,i)=>'<details class="library-entry" '+(filtered.length<=6&&i===0?'open':'')+'><summary><span>'+escapeLibraryHtml(x.title)+'</span><em>查看完整资料</em></summary><div class="library-entry-body">'+escapeLibraryHtml(x.text).replace(/\n/g,"<br>")+'</div></details>').join("")+'</section>').join("")
      :'<div class="card empty"><h3>没有找到这项资料</h3><p>可以换成号码、关键词或主题，例如 112、缺失4、挑战7、内驱2、679。</p></div>');
}
function initLibrarySearch(){
  const input=document.querySelector("#library-search"); if(!input)return;
  renderLibraryResults(input.value);
  input.addEventListener("input",()=>renderLibraryResults(input.value));
}
function libraryPage(){
  const total=(JOINT_DB||[]).reduce((sum,x)=>sum+String(x.code||"").split("/").filter(Boolean).length,0);
  return `${header("AURMOVA KNOWLEDGE","完整资料库","Josephine 私人查询页｜原始资料、结构化资料与白话咨询版集中查询。")}
  <section class="card form-card">
    <div class="form-section-title"><span class="step">01</span><h2>快速查询全部资料</h2></div>
    <div class="field"><label>输入数字／联合码／主题</label><input id="library-search" autocomplete="off" placeholder="例如：112、缺失4、挑战7、主性格2、内驱8、679"></div>
    <div class="library-stats">
      <div><strong>${total} / 81</strong><span>联合码实际号码</span></div>
      <div><strong>1–9</strong><span>主性格／内驱／天赋</span></div>
      <div><strong>1–9</strong><span>缺失／挑战／制约</span></div>
      <div><strong>679</strong><span>原资料索引保留</span></div>
    </div>
    <div class="notice">这次不是只有输入框：下面会直接显示已经找回并接回系统的资料。没有核对到原始拍照教材的内容会明确标记，不会自己编写。</div>
  </section>
  <div id="library-results"></div>`;
}
function whiteboardPage(){return `${header("CONSULTATION WHITEBOARD","咨询白板","像真正上课白板一样：可擦、可缩放、可拖动、可换颜色。")}
<section class="card wb-card">
  <div class="wb-toolbar" aria-label="白板工具">
    <div class="wb-tool-group">
      <button class="wb-tool active" id="wb-pen" type="button" aria-pressed="true">✎ 画笔</button>
      <button class="wb-tool" id="wb-eraser" type="button" aria-pressed="false">⌫ 橡皮擦</button>
    </div>
    <div class="wb-colors" aria-label="画笔颜色">
      <button class="wb-color active" data-wb-color="#1f1f1f" style="--swatch:#1f1f1f" aria-label="黑色"></button>
      <button class="wb-color" data-wb-color="#b38a45" style="--swatch:#b38a45" aria-label="金色"></button>
      <button class="wb-color" data-wb-color="#c44747" style="--swatch:#c44747" aria-label="红色"></button>
      <button class="wb-color" data-wb-color="#376da8" style="--swatch:#376da8" aria-label="蓝色"></button>
      <button class="wb-color" data-wb-color="#3f8b62" style="--swatch:#3f8b62" aria-label="绿色"></button>
      <button class="wb-color" data-wb-color="#7657a6" style="--swatch:#7657a6" aria-label="紫色"></button>
    </div>
    <label class="wb-width">笔粗细
      <select id="wb-width">
        <option value="3">细</option>
        <option value="7" selected>中</option>
        <option value="14">粗</option>
      </select>
    </label>
    <div class="wb-tool-group wb-history-tools">
      <button class="wb-tool" id="wb-undo" type="button">↶ 撤销</button>
      <button class="wb-tool" id="wb-redo" type="button">↷ 重做</button>
      <button class="wb-tool" id="wb-clear" type="button">清空整页</button>
    </div>
    <div class="wb-tool-group">
      <button class="wb-tool" id="wb-zoom-out" type="button">−</button>
      <span id="wb-zoom-label" class="wb-zoom-label">100%</span>
      <button class="wb-tool" id="wb-zoom-in" type="button">＋</button>
      <button class="wb-tool" id="wb-reset-view" type="button">适合画面</button>
    </div>
  </div>
  <div class="wb-tip">一指／Apple Pencil 写画 · 两指捏合缩放并移动画布 · 往内捏可看到更多空白空间</div>
  <div class="wb-viewport" id="wb-viewport">
    <canvas id="consult-whiteboard" width="3200" height="2200" aria-label="AURMOVA 咨询白板"></canvas>
  </div>
</section>`;}
function followupPage(){const rows=loadCustomers().filter(c=>c.whatsapp).map(c=>`<article class="card" style="margin-bottom:10px"><h3>${c.name}</h3><p>${c.whatsapp} · ${c.occupation||"未填写职业"}</p><p>咨询后可从这里准备个性化关心讯息。自动无人值守发送需连接 WhatsApp Business 正式接口后启用。</p><a class="btn btn-light" href="#workspace?id=${c.id}">打开顾客</a></article>`).join("");return `${header("CLIENT CARE","Follow-up 中心","管理咨询后的顾客关心与后续联系。")}<section>${rows||'<div class="card empty"><h3>暂无可跟进号码</h3><p>建立顾客时填写 WhatsApp 号码后会显示在这里。</p></div>'}</section>`;}
function initWhiteboard(){
  const canvas=document.querySelector("#consult-whiteboard"), viewport=document.querySelector("#wb-viewport");
  if(!canvas||!viewport)return;
  const ctx=canvas.getContext("2d",{alpha:true});
  const W=canvas.width,H=canvas.height;
  const MIN_SCALE=.28,MAX_SCALE=2;
  let scale=1,tool="pen",color="#1f1f1f",width=7,current=null,strokes=[],history=[],redo=[];
  const pointers=new Map();
  let pinch=null;

  ctx.lineCap="round";ctx.lineJoin="round";

  const setScale=(next,clientX,clientY)=>{
    const old=scale;
    next=Math.max(MIN_SCALE,Math.min(MAX_SCALE,next));
    if(Math.abs(next-old)<.001)return;
    const vr=viewport.getBoundingClientRect();
    const cx=(clientX??(vr.left+vr.width/2))-vr.left;
    const cy=(clientY??(vr.top+vr.height/2))-vr.top;
    const worldX=(viewport.scrollLeft+cx)/old;
    const worldY=(viewport.scrollTop+cy)/old;
    scale=next;
    canvas.style.width=(W*scale)+"px";
    canvas.style.height=(H*scale)+"px";
    viewport.scrollLeft=Math.max(0,worldX*scale-cx);
    viewport.scrollTop=Math.max(0,worldY*scale-cy);
    const label=document.querySelector("#wb-zoom-label");if(label)label.textContent=Math.round(scale*100)+"%";
  };

  const fitView=()=>{
    const target=Math.min(1,(viewport.clientWidth-24)/W);
    setScale(Math.max(MIN_SCALE,target),viewport.getBoundingClientRect().left+12,viewport.getBoundingClientRect().top+12);
    viewport.scrollLeft=0;viewport.scrollTop=0;
  };

  const point=e=>{
    const r=canvas.getBoundingClientRect();
    return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};
  };

  const drawStroke=s=>{
    if(!s||!s.points?.length)return;
    ctx.save();
    ctx.globalCompositeOperation=s.tool==="eraser"?"destination-out":"source-over";
    ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.lineCap="round";ctx.lineJoin="round";
    const pts=s.points;
    if(pts.length===1){ctx.beginPath();ctx.arc(pts[0].x,pts[0].y,s.width/2,0,Math.PI*2);s.tool==="eraser"?ctx.clearRect(pts[0].x-s.width/2,pts[0].y-s.width/2,s.width,s.width):ctx.fillStyle=s.color,ctx.fill();}
    else{ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.stroke();}
    ctx.restore();
  };

  const redraw=()=>{ctx.clearRect(0,0,W,H);strokes.forEach(drawStroke);};

  const setTool=next=>{
    tool=next;
    document.querySelector("#wb-pen")?.classList.toggle("active",tool==="pen");
    document.querySelector("#wb-eraser")?.classList.toggle("active",tool==="eraser");
    document.querySelector("#wb-pen")?.setAttribute("aria-pressed",String(tool==="pen"));
    document.querySelector("#wb-eraser")?.setAttribute("aria-pressed",String(tool==="eraser"));
    canvas.classList.toggle("eraser-mode",tool==="eraser");
  };

  canvas.addEventListener("pointerdown",e=>{
    e.preventDefault();
    canvas.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
    if(pointers.size>=2){
      current=null;
      const pts=[...pointers.values()].slice(0,2);
      const dx=pts[1].x-pts[0].x,dy=pts[1].y-pts[0].y;
      pinch={distance:Math.hypot(dx,dy)||1,scale,midX:(pts[0].x+pts[1].x)/2,midY:(pts[0].y+pts[1].y)/2};
      return;
    }
    current={tool,color,width:tool==="eraser"?Math.max(28,width*4):width,points:[point(e)]};
    drawStroke(current);
  });

  canvas.addEventListener("pointermove",e=>{
    if(!pointers.has(e.pointerId))return;
    e.preventDefault();
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,type:e.pointerType});
    if(pointers.size>=2){
      const pts=[...pointers.values()].slice(0,2);
      const dx=pts[1].x-pts[0].x,dy=pts[1].y-pts[0].y,dist=Math.hypot(dx,dy)||1;
      const mx=(pts[0].x+pts[1].x)/2,my=(pts[0].y+pts[1].y)/2;
      if(!pinch)pinch={distance:dist,scale,midX:mx,midY:my};
      setScale(pinch.scale*(dist/pinch.distance),mx,my);
      const ddx=mx-pinch.midX,ddy=my-pinch.midY;
      viewport.scrollLeft=Math.max(0,viewport.scrollLeft-ddx);
      viewport.scrollTop=Math.max(0,viewport.scrollTop-ddy);
      pinch.midX=mx;pinch.midY=my;
      return;
    }
    if(!current)return;
    current.points.push(point(e));
    const p=current.points,s={...current,points:p.slice(-2)};
    drawStroke(s);
  });

  const finish=e=>{
    pointers.delete(e.pointerId);
    if(pointers.size<2)pinch=null;
    if(current&&current.points.length){
      strokes.push(current);history.push({type:"stroke",stroke:current});redo.length=0;current=null;
    }
  };
  canvas.addEventListener("pointerup",finish);
  canvas.addEventListener("pointercancel",finish);
  canvas.addEventListener("contextmenu",e=>e.preventDefault());

  document.querySelector("#wb-pen")?.addEventListener("click",()=>setTool("pen"));
  document.querySelector("#wb-eraser")?.addEventListener("click",()=>setTool("eraser"));
  document.querySelectorAll("[data-wb-color]").forEach(btn=>btn.addEventListener("click",()=>{
    color=btn.dataset.wbColor||color;setTool("pen");
    document.querySelectorAll("[data-wb-color]").forEach(x=>x.classList.toggle("active",x===btn));
  }));
  document.querySelector("#wb-width")?.addEventListener("change",e=>{width=Number(e.target.value)||7;});
  document.querySelector("#wb-undo")?.addEventListener("click",()=>{
    const action=history.pop();if(!action)return;
    if(action.type==="stroke")strokes.pop();
    else if(action.type==="clear")strokes=action.strokes.slice();
    redo.push(action);redraw();
  });
  document.querySelector("#wb-redo")?.addEventListener("click",()=>{
    const action=redo.pop();if(!action)return;
    if(action.type==="stroke")strokes.push(action.stroke);
    else if(action.type==="clear")strokes=[];
    history.push(action);redraw();
  });
  document.querySelector("#wb-clear")?.addEventListener("click",()=>{
    if(!strokes.length)return;
    history.push({type:"clear",strokes:strokes.slice()});redo.length=0;strokes=[];redraw();
  });
  document.querySelector("#wb-zoom-out")?.addEventListener("click",()=>setScale(scale-.15));
  document.querySelector("#wb-zoom-in")?.addEventListener("click",()=>setScale(scale+.15));
  document.querySelector("#wb-reset-view")?.addEventListener("click",fitView);

  canvas.style.width=W+"px";canvas.style.height=H+"px";
  requestAnimationFrame(fitView);
}
function history(){const rows=loadCustomers().map(c=>`<tr><td><strong>${c.name}</strong></td><td>${c.gender}</td><td>${c.birthday}</td><td>${(c.consultationTypes?.length?c.consultationTypes:[c.consultationType]).filter(Boolean).join(" / ")}</td><td>${c.status}</td><td><a href="#workspace?id=${c.id}" style="color:var(--gold)">開啟</a></td></tr>`).join("");return `${header("Private Archive","歷史顧客檔案","所有顧客紀錄都只儲存在此裝置的瀏覽器中。正式上線前需連接安全後端。")}<section class="card table-wrap">${rows?`<table class="customer-table"><thead><tr><th>顧客</th><th>性別</th><th>生日</th><th>諮詢項目</th><th>狀態</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:`<div class="empty"><div class="empty-mark">A</div><h3>還沒有顧客檔案</h3><p>建立第一份檔案，開始整理諮詢資料。</p><a class="btn btn-primary" href="#new">建立顧客檔案</a></div>`}</section>`}
function workspace(){
 const id=new URLSearchParams(location.hash.split('?')[1]).get('id');
 const c=loadCustomers().find(x=>x.id===id);
 const a=c?calculateBlueprint(c.birthday):null;
 const age=c?ageFromBirthday(c.birthday):null;
 const phase=a?phaseForAge(age):null;
 const p=a?.positions;
 const profile=a?PERSONALITY_LIBRARY[a.mainPersonality]:null;
 if(!c) return `${header("Consultation Workspace","AURMOVA 咨询工作台","请先从历史档案开启一位顾客。")}<section class="card empty"><h3>尚未选择顾客</h3><p>从历史档案开启顾客后，完整咨询资料会显示在这里。</p><a class="btn btn-primary" href="#history">前往历史档案</a></section>`;
 const phaseCards=Object.entries(a.phases).map(([name,v])=>`<div class="phase-card ${name===phase?'current':''}"><small>${name}</small><b>因果 ${v.cause.join("")}</b><span>过程 ${v.process1.join("")} · ${v.process2.join("")}</span><span>结果 ${v.result.join("")}</span></div>`).join("");
 const selectedFocus=new Set(c?.consultationFocus||[]);
 const focus=FOCUS_OPTIONS.map(x=>`<label class="focus-chip"><input type="checkbox" ${selectedFocus.has(x)?'checked':''}><span>${x}</span></label>`).join("");
 return `${header("AURMOVA · PRIVATE CONSULTATION","AURMOVA 咨询工作台","透过数字认识自己｜透过美学展现魅力")}
 <section class="client-summary card">
   <div class="client-avatar">${c.name.slice(0,1).toUpperCase()}</div>
   <div class="client-main"><small>本次咨询顾客</small><h2>${c.name}</h2><p>${c.gender} · ${c.birthday} · ${age}岁 · ${simpleZodiac(c.birthday)} · ${c.occupation||"职业未填"} · ${c.whatsapp||"号码未填"} · ${(c.consultationTypes?.length?c.consultationTypes:[c.consultationType]).filter(Boolean).join(" / ")}</p></div>
   <div class="client-number"><small>主性格</small><strong>${a.mainPersonality}</strong><span>${profile?.title.split("｜")[1]||""}</span></div>
   <div class="quick-actions"><a class="btn btn-light" href="#new">＋ 新增顾客</a><a class="btn btn-light" href="#history">历史档案</a></div>
 </section>
 <section class="module-tabs">${CONSULTATION_TYPES.map(x=>`<button class="module-tab ${x===c.consultationType?'active':''}">${x.replace("解析","")}</button>`).join("")}</section>
 <div class="section-head"><div><p class="eyebrow">Josephine Only</p><h2>数字结构 · 仅供后台使用</h2></div><span class="private-pill">PRIVATE</span></div>
 <section class="structure-grid">
  <article class="card gene-card"><small>父亲基因</small><h3>I · J · M</h3><div class="big-code">${p.I}　${p.J}　${p.M}</div><p>I ${p.I} · J ${p.J} · M ${p.M}</p></article>
  <article class="card gene-card"><small>母亲基因</small><h3>K · L · N</h3><div class="big-code">${p.K}　${p.L}　${p.N}</div><p>K ${p.K} · L ${p.L} · N ${p.N}</p></article>
  <article class="card core-card"><small>核心结构</small><div class="core-row"><div><span>主性格 O</span><strong>${a.mainPersonality}</strong></div><div><span>内心码</span><strong>${a.innerCode}</strong></div><div><span>坐镇码</span><strong>${a.seatCode}</strong></div></div><p>当前年龄 ${age}岁 · ${phase} 阶段</p></article>
 </section>
 <section class="card phases"><div class="card-heading"><div><small>20-YEAR ENERGY</small><h2>三阶段能量</h2></div><span>因果 → 过程 → 结果</span></div><div class="phase-grid">${phaseCards}</div></section>
 <div class="section-head"><div><p class="eyebrow">Consultation Focus</p><h2>选择本次咨询重点</h2></div></div>
 <section class="card focus-panel"><div class="focus-grid">${focus}</div><button class="btn btn-primary" id="generate-script">生成本次咨询提词稿</button></section>
 <div class="section-head"><div><p class="eyebrow">Personality Reading</p><h2>${profile.title}</h2></div></div>
 <section class="reading-grid">
   <article class="card reading-card positive"><span class="reading-label">正面优势</span><ul>${profile.positive.map(x=>`<li>${x}</li>`).join("")}</ul></article>
   <article class="card reading-card negative"><span class="reading-label">负面表现</span><ul>${profile.negative.map(x=>`<li>${x}</li>`).join("")}</ul></article>
   <article class="card reading-card growth"><span class="reading-label">成长方向</span><ul>${profile.growth.map(x=>`<li>${x}</li>`).join("")}</ul></article>
 </section>
 <section class="card wealth-card"><div class="card-heading"><div><small>WEALTH PATTERN</small><h2>财富模式</h2></div><span>咨询倾向参考，不作收益保证</span></div><div class="wealth-grid"><div><b>财富天赋</b><p>${profile.wealth.talent}</p></div><div><b>财富卡点</b><p>${profile.wealth.block}</p></div><div><b>财富成长建议</b><p>${profile.wealth.advice}</p></div></div></section>
 <section class="card script-panel" id="script-panel"><div class="script-nav"><b>咨询提词稿</b><span class="active">01 核心主题</span><span>02 数字解析</span><span>03 生活场景</span><span>04 开解方向</span><span>05 提问顾客</span><span>06 总结建议</span></div><div class="script-body"><p class="eyebrow">Josephine Consultation Notes</p><h2>从「${profile.title}」开始理解</h2><p>这组数字不是替顾客决定人生，而是用来整理她较常出现的行为倾向与选择模式。咨询时先从她真实经历验证，再进入建议。</p><h3>可以这样开场</h3><p>「我先从你的主性格 ${a.mainPersonality} 来看。你可能比较容易展现出 ${profile.positive.slice(0,2).join("、")} 的一面；但在压力比较大的时候，也可能出现 ${profile.negative.slice(0,2).join("、")}。你觉得哪一部分最像现在的自己？」</p><h3>可追问顾客</h3><div class="question-box">最近有没有一件事，让你明显感觉自己在“想做自己”和“顾虑别人／现实”之间拉扯？当时你最后怎么决定？</div></div></section>
 <div class="internal-footer">完整计算、父母基因、坐镇码、位置码、联合码与咨询话术仅供 Josephine 后台使用，不自动出现在顾客报告。</div>`;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

function render() {
  const raw = location.hash.slice(1) || "home";
  const route = raw.split("?")[0];
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.route === route);
  });
  if (route === "new") app.innerHTML = newCustomer();
  else if (route === "history" || route === "delete") app.innerHTML = history();
  else if (route === "workspace") app.innerHTML = workspace();
  else if (route === "library") { app.innerHTML = libraryPage(); setTimeout(initLibrarySearch,0); }
  else if (route === "whiteboard") { app.innerHTML = whiteboardPage(); setTimeout(initWhiteboard,0); }
  else if (route === "followup") app.innerHTML = followupPage();
  else app.innerHTML = home();
  app.focus({ preventScroll: true });
}

window.addEventListener("hashchange", render);

document.addEventListener("click", event => {
  const project = event.target.closest("[data-project]");
  if (project) {
    app.innerHTML = newCustomer(project.dataset.project || "");
    history.replaceState(null, "", "#new");
    return;
  }

  const generate = event.target.closest("#generate-script");
  if (generate) {
    const selected = [...document.querySelectorAll(".focus-chip input:checked")]
      .map(input => input.closest(".focus-chip")?.innerText?.trim())
      .filter(Boolean);
    const panel = document.querySelector("#script-panel");
    const body = panel?.querySelector(".script-body");
    if (body) {
      let summary = body.querySelector(".generated-focus-summary");
      if (!summary) {
        summary = document.createElement("div");
        summary.className = "question-box generated-focus-summary";
        body.prepend(summary);
      }
      summary.innerHTML = "<b>本次已选择的咨询重点：</b><br>" +
        (selected.length ? selected.join(" · ") : "尚未选择咨询重点");
    }
    generate.textContent = "已生成本次咨询提词稿 ✓";
    showToast("咨询提词稿已生成");
    panel?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
});

document.addEventListener("submit", event => {
  if (event.target.id !== "customer-form") return;
  event.preventDefault();
  const fd = new FormData(event.target);
  const formData = Object.fromEntries(fd.entries());
  formData.consultationTypes = fd.getAll("consultationTypes");
  formData.consultationFocus = fd.getAll("consultationFocus");
  const error = validateCustomer(formData);
  if (error) {
    showToast(error);
    return;
  }
  const customer = createCustomer(formData);
  const customers = loadCustomers();
  customers.unshift(customer);
  saveCustomers(customers);
  showToast("私人檔案已建立");
  location.hash = "workspace?id=" + encodeURIComponent(customer.id);
});

render();
