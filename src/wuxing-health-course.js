// AURMOVA 五行传统身体健康对照｜仅作为原始教材速查和对话引导。
// 来源：Josephine 2026-10-02五行健康对照表、后续原书五行健康照片（约55–64页）。
// 不能把五行频率与疾病、事故、症状发生概率建立临床因果联系。
export const WUXING_HEALTH_COURSE = Object.freeze({
  intro:"这是原书传统五行与身体主题的课程归档，不是诊断、筛查、医学概率或治疗建议。课程列举的病名和征象并非由数字得到的个人健康结论。",
  positionRule:"只读取当年黄金流年 M、N、O、P、Q、R 六个位置；只有同一个数字出现2次或以上才列为五行健康教材观察重点，出现1次忽略。同五行的不同数字不得合计触发；不用于判断疾病风险。",
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
     consultAdult:"“原书把土与脾胃、消化及规律联系，但土没有出现在流年盘，也不能说你容易得胃病。你实际饮食、消化或排便状况有没有想改善的地方？”",
     consultChild:"“孩子的土数字是否出现，无法反映消化系统健康。若饮食、排便或体重出现持续异常，请依据实际情况咨询医生。”"}
  ]
});
const htmlEsc=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const joined=a=>a.map(htmlEsc).join("、");

export function analyzeWuxingHealthReference(annualDistribution,childMode=false){
 if(!annualDistribution||annualDistribution.positionCount!==6||!Array.isArray(annualDistribution.rows)||annualDistribution.rows.length!==5||!Array.isArray(annualDistribution.repeatDigits))return null;
 const details=WUXING_HEALTH_COURSE.entries.map(e=>{
   const hit=annualDistribution.rows.find(r=>r.key===e.key);
   if(!hit||!Number.isInteger(hit.count)||hit.count<0||hit.count>6||!Array.isArray(hit.slots)||hit.slots.length!==hit.count)return null;
   const repeatedDigits=annualDistribution.repeatDigits
     .filter(r=>e.digits.includes(r.digit)&&Number.isInteger(r.count)&&r.count>=2&&Array.isArray(r.slots)&&r.slots.length===r.count);
   return {...e,count:hit.count,slots:hit.slots,repeatedDigits,
     focusDigits:repeatedDigits.map(r=>r.digit),
     repeatCount:repeatedDigits.reduce((n,r)=>n+r.count,0),
     description:repeatedDigits.length
       ?"同一号码在六个位置中重复2次或以上，列为教材观察重点（不表示患病风险）"
       :"没有同号重复，不列入健康观察重点",
     talk:childMode?e.consultChild:e.consultAdult};
 });
 if(details.some(x=>!x)||details.reduce((n,x)=>n+x.count,0)!==6)return null;
 const focused=details.filter(x=>x.repeatedDigits.length>0).sort((a,b)=>b.repeatCount-a.repeatCount);
 return {year:annualDistribution.year,details,focused,
   referenceOnly:true,diseasePrediction:false,
   threshold:"只有同一数字在流年M/N/O/P/Q/R中出现至少2次，才列教材健康关怀重点；同五行不同数字不合并触发。"};
}
export function renderWuxingHealthReference(annualDistribution,childMode=false){
 const data=analyzeWuxingHealthReference(annualDistribution,childMode);
 if(!data)return "";
 const meta=WUXING_HEALTH_COURSE;
 const cards=data.focused.map(r=>{
   const repeated=r.repeatedDigits.map(x=>x.digit+"号×"+x.count+"（"+x.slots.join("、")+"）").join("、");
   return '<article class="card reading-card">'
   +'<h4>'+r.element+'｜'+htmlEsc(repeated)+'</h4>'
   +'<p><b>重复数字：</b>'+htmlEsc(repeated)+'。'+htmlEsc(r.description)+'</p>'
   +'<p><b>原书对应身体部位：</b>'+joined(r.organs)+'</p>'
   +'<p><b>原书列举的病痛范围（不是本人的疾病）：</b>'+joined(r.courseDiseases)+'</p>'
   +'<p><b>原书列举的不适或征象（不是预测）：</b>'+joined(r.courseSigns)+'</p>'
   +'<p><b>教材出处：</b>'+htmlEsc(r.provenance)+'</p>'
   +'<div class="question-box"><b>Josephine身体关怀白话：</b>'+htmlEsc(r.talk)+'</div>'
   +'</article>';
 }).join("");
 const focusLines=data.focused.map(r=>r.element+"："+r.repeatedDigits.map(x=>x.digit+"号在"+x.slots.join("、")+"出现"+x.count+"次").join("、"));
 return '<section class="foundation-block annual-wuxing-health-reference">'
   +'<div class="card-heading"><div><small>COURSE REFERENCE · NON-MEDICAL</small><h4>⑥ 五行身体对照｜仅关注同号重复2次以上</h4></div><span>'+data.year+'流年</span></div>'
   +'<div class="formula-note"><b>触发规则：</b>'+htmlEsc(data.threshold)
   +'<br><b>本年需核对的重复号码：</b>'+htmlEsc(focusLines.join("；")||"无")+'</div>'
   +(data.focused.length?'<div class="reading-grid">'+cards+'</div>'
      :'<div class="formula-note">本年度六个位没有同一个数字重复2次或以上，因此不展开任何五行健康身体对照。完整原书五行参考保留在「五行资料」。</div>')
   +'<div class="formula-note"><b>使用边界：</b>'+htmlEsc(meta.intro)
   +' 单次出现、同五行不同号码合计、五行缺失均不作为需要特别留意的健康提示。'
   +' 无论是否有重复数字，持续或严重身体症状都应依据实际情况就医。</div>'
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
