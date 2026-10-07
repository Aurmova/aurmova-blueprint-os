const reduce = n => {
  let v = Math.abs(Number(n) || 0);
  while (v > 9) v = String(v).split("").reduce((a,b) => a + Number(b), 0);
  return v;
};

const add = (...values) => reduce(values.reduce((sum, value) => sum + Number(value || 0), 0));
const sumDigits = value => String(Math.abs(Number(value) || 0)).split("").reduce((sum, digit) => sum + Number(digit), 0);
const DIGITS = [1,2,3,4,5,6,7,8,9];

export const innerCode = main => reduce(Number(main) * 2);

export function scanEnergy(values = []) {
  const clean = values.map(Number).filter(n => n >= 1 && n <= 9);
  const counts = Object.fromEntries(DIGITS.map(n => [n, clean.filter(x => x === n).length]));
  return {
    values: clean,
    counts,
    present: DIGITS.filter(n => counts[n] > 0),
    missing: DIGITS.filter(n => counts[n] === 0),
    repeated: DIGITS.filter(n => counts[n] >= 2)
  };
}

export const YEAR_THEMES = {
  1:{title:"播种",cycle:"上升期",rhythm:"攻",role:"开启新周期、决定方向、主动开始",summary:"适合启动、决定、新方向与自我主导。",pit:"想太多不敢开始",advice:"先开始，再边走边修正；把新方向落成第一个具体行动。"},
  2:{title:"磨合",cycle:"上升期",rhythm:"守",role:"关系、合作、耐心与资源累积",summary:"适合合作、准备、协调、细节与关系经营。",pit:"过度依赖别人、失去自我",advice:"合作但不失去立场；建立边界，慢慢累积可信关系。"},
  3:{title:"绽放",cycle:"上升期",rhythm:"攻",role:"表达、创意、曝光与初步成果",summary:"适合创意、曝光、社交、表达与行动。",pit:"三分钟热度、冲动消费",advice:"把热度变成持续输出；一次抓住少数重点并完成。"},
  4:{title:"扎根",cycle:"稳固期",rhythm:"守",role:"建立制度、根基、习惯与稳定",summary:"适合打基础、做系统、整理财务与长期规划。",pit:"过于保守、拒绝变化",advice:"今年重点不是急着收割，而是把基础做稳，同时保留必要弹性。"},
  5:{title:"突破",cycle:"稳固期",rhythm:"攻",role:"调整、移动、突破与新机会",summary:"适合顺势调整、尝试新方法、移动与拓展。",pit:"冲动决策、做了会后悔",advice:"可以变，但不要乱变；变化前先设边界、预算和停止线。"},
  6:{title:"丰收",cycle:"稳固期",rhythm:"守",role:"责任、家庭、关系、服务与成果承接",summary:"适合承担责任、稳住关系、照顾品质与兑现承诺。",pit:"付出过度、忽略自己",advice:"承担不等于包办；照顾别人时也要保留自己的时间与资源。"},
  7:{title:"沉淀",cycle:"沉淀期",rhythm:"守",role:"复盘、研究、学习、筛选与向内整理",summary:"适合深度学习、研究、复盘、减少无效社交并重新想清楚方向。",pit:"过度封闭、错失机会",advice:"允许自己慢下来，但不要完全关闭连接；把思考变成可验证的小行动。"},
  8:{title:"巅峰",cycle:"沉淀期",rhythm:"攻",role:"事业、金钱、资源、权责与成果放大",summary:"适合谈成果、整合资源、承担更大责任与推进事业。",pit:"投机心态、急功近利",advice:"成果年更要守规则、算风险、看长期；不要为了快而透支信用。"},
  9:{title:"收尾",cycle:"沉淀期",rhythm:"清理",role:"结束旧周期、总结、放下与腾出空间",summary:"适合收尾、总结、放下不再适合的人事物，为下一轮1年做准备。",pit:"不肯放手、死死抓住该结束的东西",advice:"完成比强留更重要；该结束的整理清楚，给新周期留空间。"}
};

export const PHASE_META = {
  "21–40":{
    label:"21–40岁",
    theme:"事业／朋友",
    description:"除了这个年龄阶段本身的能量，也看事业发展、工作模式、朋友关系，以及与朋友／同事如何相处。",
    groupLabels:["因果","过程一","过程二","结果"]
  },
  "41–60":{
    label:"41–60岁",
    theme:"孩子／下属",
    description:"除了这个年龄阶段本身的能量，也看孩子、下属与团队，以及你会用什么模式带领、管理、教育或要求他们。",
    groupLabels:["因果","过程一","过程二","结果"]
  },
  "61+":{
    label:"61岁以后",
    theme:"家庭关系／晚年生活",
    description:"除了这个年龄阶段本身的能量，也看家庭关系、资源沉淀、晚年生活方式与生活品质。",
    groupLabels:["因果","过程一","过程二","结果"]
  }
};

function parseBirthday(birthday) {
  const [dd,mm,yyyy] = String(birthday || "").split("/").map(Number);
  if (!dd || !mm || !yyyy) return null;
  return {dd,mm,yyyy};
}

export function calculateYearJointCode(endpointA, yearNumber, endpointB) {
  const a = reduce(endpointA);
  const y = reduce(yearNumber);
  const b = reduce(endpointB);
  return {
    digits:[a,y,b],
    code:`${a}${y}${b}`,
    cause:a,
    process:y,
    result:b
  };
}

export function calculateEnvironmentYear(targetYear = activeFlowYear()) {
  const year = Number(targetYear);
  const raw = 1 + sumDigits(year);
  const number = reduce(raw);
  return {
    year,
    raw,
    number,
    ...YEAR_THEMES[number]
  };
}

export function compareYearClimate(personalNumber, environmentNumber) {
  const personal = YEAR_THEMES[personalNumber];
  const environment = YEAR_THEMES[environmentNumber];
  if (!personal || !environment) return null;

  if (personalNumber === environmentNumber) {
    return {
      type:"双重叠加",
      description:"个人流年与大环境流年同号，主题会更明显。适合顺势推进，但也要同时留意该流年的反面模式。"
    };
  }

  if (personal.rhythm === environment.rhythm) {
    return {
      type:"同向加速",
      description:"个人节奏与时代大气候方向接近，推进感通常更顺，但仍要以个人流年为主旋律。"
    };
  }

  if ((personal.rhythm === "攻" && environment.rhythm === "守") || (personal.rhythm === "守" && environment.rhythm === "攻")) {
    return {
      type:"节奏拉扯",
      description:"外部环境与个人节奏不同。外面可能催你加速，而你更需要沉淀；或外面偏保守，而你更想主动突破。"
    };
  }

  return {
    type:"转换叠加",
    description:"其中一方处在清理／转换节奏。重点不是硬冲或硬守，而是先处理旧问题，再决定下一步。"
  };
}


function parseBirthdayFlexible(birthday){
  const raw=String(birthday||"").trim();
  let m=raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m)return {dd:Number(m[1]),mm:Number(m[2]),yyyy:Number(m[3])};
  m=raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if(m)return {dd:Number(m[3]),mm:Number(m[2]),yyyy:Number(m[1])};
  return null;
}
function reductionPath(value){
  const path=[];
  let n=Math.abs(Number(value)||0);
  path.push(n);
  while(n>9){
    n=String(n).split("").reduce((s,x)=>s+Number(x),0);
    path.push(n);
  }
  return path;
}
export function calculateHighPeakProfile(birthday, now=new Date()){
  const parsed=parseBirthdayFlexible(birthday);
  if(!parsed)return null;
  const {dd,mm,yyyy}=parsed;
  const monthNumber=reduce(mm);
  const dayNumber=reduce(dd);
  const yearNumber=reduce(yyyy);

  const p1Raw=monthNumber+dayNumber;
  const p2Raw=dayNumber+yearNumber;
  const p1=reduce(p1Raw);
  const p2=reduce(p2Raw);
  const p3Raw=p1+p2;
  const p3=reduce(p3Raw);
  const p4Raw=monthNumber+yearNumber;
  const p4=reduce(p4Raw);

  const allDigits=String(dd).padStart(2,"0")+String(mm).padStart(2,"0")+String(yyyy).padStart(4,"0");
  const lifeRaw=allDigits.split("").reduce((s,x)=>s+Number(x),0);
  const lifePath=reductionPath(lifeRaw);
  const lifeNumber=lifePath[lifePath.length-1]||0;

  const firstEnd=36-lifeNumber;
  const secondStart=firstEnd+1, secondEnd=firstEnd+9;
  const thirdStart=secondEnd+1, thirdEnd=secondEnd+9;
  const fourthStart=thirdEnd+1;

  let age=now.getFullYear()-yyyy;
  const birthdayThisYear=new Date(now.getFullYear(),mm-1,dd);
  if(now<birthdayThisYear)age-=1;
  age=Math.max(0,age);

  const phases=[
    {index:1,label:"第一高峰",number:p1,raw:p1Raw,start:0,end:firstEnd,range:"0–"+firstEnd+"岁"},
    {index:2,label:"第二高峰",number:p2,raw:p2Raw,start:secondStart,end:secondEnd,range:secondStart+"–"+secondEnd+"岁"},
    {index:3,label:"第三高峰",number:p3,raw:p3Raw,start:thirdStart,end:thirdEnd,range:thirdStart+"–"+thirdEnd+"岁"},
    {index:4,label:"第四高峰",number:p4,raw:p4Raw,start:fourthStart,end:null,range:fourthStart+"岁以后"}
  ];
  const current=phases.find(x=>age>=x.start&&(x.end==null||age<=x.end))||phases[3];

  return {
    birthday:{dd,mm,yyyy},
    age,
    source:{
      month:{raw:mm,number:monthNumber},
      day:{raw:dd,number:dayNumber},
      year:{raw:yyyy,number:yearNumber}
    },
    peaks:[p1,p2,p3,p4],
    rawPeaks:[p1Raw,p2Raw,p3Raw,p4Raw],
    life:{raw:lifeRaw,path:lifePath,number:lifeNumber},
    firstEnd,
    phases,
    current
  };
}

export function calculatePersonalYear(birthday, targetYear = activeFlowYear()) {
  const parsed = parseBirthday(birthday);
  if (!parsed) return null;
  const {dd,mm} = parsed;
  const raw = sumDigits(targetYear) + sumDigits(mm) + sumDigits(dd);
  const number = reduce(raw);
  return {
    year:Number(targetYear),
    raw,
    number,
    ...YEAR_THEMES[number]
  };
}

export function calculateYearCycleSet(birthday, targetYear = activeFlowYear()) {
  const year = Number(targetYear);
  return {
    previous:calculatePersonalYear(birthday, year - 1),
    current:calculatePersonalYear(birthday, year),
    next:calculatePersonalYear(birthday, year + 1)
  };
}

export function calculateBlueprint(birthday) {
  const parsed = parseBirthday(birthday);
  if (!parsed) return null;
  const {dd,mm,yyyy} = parsed;

  const ds = String(dd).padStart(2,"0").split("").map(Number);
  const ms = String(mm).padStart(2,"0").split("").map(Number);
  const ys = String(yyyy).padStart(4,"0").split("").map(Number);
  const [A,B] = ds, [C,D] = ms, [E,F,G,H] = ys;

  // 主三角形：先日、再月、再年。
  const I = add(A,B);
  const J = add(C,D);
  const K = add(E,F);
  // Josephine 固定规则：2000 年出生时，年份后两位 00 的 L 位按 5 处理。
  const L = (yyyy === 2000 && G === 0 && H === 0) ? 5 : add(G,H);
  const M = add(I,J);
  const N = add(K,L);
  const O = add(M,N);

  // 三阶段外圈：严格按 Josephine 最终固定公式。
  // 21–40：S = I + M；T = J + M；U = S + T。
  const S = add(I,M);
  const T = add(J,M);
  const U = add(S,T);
  // 41–60：P = N + O；Q = M + O；R = P + Q。
  const P = add(N,O);
  const Q = add(M,O);
  const R = add(P,Q);
  // 61+：V = K + N；W = L + N；X = V + W。
  const V = add(K,N);
  const W = add(L,N);
  const X = add(V,W);

  const positions = {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,S,T,U,P,Q,R,V,W,X};

  // 六组基础联合数字：三组内部 + 三组阶段结果。
  const jointCodes6 = {
    IJM:[I,J,M],
    KLN:[K,L,N],
    MNO:[M,N,O],
    STU:[S,T,U],
    PQR:[P,Q,R],
    VWX:[V,W,X],
    // 兼容旧模块读取键名；值统一指向最终公式，避免旧画面再次算错。
    SWX:[S,T,U],
    RQP:[P,Q,R],
    TVU:[V,W,X]
  };

  // 十二组阶段联合码：最终固定顺序。
  const phases = {
    "21–40":{
      cause:[I,J,M],          // IJM
      process1:[I,M,S],       // IMS
      process2:[J,M,T],       // JMT
      result:[S,T,U]          // STU
    },
    "41–60":{
      cause:[M,N,O],          // MNO
      process1:[M,O,Q],       // MOQ
      process2:[N,O,P],       // NOP
      result:[P,Q,R]          // PQR
    },
    "61+":{
      cause:[K,L,N],          // KLN
      process1:[K,N,V],       // KNV
      process2:[L,N,W],       // LNW
      result:[V,W,X]          // VWX
    }
  };

  // 三角形内部 7 个数字与外圈 9 个数字分别统计能量。
  const innerTriangle = [I,J,K,L,M,N,O];
  const outerTriangle = [S,T,U,P,Q,R,V,W,X];
  const combinedTriangle = [...innerTriangle, ...outerTriangle];

  const innerEnergy = scanEnergy(innerTriangle);
  const outerEnergy = scanEnergy(outerTriangle);
  const combinedEnergy = scanEnergy(combinedTriangle);

  // 外心数字只会落在 3 / 6 / 9。
  const outerHeartCode = add(U,R,X);
  const outerHeartMeaning = ({
    3:"理想主义",
    6:"现实主义",
    9:"远见主义"
  })[outerHeartCode] || "";

  return {
    positions,
    birthDigits:[A,B,C,D,E,F,G,H],
    mainPersonality:O,
    seatCode:[M,N,O].join(""),
    fatherCode:[I,J,M].join(""),
    motherCode:[K,L,N].join(""),
    startingThoughtCode:I,
    constraintCode:add(sumDigits(dd),sumDigits(mm)),
    innerCode:innerCode(O),
    // 旧资料中潜意识码仍独立保留，待 Josephine 的最终原始公式复核。
    subconsciousCode:add(I,O,L),
    outerHeartCode,
    outerHeartMeaning,
    familyCode:[J,K].join(""),
    insidePersonalityCode:[M,O,Q].join(""),
    outsidePersonalityCode:[N,O,P].join(""),
    fatherGenes:{I,J,M},
    motherGenes:{K,L,N},
    jointCodes6,
    phases,
    innerTriangle,
    outerTriangle,
    combinedTriangle,
    innerEnergy,
    outerEnergy,
    combinedEnergy
  };
}

export function activeFlowYear(date=new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  // AURMOVA命名：流年以“结束所在年份”命名。
  // 例如 2027 流年 = 2026-10-01 至 2027-09-30。
  return m >= 10 ? y + 1 : y;
}

export function flowYearRange(year) {
  const y = Number(year);
  return { start: String(y - 1) + "-10-01", end: String(y) + "-09-30" };
}

export function calculateGoldenYearBlueprint(birthday,targetYear=activeFlowYear()) {
  const parsed=parseBirthday(birthday);
  if(!parsed) return null;
  const {dd,mm}=parsed;
  const yyyy=Number(targetYear);

  // 黄金流年盘：日、月沿用顾客出生资料；“年”替换成目标年份。
  // 因此 IJM 不变，KLN 随年份变化；MNO 把个人固定基础与当年环境合起来。
  const [A,B]=String(dd).padStart(2,"0").split("").map(Number);
  const [C,D]=String(mm).padStart(2,"0").split("").map(Number);
  const [E,F,G,H]=String(yyyy).padStart(4,"0").split("").map(Number);

  const I=add(A,B);
  const J=add(C,D);
  const M=add(I,J);
  const K=add(E,F);
  const L=(yyyy===2000&&G===0&&H===0)?5:add(G,H);
  const N=add(K,L);
  const O=add(M,N);

  // 黄金流年仍使用同一张基础数字盘结构，只把年份替换为目标年份。
  const S=add(I,M);
  const T=add(J,M);
  const U=add(S,T);
  const P=add(N,O);
  const Q=add(M,O);
  const R=add(P,Q);
  const V=add(K,N);
  const W=add(L,N);
  const X=add(V,W);

  const positions={A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,S,T,U,P,Q,R,V,W,X};
  const birthDigits=[A,B,C,D,E,F,G,H];
  const innerTriangle=[I,J,K,L,M,N,O];

  return {
    year:yyyy,
    positions,
    birthDigits,
    fixedFatherCode:[I,J,M].join(""),
    personalAxis:{
      groups:{
        MNO:[M,N,O],
        MOQ:[M,O,Q],
        NOP:[N,O,P],
        PQR:[P,Q,R]
      },
      labels:["因果","过程一","过程二","结果"]
    },
    environmentAxis:{
      groups:{
        KLN:[K,L,N],
        KNV:[K,N,V],
        LNW:[L,N,W],
        VWX:[V,W,X]
      },
      labels:["因果","过程一","过程二","结果"]
    },
    startingThoughtCode:I,
    constraintCode:add(sumDigits(dd),sumDigits(mm)),
    innerCode:innerCode(O),
    subconsciousCode:add(I,O,L),
    mainYearCode:O,
    innerTriangle,
    innerEnergy:scanEnergy(innerTriangle)
  };
}

export function yearSourceAxes(goldenBlueprint) {
  if(!goldenBlueprint) return null;
  return {
    personal:{
      base:goldenBlueprint.personalAxis.groups.MNO,
      baseCode:goldenBlueprint.personalAxis.groups.MNO.join(""),
      groups:goldenBlueprint.personalAxis.groups,
      labels:goldenBlueprint.personalAxis.labels
    },
    environment:{
      base:goldenBlueprint.environmentAxis.groups.KLN,
      baseCode:goldenBlueprint.environmentAxis.groups.KLN.join(""),
      groups:goldenBlueprint.environmentAxis.groups,
      labels:goldenBlueprint.environmentAxis.labels
    }
  };
}

export function calculateGoldenYearSnapshot(birthday,targetYear=activeFlowYear()) {
  const golden=calculateGoldenYearBlueprint(birthday,targetYear);
  if(!golden) return null;
  const axes=yearSourceAxes(golden);

  // AURMOVA黄金流年：个人流年数直接读取年盘 O 位（MNO 的结果位），
  // 不再另外跑一套“个人流年公式”；大环境也不再另算单一数字，
  // 而是直接读取 KLN → KNV / LNW → VWX 四组组合。
  const personalNumber=golden.mainYearCode;
  const personal={year:Number(targetYear),number:personalNumber,...YEAR_THEMES[personalNumber]};
  const environmentCodes=Object.entries(axes.environment.groups).map(([key,arr],i)=>({
    key,
    role:axes.environment.labels[i],
    digits:arr,
    code:arr.join("")
  }));
  const hitGroups=(groups,n)=>Object.entries(groups)
    .filter(([,arr])=>arr.includes(n))
    .map(([key,arr])=>({key,code:arr.join(""),count:arr.filter(v=>v===n).length}));

  return {
    year:Number(targetYear),
    personal,
    personalAxis:axes.personal,
    environmentAxis:axes.environment,
    environmentCodes,
    environmentMainCode:axes.environment.groups.KLN.join(""),
    personalHits:hitGroups(axes.personal.groups,personal.number),
    fixedFatherCode:golden.fixedFatherCode,
    startingThoughtCode:golden.startingThoughtCode,
    constraintCode:golden.constraintCode,
    innerCode:golden.innerCode,
    subconsciousCode:golden.subconsciousCode,
    innerEnergy:golden.innerEnergy,
    yearTriangle:golden.innerTriangle,
    yearPositions:golden.positions,
    mainPersonality:golden.mainYearCode
  };
}

export function phaseForAge(age) {
  return age >= 61 ? "61+" : age >= 41 ? "41–60" : "21–40";
}

export function ageFromBirthday(birthday, now = new Date()) {
  const parsed = parseBirthday(birthday);
  if (!parsed) return null;
  const {dd,mm,yyyy} = parsed;
  let age = now.getFullYear() - yyyy;
  if (now.getMonth()+1 < mm || (now.getMonth()+1 === mm && now.getDate() < dd)) age--;
  return age;
}
