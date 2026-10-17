// AURMOVA | 11-step adult life-blueprint consultation, Staging pilot.
// The wording here is a consultation aid, not a psychological diagnosis or prediction.
// No customer answers or identifying information are embedded in this source file.
import {calculateBlueprint,ageFromBirthday,phaseForAge} from './engine/blueprint.js?v=54';
import {MAIN_DETAIL,DIGIT_CORE,getKnowledge} from './floot-knowledge.js?v=28';
import {buildOrderedFoundation} from './ordered-speaking-foundation.js?v=1';

const digit=n=>DIGIT_CORE[Number(n)]||{core:'需要结合实际情况核对',gift:'可以在真实生活中寻找证据'};
const pick=(s,n=170)=>String(s||'').trim().slice(0,n);
const joint=code=>{
  const d=getKnowledge(String(code))||{};
  return d.script?pick(d.script,190):d.logic?pick(d.logic,190):'这组三位联合码的完整位置解读仍需与原课程核对，暂时只记录顾客的实际经历。';
};
const code=v=>Array.isArray(v)?v.join(''):String(v||'');
const step=(id,title,say,question,transition,optional=false)=>({id,title,say,question,transition,optional});

export const LIFE_ELEVEN_TITLES=[
  '01｜主性格与最自然的自己',
  '02｜主性格 × 起始数',
  '03｜内心码与真正的需要',
  '04｜三角形内的优势与过度使用',
  '05｜思考、压力与沟通模式',
  '06｜潜意识与天赋观察',
  '07｜父母基因与缺失数字',
  '08｜人生三个阶段与当前课题',
  '09｜财富模式与个人价值创造',
  '10｜关系模式与沟通界线',
  '11｜人生总结与30天成长行动'
];
const next=[
 '我们已经初步认识你的主性格，接下来看看你刚进入一件事情时是怎样开始的。',
 '了解做事的起点以后，我们再看看你心里真正想得到什么。',
 '接下来把内在需要放回三角形，观察哪些优势反复出现、哪些地方容易用力过度。',
 '看完优势和可能的困难，我们把它们放进真实生活，谈谈你怎么想、怎么说，以及压力下怎样应对。',
 '接下来探索突发事件时的自动反应，以及已经被生活验证的能力。',
 '这一层只是线索，确认过后，再看看成长经验与需要练习的能力。',
 '接下来把已确认的习惯放入你目前的人生阶段。',
 '我们已经看到当前阶段的四组结构，接下来关注怎样把能力变成价值。',
 '谈清楚价值与收入以后，我们继续了解关系中的沟通和界线。',
 '最后只留下对你最有帮助的三个重点，并整理成30天的具体行动。',
 '咨询已完成。由Josephine检查顾客报告内容后，再决定是否导出。'
];
export function buildLifeElevenSteps({customer,now=new Date()}={}){
 if(!customer?.birthday)throw new Error('请先选择有正确生日的顾客档案。');
 const a=calculateBlueprint(customer.birthday);
 if(!a)throw new Error('生日格式不正确，请先核对日／月／年。');
 const base=buildOrderedFoundation({customer,type:'life'}).steps;
 const main=a.mainPersonality,inner=a.innerCode,starter=a.startingThoughtCode;
 const description=MAIN_DETAIL[main]||{},age=ageFromBirthday(customer.birthday,now);
 const phase=age<21?null:phaseForAge(age);
 const groups=phase?a.phases[phase]:null;
 const g=groups?['cause','process1','process2','result'].map(k=>code(groups[k])):[];
 const father=String(a.fatherCode),mother=String(a.motherCode),seat=String(a.seatCode);
 const missing=(a.innerEnergy?.missing||[]).map(String),repeated=(a.innerEnergy?.repeated||[]).map(String);
 const first4=base.slice(0,4).map((b,i)=>step(['main','main-start','inner','triangle'][i],LIFE_ELEVEN_TITLES[i],b.say,b.question,next[i]));
 const thinkSay=[
  '刚刚我们已经谈过你的优势。现在一起观察真正遇到事情时，你怎样思考、怎样行动、怎样讲话。',
  '主性格'+main+'这一层的思考线索是：'+pick(description.thinking,240),
  '压力来的时候，可以观察：'+pick(description.stress,220),
  '说话方式可以观察：'+pick(description.speech,220),
  '再结合内心码'+inner+'对「'+digit(inner).core+'」的需要，看看平时和被催促时是否出现不同反应。这些都先用真实生活事件核对。'
 ].join('\n\n');
 const subconsciousSay=[
  '上一段谈到的是日常习惯，现在我们来了解事情突然发生、来不及仔细考虑时的第一反应。',
  '这里的“潜意识码”属于AURMOVA课程术语；当前计算引擎与整理教材的公式尚不一致，所以Staging暂不把自动数值当作确定结果，也不作心理学测量结论。',
  '请先回想最近一次突发事件：你第一个念头是什么、第一件做的事又是什么？',
  '天赋数字的独立计算规则仍待核实。这里先只谈你已实际展现的能力，例如主性格'+main+'相关的「'+digit(main).gift+'」，再请你确认有没有真实例子。不要把重复挑战数字误当成独立的天赋计算结果。'
 ].join('\n\n');
 const familySay=[
  '接下来我们看看成长经历和一些值得练习的方向。“父亲基因”和“母亲基因”是数字图上的位置名称，不是生物遗传检测，不能直接判断真实父母的性格。',
  '父亲基因区 '+father+'：'+joint(father),
  '母亲基因区 '+mother+'：'+joint(mother),
  '请把这两个主题和实际家庭经验核对；即使生活中角色不同，也以顾客本人经历为准。',
  '基础内三角未出现的数字：'+(missing.length?missing.join('、'):'没有明显未出现的数字')+'。这只是课程定义的观察线索，不代表没有相应能力。挑战数字（重复）：'+(repeated.length?repeated.join('、'):'无明显重复')+'，前面讲过的内容不再重复贴标签。',
  '请顾客只挑一项与当前生活困扰有关的能力，讨论具体练习方法。'
 ].join('\n\n');
 const phaseSay=groups?[
  '你目前'+age+'岁，在这套课程里属于'+phase+'岁相关的人生阶段。这个阶段的重点，会依你的实际生活而不同。',
  '因／起点：'+g[0]+'，'+joint(g[0]),
  '过程一：'+g[1]+'，'+joint(g[1]),
  '过程二：'+g[2]+'，'+joint(g[2]),
  '结果／成长方向：'+g[3]+'，'+joint(g[3]),
  '我们不是把四组数念成必然命运，而是结合工作、合作、家庭或生活需要，看目前哪一条主题与你最有关。过程一与过程二是共同观察维度，不代表先后会发生。',
  '其他年龄阶段仅作参考，本次先把当前阶段讲清楚。'
 ].join('\n\n'):'这位顾客目前还不属于21岁起的成人三阶段；请改用相应年龄的咨询资料，不要套用成人阶段结论。';
 const wealthSay=[
  '我们现在不单凭一个数字谈财运，而是从实际价值、赚钱方式、金钱习惯和合作边界来整理。',
  '主性格'+main+'可先观察「'+digit(main).gift+'」，坐镇码'+seat+'则按因、过程、结果联想'+seat.split('').map((n,i)=>['起点','过程','结果'][i]+'：'+digit(n).core).join('；')+'。',
  '父亲基因'+father+'、母亲基因'+mother+'和本阶段的环境，只能提供进一步提问的方向；是否真的有收入潜力，要看技能、顾客需求、成本与现实结果。',
  '你目前的收入主要来自哪里？做事是否经常超出原本约定？谈收费、支出或合作条件时，哪件事最难？我们先核对真实数字和记录，不预测发财。',
  '如果顾客觉得钱留不住，先区分收入不足、必要开销、债务与可调整花费，不使用“漏财命”这样的标签。'
 ].join('\n\n');
 const relationshipSay=[
  '接下来谈你怎样表达、倾听、处理冲突及建立界线。这里是个人的关系习惯，不是双人关系蓝图，也不能替伴侣下性格结论。',
  '主性格'+main+'的沟通观察是：'+pick(description.speech,220),
  '内心码'+inner+'可观察你是否需要「'+digit(inner).core+'」。在压力时，这些需要有没有被你清楚说出来？',
  '当你在乎的人不理解你时，你通常会马上讲、忍住不说、先离开，还是自己把事情做掉？',
  '如果有人持续威胁、羞辱、控制或伤害，安全问题应优先处理，不能只用数字或双方沟通解释。'
 ].join('\n\n');
 const closingSay=[
  '今天我们不重新念完所有数字，只回顾已经由你自己的经历确认的三件事。',
  '第一，你有哪些值得继续发展的优势？请举出你真正做过的一件事。',
  '第二，哪一种习惯最影响你目前的生活？我们只选最想改善的一项。',
  '第三，接下来30天你愿意尝试哪一个小行动？什么时候开始？一周后怎样知道自己有没有练习？',
  '你不需要为了数字改变自己，也不需要一次改完所有事情。我不替你决定人生，我陪你看懂人生蓝图。',
  'Josephine将依据顾客确认的内容审核简洁报告；内部三角图、联合码、家庭细节和私人备注不自动输出。'
 ].join('\n\n');
 const rest=[
  step('thinking-communication',LIFE_ELEVEN_TITLES[4],thinkSay,'你最近一次压力很大或被误会时，是先怎么想、怎么说、怎么做的？',next[4]),
  step('subconscious-talent',LIFE_ELEVEN_TITLES[5],subconsciousSay,'最近一次事情突然发生，你第一反应是什么？有哪项能力是你已实际做得不错的？',next[5],true),
  step('family-missing',LIFE_ELEVEN_TITLES[6],familySay,'小时候哪一种相处方式影响了你现在？目前最想练习哪一种能力？',next[6],true),
  step('current-phase',LIFE_ELEVEN_TITLES[7],phaseSay,'这个年龄阶段，你最需要处理的是工作、关系、家庭，还是责任？最近有什么实例？',next[7],!groups),
  step('wealth-value',LIFE_ELEVEN_TITLES[8],wealthSay,'你目前最想改善的是收入来源、收费、支出、合作条件，还是时间分配？',next[8],true),
  step('relationship-boundary',LIFE_ELEVEN_TITLES[9],relationshipSay,'最近一次你没有被理解或不好意思拒绝时，发生了什么？你真正希望对方怎样回应？',next[9],true),
  step('close',LIFE_ELEVEN_TITLES[10],closingSay,'今天哪一点最有帮助？未来30天你愿意先做哪一件具体小事？',next[10])
 ];
 return {steps:[...first4,...rest],metadata:{age,phase,main,inner,starter,seat,father,mother,missing,repeated,subconsciousFormula:'PENDING_REVIEW',talentFormula:'PENDING_REVIEW',source:'staging'}}; 
}
