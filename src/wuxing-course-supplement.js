// AURMOVA Five-Element Course Supplement | original paraphrased notes from newly photographed textbook pages.
// Supplemental traditional framework; no medical diagnostic use; production annual rule remains M/N/O/P/Q/R.
export const WUXING_COURSE_SUPPLEMENT = Object.freeze({
  sources:[
    "生命数字心理学：五行与数字、联系及建议、颜色和形状（用户照片约229–232页）",
    "数字流年：五行与健康、相生相克及数字盘观察（用户照片约55–64页）"
  ],
  entry:"课程五行与数字的对应：小金1／大金6、小水2／大水7、小火3／大火8、小木4／大木9；土5。第一本原书同时列0为土，但现有年盘六位数字有效值是1–9，所以不计入0。",
  positionContrast:"数字流年教材第63页写M/N/O/P/Q五个位子，而AURMOVA咨询师此前已确认黄金流年选M/N/O/P/Q/R六个位子。前者仅用于原书资料学习，不能将五位例题直接用六位公式重算后宣称与原书完全一致。",
  evidence:"五行的脏腑、颜色、相生相克及多缺致病关系是传统课程内的象征解释，并非能预测或诊断疾病的医学指标。任何持续身体症状都应按症状求医。",
  elements:[
    {key:"metal",name:"金",small:"1｜小金",large:"6｜大金",digits:[1,6],
     course:"课程以金象征自主、行动、担当与表达实力。小金重个人开拓，大金借喻资源与责任规模。",
     advice:"练习适当地表达自己的能力，也练习合作、分担与休息。",
     colors:"金色、白色、银色",shape:"圆形（教材以太阳作比喻）",
     historicalOrgans:"传统教材联系肺、大肠、皮肤；不能据数字解释疾病。"},
    {key:"water",name:"水",small:"2｜小水",large:"7｜大水",digits:[2,7],
     course:"课程借水的流动比喻人际沟通、感受及环境适应。小水偏细致协调，大水偏深层思考与人际经验。",
     advice:"练习独立判断、表达需要，辨别什么时候合作、什么时候拒绝。",
     colors:"蓝色、黑色、灰色",shape:"波浪形",
     historicalOrgans:"传统教材联系肾、膀胱等；不能据数字判断健康。"},
    {key:"fire",name:"火",small:"3｜小火",large:"8｜大火",digits:[3,8],
     course:"课程借火的热情比喻表达、行动和推进目标。小火偏创意、沟通，大火偏行动力度与成果期待。",
     advice:"行动前先核对事实，学习管理情绪、节奏和休息，不用热情代替判断。",
     colors:"红色、紫色、橙色",shape:"向上的三角形",
     historicalOrgans:"传统教材联系心脏、小肠及循环；数字不是心血管筛查。"},
    {key:"wood",name:"木",small:"4｜小木",large:"9｜大木",digits:[4,9],
     course:"课程借树木成长比喻学习、积累、理想和持续修正。小木偏计划思考，大木偏宽广远见。",
     advice:"把理想拆成可以执行的学习与生活行动，允许自己调整做法。",
     colors:"青色、绿色",shape:"长方形",
     historicalOrgans:"传统教材联系肝胆、眼睛、筋骨；不能据数字推断器官功能。"},
    {key:"earth",name:"土",small:"5｜土",large:"原书未区分大小土",digits:[5],
     course:"课程把土视为方向、承载和生活稳定的象征；0在其中一本原书中也列属土，生产年盘仍只对1–9计数。",
     advice:"找到适合自己的方向，练习在变化中作出合适的选择。",
     colors:"黄色、棕色",shape:"正方形",
     historicalOrgans:"传统教材联系脾胃和消化；不能据数字判断是否会患病。"}
  ],
  supports:[
    {from:"wood",to:"fire",label:"木生火"},
    {from:"fire",to:"earth",label:"火生土"},
    {from:"earth",to:"metal",label:"土生金"},
    {from:"metal",to:"water",label:"金生水"},
    {from:"water",to:"wood",label:"水生木"}
  ],
  checks:[
    {from:"wood",to:"earth",label:"木克土"},
    {from:"earth",to:"water",label:"土克水"},
    {from:"water",to:"fire",label:"水克火"},
    {from:"fire",to:"metal",label:"火克金"},
    {from:"metal",to:"wood",label:"金克木"}
  ],
  stageRules:{
    missing:"在所选流年的六个位子某五行计数为0，标记为「未出现」；这是结构记录，不代表身体缺失、体质差或需要补五行。",
    focused:"同一种五行出现2次或以上，就成为课程重点观察的五行；大、小数字合计（例如3＋8＝火2次）。这不代表疾病风险。",
    repeats:"同号重复是另一项独立标记：例如3与8各出现1次，不是「3号重复」，但属于火五行出现2次，已满足五行重点观察条件。",
    classroom:"原书第63–64页示例使用五个位子，教材讲义示例可展示原始五位法，但AURMOVA黄金流年一律按已确认的六位法计算。"
  }
});

const safeText=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export function buildWuxingCourseEntries(){
 const s=WUXING_COURSE_SUPPLEMENT,cat="五行资料";
 const entries=[];
 const add=(title,keywords,body)=>entries.push({category:cat,title,keywords,text:body.join("\n\n")});
 add("五行课程补充｜十张原书整理与计算差异","五行 小金 大金 小水 大水 小火 大火 小木 大木 土 0 五位 六位 原书",
   ["【教学来源】"+s.sources.join("、"),"【大小五行】"+s.entry,
    "【两种位置规则必须分开】"+s.positionContrast,
    "【学习边界】"+s.evidence]);
 for(const e of s.elements){
   add("五行课程｜"+e.name+"："+e.small+(e.key==="earth"?"":"／"+e.large),
     "五行 "+e.name+" "+e.digits.join(" ")+" 颜色 形状 大小五行",
     ["【位置关系】"+e.small+"；"+e.large,
      "【原书概念的课堂转述】"+e.course,"【生活引导】"+e.advice,
      "【颜色／形状象征】"+e.colors+"；"+e.shape,
      "【传统身体关联及限制】"+e.historicalOrgans]);
 }
 add("五行关系｜相生顺序及课堂讨论","五行相生 木生火 火生土 土生金 金生水 水生木",
   ["【课程传统顺序】"+s.supports.map(x=>x.label).join(" → "),
    "【教学提示】相生表示传统课程中支持的隐喻；不能证明当事人一定适合某工作或改善健康。"]);
 add("五行关系｜相克顺序及课堂讨论","五行相克 木克土 土克水 水克火 火克金 金克木",
   ["【课程传统顺序】"+s.checks.map(x=>x.label).join(" → "),
    "【教学提示】相克表示传统课程中限制与约束的比喻，不是人际矛盾或疾病因果预测。"]);
 add("五行颜色与形状｜完整速查","颜色 形状 金 水 火 木 土 大小五行",
   s.elements.map(x=>"【"+x.name+"】"+x.colors+"；"+x.shape));
 add("五行缺与多｜六位法统计而非医学评估","五行缺 五行旺 五行多 0 3 缺 病 预兆 M N O P Q R",
   ["【未出现】"+s.stageRules.missing,"【集中】"+s.stageRules.focused,
    "【同号】"+s.stageRules.repeats,"【教材位置差异】"+s.stageRules.classroom,
    "【专业边界】"+s.evidence]);
 add("五行教材教学练习｜5位原书与6位流年区分","学员练习 五行 六位 五位 MNOPQ MNOPQR",
   ["【虚构练习】给出M=2、N=6、O=4、P=2、Q=6、R=1，请先按AURMOVA六位法统计，再仅用M/N/O/P/Q核对原书五位法两种计数差异。",
    "【解题重点】两种方法的数字计数可能不同。请说明课程来源，不要因五行未出现或重复而诊断疾病。",
    "【课堂追问】不同口径对结果影响在哪里？怎样向顾客解释方法的限制？"]);
 return entries;
}

// Generates *symbolic coursework* relationships from the already verified six-position snapshot.
export function analyzeWuxingCourseRelations(annualDistribution){
 if(!annualDistribution||!Array.isArray(annualDistribution.rows)||annualDistribution.positionCount!==6)return null;
 const s=WUXING_COURSE_SUPPLEMENT;
 const active=new Set(annualDistribution.rows.filter(x=>x.count>0).map(x=>x.key));
 const missing=annualDistribution.rows.filter(x=>x.count===0).map(x=>x.label);
 const focused=annualDistribution.rows.filter(x=>x.count>=2).map(x=>({label:x.label,count:x.count,digits:x.digits,slots:x.slots}));
 return {
  missing,focused,
  supporting:s.supports.filter(x=>active.has(x.from)&&active.has(x.to)).map(x=>x.label),
  controlling:s.checks.filter(x=>active.has(x.from)&&active.has(x.to)).map(x=>x.label),
  courseOnly:true,healthRisk:null
 };
}

export function renderWuxingCourseRelations(annualDistribution,childMode=false){
 const info=analyzeWuxingCourseRelations(annualDistribution);
 if(!info)return "";
 const src=WUXING_COURSE_SUPPLEMENT;
 const missing=info.missing.length?info.missing.join("、"):"五种五行均有出现";
 const strong=info.focused.length?info.focused.map(x=>x.label+" "+x.count+"次（"+x.digits.join("、")+"）").join("、"):"没有任何五行累计达到2次";
 const make=(arr)=>arr.length?arr.join("、"):"所选六位没有同时包含这类对应的两种五行";
 const guide=childMode
  ?"可用传统相生相克作为课堂讨论，实际仍要听家长和孩子对学习、关系及日常压力的描述；不能用五行推断孩子疾病。"
  :"可用相生相克的传统比喻，讨论哪些能力和习惯相互帮助或阻碍。优先以顾客真实经历为准，不从数字推断身体疾病。";
 return '<section class="foundation-block annual-wuxing-course">'
  +'<div class="card-heading"><div><small>COURSE REFERENCES · WUXING</small><h4>⑤ 五行相生相克、大小五行及缺多观察</h4></div></div>'
  +'<div class="formula-note"><b>本年六位中未出现：</b>'+safeText(missing)+'。<b>本年观察重点（同五行≥2次）：</b>'+safeText(strong)
  +'。这些仅表示数字分布，不代表体质、器官疾病或医学风险。</div>'
  +'<p><b>传统相生（本盘同时出现）：</b>'+safeText(make(info.supporting))+'</p>'
  +'<p><b>传统相克（本盘同时出现）：</b>'+safeText(make(info.controlling))+'</p>'
  +'<p><b>对应速记：</b>'+safeText(src.entry)+'</p>'
  +'<div class="question-box"><b>Josephine解读提醒：</b>'+safeText(guide)+'</div>'
  +'<div class="formula-note"><b>方法差异：</b>'+safeText(src.positionContrast)+'</div>'
  +'</section>';
}
