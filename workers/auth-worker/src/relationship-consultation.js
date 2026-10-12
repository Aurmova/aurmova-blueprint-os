// AURMOVA STAGING ONLY. Deterministic, owner-only, reviewable consultation
// notes. These are coaching prompts and interpretation hypotheses, NOT diagnoses
// or assertions about a couple's private life. No customer replies are stored.
import { DB as COURSE_CODES } from "../../../src/aurmova-knowledge.js";
import { PERSONALITY_LIBRARY } from "../../../src/personality-library.js";
import { INNER_DIGIT_POLARITY } from "../../../src/consultation-library.js";

const CODE_LABELS = Object.freeze({
  1:"主见与开创", 2:"沟通与共感", 3:"表达与行动",
  4:"秩序与稳定", 5:"方向与选择", 6:"责任与照顾",
  7:"分析与观察", 8:"目标与成果", 9:"远见与整合"
});
const CODE_INDEX = new Map();
for (const entry of COURSE_CODES) {
  // Preserve 573 versus 753 and 178 versus 718. Same course reference,
  // opposite order is never described as the same causal sequence.
  for (const code of String(entry.code).split("/")) CODE_INDEX.set(code, entry);
}
const choices = {
  fits:"符合", differs:"不符合", unsure:"不确定"
};
function short(s, limit = 180) {
  const input = String(s || "").trim();
  return input.length <= limit ? input : input.slice(0, limit).trim() + "…";
}
function libraryCodeNote(code) {
  const entry = CODE_INDEX.get(String(code));
  if (!entry) return { code, available: false, source: "课程联合码资料暂未匹配，需要人工核对。" };
  const paragraphs = String(entry.text).split("\n").map(line => line.trim()).filter(Boolean);
  const candidates = paragraphs.filter(line => /顺序差异|先确立|先观察|核心逻辑|成长方向/.test(line));
  let quote = "";
  // An exact order marker in the original course entry takes precedence.
  // 573 can use "573先..." but must not return the 753 clause as its own.
  for (const line of candidates) {
    const pos = line.search(new RegExp(String(code) + "先"));
    if (pos >= 0) {
      const remainder = line.slice(pos);
      const stopAt = remainder.search(/[；。]/);
      quote = stopAt >= 0 ? remainder.slice(0, stopAt + 1) : remainder;
      break;
    }
  }
  if (!quote && String(code) === "718" && /718较先观察/.test(entry.text)) {
    quote = "718较先观察环境与资源，再决定怎样承担。";
  }
  if (!quote) {
    const line = candidates.find(line => line.includes(String(code)));
    quote = line ? short(line, 150) : "该组联合码在课程内有资料，但具体顺序差异须人工核对。";
  }
  return { code: String(code), available: true,
    source: short(quote, 180), courseCode: entry.code };
}
function orderedCode(person) {
  const code = String(person.seatCode ?? "");
  if (!/^[1-9]{3}$/.test(code)) return null;
  const [a,b,c] = code.split("").map(Number);
  return {
    cause: { digit:a, meaning: CODE_LABELS[a] },
    process: { digit:b, meaning: CODE_LABELS[b] },
    result: { digit:c, meaning: CODE_LABELS[c] },
    course: libraryCodeNote(code)
  };
}
function inner(person) {
  const code = Number(person.innerCode);
  const v = INNER_DIGIT_POLARITY[code] || {};
  return { digit: code, need: short(v.positive || "待核对", 90), watch: short(v.negative || "待核对", 100) };
}
function character(person) {
  return PERSONALITY_LIBRARY[Number(person.main)] || {};
}
function first(arr) {
  return Array.isArray(arr) && arr.length ? arr[0] : "需结合顾客经历核对";
}
function step(id,title,script,question,match,notMatch,uncertain,task) {
  return {
    id,title,
    script, question,
    followUps:{ fits:match, differs:notMatch, unsure:uncertain },
    nextAction:task
  };
}
function quote(s) { return "“" + s + "”"; }

export function makeRelationshipConsultationScript(primary, partner) {
  if (!primary || !partner) return null;
  const a=primary, b=partner, pa=character(a), pb=character(b);
  const ca=orderedCode(a), cb=orderedCode(b);
  const ia=inner(a), ib=inner(b);
  if (!ca || !cb || !a.name || !b.name) return null;
  const aName=a.name,bName=b.name;
  const aMain=Number(a.main),bMain=Number(b.main);
  const fromStart = x => /^[1-9]$/.test(String(x.starting ?? "")) ? String(x.starting) : "待核对";
  const mainTitle=x => x.mainTitle ? "（"+x.mainTitle+"）" : "";
  const orderDesc=(person,code)=>person.name+" 的坐镇码是 "+person.seatCode+
    "，按现有课程的因—过程—结果顺序：因 "+code.cause.digit+"（"+code.cause.meaning+"）"+
    "，过程 "+code.process.digit+"（"+code.process.meaning+"），结果 "+code.result.digit+"（"+code.result.meaning+"）。";
  const jointCodes = [
    {name:aName,role:a.role,main:aMain,starting:a.starting,inner:ia,seat:a.seatCode,order:ca,missing:a.innerMissing || []},
    {name:bName,role:b.role,main:bMain,starting:b.starting,inner:ib,seat:b.seatCode,order:cb,missing:b.innerMissing || []}
  ];
  const steps = [
    step("opening","01｜开场与咨询目标",
      "今天不是要替你们判定合不合，而是借两个人的蓝图，讨论你们各自的表达、需要和合作方式。数字提供的是观察角度，不等于事实。我们会拿真实生活场景来核对，哪些符合就深入，哪些不符合就调整。",
      "你们今天最想改善的是沟通、情绪、相处时间、责任分配，还是金钱与未来计划？",
      "先请两位各讲一个最近发生的例子：当时做了什么、感受到什么、希望对方怎么回应？",
      "那我们不用先套数字标签。请讲一次让你觉得被理解或相处得很舒服的时刻。",
      "我先列出三个常见场景，你们挑最容易说的一个：讨论计划、发生误会、协调时间。",
      "确认一个主要议题，之后所有分析都回到这个议题。"),
    step("personality","02｜主性格 × 起始数：先看对外互动",
      aName+" 的主性格是 "+aMain+mainTitle(a)+"，课程常见优势可先观察："+first(pa.positive)+"；"+
      bName+" 的主性格是 "+bMain+mainTitle(b)+"，可以先观察："+first(pb.positive)+"。"+
      "两个人放在同一个场景里，不是简单相加：比如一方偏向"+first(pa.positive)+"，另一方偏向"+first(pb.positive)+"，"+
      "就可能对同一个决定有不同着重点。"+
      "起始数方面，"+aName+" 是 "+fromStart(a)+"、"+bName+" 是 "+fromStart(b)+"；我们先把它作为思考起点的核对线索。",
      "讨论旅行、开销或家事时，你们通常谁先提出想法？另一位通常怎样回应？",
      "谁更常觉得被打断或被催促？请分别说出自己当时想解决什么，而不先评判对方。",
      "那么你们有没有相反的例子？我们看是不是情境而不是固定性格造成差别。",
      "找一件最近的小决定，回顾发起者、回应者与共同确认的步骤。",
      "标注主要沟通差异，不对双方作好坏排名。"),
    step("seat","03｜两组坐镇码：分别讲因、过程、结果",
      orderDesc(a,ca)+" "+orderDesc(b,cb)+
      "这不是说谁必然怎样，而是顺着每一组的三个位置，看一件事怎样从出发点走到处理过程，再走到呈现的结果。"+
      (ca.course.available?" 课程参考："+ca.course.source:"")+" "+
      (cb.course.available?" 课程参考："+cb.course.source:""),
      "当出现意见不合，你们各自最初在意的是什么？接着各自做了什么？最后通常怎样收场？",
      "请各自用一件事拆成‘起因—处理过程—结果’，看是否符合各自数字顺序的提示。",
      "那这组码可能不适合解释这个场景。换成最近一次合作顺利的经历，看看有什么不同。",
      "如果还说不清，可让双方分别讲事件事实，不需要强行套上联合码。",
      "先记录当事人的真实过程，再决定课程联合码哪些部分值得用于咨询。"),
    step("inner","04｜内心码：各自真正需要什么",
      aName+" 的内心码是 "+ia.digit+"，课程常用关键词是："+ia.need+"；可能需要留意："+ia.watch+"。"+
      bName+" 的内心码是 "+ib.digit+"，课程常用关键词是："+ib.need+"；可能需要留意："+ib.watch+"。"+
      "因此同一件事情，一位可能特别在意被照顾或责任，另一位可能更在意思考空间或被理解。"+
      "这些只是咨询假设，要让你们自己确认真正的需要。",
      "当你很累或心情不好时，你最希望对方做哪一件具体的事？对方平时真的知道吗？",
      "请各说一句‘当我___时，我希望你___’，让需要变成可听见的请求。",
      "那我们不把号码解释当成你的需要。你实际更想要的是空间、陪伴、帮助，还是清楚的承诺？",
      "如果暂时说不出，请回想上周一次被照顾到的小事。",
      "各自写下一种希望对方提供的具体回应，不要求猜心。"),
    step("loop","05｜冲突循环：压力、误会与修复",
      "我们把主性格、坐镇码过程和内心码结合起来观察："+
      aName+" 在压力下可留意"+first(pa.negative)+"，"+
      bName+" 可留意"+first(pb.negative)+"。"+
      "一方可能以表达、解释或行动回应压力，另一方可能用推进结果、回避或先思考处理；"+
      "双方感受不一致时就可能出现‘越解释越急、越急越难听见’之类的循环，但这要靠实例验证。",
      "最近一次不愉快，是哪一句话让事情开始变紧张？接着两个人分别做了什么？",
      "从一句原话开始，把双方当时真正想表达的意思重新翻译一遍。",
      "如果你们很少吵架，就分析一次小误会或有压力的决定，不必制造冲突。",
      "先不用马上回答；各自想一想‘什么时候我会想退出对话或继续追问’。",
      "约定争执时暂停与恢复沟通的方式，例如冷静后约一个时间再谈。"),
    step("scenarios","06｜具体相处：沟通、金钱与责任",
      "我们分别看看三个真实层面：日常沟通有没有让双方都被听见；关于家务或时间有没有清楚分工；"+
      "花钱和重大决定是否有共同约定。"+
      "数字不能替你们决定财务或关系结果，真正重要的是两个人怎么讨论、怎样执行与复盘。",
      "哪一件事情最容易出现‘我以为你知道’？家务、陪伴时间、金钱还是家人界限？",
      "给这件事订一条明确规则：谁负责、什么时候回应、分歧时怎样再讨论。",
      "看来这一项已经做得不错，那你们想保留的相处习惯是什么？",
      "可以先各选一个小场景，不必一次谈所有问题。",
      "只选一个双方都愿意的小调整，不给任何一方单方面贴责任标签。"),
    step("summary","07｜总结与七天练习",
      "今天我们没有要把 "+aName+" 定义成某一种人，也不是说 "+bName+" 一定会怎样。"+
      "我们真正找到的是：你们可以从各自的出发点、沟通节奏和情感需要中，挑出一个能一起练习的小地方。"+
      "先练七天，再看哪些变化真的让关系更顺。",
      "如果接下来七天只改变一件相处小事，你们愿意一起试哪一件？",
      "约定一个具体练习时间和做法，并请两人都说出自己愿意付出的部分。",
      "不需要认同所有解析。只保留你们真实认可、愿意实践的部分。",
      "如果暂时无法决定，可以从‘每周一次十五分钟的平静对话’开始。",
      "七天后复盘：什么做到了、什么困难、下一周需要怎样调整。")
  ];
  return {
    version:"staging-relationship-prompter-v1",
    title:aName+" × "+bName+"｜关系蓝图咨询提词稿",
    people:[{ name:aName,main:aMain,inner:ia.digit,seat:a.seatCode },
            { name:bName,main:bMain,inner:ib.digit,seat:b.seatCode }],
    codeEvidence:jointCodes.map(person=>({
      name:person.name, code:person.seat, source:person.order.course.source,
      available:person.order.course.available,
      courseCode:person.order.course.courseCode || null
    })),
    notes:[
      "全部字段仅供管理员后台使用；这是数字学课程模型的咨询假设，必须依据顾客反馈确认。",
      "课程联合码引用需区分顺序，例如 573≠753，718≠178；当前使用各人的坐镇码 MNO，而不是把不同位置的联合码混作同一含义。",
      "本版本不自动保存顾客对问题的回答。请勿把测试页面用于真实顾客资料。"
    ],
    responseOptions: choices,
    steps
  };
}
