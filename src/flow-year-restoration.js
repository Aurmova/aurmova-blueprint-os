import { calculateBlueprint, activeFlowYear, flowYearRange } from "./engine/blueprint.js?v=32";

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

function enhance(){
  addFlowNotes();
  correctOuterHeart();
}

document.addEventListener("click",()=>setTimeout(enhance,120),true);
window.addEventListener("hashchange",()=>setTimeout(enhance,150));
setTimeout(enhance,250);
