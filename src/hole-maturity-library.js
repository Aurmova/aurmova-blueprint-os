// AURMOVA｜第十四章「黑洞＋成熟数字」教材 219–222页
// 生命数字与表现数字各自化简，求和后得到成熟数字1–9。
// 黑洞须核对6类已确认来源；个特数字公式未录入时禁止声称查出完整黑洞。
import { calculateHighPeakProfile, calculateChallengeProfile, calculateExpressionProfile, calculateInnerDriveProfile } from "./engine/blueprint.js?v=54";
import { calculateCycleEnvironment } from "./cycle-environment.js?v=1";

export const MATURITY_NUMBER_LIBRARY={
  meta:{
    title:"成熟数字｜表现数字＋生命数字",
    source:"教材《第十四章 黑洞＋成熟数字》第220–222页（AURMOVA白话为延伸整理）",
    formula:"生命数字＝阳历生日所有数字相加并化简至1–9；表现数字＝当前主要姓名的全部字母值相加并化简至1–9；成熟数字＝生命数字＋表现数字，再化简到1–9。",
    ageRule:"教材以约36岁后作为成熟主题更值得观察的时期。这是象征性观察，不是36岁必然发生的变化，也不是儿童当前人格。",
    distinction:"这里的生命数字不是坐镇码／主性格；成熟数字也不是特殊数字模块里有关卓越数字的「成熟提示」。",
    safety:"数字学属于象征性咨询框架，不得保证财富、地位、健康、宗教信仰、性格变化或具体事件；先向当事人核对真实经历。"
  },
  numbers:{
  "1": {
    "title": "独立开拓／主动担当",
    "core": "逐渐建立自主判断和独立处理事情的能力，愿意站出来负责。",
    "positive": "能够清楚决定方向、带领团队、尝试新事物。",
    "watch": "把成熟误解成任何事情都必须自己扛，可能不听意见。",
    "talk": "成熟数字1，教材谈的是中年以后更敢自己决定、承担和开创新方向。我会想确认，你现在是不是更能表达立场，也更愿意为自己的选择负责？",
    "question": "遇到别人不赞同时，你会坚持到底，还是先听听对方的理由？",
    "action": "用一件现实决定练习：自己提出方向，同时征求一位不同意见的人。"
  },
  "2": {
    "title": "温和耐心／理解关系",
    "core": "更能体会关系里的差异，表现温和、耐心、包容与体贴。",
    "positive": "擅长倾听、修复沟通、协调冲突，给予他人空间。",
    "watch": "为了和谐一直压抑需要，可能迟迟不做决定。",
    "talk": "成熟数字2，更像你经历一些事情后，慢慢懂得用温柔、耐心和理解去相处。你觉得自己近几年处理关系时，是否比过去更能听懂对方，也更敢说出真实感受？",
    "question": "你是在真心体谅，还是担心冲突所以不敢表达？",
    "action": "在一段重要关系中练习一件事：理解对方，同时清楚说出自己的需要。"
  },
  "3": {
    "title": "童心创意／享受表达",
    "core": "保留玩心与好奇，愿意体验有趣的新事物，表达创意和热情。",
    "positive": "保持创造性、乐趣、沟通活力和学习兴趣。",
    "watch": "用玩乐逃避责任，或过度依赖新鲜感。",
    "talk": "成熟数字3，不等于年纪大了才幼稚，而是经历之后仍保有好奇、创意和享受生活的能力。你有没有发现，自己越来越愿意尝试喜欢的事，也没那么怕别人怎么看？",
    "question": "你在享受创意时，会不会也能够把重要责任安排好？",
    "action": "安排一项喜欢的创作或体验，同时给它一个明确的小成果。"
  },
  "4": {
    "title": "稳重可靠／规划落实",
    "core": "随着历练更愿意建立秩序、长期安排、纪律和兑现承诺。",
    "positive": "有条理、可信任、做事踏实，能够将想法变为具体计划。",
    "watch": "太重视规则而失去弹性，或习惯什么都自己承担。",
    "talk": "成熟数字4，教材说的是你越经过一些生活考验，越能看见稳定和可靠的价值。别人可能愿意把事情交给你，因为你不仅会说，也会把它完成。你觉得像不像？",
    "question": "别人信任你之后，会不会常把过多责任都交给你？",
    "action": "把一个长期目标写成三步计划，明确责任和可调整空间。"
  },
  "5": {
    "title": "自在魅力／活在当下",
    "core": "逐渐学会享受当下、保持弹性、用开阔心态面对变化。",
    "positive": "较有吸引力、开放、洒脱，愿意体验生活。",
    "watch": "把自由理解成不用负责，或为了刺激不断换方向。",
    "talk": "成熟数字5，教材强调的是你经历过后慢慢明白，生活不一定要每件事都控制得很紧。你更愿意享受当下，也有自己的魅力。你现在的自由感，是来自懂得选择，还是因为想逃离压力？",
    "question": "什么时候的改变让你成长，什么时候的改变只是暂时想躲开问题？",
    "action": "选择一件真正想体验的事，并定下时间、预算和边界。"
  },
  "6": {
    "title": "关爱照顾／承担责任",
    "core": "更加重视照顾、关怀、家庭或亲近关系，也可能更关注个人形象与亲和力。",
    "positive": "愿意承担、照顾别人、创造温暖且可靠的关系。",
    "watch": "把照顾他人变成过度付出，失去对自己的照顾。",
    "talk": "成熟数字6，教材用妈妈般的爱心形容这种能量。我不会把它理解成你一定要当妈妈，而是看你是否越来越愿意关心、保护和承担。你会不会也有时候照顾别人太多，反而忽略自己？",
    "question": "你现在的责任是自己愿意承担，还是觉得不做就会内疚？",
    "action": "为一次照顾别人的行动同时设置自己的休息与分工界线。"
  },
  "7": {
    "title": "智慧沉淀／深入修养",
    "core": "随着经验累积，更重视知识、内在修养、深度理解和判断力。",
    "positive": "愿意钻研、独立思考、持续学习并整合经验。",
    "watch": "过度分析、孤立，或以自认懂得更多而否定他人。",
    "talk": "成熟数字7，教材强调的不只是知道很多，而是把经历变成真正的理解。你有没有发现自己近几年更喜欢思考事情背后的原因，不急着给答案？",
    "question": "遇到不熟悉的观点，你会更愿意研究，还是很快认定自己已经懂了？",
    "action": "选一个问题：先记录自己的判断，再找反例核对。"
  },
  "8": {
    "title": "格局管理／成熟成就",
    "core": "更重视能力、责任、资源管理、眼界及对成果的长期经营。",
    "positive": "决断力、组织力与格局可能随经验提高。",
    "watch": "只用金钱、地位或结果衡量自己及他人的价值。",
    "talk": "成熟数字8，教材用优秀、有格局来形容，但不代表你一定发财或心想事成。我们要看的，是你是否越来越懂得管理资源、承担权责，而且能把能力用在值得的地方。",
    "question": "当结果不如预期时，你能否调整做法，而不是否定自己？",
    "action": "为一项资源或事业目标写清收益、风险、责任与复盘方式。"
  },
  "9": {
    "title": "宽容智慧／同理众人",
    "core": "可能更重视人生意义、同理心、宽容和不同价值观。",
    "positive": "更能站在不同角度理解人，并把经验转为助人能力。",
    "watch": "把善良等同于无限奉献，或自认看透一切。",
    "talk": "成熟数字9，教材谈到人生智慧、包容与悲天悯人。我更想听你的真实故事：有没有经历一些事情后，你变得更能理解别人，同时也更知道什么不能牺牲？",
    "question": "你帮助别人时，能不能同时尊重对方选择并保护自己？",
    "action": "挑一件愿意帮助别人的事，先确定现实能力与边界。"
  }
}
};
export const BLACK_HOLE_NUMBER_LIBRARY={
  meta:{
    title:"黑洞数字｜六类位置交叉缺席",
    source:"教材《第十四章 黑洞＋成熟数字》第219–220页",
    definition:"教材将黑洞数字描述为：同一数字在六类位置都未出现，且黑洞数字数量不超过三种。与仅按生日三角形检索的缺失数不同。",
    sixPositions:["生命数字","表现数字","内驱数字","个特数字","高峰数字","挑战数字"],
    checkRule:"六类位置必须都已有课程确认的计算结果，才能判定黑洞数字。高峰与挑战各有四个阶段号码，需逐项纳入；挑战值0不属于1–9候选数字。",
    threshold:"原书提出黑洞数字不超过三种；若交叉筛查超过三种，需要进一步核对教材的限定逻辑，不能任意挑选三种。",
    analogy:"教材以毕业照里老师没坐却留下的空椅子为例，说明「未出现」不等于「毫无影响」。此比喻不可当作能证明一生受影响的事实。",
    boundary:"未确认个特数字公式，或姓名换算不完整时，只显示检查进度、不自动宣称任何黑洞数字；也不可据此预断健康、婚姻、财务或终身命运。"
  }
};
const escapeHtml=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const profileInput=c=>({displayName:c.name,officialName:c.officialName,formerName:c.formerName,nameChangedYear:c.nameChangedYear});

export function calculateMaturityProfile(c,now=new Date()){
  if(!c||!calculateCycleEnvironment(c.birthday,now))return null;
  const peak=calculateHighPeakProfile(c.birthday,now);
  const expression=calculateExpressionProfile(profileInput(c),now);
  const lifeNumber=peak.life.number;
  const nameNumber=expression.primary?.reduced??null;
  const eligible=Boolean(expression.canCalculate&&Number.isInteger(nameNumber)&&nameNumber>=1&&nameNumber<=9);
  const raw=eligible?lifeNumber+nameNumber:null;
  const reduced=eligible?((raw-1)%9)+1:null;
  const numberDetail=eligible?MATURITY_NUMBER_LIBRARY.numbers[reduced]:null;
  return {birthday:c.birthday,age:peak.age,lifeNumber,lifeRaw:peak.life.raw,
    lifePath:peak.life.path,nameNumber,expressionSource:expression.primarySource,
    nameCompound:expression.primary?.compound??null,requiresName:!eligible,
    canCalculate:eligible,raw,number:reduced,detail:numberDetail,
    post36:peak.age>=36,transitionRule:expression.transitionRule};
}
export function inspectBlackHoleSources(c,now=new Date()){
  if(!c||!calculateCycleEnvironment(c.birthday,now))return null;
  const peak=calculateHighPeakProfile(c.birthday,now);
  const challenge=calculateChallengeProfile(c.birthday,now);
  const expression=calculateExpressionProfile(profileInput(c),now);
  const inner=calculateInnerDriveProfile(profileInput(c),now);
  const sources=[
    {name:"生命数字",ready:true,values:[peak.life.number]},
    {name:"表现数字",ready:Boolean(expression.canCalculate),values:expression.canCalculate?[expression.primary.reduced]:[]},
    {name:"内驱数字",ready:Boolean(inner.canCalculate),values:inner.canCalculate?[inner.primary.reduced]:[]},
    {name:"个特数字",ready:false,values:[],reason:"独立计算规则尚未确认"},
    {name:"高峰数字",ready:peak.peaks.length===4,values:peak.peaks},
    {name:"挑战数字",ready:challenge?.values.length===4,values:challenge?.values??[]}
  ];
  const missingSources=sources.filter(s=>!s.ready).map(s=>s.name);
  return {ready:false,sources,missingSources,confirmedBlackHoles:null,
    note:missingSources.length
    ?("尚缺："+missingSources.join("、")+"。未达到六来源核对条件，不能宣布黑洞数字。")
    :"教材限定最多3个黑洞，完整判定规则需要进一步确认。"};
}
export function renderHoleMaturityPanel(c,childMode=false){
  const m=calculateMaturityProfile(c),h=inspectBlackHoleSources(c);
  if(!m||!h)return '<section class="foundation-block"><h3>黑洞＋成熟数字｜需要有效生日</h3></section>';
  const num=m.detail;
  const heading='<div class="card-heading"><div><small>CHAPTER XIV · MATURITY & BLACK HOLES</small><h3>黑洞＋成熟数字｜课程独立模块</h3></div><span>仅供Josephine</span></div>';
  const sourceBox='<div class="notion-consult-grid">'+h.sources.map(s=>
    '<div><small>'+escapeHtml(s.name)+'</small><p>'+escapeHtml(s.ready?s.values.join('、'):(s.reason||"资料不足，待确认"))+'</p></div>').join('')+'</div>';
  const maturity=m.canCalculate
    ?'<article class="card reading-card"><span class="reading-label">成熟数字 · '+m.number+'</span>'
      +'<h4>'+escapeHtml(num.title)+'</h4>'
      +'<p><b>计算过程：</b>生命数字 '+m.lifeRaw+' → '+m.lifeNumber+'；表现数字 '+escapeHtml(m.nameCompound)+' → '+m.nameNumber+'；合计 '+m.raw+' → '+m.number+'</p>'
      +'<p><b>核心成长主题：</b>'+escapeHtml(num.core)+'</p>'
      +'<p><b>可能的优势：</b>'+escapeHtml(num.positive)+'</p>'
      +'<p><b>可能的盲点：</b>'+escapeHtml(num.watch)+'</p>'
      +'<div class="formula-note"><b>年龄提示：</b>'+escapeHtml(childMode
      ?"儿童目前只作家长理解长期成长可能性的课程素材，不可据此断定孩子以后一定会成为哪种人。"
      :(m.post36?"已满36岁：可与顾客当下真实经历核对成熟主题。":"未满36岁：保留为未来观察主题，不断言会出现。"))+'</div>'
      +'<div class="question-box"><b>Josephine白话：</b>“'+escapeHtml(childMode?"孩子以后会怎样不能只由数字判断；我们先从他的真实兴趣、习惯及成长环境出发。":num.talk)+'”</div>'
      +'<div class="question-box"><b>现实追问：</b>“'+escapeHtml(childMode?"你希望孩子长大后保留哪一种优势？现在有哪些实际表现？":num.question)+'”</div>'
      +'<p><b>行动验证：</b>'+escapeHtml(childMode?"从孩子现在真实兴趣和实际需要安排适龄练习，不为36岁后的假设刻意塑造孩子。":num.action)+'</p></article>'
    :'<article class="card reading-card"><h4>成熟数字｜待补可计算姓名</h4><p>生命数字：'+m.lifeNumber+'；表现数字无法确认，所以暂时不算成熟数字。</p><p>'+escapeHtml(m.transitionRule)+'</p></article>';
  const hole='<article class="card reading-card"><span class="reading-label">黑洞数字 · 六类位置核对</span>'
    +'<h4>暂不自动断定黑洞号码</h4>'
    +'<p>'+escapeHtml(BLACK_HOLE_NUMBER_LIBRARY.meta.definition)+'</p>'
    +sourceBox+'<div class="formula-note"><b>核对状态：</b>'+escapeHtml(h.note)+'</div>'
    +'<details class="blueprint-expander"><summary>查看教材原规则与注意事项</summary><p>'+escapeHtml(BLACK_HOLE_NUMBER_LIBRARY.meta.checkRule)+'</p><p>'+escapeHtml(BLACK_HOLE_NUMBER_LIBRARY.meta.threshold)+'</p><p>'+escapeHtml(BLACK_HOLE_NUMBER_LIBRARY.meta.analogy)+'</p></details>'
    +'<div class="question-box"><b>Josephine可先问：</b>“你有没有发现，自己不常主动使用某种能力，但遇到特定现实情况时反而需要学习它？请举一个具体例子。”</div></article>';
  return '<section class="foundation-block hole-maturity-panel">'+heading
    +'<div class="formula-note"><b>来源：</b>'+escapeHtml(MATURITY_NUMBER_LIBRARY.meta.source)+'；'+escapeHtml(BLACK_HOLE_NUMBER_LIBRARY.meta.source)+'<br><b>独立算法：</b>'+escapeHtml(MATURITY_NUMBER_LIBRARY.meta.formula)+'</div>'
    +'<div class="reading-grid">'+maturity+hole+'</div>'
    +'<div class="formula-note"><b>安全边界：</b>'+escapeHtml(BLACK_HOLE_NUMBER_LIBRARY.meta.boundary)+' '+escapeHtml(MATURITY_NUMBER_LIBRARY.meta.safety)+'</div></section>';
}
