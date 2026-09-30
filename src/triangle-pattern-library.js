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
