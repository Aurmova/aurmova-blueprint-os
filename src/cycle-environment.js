// AURMOVA｜第十三章：循环数字解读（教材第213–218页）
// 循环数字＝出生月／日／年分别化简，并借用现有四高峰的年龄边界。
// 独立于黄金流年、21–40／41–60／61+三阶段、主性格、姓名性情数字。
import { calculateHighPeakProfile, calculateChallengeProfile } from "./engine/blueprint.js?v=54";

export const CYCLE_ENVIRONMENT_LIBRARY = Object.freeze({
  meta:{
    title:"循环数字解读｜三个环境阶段",
    source:"第十三章《循环数字解读》213–218页；AURMOVA咨询白话为教材延伸，不是原书逐字引用。",
    definition:"按教材，观察不同成长阶段所处的人文、家庭及人际环境主题；象征性参考而非现实环境的确定判断。",
    formula:"阳历月、日、年各自数字相加并化简至1–9。第一循环=月；第二循环=日；第三循环=年。",
    timeline:"第一循环对应第一高峰／第一挑战的年龄段；第二循环对应第二与第三高峰／挑战的年龄段；第三循环对应第四高峰／挑战的年龄段。沿用已实现的高峰边界，不与AURMOVA 21–40／41–60／61+三阶段混算。",
    boundaries:"此模块只针对私人咨询提供观察假设。不得凭数字断言父母性格、家庭收入、童年创伤或未来环境；需要当事人真实经验验证。"
  },
  numbers:{
  "1": {
    "title": "独立、自信、开拓",
    "environment": "较容易接触独立、有主见、讲效率、重视自我负责的人际环境。",
    "positive": "培养自主、勇敢尝试、主动承担和开拓意识。",
    "watch": "过度强调坚强与效率时，可能不习惯求助或示弱。",
    "first": "早期家庭可能比较强调独立与纪律；要观察是否有人主导大多数决定，孩子能否表达不同意见。",
    "talk": "你小时候的家庭会不会比较强调独立？很多事情被期待自己做好，家里也可能有人比较强势。这样的环境可能让你学会坚强，但会不会也让你不太习惯向别人求助？",
    "parentQuestion": "孩子在家可以表达不同意见吗？做错事时，大人更常先沟通还是直接要求服从？",
    "adultQuestion": "在重要选择中，你什么时候会自己决定，什么时候愿意寻求支持？"
  },
  "2": {
    "title": "温和、包容、连接",
    "environment": "人际氛围较重视照顾、相互回应、和谐相处与协作。",
    "positive": "容易学习倾听、体谅他人、协调与合作。",
    "watch": "若过于重视和气，个人需要或不同意见可能难以表达。",
    "first": "教材提到家中可能存在较温柔的男性长辈，也可能有话语权不平衡的情况；不得据此直接断言父母角色。",
    "talk": "你成长的环境是不是比较重视相处与和气？大家会互相关心，但你有没有时候先照顾别人开不开心，才想到自己真正需要什么？",
    "parentQuestion": "孩子表达不满时，大人会认真听吗？家庭是否习惯为了和气回避冲突？",
    "adultQuestion": "你在关系里如何平衡照顾别人和表达自己？"
  },
  "3": {
    "title": "欢乐、创意、表达",
    "environment": "周围较容易接触表达、社交、艺术、审美、分享及轻松玩乐。",
    "positive": "鼓励想象力、审美、表达与创意互动。",
    "watch": "如果过度看重面子和别人评价，表达可能变成压力。",
    "first": "家长可能较在乎成绩、才艺、外表或社会评价；需要核对孩子是否有犯错和尝试的安全感。",
    "talk": "你小时候会不会比较常被注意成绩、才艺、穿着或别人怎么看你？这可能帮助你学会表达，也可能让你担心自己做得不够好。",
    "parentQuestion": "孩子失败时，大人更在意孩子的感受，还是别人会怎样评价？",
    "adultQuestion": "什么场合让你自在表达？什么时候会因别人的眼光变得拘谨？"
  },
  "4": {
    "title": "稳定、规律、承诺",
    "environment": "身边较强调秩序、规则、计划、长期承诺和可靠关系。",
    "positive": "培养责任感、耐心、规划、守信与稳定习惯。",
    "watch": "规定过多会压缩探索空间，让变化显得可怕。",
    "first": "家庭可能有较固定的规矩与标准；要验证这些规矩是否合理、是否允许孩子提问。",
    "talk": "你成长的环境会不会比较有规矩？什么应该怎样做，大人都有标准。这样的环境可能帮助你变得负责，但会不会也让你很怕犯错？",
    "parentQuestion": "孩子能问为什么吗？规则会不会随着年龄和实际需要调整？",
    "adultQuestion": "当计划突然改变时，你怎样让自己重新适应？"
  },
  "5": {
    "title": "自由、变化、探索",
    "environment": "接触多样的生活方式，较有流动性，重视新鲜体验和个人选择。",
    "positive": "培养好奇心、适应力、灵活思考和自主探索。",
    "watch": "搬家、转校或安排频繁变动时可能缺乏稳定感。",
    "first": "孩子可能享有相对自由的空间，也可能经历较多变化；不能把「自由」直接等同于安全或放任。",
    "talk": "你小时候比较自由，还是生活变化比较多？你喜欢改变，是因为享受新体验，还是因为过去已经习惯不断适应？",
    "parentQuestion": "面对临时改变计划，孩子会兴奋、紧张还是不知所措？",
    "adultQuestion": "你最需要哪一种自由，又需要什么稳定作为支撑？"
  },
  "6": {
    "title": "关爱、家庭、责任",
    "environment": "环境通常比较重视家人、照顾、分享、温暖和承担责任。",
    "positive": "学习同理心、照顾别人、承诺与关系维护。",
    "watch": "可能把被爱与懂事、表现好或不断付出联系在一起。",
    "first": "要观察父母是否用「达到标准才肯定」的方式教育孩子；不能推定孩子一定被有条件地爱。",
    "talk": "你小时候会不会觉得，自己乖一点、懂事一点，把事情做好，大人就会比较开心？如果是这样，你现在会不会也很习惯先照顾别人？",
    "parentQuestion": "孩子没达到期望时，家长能否仍明确表达爱和支持？",
    "adultQuestion": "你在承担责任时，能不能保留自己的需要与界线？"
  },
  "7": {
    "title": "知识、研究、精神探索",
    "environment": "容易接触学习、文化、研究、分析和内在探索的人际圈。",
    "positive": "培养求知欲、专注、思考和深入研究的习惯。",
    "watch": "过分强调学习可能挤压社交、休息与尝试兴趣的空间。",
    "first": "家长可能较重视学习与身心发展，也可能把过多时间压在功课上；需核对现实安排。",
    "talk": "你的成长环境会不会比较重视学习、知识和思考？小时候除了读书，你有没有足够时间玩、交朋友或发展真正喜欢的兴趣？",
    "parentQuestion": "孩子能自行选择部分兴趣吗？学习以外的努力有没有被认可？",
    "adultQuestion": "你什么时候喜欢深入研究，什么时候需要走出来和人交流？"
  },
  "8": {
    "title": "资源、成就、权力",
    "environment": "周围可能较强调物质条件、目标、管理、资源与实际成果。",
    "positive": "培养结果意识、执行力、资源安排和现实判断。",
    "watch": "可能过分重视成败、控制权、财富或社会地位。",
    "first": "家庭可能重视孩子发展并尽力提供资源，也可能希望孩子照既定方向走；不能据此断言经济富裕。",
    "talk": "你小时候家里会不会比较重视成绩、能力或未来发展？有人愿意给你支持，却也希望你照着他们认为最好的方向选择吗？",
    "parentQuestion": "父母提供资源时，会同时尊重孩子的想法吗？孩子可以失败再试吗？",
    "adultQuestion": "你在追求成果时，如何兼顾自己真正认同的价值？"
  },
  "9": {
    "title": "慈悲、包容、大爱",
    "environment": "周围可能强调善意、关怀、奉献、公益与群体连结。",
    "positive": "培养同理心、责任感、助人和分享。",
    "watch": "过度强调无私可能忽略个人需要与健康界线。",
    "first": "教材描述孩子可能受到亲友、长辈或社群照顾；需要了解真实支持系统而非直接推断。",
    "talk": "你小时候有没有受到不少人的照顾，除了父母还有亲戚或长辈？这可能让你比较关心别人，但你是否也敢提出自己的需要？",
    "parentQuestion": "孩子帮助别人时，是否明白自己有权拒绝？家庭会不会尊重界线？",
    "adultQuestion": "你关心别人时，怎样保留照顾自己的空间？"
  }
}
});

function validDate(input){
  const m=String(input||"").trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if(!m)return false;
  const dd=Number(m[1]),mm=Number(m[2]),yyyy=Number(m[3]);
  if(yyyy<1000||mm<1||mm>12)return false;
  const lastDay=new Date(Date.UTC(yyyy,mm,0)).getUTCDate();
  return dd>=1&&dd<=lastDay;
}
export function calculateCycleEnvironment(birthday,now=new Date()){
  if(!validDate(birthday))return null;
  const peak=calculateHighPeakProfile(birthday,now);
  if(!peak)return null;
  const challenge=calculateChallengeProfile(birthday,now);
  const phases=peak.phases;
  const cycleRows=[
    {index:1,label:"第一循环",origin:"月",number:peak.source.month.number,raw:peak.source.month.raw,phaseIndices:[1]},
    {index:2,label:"第二循环",origin:"日",number:peak.source.day.number,raw:peak.source.day.raw,phaseIndices:[2,3]},
    {index:3,label:"第三循环",origin:"年",number:peak.source.year.number,raw:peak.source.year.raw,phaseIndices:[4]}
  ].map(row=>{
    const group=phases.filter(p=>row.phaseIndices.includes(p.index));
    const start=group[0].start,end=group[group.length-1].end;
    const active=row.phaseIndices.includes(peak.current.index);
    return {...row,active,start,end,range:end===null?`${start}岁以后`:`${start}–${end}岁`,
      peakNumbers:group.map(p=>p.number),challengeNumbers:(challenge?.phases||[]).filter(p=>row.phaseIndices.includes(p.index)).map(p=>p.number),
      detail:CYCLE_ENVIRONMENT_LIBRARY.numbers[row.number]};
  });
  return {valid:true,birthday,age:peak.age,numbers:cycleRows.map(x=>x.number),cycles:cycleRows,
    current:cycleRows.find(x=>x.active),note:CYCLE_ENVIRONMENT_LIBRARY.meta.timeline};
}

const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function renderCycleEnvironmentPanel(customer,childMode=false){
  const profile=calculateCycleEnvironment(customer?.birthday||"");
  if(!profile)return '<div class="foundation-block"><h3>循环数字｜等待有效阳历生日</h3><p>请输入日／月／年格式生日后再查看。</p></div>';
  const m=CYCLE_ENVIRONMENT_LIBRARY.meta;
  const columns=profile.cycles.map(row=>{
    const d=row.detail;
    const start='<article class="card reading-card"><span class="reading-label">'+row.label+(row.active?' · 当前阶段':'')+'</span>'
      +'<h4>'+row.number+'号 · '+esc(d.title)+'</h4>'
      +'<p><b>年龄段：</b>'+esc(row.range)+'；高峰：'+row.peakNumbers.join('、')+'；挑战：'+row.challengeNumbers.join('、')+'</p>'
      +'<p><b>环境主题：</b>'+esc(d.environment)+'</p>'
      +'<p><b>正向支持：</b>'+esc(d.positive)+'</p>'
      +'<p><b>可能的限制：</b>'+esc(d.watch)+'</p>';
    const family=row.index===1?'<p><b>第一循环｜家庭视角：</b>'+esc(d.first)+'</p>'
      +'<div class="question-box"><b>亲子核对：</b>'+esc(d.parentQuestion)+'</div>':'';
    const talk='<div class="question-box"><b>Josephine白话：</b>“'+esc(d.talk)+'”</div>';
    const question='<div class="question-box"><b>'+(childMode?'与家长进一步确认：':'进一步追问：')+'</b>“'+esc(childMode&&row.index===1?d.parentQuestion:d.adultQuestion)+'”</div>';
    return start+family+talk+question+'<p><small>顾客说不像：先问具体经历，不将数字解释硬套成事实。</small></p></article>';
  }).join('');
  return '<section class="foundation-block cycle-environment-panel">'
    +'<div class="card-heading"><div><small>LIFE CYCLE · ENVIRONMENT</small><h3>循环数字｜月 · 日 · 年的环境主题</h3></div><span>'+profile.numbers.join('－')+'</span></div>'
    +'<div class="formula-note"><b>计算：</b>'+esc(m.formula)+'<br><b>本次结果：</b>'+profile.cycles.map(x=>x.label+' '+x.origin+' '+x.raw+' → '+x.number).join('；')+'</div>'
    +'<div class="formula-note"><b>当前：</b>'+esc(profile.current.label)+' · '+esc(profile.current.range)+'。<br><b>阶段规则：</b>'+esc(m.timeline)+'</div>'
    +'<div class="reading-grid">'+columns+'</div>'
    +'<div class="formula-note"><b>咨询边界：</b>'+esc(m.boundaries)+'</div>'
    +'</section>';
}
