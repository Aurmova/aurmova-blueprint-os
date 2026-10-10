// AURMOVA 私人教学｜合作密码（性格磁场）
// 原书参考：用户上传《最实用的数字性格分析学》第241页及相邻续页。
// AURMOVA经咨询师确认采用「双方主性格O位相加化简」作为磁场；原书生命数公式仅作为来源留档。
// 原文说明排除夫妻。本工具限定伙伴、朋友、亲子三种用途；夫妻／情侣不会自动生成。
// 传统数字心理学没有经过科学验证，不可作为经济、关系或命运预测。
import { calculateBlueprint } from "./engine/blueprint.js?v=54";

export const COOP_MAGNETIC_META=Object.freeze({
 source:"《最实用的数字性格分析学》合作密码（性格磁场），用户照片第241页及紧接续页",
 formula:"AURMOVA目前统一规则：先计算双方各自主性格O位（1–9），把两个O位相加再化简至个位，例如O6＋O4＝10→1。",
 textbookFormula:"原书第241页原本以两人的生命数相加（例如33/6＋31/4，取6＋4＝10→1）。这是教材原始算法，保留供学习，不用于正式网页自动计算。",
 difference:"45组配对和合作磁场都读取双方O位，但分析方式不同：45组按两个主性格查互动优势／摩擦；合作磁场把两个O位相加化简为1–9。原书生命数相加是另一取数法，仅资料库留档，正式界面不会出现第二个磁场结果。",
 scope:"参照原书适用对象：亲子、朋友、合作伙伴；不自动应用于夫妻／情侣。AURMOVA只改变取数为O位，未扩大原书适用范围；多人合作须逐人分析，不虚构三人合成公式。",
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
// 亲子不照念成人的金钱或事业暗示；这是AURMOVA基于课程主题设计的独立亲子提问。
export const COOP_MAGNETIC_PARENT_CHILD_GUIDES=Object.freeze({
 1:{title:"共同创造与独立尝试",meaning:"一起想新点子、让孩子练习自主表达",script:"“这一组我们可以观察家长和孩子在一起时，是否很愿意尝试新方法。可以给孩子适龄选择，也要听听他是否喜欢这个安排，不必要求孩子事事跟着大人行动。”",question:"孩子想尝试新东西时，家长通常会怎样回应？",action:"一起完成一个可自由发挥的小活动。"},
 2:{title:"倾听与实际沟通",meaning:"聊很多不代表双方真的听懂",script:"“亲子版的2我们主要看沟通。你们可能很爱聊天，但孩子表达的需要是否被大人真正听见？家长也可以先少一点说教，多问一句孩子希望怎样被帮助。”",question:"孩子最近最想让家长认真听懂的事情是什么？",action:"每天留10分钟不打断地听孩子说话。"},
 3:{title:"活力与行动节奏",meaning:"两人容易想了就做，适合练习安全的行动边界",script:"“这组我们可以观察你们是不是都想快点开始。孩子有热情是好事，大人要做的是帮他注意安全、学会等待，而不是说这个数字表示孩子会冲动出事。”",question:"孩子和家长意见都来得很快时，怎样先商量再行动？",action:"共同制定一个先想一想、再开始的小步骤。"},
 4:{title:"规律与安全感",meaning:"家长和孩子一起建立适合年龄的生活习惯",script:"“这一组可以用来讨论规律。孩子是否知道做一件事的步骤，也知道遇到问题可以求助？家长可以订明确且温和的规则，别因为追求稳定而让孩子害怕犯错。”",question:"目前哪项生活规律最常引起亲子冲突？",action:"共同设计一个简短、可执行的家庭小流程。"},
 5:{title:"分心与优先事项",meaning:"关注家庭活动过多、步骤太杂时的注意力与支持",script:"“亲子版5不是说孩子有障碍或容易发生坏事，而是问你们最近是不是安排太多，孩子不知道先做哪一件。减少任务、分步骤、让他一次专注一项，会比责备更有帮助。”",question:"孩子最近是不是被很多安排打断，难以完成一件事情？",action:"减少一项非必要安排，一次只练习一个目标。"},
 6:{title:"照顾与责任分担",meaning:"互相关心但不能让孩子承担成人的金钱责任",script:"“原书成人合作的6用到了合财的说法，但那不能套在孩子身上。亲子关系我们只讨论照顾和责任：大人怎样支持孩子，孩子又能做什么适龄的小任务。没有所谓孩子会给父母带财的判断。”",question:"家长是否把孩子的懂事当作必须承担太多责任？",action:"安排一个适龄家务任务，并让孩子知道可以求助。"},
 7:{title:"朋友与支持网络",meaning:"观察孩子在家庭以外的交往支持和隐私边界",script:"“亲子版7可以用来谈学校、朋友和向人求助。我们不按数字预测孩子会遇到贵人，而是看他现实中有没有可信任的人，以及家长如何在尊重隐私的前提下提供支持。”",question:"孩子遇到难题时，愿意向哪些值得信任的人求助？",action:"和孩子列出两位遇事可以求助的人。"},
 8:{title:"成长目标与压力分担",meaning:"有目标的同时留意儿童可承受的学习和情绪压力",script:"“亲子版8不讲做大平台或发财，而是看目标和压力。我们可以一起确认家庭对成绩、比赛或表现的期待，是否超过孩子当前能承担的程度。鼓励努力，也要允许他休息。”",question:"孩子最近是不是特别担心自己达不到家长的期待？",action:"共同选一个可实现的小目标并预留休息。"},
 9:{title:"共同梦想与实践",meaning:"把想象和期待变成孩子真正感兴趣的适龄活动",script:"“亲子版9可以讨论梦想和创作，但不是说孩子注定成功。我们可以鼓励孩子讲讲自己的愿望，再陪他做一个很小的尝试。重要的是理解他的真实兴趣，不是用大人的目标代替孩子的选择。”",question:"孩子最想尝试的一件事，是否出于他自己的兴趣？",action:"陪孩子把一个愿望转成一项有趣的小行动。"}
});
// 友情版不套用企业营收、合同、平台扩张等成人商业主题。
export const COOP_MAGNETIC_FRIEND_GUIDES=Object.freeze({
 1:{title:"创意与彼此空间",meaning:"一起尝试活动，也尊重各自爱好。",watch:"如果双方都想按自己的方式安排，可能需要协调彼此的时间。",script:"“朋友之间的合成1，我们可以讨论你们会不会互相带来新点子，也能不能保留自己的空间。这不是说友情一定会成功，更不会因1号就有钱。先问你们一起做什么最开心，以及不同意见怎么沟通。”",question:"一方想尝试新活动、另一方不想时通常怎样商量？",action:"共同决定一项双方愿意尝试的小活动。"},
 2:{title:"倾听与聊天",meaning:"一起聊天分享感受，重点是有没有真正互相倾听。",watch:"可能说了很多，却没有听清彼此真正需要什么。",script:"“朋友的合成2，可以观察你们是不是有很多共同话题。但朋友聊得投机也要注意，是不是双方都能好好说话、认真听，不需要每次都给建议。”",question:"你想倾诉时，对方会耐心听还是急着下判断？",action:"一次聊天中让彼此各说完一件重要的事。"},
 3:{title:"活跃与尊重节奏",meaning:"朋友一起做事有活力，也要尊重对方是否准备好。",watch:"如果活动临时决定太快，可能使人不舒服。",script:"“朋友之间合成3，可以谈你们有没有一起行动的活力；不过一方想马上出门，另一方需要先安排，也很正常。尊重彼此节奏比配对数字更重要。”",question:"有没有因为临时邀约而产生误会？",action:"下次安排活动时先问双方时间和意愿。"},
 4:{title:"可靠与相互承诺",meaning:"重视稳定的友情与合理的承诺。",watch:"如果太在意规则，可能把一次临时改变看成不重视。",script:"“朋友的合成4可以谈可靠和信任。你们可能希望对方答应的事情能做到，但偶尔临时有事也需要沟通。真正重要的是遇到变化时怎样互相理解。”",question:"朋友临时改约时，你通常怎么想？",action:"清楚约定一次聚会安排和可以变更的范围。"},
 5:{title:"杂事与联络节奏",meaning:"生活事情多时学习筛选活动与维持联系。",watch:"联系减少不代表友谊一定变坏，先核对现实原因。",script:"“朋友的合成5可以当作忙碌与分心的提醒。我们不会说你们一定有阻碍，而是看看双方工作和生活杂事是不是让联系变少了。如果是，可以找一个双方都没有负担的方式维持关系。”",question:"最近是不是双方太忙，想联系却一直拖延？",action:"用双方都方便的方式安排一次简单联系。"},
 6:{title:"关怀与相互付出",meaning:"强调支持与照顾，不把课程「合财」当成友情赚钱预言。",watch:"过度付出或期待对方随时回应，容易消耗关系。",script:"“朋友关系合成6，我们只讨论支持和付出：你们在困难时愿不愿意互相帮忙，也懂不懂拒绝超出能力的请求。原书的合财是商业语境，不代表朋友一定会带财。好的友情也需要边界。”",question:"帮助朋友的时候，你是否也能说出自己做不到的部分？",action:"练习一次真诚表达需要或界线。"},
 7:{title:"朋友资源与信任",meaning:"通过朋友接触不同见解，同时保护隐私和信任。",watch:"朋友认识的人多，不代表一定能为你解决问题。",script:"“朋友的合成7可以讨论人际连接。你们也许能分享不同的生活见闻，但并不代表朋友多就一定有贵人。介绍任何人的联系方式前都要先得到同意。”",question:"你们的关系中哪些互相帮助是双方真正同意的？",action:"分享一条对双方都有帮助、且不涉及他人隐私的信息。"},
 8:{title:"一起成长与压力界线",meaning:"朋友可以鼓励彼此进步，但不需要比较成就。",watch:"若一方不断催促另一方改变，会带来压力。",script:"“朋友的合成8不是说你们会一起做大生意，而是看看两个人会不会互相激励，也会不会因比较而累。朋友可以互相支持成长，但每个人的节奏要自己决定。”",question:"当朋友做得更好时，你是被鼓舞还是会感到压力？",action:"各自分享一个目标，用支持代替比较。"},
 9:{title:"共同理想与现实陪伴",meaning:"朋友可以一起讨论梦想，也能互相支持小小实践。",watch:"理想不完全一致，不代表友情不值得保留。",script:"“朋友合成9可以谈共同的兴趣和理想。你们也许喜欢一起聊未来，但不需要每个梦想都一样。真正的友谊还包括尊重不同意见，以及在现实生活里愿意互相支持。”",question:"你们的梦想不同的时候，能不能仍然为对方开心？",action:"互相了解一件对方在乎的事，并给予尊重。"}
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
export function calculateMagneticNumber(oA,oB){
 if(!Number.isInteger(oA)||!Number.isInteger(oB)||oA<1||oA>9||oB<1||oB>9)return null;
 const sum=oA+oB,steps=[sum];let number=sum;
 while(number>9){number=digits(number).reduce((a,b)=>a+b,0);steps.push(number);}
 return {a:oA,b:oB,sum,steps,number,formula:oA+"＋"+oB+"＝"+(sum===number?String(number):sum+"→"+number)};
}
export function prepareCooperationMagneticField(birthdayA,birthdayB,kind="cooperation",ctx={}){
 if(!["cooperation","friendship","parentChild"].includes(kind))return null;
 if(!strictBirthday(birthdayA)||!strictBirthday(birthdayB))return null;
 // 永远按两个人自己的蓝图O位计算；不采用旧代码传入的生命数或外部回传的数值。
 const blueprintA=calculateBlueprint(birthdayA),blueprintB=calculateBlueprint(birthdayB);
 const oA=blueprintA?.mainPersonality,oB=blueprintB?.mainPersonality;
 const numberInfo=calculateMagneticNumber(oA,oB);
 if(!numberInfo)return null;
 return {
  aName:String(ctx.aName||"当事人").trim()||"当事人",
  bName:String(ctx.bName||"另一方").trim()||"另一方",
  kind,numberInfo,guide:COOP_MAGNETIC_GUIDES[numberInfo.number],
  mainA:oA,mainB:oB,
  calculationBasis:"O",method:"AURMOVA主性格O位合成（非原书生命数）"
 };
}
export function renderCooperationMagneticField(birthdayA,birthdayB,kind="cooperation",ctx={}){
 const p=prepareCooperationMagneticField(birthdayA,birthdayB,kind,ctx);if(!p)return "";
 const g=p.guide,e=htmlEscape,n=p.numberInfo;
 const cg=kind==="parentChild"?COOP_MAGNETIC_PARENT_CHILD_GUIDES[n.number]:null;
 const fg=kind==="friendship"?COOP_MAGNETIC_FRIEND_GUIDES[n.number]:null;
 const guideForContext=cg||fg;
 const label=kind==="cooperation"?"合作伙伴":kind==="friendship"?"朋友关系":"亲子互动";
 const collapsed=ctx.collapsed?"":" open";
 const scripts=kind==="parentChild"
   ?"亲子版提醒：这里的生活建议只用来讨论共同想法、日常沟通与责任安排，不把财务或事业术语套在孩子身上。请以真实年龄和家庭情况为准；不要说孩子会给父母带财或造成亏损。"
   :kind==="friendship"
     ?"朋友版提醒：重点看沟通、共同活动、空间界线及是否互相尊重；不要把商业盈利解读套在友情上。"
     :"合作版提醒：进一步核对项目、合同、出资、角色分工、金钱往来和双方退出安排。";
 const sumFormula=n.formula;
 const questionHtml=(guideForContext?[guideForContext.question]:g.questions).map(q=>"<li>"+e(q)+"</li>").join("");
 return '<details class="foundation-block coop-magnetic-reading"'+collapsed+'>'
  +'<summary style="cursor:pointer;font-weight:700;padding:4px 0">性格磁场｜'+e(p.aName)+' × '+e(p.bName)+'｜合成'+n.number+'号 · '+e(guideForContext?guideForContext.title:g.title)+'</summary>'
  +'<div class="card-heading"><div><small>COOPERATION MAGNETIC FIELD · DIFFERENT FROM 45 PAIRS</small><h3>'+e(label)+'｜合作密码（性格磁场）'+n.number+'号</h3></div></div>'
  +'<div class="formula-note"><b>统一使用主性格O位：</b>'+e(p.aName)+' O='+p.mainA+'；'+e(p.bName)+' O='+p.mainB+'。<br><b>合作磁场公式：</b>O位 '+e(sumFormula)+'。<br><b>与45组配对区别：</b>'+e(COOP_MAGNETIC_META.difference)+'</div>'
  +'<article class="card reading-card"><h4>① 课程主题参考</h4><p>'+e(guideForContext?guideForContext.meaning:g.sourceMeaning)+'</p><small>原书参考：'+e(g.page)+'</small></article>'
  +'<article class="card reading-card"><h4>② 可能的合作／相处优势</h4><p>'+e(guideForContext?guideForContext.meaning:g.possibleStrength)+'</p></article>'
  +'<article class="card reading-card"><h4>③ 需要现实核对的摩擦</h4><p>'+e(cg?"是否有过高期待、没有说清需求或无法兼顾各自界线；应以孩子真实感受为主。":fg?fg.watch:g.friction)+'</p></article>'
  +'<article class="card reading-card"><h4>④ AURMOVA行动建议</h4><p>'+e(guideForContext?guideForContext.action:g.advice)+'</p><p><b>本周可做：</b>'+e(guideForContext?guideForContext.action:g.action)+'</p></article>'
  +'<div class="question-box"><b>⑤ Josephine可照读白话</b><p>'+e(guideForContext?guideForContext.script:g.script)+'</p><p>'+e(scripts)+'</p></div>'
  +'<div class="question-box"><b>⑥ 两人咨询追问</b><ul>'+questionHtml+'</ul><p><b>回答有：</b>请各自举一个真实场景，了解是否有协商空间。<b>回答没有：</b>不强行套用教材标签，继续核对实际情况。</p></div>'
  +'<div class="formula-note"><b>来源：</b>'+e(COOP_MAGNETIC_META.source)+'。<b>适用范围：</b>'+e(COOP_MAGNETIC_META.scope)+'<br><b>专业界线：</b>'+e(COOP_MAGNETIC_META.agency)+'</div>'
  +'</details>';
}
export function buildCooperationMagneticEntries(){
 const c="合作密码｜性格磁场";
 return [{category:c,title:"合作磁场计算法｜AURMOVA O位合成，原书生命数公式留档",
   keywords:"合作磁场 性格磁场 主性格 O位 合成 生命数原书 33/6 31/4 合作密码 夫妻除外 亲子 朋友 伙伴",
   text:[COOP_MAGNETIC_META.source,"【AURMOVA正式算法】"+COOP_MAGNETIC_META.formula,"【原书不同算法·仅留档】"+COOP_MAGNETIC_META.textbookFormula,COOP_MAGNETIC_META.difference,
     COOP_MAGNETIC_META.scope,COOP_MAGNETIC_META.activityExplanation,COOP_MAGNETIC_META.agency].join("\n\n")},
 ...Object.entries(COOP_MAGNETIC_GUIDES).map(([k,g])=>({category:c,
   title:"合作磁场"+k+"号｜"+g.title,
   keywords:"合作磁场 性格磁场 合成数"+k+" 合作密码 "+g.title,
   text:["【教材摘要】"+g.sourceMeaning,"【优势】"+g.possibleStrength,"【需注意】"+g.friction,
      "【咨询白话】"+g.script,"【提问】"+g.questions.join("；"),"【行动】"+g.advice,"【本周练习】"+g.action,
      "【原书页】"+g.page,"【AURMOVA正式公式】"+COOP_MAGNETIC_META.formula,"【原书不同计算法·只作课程参考】"+COOP_MAGNETIC_META.textbookFormula,"【适用范围】"+COOP_MAGNETIC_META.scope,
      "【限制】"+COOP_MAGNETIC_META.agency].join("\n\n")}))];
}
