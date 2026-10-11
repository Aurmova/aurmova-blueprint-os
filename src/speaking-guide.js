import {buildCustomerReport,CUSTOMER_REPORT_TYPES} from './customer-report-image.js?v=2';
import {calculateBlueprint,activeFlowYear} from './engine/blueprint.js?v=54';
import {buildGuidedReply} from './guided-consultation-replies.js?v=1';
const pairedTypes=['relationship','family','cooperation'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short=v=>String(v||'').trim().slice(0,1500);
const pick=(report,title)=>report.sections.find(s=>s.title.includes(title))?.body||'';
export function speakingSessionKey(customerId,type,a,b,year){return 'aurmova.speakingGuide.'+JSON.stringify([customerId,type,a?.name,a?.birthday,b?.name||'',b?.birthday||'',type==='year'?Number(year):null]);}
export function buildSpeakingSteps({type,customer,other={},year,child=false}){
 const report=buildCustomerReport({type,customer,other,year,detail:'full'});
 const name=customer.name,otherName=other.name||'对方',pair=pairedTypes.includes(type);
 const opening=type==='family'||child?'今天我先听你最想了解孩子的哪一件事，再一起看孩子的回应方式和适合的支持。':'今天我先听你最想解决哪一件事，再用蓝图整理相关的模式。';
 const firstQuestion=type==='family'||child?'最近孩子在哪件事最让你担心，或最想了解？请说一个具体场景。':type==='cooperation'?'你们目前合作中最想改善的一件事是什么？请说最近一次实际发生的情况。':type==='relationship'?'你们相处里最想改善的一件事是什么？请说最近一次实际发生的情况。':type==='year'?'这个年度，你最想推进或改善哪一件事？现在有什么安排、限制或担心？':'你今天最想解决的是工作、关系、家庭，还是自己的方向？最近一件什么事让你想来了解？';
 const main=calculateBlueprint(customer.birthday).mainPersonality;
 const frame=type==='year'?'这次看的范围是'+report.subtitle+'。我会把它当成安排重点的参考，再和你的实际计划一起核对。':pair?'我们会把'+name+'与'+otherName+'放在同一个场景里看：双方怎样表达、怎样回应，以及哪里需要调整。':child?'我会围绕孩子的实际年龄、学习和日常回应来谈，先听一个具体场景，再讨论家长怎样支持。':'我先从你的主性格'+main+'号切入，讲一个容易观察的模式，再听你的实际经历。';
 let topics;
 if(type==='life'&&child){
  const childReport=buildCustomerReport({type:'family',customer,other:customer,detail:'full'});
  topics=[['孩子怎样参与和学习',pick(childReport,'学习与参与'),'孩子在什么任务比较愿意参与？给一步指令和一次示范时，有什么不同？','learning'],['孩子需要怎样的支持',pick(childReport,'怎样接上话'),'你用什么说法时，孩子比较接得住？最近一次发生了什么？','communication'],['卡住时先看现场',pick(childReport,'不配合'),'当时孩子是没听懂、做不到、累了，还是想要别的安排？你怎么知道？','emotion']];
 }else if(type==='life')topics=[['先讲一个优势',pick(report,'自然优势')+' '+pick(report,'工作与学习'),'这个方向在你的生活里像不像？请说最近一次你觉得自己做得不错的事。','communication'],['再讲内在需要',pick(report,'内在需要'),'哪一部分最贴近你？你通常会直接说出这个需要，还是希望别人自己知道？','needs'],['最后看压力与场景',pick(report,'压力出现')+' '+pick(report,'生活场景'),'最近一次卡住时，你先说了什么、做了什么？你当时真正希望得到什么？','boundary']];
 else if(type==='year')topics=[['先讲年度重点',pick(report,'年度关注')+' '+pick(report,'工作／学习'),'这与你今年已经在做的事情，有哪一部分接得上？','communication'],['再看关系与资源',pick(report,'关系与家庭')+' '+pick(report,'时间、开支'),'哪个安排最需要调整？现在有什么条件，哪些需要先确认？','boundary'],['最后看推进的阻力',pick(report,'压力与节奏'),'如果这月只推进一件事，你会选什么？最容易卡在哪一步？','communication']];
 else if(type==='relationship')topics=[['先听双方的表达',pick(report,'第一位')+'\n'+pick(report,'第二位'),'刚才那件事，两个人分别说了什么？对方的想法是本人说过，还是你推测的？','communication'],['再看需要有没有接上',pick(report,'双方差异'),'你希望怎样被回应？对方有没有直接说明自己的需要？','needs'],['最后看冲突怎样修复',pick(report,'意见不一致'),'在哪句话开始听不进去？什么时候还能够停下来、重新谈？','conflict']];
 else if(type==='family')topics=[['先看孩子怎么接得住',pick(report,'发展阶段')+' '+pick(report,'学习与参与'),'孩子在哪个任务卡住？把任务拆小或示范一次后，有没有不同？','learning'],['再看家长与孩子的交流',pick(report,'怎样接上话'),'大人第一句怎么说？孩子怎样回应？哪一句之后开始互相听不进去？','communication'],['最后处理不配合的场景',pick(report,'不配合')+' '+pick(report,'家长自己的压力'),'当时孩子和大人各自是什么状态？先改一个说法，会不会更容易继续？','emotion']];
 else topics=[['先看分工怎么搭配',pick(report,'分工可以'),'目前谁负责哪件事？最近一次重复做或漏做是怎样发生的？','roles'],['再看交接和决定',pick(report,'进度与交接'),'谁决定、谁执行、谁验收？这些是否由双方共同确认？','decision'],['最后处理压力与分歧',pick(report,'压力下')+' '+pick(report,'分歧的处理'),'争议的事实是什么？哪些条件可商量，哪些是双方知道的底线？','conflict']];
 const steps=[
 {id:'open',title:'开场，让顾客安心',say:name+'，'+opening+'如果描述与你的经历不同，请直接告诉我，我们以实际经历为准。',question:'这样开始可以吗？',transition:'那我先听听你现在最在意的事情。'},
 {id:'problem',title:'确认这次最想解决的问题',say:'今天我们先抓一件最重要的事，避免讲了很多，最后不知道怎样用。',question:firstQuestion,transition:'好，我会把你刚才说的事情作为今天的主线。'},
 {id:'frame',title:'说明这次会怎样看',say:frame,question:'围绕刚才那件事，你最希望咨询结束后得到什么帮助？',transition:'接下来我先讲一个观察，你听听看是否符合。'},
 ...topics.map(([title,say,question,topic],i)=>({id:'topic'+i,title,say,question,topic,transition:i<2?'我们把这个例子记下来，再看下一层。':'我们已经找到需要核对的场景，接下来只选一个小行动。'})),
 {id:'action',title:'把解读变成一个行动',say:child?'选一个适合孩子年龄的小任务，只给一步清楚的指引，先让孩子尝试，再具体回应他的努力。':pick(report,'本周行动')||pick(report,'共同练习'),question:'这一步你愿意试吗？怎样调整，才是你现在做得到的？',transition:'我们把你愿意做的部分说具体。'},
 {id:'agreement',title:'确认怎么做、何时复盘',say:'我们约定一件具体的事：什么时候做、做到什么程度，以及用什么变化判断有没有帮助。',question:'你愿意尝试的行动是什么？准备什么时候开始？下次我们核对什么？',transition:'最后，我把今天谈的重点整理一下。'},
 {id:'close',title:'总结与自然收尾',say:'今天我们从你的实际问题出发，核对了表达、需要与行动方式。符合的观察留下，不符合的就调整。我们先实践一小步，再看真实效果。',question:'今天哪一点最有帮助？还有什么需要我重新说明？',transition:'我会按今天确认的重点整理顾客报告。报告项目和内容由我检查后再交给你。'}
 ];
 return {title:CUSTOMER_REPORT_TYPES[type],steps,report};
}
export function speakingReply({type,step,answer,customer,other={},respondent}){
 const text=short(answer);if(!text)return '先记录顾客的实际回答，再生成接话。';
 if(pairedTypes.includes(type)&&step.topic){
  const r=buildGuidedReply({mode:type,topicId:step.topic,question:step.question,answer:text,respondent,a:customer,b:other});
  // Name calculations and the longer technical basis stay in the existing detailed panel.
  return r.parts.filter(([heading])=>heading!=='连接双方资料').map(([,body])=>body).join('\n\n');
 }
 if(/打我|打孩子|殴打|家暴|威胁杀|自伤|自杀|不想活/.test(text))return '这段经历先按安全问题处理，不能用数字解释伤害。你和孩子现在安全吗？如果有正在发生的危险，先联系当地紧急服务或可信任的现场援助，我们先暂停蓝图解读。';
 if(/^(没有|不是|不像|不对|不认同|不同意|不符合|不是这样)[。！!？?\s]*$/.test(text))return '谢谢你直接告诉我，这一条先放下。我们不需要为了配合数字寻找故事。那你最近真实发生的情况是怎样的？';
 if(/^(不知道|不清楚|不确定|想不起来|还没想过|不懂|嗯|好|好的|ok)[。！!？?\s]*$/i.test(text))return '没关系，我们先把问题缩小。最近一次类似的事情是什么？如果现在没有例子，就先留作观察，不急着下结论。';
 if(step.id==='problem')return '我听到你说：“'+text+'”。我先确认，我有没有理解错？这件事里，你最想改变的是哪一部分？';
 if(step.id==='agreement'||step.id==='action')return '我先记录你的意思：“'+text+'”。这一步的时间、范围和需要的帮助，我们再确认一次，确保是你愿意、也做得到的。';
 return '我听到你说：“'+text+'”。我们先以这个真实例子为准。你当时的感受和需要是什么？我刚才讲的观察，哪部分符合、哪部分需要调整？';
}
export function speakingSummary(records={}){
 const issue=short(records.problem?.answer),action=short(records.agreement?.answer)||short(records.action?.answer);
 return (issue?'今天你最想处理的是：“'+issue+'”。':'今天谈的重点，请你再用自己的话确认一次。')+'\n'+(action?'你刚才说愿意尝试：“'+action+'”。我们再确认开始时间与复盘方式。':'行动还没有确认，先一起选一件你愿意尝试的小事。');
}
export function mountSpeakingGuide(panel,{customer,type='life',year=activeFlowYear(),child=false,getPairs=()=>[]}){
 const doc=panel.ownerDocument,root=doc.createElement('section');root.className='speaking-guide';
 root.innerHTML='<style>#app.speaking-focus>:not(.client-summary):not(.module-tabs):not(#v6-module-panel):not(.page-header){display:none!important}.speaking-active>:not(.speaking-guide){display:none!important}.speaking-guide{background:#fffdf9;border:1px solid #c6ad7c;border-radius:12px;padding:20px;margin-bottom:20px}.speaking-guide h2{margin:0 0 10px}.speaking-guide label{display:block;margin:14px 0}.speaking-guide select,.speaking-guide input[type=number],.speaking-guide textarea{display:block;width:100%;box-sizing:border-box;padding:12px;border:1px solid #d7c8b0;background:#fff;border-radius:8px;font:inherit;margin-top:7px}.speaking-guide .spoken-card{margin:18px 0;padding:18px;border-left:4px solid #a68750;background:#f6f0e7;white-space:pre-wrap;overflow-wrap:anywhere;font-size:18px;line-height:1.85}.speaking-guide .spoken-card small{display:block;color:#876d42;font-size:13px;font-weight:600;margin-bottom:8px}.speaking-guide .spoken-question{background:#fff;border:1px solid #d7c8b0}.speaking-guide .spoken-buttons{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}.speaking-guide button{cursor:pointer;min-height:44px}.speaking-guide .spoken-helper{color:#776a58;font-size:14px}.speaking-guide progress{width:100%;accent-color:#a68750}.speaking-guide details{margin:14px 0}.speaking-guide details p{white-space:pre-wrap}</style>'+
 '<h2>跟着说 · 一步一步咨询</h2><p class="spoken-helper">只看当前一步：先照读，再问；听完顾客回答后接话，最后说转场句进入下一步。完整资料可以随时展开查阅。</p>'+
 (pairedTypes.includes(type)?'<label>这次咨询的双方<select data-speak-pair></select></label>':'')+
 (type==='year'?'<label>流年年度<input data-speak-year type="number" min="1900" max="2200" value="'+esc(year)+'"></label>':'')+
 '<div class="spoken-buttons"><button class="btn" type="button" data-speak-mode>查看完整资料</button></div><div data-speak-body></div><p data-speak-status role="status" aria-live="polite"></p>';
 panel.prepend(root);panel.classList.add('speaking-active');const workspace=doc.querySelector('#app');workspace?.classList.add('speaking-focus');
 const $=s=>root.querySelector(s),status=$('[data-speak-status]');let session,state,key,a,b,selectedYear=year;
 function persist(){try{localStorage.setItem(key,JSON.stringify(state));}catch{status.textContent='当前浏览器无法保存进度，本次仍可继续咨询。';}}
 function currentRecord(){return state.records[session.steps[state.index].id]||{};}
 function render(){
  const step=session.steps[state.index],record=currentRecord();
  const say=step.id==='close'?speakingSummary(state.records)+'\n'+step.say:step.say;
  $('[data-speak-body]').innerHTML='<p><b>'+esc(session.title)+' · 第'+(state.index+1)+' / '+session.steps.length+'步</b></p><progress max="'+session.steps.length+'" value="'+(state.index+1)+'"></progress><h3>'+esc(step.title)+'</h3>'+
  '<div class="spoken-card"><small>① 现在照着说</small>'+esc(say)+'</div><div class="spoken-card spoken-question"><small>② 说完问顾客，然后停下来听</small>'+esc(step.question)+'</div>'+
  (pairedTypes.includes(type)?'<label>这一步是谁回答<select data-speak-respondent>'+[a.name,b.name,'双方分别回答'].map(n=>'<option value="'+esc(n)+'" '+(n===record.respondent?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label>':'')+
  '<label>顾客原话（可记录，按当前步骤保存）<textarea data-speak-answer maxlength="1500" rows="3" placeholder="例如：顾客认同的部分、真实例子；没有或不确定也可以记录。">'+esc(record.answer||'')+'</textarea></label><button type="button" class="btn" data-speak-reply>顾客回答后，我怎么接</button><div data-speak-output>'+ (record.reply?'<div class="spoken-card"><small>③ 核对意思后接话</small>'+esc(record.reply)+'</div>':'')+'</div>'+
  '<details><summary>这一层没问清楚时，怎样继续？</summary><p>顾客认同：请他给最近一个例子，再问当时的需要。\n顾客不认同：这一条先放下，回到真实经历。\n顾客不确定：缩小到最近一次；暂时没有例子可以略过，不必硬找。</p></details><div class="spoken-card"><small>④ 这一层谈完，转到下一步</small>'+esc(step.transition)+'</div>'+
  '<div class="spoken-buttons"><button class="btn" type="button" data-speak-prev '+(state.index===0?'disabled':'')+'>上一步</button><button class="btn btn-primary" type="button" data-speak-next '+(state.index===session.steps.length-1?'disabled':'')+'>下一步</button><button class="btn" type="button" data-speak-copy>复制这一步话术</button></div>'+
  '<label>直接跳到某一步<select data-speak-jump>'+session.steps.map((s,i)=>'<option value="'+i+'" '+(i===state.index?'selected':'')+'>'+(i+1)+' · '+esc(s.title)+'</option>').join('')+'</select></label>'+
  (state.index===session.steps.length-1?'<button class="btn btn-primary" type="button" data-speak-report>咨询结束，去预览顾客报告</button><p class="spoken-helper">报告内容仍由你检查和修改，不会自动发送给顾客。</p>':'');
 }
 function load(){
  const pairs=getPairs(type),pair=pairedTypes.includes(type)?pairs[Number($('[data-speak-pair]')?.value||0)]:null;
  a=pair?.a||customer;b=pair?.b||{};
  try{if(pairedTypes.includes(type)&&!pair)throw new Error('请先到完整资料保存双方姓名与生日，再开始这条咨询。');session=buildSpeakingSteps({type,customer:a,other:b,year:selectedYear,child});}
  catch(error){$('[data-speak-body]').textContent=error.message;session=null;return;}
  key=speakingSessionKey(customer.id,type,a,b,selectedYear);try{state=JSON.parse(localStorage.getItem(key)||'{}');}catch{state={};}
  if(!state||typeof state!=='object'||Array.isArray(state))state={};
  state.records=state.records&&typeof state.records==='object'?state.records:{};
  state.index=Number.isInteger(state.index)?Math.max(0,Math.min(session.steps.length-1,state.index)):0;render();
 }
 if($('[data-speak-pair]'))$('[data-speak-pair]').innerHTML=getPairs(type).map((pair,i)=>'<option value="'+i+'">'+esc(pair.label)+'</option>').join('');
 load();
 function saveAnswer(){const step=session.steps[state.index],old=currentRecord();state.records[step.id]={...old,answer:$('[data-speak-answer]').value,respondent:$('[data-speak-respondent]')?.value||a.name};persist();}
 root.addEventListener('input',event=>{
  if(!session||!event.target.matches('[data-speak-answer]'))return;
  saveAnswer();delete state.records[session.steps[state.index].id].reply;persist();$('[data-speak-output]').replaceChildren();status.textContent='已保存顾客原话；修改后请重新生成接话。';
 });
 root.addEventListener('change',event=>{
  if(event.target.matches('[data-speak-pair],[data-speak-year]')){
   selectedYear=Number($('[data-speak-year]')?.value)||year;load();status.textContent='已切换，显示这位顾客／双方／年度自己的进度。';
   const selector=panel.querySelector(event.target.matches('[data-speak-pair]')?'[data-report-pair]':'[data-report-year]');
   if(selector){selector.value=event.target.value;selector.dispatchEvent(new Event('change',{bubbles:true}));}return;
  }
  if(!session)return;
  if(event.target.matches('[data-speak-respondent]')){saveAnswer();delete state.records[session.steps[state.index].id].reply;persist();$('[data-speak-output]').replaceChildren();}
  if(event.target.matches('[data-speak-jump]')){saveAnswer();state.index=Number(event.target.value);persist();render();}
 });
 root.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.matches('[data-speak-mode]')){const hidden=panel.classList.toggle('speaking-active');workspace?.classList.toggle('speaking-focus',hidden);button.textContent=hidden?'查看完整资料':'收起资料，继续跟着说';return;}
  if(!session)return;
  if(button.matches('[data-speak-prev],[data-speak-next]')){saveAnswer();state.index+=button.matches('[data-speak-next]')?1:-1;state.index=Math.max(0,Math.min(session.steps.length-1,state.index));persist();render();root.scrollIntoView({behavior:'smooth',block:'start'});status.textContent='';}
  if(button.matches('[data-speak-reply]')){saveAnswer();const record=currentRecord();record.reply=speakingReply({type,step:session.steps[state.index],answer:record.answer,customer:a,other:b,respondent:record.respondent});persist();render();status.textContent='请先核对顾客意思，再照读回应。';}
  if(button.matches('[data-speak-copy]')){const step=session.steps[state.index],say=step.id==='close'?speakingSummary(state.records)+'\n'+step.say:step.say;try{await navigator.clipboard.writeText(say+'\n\n'+step.question+'\n\n'+(currentRecord().reply||'')+'\n\n'+step.transition);status.textContent='这一步话术已复制。';}catch{status.textContent='当前浏览器无法自动复制，可长按上方话术复制。';}}
  if(button.matches('[data-speak-report]')){panel.classList.remove('speaking-active');workspace?.classList.remove('speaking-focus');$('[data-speak-mode]').textContent='收起资料，继续跟着说';const report=panel.querySelector('.customer-report-tool');if(report){report.open=true;report.scrollIntoView({behavior:'smooth',block:'start'});}else status.textContent='请在蓝图页面的生成顾客报告图入口预览报告。';}
 });
}
