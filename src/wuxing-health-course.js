// AURMOVA 五行传统身体健康对照｜仅作为原始教材速查和对话引导。
// 来源：Josephine 2026-10-02五行健康对照表、后续原书五行健康照片（约55–64页）。
// 不能把五行频率与疾病、事故、症状发生概率建立临床因果联系。
export const WUXING_HEALTH_COURSE = Object.freeze({
  intro:"这是原书传统五行与身体主题的课程归档，不是诊断、筛查、医学概率或治疗建议。课程列举的病名和征象并非由数字得到的个人健康结论。",
  positionRule:"只读取顾客选择的黄金流年M/N/O/P/Q/R六位。按同一种五行累计：相同五行出现2次或以上才展开健康教材对照（如3+8均属火）；五行仅出现1次不特别关注。不能据此推断疾病风险。",
  missingRule:"某个五行在六位中未出现，只表示本课程数字盘没有这类数字，不表示对应器官有疾病、缺陷或需要补五行。",
  frequentRule:"某个五行在六位中出现较多，仅表示数字分布集中；无法判断心、肺、肾、肝、脾胃等器官的健康状态。",
  entries:[
    {key:"metal",element:"金",digits:[1,6],organs:["肺","大肠","皮肤","呼吸系统"],
     courseDiseases:["哮喘","支气管炎","呼吸系统问题"],
     courseSigns:["鼻部过敏／枯草热","皮肤敏感","咳嗽、气喘、呼吸不适","排便状况变化"],
     provenance:"原课程金素健康表及照片第62页；教材中的病名和症状仅为传统关联。",
     consultAdult:"“课程把金与呼吸、皮肤及肠道主题放在一起。先不看数字下结论，你最近实际有没有呼吸、皮肤或排便方面的困扰？如果没有，我们就不把它当作你的健康问题。”",
     consultChild:"“我们不会凭孩子的数字判断肺部或肠道健康。最近孩子有没有持续咳嗽、呼吸不适、皮肤敏感或排便变化？如果有，以实际症状联系医生。”"},
    {key:"water",element:"水",digits:[2,7],organs:["肾","膀胱","泌尿系统","原课程也列子宫"],
     courseDiseases:["泌尿相关不适","原表列虚弱及性功能问题"],
     courseSigns:["怕冷","黑眼圈／眼袋","频尿、夜尿变化","腰膝酸软","耳鸣（原书案例）"],
     provenance:"原课程水素健康表及照片第60–61页；不能因数字得出肾脏或膀胱疾病结论。",
     consultAdult:"“原书把水归在肾、膀胱等传统主题，不过数字不能反映器官功能。你实际有频尿、怕冷或其他不舒服吗？如果没有，不需要担心这项对照。”",
     consultChild:"“孩子的水数字多少并不能说明肾脏健康。若近期出现尿频、排尿疼痛或其他真实身体不适，应请医生评估。”"},
    {key:"fire",element:"火",digits:[3,8],organs:["心脏","小肠","血管","血液循环"],
     courseDiseases:["原书列心血管及循环相关问题"],
     courseSigns:["睡眠困难、失眠多梦","心慌或心悸感","健忘、注意力难集中","多汗","焦虑紧张感","小便不适（原书列举）"],
     provenance:"原课程火素健康表及照片第59–60页；仅为教材的传统列举。",
     consultAdult:"“这套课程把火与心脏、循环、睡眠等话题联系，但不能据此说你今年心脏会出问题。最近实际睡眠、压力或身体感受有没有需要关注的事？”",
     consultChild:"“不会因为火数字出现多就判断孩子心脏有问题。我们可以了解孩子真实的睡眠、活动与压力；出现不适时，应由医生判断。”"},
    {key:"wood",element:"木",digits:[4,9],organs:["肝","胆","眼睛","骨骼","筋／肌腱","脚"],
     courseDiseases:["原课程列眼睛、皮肤、肌腱及筋骨方面的问题"],
     courseSigns:["眼睛不适","肩膀酸痛","肌肉抽筋","耐力变化","月经不规律（仅适用于相关实际情况）","味觉变化"],
     provenance:"原课程木素健康表及照片第58页；原书说法不代表个人器官异常。",
     consultAdult:"“传统课程把木与眼睛、筋骨、肝胆放在同一组。我们只核对真实生活中有没有视力、肌肉或身体不适，不能从4号或9号判断肝胆有问题。”",
     consultChild:"“孩子的木数字多少不是视力或肝胆健康检查。若有视力、运动或肌肉方面真实的不舒服，可由相应医护人员评估。”"},
    {key:"earth",element:"土",digits:[5],organs:["脾","胃","消化系统","腹部","胰腺"],
     courseDiseases:["原课程列消化不良、贫血、关节炎、痔疮及淋巴相关问题"],
     courseSigns:["便秘","腹胀、消化不适","营养吸收不佳的说法","体重变化","关节不适","腹泻或排便异常"],
     provenance:"原课程土素健康表及照片第61页；原书把不同器官与病名归于同一传统类别，不具医学因果性。",
     consultAdult:"“原书把土与脾胃、消化及生活规律联系，但不能因为土出现较多就说你容易得胃病。你实际饮食、消化或排便状况有没有想改善的地方？”",
     consultChild:"“孩子的土数字是否出现，无法反映消化系统健康。若饮食、排便或体重出现持续异常，请依据实际情况咨询医生。”"}
  ]
});
// 五行脏腑传统配对经公开传统医学综述与WHO资料核对。
// 数字配对是AURMOVA课程规则，不能误认为传统河图通用数字配对。
export const WUXING_TRADITIONAL_ORGAN_PAIRS = Object.freeze({
  metal:["肺","大肠"],water:["肾","膀胱"],fire:["心","小肠"],
  wood:["肝","胆"],earth:["脾","胃"]
});
const htmlEsc=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const joined=a=>a.map(htmlEsc).join("、");

export function analyzeWuxingHealthReference(annualDistribution,childMode=false){
 if(!annualDistribution||annualDistribution.positionCount!==6||!Array.isArray(annualDistribution.rows)||annualDistribution.rows.length!==5)return null;
 const details=WUXING_HEALTH_COURSE.entries.map(e=>{
   const hit=annualDistribution.rows.find(r=>r.key===e.key);
   if(!hit||!Number.isInteger(hit.count)||hit.count<0||hit.count>6||!Array.isArray(hit.slots)||hit.slots.length!==hit.count||!Array.isArray(hit.digits)||hit.digits.length!==hit.count)return null;
   const numberCounts=Object.entries(hit.digits.reduce((counts,n)=>({...counts,[n]:(counts[n]||0)+1}),{}))
     .map(([digit,count])=>({digit:Number(digit),count}));
   return {...e,count:hit.count,slots:hit.slots,annualDigits:hit.digits,
     numberCounts,focused:hit.count>=2,
     description:hit.count>=2
       ?"同一种五行在当年六个位中累计出现2次或以上，列入教材观察重点（不是疾病风险）"
       :hit.count===1
         ?"仅出现1次，不列为本年度五行健康重点"
         :"本年未出现，不列为本年度五行健康重点",
     talk:childMode?e.consultChild:e.consultAdult};
 });
 if(details.some(x=>!x)||details.reduce((n,x)=>n+x.count,0)!==6)return null;
 return {year:annualDistribution.year,details,
   focused:details.filter(x=>x.count>=2).sort((a,b)=>b.count-a.count),
   referenceOnly:true,diseasePrediction:false,
   threshold:"五行健康教材重点按五行归类累计：所选流年M/N/O/P/Q/R六个位置内，同一五行出现2次或以上便列为重点。小火3和大火8各出现1次，也属于火出现2次；只出现1次则不特别展开。不能用数字判断疾病风险。"};
}
export function renderWuxingHealthReference(annualDistribution,childMode=false){
 const data=analyzeWuxingHealthReference(annualDistribution,childMode);
 if(!data)return "";
 const meta=WUXING_HEALTH_COURSE;
 const cards=data.focused.map(r=>{
   const digitList=r.numberCounts.map(x=>x.digit+"号×"+x.count).join("、");
   const positions=r.slots.map((slot,i)=>slot+"="+r.annualDigits[i]).join("、");
   return '<article class="card reading-card">'
     +'<h4>'+r.element+'五行｜'+r.count+'次（'+htmlEsc(digitList)+'）</h4>'
     +'<p><b>流年六位核对：</b>'+htmlEsc(positions)+'</p>'
     +'<p><b>为何列入重点：</b>'+htmlEsc(r.description)+'。同五行下的小号与大号一起累计。</p>'
     +'<p><b>传统五行脏腑主对应：</b>'+joined(WUXING_TRADITIONAL_ORGAN_PAIRS[r.key])+'</p>'
     +'<p><b>课程延伸身体主题：</b>'+joined(r.organs)+'</p>'
     +'<p><b>原书列举的病痛范围（不是本人的疾病）：</b>'+joined(r.courseDiseases)+'</p>'
     +'<p><b>原书列举的不适或征象（不是预测）：</b>'+joined(r.courseSigns)+'</p>'
     +'<p><b>教材出处：</b>'+htmlEsc(r.provenance)+'</p>'
     +'<div class="question-box"><b>Josephine身体关怀白话：</b>'+htmlEsc(r.talk)+'</div>'
     +'</article>';
 }).join("");
 const summary=data.focused.map(r=>r.element+r.count+"次（"+r.numberCounts.map(x=>x.digit+"号×"+x.count).join("、")+"）").join("；")||"无";
 return '<section class="foundation-block annual-wuxing-health-reference">'
   +'<div class="card-heading"><div><small>COURSE REFERENCE · NOT MEDICAL ADVICE</small><h4>⑥ 五行对应身体健康｜同五行累计2次以上</h4></div><span>'+data.year+'流年</span></div>'
   +'<div class="formula-note"><b>规则：</b>'+htmlEsc(data.threshold)
   +'<br><b>本年课程观察重点：</b>'+htmlEsc(summary)+'</div>'
   +(data.focused.length?'<div class="reading-grid">'+cards+'</div>'
     :'<div class="formula-note">本年度六个位没有任何一种五行累计出现2次或以上；只出现1次的五行不展开身体对照。完整原书资料可到「五行资料」查询。</div>')
   +'<div class="formula-note"><b>重要边界：</b>'+htmlEsc(meta.intro)
   +' 无论数字分布如何，身体不适都要以真实症状和医疗检查为准，不能因某五行多就预测身体疾病。</div>'
   +'</section>';
}
export function buildWuxingHealthLibraryEntries(){
 const a=WUXING_HEALTH_COURSE,category="五行资料";
 return [
  {category,title:"流年五行身体健康对照｜总览及专业边界",
   keywords:"五行健康 病痛范围 器官 预兆 金木水火土 黄金流年 传统课程",
   text:[a.intro,a.positionRule,a.missingRule,a.frequentRule].join("\n\n")},
  ...a.entries.map(e=>({category,
   title:"五行身体对应｜"+e.element+"（"+e.digits.join("、")+"）",
   keywords:"五行健康 "+e.element+" "+e.digits.join(" ")+" "+e.organs.join(" ")+" "+e.courseSigns.join(" "),
   text:["【传统课程器官】"+e.organs.join("、"),
     "【原书列举的病痛范围，不是个人疾病】"+e.courseDiseases.join("、"),
     "【原书列举的不适及征象，不是预测】"+e.courseSigns.join("、"),
     "【出处】"+e.provenance,"【成人咨询示范】"+e.consultAdult,"【儿童咨询示范】"+e.consultChild,
     "【限制】不可依据同号重复、五行多少或缺失判断当年的疾病、事故或器官健康。"].join("\n\n")}))]
}
