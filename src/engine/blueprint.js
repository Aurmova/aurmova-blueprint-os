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

  const I = add(A,B);
  const J = add(C,D);
  const K = add(E,F);
  // Josephine fixed rule: when the birth year is 2000, the final 00 pair is treated as 5 for L.
  const L = (yyyy === 2000 && G === 0 && H === 0) ? 5 : add(G,H);
  const M = add(I,J);
  const N = add(K,L);
  const O = add(M,N);

  const S = add(I,M), T = add(J,M), U = add(S,T);
  const P = add(N,O), Q = add(M,O), R = add(P,Q);
  const V = add(K,N), W = add(L,N), X = add(V,W);

  const positions = {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,S,T,U,P,Q,R,V,W,X};

  const phases = {
    "21–40":{
      cause:[I,J,M],
      process1:[I,M,S],
      process2:[J,M,T],
      result:[S,T,U]
    },
    "41–60":{
      cause:[M,N,O],
      process1:[M,O,Q],
      process2:[N,O,P],
      result:[P,Q,R]
    },
    "61+":{
      cause:[K,L,N],
      process1:[K,N,V],
      process2:[L,N,W],
      result:[V,W,X]
    }
  };

  // Core triangle and the three age-stage result triangles are kept separate so Josephine
  // can see 内缺、外缺 and 内外合并缺失 independently.
  const innerTriangle = [I,J,M,K,L,N,O];
  const outerTriangle = [S,T,U,P,Q,R,V,W,X];
  const combinedTriangle = [...innerTriangle, ...outerTriangle];

  const innerEnergy = scanEnergy(innerTriangle);
  const outerEnergy = scanEnergy(outerTriangle);
  const combinedEnergy = scanEnergy(combinedTriangle);

  return {
    positions,
    birthDigits:[A,B,C,D,E,F,G,H],
    mainPersonality:O,
    seatCode:[M,N,O].join(""),
    innerCode:innerCode(O),
    subconsciousCode:add(I,O,L),
    outerHeartCode:add(U,R,X),
    familyCode:[J,K].join(""),
    insidePersonalityCode:[M,O,Q].join(""),
    outsidePersonalityCode:[N,O,P].join(""),
    fatherGenes:{I,J,M},
    motherGenes:{K,L,N},
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
