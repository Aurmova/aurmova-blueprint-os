"use strict";
/* AURMOVA public-safe consultation UI demonstration.
   Only fixed fictional examples; no personal data, no network or storage. */
const STAGES=[
{
 title:"主性格与最自然的自己",
 theme:"从生活经历认识自己",
 say:"「今天我们先从你比较自然的做事方式开始。\n\n有的人遇到事情会先采取行动，有的人比较习惯观察，也有人会先想想别人是否需要配合。这些都不是好坏的判断。\n\n接下来我会提出一些生活中的观察方向，你可以直接告诉我哪些符合、哪些不符合。我们以你真实做过的事情为准，不需要勉强配合任何数字描述。」",
 question:"「最近一次遇到需要你作决定的事情，你是怎样开始处理的？」",
 example:"例如：临时收到工作要求、帮家人安排事情、计划新的课程。",
 yes:"「那我们先把这一点当作你的一个常见习惯。最近一次这样处理时，结果如何？它帮助了你什么，又有没有让你感到辛苦？」",
 partial:"「我们把不同场景分开。你在熟悉的人面前，和面对陌生人或工作任务时，会使用一样的方法吗？」",
 no:"「好的，这个观察先放下。你可以用自己的话描述，你遇到事情时比较自然的做法吗？」",
 unsure:"「不用急着判断。想一想最近七天有没有一件需要你决定的小事情，我们从那一次开始。」",
 action:"记录顾客真实提到的一项行为优势，不预先下结论。",
 transition:"我们先认识了日常表现，下一段再观察一件事情刚开始时，你通常如何行动。"
},
{
 title:"主性格 × 起始数",
 theme:"外在表现与开始行动的差别",
 say:"「一个人平时给别人的感觉，和第一次进入新环境时的表现，不一定完全相同。\n\n有人熟悉以后很健谈，刚开始却比较安静；有人看起来温柔，但面对新任务反而会主动安排。\n\n所以这一段，我们会把平常的表现和事情刚开始时的反应放在一起看。真正重要的不是套上哪一种标签，而是你在哪些情境下会切换做法。」",
 question:"「当你进入一个完全陌生的环境时，你通常先观察、先打招呼，还是先把事情安排好？」",
 example:"例如：第一次见新顾客、入职第一天、开始学习陌生技能。",
 yes:"「听起来你的开始方式确实有一个规律。进入环境以后，什么事情会让你变得更主动或更放松？」",
 partial:"「也许你对陌生人和熟悉的人不一样。我们分别找一个例子，看看差别发生在哪里。」",
 no:"「那我们不用沿用刚才的假设。你通常怎样判断自己该先行动，还是先观察呢？」",
 unsure:"「没关系。你回想最近一次第一次去某个地方，当时第一件做的事是什么？」",
 action:"区分初始反应和稳定后的表现，避免把两者混成同一种性格。",
 transition:"了解开始的方式后，我们再看你心里真正希望被满足的需要。"
},
{
 title:"内心码与真正的需要",
 theme:"理解稳定、空间与被回应的期待",
 say:"「有时候，我们看起来表现得很好，也很愿意配合，心里却可能有一些没有讲出来的需要。\n\n有些人希望事情安排清楚，有些人需要独处空间，有些人最在意的是对方有没有认真回应。\n\n内在需求需要通过你自己的感受来确认。我们不替你决定什么才叫安心，而是一起看看，什么样的相处与环境会让你比较舒服。」",
 question:"「当你觉得被理解、很安心的时候，身边的人通常做了什么？」",
 example:"例如：对方守约、愿意聆听、清楚分工、给你自己的空间。",
 yes:"「原来这样的回应对你很重要。那么当它没有出现时，你通常会直接提出需要，还是先放在心里？」",
 partial:"「你提到有时需要陪伴、有时需要空间。哪一种情况让你最想有人靠近？什么时候又需要自己安静？」",
 no:"「这项需要可能不是你的重点。你认为关系里真正能让你安心的事情是什么？」",
 unsure:"「我们换一种问法：最近一次让你感觉很舒适的相处经历，和让你感到很累的一次，有什么不同？」",
 action:"记录顾客亲口确认的一项核心需要。",
 transition:"知道真正的需要以后，接下来看看你有哪些能力值得发挥。"
},
{
 title:"三角形内的优势与过度使用",
 theme:"优势如何成为能力，也可能形成压力",
 say:"「我们先从你真实做得不错的事情来找优势。\n\n善于倾听、擅长组织、反应快，或者愿意承担责任，都可能是一种能力。不过，同样的习惯如果用得太多，也可能让自己辛苦。\n\n比如细心的人可能容易反复检查，愿意照顾别人的人也可能承接太多。我们不是要否定优点，而是帮你找到发挥它的合适程度。」",
 question:"「最近哪一件事，让你觉得自己确实做得不错？当时用了什么能力？」",
 example:"例如：成功解决问题、协调一次合作、完成一项困难工作。",
 yes:"「这可以算是你亲身验证过的优势。你觉得它在什么时候最有帮助？用得太多的时候，会不会带来额外压力？」",
 partial:"「看来这项能力在某些情况下能发挥，但不是每次都一样。什么条件比较容易让它表现出来？」",
 no:"「那我们不把它列作优势。别人曾经为什么事情感谢你？或者你最近完成过什么困难的事？」",
 unsure:"「我们不急着评价自己。先挑一个做过的具体任务，看看你到底贡献了哪一部分。」",
 action:"只保留有真实事件支持的优势，并注明使用过度时的风险。",
 transition:"优势讲清楚了，我们进一步看思考、沟通和压力下的反应。"
},
{
 title:"思考、压力与沟通模式",
 theme:"理解平常与压力下的不同反应",
 say:"「人在平常和压力很大的时候，表达方式可能会不同。\n\n有些人会讲得更快，有些人会安静下来，也有人想立刻解决问题，不希望继续讨论。\n\n我们先不判断哪种反应比较好，而是找出你最容易在哪一种情境下误会别人，或者让别人误会你。这样以后就能更早发现自己的需要。」",
 question:"「最近一次压力很大时，你先想、先说，还是先自己处理？之后发生了什么？」",
 example:"例如：工作被临时催促、家人发生争执、计划被改变。",
 yes:"「谢谢你告诉我。那次你真正希望得到的是协助、空间、理解，还是一个明确的安排？」",
 partial:"「你在工作上和在家里的反应不一样，这很常见。我们先讨论最让你辛苦的那种场景。」",
 no:"「那我们换成你的真实方式来记录。面对压力，你通常怎样让自己恢复平静？」",
 unsure:"「先从最近一次让你皱眉或觉得烦的事情想起就好，当时有没有一个很明显的第一反应？」",
 action:"找出一项可提前识别的压力信号，以及能表达需要的一句话。",
 transition:"接下来我们看看意外发生时的第一反应，以及已实践出来的能力。"
},
{
 title:"潜意识与天赋观察",
 theme:"自动反应与实践能力分开讨论",
 say:"「现在谈你在事情突然发生时，比较习惯怎样反应。\n\n这套课程里有一个叫‘潜意识码’的术语，但它并不是心理学的潜意识测量。相关计算公式目前也还在核对，所以这份演示不会替你直接下结论。\n\n关于天赋，我们先看你已经用经验表现出来的能力，不因为某个数字出现，就说你天生注定擅长什么。你自己做过的事情才是重要依据。」",
 question:"「突然遇到事情时，你第一个念头是什么？哪一种能力曾经帮助你解决问题？」",
 example:"例如：临时需要协助顾客、突然调整行程、面对计划外的挑战。",
 yes:"「这听起来是你曾经用过的一种应对方式。你觉得它帮助了你哪些事情？有没有什么时候反而不适合？」",
 partial:"「也许不同意外会触发不同反应。我们先比较紧急事件和普通变化，两种情况是否相同？」",
 no:"「谢谢你指出差异。我们不用课程标签解释你。你实际上第一时间会怎么处理？」",
 unsure:"「你可以先想一次小小的意外，例如东西找不到或计划临时改变，不必回忆严重的事件。」",
 action:"相关数字公式仍待核对，不在公开演示中显示或推算。",
 transition:"了解当下反应后，我们再回顾哪些习惯和成长环境有关。"
},
{
 title:"父母基因与缺失数字",
 theme:"成长经历与可练习的技能",
 say:"「在 AURMOVA 的课程里，‘父亲基因’和‘母亲基因’是数字图上两个位置的名称，不代表生物遗传，也不能据此判断真正的父母是什么性格。\n\n成长环境里，我们可能学到怎样表达情绪、安排责任或处理意见不同的情况。\n\n‘缺失数字’也不是说一个人缺少某种能力。我们会根据你实际遇到的困难，挑一项想学习的技能来讨论。」",
 question:"「小时候你学到过哪一种处理事情的方法，现在仍然经常使用？有没有想调整的地方？」",
 example:"例如：习惯自己承担、怕做错、不敢拒绝、做事非常有计划。",
 yes:"「那这样的做法曾经在哪些时候帮助过你？到了现在，有没有某个情境让你觉得它不再适合？」",
 partial:"「可能只有某些场景与成长经历有关。你更愿意从家庭、学校，还是工作经验来谈？」",
 no:"「可以，这项观察不需要套在你身上。我们直接讨论你现在最想学习或改善的一项能力。」",
 unsure:"「不用讨论不想分享的家庭细节。你也可以只说现在处理事情的方法，看看想不想练习不同方式。」",
 action:"尊重顾客的家庭隐私，不追问不愿分享的细节。",
 transition:"成长模式有了线索，再看看你目前最关注的人生阶段。"
},
{
 title:"人生三个阶段与当前课题",
 theme:"21–40、41–60、61岁以后",
 say:"「在这套课程中，21–40岁主要观察工作与朋友；41–60岁观察孩子、下属或其他需要承担的责任；61岁以后观察家庭、生活安排与晚年的个人选择。\n\n这些是课程用来整理主题的阶段，不代表每个人一定有孩子、下属，也不代表到了某个年龄就必须退休。\n\n我想先听听你现在最关心的生活问题，再选择适合讨论的阶段主题。」",
 question:"「如果只能先改善一件事情，你最想处理的是工作方向、人际关系、家庭责任，还是生活安排？」",
 example:"例如：正在学一门技能、需要照顾家庭、想安排未来的时间。",
 yes:"「那我们先集中在你现在最重要的那一件事。你觉得有哪些条件已经具备，哪些还需要准备？」",
 partial:"「你同时在意几个方向。假如只能先完成一件，哪件会让其他方面也更轻松？」",
 no:"「那我们不用把你套进固定的年龄主题。你最近实际最需要解决的是什么？」",
 unsure:"「我们先看看最近三个月，你把最多时间花在哪一件事情上？那件事是你的选择，还是目前的责任？」",
 action:"只关注目前最相关的主题，不展开全部阶段和内部联合码。",
 transition:"找到现阶段最重要的事以后，我们来讨论如何把能力转成实际价值。"
},
{
 title:"财富模式与个人价值创造",
 theme:"收入、收费、资源与合作",
 say:"「谈到财富，我不会用一个数字预测你会不会发财。\n\n真正值得看的是：你有哪些别人需要的技能？你是否清楚自己的服务价值？收入扣除成本以后，还剩下多少？有没有把收费、责任和合作条件讲明白？\n\n有些困难来自收入不稳定，有些来自费用太高，还有些来自做了很多原本没约定的事情。我们需要分清实际原因，才能找到改善方法。」",
 question:"「你现在最想改善的是赚钱机会、收费方式、支出记录，还是工作与合作的界线？」",
 example:"例如：熟人不好意思收费、营业额高但成本高、没有记录收支。",
 yes:"「我们先不要同时处理全部问题。你刚才提到的困难，最近发生在哪一次合作或开销中？我们能不能先做一项小调整？」",
 partial:"「听起来有一部分是收入问题，另一部分是时间或责任分配。我们先分别看看各自的原因。」",
 no:"「那我们改从你的实际财务目标谈起。你最希望今年的钱和时间发生什么改变？」",
 unsure:"「先不用判断自己会不会理财。你是否大致知道上个月的收入和必要支出是多少？可以从记录开始。」",
 action:"建议从记录30天收支或明确一次报价范围开始，不预测财富。",
 transition:"工作与钱也常涉及关系，我们下一段看如何表达需要与建立界线。"
},
{
 title:"关系模式与沟通界线",
 theme:"需要、表达、冲突与尊重",
 say:"「有时候我们很在乎一个人，却不一定能够清楚地表达自己的需要。\n\n有些人觉得不开心时先忍着，有些人会马上讲出来，也有人习惯把所有事情自己完成。\n\n我们会从真实的一次互动出发，看看当时你想表达什么、实际说了什么，以及对方怎样回应。我们不替另一方下结论，也不会把所有关系问题都解释成沟通不够。」",
 question:"「最近一次感到不被理解时，你当时真正希望对方怎样回应？你有没有直接说出来？」",
 example:"例如：需要对方分担、希望先被听完、不想接下额外责任。",
 yes:"「那你当时是怎样表达的？如果把抱怨改成一个具体请求，你最希望对方做哪一件事？」",
 partial:"「你在工作和亲密关系里可能反应不同。我们先谈一个你觉得安全、也愿意改善的情境。」",
 no:"「没关系，也许你已经很会表达。那目前最困扰你的关系问题究竟是什么？我们回到事实。」",
 unsure:"「可以先想一次不大的意见不合。你当时希望对方聆听、帮忙，还是给自己一点空间？」",
 action:"如涉及威胁、控制或暴力，优先安全与现实支持，不套用普通沟通话术。",
 transition:"我们已经讨论了不同生活主题，最后把真正符合的内容整理成小行动。"
},
{
 title:"人生总结与30天成长行动",
 theme:"优势、核心困难、下一步",
 say:"「今天最后这一段，我们不再重复所有数字，只整理三件最重要的事。\n\n第一，哪些优势是你在现实生活里已经验证过的？第二，哪一种习惯或困难，是你目前最希望改善的？第三，未来30天你愿意从哪一件小事开始？\n\n你不需要因为一个数字限制自己，也不需要一次改变所有事情。\n\n我不替你决定人生，我陪你看懂人生蓝图。」",
 question:"「今天哪一点最有帮助？你愿意在未来30天先尝试哪一件具体的小行动？」",
 example:"例如：先记录开支、先表达一次需要、为一项工作定清楚分工。",
 yes:"「很好。那我们把行动说具体：你准备什么时候开始？每周怎样知道自己有没有实践？我们只记录你愿意做的部分。」",
 partial:"「那把目标再缩小一点，你愿意先尝试哪一个最容易完成的小步骤？」",
 no:"「没关系，今天不必勉强决定一个目标。你觉得有什么内容还需要解释清楚，或者想先想一想？」",
 unsure:"「我们可以先放下计划。回想今天的咨询，有没有一个问题值得你在接下来几天慢慢观察？」",
 action:"由顾客确认行动；正式顾客报告需要在安全后台人工审核后才能生成。",
 transition:"11段界面测试结束。真正的个人解析与资料保存尚未接入这个公开页面。"
}
];
const RESPONSE_TYPES=[
{key:"yes",label:"有，符合"},
{key:"partial",label:"部分符合"},
{key:"no",label:"没有，不符合"},
{key:"unsure",label:"不确定"}
];
const labels={yes:"符合",partial:"部分符合",no:"不符合",unsure:"不确定"};
const selected=Array(STAGES.length).fill(null);
let index=0;
let bigText=false;
const el=id=>document.getElementById(id);
function paint(){
 const data=STAGES[index];
 el("stage-name").textContent=String(index+1).padStart(2,"0")+"｜"+data.title;
 el("stage-subtitle").textContent=data.theme;
 el("counter").textContent="第 "+(index+1)+" / "+STAGES.length+" 段";
 el("fill").style.width=((index+1)/STAGES.length*100)+"%";
 el("script").textContent="「"+data.say.replace(/^「|」$/g,"")+"」";
 el("question").textContent=data.question;
 el("scenario").textContent=data.example;
 el("transition").textContent=data.transition;
 el("tip").textContent=data.action;
 const choices=el("choices");
 choices.replaceChildren();
 RESPONSE_TYPES.forEach(opt=>{
  const btn=document.createElement("button");
  btn.type="button";btn.textContent=opt.label;
  btn.className="choice"+(selected[index]===opt.key?" selected":"");
  btn.setAttribute("aria-pressed",selected[index]===opt.key?"true":"false");
  btn.addEventListener("click",()=>{selected[index]=opt.key;paint();});
  choices.appendChild(btn);
 });
 const response=el("response");
 if(selected[index]){
  el("reply-text").textContent=data[selected[index]];
  response.hidden=false;
 }else{
  response.hidden=true;
 }
 el("prev").disabled=index===0;
 el("next").disabled=index===STAGES.length-1;
 el("next").textContent=index===STAGES.length-1?"已经到最后一段":"下一段 →";
 el("jump").value=String(index);
 el("answered").textContent=selected.filter(Boolean).length+" / 11 已模拟回答";
 el("summary").hidden=index!==STAGES.length-1;
 document.body.classList.toggle("large-script",bigText);
 el("font-toggle").textContent=bigText?"标准字号":"放大照读文字";
 if(index===STAGES.length-1)updateSummary();
}
function updateSummary(){
 const answered=selected.map((v,i)=>v?String(i+1).padStart(2,"0")+" "+STAGES[i].title+"： "+labels[v]:null).filter(Boolean);
 el("summary-text").textContent="AURMOVA｜11段操作测试记录（仅模拟）\n\n"+(answered.length?answered.join("\n"):"还没有选择任何模拟回答")+
 "\n\n提示：这份记录不包含顾客资料、真实数字或咨询结论；页面刷新后会清空。";
}
function turn(d){
 const next=Math.max(0,Math.min(STAGES.length-1,index+d));
 if(next===index)return;
 index=next;paint();window.scrollTo({top:0,behavior:"smooth"});
}
function init(){
 STAGES.forEach((stage,i)=>{
  const o=document.createElement("option");o.value=String(i);
  o.textContent=String(i+1).padStart(2,"0")+" · "+stage.title;
  el("jump").appendChild(o);
 });
 el("prev").addEventListener("click",()=>turn(-1));
 el("next").addEventListener("click",()=>turn(1));
 el("jump").addEventListener("change",ev=>{index=Number(ev.target.value)||0;paint();window.scrollTo({top:0,behavior:"smooth"});});
 el("font-toggle").addEventListener("click",()=>{bigText=!bigText;paint();});
 el("reset").addEventListener("click",()=>{selected.fill(null);index=0;paint();});
 el("copy-summary").addEventListener("click",async()=>{
  const txt=el("summary-text").textContent;
  try{await navigator.clipboard.writeText(txt);el("copy-status").textContent="测试摘要已复制。";}
  catch{el("copy-status").textContent="复制未获浏览器许可，可长按摘要文字选择复制。";}
 });
 paint();
}
init();
