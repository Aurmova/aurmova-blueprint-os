export const ENERGY_LIBRARY = {
  1:{name:"独立／主见／开创",gift:"敢决定、敢开始、能带头，适合建立自主与领导力。",low:"自信、独立、创造、领导与主动能量较少，容易犹豫或依赖外界确认。",high:"过强时容易固执、急着证明自己、不易听取意见。"},
  2:{name:"关系／感受／协调",gift:"同理、倾听、连接人与气氛，擅长合作与沟通。",low:"沟通、关系平衡与表达需求需要后天练习。",high:"过强时容易敏感、依赖、纠结关系或难以拒绝。"},
  3:{name:"表达／行动／创意",gift:"反应快、点子多、表达有感染力，适合创作与推动。",low:"行动、表达与表现能量较少，容易拖延或不敢展示。",high:"过强时容易急躁、分心、情绪先行或只追热度。"},
  4:{name:"规划／秩序／稳定",gift:"有条理、能搭系统、重细节，擅长长期建设。",low:"条理、规划、理财纪律与系统感需要后天建立。",high:"过强时容易焦虑、控制、怕变化或过度完美。"},
  5:{name:"方向／选择／自由",gift:"适应快、敢突破、能发现新路径，变化中有弹性。",low:"方向、目标与自主选择感需要主动建立，容易跟着环境走。",high:"过强时容易多变、贪多、固执或抗拒约束。"},
  6:{name:"责任／品质／资源",gift:"愿意照顾、重品质、对价值与资源较敏锐。",low:"资源、财富、责任与细节敏锐度需要后天培养。",high:"过强时容易过度承担、挑剔、担心资源或要求太高。"},
  7:{name:"研究／洞察／人脉",gift:"爱钻研、判断细、能看深层问题，也重视可信关系。",low:"贵人、人际连接、研究深度与信任能力需要主动经营。",high:"过强时容易想太多、怀疑、拖延或难以信任。"},
  8:{name:"成果／管理／权责",gift:"目标感强、能扛责任、懂资源与组织，适合经营与管理。",low:"目标、成果、资源管理、谈条件与承担权责需要后天训练。",high:"过强时容易压力重、控制、比较或只看结果。"},
  9:{name:"机会／格局／影响",gift:"看得远、整合资讯、容易看到可能性与更大方向。",low:"机会、认同与影响力可能较慢显现，需要持续展示差异化价值。",high:"过强时容易贪多、分散、过度理想或追求认可。"}
};

export const ENERGY_SCOPE_COPY = {
  inner:{
    title:"内三角能量",
    note:"看比较自然、内在、基础的能量配置。缺失不等于没有能力，而是这股能量通常需要更有意识地练习。"
  },
  outer:{
    title:"外三角能量",
    note:"看三个20年阶段在现实生活里会被带出来的能量。这里缺失，较像外在场景中不容易自动使用，需要通过经历与角色训练。"
  },
  combined:{
    title:"内外综合能量",
    note:"把内三角与外三角一起看。内外都没有的数字，代表这股能量在整张结构里更少，需要后天主动培养；内外都有则代表这股能量既有内在基础，也容易在现实中表现出来。"
  }
};

export function describeEnergySet(scan, scope="combined") {
  const cfg = ENERGY_SCOPE_COPY[scope] || ENERGY_SCOPE_COPY.combined;
  const present = scan?.present || [];
  const missing = scan?.missing || [];
  const repeated = scan?.repeated || [];
  return {
    ...cfg,
    present:present.map(n=>({number:n,...ENERGY_LIBRARY[n]})),
    missing:missing.map(n=>({number:n,...ENERGY_LIBRARY[n]})),
    repeated:repeated.map(n=>({number:n,...ENERGY_LIBRARY[n]}))
  };
}
