import test from "node:test";
import assert from "node:assert/strict";
import { handlePrivateConsultationNotes } from "../src/private-consultation-notes.js";
import { LOGIN_HTML, LOGIN_CSS, LOGIN_SCRIPT } from "../src/owner-login-page.js";
import worker from "../src/index.js";

const apiOrigin="https://aurmova-secure-api-staging.xbing5668.workers.dev";
const customerId="a01234cd-5678-4123-8123-012345678abc";
const sample={
  id:customerId,name:"测试关系甲",gender:"女",birthday:"08/06/2000",
  consultationType:"关系蓝图解析",
  members:[{name:"测试成员乙",gender:"男",birthday:"16/09/1999",role:"伴侣"}]
};
function fakeDB(profile=sample) {
  const notes=[];
  const reads=[];
  const db={
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async first(){
              reads.push({sql,values});
              if(!sql.includes("private_customers"))throw Error("Unexpected first");
              return (values[0]===customerId && values[1]==="12345" && profile)
                ? {id:customerId,profile_json:JSON.stringify(profile)}
                : null;
            },
            async all(){
              if(!sql.includes("private_consultation_notes"))throw Error("Unexpected all");
              return {results:notes.filter(x=>x.owner_github_id===values[0]&&x.customer_id===values[1]).slice(0,values[2])};
            },
            async run(){
              if(!sql.startsWith("INSERT INTO private_consultation_notes"))throw Error("Unexpected SQL write");
              const keys=["id","owner_github_id","customer_id","project","step_id","selection_key","selection_label","answer_text","created_at"];
              notes.unshift(Object.fromEntries(keys.map((key,i)=>[key,values[i]])));
              return {meta:{changes:1}};
            }
          };
        }
      };
    }
  };
  return {db,notes,reads};
}
function envWrap(fixture){return { API_ORIGIN:apiOrigin,OWNER_GITHUB_USER_ID:"12345",DB:fixture.db };}
function request(method,body={},url=apiOrigin+"/private/consultations/"+customerId) {
  const options={method,headers:{Origin:apiOrigin,"Content-Type":"application/json"}};
  if(method==="POST") options.body=JSON.stringify(body);
  return new Request(url,options);
}
function makeBody(){
  return {project:"关系蓝图解析",stepId:"inner",selectionKey:"company",
    selectionLabel:"陪伴与回应",answerText:"仅模拟：我希望对方陪我听完。"};
}
const session={github_user_id:"12345",github_login:"Aurmova"};
const send=(body,status=200)=>({body,status});
async function exec({fixture=fakeDB(),body=makeBody(),owner=session,method="POST",url}={}) {
  const env=envWrap(fixture),req=request(method,body,url);
  return handlePrivateConsultationNotes(req,env,owner,new URL(req.url).pathname,send);
}
test("explicit POST writes a note without changing original customer profile",async()=>{
  const fixture=fakeDB(), before=JSON.stringify(sample);
  const result=await exec({fixture});
  assert.equal(result.status,201);
  assert.equal(result.body.note.stepId,"inner");
  assert.equal(result.body.note.selectionLabel,"陪伴与回应");
  assert.equal(fixture.notes.length,1);
  assert.equal(fixture.notes[0].customer_id,customerId);
  assert.equal(fixture.notes[0].owner_github_id,"12345");
  assert.equal(JSON.stringify(sample),before);
  assert.equal(fixture.reads.length,1);
});

test("GET reads saved notes by authenticated owner AND selected customer only",async()=>{
  const fixture=fakeDB();
  await exec({fixture});
  const read=await exec({fixture,method:"GET"});
  assert.equal(read.status,200);
  assert.equal(read.body.notes.length,1);
  assert.equal(read.body.notes[0].answerText,makeBody().answerText);
  assert.equal(read.body.notes[0].project,"关系蓝图解析");
  assert.deepEqual(fixture.reads[1].values,[customerId,"12345"]);
});

test("only Staging host and matching GitHub owner may ever access records",async()=>{
  const fixture=fakeDB();
  assert.equal((await exec({fixture,owner:{github_user_id:"999"}})).status,401);
  assert.equal((await exec({fixture,url:"https://aurmova-secure-api.xbing5668.workers.dev/private/consultations/"+customerId})).status,403);
  assert.equal((await exec({fixture,url:apiOrigin+"/private/consultations/invalid"})).status,404);
  assert.equal((await exec({fixture:fakeDB()})).status,201);
  assert.equal(fixture.notes.length,0); 
});

test("cross-customer request must not reveal another customer's notes",async()=>{
  const fixture=fakeDB();
  const otherId="b01234cd-5678-4123-8123-012345678abc";
  const result=await exec({fixture,url:apiOrigin+"/private/consultations/"+otherId});
  assert.equal(result.status,404);
  assert.equal(fixture.notes.length,0);
});

test("input validation blocks malformed or empty notes and unsupported projects",async()=>{
  const invalid=[
    {...makeBody(),project:"人生蓝图解析"},
    {...makeBody(),stepId:"__proto__"},
    {...makeBody(),selectionKey:"<img src=x>"},
    {...makeBody(),selectionKey:"",selectionLabel:"",answerText:""},
    {...makeBody(),answerText:"x".repeat(2001)},
    {...makeBody(),answerText:42},
    {project:"关系蓝图解析",stepId:"seat",selectionKey:"ok",selectionLabel:"",answerText:"demo"}
  ];
  for(const body of invalid) {
    const fixture=fakeDB();
    const result=await exec({fixture,body});
    assert.equal(result.status,400,JSON.stringify(body).slice(0,75));
    assert.equal(fixture.notes.length,0);
  }
});

test("missing paired member prevents saving a relationship consultation note",async()=>{
  const fixture=fakeDB({...sample,members:[]});
  assert.equal((await exec({fixture})).status,400);
  assert.equal(fixture.notes.length,0);
});

test("unauthenticated requests do not reach note storage",async()=>{
  const requestObj=request("POST",makeBody());
  const res=await worker.fetch(requestObj,{
    API_ORIGIN:apiOrigin,
    OWNER_GITHUB_USER_ID:"12345",
    DB:{},GITHUB_CLIENT_ID:"dummy",GITHUB_CLIENT_SECRET:"dummy",
    FRONTEND_LOGIN_URL:apiOrigin+"/owner-login"
  });
  assert.equal(res.status,401);
  assert.equal((await res.json()).error,"Authentication required");
});

test("V3 reader requires an explicit save with fake-data confirmation",()=>{
  assert.match(LOGIN_HTML,/id="private-analysis-panel"[^>]*hidden/);
  assert.match(LOGIN_SCRIPT,/保存本段测试记录/);
  assert.match(LOGIN_SCRIPT,/fakeConfirmed.checked/);
  assert.match(LOGIN_SCRIPT,/recordButton.addEventListener\("click"/);
  assert.match(LOGIN_SCRIPT,/method:"POST"/);
  assert.match(LOGIN_SCRIPT,/loadRecordHistory/);
  assert.match(LOGIN_SCRIPT,/notes? in|private\/consultations\//);
  assert.doesNotMatch(LOGIN_SCRIPT,/chosen\[step.id\][\s\S]{0,80}save/i);
  assert.match(LOGIN_CSS,/v3-record/);
  assert.doesNotThrow(()=>new Function(LOGIN_SCRIPT));
});
