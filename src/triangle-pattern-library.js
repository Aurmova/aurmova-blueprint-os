export const TRIANGLE_INNER_OUTER_PATTERNS = {
  1:{
    innerMissingOuterPresent:"外强中干，人前独立，人后脆弱",
    innerPresentOuterMissing:"在家强势，在外随和",
    bothMissing:"极度没主见，内外都软",
    innerCounts:{
      1:"管好自己，独善其身",
      2:"管好自己，还想管别人",
      3:"天生领袖，管一帮人"
    }
  },
  2:{
    innerMissingOuterPresent:"外在善于合作，内在渴望独处",
    innerPresentOuterMissing:"在家依赖，在外独立",
    bothMissing:"不擅长配合，喜欢单打独斗",
    innerCounts:{
      1:"善于合作，人际关系和谐",
      2:"过度依赖，优柔寡断",
      3:"老好人，缺乏主见，团队润滑剂"
    }
  },
  3:{
    innerMissingOuterPresent:"外在乐观，内在悲观",
    innerPresentOuterMissing:"在家活泼，在外安静",
    bothMissing:"性格内敛，不善表达",
    innerCounts:{
      1:"善于沟通，多才多艺",
      2:"过度敏感，情绪化",
      3:"创意十足，热情洋溢，但容易三分钟热度"
    }
  },
  4:{
    innerMissingOuterPresent:"外在稳重，内在不安",
    innerPresentOuterMissing:"在家讲究稳定，在外敢于冒险",
    bothMissing:"不喜欢按部就班，追求自由",
    innerCounts:{
      1:"稳重踏实，有安全感",
      2:"过于固执，缺乏安全感",
      3:"超级稳定，有秩序感，但过于保守，害怕改变"
    }
  },
  5:{
    innerMissingOuterPresent:"外在自由，内在受限",
    innerPresentOuterMissing:"在家追求自由，在外遵守规则",
    bothMissing:"不喜欢变动，喜欢稳定",
    innerCounts:{
      1:"热爱自由，敢于冒险",
      2:"过于追求自由，容易叛逆",
      3:"极度热爱自由，不受约束，喜欢挑战，但容易冲动"
    }
  },
  6:{
    innerMissingOuterPresent:"外在负责，内在逃避",
    innerPresentOuterMissing:"在家有责任感，在外放任自由",
    bothMissing:"不喜欢承担责任，比较自我",
    innerCounts:{
      1:"有责任感，乐于助人",
      2:"过于负责，容易操心",
      3:"超级有责任感，喜欢照顾别人，但容易过度付出，失去自我"
    }
  },
  7:{
    innerMissingOuterPresent:"外在人缘好，内在孤独",
    innerPresentOuterMissing:"在家喜欢独处，在外善于社交",
    bothMissing:"不喜欢思考，比较肤浅",
    innerCounts:{
      1:"善于思考，有智慧",
      2:"过于敏感，多疑",
      3:"超级有智慧，喜欢研究，但容易脱离现实，人际关系差"
    }
  },
  8:{
    innerMissingOuterPresent:"外在成功，内在空虚",
    innerPresentOuterMissing:"在家有野心，在外低调",
    bothMissing:"不喜欢追求物质，比较淡泊",
    innerCounts:{
      1:"有野心，有能力",
      2:"过于追求权力和财富，容易走极端",
      3:"超级有野心，有领导能力，但容易独裁，控制欲强"
    }
  },
  9:{
    innerMissingOuterPresent:"外在博爱，内在自私",
    innerPresentOuterMissing:"在家理想主义，在外现实主义",
    bothMissing:"比较现实，缺乏理想",
    innerCounts:{
      1:"有理想，有爱心",
      2:"过于理想主义，不切实际",
      3:"超级有爱心，有理想，但容易好高骛远，不脚踏实地"
    }
  }
};

export function getTrianglePattern(number, innerCount, outerCount){
  const data=TRIANGLE_INNER_OUTER_PATTERNS[number];
  if(!data) return null;

  if(innerCount===0 && outerCount>0){
    return {
      state:`内缺${number}外有${number}`,
      description:data.innerMissingOuterPresent,
      source:"内缺外有"
    };
  }

  if(innerCount>0 && outerCount===0){
    return {
      state:`内有${number}外缺${number}`,
      description:data.innerPresentOuterMissing,
      source:"内有外缺"
    };
  }

  if(innerCount===0 && outerCount===0){
    return {
      state:`内外都没有${number}`,
      description:data.bothMissing,
      source:"内外都缺"
    };
  }

  if(innerCount>=1 && outerCount>0){
    if(data.innerCounts[innerCount]){
      return {
        state:`内${innerCount}个${number}`,
        description:data.innerCounts[innerCount],
        source:"内外都有"
      };
    }
    return {
      state:`内${innerCount}个${number} · 外有${number}`,
      description:"内圈出现次数超过目前这组“6种精准表现”资料的图示范围。系统保留实际次数，不自行套用3个时的解释。",
      source:"待 Josephine 补充"
    };
  }

  return null;
}


export const DENSITY_LEVELS = {
  1:{label:"轻触型",tone:"有这个数字，但不是主要驱动力"},
  2:{label:"常驻型",tone:"这个数字已经是重要角色"},
  3:{label:"主导型",tone:"这个数字已成为核心能量之一"},
  4:{label:"核心驱动型",tone:"这个数字处于很高密度，是底层驱动力之一"}
};

export const INNER_DENSITY_LIBRARY = {
  1:{core:"独立、领导、开创",1:"有基本独立与领导感，但不会特别突出；偶尔展现领导力。",2:"独立倾向明显，遇事容易先想“我自己来”；有主见，但有时会过于自我。",3:"自主与开创驱动力很强，行动力突出；反面容易控制、不听劝。",4:"自主、独立、开创几乎成为底层代码；天赋很强，但也容易孤立自己、拒绝合作。"},
  2:{core:"合作、关系、感知他人",1:"偶尔展现配合能力，基本能合作但不依赖。",2:"关系感强，擅长察言观色，是天然的好搭档。",3:"共情力很强，但容易失去自我、过度迁就。",4:"关系成为人生主轴；成也关系，困也关系。"},
  3:{core:"行动、表达、创造",1:"偶尔有灵感和冲劲，但不是主要驱动力。",2:"行动力强，有话直说，做事不拖泥带水。",3:"表达欲旺盛、创造力突出，但容易冲动、三分钟热度。",4:"行动与表达密度很高，常处在“要么在做、要么在说”的状态。"},
  4:{core:"安全感、稳定、坚持",1:"偶尔追求稳妥，但不是主要性格。",2:"靠谱踏实，喜欢有计划、有步骤的做事方式。",3:"极度求稳，讨厌变化和不确定性，容易固执。",4:"安全感需求很强，可能宁可不动也不愿冒险。"},
  5:{core:"自由、变化、灵活",1:"偶尔想尝试新东西，但不算骨子里的主要驱动力。",2:"灵活应变强，讨厌一成不变，喜欢新鲜感。",3:"自由需求很强，被约束时反应大，也更容易冲动改变。",4:"变化几乎成为人生主旋律，很难长时间停在固定状态。"},
  6:{core:"责任、关怀、和谐",1:"偶尔热心，但不算天生的“照顾者”。",2:"责任感明显，乐于助人，在家庭与关系里愿意扛事。",3:"付出倾向强，容易什么都扛到自己身上而累。",4:"照顾与责任密度很高，容易长期把别人放在自己前面。"},
  7:{core:"思考、分析、求真",1:"偶尔会深思，但不算经常想很多的人。",2:"爱分析、爱研究，看问题比较深。",3:"容易过度思考，想太多反而不动，甚至钻牛角尖。",4:"思考与验证密度很高，容易长期活在自己的分析系统里。"},
  8:{core:"目标、掌控、物质成就",1:"偶尔有野心，但不算人生核心驱动力。",2:"事业心强，对钱、成果和成就有明确追求。",3:"野心和目标感很强，但容易急功近利。",4:"成就、权责与资源几乎成为底层驱动力，容易把人生变成不断登顶的过程。"},
  9:{core:"包容、慷慨、全局视野",1:"偶尔大方、有同情心，但不是主要特质。",2:"热心肠，愿意帮助别人。",3:"容易过度付出，照顾很多人却忽略自己。",4:"给予与理想密度很高，容易长期把世界和别人放在自己前面。"}
};

export const OUTER_DENSITY_LIBRARY = {
  1:{core:"独立开创",1:"外在生活中有一个领域偏独立，其他领域不突出。",2:"在两个领域都需要自主权，不喜欢被安排。",3:"外在生活重心明显偏向“自己说了算”，多数领域都靠自己。",4:"外在多个领域都呈现极高独立性，几乎不依赖别人。"},
  2:{core:"合作配合",1:"在某个领域愿意配合别人，其他领域不算明显。",2:"在两个领域都偏配合角色，擅长做协作与支持。",3:"外在表现整体以“和”为主，多数场景都在迁就、配合。",4:"外在多个领域都高度依赖合作、配合与让步。"},
  3:{core:"表达活跃",1:"某个领域比较活跃、爱表达，其他领域偏安静。",2:"在两个领域都外向、爱说爱做，社交面较广。",3:"外在表现整体很活跃，闲不住，社交与行动都多。",4:"外在生活高密度处在忙碌、社交、表达和切换状态。"},
  4:{core:"稳定务实",1:"某个领域追求稳定，其他领域不一定。",2:"在两个领域都求稳，不喜欢变动和风险。",3:"外在生活整体偏保守，追求安全感，讨厌变化。",4:"外在多个领域都极度求稳，对不确定性的容忍度很低。"},
  5:{core:"变化多变",1:"某个领域爱变、爱尝试，其他领域相对稳定。",2:"在两个领域都不安分，喜欢新鲜感和变化。",3:"外在生活整体多变，事业、社交、家庭都可能经历转折。",4:"外在生活高密度处在变化中，很难长期一成不变。"},
  6:{core:"责任关怀",1:"在某个领域承担照顾责任，其他领域不一定。",2:"在两个领域都是“扛事的人”，对人对事都很负责。",3:"外在生活整体以责任为主，家庭、事业、社交都在付出。",4:"外在多个领域都在照顾别人，容易什么都扛。"},
  7:{core:"思考向内",1:"某个领域偏理性冷静，其他领域不一定。",2:"在两个领域都偏内敛，不轻易表露想法。",3:"外在表现整体偏冷静克制，不喜欢表面社交。",4:"外在多个领域都高度需要独处与空间，整体表现很内敛。"},
  8:{core:"野心成就",1:"某个领域有明确野心和目标，其他领域不一定。",2:"在两个领域都有很强的成就欲和掌控欲。",3:"外在生活整体以达成目标为驱动力，多数领域都在拼。",4:"外在多个领域都在追求往上走、拿到更好的结果。"},
  9:{core:"利他包容",1:"某个领域特别大方包容，其他领域不一定。",2:"在两个领域都乐于付出，不太计较回报。",3:"外在生活整体以给予为主，对人对事都很慷慨。",4:"外在多个领域都在持续付出，容易给到自己被掏空。"}
};

export function getDensityReading(number,count,scope="inner"){
  if(!count) return null;
  const source=scope==="outer"?OUTER_DENSITY_LIBRARY:INNER_DENSITY_LIBRARY;
  const data=source[number];
  if(!data) return null;
  const capped=Math.min(count,4);
  return {
    number,
    count,
    level:DENSITY_LEVELS[capped]?.label || "高密度",
    tone:DENSITY_LEVELS[capped]?.tone || "这个数字出现频率很高",
    core:data.core,
    description:data[capped] || "",
    exact:count<=4
  };
}
