import { CONSULTATION_TYPES, INTERNAL_TERMS, createCustomer, validateCustomer } from "./data.js";

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
function workspace(){const id=new URLSearchParams(location.hash.split('?')[1]).get('id');const c=loadCustomers().find(x=>x.id===id);return `${header("Consultation Workspace","Josephine 私人諮詢區",c?`${c.name} · ${c.consultationType} · ${c.birthday}`:"私人分析與顧客輸出在架構上明確分離。")}
<section class="workspace-grid"><article class="card zone private"><div class="zone-label">▣ JOSEPHINE ONLY</div><h2>內部分析資料</h2><p class="subtitle">正式計算引擎接入後，所有深度資料只會寫入此私人區域。</p><div class="tag-list">${INTERNAL_TERMS.map(x=>`<span class="tag">${x}</span>`).join("")}</div><div class="notice" style="color:#c4bdb1">目前不含任何自創公式或自動計算結果。</div></article>
<article class="card zone public"><div class="zone-label">◇ CLIENT REPORT</div><h2>顧客簡版報告區</h2><p class="subtitle">經 Josephine 人工確認後，才可整理適合顧客閱讀的內容。內部數字位置、分析資料與諮詢話術絕不自動帶入。</p><div class="tag-list"><span class="tag">主性格</span><span class="tag">內心碼</span><span class="tag">潛意識</span><span class="tag">財富密碼</span><span class="tag">關係模式</span></div><div class="actions"><button class="btn btn-light" data-demo>預覽簡版報告</button></div></article></section>
<div class="section-head"><div><p class="eyebrow">Golden 20-Year Phases</p><h2>階段分析預留區</h2></div></div><section class="card"><p class="subtitle">21–40 歲、41–60 歲、61 歲以後統一標示為「黃金20年階段」。比較時使用「三階段能量比較」、「三階段外在結果比較」與「較突出階段」。待正式規則提供後啟用。</p></section>`}

function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2500)}
function render(){const route=(location.hash.slice(1).split('?')[0]||'home');document.querySelectorAll('.nav-link').forEach(x=>x.classList.toggle('active',x.dataset.route===route));app.innerHTML=route==='new'?newCustomer():route==='history'?history():route==='workspace'?workspace():home();app.focus({preventScroll:true});
 document.querySelectorAll('[data-project]').forEach(el=>el.onclick=()=>{location.hash='new';setTimeout(()=>{app.innerHTML=newCustomer(el.dataset.project);bind()},0)});bind();}
function bind(){document.querySelector('#customer-form')?.addEventListener('submit',e=>{e.preventDefault();const form=Object.fromEntries(new FormData(e.currentTarget));const error=validateCustomer(form);if(error){toast(error);return}const customers=loadCustomers();customers.unshift(createCustomer(form));saveCustomers(customers);toast('顧客檔案已安全建立');setTimeout(()=>location.hash='history',500)});document.querySelector('[data-demo]')?.addEventListener('click',()=>toast('簡版報告需由 Josephine 確認後發佈'));}
window.addEventListener('hashchange',render);render();
