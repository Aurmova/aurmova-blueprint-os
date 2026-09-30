import { CONSULTATION_TYPES, INTERNAL_TERMS, createCustomer, validateCustomer } from "./data.js";
import { calculateBlueprint, ageFromBirthday, phaseForAge } from "./engine/blueprint.js";
import { PERSONALITY_LIBRARY, FOCUS_OPTIONS } from "./personality-library.js";

const icons = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 11 12 3l9 8v9H3z"/><path d="M9 20v-6h6v6"/></svg>',
  add:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
  history:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 5h16v15H4zM8 3v4m8-4v4M4 10h16"/></svg>',
  work:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7h16v13H4zM9 7V4h6v3M4 12h16"/></svg>'
};
const routes = [
  ["home","私人工作台","home"],["new","建立檔案","add"],["history","歷史檔案","history"],["workspace","諮詢區","work"]
];
const app = document.querySelector("#app");
const loadCustomers = () => JSON.parse(localStorage.getItem("aurmova.customers") || "[]");
const saveCustomers = data => localStorage.setItem("aurmova.customers", JSON.stringify(data));

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
 <form id="customer-form" class="card form-card"><section class="form-section"><div class="form-section-title"><span class="step">01</span><h2>基本資料</h2></div><div class="fields"><div class="field"><label for="name">姓名 *</label><input id="name" name="name" autocomplete="name" placeholder="輸入顧客姓名" required></div><div class="field"><label for="gender">性別 *</label><select id="gender" name="gender" required><option value="">請選擇</option><option>女性</option><option>男性</option><option>非二元／其他</option><option>不透露</option></select></div><div class="field" style="grid-column:1/-1"><label>生日 · 日 / 月 / 年 *</label><div class="date-fields"><select name="day" aria-label="日" required><option value="">日</option>${Array.from({length:31},(_,i)=>`<option>${i+1}</option>`).join("")}</select><select name="month" aria-label="月" required><option value="">月</option>${Array.from({length:12},(_,i)=>`<option>${i+1}</option>`).join("")}</select><select name="year" aria-label="年" required><option value="">年</option>${years}</select></div></div></div></section>
 <section class="form-section"><div class="form-section-title"><span class="step">02</span><h2>選擇諮詢項目</h2></div><div class="radio-grid">${CONSULTATION_TYPES.map((x,i)=>`<label class="radio-card"><input type="radio" name="consultationType" value="${x}" ${selected===x?'checked':''} required><span>0${i+1}　${x}</span></label>`).join("")}</div></section>
 <div class="notice">建立後，系統只會建立資料骨架，不會執行或推測任何數字心理學計算。完整分析僅保留在 Josephine 私人諮詢區。</div><div class="actions"><button class="btn btn-primary" type="submit">建立私人檔案</button><a class="btn btn-light" href="#home">取消</a></div></form>`;
}
function history(){const rows=loadCustomers().map(c=>`<tr><td><strong>${c.name}</strong></td><td>${c.gender}</td><td>${c.birthday}</td><td>${c.consultationType}</td><td>${c.status}</td><td><a href="#workspace?id=${c.id}" style="color:var(--gold)">開啟</a></td></tr>`).join("");return `${header("Private Archive","歷史顧客檔案","所有顧客紀錄都只儲存在此裝置的瀏覽器中。正式上線前需連接安全後端。")}<section class="card table-wrap">${rows?`<table class="customer-table"><thead><tr><th>顧客</th><th>性別</th><th>生日</th><th>諮詢項目</th><th>狀態</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:`<div class="empty"><div class="empty-mark">A</div><h3>還沒有顧客檔案</h3><p>建立第一份檔案，開始整理諮詢資料。</p><a class="btn btn-primary" href="#new">建立顧客檔案</a></div>`}</section>`}
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
 const focus=FOCUS_OPTIONS.map((x,i)=>`<label class="focus-chip"><input type="checkbox" ${i<6?'checked':''}><span>${x}</span></label>`).join("");
 return `${header("AURMOVA · PRIVATE CONSULTATION","AURMOVA 咨询工作台","透过数字认识自己｜透过美学展现魅力")}
 <section class="client-summary card">
   <div class="client-avatar">${c.name.slice(0,1).toUpperCase()}</div>
   <div class="client-main"><small>本次咨询顾客</small><h2>${c.name}</h2><p>${c.gender} · ${c.birthday} · ${age}岁 · ${c.consultationType}</p></div>
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
  else if (route === "history") app.innerHTML = history();
  else if (route === "workspace") app.innerHTML = workspace();
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
});

document.addEventListener("submit", event => {
  if (event.target.id !== "customer-form") return;
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(event.target).entries());
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
