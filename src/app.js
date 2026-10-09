import { CONSULTATION_TYPES, INTERNAL_TERMS, createCustomer, validateCustomer } from "./data.js?v=35";
import { calculateBlueprint, calculateHighPeakProfile, calculateChallengeProfile, calculateExpressionProfile, calculateInnerDriveProfile, calculateTemperamentProfile, ageFromBirthday, phaseForAge } from "./engine/blueprint.js?v=54";
import { PERSONALITY_LIBRARY, FOCUS_OPTIONS } from "./personality-library.js?v=32";
import { DB as JOINT_DB, CHILD, MAIN, INNER_PREF } from "./aurmova-knowledge.js?v=32";
import { MAIN_DETAIL, DIGIT_CORE, MODULES, getKnowledge } from "./floot-knowledge.js?v=32";
import { ENERGY_LIBRARY } from "./energy-library.js?v=32";
import { EXPRESSION_NUMBER_LIBRARY, INNER_DRIVE_NUMBER_LIBRARY, TEMPERAMENT_NUMBER_LIBRARY, CHALLENGE_NUMBER_LIBRARY, HIGH_PEAK_LIBRARY, SPECIAL_NUMBER_LIBRARY, BIRTHDAY_DAY_PROFILES, CONSTRAINT_NOTES, CHILDHOOD_MODES, INNER_DIGIT_POLARITY } from "./consultation-library.js?v=41";
import { RESTORED_PRIVATE_LIBRARY } from "./private-library.js?v=65";
import { CYCLE_ENVIRONMENT_LIBRARY } from "./cycle-environment.js?v=1";
import { MATURITY_NUMBER_LIBRARY, BLACK_HOLE_NUMBER_LIBRARY } from "./hole-maturity-library.js?v=1";
import { FIVE_ELEMENT_LIBRARY } from "./five-elements.js?v=2";
import { WUXING_ELEMENT_ANALYSIS, WUXING_DIGIT_ANALYSIS, WUXING_POSITION_ROLES } from "./five-elements-analysis.js?v=4";
import { buildWuxingCourseEntries } from "./wuxing-course-supplement.js?v=2";
import { buildWuxingHealthLibraryEntries } from "./wuxing-health-course.js?v=2";
import { buildStudentCompositeEntries } from "./student-composite-course.js?v=1";

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
  ["firstconsult","首次咨询模式","work"],
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
 const isChildBlueprint=selected==="儿童蓝图解析";
 const childAutoAgeNotice=isChildBlueprint?`<div class="notice"><b>儿童蓝图会自动按生日过滤年龄内容：</b>3–5岁／6–9岁／10–12岁／13–17岁。建立档案后会直接进入对应年龄阶段，不需要手动选择。</div>`:"";
 const years=Array.from({length:100},(_,i)=>new Date().getFullYear()-i).map(y=>`<option>${y}</option>`).join("");
 return `${header("Client Profile","建立顧客檔案","只收集本次諮詢所需資料；生日格式固定為日 / 月 / 年。")}
 <form id="customer-form" class="card form-card"><section class="form-section"><div class="form-section-title"><span class="step">01</span><h2>基本資料</h2></div><div class="fields"><div class="field"><label for="name">姓名 *</label><input id="name" name="name" autocomplete="name" placeholder="輸入顧客姓名" required></div><div class="field"><label for="gender">性別 *</label><select id="gender" name="gender" required><option value="">请选择</option><option>女性</option><option>男性</option></select></div><div class="field" style="grid-column:1/-1"><label>生日 · 日 / 月 / 年 *</label><div class="date-fields"><select name="day" aria-label="日" required><option value="">日</option>${Array.from({length:31},(_,i)=>`<option>${i+1}</option>`).join("")}</select><select name="month" aria-label="月" required><option value="">月</option>${Array.from({length:12},(_,i)=>`<option>${i+1}</option>`).join("")}</select><select name="year" aria-label="年" required><option value="">年</option>${years}</select></div></div>
 <div class="field"><label>出生城市</label><input name="birthCity" placeholder="例如 Johor Bahru"></div><div class="field"><label>身份证／出生登记正式姓名（中文或英文均可）</label><input name="officialName" autocomplete="name" placeholder="例如 张杰文 或 JOSEPHINE TAN"><small>用于表现数字、内驱数字与性情数字：华文会自动转成拼音；英文／拼音直接计算。留空时会直接使用上面的顾客姓名。</small></div><div class="field"><label>曾用／最初正式姓名（如有）</label><input name="formerName" placeholder="华文或英文都可以；曾正式改名才填写"></div><div class="field"><label>正式改名年份（如有）</label><input name="nameChangedYear" inputmode="numeric" pattern="\d{4}" placeholder="例如 2024"><small>原书规则：改名未满5年会优先参考旧正式姓名；网页会同时保留新旧结果。</small></div>
 <div class="field"><label>职业／学校年级</label><input name="occupation" placeholder="成人可填职业；儿童可填学校／年级"></div>
 <div class="field"><label>WhatsApp 手机号码</label><input name="whatsapp" inputmode="tel" placeholder="+60 1X-XXXX XXXX"></div>
 <div class="field"><label>本次最想聊的主题</label><select name="consultationTheme"><option value="">未指定</option><option>事业／工作</option><option>感情／关系</option><option>家庭／亲子</option><option>金钱／资源</option><option>自我方向</option><option>综合</option></select></div>
 <div class="field" style="grid-column:1/-1"><label>顾客这次最想问的问题</label><textarea name="customerQuestion" rows="3" placeholder="例如：我现在是家庭主妇，但我想有自己的事业，不知道要从哪里开始。"></textarea><small>系统会把问题与职业／身份、现实阶段和蓝图资料结合，生成关键词、追问与多条可选出路。</small></div>
 </div><div class="notice">AURMOVA 统一使用阳历生日计算；不需要出生时间。出生城市仅作为顾客档案资料。表现数字、内驱数字与性情数字共用同一份姓名：华文自动转拼音，英文／拼音直接计算；转换结果会显示出来供你核对。</div>${childAutoAgeNotice}</section>
 <section class="form-section"><div class="form-section-title"><span class="step">02</span><h2>选择咨询项目 · 可多选</h2></div><div class="radio-grid">${CONSULTATION_TYPES.map((x,i)=>`<label class="radio-card"><input type="checkbox" name="consultationTypes" value="${x}" ${selected===x?'checked':''}><span>0${i+1}　${x}</span></label>`).join("")}</div></section>
 <section class="form-section"><div class="form-section-title"><span class="step">03</span><h2>选择本次咨询重点 · 可多选</h2></div><div class="projects">${FOCUS_OPTIONS.map(x=>`<label class="chip"><input type="checkbox" name="consultationFocus" value="${x}"><span>${x}</span></label>`).join("")}</div><div class="notice">主性格、父母基因、坐镇码、三阶段、81组联合码、表现数字、内驱数字、性情数字、缺失数、阶段挑战数字、七魄重复能量、679、原生模式等属于每次咨询的基础解析，不再让你手动勾选。</div></section>
 <div class="notice">建立後，系統只會建立資料骨架，不會執行或推測任何數字心理學計算。完整分析僅保留在 Josephine 私人諮詢區。</div><div class="actions"><button class="btn btn-primary" type="submit">建立私人檔案</button><a class="btn btn-light" href="#home">取消</a></div></form>`;
}

function exactBirthdayDay(birthday){
    const raw=String(birthday||"").trim();
    if(!raw)return 0;
    let m=raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if(m){
      const d=Number(m[1]);
      return d>=1&&d<=31?d:0;
    }
    m=raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if(m){
      const d=Number(m[3]);
      return d>=1&&d<=31?d:0;
    }
    return 0;
  }
function birthdayDayInfo(birthday){
    const day=exactBirthdayDay(birthday);
    const profile=BIRTHDAY_DAY_PROFILES?.[day]||null;
    return {day,profile};
  }
function simpleZodiac(birthday){
 const [d,m]=birthday.split("/").map(Number);
 const signs=[["摩羯座",20],["水瓶座",19],["双鱼座",20],["白羊座",20],["金牛座",21],["双子座",21],["巨蟹座",23],["狮子座",23],["处女座",23],["天秤座",23],["天蝎座",22],["射手座",22],["摩羯座",31]];
 return d<=signs[m-1][1]?signs[m-1][0]:signs[m][0];
}
function libraryEntries(){
  const entries=[];
  // 五行归档独立入口：原始健康对照资料继续保留在原位，不推广为疾病诊断。
  entries.push({category:"五行资料",title:"流年五行｜M N O P Q R 六位统计",keywords:"五行 流年五行 M N O P Q R 金 木 水 火 土 数字五行 黄金流年 重复数字 健康关怀",
    text:["课程出处："+FIVE_ELEMENT_LIBRARY.meta.source,
      "对应公式："+FIVE_ELEMENT_LIBRARY.meta.formula,
      "计数范围："+FIVE_ELEMENT_LIBRARY.meta.scope,
      "重复数字规则："+FIVE_ELEMENT_LIBRARY.meta.repeatRule,
      "健康提醒边界："+FIVE_ELEMENT_LIBRARY.meta.healthBoundary].join("\n")});
  for(const el of FIVE_ELEMENT_LIBRARY.elements){
    entries.push({category:"五行资料",title:"数字五行｜"+el.label+"（"+el.digits.join("、")+"）",
      keywords:"五行 "+el.label+" 元素 "+el.digits.join(" "),
      text:["【教材数字对应】"+el.label+"："+el.digits.join("、"),
        "【流年解读】只查看当年 M、N、O、P、Q、R 六个位置；同一号码重复才标记重复数字；同五行不同数字只合计出现次数。",
        "【使用限制】五行频率不代表生病或事故风险，实际健康问题必须以症状和医生评估为准。",
        "【咨询白话】这项对应是课程的五行数字归类，需要结合实际情况观察，不代表人格或身体诊断。"].join("\n")});
  }
  // 根据原书五行映射＋年度六位置，单独保存可查询的咨询深度模块。
  for(const item of FIVE_ELEMENT_LIBRARY.elements){
    const g=WUXING_ELEMENT_ANALYSIS[item.key];
    entries.push({category:"五行资料",title:"黄金流年五行深度｜"+item.label+"（"+item.digits.join("、")+"）",
      keywords:"流年五行 五行分析 健康关怀 "+item.label+" "+item.digits.join(" "),
      text:["【传统课程身体对照】"+g.tradition,
        "【成人可能讨论的主题】"+g.adult,"【成人追问】"+g.askAdult,"【成人引导】"+g.actionAdult,
        "【儿童场景】"+g.child,"【亲子提问】"+g.askChild,"【儿童引导】"+g.actionChild,
        "【判断前提】必须先在指定流年的 M/N/O/P/Q/R 中确认数字出现次数。五行累计和同号重复是不同条件。",
        "【专业边界】数字分布不能预测疾病，也不替代任何医学评估。"].join("\n")});
  }
  for(let n=1;n<=9;n++){
    const g=WUXING_DIGIT_ANALYSIS[n];
    entries.push({category:"五行资料",title:"黄金流年同号"+n+"｜位置分析与咨询提问",
      keywords:"黄金流年 数字重复 同号"+n+" 重复"+n+" M N O P Q R",
      text:["【课程主题】"+g.title,"【成人行为观察】"+g.adult,"【儿童行为观察】"+g.child,
        "【可能过度】"+g.watch,"【成人追问】"+g.questionAdult,"【亲子追问】"+g.questionChild,
        "【使用前提】只有同一个号码在M/N/O/P/Q/R六位出现至少两次才启用此卡片。不代表生病概率提高。"].join("\n")});
  }
  entries.push({category:"五行资料",title:"流年六位定位｜MNO因果／PQR结果",
    keywords:"M N O P Q R 位置 概念 因果 过程 结果 六个位 年盘 流年五行",
    text:Object.entries(WUXING_POSITION_ROLES).map(([key,meaning])=>key+"："+meaning).join("\n")
      +"\n同一号码跨MNO与PQR出现可以作为课堂追问线索，但不能断言事件发生。"});
  // Additional original course summaries (not scans or literal book copies) with five-vs-six position audit.
  entries.push(...buildWuxingCourseEntries());
  // Traditional body/health associations remain attributed course notes, not individual medical conclusions.
  entries.push(...buildWuxingHealthLibraryEntries());
  // Public-safe student course notes: no customer records, instructor keys, or raw book pages.
  entries.push(...buildStudentCompositeEntries());
  (RESTORED_PRIVATE_LIBRARY||[]).forEach(x=>entries.push({category:x.category||"课程整理资料",title:x.title||"",keywords:(x.keywords||""),text:(x.text||"")}));
  const maturityLib=MATURITY_NUMBER_LIBRARY||{};
  const holeLib=BLACK_HOLE_NUMBER_LIBRARY||{};
  entries.push({category:"黑洞数字",title:"黑洞数字｜六类位置与判定限制",keywords:"黑洞数字 黑洞 黑洞数 缺席数字 成熟数字",
    text:["教材定义："+(holeLib.meta?.definition||""),"六类位置："+(holeLib.meta?.sixPositions||[]).join("、"),
      "核对规则："+(holeLib.meta?.checkRule||""),"最多三项限制："+(holeLib.meta?.threshold||""),
      "空椅子比喻："+(holeLib.meta?.analogy||""),"计算安全边界："+(holeLib.meta?.boundary||"")].join("\n")});
  entries.push({category:"成熟数字",title:"成熟数字｜计算与36岁后观察",keywords:"成熟数字 成熟数 36岁 生命数 表现数",
    text:["本章计算："+(maturityLib.meta?.formula||""),"36岁规则："+(maturityLib.meta?.ageRule||""),
      "避免混算："+(maturityLib.meta?.distinction||""),"解释边界："+(maturityLib.meta?.safety||"")].join("\n")});
  for(let n=1;n<=9;n++){
    const d=maturityLib.numbers?.[n]||{};
    entries.push({category:"成熟数字",title:"成熟数字 "+n+" · "+(d.title||""),keywords:"成熟数字"+n+" 成熟数"+n+" 第十四章",
      text:["主题："+(d.core||""),"正向优势："+(d.positive||""),"可能卡点："+(d.watch||""),
        "Josephine白话："+(d.talk||""),"追问："+(d.question||""),"行动："+(d.action||""),
        "教材年龄说明："+(maturityLib.meta?.ageRule||""),"资料来源："+(maturityLib.meta?.source||"")].filter(Boolean).join("\n")});
  }
  const cycleLib=CYCLE_ENVIRONMENT_LIBRARY||{};
  entries.push({category:"循环数字解读",title:"循环数字｜月·日·年计算与对应阶段",keywords:"第一循环 第二循环 第三循环 环境 家庭 高峰 挑战 1–9",
    text:[cycleLib.meta?.definition,cycleLib.meta?.formula,cycleLib.meta?.timeline,cycleLib.meta?.boundaries].filter(Boolean).join("\n")});
  for(let n=1;n<=9;n++){
    const c=cycleLib.numbers?.[n]||{};
    entries.push({category:"循环数字解读",title:"循环数字 "+n+" · "+(c.title||""),keywords:"循环数字"+n+" 第一循环"+n+" 第二循环"+n+" 第三循环"+n+" 环境数字"+n+" 家庭亲子",
      text:["环境主题："+(c.environment||""),"正向支持："+(c.positive||""),"潜在限制："+(c.watch||""),
        "第一循环家庭视角："+(c.first||""),"Josephine白话："+(c.talk||""),
        "亲子追问："+(c.parentQuestion||""),"成人追问："+(c.adultQuestion||""),
        "教材来源："+(cycleLib.meta?.source||""),"重要边界："+(cycleLib.meta?.boundaries||"")].filter(Boolean).join("\n")});
  }
  (JOINT_DB||[]).forEach(x=>{const first=String(x.code||"").split("/")[0],k=getKnowledge(first)||{};entries.push({category:"81组联合码",title:x.code||x.title||"",keywords:String(x.code||"")+" "+String(x.title||""),text:[
    k.script&&("Josephine白话："+k.script),
    k.logic&&("核心逻辑："+k.logic),
    k.strengths&&("正面优势："+k.strengths),
    k.challenges&&("常见卡点："+k.challenges),
    k.order&&("顺序差异："+k.order),
    k.growth&&("成长方向："+k.growth),
    k.positions&&("位置资料："+k.positions),
    x.text&&("原始整理：\n"+x.text)
  ].filter(Boolean).join("\n\n")});});
  for(let n=1;n<=9;n++){
    const d=MAIN_DETAIL[n]||{}, core=DIGIT_CORE[n]||{}, e=ENERGY_LIBRARY[n]||{}, child=CHILD?.[n]||CHILD?.[String(n)]||{}, mode=CHILDHOOD_MODES[n]||{}, polarity=INNER_DIGIT_POLARITY[n]||{};
    entries.push({category:"1–9主性格",title:"主性格 "+n+" · "+(d.title||""),keywords:"主性格"+n+" "+n+"号人 性格",text:[
      MAIN?.[n]||"", "思考："+(d.thinking||""), "行为："+(d.behavior||""), "说话："+(d.speech||""), "压力："+(d.stress||""),
      "情感需求："+(d.emotion||""), "童年模式："+(d.childhood||""), "内驱力："+(d.drive||""), "核心天赋："+(d.talents||""),
      "留意："+(d.watch||""), "Josephine白话："+(d.script||"")
    ].filter(Boolean).join("\n")});
    entries.push({category:"主性格动力",title:"主性格动力 "+n,keywords:"主性格动力 原内驱力 "+n+"号",text:["核心动力："+(d.drive||""),"内在偏好："+(INNER_PREF?.[n]||""),"咨询白话："+(d.script||""),"提醒：这里来自主性格资料，不是姓名元音计算的“内驱数字”。"].filter(Boolean).join("\n")});
    entries.push({category:"起始数",title:"起始数 "+n,keywords:"起始 起始数 "+n,text:["Josephine白话：你碰到新环境或新事情时，第一反应比较容易先走「"+(core.core||"")+"」这条路。状态好的时候会表现成"+(core.gift||"")+"；压力大时要留意"+(core.shadow||"")+"。","核心："+(core.core||""),"优势："+(core.gift||""),"卡点："+(core.shadow||""),"适合发挥："+(core.work||"")].filter(Boolean).join("\n")});
    entries.push({category:"缺失数",title:"缺失 "+n,keywords:"缺失"+n+" 缺失数"+n,text:["Josephine白话：这个数字没有明显出现在你的基础盘，不代表你没有这项能力，而是平时比较不会自动用出来，通常要遇到事情后才会刻意练习。","常见表现："+(e.low||""),"成长／补足方向："+(e.gift||""),"提醒：缺失不等于没有能力，而是这股能量更需要后天练习。"].join("\n")});
    entries.push({category:"七魄重复能量",title:"重复能量 "+n,keywords:"七魄重复 重复能量 "+n+" 旧挑战判定",text:["Josephine白话：这股能量在你的盘里重复出现，所以你通常会比别人更容易用它；用得好是天赋，用过头就会变成压力或卡点。","正向潜力："+(e.gift||""),"过强／失衡时："+(e.high||""),"提醒：重复出现要把天赋与过强风险一起看。"].join("\n")});
    entries.push({category:"制约数／原生家庭",title:"制约数 "+n,keywords:"制约"+n+" 制约数"+n+" 原生家庭 "+n,text:[
      "Josephine白话："+(mode.adult?("这个数字更像是在看：小时候的一些经历，后来怎样变成你现在很自动的反应。你长大后比较容易重复的是："+mode.adult):"这个数字要结合原生家庭经历去验证，不单靠数字下结论。"), CONSTRAINT_NOTES[n]||"", mode.pattern?("小时候发生的模式："+mode.pattern):"", mode.need?("小时候真正需要："+mode.need):"",
      mode.adult?("长大后容易重复："+mode.adult):"", mode.guide?("开解方向："+mode.guide):""
    ].filter(Boolean).join("\n")});
    entries.push({category:"三角形内数字",title:"数字 "+n+" · 正面／负面",keywords:"数字"+n+" 正面 负面 三角形内",text:["Josephine白话：这个数字状态好的时候，会比较容易表现出「"+(polarity.positive||"")+"」；压力大或用过头时，则可能走到「"+(polarity.negative||"")+"」。","正面："+(polarity.positive||""),"负面："+(polarity.negative||"")].filter(Boolean).join("\n")});
    entries.push({category:"儿童天赋",title:n+"号儿童 · "+(child.name||""),keywords:"儿童"+n+" 亲子"+n+" 天赋"+n,text:[
      "Josephine白话："+(child.strength?("这个孩子不是只看成「"+n+"号」，更重要的是在生活里你可能会看到："+child.strength+"。教育时要顺着优势去带，同时留意下面的失衡表现。"):"儿童解读要结合真实生活场景验证。"), child.keywords?.length?("关键词："+child.keywords.join("、")):"", child.strength?("天赋／优势："+child.strength):"",
      child.watch?("需要留意："+child.watch):"", child.guide?("教育方向："+child.guide):""
    ].filter(Boolean).join("\n")});
  }





  const expressionLib=EXPRESSION_NUMBER_LIBRARY||{};
  for(let n=1;n<=9;n++){
    const d=expressionLib[n]||{};
    entries.push({category:"表现数字",title:"表现数字 "+n+" · "+(d.title||""),keywords:"表现数字 事业密码 使命数字 expression destiny 姓名 "+n,text:[
      "核心："+(d.core||""),"优势："+(d.strengths||""),"比较自然的任务："+(d.workTasks||""),"工作环境："+(d.workEnvironment||""),"用过头／盲点："+(d.watch||""),
      "儿童观察："+(d.child||""),"家长引导："+(d.parentGuide||""),"Josephine白话："+(d.talk||""),"验证问题："+(d.question||""),
      "顾客说有："+(d.yes||""),"顾客说没有："+(d.no||""),"顾客不确定："+(d.unsure||""),"3–7天行动："+(d.action||""),
      "算法："+(expressionLib.meta?.formula||""),"改名规则："+(expressionLib.meta?.namingRule||""),"多语言规则："+(expressionLib.meta?.multilingual||""),"边界："+(expressionLib.meta?.safety||"")
    ].filter(Boolean).join("\n")});
  }


  const innerDriveLib=INNER_DRIVE_NUMBER_LIBRARY||{};
  for(let n=1;n<=9;n++){
    const d=innerDriveLib[n]||{};
    entries.push({category:"内驱数字",title:"内驱数字 "+n+" · "+(d.title||""),keywords:"内驱数字 姓名元音 soul urge heart desire motivation "+n,text:[
      "容易欣赏／被吸引："+(d.attraction||""),
      "内在向往："+(d.innerWish||""),
      "成熟表现："+(d.mature||""),
      "容易误判："+(d.shadow||""),
      "Josephine白话："+(d.talk||""),
      "验证问题："+(d.question||""),
      "顾客说像："+(d.yes||""),
      "顾客说不像："+(d.no||""),
      "顾客不确定："+(d.unsure||""),
      "3–7天行动："+(d.action||""),
      "儿童观察："+(d.childFocus||""),
      "算法："+(innerDriveLib.meta?.formula||""),
      "Y/W规则："+(innerDriveLib.meta?.yRule||""),
      "复合数："+(innerDriveLib.meta?.compoundRule||""),
      "区分："+(innerDriveLib.meta?.distinction||""),
      "边界："+(innerDriveLib.meta?.safety||"")
    ].filter(Boolean).join("\n")});
  }


  const tempLib=TEMPERAMENT_NUMBER_LIBRARY||{};
  for(const [plane,label] of [["mind","头脑"],["body","身体"],["emotion","情绪"],["intuition","直觉"]]){
    for(let n=1;n<=9;n++){
      const d=tempLib?.[plane]?.[n]||{};
      entries.push({category:"姓名性情数字",title:label+"数字 "+n+" · "+(d.title||""),keywords:"性情数字 四体 "+label+"数字 "+n+" 姓名出现次数 temperament 头脑 身体 情绪 直觉",text:[
        "核心："+(d.core||""),"成熟："+(d.mature||""),"卡住："+(d.watch||""),
        "Josephine白话："+(d.talk||""),"验证问题："+(d.question||""),
        "像："+(d.yes||""),"不像："+(d.no||""),"不确定："+(d.unsure||""),
        "3–7天行动："+(d.action||""),"不可乱讲："+(d.risk||""),
        "算法："+(tempLib.meta?.formula||""),"0与10+："+(tempLib.meta?.rangeRule||""),
        "读取顺序："+(tempLib.meta?.consultOrder||""),"姓名长度比较："+(tempLib.meta?.comparisonRule||""),
        "儿童规则："+(tempLib.meta?.childRule||""),"区分："+(tempLib.meta?.distinction||""),"安全边界："+(tempLib.meta?.safety||"")
      ].filter(Boolean).join("\n")});
    }
  }

  const challengeLib=CHALLENGE_NUMBER_LIBRARY||{};
  [0,1,2,3,4,5,6,7,8].forEach(n=>{
    const d=challengeLib[n]||{};
    entries.push({
      category:"阶段挑战数字",
      title:n===0?"特殊挑战值0":("挑战数字 "+n+" · "+(d.title||"")),
      keywords:"阶段挑战 挑战数字 挑战数 challenge "+n,
      text:[
        "核心："+(d.core||""),
        "成熟能力："+(d.positive||""),
        "卡点／失衡："+(d.overuse||""),
        "现实场景："+(d.scenes||""),
        d.bookNote&&("原书安全转换："+d.bookNote),
        "Josephine白话："+(d.talk||""),
        "验证问题："+(d.question||""),
        "顾客说有："+(d.yes||""),
        "顾客说没有："+(d.no||""),
        "顾客不确定："+(d.unsure||""),
        "3–7天行动："+(d.action||""),
        "儿童观察："+(d.childFocus||""),
        "问父母："+(d.parentQuestion||""),
        "问孩子："+(d.childQuestion||""),
        "算法："+(challengeLib.meta?.formula||""),
        "阶段："+(challengeLib.meta?.positionRule||""),
        "0处理："+(challengeLib.meta?.zeroRule||""),
        "边界："+(challengeLib.meta?.safety||"")
      ].filter(Boolean).join("\n")
    });
  });

  const peakLib=HIGH_PEAK_LIBRARY||{};
  for(let n=1;n<=9;n++){
    const d=peakLib[n]||{};
    entries.push({
      category:"高峰数字",
      title:"高峰数字 "+n+" · "+(d.title||""),
      keywords:"高峰 高峰数字 四阶段 潜能 pinnacle "+n,
      text:[
        "核心："+(d.core||""),
        "第一高峰："+(d.first||""),
        "第二高峰："+(d.second||""),
        "第三高峰："+(d.third||""),
        "第四高峰："+(d.fourth||""),
        "验证："+(d.question||""),
        "成长："+(d.growth||""),
        "算法："+(peakLib.meta?.formula||""),
        "年龄："+(peakLib.meta?.ageFormula||""),
        "边界："+(peakLib.meta?.challengeBoundary||"")
      ].filter(Boolean).join("\n")
    });
  }

  const special= SPECIAL_NUMBER_LIBRARY||{};
  Object.entries(special.master||{}).forEach(([code,d])=>entries.push({
    category:"特别数字／卓越数",
    title:"卓越数字 "+code+" · "+(d.label||""),
    keywords:"卓越数 卓越数字 大师数 大器晚成 "+code,
    text:[
      "核心："+(d.core||""),
      "失衡："+(d.shadow||""),
      "成长："+(d.growth||""),
      "AURMOVA核心算法："+(special.policy?.coreMasterRule||""),
      "原书扩展："+(special.policy?.bookExtension||""),
      "成熟提示："+(special.policy?.maturity||""),
      "位置说明："+(special.policy?.positions||"")
    ].filter(Boolean).join("\n")
  }));
  Object.entries(special.karmic||{}).forEach(([code,d])=>entries.push({
    category:"特别数字／业力数",
    title:(d.title||("业力数字 "+code)),
    keywords:"业力数字 纠结数字 业力数 "+code,
    text:[
      "核心冲突："+(d.core||""),
      "常见表现："+(d.signs||""),
      "重点领域："+(d.areas||""),
      "顺序差异："+(d.whyOrder||""),
      "成长方向："+(d.growth||""),
      "边界："+(special.safety||"")
    ].filter(Boolean).join("\n")
  }));

  const moduleOverviews=[
    {title:"姓名性情数字｜四体分布",keywords:"性情数字 姓名性情 头脑数字 身体数字 情绪数字 直觉数字 1 8 4 5 2 3 6 7 9 四体",text:"【固定算法】先把姓名全部字母按A–Z数字表转换，再统计出现次数：头脑＝1与8；身体＝4与5；情绪＝2、3、6；直觉＝7与9。这里是‘计数’，不是把数字再相加，也不做个位化简。四组次数总和必须等于姓名字母总数。\n\n【0与10+】0次只表示当前姓名没有字母落入该组，不叫缺陷，也没有‘0号性情’；10次以上保留原始次数，不化简，因为课程只提供1–9逐项解读。\n\n【怎么看】同一姓名同时看绝对次数与百分比，避免长姓名因为字母多看起来每组都高。分布较高不是比较好，较低也不是比较差。\n\n【姓名变化】现名与曾用名可并列对照，但只表示字母结构变化，不解释成改名改变命运或人格。\n\n【与其他模块区分】表现数字＝全部字母数值相加；内驱数字＝A/E/I/O/U元音相加；性情数字＝全部字母按四组计数；出生盘的主性格、内心码与潜意识另算。\n\n【咨询边界】只作为提问与自我观察框架。不能根据数字诊断焦虑、抑郁、失眠、头痛、肠胃或其他疾病，也不预测婚姻、健康、财运或灵异能力。顾客说不像时不硬套，优先真实行为与专业评估。"},
    {title:"黄金20年阶段",keywords:"黄金20年 阶段 URX U R X 966 933 339 669 693 396 363 636 999 少年得志 先苦后甜 中年致富 天降大任 21-40 41-60 61岁以后 IJM IMS JMT STU MNO MOQ NOP PQR KLN KNV LNW VWX",text:"【阶段结构】21–40岁：IJM＝因果，IMS／JMT＝过程，STU＝结果；41–60岁：MNO＝因果，MOQ／NOP＝过程，PQR＝结果；61岁以后：KLN＝因果，KNV／LNW＝过程，VWX＝结果。\n\n【黄金20年趋势码】同一张固定盘取三个阶段的结果位，按人生时间顺序排成 U→R→X：U＝21–40结果、R＝41–60结果、X＝61岁以后结果。例如U=6、R=9、X=3，就得到693。\n\n【课程四类重点】966／933＝少年得志；339／669＝先苦后甜；693／396／363＝中年致富；636／999＝天降大任。名称保留为课程标签，但顾客端不讲成命定发财、命定成名或命定受苦。\n\n【咨询用法】先看顾客当前年龄所在阶段，再按“因果 → 两个过程 → 结果”往下解；黄金20年趋势码只做三阶段重心的总览，不替代完整阶段分析。\n\n【白话】“我会先看你现在走到哪一个20年阶段，再把三个阶段的结果位排成一条线。它不是告诉你哪一段一定发财，而是看哪一个阶段比较容易把前面的累积放大，以及那个阶段更适合用什么策略。”"},
    {title:"黄金流年蓝图解析",keywords:"黄金流年 流年 大环境 个人流年 10月1日 9月30日 MNO MOQ NOP PQR KLN KNV LNW VWX",text:"【时间边界】AURMOVA流年固定以每年10月1日开始，到次年9月30日结束。\n\n【个人流年】保留顾客生日的日＋月，把年份替换成目标年份，重新计算同一张固定三角形。O看当年主题；个人四组重点：MNO＝因果／核心，MOQ＝过程1，NOP＝过程2，PQR＝结果。\n\n【大环境】不使用“年份数字相加成一个数字”取代结构。大环境固定看：KLN＝因果，KNV＝过程1，LNW＝过程2，VWX＝结果。\n\n【咨询顺序】先讲个人主题，再讲个人四码怎样展开，再看大环境四码，最后比较两边是顺势、拉扯还是需要调整节奏。\n\n【白话】“同一年大家面对的是同一个大环境，但每个人怎么感受到、怎么回应，会被自己的个人流年结构影响。所以我不会只拿一个数字告诉你今年好不好，而是会把你的四个个人过程和四个外部环境一起看。”"},
    {title:"财富密码",keywords:"财富 钱 金钱 资源 6 财富密码 守财 花钱 投资 责任 预算",text:"【AURMOVA读取原则】财富不是看一个数字就断“有钱／没钱”。要同时看与资源、责任、价值交换、行动和机会有关的联合码，再看它落在哪个位置、有没有重复或缺失，并用顾客真实的赚钱、花钱、储蓄、承担与合作习惯做验证。\n\n【咨询重点】赚钱能力、守财习惯、责任型支出、人情支出、资源配置、合作边界、风险承受与长期安全感。\n\n【白话】“我这里不会用一个号码就告诉你一定发财。数字给我看的是：你面对钱和资源时最自然的习惯是什么——你是容易赚但留不住、太谨慎不敢动，还是常常因为责任和人情多承担。真正有用的是找到你最容易漏财或失衡的那个行为点。”\n\n【边界】投资相关内容只作为行为与风险管理提醒，不根据数字直接建议买卖任何投资。"},
    {title:"关系模式",keywords:"关系 人际 情绪 2 7 3 8 理性 感性 内外三角 边界 亲密 沟通",text:"【关系读取】关系模式不是单看“合不合”。会综合情绪数字2／7／3／8、理性与感性比例、内外三角是否一致、联合码所在位置，以及顾客现实中的沟通／付出／拒绝／边界模式。\n\n【情绪】2／7偏内收；3／8偏外放。四个都有时重点看切换：忍着 → 累积 → 爆发 → 再缩回去。\n\n【咨询白话】“我不会替你判断这段关系该不该继续。我会先帮你看：你在关系里最容易用哪一种方式保护自己、什么时候会委屈、什么时候会爆发、以及你为什么明明知道不舒服却还是很难说出口。”\n\n【成长方向】把“感觉到 → 忍着／爆发”缩短成“感觉到 → 识别 → 表达”。"},
    {title:"九宫格",keywords:"九宫格 主线 辅线 缺失 重复 话术",text:"【系统用途】九宫格用于把盘里的主线、辅线、缺失与重复能量放在同一个视角里观察，帮助Josephine快速看到哪些数字持续出现、哪些位置较弱，再生成相应咨询问题。\n\n【咨询原则】九宫格不是单独拿来给顾客下结论，而是作为交叉验证工具：若主性格、联合码、缺失／挑战和九宫格都指向同一主题，该主题才优先深挖。\n\n【白话】“这个区块我主要拿来做交叉验证。不是看到一条线就说你一定怎样，而是看它有没有和你前面的主性格、关系模式或现实经历重复出现。如果重复，我们才把它当成这次咨询的重点。”"},
    {title:"儿童1–9",keywords:"儿童 1号儿童 2号儿童 3号儿童 4号儿童 5号儿童 6号儿童 7号儿童 8号儿童 9号儿童 亲子 天赋",text:"【读取原则】儿童资料按1–9号主数字快速抓关键词，但不能只念标签。一定要落到学校、家庭、玩耍、学习、社交、物质要求、兴趣活动等真实场景。\n\n【咨询顺序】先讲孩子看得见的表现 → 再讲优势／天赋 → 再讲容易失衡的地方 → 最后给家长沟通与培养方向。\n\n【白话】“我不会只告诉你孩子是几号人。更重要的是，这个数字放到生活里会怎么出现：他在学校怎么反应、被催的时候怎么反应、跟兄弟姐妹怎么互动、真正喜欢什么。这样家长才知道应该怎么带，而不是给孩子贴标签。”"},
    {title:"儿童天赋速查",keywords:"儿童天赋速查 儿童天赋 亲子 教育方向",text:"【用途】这是Josephine咨询时的快速调用页，用来先抓1–9号儿童的核心优势、常见失衡与教育方向，再回到孩子的完整盘和真实生活场景深化。\n\n【不是替代品】速查只负责帮你快速定位，不替代亲子蓝图的完整分析。\n\n【白话】“我先用孩子的主数字抓一个最明显的天赋方向，再结合他实际在家里、学校和社交里的表现确认。孩子不是一个号码，所以如果现实表现跟数字不一样，我们会以真实行为为准，再看是不是环境把另一部分压住了。”"},
    {title:"亲子案例",keywords:"亲子案例 家庭系统 规则 边界 引导 孩子",text:"【案例结构】现实问题 → 家庭系统 → 父母互动／规则 → 孩子的数字模式 → 可执行的沟通调整。\n\n【咨询重点】先问发生了什么，不急着把问题归因给孩子；再看父母的回应方式是否不断强化同一个循环。\n\n【白话】“我不会先问‘这个孩子为什么这么难带’，我会先看整个家庭在这个场景里发生了什么：谁先说什么、孩子怎么反应、父母接着怎么处理。很多时候真正需要调整的不是孩子的性格，而是大家每天重复的互动方式。”\n\n【原则】亲子咨询不把孩子贴成‘问题孩子’，也不以数字取代发展、教育或医疗专业判断。"}
  ];
  moduleOverviews.forEach(x=>entries.push({category:"重点模块完整说明",title:x.title,keywords:x.keywords,text:x.text}));
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
      :'<div class="card empty"><h3>没有找到这项资料</h3><p>可以换成号码、关键词或主题，例如 112、缺失4、挑战7、内驱2、头脑4、身体5、679。</p></div>');
}
function initLibrarySearch(){
  const input=document.querySelector("#library-search"); if(!input)return;
  renderLibraryResults(input.value);
  input.addEventListener("input",()=>renderLibraryResults(input.value));
  document.querySelectorAll("[data-library-query]").forEach(btn=>btn.addEventListener("click",()=>{
    const q=btn.getAttribute("data-library-query")||"";
    input.value=q;
    renderLibraryResults(q);
    document.querySelector("#library-results")?.scrollIntoView({behavior:"smooth",block:"start"});
  }));
}
function libraryPage(){
  const total=(JOINT_DB||[]).reduce((sum,x)=>sum+String(x.code||"").split("/").filter(Boolean).length,0);
  return `${header("AURMOVA KNOWLEDGE","完整资料库","Josephine 私人查询页｜结构化资料、规则与白话咨询版集中查询。")}
  <section class="card form-card">
    <div class="form-section-title"><span class="step">01</span><h2>快速查询全部资料</h2></div>
    <div class="field"><label>输入数字／联合码／主题</label><input id="library-search" autocomplete="off" placeholder="例如：112、表现数字8、内驱数字4、头脑数字3、身体数字2、挑战7"></div>
    <div class="library-stats">
      <div><strong>${total} / 81</strong><span>联合码实际号码</span></div>
      <div><strong>1–9</strong><span>主性格／内驱／天赋</span></div>
      <div><strong>1–8</strong><span>阶段挑战｜0特殊值</span></div>
      <div><strong>679</strong><span>原资料索引保留</span></div>
    </div>
    <div class="notice">下面显示的是实际资料内容，不记录书本页码或拍照页面；只保留可查询的结构化内容、AURMOVA白话和必要的规则说明。</div>
    <div class="library-module-nav">
      ${["81组联合码","1–9主性格","起始数","表现数字","内驱数字","姓名性情数字","循环数字解读","五行资料","黑洞数字","成熟数字","学员教材｜合成数字","缺失数","阶段挑战数字","七魄重复能量","制约数","高峰数字","特别数字／卓越数","特别数字／业力数","黄金20年阶段","黄金流年蓝图解析","财富密码","关系模式","九宫格","儿童1–9","儿童天赋速查","亲子案例"].map(x=>`<button type="button" class="library-module-btn" data-library-query="${escapeLibraryHtml(x)}">${escapeLibraryHtml(x)}</button>`).join("")}
    </div>
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

function followupStorageKey(id){return "aurmova.followup."+id;}
function loadFollowupState(id){try{return JSON.parse(localStorage.getItem(followupStorageKey(id))||"{}")}catch{return{}}}
function saveFollowupState(id,data){localStorage.setItem(followupStorageKey(id),JSON.stringify(data||{}));}

function normalizeWhatsAppNumber(raw){
  const original=String(raw||"").trim();
  let digits=original.replace(/\D/g,"");
  if(!digits)return "";
  if(original.startsWith("+"))return digits;
  if(digits.startsWith("00"))digits=digits.slice(2);
  if(digits.startsWith("0"))return "60"+digits.slice(1);
  if(digits.startsWith("60"))return digits;
  return digits;
}

function followupTopic(c){
  const types=(c.consultationTypes?.length?c.consultationTypes:[c.consultationType]).filter(Boolean);
  const joined=types.join("、");
  const theme=c.consultationTheme&&c.consultationTheme!=="未指定"?c.consultationTheme:"";
  if(joined.includes("黄金流年")) return "今年的节奏和你接下来最想调整的方向";
  if(joined.includes("关系")) return "你在关系里的反应、边界和真正需要";
  if(joined.includes("亲子")) return "你和孩子互动时最容易重复的那个模式";
  if(joined.includes("合作")) return "你在合作、沟通和分工上的习惯";
  if(joined.includes("人生")) return "你最近最常重复出现的那个模式";
  if(theme) return theme;
  return "我们那天聊到的那一个重点";
}

function followupHumanMessage(c,stage){
  const name=(c.name||"你").trim();
  const topic=followupTopic(c);
  const typeText=(c.consultationTypes?.length?c.consultationTypes:[c.consultationType]).filter(Boolean).join("、");
  const special={
    golden:typeText.includes("黄金流年"),
    relation:typeText.includes("关系"),
    parent:typeText.includes("亲子"),
    coop:typeText.includes("合作")
  };
  if(stage==="d0"){
    return "嗨 "+name+" 🤍 今天谢谢你愿意跟我聊这么多。刚刚咨询结束后，我还是想留一句给你：不用急着一次把所有东西都改掉，先把今天最有感觉的那一个点带回生活里观察就好。\\n\\n如果接下来你遇到一个场景，突然发现“原来我真的会这样”，可以直接回我，我会记得我们今天聊过的方向。";
  }
  if(stage==="d3"){
    let middle="这几天有没有哪一刻，你突然想起我们那天聊到的「"+topic+"」？";
    if(special.golden) middle="这几天有没有开始感觉到，今年的节奏跟之前真的有一点不一样？尤其是我们聊到的「"+topic+"」，有没有在哪个场景突然对上？";
    if(special.relation) middle="这几天在关系里，有没有出现一个小场景，让你突然看见自己原来真的会用我们那天聊到的那种方式反应？";
    if(special.parent) middle="这几天跟孩子互动的时候，有没有哪一个瞬间，让你突然想起我们那天聊到的「"+topic+"」？";
    if(special.coop) middle="这几天在工作或合作里，有没有出现一个场景，让你突然看见自己原来真的会这样沟通、分工或扛责任？";
    return "嗨 "+name+"～我来轻轻回访一下 🤍\\n\\n"+middle+"\\n\\n很多时候不是咨询当下最有感觉，而是回到生活里再次遇到类似场景时，才会突然“对上”。如果你有一个这样的瞬间，可以回我一句，我很想知道。";
  }
  if(stage==="d7"){
    return "嗨 "+name+" 🤍 一个星期了，我想问你一个很简单的问题：\\n\\n这周有没有一件事，你发现自己的反应跟以前有一点点不一样？\\n\\n不一定要是很大的改变。可能只是比以前早一点说出来、少纠结一下、比较敢做决定，或者你终于发现“原来这里就是我一直卡住的地方”。\\n\\n你不用写很长，告诉我一个小变化就好 😊";
  }
  if(stage==="d30"){
    return "嗨 "+name+"～差不多一个月了，我回来看看你最近的状态 🤍\\n\\n如果把这一个月跟我们咨询前比，你觉得自己现在最明显的变化是什么？\\n\\n也可以是“其实我还是卡在原来的地方”。都没关系，我比较想知道真实的你现在走到哪里了。\\n\\n如果你愿意，也可以把最近最困扰你的那一件事告诉我，我会帮你一起把它放回我们之前看到的模式里看。";
  }
  return "";
}

function followupWhatsappUrl(c,message){
  const phone=normalizeWhatsAppNumber(c.whatsapp);
  return phone?"https://wa.me/"+phone+"?text="+encodeURIComponent(message):"#";
}

function followupStageLabel(stage){
  return ({d0:"当天关心",d3:"第3天",d7:"第7天",d30:"第30天"})[stage]||stage;
}

function followupCard(c){
  const state=loadFollowupState(c.id);
  const active=state.active||"d3";
  const text=state.drafts?.[active]||followupHumanMessage(c,active);
  const sent=state.sent||{};
  const types=(c.consultationTypes?.length?c.consultationTypes:[c.consultationType]).filter(Boolean).join(" · ")||"未指定项目";
  return '<article class="card followup-card" data-followup-card="'+escapeLibraryHtml(c.id)+'">'
    +'<div class="followup-head"><div><small>CLIENT FOLLOW-UP</small><h3>'+escapeLibraryHtml(c.name)+'</h3><p>'+escapeLibraryHtml(c.whatsapp)+' · '+escapeLibraryHtml(c.occupation||"未填写职业")+'</p><span>'+escapeLibraryHtml(types)+'</span></div><a class="btn btn-light" href="#workspace?id='+encodeURIComponent(c.id)+'">打开顾客</a></div>'
    +'<div class="followup-stages">'
      +["d0","d3","d7","d30"].map(k=>'<button type="button" class="followup-stage '+(active===k?'active':'')+'" data-followup-stage="'+k+'" data-followup-id="'+escapeLibraryHtml(c.id)+'">'+followupStageLabel(k)+(sent[k]?'<small>已联系 ✓</small>':'')+'</button>').join("")
    +'</div>'
    +'<div class="followup-editor">'
      +'<div class="followup-note"><b>Human 文案</b><span>先像人一样关心，再继续关系；不硬推销、不复制罐头句。</span></div>'
      +'<textarea class="followup-text" data-followup-text="'+escapeLibraryHtml(c.id)+'" data-stage="'+active+'" rows="8">'+escapeLibraryHtml(text)+'</textarea>'
      +'<div class="followup-actions">'
        +'<button type="button" class="btn btn-light" data-followup-regenerate="'+escapeLibraryHtml(c.id)+'">重新生成自然一点</button>'
        +'<button type="button" class="btn btn-light" data-followup-copy="'+escapeLibraryHtml(c.id)+'">复制文案</button>'
        +'<button type="button" class="btn btn-primary" data-followup-whatsapp="'+escapeLibraryHtml(c.id)+'">打开 WhatsApp →</button>'
      +'</div>'
      +'<p class="followup-help">按“打开 WhatsApp”会直接带入顾客号码和上面的文案，你确认后再发送。不会在你没看过内容的情况下自动发出去。</p>'
    +'</div>'
  +'</article>';
}

function followupPage(){
  const rows=loadCustomers().filter(c=>c.whatsapp).map(followupCard).join("");
  return header("CLIENT CARE","Follow-up 中心","直接打开 WhatsApp 跟进顾客；文案先由系统写成自然、像真人关心的语气，你可以改完再发。")
    +'<section class="followup-intro card"><div><small>AURMOVA CLIENT CARE</small><h2>咨询不是结束，是关系开始变清楚的地方。</h2><p>这里准备了当天／第3天／第7天／第30天四个跟进节点。系统先写好自然文案，你只需要看一眼、微调，再直接打开 WhatsApp。</p></div></section>'
    +'<section class="followup-list">'+(rows||'<div class="card empty"><h3>暂无可跟进号码</h3><p>建立顾客时填写 WhatsApp 号码后会显示在这里。</p></div>')+'</section>';
}
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
function history(){
    const rows=loadCustomers().map(c=>{
      const bd=birthdayDayInfo(c.birthday);
      const dayLabel=bd.profile?(bd.day+"号 · "+bd.profile.title):(bd.day?(bd.day+"号"):"—");
      return `<tr><td><strong>${c.name}</strong></td><td>${c.gender}</td><td>${c.birthday}<br><small>生日数字 ${dayLabel}</small></td><td>${(c.consultationTypes?.length?c.consultationTypes:[c.consultationType]).filter(Boolean).join(" / ")}</td><td>${c.status}</td><td><a href="#workspace?id=${c.id}" style="color:var(--gold)">開啟</a></td></tr>`;
    }).join("");
    return `${header("Private Archive","歷史顧客檔案","所有顧客紀錄都只儲存在此裝置的瀏覽器中。正式上線前需連接安全後端。")}<section class="card table-wrap">${rows?`<table class="customer-table"><thead><tr><th>顧客</th><th>性別</th><th>生日／生日数字</th><th>諮詢項目</th><th>狀態</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:`<div class="empty"><div class="empty-mark">A</div><h3>還沒有顧客檔案</h3><p>建立第一份檔案，開始整理諮詢資料。</p><a class="btn btn-primary" href="#new">建立顧客檔案</a></div>`}</section>`;
  }
function firstConsultStorageKey(id){return "aurmova.firstconsult."+id;}
function firstConsultProfile(a){
  const inner=a&&a.innerEnergy&&a.innerEnergy.counts?a.innerEnergy.counts:{};
  const outer=a&&a.outerEnergy&&a.outerEnergy.counts?a.outerEnergy.counts:{};
  const total=n=>Number(inner[n]||0)+Number(outer[n]||0);
  const inward=total(2)+total(7), outward=total(3)+total(8);
  let emotion="四码低显";
  if(inward>outward) emotion=outward?"切换型｜内收底色":"内收型";
  else if(outward>inward) emotion=inward?"切换型｜外放底色":"外放型";
  else if(inward+outward>1) emotion="切换型｜两边接近";
  const rational=total(1)+total(4)+total(5)+total(8);
  const feeling=total(2)+total(3)+total(6)+total(7)+total(9);
  const decision=rational>feeling?"理性偏高":feeling>rational?"感性偏高":"理性感性接近";
  return {inward,outward,emotion,rational,feeling,decision};
}
function firstConsultPage(){
  const id=new URLSearchParams(location.hash.split("?")[1]).get("id");
  const c=loadCustomers().find(x=>x.id===id);
  if(!c) return header("FIRST CONSULTATION","首次咨询模式","请先从顾客档案开启一位顾客。")+'<section class="card empty"><h3>尚未选择顾客</h3><a class="btn btn-primary" href="#history">前往顾客档案</a></section>';
  const a=calculateBlueprint(c.birthday),profile=PERSONALITY_LIBRARY[a.mainPersonality],detail=MAIN_DETAIL[a.mainPersonality]||{};
  const birthdayDay=birthdayDayInfo(c.birthday);
  const p=firstConsultProfile(a);
  let saved={};try{saved=JSON.parse(localStorage.getItem(firstConsultStorageKey(c.id))||"{}")}catch{}
  const val=(k,fallback="")=>escapeLibraryHtml(saved[k]===undefined?fallback:saved[k]);
  const theme=val("theme",c.consultationTheme||"");
  const obs1="主性格 "+a.mainPersonality+"｜"+(profile&&profile.title?profile.title:"");
  const obs2="情绪模式："+p.emotion+"（2/7="+p.inward+"；3/8="+p.outward+"）";
  const obs3="决策偏好："+p.decision+"（理性"+p.rational+"：感性"+p.feeling+"）";
  const opening="你好 "+c.name+"，我是 Josephine。今天我不会一开始就把很多数字丢给你。我会先听你最近最在意的事情，再用你的盘帮你看见比较常出现的模式。过程中你随时可以打断我，觉得不像也可以直接告诉我，我们一起验证。";
  const follow="嗨 "+c.name+" 🤍 我是 Josephine。想回来关心一下，昨天我们聊到的内容对你有没有帮助？有没有哪一段是你回去以后又突然想起，或者开始发现自己真的会这样反应的？";
  return header("AURMOVA · FIRST CONSULTATION",c.name+"｜首次咨询导航","不要讲满整张盘。先抓主线、验证、再深入。")
  +'<section class="client-summary card"><div class="client-avatar">'+escapeLibraryHtml(c.name.slice(0,1).toUpperCase())+'</div><div class="client-main"><small>FIRST SESSION</small><h2>'+escapeLibraryHtml(c.name)+'</h2><p>'+escapeLibraryHtml(c.birthday)+' · 生日数字 '+birthdayDay.day+'号'+(birthdayDay.profile?(' · '+escapeLibraryHtml(birthdayDay.profile.title)):'')+' · 主性格 '+a.mainPersonality+' · '+escapeLibraryHtml(c.occupation||"职业未填")+' · '+escapeLibraryHtml(c.consultationTheme||"主题未指定")+'</p></div><div class="quick-actions"><a class="btn btn-light" href="#workspace?id='+encodeURIComponent(c.id)+'">返回咨询工作台</a></div></section>'
  +'<section class="card fc-dashboard"><div class="card-heading"><div><small>PREP · 5–10 MIN</small><h2>咨询前只准备 3 件事</h2></div><span>不要预写整场答案</span></div><div class="fc-grid">'
  +'<label class="fc-check"><input type="checkbox" data-fc-check="chart" '+(saved.checks&&saved.checks.chart?"checked":"")+'><span><b>① 盘已经排好</b><small>确认三角形、缺失／高密度、情绪、理性／感性。</small></span></label>'
  +'<label class="fc-check"><input type="checkbox" data-fc-check="tensions" '+(saved.checks&&saved.checks.tensions?"checked":"")+'><span><b>② 只标 2–3 个核心张力</b><small>不是把全部模块都讲完。</small></span></label>'
  +'<label class="fc-check"><input type="checkbox" data-fc-check="opening" '+(saved.checks&&saved.checks.opening?"checked":"")+'><span><b>③ 准备 1–2 个开场观察</b><small>先共鸣，再解释数字。</small></span></label></div>'
  +'<div class="fc-observations"><div><small>系统观察 01</small><b>'+escapeLibraryHtml(obs1)+'</b><p>'+escapeLibraryHtml(detail.behavior||(profile&&profile.positive?profile.positive.slice(0,2).join("、"):""))+'</p></div><div><small>系统观察 02</small><b>'+escapeLibraryHtml(obs2)+'</b><p>情绪不是看“多不多”，而是先看往内还是往外，以及内外位置是否一致。</p></div><div><small>系统观察 03</small><b>'+escapeLibraryHtml(obs3)+'</b><p>决策系统和情绪表达分开看，最后再交叉。</p></div></div></section>'
  +'<section class="card fc-section"><div class="card-heading"><div><small>OPENING · 5 MIN</small><h2>第一阶段｜先建立连接</h2></div><span>先听，再解</span></div>'
  +'<div class="question-box"><b>Josephine 开场可直接照读：</b><br>“'+escapeLibraryHtml(opening)+'”</div>'
  +'<div class="question-box"><b>第一问：</b><br>“在开始之前，我想先知道，你今天最想聊的是什么？是事业、感情、家庭，还是你最近整体的状态？”</div>'
  +'<div class="field"><label>顾客今天最想聊的主题</label><input data-fc-field="theme" value="'+theme+'" placeholder="例如：最近很想换工作，但一直不敢决定"></div>'
  +'<div class="field"><label>顾客刚刚讲的真实事件／故事</label><textarea data-fc-field="story" rows="4" placeholder="先记录顾客自己的话，不急着解释。">'+val("story")+'</textarea></div></section>'
  +'<section class="card fc-section"><div class="card-heading"><div><small>CORE · 25–30 MIN</small><h2>第二阶段｜只讲 3–4 个最相关模块</h2></div><span>讲深，不讲满</span></div><div class="fc-flow">'
  +'<article><b>01 性格底色｜约5分钟</b><p>一句话概括，再问一个具体行为。</p><div class="question-box">“我先从你最自然的一面看。你会不会比较容易出现 '+escapeLibraryHtml(profile&&profile.positive?profile.positive.slice(0,2).join("、"):"这种模式")+'？最近有没有一个很明显的例子？”</div></article>'
  +'<article><b>02 情绪模式｜约5分钟</b><p>看2/7和3/8，再看内外位置。</p><div class="question-box">“你的情绪比较像 '+escapeLibraryHtml(p.emotion)+'。我不想只用数字定义你，所以想问：你不舒服的时候通常是先忍、先说，还是看对象才决定？”</div></article>'
  +'<article><b>03 核心张力｜约5分钟</b><p>用里面的你 vs 现实中的你去验证。</p><div class="question-box">“我看到你身上有两股力量可能会拉扯。你自己觉得，在最放松的时候和在工作／关系压力里，你会不会像两个不同版本的自己？”</div></article>'
  +'<article><b>04 回到顾客最关心的事｜约10分钟</b><p>这才是本场主线。</p><div class="question-box">“我们先不看更多数字。回到你刚才讲的那件事——你真正卡住的，是事情本身，还是你担心做了这个决定以后会发生什么？”</div></article></div>'
  +'<div class="field"><label>核心张力 1</label><input data-fc-field="tension1" value="'+val("tension1",obs1)+'"></div>'
  +'<div class="field"><label>核心张力 2</label><input data-fc-field="tension2" value="'+val("tension2",obs2)+'"></div>'
  +'<div class="field"><label>核心张力 3（有需要才讲）</label><input data-fc-field="tension3" value="'+val("tension3",obs3)+'"></div>'
  +'<div class="notice"><b>节奏：</b>提出一个模式 → 停下来 → 让顾客讲例子 → 把例子挂回盘 → 再进入下一层。一次真正看见 2–3 个模式就够。</div></section>'
  +'<section class="card fc-section"><div class="card-heading"><div><small>CLOSING · 5–10 MIN</small><h2>第三阶段｜让顾客带走一句话</h2></div><span>做减法</span></div>'
  +'<div class="question-box"><b>重新定义：</b><br>“聊了这么多，我觉得今天最值得你看见的，不是你哪里有问题，而是你一直在用一种很熟悉的方法处理事情。现在你开始看见它了，就多了一个选择。”</div>'
  +'<div class="field"><label>今天只带走的一句话</label><textarea data-fc-field="closing" rows="2" placeholder="必须来自今天真实分析，不用套话。">'+val("closing")+'</textarea></div>'
  +'<div class="field"><label>只给一个行动</label><textarea data-fc-field="action" rows="2" placeholder="例如：下次想马上答应别人时，先停10秒问自己：这是我想要的吗？">'+val("action")+'</textarea></div>'
  +'<div class="question-box"><b>开放结尾：</b><br>“今天的解读是我从你的盘和你刚刚讲的经历里一起整理出来的，但你对自己最了解。回去以后如果有新的感受或变化，随时可以告诉我。”</div></section>'
  +'<section class="card fc-section"><div class="card-heading"><div><small>AFTER · 24H</small><h2>第四阶段｜咨询后跟进</h2></div><span>关心，不推销</span></div><div class="question-box"><b>24小时跟进话术：</b><br>“'+escapeLibraryHtml(follow)+'”</div><div class="notice">如果顾客主动问下一次还能聊什么，才根据这次未展开的主题给方向；第一次跟进不硬推第二次咨询。</div></section>'
  +'<section class="card fc-section"><div class="card-heading"><div><small>WHEN SESSION GETS HARD</small><h2>现场卡住时这样处理</h2></div></div><div class="fc-mini-grid"><div><b>顾客沉默</b><p>先等几秒，再问：“你刚刚在想什么？”</p></div><div><b>顾客情绪上来</b><p>先停下来，问她要不要继续。可以说：“这段对你来说好像很重，我们可以慢一点。”</p></div><div><b>顾客说不像</b><p>不要硬解释。问：“那你觉得自己更像哪一种？有没有什么经历让我需要调整这个判断？”</p></div><div><b>顾客要你替她决定</b><p>“我可以帮你看清模式和卡点，但决定还是你来做。”</p></div></div></section>';
}
function initFirstConsult(){
  const id=new URLSearchParams(location.hash.split("?")[1]).get("id"); if(!id)return;
  const key=firstConsultStorageKey(id);
  let state={};try{state=JSON.parse(localStorage.getItem(key)||"{}")}catch{}
  const save=()=>{
    state.checks=state.checks||{};
    document.querySelectorAll("[data-fc-check]").forEach(x=>state.checks[x.dataset.fcCheck]=x.checked);
    document.querySelectorAll("[data-fc-field]").forEach(x=>state[x.dataset.fcField]=x.value);
    localStorage.setItem(key,JSON.stringify(state));
  };
  document.querySelectorAll("[data-fc-check],[data-fc-field]").forEach(x=>x.addEventListener("input",save));
}
function workspace(){
 const id=new URLSearchParams(location.hash.split('?')[1]).get('id');
 const c=loadCustomers().find(x=>x.id===id);
 const a=c?calculateBlueprint(c.birthday):null;
 const age=c?ageFromBirthday(c.birthday):null;
 const phase=a?phaseForAge(age):null;
 const p=a?.positions;
 const profile=a?PERSONALITY_LIBRARY[a.mainPersonality]:null;
 const birthdayDay=c?birthdayDayInfo(c.birthday):{day:0,profile:null};
 const highPeak=c?calculateHighPeakProfile(c.birthday):null;
 const challengeProfile=c?calculateChallengeProfile(c.birthday):null;
 const expressionProfile=c?calculateExpressionProfile({displayName:c.name,officialName:c.officialName,formerName:c.formerName,nameChangedYear:c.nameChangedYear}):null;
 const innerDriveProfile=c?calculateInnerDriveProfile({displayName:c.name,officialName:c.officialName,formerName:c.formerName,nameChangedYear:c.nameChangedYear}):null;
 const temperamentProfile=c?calculateTemperamentProfile({displayName:c.name,officialName:c.officialName,formerName:c.formerName,nameChangedYear:c.nameChangedYear}):null;
 if(!c) return `${header("Consultation Workspace","AURMOVA 咨询工作台","请先从历史档案开启一位顾客。")}<section class="card empty"><h3>尚未选择顾客</h3><p>从历史档案开启顾客后，完整咨询资料会显示在这里。</p><a class="btn btn-primary" href="#history">前往历史档案</a></section>`;
 const phaseCards=Object.entries(a.phases).map(([name,v])=>`<div class="phase-card ${name===phase?'current':''}"><small>${name}</small><b>因果 ${v.cause.join("")}</b><span>过程 ${v.process1.join("")} · ${v.process2.join("")}</span><span>结果 ${v.result.join("")}</span></div>`).join("");
 const selectedFocus=new Set(c?.consultationFocus||[]);
 const focus=FOCUS_OPTIONS.map(x=>`<label class="focus-chip"><input type="checkbox" ${selectedFocus.has(x)?'checked':''}><span>${x}</span></label>`).join("");
 return `${header("AURMOVA · PRIVATE CONSULTATION","AURMOVA 咨询工作台","透过数字认识自己｜透过美学展现魅力")}
 <section class="client-summary card">
   <div class="client-avatar">${c.name.slice(0,1).toUpperCase()}</div>
   <div class="client-main"><small>本次咨询顾客</small><h2>${c.name}</h2><p>${c.gender} · ${c.birthday} · <b>生日数字 ${birthdayDay.day||"—"}号${birthdayDay.profile?" · "+birthdayDay.profile.title:""}</b> · ${age}岁 · ${simpleZodiac(c.birthday)} · ${c.occupation||"职业未填"} · ${c.whatsapp||"号码未填"} · ${(c.consultationTypes?.length?c.consultationTypes:[c.consultationType]).filter(Boolean).join(" / ")}</p></div>
   <div class="client-number"><small>主性格</small><strong>${a.mainPersonality}</strong><span>${profile?.title.split("｜")[1]||""}</span></div>
   <div class="quick-actions"><a class="btn btn-primary" href="#firstconsult?id=${c.id}">开始首次咨询</a><button type="button" class="btn btn-light" data-v26-jump>出路导航器</button><a class="btn btn-light" href="#new">＋ 新增顾客</a><a class="btn btn-light" href="#history">历史档案</a></div>
 </section>
 <section id="v26-opportunity-navigator" class="card opportunity-navigator"><div class="card-heading"><div><small>AURMOVA OPPORTUNITY NAVIGATOR</small><h2>出路导航器｜问题 × 行业 × 蓝图</h2></div><span>现实优先 · 数字辅助</span></div><p class="op-intro">这里会根据顾客的职业／身份与她真正想问的问题，生成关键词、追问、可选出路、7天／30天验证动作。正在载入顾客专属分析…</p></section>
 <section class="module-tabs">${CONSULTATION_TYPES.map(x=>`<button class="module-tab ${x===c.consultationType?'active':''}">${x.replace("解析","")}</button>`).join("")}</section>
 <div class="section-head"><div><p class="eyebrow">Josephine Only</p><h2>数字结构 · 仅供后台使用</h2></div><span class="private-pill">PRIVATE</span></div>
 <section class="card form-card expression-name-editor" data-expression-editor="${c.id}"><div class="card-heading"><div><small>EXPRESSION NAME SOURCE</small><h3>姓名资料｜表现数字 + 内驱数字 + 性情数字共用</h3></div><span>${expressionProfile?.canCalculate?("目前 "+expressionProfile.primary.compound):"待补姓名"}</span></div>
 <div class="fields"><div class="field"><label>现正式姓名（华文／英文都可以）</label><input data-expression-field="officialName" value="${escapeLibraryHtml(c.officialName||"")}" placeholder="留空则直接使用顾客姓名；华文自动转拼音"></div><div class="field"><label>曾用／最初正式姓名</label><input data-expression-field="formerName" value="${escapeLibraryHtml(c.formerName||"")}" placeholder="华文／英文都可以；没有正式改名可留空"></div><div class="field"><label>改名年份</label><input data-expression-field="nameChangedYear" value="${escapeLibraryHtml(c.nameChangedYear||"")}" inputmode="numeric" placeholder="例如 2024"></div></div>
 <div class="notice">${escapeLibraryHtml(expressionProfile?.transitionRule||"补齐姓名后自动计算表现数字。")}</div><button type="button" class="btn btn-primary" data-save-expression-name="${c.id}">保存姓名资料并重新计算</button></section>
 <section class="structure-grid">
  <article class="card gene-card"><small>父亲基因</small><h3>I · J · M</h3><div class="big-code">${p.I}　${p.J}　${p.M}</div><p>I ${p.I} · J ${p.J} · M ${p.M}</p></article>
  <article class="card gene-card"><small>母亲基因</small><h3>K · L · N</h3><div class="big-code">${p.K}　${p.L}　${p.N}</div><p>K ${p.K} · L ${p.L} · N ${p.N}</p></article>
  <article class="card core-card"><small>核心结构</small><div class="core-row"><div><span>主性格 O</span><strong>${a.mainPersonality}</strong></div><div><span>内心码</span><strong>${a.innerCode}</strong></div><div><span>坐镇码</span><strong>${a.seatCode}</strong></div></div><p>当前年龄 ${age}岁 · ${phase} 阶段</p></article><article class="card gene-card"><small>生日数字 · 实际出生日</small><h3>${birthdayDay.day||"—"}号${birthdayDay.profile?" · "+birthdayDay.profile.title:""}</h3><p>${birthdayDay.profile?birthdayDay.profile.core:"未能读取生日日期"}</p></article><article class="card gene-card"><small>高峰数字 · 四阶段</small><h3>${highPeak?highPeak.peaks.join(" → "):"—"}</h3><p>${highPeak?("当前 "+highPeak.current.range+" · 第"+highPeak.current.index+"高峰 "+highPeak.current.number+"号"):"未能计算"}</p></article><article class="card gene-card"><small>阶段挑战数字 · 四阶段</small><h3>${challengeProfile?challengeProfile.values.join(" → "):"—"}</h3><p>${challengeProfile?("当前 "+challengeProfile.current.range+" · 第"+challengeProfile.current.index+"挑战 "+challengeProfile.current.number+(challengeProfile.current.number===0?"（特殊值）":"")):"未能计算"}</p></article><article class="card gene-card"><small>表现数字 · 正式姓名</small><h3>${expressionProfile?.canCalculate?expressionProfile.primary.compound:"待补姓名"}</h3><p>${expressionProfile?.canCalculate?("基础数 "+expressionProfile.primary.reduced+" · "+expressionProfile.transitionRule):"输入华文或英文姓名后自动计算"}</p></article><article class="card gene-card"><small>内驱数字 · 姓名元音</small><h3>${innerDriveProfile?.canCalculate?innerDriveProfile.primary.compound:"待确认"}</h3><p>${innerDriveProfile?.canCalculate?("基础数 "+innerDriveProfile.primary.reduced+" · 只算 A/E/I/O/U"):(innerDriveProfile?.reason==="no-course-vowels"?"姓名没有A/E/I/O/U，需人工确认":"姓名转换后自动计算")}</p></article><article class="card gene-card"><small>性情数字 · 四体次数</small><h3>${temperamentProfile?.canCalculate?("头"+temperamentProfile.primary.counts.mind+" · 身"+temperamentProfile.primary.counts.body+" · 情"+temperamentProfile.primary.counts.emotion+" · 直"+temperamentProfile.primary.counts.intuition):"待确认"}</h3><p>${temperamentProfile?.canCalculate?("四组总计 "+temperamentProfile.primary.totalLetters+" 个姓名字母 · 不化简"):"姓名转换后自动统计"}</p></article>
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
  else if (route === "firstconsult") { app.innerHTML = firstConsultPage(); setTimeout(initFirstConsult,0); }
  else if (route === "library") { app.innerHTML = libraryPage(); setTimeout(initLibrarySearch,0); }
  else if (route === "whiteboard") { app.innerHTML = whiteboardPage(); setTimeout(initWhiteboard,0); }
  else if (route === "followup") app.innerHTML = followupPage();
  else app.innerHTML = home();
  app.focus({ preventScroll: true });
}

window.addEventListener("hashchange", render);

document.addEventListener("click", event => {
  const fStage=event.target.closest("[data-followup-stage]");
  if(fStage){
    const id=fStage.dataset.followupId,stage=fStage.dataset.followupStage;
    const customer=loadCustomers().find(x=>x.id===id); if(!customer)return;
    const state=loadFollowupState(id); state.active=stage; saveFollowupState(id,state);
    app.innerHTML=followupPage();
    return;
  }

  const fRegen=event.target.closest("[data-followup-regenerate]");
  if(fRegen){
    const id=fRegen.dataset.followupRegenerate,customer=loadCustomers().find(x=>x.id===id); if(!customer)return;
    const card=fRegen.closest("[data-followup-card]"),area=card?.querySelector("[data-followup-text]");
    const stage=area?.dataset.stage||loadFollowupState(id).active||"d3";
    const base=followupHumanMessage(customer,stage);
    const variants=[
      base,
      base.replace(/我来轻轻回访一下/g,"突然想到你，回来关心一下").replace(/我很想知道/g,"你愿意的话可以跟我说说"),
      base.replace(/嗨 /g,"Hello ").replace(/ 🤍/g,"～").replace(/你不用写很长/g,"不用特地组织得很完整")
    ];
    const state=loadFollowupState(id); state.variant=((state.variant||0)+1)%variants.length;
    state.drafts={...(state.drafts||{}),[stage]:variants[state.variant]}; saveFollowupState(id,state);
    if(area)area.value=variants[state.variant];
    showToast("已换一版更自然的文案");
    return;
  }

  const fCopy=event.target.closest("[data-followup-copy]");
  if(fCopy){
    const id=fCopy.dataset.followupCopy,card=fCopy.closest("[data-followup-card]"),area=card?.querySelector("[data-followup-text]");
    const textValue=area?.value||"";
    if(navigator.clipboard?.writeText) navigator.clipboard.writeText(textValue).then(()=>showToast("文案已复制"));
    else { area?.select(); document.execCommand?.("copy"); showToast("文案已复制"); }
    return;
  }

  const fWa=event.target.closest("[data-followup-whatsapp]");
  if(fWa){
    const id=fWa.dataset.followupWhatsapp,customer=loadCustomers().find(x=>x.id===id); if(!customer)return;
    const card=fWa.closest("[data-followup-card]"),area=card?.querySelector("[data-followup-text]");
    const stage=area?.dataset.stage||loadFollowupState(id).active||"d3";
    const message=area?.value||followupHumanMessage(customer,stage);
    const phone=normalizeWhatsAppNumber(customer.whatsapp);
    if(!phone){showToast("这位顾客没有有效 WhatsApp 号码");return}
    const state=loadFollowupState(id);
    state.active=stage;
    state.drafts={...(state.drafts||{}),[stage]:message};
    state.sent={...(state.sent||{}),[stage]:new Date().toISOString()};
    saveFollowupState(id,state);
    window.open(followupWhatsappUrl(customer,message),"_blank","noopener,noreferrer");
    return;
  }


  const saveExpressionName = event.target.closest("[data-save-expression-name]");
  if (saveExpressionName) {
    const id=saveExpressionName.getAttribute("data-save-expression-name");
    const card=saveExpressionName.closest("[data-expression-editor]");
    const customers=loadCustomers();
    const customer=customers.find(x=>x.id===id);
    if(!customer){showToast("找不到顾客档案");return;}
    const pending={};
    card?.querySelectorAll("[data-expression-field]").forEach(input=>{pending[input.dataset.expressionField]=String(input.value||"").trim();});
    if(pending.nameChangedYear && !/^\d{4}$/.test(pending.nameChangedYear)){showToast("改名年份请填写4位数字，例如 2024");return;}
    Object.assign(customer,pending);
    saveCustomers(customers);
    showToast("姓名资料已保存，表现数字已重新计算");
    render();
    return;
  }

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

document.addEventListener("input", event => {
  const area=event.target.closest("[data-followup-text]");
  if(!area)return;
  const id=area.dataset.followupText,stage=area.dataset.stage||"d3";
  const state=loadFollowupState(id);
  state.active=stage;
  state.drafts={...(state.drafts||{}),[stage]:area.value};
  saveFollowupState(id,state);
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
