import { DB as JOINT_DB, CHILD, MAIN, INNER_PREF } from "./aurmova-knowledge.js?v=26";
import { MAIN_DETAIL, DIGIT_CORE, MODULES } from "./floot-knowledge.js?v=26";
import { ENERGY_LIBRARY } from "./energy-library.js?v=26";
import { CONSTRAINT_NOTES, CHILDHOOD_MODES, INNER_DIGIT_POLARITY } from "./consultation-library.js?v=26";
import { RESTORED_PRIVATE_LIBRARY } from "./private-library.js?v=26";

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function entries(){
  const out=[];
  (JOINT_DB||[]).forEach(x=>out.push({category:"81组联合码",title:x.code||x.title||"",keywords:String(x.code||"")+" "+String(x.title||""),source:"AURMOVA 81组资料库",text:x.text||""}));
  for(let n=1;n<=9;n++){
    const d=MAIN_DETAIL[n]||{},core=DIGIT_CORE[n]||{},e=ENERGY_LIBRARY[n]||{},child=CHILD?.[n]||CHILD?.[String(n)]||{},mode=CHILDHOOD_MODES[n]||{},pol=INNER_DIGIT_POLARITY[n]||{};
    out.push({category:"1–9主性格",title:"主性格 "+n+" · "+(d.title||""),keywords:"主性格"+n+" "+n+"号人",source:"Floot × AURMOVA",text:[MAIN?.[n]||"",d.thinking&&"思考："+d.thinking,d.behavior&&"行为："+d.behavior,d.speech&&"说话："+d.speech,d.stress&&"压力："+d.stress,d.emotion&&"情感需求："+d.emotion,d.childhood&&"童年模式："+d.childhood,d.drive&&"内驱力："+d.drive,d.talents&&"核心天赋："+d.talents,d.watch&&"留意："+d.watch,d.script&&"Josephine 白话："+d.script].filter(Boolean).join("\\n")});
    out.push({category:"内驱力",title:"内驱力 "+n,keywords:"内驱 内驱力 "+n,source:"AURMOVA 主性格资料",text:[d.drive&&"核心内驱："+d.drive,INNER_PREF?.[n]&&"内在偏好："+INNER_PREF[n],d.script&&"咨询白话："+d.script].filter(Boolean).join("\\n")});
    out.push({category:"起始数",title:"起始数 "+n,keywords:"起始 起始数 "+n,source:"AURMOVA 数字核心资料",text:["核心："+(core.core||""),"优势："+(core.gift||""),"卡点："+(core.shadow||""),"适合发挥："+(core.work||"")].join("\\n")});
    out.push({category:"缺失数",title:"缺失 "+n,keywords:"缺失"+n+" 缺失数"+n,source:"AURMOVA 能量资料",text:["常见表现："+(e.low||""),"成长／补足方向："+(e.gift||""),"白话：缺失不等于没有能力，而是这股能量更需要后天练习。"].join("\\n")});
    out.push({category:"挑战数",title:"挑战 "+n,keywords:"挑战"+n+" 挑战数"+n+" 重复"+n,source:"AURMOVA 能量资料",text:["正向潜力："+(e.gift||""),"过强／失衡时："+(e.high||""),"白话：重复出现要把天赋与过强风险一起看。"].join("\\n")});
    out.push({category:"制约数／原生家庭",title:"制约数 "+n,keywords:"制约"+n+" 原生家庭 "+n,source:"AURMOVA 咨询资料",text:[CONSTRAINT_NOTES[n]||"",mode.pattern&&"小时候模式："+mode.pattern,mode.need&&"真正需要："+mode.need,mode.adult&&"长大后重复："+mode.adult,mode.guide&&"开解方向："+mode.guide].filter(Boolean).join("\\n")});
    out.push({category:"三角形内数字",title:"数字 "+n+" · 正面／负面",keywords:"数字"+n+" 正面 负面",source:"AURMOVA 三角形资料",text:["正面："+(pol.positive||""),"负面："+(pol.negative||"")].join("\\n")});
    out.push({category:"儿童天赋",title:n+"号儿童 · "+(child.name||""),keywords:"儿童"+n+" 亲子"+n+" 天赋"+n,source:"第十三章｜儿童天赋梳理",text:[child.keywords?.length&&"关键词："+child.keywords.join("、"),child.strength&&"天赋："+child.strength,child.watch&&"留意："+child.watch,child.guide&&"教育方向："+child.guide].filter(Boolean).join("\\n")});
  }
  (RESTORED_PRIVATE_LIBRARY||[]).forEach(x=>out.push(x));
  (MODULES||[]).forEach(x=>out.push({category:"资料库索引",title:x[0],keywords:x[0],source:"AURMOVA 模块索引",text:x[1]||""}));
  return out;
}
const ALL=entries();

function paint(query){
  const host=document.querySelector("#library-results"); if(!host)return;
  const q=String(query||"").trim().toLowerCase().replace(/\\s+/g,"");
  const rows=q?ALL.filter(x=>(x.category+" "+x.title+" "+x.keywords+" "+x.text).toLowerCase().replace(/\\s+/g,"").includes(q)):ALL;
  const groups={}; rows.forEach(x=>(groups[x.category]??=[]).push(x));
  let html='<div class="notice">已找回 '+rows.length+' 条资料'+(q?"｜查询："+esc(query):"｜目前显示全部")+'</div>';
  for(const cat of Object.keys(groups)){
    html+='<section class="card" style="margin-top:12px"><h3>'+esc(cat)+' <small>('+groups[cat].length+')</small></h3>';
    html+=groups[cat].map(x=>'<details style="border-top:1px solid #eadfce;padding:10px 0"><summary style="cursor:pointer;font-weight:700">'+esc(x.title)+'</summary><div style="padding:10px 2px;line-height:1.75"><small style="color:#9b7540">'+esc(x.source||"AURMOVA 私人资料")+'</small><p style="white-space:normal">'+esc(x.text).replace(/\\n/g,"<br>")+'</p></div></details>').join("");
    html+='</section>';
  }
  if(!rows.length) html+='<div class="card empty" style="margin-top:12px"><h3>没有找到</h3><p>试试：112、缺失4、挑战7、内驱2、三大主义、九大关系、679。</p></div>';
  host.innerHTML=html;
}
function enhance(){
  if((location.hash.split("?")[0]||"#home")!=="#library")return;
  const card=document.querySelector("#app .form-card"),input=document.querySelector("#library-search");
  if(!card||!input)return;
  let host=document.querySelector("#library-results");
  if(!host){host=document.createElement("div");host.id="library-results";card.insertAdjacentElement("afterend",host);}
  if(!input.dataset.ready){input.dataset.ready="1";input.addEventListener("input",()=>paint(input.value));}
  paint(input.value);
}
window.addEventListener("hashchange",()=>setTimeout(enhance,80));
setTimeout(enhance,180);
