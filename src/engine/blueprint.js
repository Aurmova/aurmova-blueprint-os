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
  1:{title:"开端",summary:"启动、决定、新方向与自我主导。"},
  2:{title:"沉淀",summary:"关系、合作、耐心、准备与细节。"},
  3:{title:"表达",summary:"创意、曝光、社交、表达与行动。"},
  4:{title:"打底",summary:"制度、工作、财务纪律、习惯与稳定。"},
  5:{title:"变化",summary:"调整、移动、新方法、新机会与选择。"},
  6:{title:"责任",summary:"家庭、关系、责任、服务与品质。"},
  7:{title:"整理",summary:"研究、复盘、学习、筛选与内在整理。"},
  8:{title:"成果",summary:"事业、金钱、资源、权责与结果。"},
  9:{title:"完成",summary:"收尾、总结、放下、整合与腾出空间。"}
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

export function calculatePersonalYear(birthday, targetYear = new Date().getFullYear()) {
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

export function calculateYearCycleSet(birthday, targetYear = new Date().getFullYear()) {
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

  // 三角形外圈延伸：严格按 Josephine 最新图示位置命名。
  // 左侧延伸：I/J/M → X/W/S
  const X = add(I,M);
  const W = add(J,M);
  const S = add(X,W);
  // 上方延伸：M/N/O → P/Q/R（图示公式：Q=N+O，P=M+O，R=Q+P）
  const Q = add(N,O);
  const P = add(M,O);
  const R = add(Q,P);
  // 右侧延伸：K/L/N → V/U/T
  const V = add(K,N);
  const U = add(L,N);
  const T = add(V,U);

  const positions = {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,X,W,S,Q,P,R,V,U,T};

  // 六组基础联合数字：三组内部 + 三组外圈。
  const jointCodes6 = {
    IJM:[I,J,M],
    KLN:[K,L,N],
    MNO:[M,N,O],
    SWX:[S,W,X],
    RQP:[R,Q,P],
    TVU:[T,V,U]
  };

  // 十二组阶段联合码：按图示固定位置顺序读取。
  const phases = {
    "21–40":{
      cause:[I,J,M],          // IJM
      process1:[I,M,X],       // IMX
      process2:[J,M,W],       // JMW
      result:[W,X,S]          // WXS
    },
    "41–60":{
      cause:[M,N,O],          // MNO
      process1:[M,O,P],       // MOP
      process2:[N,O,Q],       // NOQ
      result:[P,Q,R]          // PQR
    },
    "61+":{
      cause:[K,L,N],          // KLN
      process1:[K,N,V],       // KNV
      process2:[L,N,U],       // LNU
      result:[V,U,T]          // VUT
    }
  };

  // 三角形内部 7 个数字与外圈 9 个数字分别统计能量。
  const innerTriangle = [I,J,K,L,M,N,O];
  const outerTriangle = [X,W,S,Q,P,R,V,U,T];
  const combinedTriangle = [...innerTriangle, ...outerTriangle];

  const innerEnergy = scanEnergy(innerTriangle);
  const outerEnergy = scanEnergy(outerTriangle);
  const combinedEnergy = scanEnergy(combinedTriangle);

  // 外心数字只会落在 3 / 6 / 9。
  const outerHeartCode = add(S,R,T);
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
