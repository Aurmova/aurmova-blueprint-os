// STAGING ONLY. AURMOVA relationship V2: pairwise interaction hypotheses
// and scenario-specific consultant follow-ups. No customer input persisted.
// Preserve the existing course-engine calculations; never calculate a new code
// by concatenating two people's numbers or conflating MNO with another position.
import { INNER_DIGIT_POLARITY } from "../../../src/consultation-library.js";

const KEYS = Object.freeze({
  1:"主动表达自己的决定",2:"先照顾沟通与关系感受",
  3:"透过表达和行动推进",4:"确认步骤与稳定性",
  5:"寻找方向及选择",6:"落实责任与照顾",
  7:"观察、分析、需要想清楚",8:"希望看见目标和结果",
  9:"先想整体和长远方向"
});
const TOPICS = Object.freeze({
  communication: { label:"沟通与误解", example:"讨论周末安排时，一方先提出自己的想法，另一方想先了解安排细节；双方可能把‘问问题’误以为‘反对’。" },
  emotions: { label:"情绪与安全感", example:"一方心情不好时想得到回应，另一方希望先冷静整理想法，容易误会对方不关心。" },
  time: { label:"相处时间", example:"一方临时想一起出门，另一方想先安排手上的事；两个人对‘陪伴’与‘有计划’的定义可能不同。" },
  responsibility: { label:"生活责任", example:"家务或照顾家人时，一方希望对方主动发现需要，另一方比较习惯等到职责说清楚再处理。" },
  money: { label:"金钱与未来计划", example:"面对一笔较大开销，一方想先讨论方向与弹性，另一方要求预算、条件和明确结果。" }
});
const each = (key,label,reply,ask) => ({ key,label,reply,ask });
const intro = (title,text) => ({ label:title,text });

function validSeat(person) {
  const value=String(person?.seatCode || "");
  return /^[1-9]{3}$/.test(value) ? value : null;
}
function stageDesc(name, code) {
  if(!code) return name+"的坐镇码需要核对。";
  return name+"：因"+code[0]+"（"+KEYS[code[0]]+"）→ 过程"+code[1]+"（"+KEYS[code[1]]+"）→ 结果"+code[2]+"（"+KEYS[code[2]]+"）。";
}
function needCode(code) {
  const v=INNER_DIGIT_POLARITY[code] || {};
  return { positive:v.positive || "需要向本人了解", watch:v.negative || "需依具体生活经历核对" };
}
function commonLink(a,b) {
  const am=validSeat(a), bm=validSeat(b);
  if (!am || !bm) return "两人的联合码尚未完整，暂不推导数字之间的关联。";
  if(am[1] === bm[0]) return a.name+" 的处理过程与 "+b.name+" 的出发点同为数字"+am[1]+"，可以先把‘"+KEYS[am[1]]+"’作为双方可能理解彼此的共同起点。";
  if(bm[1] === am[0]) return b.name+" 的处理过程与 "+a.name+" 的出发点同为数字"+bm[1]+"，可以先把‘"+KEYS[bm[1]]+"’作为双方可能理解彼此的共同起点。";
  return a.name+" 的过程数字"+am[1]+"与"+b.name+"的过程数字"+bm[1]+"不同，先请双方各说明自己解决问题的次序，而不是说谁对谁错。";
}
function v2Pair(a,b) {
  const aCode=validSeat(a),bCode=validSeat(b);
  const aResult=aCode ? KEYS[aCode[2]] : "说出自己的想法";
  const bCause=bCode ? KEYS[bCode[0]] : "先了解背景";
  const bResult=bCode ? KEYS[bCode[2]] : "确定下一步";
  const aCause=aCode ? KEYS[aCode[0]] : "确认自己的方向";
  return [
    a.name+" 可能把「"+aResult+"」作为一件事暂时处理好的信号；"+b.name+" 则可能先需要「"+bCause+"」才准备回应。双方不一定反对，而可能只是启动与结束的节奏不同。",
    "反过来，"+b.name+" 想要「"+bResult+"」时，"+a.name+" 也可能还希望「"+aCause+"」。问清‘你要的是讨论方向，还是现在决定结果’，能减少猜测。",
    commonLink(a,b)
  ];
}
function mainTitle(person) {
  return person.name+"（主性格"+person.main+"、起始数"+(person.starting || "待核对")+"）";
}
function justOneThing(a,b,theme) {
  return "例如："+TOPICS[theme].example+" 此时先请"+a.name+"说希望对方听见什么，再请"+b.name+"复述听见的内容。接着交换角色。";
}
function chooseFor(stepId,a,b) {
  const aa=a.name,bb=b.name;
  switch(stepId) {
    case "opening": return {
      type:"topic", label:"顾客回答：本次最想改善哪一项？",
      options:Object.entries(TOPICS).map(([key,val])=>each(key,val.label,
        "我们就先聚焦「"+val.label+"」，不急着判断是谁的问题。请两位分别讲一个最近发生的例子。",
        "这件事发生在哪里、当时谁说了什么？你们分别希望对方怎样回应？"))
    };
    case "personality": return {
      type:"initiative",label:"顾客回答：一件事通常谁先发起？",
      options:[
        each("a",aa+"先发起","先请"+aa+"讲为什么会主动提出，再请"+bb+"说第一次听到时的想法。","当时哪句话让对方感觉被理解，哪句话让人有压力？"),
        each("b",bb+"先发起","我们换个方向，先请"+bb+"讲自己想达成什么，再请"+aa+"说希望参与决定的哪一步。","你们是否同意同一个目标，只是讨论顺序不同？"),
        each("both","两人轮流","这表示角色会随情境变化，我们就分析具体事件，不把主性格当固定标签。","请分别举一次由不同人先发起的例子。"),
        each("unsure","说不清","没关系。我们先看一次真实决定，回顾谁先提出、谁先补充、谁最后确认。","就从最近一次安排吃饭或出门开始，好吗？")
      ]};
    case "seat": return {
      type:"code",label:"顾客回答：最容易卡在哪个环节？",
      options:[
        each("cause","出发点不同","可以先把双方真正要解决的事情分别说出来；一个谈方向，另一个谈事实，可能都没有错。","当时你先在意的是自由选择、被尊重，还是事情是否可靠？"),
        each("process","处理方法不同","这时把‘先想清楚’和‘先说出来’的顺序讲明白，比争论谁比较固执更有效。","下次能不能先留五分钟想一想，再各讲一个理由？"),
        each("result","结果期待不同","先约定这次讨论是‘交流想法’还是‘马上定案’，避免一方以为已经达成共识。","你们如何确认对方真的同意这个决定？"),
        each("unknown","无法确定","不用勉强套上数字，我们先把实际经过写成三句：起因、各自行动、结果。","你们能一起回忆一个真实发生的小事件吗？")
      ]};
    case "inner": return {
      type:"need",label:"顾客回答：低落时最想被怎样照顾？",
      options:[
        each("company","陪伴与回应","被陪伴对你可能很重要。可以把需求说具体：希望对方坐下来听十分钟，还是主动问候一次？","这件事对方愿意、也有能力做到吗？"),
        each("space","独处与思考空间","希望独处也可以是表达需要的一种方式。可以约定多久后再谈，避免另一方理解成不关心。","如果先暂停，你希望多久后重新沟通？"),
        each("help","实际帮忙与分担","你可能更容易从行动感受到关心。我们把‘帮忙’改成一个具体、可执行的任务。","最希望对方这周帮忙承担哪一件小事？"),
        each("uncertain","暂时说不清","不需要立刻从数字决定答案。请回忆一次感到安心的时刻，看看那次发生了什么。","那次是有人陪伴、信任你，还是替你分担了事？")
      ]};
    case "loop": return {
      type:"conflict",label:"顾客回答：压力一来通常先怎样反应？",
      options:[
        each("explain","继续解释／追问","想把话说清楚是可以理解的，但如果对方正在整理思绪，可以先问‘你现在能听吗？’。","你会愿意先约一个双方都能沟通的时间吗？"),
        each("quiet","安静／暂时退出","暂时安静不一定代表不在乎。试着说‘我需要冷静，晚上八点我们再谈’，保留可预期的回应。","你们觉得多久的暂停既能冷静、又不会让另一方焦虑？"),
        each("act","先行动／急着解决","想尽快处理也可能是责任感的表现。先问对方希望被倾听还是要方案，能减少越帮越乱。","下一次行动前，能不能先问一句‘你要我听，还是要我帮忙想办法？’"),
        each("rare","很少冲突","那我们不用创造问题。请你们说一件很顺利的决定，找出值得保留的沟通方式。","你们做对了哪一个动作，让事情顺利完成？")
      ]};
    case "scenarios": return {
      type:"scene",label:"顾客回答：最需要改善哪个生活场景？",
      options:[
        each("communication","说话／误解","用一次真实对话做练习，一方说事实与感受，另一方先复述，再提出自己的意见。","哪一句话如果换个说法，最容易让对方听得进去？"),
        each("responsibility","家务／时间","把具体责任讲清楚，不要求对方读心，也不让一方自动承担所有事情。","哪一项家务或陪伴时间，双方愿意共同订一个明确安排？"),
        each("money","金钱／消费","把预算、金额与确认方式写清楚，而不是凭数字判断谁会赚钱或理财。","你们想先约定哪一种开销必须一起商量？"),
        each("family","家人／界限","对外界和双方家庭的界限要共同协商，先表达需求，再决定谁负责沟通。","发生家人意见冲突时，你们希望先私下讨论什么？"),
        each("other","其他","我们不预设情况。请两位先用一句话定义希望改善的事情。","如果这件事一周后有一点改善，具体会看到什么变化？")
      ]};
    case "summary": return {
      type:"practice",label:"顾客回答：接下来七天愿意试哪个练习？",
      options:[
        each("listen","每周一次倾听对话","先约定双方都能接受的十五分钟：一人讲、另一人复述，再交换角色。","你们希望哪一天、什么时间进行？"),
        each("request","清楚表达一个需要","每天或隔天用一句‘当我……我希望你……’，表达具体需要而不是猜对方心思。","谁愿意先举一个日常例子？"),
        each("divide","明确一项分工","挑一件小事写下负责人、完成时间与遇到困难时的沟通方法。","你们想先安排哪一件事？"),
        each("later","暂不决定","先保留今天确认有帮助的观察，不强迫马上行动。下一次再选择适合的练习。","下次什么时候方便回来讨论？")
      ]};
    default:return {type:"confirm",label:"顾客怎么回应？",options:[]};
  }
}

export function enhanceRelationshipV2(script,a,b) {
  if(!script || !a || !b || !Array.isArray(script.steps)) return script;
  const pair=v2Pair(a,b);
  const ia=needCode(Number(a.innerCode)), ib=needCode(Number(b.innerCode));
  const ca=validSeat(a),cb=validSeat(b);
  const sourceA=script.codeEvidence?.find(p=>p.name===a.name)?.source || "请核对课程正序解说。";
  const sourceB=script.codeEvidence?.find(p=>p.name===b.name)?.source || "请核对课程正序解说。";
  const blocks={
    opening:[
      intro("开场白","今天我们不是来判断谁对谁错，而是一起看你们为什么可能会用不同的方式处理同一件事情。数字只提供一种讨论角度，真正准不准确，由你们分享的经历来验证。"),
      intro("先听两个人的目标","我会先请两位分别讲今天最想改善的一个问题。待会所有数字解读，都会回到你们选择的真实场景。"),
      intro("提醒","涉及不安全、威胁或控制行为时，不用数字合理化，应优先考虑现实支持与安全。")
    ],
    personality:[
      intro("先介绍两位", mainTitle(a)+"；"+mainTitle(b)+"。先不说谁强谁弱，先讨论决定事情时各自怎么开始。"),
      intro("联合观察","在同一件事情里，"+a.name+"的表达与行动倾向、"+b.name+"的目标与责任倾向可能让双方注意不同的重点。这是需要拿例子验证的假设。"),
      intro("生活例子", "例如讨论周末计划：一位可能先提出想做什么，另一位可能先问时间与安排。双方都可以是在认真参与，只是提问被误解成了否定。"),
      intro("引导技巧","先让A说自己的目的，再让B复述；随后让B说自己的目的，A复述。不要代替顾客判断他们实际怎样想。")
    ],
    seat:[
      intro("先讲清因、过程、结果", stageDesc(a,ca)+" "+stageDesc(b,cb)),
      intro("双方交叉后可能出现的互动",pair[0]+" "+pair[1]),
      intro("找到共同点",pair[2]),
      intro("课程来源核对",a.name+"（"+a.seatCode+"）："+sourceA+" "+b.name+"（"+b.seatCode+"）："+sourceB),
      intro("生活例子", "想象双方讨论一件需要决定的事。一方觉得‘我已经把意见表达清楚’，另一方却觉得‘我还没确认事实，怎么就要定案？’咨询时请两位分别复述自己那刻的想法。")
    ],
    inner:[
      intro("先解释两位的内心码",a.name+"内心码"+a.innerCode+"，参考关键词："+ia.positive+"。"+b.name+"内心码"+b.innerCode+"，参考关键词："+ib.positive+"。"),
      intro("把双方真正需要的东西对照","如果"+a.name+"把具体承担与照顾当成被重视的信号，而"+b.name+"更需要有时间观察、思考或被信任，就可能出现‘我努力做了，你却不说’与‘我想清楚才回应’的落差。两人要自己确认是否符合。"),
      intro("先别急着批评",a.name+"需要留意的课题可能是："+ia.watch+"；"+b.name+"可能是："+ib.watch+"。这些是反思线索，不代表任何人的真实行为或心理诊断。"),
      intro("生活例子","一方心情不好想被陪伴，另一方以为让对方独处就是尊重。两个人可以约定：不舒服时先问‘你想让我陪你，还是给你一点空间？’")
    ],
    loop:[
      intro("先点出双方可能的压力顺序","从"+a.name+"的主性格"+a.main+"、坐镇码过程"+(ca?.[1]||"待核对")+"，与"+b.name+"的主性格"+b.main+"、坐镇码过程"+(cb?.[1]||"待核对")+"出发，我们关注各自遇到压力时的沟通次序，而不是断定谁控制、谁逃避。"),
      intro("形成循环的可能场景","一方想解释清楚→另一方想先思考或解决→前者可能误解成冷淡→后者可能感到被催促。请对照真实事件核实或否定它。"),
      intro("可直接建议","不要在情绪最高的时候逼对方马上表态。先说‘我们暂停一下’，再共同约定一个具体恢复沟通的时间。"),
      intro("生活例子","当一个人说‘你为什么不回答我’，另一人说‘我需要想一想’，可以改为‘我想被你回应；你需要多久？我们约好几点再谈。’")
    ],
    scenarios:[
      intro("综合分析，不是贴数字标签","把"+a.name+"的因→过程→结果，与"+b.name+"的因→过程→结果放到同一件真实生活事件。先问双方各自要解决什么，再问谁做什么、何时确认。"),
      intro("沟通场景","一方想讨论方向、另一方想确认结果时，先约定：今天只交换意见，还是要做最终决定？"),
      intro("家庭责任和时间","不要猜对方会自动明白。一个任务讲清负责人、时间和遇到困难时怎样通知彼此。"),
      intro("金钱与未来","大额支出先讨论事实、预算、风险与双方同意的程序；不以号码预测财富，也不以号码决定财务控制权。")
    ],
    summary:[
      intro("结束照读","今天我们看到了不同的表达节奏、处理顺序和内心需要。重要的不是数字把两个人说成什么样，而是你们自己辨认哪些说中了、哪些没说中。"),
      intro("把结果变成小练习","接下来七天只选一件能被观察的小事：例如每周十五分钟不打断的对话，或写下一项明确的生活分工。"),
      intro("七天后的回访","回访时只问三个问题：实际做了什么、遇到什么困难、下一周准备怎么调整。不要用‘有没有变成某号人’衡量效果。")
    ]
  };
  const nextSteps=script.steps.map(step=>{
    const interaction=chooseFor(step.id,a,b);
    return {
      ...step,
      blocks:blocks[step.id] || [],
      interaction,
      caveat:"以上是双方数字与实际场景的联合咨询假设，请向两位核实；选择答案只改变接话提示，不会替顾客下结论。"
    };
  });
  return {
    ...script,
    version:"staging-relationship-prompter-v2",
    interactionKind:"contextual",
    focusTopics:Object.fromEntries(Object.entries(TOPICS).map(([k,v])=>[k,v.label])),
    exampleByTopic:Object.fromEntries(Object.entries(TOPICS).map(([key])=>[key,justOneThing(a,b,key)])),
    crossInsights:pair,
    steps:nextSteps,
    notes:[
      ...script.notes,
      "V2分段呈现双向互动假设，每段按开放式提问提供相关选项；顾客真实答案仍由咨询师面对面确认，不在后台自动保存。",
      "如有更多共同分析成员，本轮照读稿暂只分析主要顾客与第一位成员；不会将第三人的资料混入。"
    ]
  };
}
