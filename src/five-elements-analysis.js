// AURMOVA 黄金流年五行「位置 × 同号 × 五行 × 生活核对」分析层。
// 所有叙述是传统数字学课程的探索语言，不是疾病风险测算。
import { FIVE_ELEMENT_LIBRARY,calculateAnnualFiveElementDistribution } from "./five-elements.js?v=2";

export const WUXING_ELEMENT_ANALYSIS = {
 metal:{
  title:"金｜责任、界线与生活节奏",
  adult:"可以核对今年有没有把责任揽得太多，是否能安排好做事节奏与休息。",
  child:"先观察孩子在规则、做事和休息之间是否有适龄的安排。",
  tradition:"原始课程把金与肺、皮肤、大肠等主题联系；不是器官异常的依据。",
  askAdult:"最近有什么责任让你觉得压力特别大？休息够吗？",
  askChild:"孩子最近在学校或家庭要求中，哪里最容易累或紧绷？",
  actionAdult:"从实际压力和作息找一个可调整的步骤；有持续身体不适请就医。",
  actionChild:"根据孩子实际作息和体力调整要求，有真实症状再由医生评估。"
 },
 water:{
  title:"水｜感受、担忧与恢复空间",
  adult:"可以谈情绪需要、担忧及人际相处时的恢复空间。",
  child:"可以观察孩子对朋友、家庭或陌生环境的感受与适应。",
  tradition:"原始课程把水与肾、膀胱等主题联系；不能凭数字判断泌尿健康。",
  askAdult:"最近哪些事会让你反复担心？你平常怎样恢复精神？",
  askChild:"孩子碰到不安的事情时，会主动说出来还是自己忍着？",
  actionAdult:"先核对现实压力、睡眠与生活习惯，身体症状应寻求医学评估。",
  actionChild:"给孩子安全表达的空间；出现持续不适按实际症状求医。"
 },
 fire:{
  title:"火｜行动、表达与节奏平衡",
  adult:"可以核对目标推进、工作活动量和有没有因忙碌而忽略恢复。",
  child:"可以核对孩子在表达、活动、表现期待与休息之间的平衡。",
  tradition:"原始课程把火与心脏、血液循环相关联；这不是心血管风险检查。",
  askAdult:"近期工作或家庭事务有没有让你一直赶时间、休息不够？",
  askChild:"最近孩子的学习活动量和休息时间是否合适？",
  actionAdult:"安排适合自己的休息与活动，真实健康困扰请咨询医生。",
  actionChild:"按年龄与精神状态安排活动，不根据数字预测疾病。"
 },
 wood:{
  title:"木｜成长、坚持与调适",
  adult:"可以讨论目标、遇到阻碍时会不会过度用力、如何调整方法。",
  child:"可以讨论学习挫折、兴趣培养、身体活动与适应能力。",
  tradition:"原始课程把木与眼睛、筋骨、肝胆联系；数字不是器官检测。",
  askAdult:"你今年有什么事情一直努力却不太顺？有尝试改变方法吗？",
  askChild:"孩子学习或活动遇到挫折时，通常怎么寻求帮助？",
  actionAdult:"调整现实负荷；眼睛或身体持续不适时按症状就医。",
  actionChild:"允许孩子适龄尝试并获得支持，有持续症状先看医生。"
 },
 earth:{
  title:"土｜日常规律与自我照顾",
  adult:"可以讨论饮食作息、生活安排、稳定感和习惯的持续性。",
  child:"可以观察吃饭、睡眠和家庭日常规律是否适合孩子。",
  tradition:"原始课程把土与脾胃、腹部、消化联系；五行不是疾病指标。",
  askAdult:"最近哪项生活习惯最想调整：饮食、睡眠、活动还是时间安排？",
  askChild:"孩子最近在饮食和睡眠作息方面，有没有真实变化？",
  actionAdult:"先做一个可执行的作息改变；持续不适由医生判断。",
  actionChild:"从孩子的真实需要调整规律；有不适时按症状就医。"
 }
};

export const WUXING_DIGIT_ANALYSIS = {
 1:{title:"自主与决定",adult:"希望掌握决定权",child:"更想自己动手、自己选",watch:"太坚持导致难接受协助",questionAdult:"最近哪件事你最想自己做主？",questionChild:"孩子最近有没有更想自己决定的事情？"},
 2:{title:"关系与感受",adult:"在意关系中的理解与尊重",child:"较关注朋友和大人的回应",watch:"顾虑他人而不敢说需要",questionAdult:"最近关系里有什么让你不敢说出口？",questionChild:"孩子遇到同伴误会时会怎样做？"},
 3:{title:"表达与创意",adult:"想分享想法、尝试新表达",child:"喜欢分享、创作或表现",watch:"想法多却难落地",questionAdult:"最近最想表达或完成的事是什么？",questionChild:"最近孩子最喜欢用什么方式表达自己？"},
 4:{title:"规律与计划",adult:"倾向建立步骤与秩序",child:"需要明确规则与安排",watch:"过于紧绷、对变化缺乏弹性",questionAdult:"今年什么计划让你最认真也最累？",questionChild:"孩子遇到计划改变时通常怎样回应？"},
 5:{title:"探索与变化",adult:"希望保留自由、想改变方法",child:"对新事物好奇、想尝试",watch:"频繁转换而不容易收尾",questionAdult:"最近你最想改变什么？",questionChild:"孩子最近特别想尝试什么新活动？"},
 6:{title:"照顾与责任",adult:"重视照顾他人与承担责任",child:"很想把事情做好、不让人失望",watch:"过度付出、忽略自己",questionAdult:"最近有什么责任其实可以分担？",questionChild:"孩子有没有因为怕让人失望而压力很大？"},
 7:{title:"思考与沉淀",adult:"想钻研和理解事情根源",child:"需要思考、消化与独处时间",watch:"一直想却难行动",questionAdult:"你最近有没有想了很久却没开始的事？",questionChild:"孩子遇事喜欢先想，还是找大人讨论？"},
 8:{title:"目标与成果",adult:"很在意执行、成果和达标",child:"在意进步、成绩或被认可",watch:"把成果压力放得太重",questionAdult:"近期有没有对自己要求特别高的事情？",questionChild:"孩子最近会不会过于在意输赢或分数？"},
 9:{title:"关怀与总结",adult:"关心意义、关系与阶段收尾",child:"在意转换、告别或别人的感受",watch:"太理想化、舍不得放手",questionAdult:"最近有什么事你想好好结束或调整？",questionChild:"孩子最近有没有一件舍不得或难适应的变化？"}
};

export const WUXING_POSITION_ROLES = {
 M:"MNO因果起点／MOQ过程起点",
 N:"MNO因果中位／NOP过程起点",
 O:"MNO因果结果／年度主题O位／两过程组连接",
 P:"NOP过程结果／PQR结果组起点",
 Q:"MOQ过程结果／PQR结果组中位",
 R:"PQR最终结果位"
};
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export function analyzeAnnualFiveElements(snapshot,childMode=false){
 const base=calculateAnnualFiveElementDistribution(snapshot);
 if(!base)return null;
 const covered=base.rows.filter(r=>r.count>0).map(r=>({...r,guide:WUXING_ELEMENT_ANALYSIS[r.key]}))
   .sort((a,b)=>b.count-a.count||FIVE_ELEMENT_LIBRARY.elements.findIndex(e=>e.key===a.key)-FIVE_ELEMENT_LIBRARY.elements.findIndex(e=>e.key===b.key));
 const highlighted=covered.filter(r=>r.count>=2).slice(0,3);
 const duplicates=base.repeatDigits.map(r=>{
   const g=WUXING_DIGIT_ANALYSIS[r.digit];
   const cross=r.slots.some(s=>"MNO".includes(s))&&r.slots.some(s=>"PQR".includes(s));
   return {...r,guide:g,cross,roleNotes:r.slots.map(s=>s+"："+WUXING_POSITION_ROLES[s]),
     question:childMode?g.questionChild:g.questionAdult,
     description:childMode?g.child:g.adult,
     connection:cross
       ?"这个主题从MNO因果段延伸到PQR结果段，可以核对「起初怎么决定」与「最后怎么行动」之间的联系。"
       :"这个主题在同一段结构中重复，可观察是否反复使用相似的处理方式。"};
 });
 const byElement=highlighted.map(r=>r.label+" "+r.count+"次").join("、");
 const byDigit=duplicates.map(r=>r.digit+"号在"+r.slots.join("和")+"位重复"+r.count+"次").join("；");
 const mno=base.points.slice(0,3).map(p=>p.digit).join("");
 const pqr=base.points.slice(3).map(p=>p.digit).join("");
 const speech=childMode
  ?"“这位孩子"+base.year+"年的MNO是"+mno+"，PQR是"+pqr+"；五行出现较多的是"+(byElement||"没有特别集中")+"；"+(byDigit||"没有号码重复")+"。我们不会据此预测健康，先请家长分享今年在家里、学校和作息上真实发生的事。”"
  :"“你的"+base.year+"流年MNO是"+mno+"，PQR是"+pqr+"；出现较多的五行是"+(byElement||"没有特别集中")+"；"+(byDigit||"没有号码重复")+"。我们会从这些数字对应的课程主题里挑重点，跟你今年的真实经历核对，不会直接说你哪一年身体一定有问题。”";
 return {...base,covered,highlighted,duplicates,mno,pqr,speech,
   focusText:byElement||"五行没有明显集中",
   repeatText:byDigit||"无同号重复",healthRisk:null,diagnostic:false};
}

export function renderAnnualFiveElementAnalysis(snapshot,childMode=false){
 const data=analyzeAnnualFiveElements(snapshot,childMode);
 if(!data)return '<section class="foundation-block"><h3>流年五行深入分析｜需要有效流年盘</h3></section>';
 const rowHtml=data.rows.map(r=>'<tr><th style="padding:7px">'+esc(r.label)+'（'+esc(FIVE_ELEMENT_LIBRARY.elements.find(e=>e.key===r.key).digits.join("、"))+'）</th><td>'+r.count+'</td><td>'+esc(r.slots.join("、")||"—")+'</td></tr>').join("");
 const elementHtml=data.highlighted.length?data.highlighted.map(r=>{
   const g=r.guide;
   const sameDigits=r.digits.some(d=>data.frequencies[d]>=2);
   return '<article class="card reading-card"><h4>'+esc(g.title)+' · '+r.count+'次</h4>'
    +'<p><b>本年对应位置：</b>'+esc(r.slots.map((s,i)=>s+"="+r.digits[i]).join("、"))+'</p>'
    +'<p><b>数量判断：</b>'+esc(r.count>=3?"六个位中此五行相对集中":"六个位中此五行出现较多")
    +'；'+esc(sameDigits?"其中存在相同号码重复，下方另有位置解读。":"此处为同五行数量累计，不能当成同号码重复。")+'</p>'
    +'<p><b>课程传统身体对应：</b>'+esc(g.tradition)+'</p>'
    +'<p><b>可以讨论的生活主题：</b>'+esc(childMode?g.child:g.adult)+'</p>'
    +'<div class="question-box"><b>Josephine追问：</b>“'+esc(childMode?g.askChild:g.askAdult)+'”</div>'
    +'<p><b>实际引导：</b>'+esc(childMode?g.actionChild:g.actionAdult)+'</p></article>';
 }).join(""):'<div class="formula-note">五行没有一项在六个位中出现至少两次，不要勉强贴出重点。</div>';
 const duplicateHtml=data.duplicates.length?data.duplicates.map(r=>
  '<article class="card reading-card"><h4>'+r.digit+'号（'+esc(r.element)+'）重复 '+r.count+'次</h4>'
  +'<p><b>重复位置：</b>'+esc(r.slots.join("、"))+'</p>'
  +'<p><b>位置功能：</b>'+esc(r.roleNotes.join("；"))+'</p>'
  +'<p><b>跨位置观察：</b>'+esc(r.connection)+'</p>'
  +'<p><b>数字主题：</b>'+esc(r.guide.title)+'。可能表现为'+esc(r.description)+'；过度时可讨论'+esc(r.guide.watch)+'。</p>'
  +'<div class="question-box"><b>针对这个号码追问：</b>“'+esc(r.question)+'”</div>'
  +'<p><b>解释边界：</b>相同号码出现次数不等于健康危险程度。</p></article>').join("")
  :'<div class="formula-note">六位中没有同号码出现2次以上；五行次数较多也不等于同号重复。</div>';
 const reply=childMode
  ?"若家长说「有」，请举最近一次具体例子；说「没有」就先放下这项，不让数字压过孩子真实表现。"
  :"若顾客说「有」，先问事情发生的时间、场景、影响和尝试过的解决方式；说「没有」则记录反例，不强迫他认同数字。";
 return '<section class="foundation-block annual-five-element-analysis">'
  +'<div class="card-heading"><div><small>WUXING · YEARLY CONSULTATION</small><h3>流年五行｜综合分析、白话与追问</h3></div><span>'+data.year+'流年</span></div>'
  +'<div class="formula-note"><b>六个位置：</b>'+esc(data.points.map(p=>p.slot+"="+p.digit).join(" · "))
  +'<br><b>结构：</b>MNO '+esc(data.mno)+'（因果）→ MOQ／NOP（过程）→ PQR '+esc(data.pqr)+'（结果）</div>'
  +'<div style="overflow-x:auto"><table style="width:100%;text-align:left;border-collapse:collapse"><thead><tr><th>五行／数字</th><th>次数</th><th>位置</th></tr></thead><tbody>'+rowHtml+'</tbody></table></div>'
  +'<div class="formula-note"><b>本年统计重点：</b>'+esc(data.focusText)+'。<b>重复号码：</b>'+esc(data.repeatText)+'。</div>'
  +'<div class="card-heading"><div><h4>① 五行集中主题｜重点白话分析</h4></div></div>'
  +'<div class="reading-grid">'+elementHtml+'</div>'
  +'<div class="card-heading"><div><h4>② 重复数字｜位置之间如何相互影响</h4></div></div>'
  +'<div class="reading-grid">'+duplicateHtml+'</div>'
  +'<div class="question-box"><b>③ Josephine完整咨询白话：</b><p>'+esc(data.speech)+'</p></div>'
  +'<div class="question-box"><b>④ 顾客回答「有／没有／不确定」：</b><p>'+esc(reply)+'</p><p>若不确定，可先观察具体经历；不要用其他号码硬解释到符合为止。</p></div>'
  +'<div class="formula-note"><b>专业边界：</b>'+esc(FIVE_ELEMENT_LIBRARY.meta.healthBoundary)
  +' 原始课程器官关联仅属于传统讲义，无法反映任何年份实际的疾病或事故概率。</div>'
  +'</section>';
}
