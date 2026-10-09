// AURMOVA｜数字五行流年观察：只看重新排盘后的 M/N/O/P/Q/R 六个位置。
// 原书课程数字五行：1/6金、2/7水、3/8火、4/9木、5土。
// 数字频率仅用于传统课程讨论，不具有疾病风险预测或诊断能力。
export const FIVE_ELEMENT_LIBRARY = Object.freeze({
  meta:{
    title:"流年五行观察｜M、N、O、P、Q、R",
    source:"Josephine 原书第15页数字五行对应；2026-10-02五行健康课程对照表；2026-10-09确认流年只读取M/N/O/P/Q/R。",
    formula:"金=1/6；水=2/7；火=3/8；木=4/9；土=5。",
    scope:"必须使用当次选择的黄金流年年盘（出生日期的日、月保留，年份替换成目标流年），只读取 M/N/O/P/Q/R 六个位置。六个位置各计一次；MNO与PQR组合不可重复计数。",
    repeatRule:"同一个号码在这六个位中出现至少2次，标记为「重复数字」；不同号码属于同一五行时，只累计五行次数，不视为相同号码重复。",
    healthBoundary:"数字重复或五行次数较多，都不能说明当年的疾病、受伤、事故概率较高。仅提示咨询师询问真实作息、压力和健康习惯；存在持续症状应以医生检查为准。教材器官对照属于传统说法，不是医学筛查。",
    yearRule:"2027流年：2026-10-01至2027-09-30；与当前黄金流年模块采用相同的10月1日切换规则。"
  },
  elements:[
    {key:"metal",label:"金",digits:[1,6],tradition:"原课程关联呼吸、皮肤等主题（非诊断）"},
    {key:"water",label:"水",digits:[2,7],tradition:"原课程关联泌尿等主题（非诊断）"},
    {key:"fire",label:"火",digits:[3,8],tradition:"原课程关联心血管等主题（非诊断）"},
    {key:"wood",label:"木",digits:[4,9],tradition:"原课程关联眼睛、肝胆等主题（非诊断）"},
    {key:"earth",label:"土",digits:[5],tradition:"原课程关联消化等主题（非诊断）"}
  ]
});

const ANNUAL_SLOTS=Object.freeze(["M","N","O","P","Q","R"]);
const isDigit=n=>Number.isInteger(n)&&n>=1&&n<=9;
const htmlEscape=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const safeYear=n=>Number.isInteger(n)&&n>=1900&&n<=2200;

/**
 * @param {{year:number,yearPositions:Record<string,number>}} snapshot
 * @returns {object|null} Observational course counts, NOT clinical probabilities.
 */
export function calculateAnnualFiveElementDistribution(snapshot){
  if(!snapshot||!safeYear(Number(snapshot.year))||!snapshot.yearPositions)return null;
  const points=ANNUAL_SLOTS.map(slot=>({slot,digit:snapshot.yearPositions[slot]}));
  if(!points.every(p=>isDigit(p.digit)))return null;
  const frequencies=Object.fromEntries(Array.from({length:9},(_,i)=>[i+1,points.filter(p=>p.digit===i+1).length]));
  const repeatDigits=Object.entries(frequencies)
    .filter(([,count])=>count>=2)
    .map(([digit,count])=>({
      digit:Number(digit),count,
      slots:points.filter(p=>p.digit===Number(digit)).map(p=>p.slot),
      element:FIVE_ELEMENT_LIBRARY.elements.find(e=>e.digits.includes(Number(digit)))?.label
    }))
    .sort((a,b)=>b.count-a.count||a.digit-b.digit);
  const rows=FIVE_ELEMENT_LIBRARY.elements.map(e=>({
    ...e,count:points.filter(p=>e.digits.includes(p.digit)).length,
    slots:points.filter(p=>e.digits.includes(p.digit)).map(p=>p.slot),
    digits:points.filter(p=>e.digits.includes(p.digit)).map(p=>p.digit)
  }));
  const maxCount=Math.max(...rows.map(e=>e.count));
  return {
    year:Number(snapshot.year),points,frequencies,repeatDigits,rows,
    mostFrequentElements:rows.filter(r=>r.count===maxCount).map(r=>r.label),
    positionCount:6,diagnostic:false,healthRisk:null,
    note:FIVE_ELEMENT_LIBRARY.meta.healthBoundary
  };
}

export function renderAnnualFiveElementPanel(snapshot,childMode=false){
  const data=calculateAnnualFiveElementDistribution(snapshot);
  if(!data)return '<section class="foundation-block"><h3>流年五行｜需要有效的年度数字盘</h3></section>';
  const meta=FIVE_ELEMENT_LIBRARY.meta;
  const positions=data.points.map(p=>p.slot+'='+p.digit).join(' · ');
  const repeats=data.repeatDigits.length
    ?data.repeatDigits.map(x=>'<li>'+x.digit+'号（'+x.element+'）在 '+x.slots.join('、')+' 位出现 '+x.count+'次</li>').join('')
    :'<li>这六个位置没有相同号码重复2次以上。</li>';
  const grid=data.rows.map(x=>
    '<tr><th style="padding:8px;border-bottom:1px solid #e1d8c9">'+htmlEscape(x.label)+'（'+htmlEscape(FIVE_ELEMENT_LIBRARY.elements.find(e=>e.key===x.key).digits.join('、'))+'）</th>'
    +'<td style="padding:8px;border-bottom:1px solid #e1d8c9;text-align:center">'+x.count+'</td>'
    +'<td style="padding:8px;border-bottom:1px solid #e1d8c9">'+htmlEscape(x.slots.join('、')||'—')+'</td></tr>').join('');
  const talk=childMode
    ?'“这只是该年度数字盘六个位置的课程归类，不表示孩子在这年会生病。我们先看孩子实际的睡眠、饮食、学校压力和活动情况。有长期不舒服的地方，就找医生评估。”'
    :'“我先看你这一年流年盘的 M、N、O、P、Q、R 六个位子，哪些号码出现得多，属于哪种五行。这是教材提供的生活关怀提示，不代表身体必然出问题。你这一年实际的作息、压力或健康习惯，有没有特别想改善的地方？”';
  return '<section class="foundation-block annual-five-element-panel">'
    +'<div class="card-heading"><div><small>ANNUAL WUXING · M N O P Q R</small><h3>流年五行｜六个关键位置</h3></div><span>'+data.year+'流年</span></div>'
    +'<div class="formula-note"><b>本年度六个位置：</b>'+htmlEscape(positions)+'<br><b>对应规则：</b>'+htmlEscape(meta.formula)+'<br><b>统计：</b>'+htmlEscape(meta.scope)+'</div>'
    +'<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;text-align:left">'
    +'<thead><tr><th style="padding:8px">五行／号码</th><th style="padding:8px">次数</th><th style="padding:8px">所在位置</th></tr></thead>'
    +'<tbody>'+grid+'</tbody></table></div>'
    +'<div class="formula-note"><b>出现次数最多的五行：</b>'+htmlEscape(data.mostFrequentElements.join('、'))+'（仅描述六个位中的数量，不是旺弱或健康风险等级）</div>'
    +'<div class="question-box"><b>重复号码｜教材提醒：</b><ul>'+repeats+'</ul><small>'+htmlEscape(meta.repeatRule)+'</small></div>'
    +'<div class="question-box"><b>Josephine白话：</b>'+htmlEscape(talk)+'</div>'
    +'<div class="formula-note"><b>使用边界：</b>'+htmlEscape(meta.healthBoundary)+'</div>'
    +'</section>';
}
