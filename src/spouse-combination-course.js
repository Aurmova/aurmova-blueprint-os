// AURMOVA 私人教学｜结合密码（夫妻密码）
// 用户上传《最实用的数字性格分析学》第242页及下一页「结合密码」。
// 独立于45组主性格O位配对、以及AURMOVA双方O位合作磁场。
// 严格保持原书夫妻算法：双方「生命数」相加化简，且只在手动选中“已婚夫妻”时使用。
// 教材中关于离婚率、破财、旺财、风水、寿命的陈述不是可验证的实际预测。
import { calculateHighPeakProfile } from "./engine/blueprint.js?v=54";

export const SPOUSE_COMBINATION_META=Object.freeze({
 title:"结合密码（夫妻密码）",
 source:"《最实用的数字性格分析学》「结合密码（夫妻密码）」第242页与紧接续页；依据Josephine上传照片整理",
 formula:"先由每位配偶出生日期八位数字逐位相加，化简得各自生命数；夫妻生命数相加后再化简1–9。原书示例丈夫29→11→2、妻子34→7，因此2＋7＝9。",
 scope:"只适用于明确选择「已婚夫妻」的关系蓝图。未婚情侣、一般家人、朋友及合作伙伴不会自动触发。",
 distinction:"夫妻结合密码严格按原书生命数相加；此前的AURMOVA合作磁场已另行确定按主性格O位相加，只用于伙伴、朋友、亲子；45组配对按两个人的O位查相处优势与摩擦。这是三套不同用途、不同算法的资料。",
 safeguarding:"夫妻是否相爱、是否离婚、是否怀孕、是否赚钱、谁有压力，都不能从数字推出。原书中的财运、离婚率、孩子气和家居风水说法只作为教材观点保留，不能当成事实、承诺或指责依据。",
 privacy:"此模块仅供Josephine私人后台顾客咨询，顾客端不自动显示计算或教材内容。"
});
export const SPOUSE_COMBINATION_GUIDES=Object.freeze({
 1:{
  title:"独立与共同方向",
  source:"原书说双方在家中较独立、各有能力，也可能两地生活；若天天黏在一起或经营夫妻档，易摩擦，宜设共同目标并区分工作与回家时间。",
  theme:"尊重彼此的自主性，同时把两个人共同要走的方向讲清楚。",
  strengths:"双方可以保留个人能力、空间与独立处理事情的节奏。",
  friction:"如果彼此都不愿意协调，或把工作中的指挥带回家庭，容易变成各管各的、互不理解。",
  action:"每人说出一个需要保留的个人空间，再决定一项共同目标；下班后为家庭留一段不谈工作的时间。",
  questions:["你们各自最需要保留的独立空间是什么？","当工作意见不一致时，你们会不会回家继续争论？"],
  script:"“夫妻结合1在教材里特别强调独立。可以理解为，两个人都有自己的想法和做事能力，未必什么都要绑在一起。这不是说你们一定要分居，也不是说夫妻不能一起做生意。我们要看的反而是：你们能不能尊重对方的空间，又能不能一起定下共同目标。如果合作工作让你们累了，也要给家庭留一段真正属于彼此的时间。”",
  week:"这周商量一个共同目标，约好一次不谈工作的相处时间。",
  unsupported:"原书的两地生活可能性、夫妻档不合适，不是针对个人的必然结论。"
 },
 2:{
  title:"沟通、斗嘴与情绪修复",
  source:"原书描写婚前话多亲密、婚后容易拌嘴，通常是生活琐事，并称感情仍好。",
  theme:"感情中的沟通很多，真正重要的是争执发生后能否好好修复。",
  strengths:"可以有很多分享、共同话题，愿意保持联系。",
  friction:"日常小事若总被用来批评或翻旧账，争论可能累积委屈。",
  action:"把一场斗嘴拆成事实、自己的感受与下一次希望怎么处理；双方轮流说，不抢着证明谁对。",
  questions:["你们争执最多的是哪些小事？","争论以后是谁先修复关系？你们的修复方式让双方都舒服吗？"],
  script:"“原书对夫妻结合2的形容很生活化，就是两个人可能有很多话可以聊，也容易为小事拌嘴。但不要把‘斗嘴不影响感情’当成一定正确，因为每个人对争吵的承受程度不一样。真正要看的是，吵完以后有没有互相理解、有没有同样的问题一直重复。我们可以先找出一件最常引发争执的小事，练习用更清楚的方式沟通。”",
  week:"选一件反复争论的小事，一起订一个双方都同意的处理方法。",
  unsupported:"婚前婚后的变化、争吵是否影响感情，要听双方真实经历，不能凭数字预设。"
 },
 3:{
  title:"浪漫、赞赏与相处节奏",
  source:"原书强调小幸福、浪漫、互相欣赏，也提到婚姻初期可能情绪起伏、冲动与争吵。",
  theme:"关系中保留情趣与赞赏，也学习在情绪上来时温和表达。",
  strengths:"容易找到共同乐趣，愿意表达欣赏、安排生活仪式感。",
  friction:"如果一方心情一来就说重话，另一方未必知道怎样回应。",
  action:"保留小小约会或互相赞赏的习惯；当情绪激动时先暂停，回到具体需求再沟通。",
  questions:["你们上一次真心赞美对方是什么时候？","如果突然生气，通常怎样做才能避免互相伤害？"],
  script:"“夫妻结合3在原书里比较有浪漫和生活情趣的味道。我们可以把它当成一个提醒：婚后也需要被欣赏、被认真对待，不是只有柴米油盐。但书里也提到情绪和冲动的问题，现实中我们不会说前三年或五年一定会吵架。重要的是，当两个人真的有情绪时，能不能暂停一下，再把想被理解的事情讲出来。”",
  week:"各自说出一件欣赏对方的事，安排一个轻松的共同活动。",
  unsupported:"教材所述婚前几年情绪起伏或孩子气，不是可验证的时间预测或人物定论。"
 },
 4:{
  title:"稳定、安全感与共同成长",
  source:"原书描述婚姻较平淡、稳定，强调双方成长步调要接近；也出现‘离婚率低’等未经证实的说法。",
  theme:"以稳定和承诺为基础，同时允许双方以各自速度成长。",
  strengths:"生活安排可能重视可靠、长期计划和双方共同承担。",
  friction:"若某一方发展很快、另一方感觉被落下，关系中的安全感可能受到挑战。",
  action:"谈谈各自未来一年的成长计划，订出能互相支持的方式；规律也要保留一些共同乐趣。",
  questions:["你们有没有觉得最近两个人成长速度不一样？","怎样做才能让双方都觉得被支持，而不是被比较？"],
  script:"“夫妻结合4在教材里比较强调稳定和安全感。但稳定不代表没有浪漫，也不能因为4号就说离婚率低。更值得讨论的是：你们有没有共同想守护的生活基础？当一个人成长得比较快，另一个人会不会觉得自己跟不上？这时不是要求谁停下来，而是找出彼此支持的方式，让双方都能继续成长。”",
  week:"安排一次两人的未来规划对话，互相分享一项学习或成长目标。",
  unsupported:"原书‘离婚率低’和床头摆书的建议不是可靠的离婚统计或婚姻改善手段。"
 },
 5:{
  title:"自在玩乐与工作界线",
  source:"原书说夫妻适合一起旅行、玩乐，但不建议合开夫妻店或常谈工作，并提到避免摆假花的传统说法。",
  theme:"维护轻松自在的夫妻生活，区分工作争论和感情相处。",
  strengths:"可以通过共同体验、新活动或旅行增进情感。",
  friction:"如果把夫妻关系变成全天候工作会议，彼此可能失去放松的空间。",
  action:"明确夫妻共同工作时的决策和分工规则，把工作讨论集中到指定时段；保留只谈生活的相处时间。",
  questions:["你们是在一起做事时比较容易争论，还是在休息时比较自在？","下班以后还会不会继续争当天工作的对错？"],
  script:"“原书把夫妻结合5讲得很鲜明，说适合一起玩，却不太适合夫妻档。我们不需要因此断定你们不能一起创业；现实中有很多夫妻合作得很好。可以把这段教材当成一个提醒：有没有把工作压力带进亲密关系？如果有，我们就练习给工作设时间、给家庭留空间。至于摆不摆假花，属于个人喜好，不会决定婚姻好坏。”",
  week:"约好一段无工作的共同休闲时间，同时订清楚一次工作议题的讨论时段。",
  unsupported:"不能以数字判断夫妻能否共同经商；假花不等于婚姻虚假繁荣。"
 },
 6:{
  title:"家庭资源、财务沟通与情绪成本",
  source:"原书以‘福’形容6，提到双方家族经济资源，以及争吵‘破财’、垃圾桶带盖等家居说法。",
  theme:"家庭可以一起讨论金钱、资源和责任，但情绪与财务都需要清楚管理。",
  strengths:"可借这组主题讨论双方愿不愿共同规划储蓄、日常支出与家庭支持。",
  friction:"金钱责任模糊或把吵架等同于经济失败，容易制造压力和指责。",
  action:"共同核对家庭预算、负债、储蓄及双方承担比例；争吵时暂停财务重大决定，等冷静后再谈。",
  questions:["你们家的收入、支出与储蓄，是一起了解还是只有一人知道？","谈钱时最常让你们吵架的，是数字本身还是被尊重的感觉？"],
  script:"“夫妻结合6在原书里用了‘福’和‘合财’的说法，但我不会告诉你们结婚就一定旺财，更不会说一吵架就会破财。比数字更重要的是，你们能不能一起谈清楚钱从哪里来、花到哪里去、谁负责什么。家庭财务如果有压力，我们可以从预算、透明度和沟通方式开始改善，而不是把问题归到垃圾桶或某个数字上。”",
  week:"一起核对家庭收入和固定支出，约定一次不带指责的财务沟通。",
  unsupported:"旺财、争吵必破财及垃圾桶决定财运均无可靠证据，不作为建议依据。"
 },
 7:{
  title:"双方家庭、人脉与边界",
  source:"原书以‘禄’形容7，认为夫妻可能促进家庭资源与人脉结合，并提醒争吵可能波及社交圈。",
  theme:"双方背景和人脉可以彼此支持，但要避免把家庭冲突变成朋友圈的压力。",
  strengths:"两个人可以学习对方的见闻、文化习惯和社交资源。",
  friction:"一方未经同意把争执透露给亲友，或让亲友选边站，可能削弱信任。",
  action:"事先讨论哪些事情只在夫妻之间谈、哪些可以寻求第三方支持；联系或介绍朋友前先得到同意。",
  questions:["两边家人的期待有没有影响你们的决定？","遇到争执时，你们怎样求助，才不会让亲友关系变得更紧张？"],
  script:"“夫妻结合7在教材里讲人脉和两边家庭的资源。我会把它当成讨论双方家庭关系的一个切入点，而不是说7号就能改变家运。比如遇到争执，你们会不会让父母或朋友也卷进来？如果想得到支持，可以找可靠又尊重双方的人帮忙，但不需要到处让人评理。我们可以一起想怎样保护夫妻沟通，也保护双方家人的关系。”",
  week:"谈清楚一条夫妻与双方家庭的界线，以及需要支持时向谁求助。",
  unsupported:"改变家运、吵架伤人脉属于课程象征，不能当作确定因果。"
 },
 8:{
  title:"关系中的压力与公平分工",
  source:"原书说夫妻结合8时可能出现一方压力比较大、另一方比较轻松。",
  theme:"看见关系中的压力分配，重新调整被忽视的劳动与责任。",
  strengths:"适合把家庭任务、育儿、赚钱和情绪支持的承担情况谈清楚。",
  friction:"如果一个人长期承担大多数责任却没有被理解，会积累疲惫与不满。",
  action:"列出有薪工作、家务、育儿和情绪照顾任务，各自标出最疲惫的一项，重新协商分担。",
  questions:["最近是谁觉得比较累？对方是否知道你承担了哪些看不见的事情？","哪一项家庭责任最需要重新分配？"],
  script:"“夫妻结合8的原书讲法是一个人比较有压力、另一个人比较轻松。我们不能单凭8号判定哪一个一定辛苦，而是先听你们现实生活的分工。可能有人负责赚钱，有人负责孩子、家务或照顾家人，每一种付出都值得被看见。如果真的觉得不公平，我们就把实际任务列出来，一起找可以调整的地方。”",
  week:"各自写下目前承担的五项任务，重新商量一项最耗力的分工。",
  unsupported:"数字不会指定哪位配偶必须辛苦，也不是婚姻不公平的客观证据。"
 },
 9:{
  title:"共同学习、愿景与亲密连接",
  source:"原书以‘寿’形容9，强调夫妻一起学习、聊天、事业与感情同步的理想，也包含‘财运兴旺’及‘成功’说法。",
  theme:"让共同目标、学习与相处质量彼此支持，而不是把关系只当成事业工具。",
  strengths:"可以通过共同学习、对话与未来计划增加理解和陪伴。",
  friction:"若把成功、财务或人生理想看得太重，可能忽视当下双方真实的情绪和需求。",
  action:"一起选一个想学习的主题、每周留一次不被打断的聊天时间，把共同愿景拆成可以验证的小目标。",
  questions:["你们最近有一起学习或认真聊天吗？","如果事业计划和感情需要发生冲突，你们会怎样决定优先顺序？"],
  script:"“夫妻结合9在原书里有‘寿’、共同学习和事业机会的说法。我们可以保留它想表达的美好方向：两个人愿意一起成长、聊天、为共同的未来努力。但9号不代表一定长寿、发财或婚姻美满。真正能够实践的，是彼此愿不愿意倾听、学习和尊重不同梦想。我们先看看最近哪一个共同计划最值得慢慢完成。”",
  week:"安排一次深度聊天，并选择一件双方都感兴趣的学习或小目标。",
  unsupported:"寿命、旺财、事业成功和婚姻质量无法由密码9预测。"
 }
});
const escapeText=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const digitSum=n=>String(n).split("").reduce((t,x)=>t+Number(x),0);
function validBirthday(value){
 const s=String(value||"").trim();
 let m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
 if(!m){
  const r=s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if(!r)return false;
  m=[null,r[3],r[2],r[1]];
 }
 const d=Number(m[1]),mon=Number(m[2]),y=Number(m[3]);
 if(y<1000||y>9999||mon<1||mon>12||d<1||d>31)return false;
 const date=new Date(Date.UTC(y,mon-1,d));
 return date.getUTCFullYear()===y&&date.getUTCMonth()===mon-1&&date.getUTCDate()===d;
}
export function calculateSpouseCombinationNumber(lifeA,lifeB){
 if(!Number.isInteger(lifeA)||!Number.isInteger(lifeB)||lifeA<1||lifeA>9||lifeB<1||lifeB>9)return null;
 const sum=lifeA+lifeB;let num=sum;const path=[sum];
 while(num>9){num=digitSum(num);path.push(num);}
 return {lifeA,lifeB,sum,number:num,path,formula:lifeA+"＋"+lifeB+"＝"+(sum===num?num:sum+"→"+num)};
}
export function prepareSpouseCombination(birthdayA,birthdayB,relationshipType,context={}){
 // 必须主动确认已婚，避免将夫妻公式套进情侣或一般家人。
 if(relationshipType!=="已婚夫妻"||!validBirthday(birthdayA)||!validBirthday(birthdayB))return null;
 const pa=calculateHighPeakProfile(birthdayA),pb=calculateHighPeakProfile(birthdayB);
 const lifeA=pa?.life,lifeB=pb?.life;
 if(!lifeA?.number||!lifeB?.number)return null;
 const combined=calculateSpouseCombinationNumber(lifeA.number,lifeB.number);
 if(!combined)return null;
 return {
  aName:String(context.aName||"当事人").trim()||"当事人",
  bName:String(context.bName||"配偶").trim()||"配偶",
  relationshipType,
  aLife:lifeA,bLife:lifeB,
  combined,
  guide:SPOUSE_COMBINATION_GUIDES[combined.number],
  calculationBasis:"life-number",
  source:"textbook-spouse"
 };
}
export function renderSpouseCombination(birthdayA,birthdayB,relationshipType,context={}){
 const p=prepareSpouseCombination(birthdayA,birthdayB,relationshipType,context);
 if(!p)return "";
 const e=escapeText,book=p.guide;
 const sourceA=p.aLife.raw+"→"+p.aLife.path.slice(1).join("→");
 const sourceB=p.bLife.raw+"→"+p.bLife.path.slice(1).join("→");
 const aPath=p.aLife.path.length>1?p.aLife.path.join("→"):String(p.aLife.number);
 const bPath=p.bLife.path.length>1?p.bLife.path.join("→"):String(p.bLife.number);
 const questions=book.questions.map(q=>"<li>"+e(q)+"</li>").join("");
 return '<section class="foundation-block spouse-combination">'
   +'<div class="card-heading"><div><small>SPOUSE COMBINATION · TEXTBOOK LIFE NUMBER</small><h3>夫妻结合密码 '+p.combined.number+'号｜'+e(book.title)+'</h3></div><span>私人咨询 · 已婚夫妻</span></div>'
   +'<div class="formula-note"><b>这套公式采用原书生命数，非主性格O位：</b><br>'
   +e(p.aName)+' 生命数 '+e(aPath)+'；'+e(p.bName)+' 生命数 '+e(bPath)
   +'。<br><b>夫妻结合：</b>'+e(p.combined.formula)+'。<br><b>与合作磁场和45组配对不同：</b>'+e(SPOUSE_COMBINATION_META.distinction)+'</div>'
   +'<article class="card reading-card"><h4>① 原书的夫妻结合主题｜课程转述</h4><p>'+e(book.source)+'</p></article>'
   +'<article class="card reading-card"><h4>② 放到现实生活，可能有什么帮助？</h4><p>'+e(book.theme)+'</p><p><b>可观察的互补：</b>'+e(book.strengths)+'</p></article>'
   +'<article class="card reading-card"><h4>③ 双方容易卡住的相处议题</h4><p>'+e(book.friction)+'</p></article>'
   +'<article class="card reading-card"><h4>④ 两个人可以怎么做？</h4><p>'+e(book.action)+'</p><p><b>本周可执行：</b>'+e(book.week)+'</p></article>'
   +'<div class="question-box"><b>⑤ Josephine可直接照读的夫妻咨询白话</b><p>'+e(book.script)+'</p></div>'
   +'<div class="question-box"><b>⑥ 实际追问夫妻双方</b><ul>'+questions+'</ul><p><b>如果双方认同：</b>请分别举一个具体生活例子，讨论可改变的行为与分工。<b>如果不认同：</b>不要硬套数字，直接以真实经历和双方需要为准。</p></div>'
   +'<div class="formula-note"><b>教材观点不等于事实预测：</b>'+e(book.unsupported)
   +'<br><b>原书来源：</b>'+e(SPOUSE_COMBINATION_META.source)
   +'<br><b>使用边界：</b>'+e(SPOUSE_COMBINATION_META.safeguarding)+'</div>'
   +'</section>';
}
export function buildSpouseCombinationEntries(){
 return [{
   category:"夫妻结合密码",
   title:"夫妻结合密码｜原书公式、来源与三套组合的区别",
   keywords:"夫妻结合密码 已婚夫妻 生命数 29/11/2 34/7 合作磁场 45组配对 配偶",
   text:[SPOUSE_COMBINATION_META.source,"【原书计算公式】"+SPOUSE_COMBINATION_META.formula,
     "【适用范围】"+SPOUSE_COMBINATION_META.scope,"【算法及用途区别】"+SPOUSE_COMBINATION_META.distinction,
     "【专业界线】"+SPOUSE_COMBINATION_META.safeguarding].join("\n\n")
 },...Object.entries(SPOUSE_COMBINATION_GUIDES).map(([n,book])=>({
   category:"夫妻结合密码",
   title:"夫妻结合密码"+n+"号｜"+book.title,
   keywords:"夫妻结合 夫妻密码 生命数"+n+"号 已婚夫妻 沟通 关系 家庭",
   text:["【原书观点·转述】"+book.source,"【AURMOVA咨询主题】"+book.theme,
     "【可能的优势】"+book.strengths,"【可能的摩擦】"+book.friction,
     "【两人可实践】"+book.action,"【可照读白话】"+book.script,
     "【向夫妻双方追问】"+book.questions.join("；"),"【一周练习】"+book.week,
     "【不可直接预测】"+book.unsupported,
     "【教材来源】"+SPOUSE_COMBINATION_META.source,"【计算方式】"+SPOUSE_COMBINATION_META.formula,
     "【专业界线】"+SPOUSE_COMBINATION_META.safeguarding].join("\n\n")
 }))];
}
