import { calculateBlueprint } from "./engine/blueprint.js?v=32";

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function currentCustomer(){
  const id=new URLSearchParams((location.hash.split("?")[1]||"")).get("id");
  if(!id)return null;
  try{return (JSON.parse(localStorage.getItem("aurmova.customers")||"[]")||[]).find(x=>x.id===id)||null}catch{return null}
}

function emotionalPattern(a){
  const counts=a.innerEnergy?.counts||{};
  const c2=Number(counts[2]||0),c7=Number(counts[7]||0),c3=Number(counts[3]||0),c8=Number(counts[8]||0);
  const inward=c2+c7,outward=c3+c8;
  let mode="四项低显型";
  let summary="2、7、3、8都不突出，只代表这四个情绪数字不是目前最明显的线索，不能直接判定为情绪稳定。";
  let script="我先不急着给你贴标签。你这四个情绪数字都不算突出，所以我更想从你真实遇事时的反应来看：你不舒服的时候，是会先忍、先说，还是其实没有太大波动？";
  let probe="最近一次你明显不开心的时候，你当下是怎么处理的？";
  let growth="先观察真实场景，不硬套内收或外放。";

  if(inward>0&&outward===0){
    mode="情绪内收型";
    summary="2／7较明显、3／8较少：通常更容易先观察、先忍、先自己消化。";
    script="我先丢一个观察给你，你听听看像不像。你不是没有情绪，而是很多时候会先自己消化，不太想马上说出来。尤其怕关系变差的时候，你会不会宁愿先忍一下？";
    probe="最近有没有一件事你其实不舒服，但当下没有讲，后来自己想了很久？";
    growth="练习把感受提前说出来：先说事实，再说感受，再说需要，不必等到累积很多才表达。";
  }else if(outward>0&&inward===0){
    mode="情绪外放型";
    summary="3／8较明显、2／7较少：反应和立场通常比较直接，别人更容易从表情、语气或行动看出来。";
    script="你会不会比较像那种开心不开心都很难完全藏住的人？不是故意要伤人，而是你的反应速度比较快，情绪一来就容易先表现出来。";
    probe="最近有没有一次你反应很快，事后才发现对方其实还没准备好接你的情绪？";
    growth="练习在回应前多一个停顿，让表达保留立场，也给别人接住信息的空间。";
  }else if(inward>0&&outward>0){
    mode=inward>outward?"双模式切换｜内收底色":outward>inward?"双模式切换｜外放底色":"双模式切换｜两边接近";
    summary=inward>outward
      ?"2／7与3／8都有，但内收数字更多：多数时候先忍、先观察，累积到临界点才会直接表达。"
      :outward>inward
        ?"2／7与3／8都有，但外放数字更多：多数时候表达较直接，但在特别在意的关系里也可能转成闷着消化。"
        :"2／7与3／8数量接近：两套模式都明显，可能因对象和场景不同而切换。";
    script="我先丢一个观察给你，你听听看像不像。你的盘里同时有会忍、会观察的一面，也有一旦踩到底线就会直接表达的一面。所以你不是单纯脾气大，也不是单纯太能忍，而是会看场景切换。";
    probe="最近一次你先忍了很久，后来突然说出来，是发生在谁身上？在那之前，其实有没有更早就觉得不舒服？";
    growth="最大的练习不是变成不生气的人，而是缩短从感觉到不舒服到说出来之间的距离：感觉到 → 说清楚，而不是感觉到 → 忍着 → 累积 → 爆发。";
  }
  return {c2,c7,c3,c8,inward,outward,mode,summary,script,probe,growth};
}

function render(){
  const c=currentCustomer();
  const plain=document.querySelector(".aurmova-plain");
  if(!c||!plain||document.querySelector(".emotion-pattern-panel"))return;
  const a=calculateBlueprint(c.birthday);
  if(!a)return;
  const e=emotionalPattern(a);
  const box=document.createElement("div");
  box.className="foundation-block emotion-pattern-panel";
  box.innerHTML=
    '<div class="card-heading"><div><small>EMOTION NUMBERS</small><h3>情绪数字 · 2/7内收 × 3/8外放</h3></div><span>'+esc(e.mode)+'</span></div>'
    +'<div class="golden-support-grid"><div><span>2</span><b>'+e.c2+'</b></div><div><span>7</span><b>'+e.c7+'</b></div><div><span>3</span><b>'+e.c3+'</b></div><div><span>8</span><b>'+e.c8+'</b></div><div><span>内收2+7</span><b>'+e.inward+'</b></div><div><span>外放3+8</span><b>'+e.outward+'</b></div></div>'
    +'<p class="panel-note">'+esc(e.summary)+'</p>'
    +'<div class="question-box"><b>Josephine 可以直接这样讲：</b><br>“'+esc(e.script)+'”</div>'
    +'<div class="question-box"><b>验证顾客：</b><br>“'+esc(e.probe)+'”</div>'
    +'<div class="question-box"><b>成长提醒：</b><br>'+esc(e.growth)+'</div>'
    +'<div class="formula-note">这是咨询观察框架，不用单一数字给顾客下定论。若顾客有持续明显的身体或心理不适，应交给相应专业人员评估。</div>';
  plain.insertAdjacentElement("afterend",box);
}

document.addEventListener("click",()=>setTimeout(render,120),true);
window.addEventListener("hashchange",()=>setTimeout(render,180));
setTimeout(render,260);
