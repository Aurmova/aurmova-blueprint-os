import {calculateBlueprint,ageFromBirthday} from './engine/blueprint.js?v=54';
import {MAIN_DETAIL,DIGIT_CORE} from './floot-knowledge.js?v=28';
const labels=['主性格','主性格 × 起始数','内心码','三角形内的优势与需要留意的地方','思考模式','面对压力','沟通方式'];
function describePerson(person,child){
 const chart=calculateBlueprint(person.birthday);
 if(!chart)throw new Error('请先核对生日资料。');
 const main=chart.mainPersonality,start=chart.startingThoughtCode,inner=chart.innerCode;
 const m=MAIN_DETAIL[main]||{},s=DIGIT_CORE[start]||{},i=DIGIT_CORE[inner]||{};
 const counts=chart.innerEnergy.counts;
 const prominent=Object.entries(counts).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]||Number(a[0])-Number(b[0])).slice(0,3);
 const strengths=prominent.map(([n])=>n+'的「'+DIGIT_CORE[n].gift+'」').join('；');
 const watches=prominent.map(([n])=>n+'的「'+(child&&Number(n)===6?'担心做得不够好':DIGIT_CORE[n].shadow)+'」').join('；');
 const meaning=[
  '主性格是'+main+'号。'+(child?'日常任务里，可以观察孩子怎样表现「'+DIGIT_CORE[main].gift+'」。':'可以先观察「'+m.title+'」这一层：'+m.behavior)+'这是一条待核对的线索，请用实际例子确认。',
  '主性格'+main+'号是较长期的底色，起始数'+start+'来自三角形的I位，指进入新事情时的起手方式。可以一起观察：平时有「'+DIGIT_CORE[main].core+'」的倾向，刚开始却可能先用「'+s.core+'」来应对。同向时容易加强，不同向时可能先这样开始，再转回自己的习惯。',
  '内心码是'+inner+'，这一层看的是里面希望得到什么：'+i.core+'。可以观察，当「'+i.gift+'」有发挥空间时，是否更容易投入；当需要没有被看见时，是否出现「'+(child&&inner===6?'担心做得不够好':i.shadow)+'」。外在表现和内在需要可以不同，要听本人怎么说。',
  '这里只读取三角形内的七个位置，先抓较常出现的三个方向。可以发挥的优势是：'+strengths+'。需要留意优势用过头的情况是：'+watches+'。重复只是观察重点，不代表一定有这些缺点；其他位置可按顾客的问题再展开。',
  (child?'可以观察孩子遇到任务时，是先尝试、先看示范，还是先问清楚。':'主性格这一层的思考观察是：'+m.thinking)+'再核对内心对「'+i.core+'」的需要，是否让实际决定的过程和表面看起来不同。',
  (child?'先看孩子在催促、转场或任务变难时怎样反应，不把一次哭闹或停下来定成性格。':'主性格的压力观察是：'+m.stress)+'内心层也可能在意「'+i.core+'」。先描述真实发生的行为，再找最早可以暂停、求助或换方法的一刻。',
  (child?'看大人一句话有多长、是否先示范、孩子有没有表达空间，再观察孩子怎样回应。':'主性格的沟通观察是：'+m.speech)+'同时核对内心希望的「'+i.core+'」有没有直接讲出来。交流时先说事实、感受和一个请求，再听对方是否理解。'
 ];
 return {person,child,chart,meaning};
}
export function buildOrderedFoundation({customer,other={},type='life',child=false}){
 const people=[describePerson(customer,child)];
 if(['relationship','family','cooperation'].includes(type))people.push(describePerson(other,type==='family'&&ageFromBirthday(other.birthday)<18));
 const namePrefix=people.length>1;
 const questions=[
  child||type==='family'?'最近哪件事能看出孩子这种做法？有没有不符合的部分？':'这个观察像不像？最近哪件事能说明，哪一部分不符合？',
  '刚进入新环境或碰到新事情时，第一步通常怎么做？熟悉以后有没有不同？',
  '哪一种支持或回应最让你／孩子安心？这个需要有没有直接说出来？',
  '刚才哪一项优势最常用？什么时候会用过头？请说一个真实例子。',
  '做一个重要决定时，先想什么、再想什么？工作、家庭或学习里有没有不同？',
  '最近一次有压力，最早的反应是什么？在哪一步还能够停下来或求助？',
  '最近一次没被理解时，第一句怎么说，对方怎样回应？你真正想表达的需要是什么？'
 ];
 const transitions=['我们先把主性格放在这里，接着看事情刚开始时怎么起手。','看完外面的起手方式，再看心里面真正希望得到什么。','内在需要确认后，再回到三角形内，看看哪些能力容易发挥、哪些容易用过头。','接着把这些观察放回真实生活，先看思考。','思考之后，再看有压力时会怎么应对。','压力这一层谈完，再看怎样把需要说出来。','基础顺序讲完了，其他位置只选与这次问题有关的继续说。'];
 const steps=labels.map((title,index)=>({id:['main','main-start','inner','triangle','thinking','pressure','communication'][index],title,say:people.map(p=>(namePrefix?p.person.name+'：\n':'')+p.meaning[index]).join('\n\n'),question:questions[index],transition:transitions[index],foundation:true}));
 const extra=(id,title,fn,question)=>({id,title,optional:true,say:people.map(p=>(namePrefix?p.person.name+'：\n':'')+fn(p)).join('\n\n'),question,transition:'这一层用真实例子核对即可，再顺着顾客最想解决的问题往下谈。'});
 const extras=[
  extra('subconscious','潜意识码 · 按问题选讲',p=>{const n=p.chart.subconsciousCode,d=DIGIT_CORE[n];return '潜意识码'+n+'，可以作为突发时自动反应的观察方向：「'+d.core+'」。回忆事情突然发生时的第一反应，再核对是否符合，不从这个数字推断过去发生过什么。';},'最近一次突发事情，你／孩子来不及想时先做了什么？'),
  extra('seat','坐镇码 · 因、过程、结果',p=>{const [a,b,c]=String(p.chart.seatCode).split('').map(Number);return '坐镇码'+p.chart.seatCode+'，按顺序看：从「'+DIGIT_CORE[a].core+'」出发，经过「'+DIGIT_CORE[b].core+'」的处理，再往「'+DIGIT_CORE[c].core+'」走。结果位与主性格'+p.chart.mainPersonality+'相同，把它当成一件事怎样推进的观察，不能当成事情必然的结果。';},'选一件最近的事：为什么开始，中间怎样处理，最后怎样收尾？'),
  extra('missing','缺失方向 · 需要练习的能力',p=>{const list=p.chart.innerEnergy.missing;return list.length?'三角形内未出现的方向是'+list.join('、')+'。缺失不表示没有能力；先选与眼前问题有关的一项，例如「'+DIGIT_CORE[list[0]].gift+'」，核对是否需要工具、提醒或练习。已经能做到的能力，也要如实记录。':'三角形内没有未出现的数字。这一层可以略过，继续谈与当前问题有关的部分。';},'刚才哪一种能力已经练出来，哪一项还需要支持？')
 ];
 return {steps,extras};
}
