// AURMOVA 私人教学｜合作密码（性格磁场）
// 原书参考：用户上传《最实用的数字性格分析学》第241页及相邻续页。
// 这是以两人的「生命数」相加得出的独立合成数字，绝不是此前45组主性格O位配对。
// 原文说明排除夫妻。本工具限定伙伴、朋友、亲子三种用途；夫妻／情侣不会自动生成。
// 传统数字心理学没有经过科学验证，不可作为经济、关系或命运预测。
import { calculateHighPeakProfile } from "./engine/blueprint.js?v=54";

export const COOP_MAGNETIC_META=Object.freeze({
 source:"《最实用的数字性格分析学》合作密码（性格磁场），用户照片第241页及紧接续页",
 formula:"两人各自生日八位数字逐位求和，分别得到生命数（可记录原始合数如33/6、31/4）；再将两个生命数相加并化简至1–9，如6＋4＝10→1。",
 difference:"45组结合／合作配对采用各自主性格O位，仅描述两人相处特点；本模块采用两人生命数合成一个新的课程磁场数字。两者互不替代。特别是2000年出生者，主性格O位可能受AURMOVA自定义年份规则影响，与生命数不同。",
 scope:"原书写明“除夫妻以外关系”，例如亲子、朋友和合作伙伴；夫妻／情侣不会自动应用此公式。对多个合作伙伴逐人计算，不擅自计算没有明确规则的三人合成。",
 agency:"所有结果为课程中的隐喻，不是科学的人格测量，也不能证明合财、盈利、合作成功或压力必然发生。重大合作须核对真实经历、明确财务、职责及双方同意。",
 active:[1,3,5,7,9],passive:[2,4,6,8],
 activityExplanation:"原书把1、3、5、7、9称为主动性格，把2、4、6、8称为被动性格。此为教材自己的学习分类，不表示个人必然积极、被动或能力高低。"
});

export const COOP_MAGNETIC_GUIDES=Object.freeze({
 1:{
  title:"创意与独立探索",page:"241",
  sourceMeaning:"原书讲双方可以产生许多新点子、尝试新做法，也保留各自独立性；不等于一定赚到钱。",
  possibleStrength:"你们可能很快想出新的合作方向，彼此保留独立发挥的空间。",
  friction:"点子多，未必有人负责验证市场和完成交付；两人各做各的也可能出现目标不一致。",
  advice:"共同选定一个最值得试的小项目，写好期限、预算、交付负责人与检验结果的标准。",
  questions:["你们最近提出了哪些新点子？最后有多少真的做成？","当双方都有主意时，如何决定优先顺序和各自负责哪部分？"],
  script:"“这个合作磁场在课程里叫1。可以把它看成两个人放在一起，比较容易打开新方向、提出不一样的做法，也可能保留彼此的独立空间。可是创意和真正赚钱是两回事，我不会直接说你们一定有财运。我们先看看你们最近共同提出什么点子，哪一个已经实际执行。如果还没有，就挑一个小范围测试，再分清谁负责推进。”",
  action:"本周选一个想法，写下责任分工与7天试验计划。"
 },
 2:{
  title:"沟通与讨论",page:"241",
  sourceMeaning:"原书讲两人在一起话题很多，容易讨论，却可能讲多做少。",
  possibleStrength:"双方容易分享信息，交换立场与建立沟通气氛。",
  friction:"若每件事都讨论，却没有结论、负责人或截止日，就可能反复绕圈。",
  advice:"为讨论设时间限制，会议结束只确定一个优先事项、一个负责人和下次检查日期。",
  questions:["你们是不是常常聊得很投入，后来却没有实际行动？","谁负责把谈好的事记录下来、提醒跟进？"],
  script:"“合成2在课程里比较强调沟通。你们在一起可能会有很多话题，也容易交换想法。重点不是话多不好，而是讨论完有没有人整理结论。我们可以把你们最近一件一直在谈的事情拿出来，看现在卡在哪里；也许不需要再讨论十次，只需要有人把第一步做出来。”",
  action:"把最近一次讨论整理成三行：决定、负责人、完成日期。"
 },
 3:{
  title:"行动与即时推进",page:"241",
  sourceMeaning:"原书讲两人在一起容易冲动，有想法时行动很快。",
  possibleStrength:"团队执行速度可能快，遇到机会愿意马上尝试。",
  friction:"速度一快，容易跳过风险、预算或他人意见，造成返工。",
  advice:"保留推进速度，但重大决定前增加一个简短核对：目标、成本、风险与退出办法。",
  questions:["有没有哪件事你们很快决定，后来才发现漏看细节？","怎样做才能既保持行动力，也让双方放心？"],
  script:"“课程把合成3描述成行动力很快的磁场。这个意思不是你们注定冲动，而是提醒：当两个人都觉得这个点子不错时，可能很快就去做。速度有优势，但如果没有检查预算、步骤和责任，反而容易需要重做。我们可以一起约好一个简单检查表，保证快的时候也不乱。”",
  action:"下一次执行前先共同确认四项：目标、预算、风险、负责人。"
 },
 4:{
  title:"计划与安全感",page:"241",
  sourceMeaning:"原书讲两人倾向共同安排战略、做计划并寻找安全感。",
  possibleStrength:"适合把方向拆成计划和稳妥的执行步骤，彼此看重可预见性。",
  friction:"可能花太多时间求稳，让有时效的机会被拖延。",
  advice:"保留计划与预算，但明确何时从计划转为试行，允许低风险调整。",
  questions:["计划做得很细以后，谁会真正先开始？","如果出现新机会，怎样决定哪些规则可调整？"],
  script:"“合成4在原书里很重视计划和安全感。你们可能会把事情安排得比较仔细，做决定前希望看到实际步骤。这是有价值的，只是如果一直等到百分之百确定，很多事可能永远不会开始。所以今年做合作时，可以把计划分成必须守住的底线和允许尝试的小部分。这样稳，也不会停住。”",
  action:"列出三条重要底线，为一个小项目订实际启动日期。"
 },
 5:{
  title:"杂事与方向分散",page:"紧接第241页的续页",
  sourceMeaning:"原书提醒阻碍与杂务可能较多，让两人分散方向。",
  possibleStrength:"可以训练团队在变化与杂务中识别真正重要的事情。",
  friction:"临时问题不断、资源被小事切碎，可能忘记最初目标。",
  advice:"把任务分成必须处理、可以委派和可以暂缓三类，每周只守住一个优先结果。",
  questions:["最近耗掉你们最多精力的三件杂事是什么？","如果只能留下一个目标，这个月最想完成哪件事？"],
  script:"“课程把合成5描述为杂事和阻碍比较容易分散方向。但这不是预言你们一定倒霉。我会先看看你们现实里是不是真的经常被不同的人和事情打断。如果有，我们需要的不是担心数字，而是把优先事项整理清楚：什么非做不可，什么可以交给别人，什么暂时不用管。”",
  action:"删减一件非必要杂务，并给最重要目标预留两小时。"
 },
 6:{
  title:"合财与资源协作",page:"紧接第241页的续页",
  sourceMeaning:"原书简写为「合财，能见钱」；属于该课程对资源合作的象征说法，不是盈利保证。",
  possibleStrength:"可借此讨论双方怎样带来不同的资源、客户、服务或成本优势。",
  friction:"若没有明确出资、定价、分账和财务纪录，口头讲的合财容易变成金钱纠纷。",
  advice:"先核对资源贡献、书面协议、现金流、费用分担和退出条款，再评估合作可行性。",
  questions:["各自实际带来什么资源？收入、成本、利润怎样分别计算？","有无书面分账约定？出现亏损又由谁承担？"],
  script:"“合成6在这本教材里叫合财、能见钱。但我不会因此说你们合作一定赚钱。它更适合提醒我们谈清楚资源怎样互补：一个带来客户，一个负责交付，还是双方共同承担资金？真正要确认的是定价、成本、分成和合同。只有这些现实条件清楚，合作才比较容易长久。”",
  action:"共同列一份真实的成本／收入／分账草案，再咨询适当专业人士。"
 },
 7:{
  title:"人脉与连接",page:"紧接第241页的续页",
  sourceMeaning:"原书说「人脉倍增」，着重两人网络与外部连接的概念。",
  possibleStrength:"双方可能接触到不同圈层，可介绍资源、行业信息或有价值的合作。",
  friction:"人多不等于有效资源；若随便承诺、转介绍不核实，可能损害信任。",
  advice:"明确介绍条件和双方同意，记录真实的联系结果，避免泄露客户资料。",
  questions:["你们两人的网络有什么不同？是否有真正互相帮助过的例子？","介绍朋友或客户之前，有没有先征得当事人同意？"],
  script:"“合成7在原书里讲人脉倍增。我们可以把它当成合作时关注资源连接的一个提醒，而不是说一定有人来帮你们。你们可以看看双方实际认识什么人、有哪些专业能力或信息能共享。介绍客户和朋友也要有同意和界线，不能为了所谓贵人运就随便交换人家的资料。”",
  action:"各自整理三项可分享的专业资源，挑一项经同意尝试连接。"
 },
 8:{
  title:"平台扩大与压力",page:"紧接第241页的续页",
  sourceMeaning:"原书说平台可能做大，但其中一方会有压力；不是规模扩大必然成功。",
  possibleStrength:"适合讨论增长、管理职责、组织规模和资源调配。",
  friction:"当成长目标超过人力与资金，一人容易过度承担甚至被另一个人的期待压住。",
  advice:"在扩大前约定规模上限、职责、收益和工作量，定期确认每个人能否承受。",
  questions:["如果业务量翻倍，谁最容易先累倒？","增长带来的责任与收益，是否双方都清楚和同意？"],
  script:"“合成8在课程里讲平台可能做大，同时有人感到压力。我不会根据8号就告诉你们一定会做大，而会问：如果合作越来越忙，你们有没有足够的人手和资金，谁要为出错负责？一方压力过大时有没有权利暂停或重新分工？把这些安排好，才是让合作可以持续的方法。”",
  action:"做一次增长情境模拟，写出每位伙伴的工作量、风险和支持方案。"
 },
 9:{
  title:"灵感与共同目标",page:"紧接第241页的续页",
  sourceMeaning:"原书说两人在一起会激发很多想法，较容易取得成功；这不是现实成功率预测。",
  possibleStrength:"彼此可能激发较大的共同愿景，愿意一起想新的可能。",
  friction:"目标太远、讨论太多却缺少执行，容易消耗热情与预算。",
  advice:"将大愿景拆成一个可验证的小目标，约定可行性指标、预算和复盘时间。",
  questions:["你们共同最想达成什么目标？有没有一个真实例子证明它可行？","你们能不能讲出下个月第一件要完成的事？"],
  script:"“合成9在原书里说想法多、容易成功。但我不会用数字保证你们一定成功。更实际的解法是：当两个人都对某个未来很有期待，我们可以先把目标说清楚，再拆成这一个月做得到的小步骤。如果做出来的结果符合预期，再谈扩大。你们最希望先验证哪个共同想法？”",
  action:"把一个共同梦想改写成30天内可检验的目标和完成标准。"
 }
});
const htmlEscape=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const digits=number=>[...String(number)].map(Number);
const strictBirthday=raw=>{
 const text=String(raw??"").trim();
 let m=text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
 if(!m){const y=text.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);if(y)m=[null,y[3],y[2],y[1]];}
 if(!m)return false;
 const [d,mon,y]=m.slice(1).map(Number);
 if(y<1000||y>9999||mon<1||mon>12||d<1||d>31)return false;
 const date=new Date(Date.UTC(y,mon-1,d));
 return date.getUTCFullYear()===y&&date.getUTCMonth()===mon-1&&date.getUTCDate()===d;
};
export function calculateMagneticNumber(lifeA,lifeB){
 if(!Number.isInteger(lifeA)||!Number.isInteger(lifeB)||lifeA<1||lifeA>9||lifeB<1||lifeB>9)return null;
 const sum=lifeA+lifeB,steps=[sum];let number=sum;
 while(number>9){number=digits(number).reduce((a,b)=>a+b,0);steps.push(number);}
 return {a:lifeA,b:lifeB,sum,steps,number,formula:lifeA+"＋"+lifeB+"＝"+(sum===number?String(number):sum+"→"+number)};
}
export function prepareCooperationMagneticField(birthdayA,birthdayB,kind="cooperation",ctx={}){
 if(!["cooperation","friendship","parentChild"].includes(kind))return null;
 if(!strictBirthday(birthdayA)||!strictBirthday(birthdayB))return null;
 const a=calculateHighPeakProfile(birthdayA),b=calculateHighPeakProfile(birthdayB);
 if(!a?.life||!b?.life)return null;
 const numberInfo=calculateMagneticNumber(a.life.number,b.life.number);
 if(!numberInfo)return null;
 return {
  aName:String(ctx.aName||"当事人").trim()||"当事人",
  bName:String(ctx.bName||"另一方").trim()||"另一方",
  kind,numberInfo,guide:COOP_MAGNETIC_GUIDES[numberInfo.number],
  lifeA:a.life,lifeB:b.life,
  isSameAsMainPersonality:ctx.mainA==null||ctx.mainB==null?null:
    Number(ctx.mainA)===a.life.number&&Number(ctx.mainB)===b.life.number,
  mainA:ctx.mainA,mainB:ctx.mainB
 };
}
export function renderCooperationMagneticField(birthdayA,birthdayB,kind="cooperation",ctx={}){
 const p=prepareCooperationMagneticField(birthdayA,birthdayB,kind,ctx);if(!p)return "";
 const g=p.guide,e=htmlEscape,n=p.numberInfo;
 const label=kind==="cooperation"?"合作伙伴":kind==="friendship"?"朋友关系":"亲子互动";
 const collapsed=ctx.collapsed?"":" open";
 const scripts=kind==="parentChild"
   ?"亲子版提醒：这里的生活建议只用来讨论共同想法、日常沟通与责任安排，不把财务或事业术语套在孩子身上。请以真实年龄和家庭情况为准；不要说孩子会给父母带财或造成亏损。"
   :kind==="friendship"
     ?"朋友版提醒：重点看沟通、共同活动、空间界线及是否互相尊重；不要把商业盈利解读套在友情上。"
     :"合作版提醒：进一步核对项目、合同、出资、角色分工、金钱往来和双方退出安排。";
 const sumFormula=n.formula;
 const aSource=p.lifeA.raw+"/"+p.lifeA.number,bSource=p.lifeB.raw+"/"+p.lifeB.number;
 const questionHtml=g.questions.map(q=>"<li>"+e(q)+"</li>").join("");
 const warn=p.isSameAsMainPersonality===false
   ?"<div class=\"formula-note\"><b>数字来源差异：</b>其中一人的生命数与主性格O不同，本模块严格使用生命数；既有45组主性格配对仍按O位计算，不能互相覆盖。</div>":"";
 return '<details class="foundation-block coop-magnetic-reading"'+collapsed+'>'
  +'<summary style="cursor:pointer;font-weight:700;padding:4px 0">性格磁场｜'+e(p.aName)+' × '+e(p.bName)+'｜合成'+n.number+'号 · '+e(g.title)+'</summary>'
  +'<div class="card-heading"><div><small>COOPERATION MAGNETIC FIELD · DIFFERENT FROM 45 PAIRS</small><h3>'+e(label)+'｜合作密码（性格磁场）'+n.number+'号</h3></div></div>'
  +'<div class="formula-note"><b>双方各自生命数：</b>'+e(p.aName)+' '+e(aSource)+'（路径'+e(p.lifeA.path.join("→"))+'）＋'+e(p.bName)+' '+e(bSource)+'（路径'+e(p.lifeB.path.join("→"))+'）。<br><b>合成公式：</b>'+e(sumFormula)+'。<br><b>与45组配对区别：</b>'+e(COOP_MAGNETIC_META.difference)+'</div>'
  +warn
  +'<article class="card reading-card"><h4>① 原书磁场含义（课堂转述）</h4><p>'+e(g.sourceMeaning)+'</p><small>原书参考：'+e(g.page)+'</small></article>'
  +'<article class="card reading-card"><h4>② 可能的合作／相处优势</h4><p>'+e(g.possibleStrength)+'</p></article>'
  +'<article class="card reading-card"><h4>③ 需要现实核对的摩擦</h4><p>'+e(g.friction)+'</p></article>'
  +'<article class="card reading-card"><h4>④ AURMOVA行动建议</h4><p>'+e(g.advice)+'</p><p><b>本周可做：</b>'+e(g.action)+'</p></article>'
  +'<div class="question-box"><b>⑤ Josephine可照读白话</b><p>'+e(g.script)+'</p><p>'+e(scripts)+'</p></div>'
  +'<div class="question-box"><b>⑥ 两人咨询追问</b><ul>'+questionHtml+'</ul><p><b>回答有：</b>请各自举一个真实场景，了解是否有协商空间。<b>回答没有：</b>不强行套用教材标签，继续核对实际情况。</p></div>'
  +'<div class="formula-note"><b>来源：</b>'+e(COOP_MAGNETIC_META.source)+'。<b>适用范围：</b>'+e(COOP_MAGNETIC_META.scope)+'<br><b>专业界线：</b>'+e(COOP_MAGNETIC_META.agency)+'</div>'
  +'</details>';
}
export function buildCooperationMagneticEntries(){
 const c="合作密码｜性格磁场";
 return [{category:c,title:"性格磁场公式｜生命数合成，与45组主性格配对不同",
   keywords:"合作磁场 性格磁场 生命数 33/6 31/4 合作密码 夫妻除外 亲子 朋友 伙伴",
   text:[COOP_MAGNETIC_META.source,COOP_MAGNETIC_META.formula,COOP_MAGNETIC_META.difference,
     COOP_MAGNETIC_META.scope,COOP_MAGNETIC_META.activityExplanation,COOP_MAGNETIC_META.agency].join("\n\n")},
 ...Object.entries(COOP_MAGNETIC_GUIDES).map(([k,g])=>({category:c,
   title:"合作磁场"+k+"号｜"+g.title,
   keywords:"合作磁场 性格磁场 合成数"+k+" 合作密码 "+g.title,
   text:["【教材摘要】"+g.sourceMeaning,"【优势】"+g.possibleStrength,"【需注意】"+g.friction,
      "【咨询白话】"+g.script,"【提问】"+g.questions.join("；"),"【行动】"+g.advice,"【本周练习】"+g.action,
      "【原书页】"+g.page,"【公式】"+COOP_MAGNETIC_META.formula,"【适用范围】"+COOP_MAGNETIC_META.scope,
      "【限制】"+COOP_MAGNETIC_META.agency].join("\n\n")}))];
}
