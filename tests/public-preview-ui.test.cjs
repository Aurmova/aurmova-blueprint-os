// AURMOVA safe public preview UI regression tests. Run: node --test tests/public-preview-ui.test.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const dir=path.resolve(__dirname,'../public-preview');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const code=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const headers=fs.readFileSync(path.join(dir,'_headers'),'utf8');

class FakeElement {
 constructor(){
  this.textContent='';this.value='';this.disabled=false;this.hidden=false;this.children=[];
  this.listeners={};this.style={};this.className='';this.classList={toggle(){},add(){},remove(){}};
 }
 appendChild(n){this.children.push(n);}
 replaceChildren(){this.children=[];}
 addEventListener(t,fn){this.listeners[t]=fn;}
 setAttribute(k,v){this[k]=v;}
 click(){this.listeners.click?.();}
}

function boot(){
 const elements={};
 const document={
  body:new FakeElement(),
  getElementById(id){return elements[id]??=new FakeElement();},
  createElement(){return new FakeElement();}
 };
 vm.runInNewContext(code,{document,window:{scrollTo(){}},navigator:{clipboard:{writeText:async()=>{}}}});
 return elements;
}

test('safe preview has no external data request or browser storage',()=>{
 assert.doesNotMatch(code,/\bfetch\s*\(|\bXMLHttpRequest\b|\blocalStorage\b|\bsessionStorage\b/);
 assert.doesNotMatch(html,/<script(?![^>]*src)/);
 assert.match(headers,/Content-Security-Policy:/);
 assert.match(headers,/connect-src 'none'/);
 assert.match(html,/没有储存真实顾客回答/);
});

test('all 11 stages render and navigation works',()=>{
 const e=boot();
 assert.match(e['stage-name'].textContent,/01｜主性格/);
 assert.equal(e.choices.children.length,4);
 assert.equal(e.prev.disabled,true);
 e.next.click();
 assert.match(e['stage-name'].textContent,/02｜主性格/);
 e.jump.listeners.change({target:{value:'10'}});
 assert.match(e['stage-name'].textContent,/11｜人生总结/);
 assert.equal(e.next.disabled,true);
});

test('different answer types produce different stage-specific replies',()=>{
 const e=boot();
 e.choices.children[0].click();
 const yes=e['reply-text'].textContent;
 e.choices.children[1].click();
 const partial=e['reply-text'].textContent;
 e.choices.children[2].click();
 const no=e['reply-text'].textContent;
 e.choices.children[3].click();
 const unsure=e['reply-text'].textContent;
 assert.equal(new Set([yes,partial,no,unsure]).size,4);
 e.next.click();
 e.choices.children[2].click();
 assert.notEqual(no,e['reply-text'].textContent);
});

test('moving between steps preserves simulated choices and final summary',()=>{
 const e=boot();
 e.choices.children[0].click();
 e.next.click();
 e.choices.children[2].click();
 e.prev.click();
 assert.equal(e.choices.children[0]['aria-pressed'],'true');
 e.jump.listeners.change({target:{value:'10'}});
 assert.equal(e.summary.hidden,false);
 assert.match(e['summary-text'].textContent,/主性格与最自然的自己/);
 assert.match(e['summary-text'].textContent,/主性格 × 起始数/);
});
