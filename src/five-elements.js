// AURMOVA｜数字五行教学映射。来源：Josephine 课程页15＋2026-10-02课程五行表。
// 此处统计现有数字盘位置出现次数，不属于八字五行或医学评估。
export const FIVE_ELEMENT_LIBRARY = Object.freeze({
  meta:{
    title:"五行数字分布｜金、水、火、木、土",
    source:"Josephine 原书第15页数字五行映射；2026-10-02五行课程资料。",
    formula:"金=1/6；水=2/7；火=3/8；木=4/9；土=5。",
    scope:"内三角7位 I/J/K/L/M/N/O，外圈9位 S/T/U/P/Q/R/V/W/X 分开统计；合计16位仅用于数量参考，不能当成五行定论。",
    limitation:"这不是八字五行，不使用生辰时刻、出生地或天干地支；也不凭任何数字预测疾病、交通意外或健康结果。五行之间的相生相克、旺弱喜忌、位置权重均尚未由教材规则核准，不自动推算。"
  },
  elements:[
    {key:"metal",label:"金",digits:[1,6]},
    {key:"water",label:"水",digits:[2,7]},
    {key:"fire",label:"火",digits:[3,8]},
    {key:"wood",label:"木",digits:[4,9]},
    {key:"earth",label:"土",digits:[5]}
  ]
});
const validDigit=x=>Number.isInteger(x)&&x>=1&&x<=9;
export function calculateFiveElementDistribution(blueprint){
  if(!blueprint||!Array.isArray(blueprint.innerTriangle)||!Array.isArray(blueprint.outerTriangle))return null;
  const inner=blueprint.innerTriangle.filter(validDigit),outer=blueprint.outerTriangle.filter(validDigit);
  if(inner.length!==7||outer.length!==9)return null;
  const counts=arr=>FIVE_ELEMENT_LIBRARY.elements.map(e=>
    ({...e,count:arr.filter(n=>e.digits.includes(n)).length}));
  const innerRows=counts(inner),outerRows=counts(outer);
  const rows=FIVE_ELEMENT_LIBRARY.elements.map((e,i)=>({
    ...e,inner:innerRows[i].count,outer:outerRows[i].count,total:innerRows[i].count+outerRows[i].count,
    innerDigits:inner.filter(n=>e.digits.includes(n)),
    outerDigits:outer.filter(n=>e.digits.includes(n))
  }));
  return {rows,innerCount:inner.length,outerCount:outer.length,totalCount:inner.length+outer.length,
    knownMethod:"Josephine 课程数字五行映射",diagnostic:false};
}
const esc=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
export function renderFiveElementPanel(blueprint,childMode=false){
  const result=calculateFiveElementDistribution(blueprint);
  if(!result)return '<section class="foundation-block"><h3>五行数字分布｜需要有效数字盘</h3></section>';
  const meta=FIVE_ELEMENT_LIBRARY.meta;
  const table=result.rows.map(r=>'<tr><th>'+r.label+'（'+r.digits.join('、')+'）</th>'
    +'<td>'+r.inner+'</td><td>'+r.outer+'</td><td>'+r.total+'</td></tr>').join('');
  const note=childMode
    ?'“这张表只是把孩子的数字盘按课程的五行对应归类。不会因为某个数字多或少，就判断孩子的健康或个性。我们还是以你实际看到的学习、情绪和生活表现为主。”'
    :'“这里先把你数字盘的金、水、火、木、土按课程表整理出来，看到的是数字出现次数，并不是五行命理诊断，也不代表你的身体会发生什么事情。”';
  return '<section class="foundation-block five-element-panel">'
    +'<div class="card-heading"><div><small>WUXING · NUMBER MAPPING</small><h3>五行数字分布｜课程版</h3></div><span>内7位／外9位</span></div>'
    +'<div class="formula-note"><b>课程映射：</b>'+esc(meta.formula)+'<br><b>计数规则：</b>'+esc(meta.scope)+'</div>'
    +'<div style="overflow-x:auto"><table class="five-element-table" style="width:100%;border-collapse:collapse;text-align:center">'
    +'<thead><tr><th>五行与号码</th><th>内7位</th><th>外9位</th><th>合计</th></tr></thead><tbody>'+table+'</tbody>'
    +'</table></div>'
    +'<div class="question-box"><b>Josephine白话：</b>'+esc(note)+'</div>'
    +'<div class="formula-note"><b>阅读边界：</b>'+esc(meta.limitation)+'</div>'
    +'</section>';
}
