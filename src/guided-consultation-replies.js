// AURMOVA private consultation replies. Local, deterministic wording; no external AI request.
import {calculateBlueprint,calculateExpressionProfile,calculateInnerDriveProfile,calculateTemperamentProfile,ageFromBirthday} from "./engine/blueprint.js?v=54";
import {EXPRESSION_NUMBER_LIBRARY,INNER_DRIVE_NUMBER_LIBRARY} from "./consultation-library.js?v=41";
export const GUIDED_QUESTIONS={
 relationship:[
 {id:"communication",title:"沟通与回应",question:"最近一次你想让对方理解你，却没有被接住，发生了什么？你说了什么，对方怎样回应？",interpret:"先分清楚你想得到的是倾听、解释、安慰，还是一起解决问题。不同期待没有说清楚时，容易把回应方式的差异理解成不在乎。",follow:"当时你最希望对方具体做什么？这个需要你有没有直接说出来？",action:"选一件小事，先说“我现在想请你听我说五分钟，再一起想办法”，双方轮流说完后复述听到的需要。"},
 {id:"needs",title:"爱与安全感",question:"对方做什么时，你会明确感觉被重视？哪一种回应缺少时，你最容易失落？",interpret:"我们要找的是你实际接得到的关心，而不是先判断谁比较爱谁。双方表达关心的方式可能不同，需要用具体行为对齐。",follow:"你能举出一次感到被重视、一次感到被忽略的例子吗？对方知道这两者的差别吗？",action:"各写三件能让自己感到被重视的具体行为，各选一件本周可以做到的事。"},
 {id:"boundary",title:"空间与边界",question:"当你想拒绝或需要独处时，你会怎么说？你最担心对方怎样理解？",interpret:"需要空间与需要连接都可以被讨论。重点是有没有明确表达、有没有尊重拒绝，以及暂停以后是否按约定回来沟通。",follow:"你需要的是多久的空间、哪一件事的拒绝？对方会怎样回应你的界线？",action:"把“不要烦我”换成“我需要半小时整理，今晚八点回来谈”；拒绝时说明自己能接受的范围。"},
 {id:"conflict",title:"冲突与修复",question:"你们最常重复的争执是哪一种？从第一句话到结束，两个人分别做了什么？",interpret:"先观察冲突循环：谁先表达、谁升级、谁退开，最后怎样修复。一次争论不能代表整段关系，也不能替另一方解释动机。",follow:"争执在哪一句话或哪个动作开始升级？双方什么时候还能停下来听对方？",action:"下次升级时暂停，并约定明确的恢复时间；回来只讨论一件事，用事实、感受、请求表达，不翻旧账。"},
 {id:"money",title:"钱与家庭分工",question:"谈钱、家务或育儿时，你最觉得不公平的是什么？现在怎样分配？",interpret:"先把支出、时间、家务和看不见的照顾工作列出来，再讨论公平。收入与劳动量是两种信息，不能只用赚钱多少判断付出。",follow:"你希望调整哪一项责任？对方是否知道你为它花了多少时间和精力？",action:"各列当前任务和固定支出，先重新分配一项最耗力的任务，再约定一周后的复盘时间。"},
 {id:"trust",title:"信任与承诺",question:"哪一件具体事情让你开始不信任？是一次事件，还是同一种承诺反复没有兑现？",interpret:"信任要回到可核实的行为、承诺和修复。先区分已经发生的事实与尚未确认的猜测，不用数字证明对方可靠或不可靠。",follow:"你最需要对方兑现的具体承诺是什么？怎样观察才算有改变？",action:"写清一项双方都同意的承诺、完成时间与复盘方式；不以监控或试探代替沟通。"}
 ],
 family:[
 {id:"learning",title:"学习与任务",question:"孩子在哪个任务最容易卡住？是开始、理解、持续做，还是完成以后整理？请说最近一次。",interpret:"先拆任务和环境，不把“不会做”“做得慢”直接理解成懒惰。年龄、任务难度、指令长度与家长介入方式都要一起观察。",follow:"把任务拆小、只讲一步或先示范一次后，孩子的反应有没有不同？",action:"把一项任务拆成可完成的小步，先让孩子做第一步；完成后具体指出他做对的行为，再协商下一步。"},
 {id:"emotion",title:"情绪与回应",question:"孩子难过、生气或哭的时候，前面发生了什么？大人第一句通常怎么回应？",interpret:"先确认发生的事情与情绪，再处理行为。可以接纳情绪，同时设行为界线；一次哭闹不能说明孩子的性格或家长做错了。",follow:"孩子冷静以后怎样解释当时的事？他最需要帮助的是说清楚、等待、转场，还是处理挫折？",action:"先说“我看到你很生气，我会听；我们不能打人”，等平静后让孩子用语言、画画或指认表达需要。"},
 {id:"boundary",title:"规则与自主",question:"孩子最常在哪条规则上反抗？规则怎样说，是否每个大人都执行一样？",interpret:"要分清规则是否明确、执行是否一致，以及孩子是否有年龄合适的选择空间。反抗不自动等于不尊重。",follow:"这条规则是安全底线还是可以商量的习惯？孩子知道理由与下一步吗？",action:"保留一条明确安全底线，其他小事给两个可接受的选择；大人先对齐执行方式。"},
 {id:"encouragement",title:"信心与表达",question:"孩子什么时候会说“我不会”“我不敢”或不愿表达？大人怎样回应？",interpret:"先观察他害怕的是犯错、被比较、任务过难，还是不熟悉场景。需要用真实例子确认，不凭数字判断自卑或心理问题。",follow:"在哪个熟悉、没有被催促的场景，他会比较愿意尝试？当时有谁、用了什么方法？",action:"选一个难度合适的小任务，让孩子先尝试；反馈具体过程，例如“你刚才试了两种方法”，避免比较或只评价聪不聪明。"},
 {id:"parent",title:"家长压力与分工",question:"带孩子时你最累的具体时段或任务是什么？现在有没有人能接手？",interpret:"照顾压力要看实际任务、休息与支持。先把家长的需要讲清楚，再讨论教养方法，不要求一个人持续承担全部责任。",follow:"如果这周能少扛一件事，你最想交出去什么？可以由谁在什么时候接手？",action:"列出一项可交接任务和一个休息时段，明确交接给谁、多久与必要信息；暂时没有支持时先降低非必要任务。"},
 {id:"communication",title:"亲子沟通",question:"同一件事，大人怎么说，孩子怎么回应？你们最常在哪句话开始互相听不进去？",interpret:"大人的解释方式未必等于孩子接得住的方式。先观察说话时机、句子长度、是否有选择和孩子当时的状态。",follow:"如果先听孩子说完、只讲一句要求，或者先示范，反应会怎样？",action:"选一个平静时段，先让孩子用自己的方式说；大人复述理解后，只给一个明确、可执行的请求。"}
 ],
 cooperation:[
 {id:"roles",title:"职责与交接",question:"同一个项目里，谁负责哪些事？最近一次重复做、漏做或互相等对方，是怎么发生的？",interpret:"先查职责与交接是否明确，再讨论能力或态度。姓名与生日资料可以提示分工观察，但不能代替真实技能和交付记录。",follow:"这项任务谁负责完成、谁有最终决定权、谁需要被告知？你们有没有共同确认？",action:"选一项任务写清负责人、交付标准、截止时间与验收人；重要交接保留文字记录。"},
 {id:"decision",title:"决定与节奏",question:"你们做决定时谁想快、谁想再确认？哪次节奏差异影响了项目？",interpret:"快慢各有成本，需要区分决定能否撤回、风险有多大与信息是否足够。先不要把慢理解成拖延、把快理解成不认真。",follow:"这次决定还缺哪项信息？什么时候必须决定，谁承担结果？",action:"为一项决定设信息清单与截止时间；可撤回的小决定先试，重大决定先按双方同意的流程确认。"},
 {id:"money",title:"报酬与投入",question:"出资、分润、报酬或费用里，哪一项目前最不清楚？双方各自理解是什么？",interpret:"先核对约定、实际投入与记录，不凭关系好坏猜默契。金钱安排需要具体数字、时间和双方确认。",follow:"这项约定有文字记录吗？双方认同的结算方式、时间和条件分别是什么？",action:"整理已有约定和收支记录，把未明确的事项列出来，由双方协商并书面确认；重大争议交由合适的专业人士处理。"},
 {id:"communication",title:"反馈与误会",question:"你提出工作意见时，对方怎样回应？最近一次信息传达落差是什么？",interpret:"先区分事实反馈、个人感受和对行动的请求。表达方式不同可能影响接收，但不能据此认定谁难合作。",follow:"对方复述出来的理解，与你原本想表达的一样吗？你需要他具体改变什么？",action:"用“事实→影响→请求”讲一条反馈，最后请对方复述下一步与完成时间。"},
 {id:"boundary",title:"边界与额外承担",question:"你有没有接下原本不属于自己的任务？当时为什么答应，后来影响了什么？",interpret:"先看额外承担有没有被确认、有没有相应资源和期限。愿意支持与长期无边界包办，需要分清楚。",follow:"你能接受的任务范围、时间和条件是什么？超出以后由谁决定与承担？",action:"说明现有任务量；新增任务先确认优先级、资源与期限，必要时由负责人决定替换哪一项。"},
 {id:"conflict",title:"分歧与合作修复",question:"最近一次合作分歧具体是什么？双方目标、底线与提出的方案分别是什么？",interpret:"先把共同目标、真实限制和不同方案分开。意见不同不等于目标不同，也不能只听一方就判断另一方的动机。",follow:"哪些条件可以商量，哪些是双方都知道的底线？什么结果能让双方继续合作？",action:"各提出一个可执行方案，比较成本、时间和责任；共同选一个小范围试行，并约定复盘节点。"}
 ]
};
const DEFERRED=/^(不知道|不清楚|不确定|想不起来|忘了|还没想过|不懂|嗯|好|好的|ok|okay)[。！!？?\s]*$/i;
const DENIED=/^(没有|不是|不像|不对|不认同|不同意|没发生|没有这种情况|不符合|不是这样)[。！!？?\s]*$/;
const TOPIC_PATTERNS={
 money:/钱|费用|出资|分润|报酬|支出|收入|付款|结算/,
 boundary:/拒绝|不敢说不|不好意思|空间|界线|边界|额外|包办/,
 conflict:/吵|争执|分歧|冷战|冲突|翻旧账/,
 needs:/忽略|在乎|重视|安慰|安全感/,
 trust:/承诺|信任|骗|兑现/,
 roles:/分工|交接|负责人|漏做|重复做/,
 decision:/决定|太慢|太快|拖|风险/,
 learning:/功课|作业|学习|任务|不会做/,
 emotion:/哭|生气|情绪|难过/,
 encouragement:/不敢|害怕|比较|尝试/,
 parent:/我很累|很累|休息|接手|没人帮/,
 communication:/说|沟通|解释|回应|听/
};
export function resolveGuidedTopic(mode,id,answer){
 const list=GUIDED_QUESTIONS[mode]||GUIDED_QUESTIONS.relationship;
 if(id!=="auto")return list.find(q=>q.id===id)||list[0];
 return list.find(q=>TOPIC_PATTERNS[q.id]?.test(answer))||list[0];
}
export function nameAndBirthBasis(person={}){
 const data={displayName:person.name,officialName:person.officialName,formerName:person.formerName,nameChangedYear:person.nameChangedYear};
 let blueprint=null;
 if(person.birthday)try{blueprint=calculateBlueprint(person.birthday);}catch{}
 const expression=calculateExpressionProfile(data),drive=calculateInnerDriveProfile(data),temperament=calculateTemperamentProfile(data);
 return {
 name:person.name||person.officialName||"未命名",
 main:blueprint?.mainPersonality||null,seat:blueprint?.seatCode||"",
 expression:expression.canCalculate?expression.primary.compound:"",
 expressionDigit:expression.canCalculate?expression.primary.reduced:null,
 innerDriveDigit:drive.canCalculate?drive.primary.reduced:null,
 innerDrive:drive.canCalculate?drive.primary.compound:"",
 temperament:temperament.canCalculate?temperament.primary.counts:null,
 age:person.birthday?ageFromBirthday(person.birthday):null
 };
}
export function buildGuidedReply({mode,topicId,question,answer,respondent,a={},b={}}){
 const text=String(answer||"").trim();
 if(!text)return {valid:false,message:"先记录顾客的实际回答，再生成回应。"};
 const topic=resolveGuidedTopic(mode,topicId,text);
 const basis=[nameAndBirthBasis(a),nameAndBirthBasis(b)];
 const speaker=respondent||basis[0].name;
 const state=DENIED.test(text)?"denied":DEFERRED.test(text)||text.length<3?"uncertain":"detail";
 const asked=String(question||topic.question).trim();
 const parts=state==="denied"?[
 ["接住顾客","谢谢你直接告诉我这与你的经历不符。这一条先放下，我不会为了配合数字要求你找出同样的故事。"],
 ["把焦点交还顾客",mode==="family"?"那我们从孩子最近真实发生的一件事开始。你最想改善的是学习、情绪、规则，还是你自己的照顾压力？":mode==="cooperation"?"那我们回到当前项目：你最想解决的是职责、决定、费用，还是沟通？":"那我们回到你现在最在意的事情。你最想让我理解的是哪一件具体相处经历？"],
 ["深入追问","最近有没有一件与你刚才否认的情况相反的例子？当时发生了什么，你们怎样处理？"],
 ["现场建议","先记录与原假设不同的真实行为，换一个你认同的主题再谈。"],
 ["自然收尾","我们以实际经历为准。你愿意先从哪件事开始？"]
 ]:state==="uncertain"?[
 ["接住顾客","现在还说不清也没关系，不用急着给一个符合数字的答案。"],
 ["缩小问题","我们先不谈一贯如何，只回忆最近一次具体场景，或你比较容易想到的相处经历。"],
 ["深入追问",mode==="family"?"最近一次孩子需要帮助或你觉得带孩子很累时，先发生了什么？":"最近一次你们一起处理一件事，谁先说了什么，另一方怎样回应？"],
 ["现场建议","先记录一个事实、当时的感受和希望的回应；暂时没有例子时，约定下次带一个实际场景再讨论。"],
 ["自然收尾","这次可以先把需要观察的问题留着，不必现在就下结论。"]
 ]:[
 ["接住顾客","我听到你说：“"+text+"”。我先按你的意思记录，不急着替你或另一方下结论。"],
 ["专业整理",topic.interpret+" 这是我们需要核实的观察方向；目前记录的是"+speaker+"的陈述，另一方的想法还需要确认。"],
 ["深入追问",topic.follow],
 ["现场建议",topic.action],
 ["自然收尾","刚才哪一部分最贴近你现在的处境？你愿意先尝试哪一步？我们下次看实际有没有变化。"]
 ];
 if(state==="detail"){
 const observations=basis.map(p=>{
 const ex=EXPRESSION_NUMBER_LIBRARY[p.expressionDigit]||{},id=INNER_DRIVE_NUMBER_LIBRARY[p.innerDriveDigit]||{};
 const labels=[p.expression?"表现 "+p.expression+(ex.title?"（"+ex.title+"）":""):"",p.innerDrive?"内驱 "+p.innerDrive+(id.title?"（"+id.title+"）":""):""].filter(Boolean);
 return labels.length?p.name+"："+labels.join("；"):"";
 }).filter(Boolean);
 if(observations.length)parts.splice(2,0,["连接双方资料","我会用双方姓名数字再核对表达方式和需要："+observations.join("。")+"。这些是咨询观察线索，不能证明刚才那件事为什么发生。"+(mode==="family"?"亲子里只验证孩子的学习、回应与支持方式，不套用成人感情或事业结论。":"请双方分别举例，确认这种方式在刚才的场景里有没有出现。")]);
 }
 // Triggered only by reported harm; ordinary disagreements keep ordinary consultation wording.
 if(/打我|打孩子|打小孩|殴打|家暴|威胁杀|自伤|自杀|不想活/.test(text)){
 parts.splice(1,parts.length-1,
 ["先确认安全","这段经历先按安全问题处理，不能用数字或沟通风格解释伤害。你和孩子目前安全吗？"],
 ["必要追问","现在有没有正在发生的威胁或伤害？有没有可信任的人可以陪你，帮助你到安全的地方？"],
 ["立即行动","若有即时危险，优先联系当地紧急服务或寻求现场援助；先保护安全，不安排双方当面对质。"]);
 }
 return {valid:true,mode,topic:topic.id,title:topic.title,question:asked,answer:text,respondent:speaker,state,basis,parts,
 readText:parts.map(([title,body])=>title+"\n"+body).join("\n\n"),
 method:"按咨询主题与回答关键词调用话术；请核对实际意思，必要时改选主题。数字资料只作核对依据，不证明回答的原因。"};
}
export function guidedRecordKey(mode,context,topic){
 return JSON.stringify([mode,context,topic]);
}
