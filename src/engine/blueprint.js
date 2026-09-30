const reduce = n => { let v=Math.abs(Number(n)||0); while(v>9) v=String(v).split("").reduce((a,b)=>a+Number(b),0); return v; };
const add=(...n)=>reduce(n.reduce((a,b)=>a+Number(b||0),0));
export const innerCode = main => reduce(Number(main)*2);
export function calculateBlueprint(birthday){
 const [dd,mm,yyyy]=birthday.split("/").map(Number);
 const ds=String(dd).padStart(2,"0").split("").map(Number), ms=String(mm).padStart(2,"0").split("").map(Number);
 let ys=String(yyyy).padStart(4,"0").split("").map(Number);
 // AURMOVA fixed rule supplied by Josephine: for year 2000, the final 00 pair reduces to 5.
 if(yyyy===2000) ys=[2,0,0,5];
 const [A,B]=ds,[C,D]=ms,[E,F,G,H]=ys;
 const I=add(A,B),J=add(C,D),K=add(E,F),L=add(G,H),M=add(I,J),N=add(K,L),O=add(M,N);
 const S=add(I,M),T=add(J,M),U=add(S,T),P=add(N,O),Q=add(M,O),R=add(P,Q),V=add(K,N),W=add(L,N),X=add(V,W);
 return {positions:{A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,S,T,U,P,Q,R,V,W,X},mainPersonality:O,seatCode:[M,N,O].join(""),innerCode:innerCode(O),
  fatherGenes:{I,J,M},motherGenes:{K,L,N},
  phases:{"21–40":{cause:[I,J,M],process1:[I,M,S],process2:[J,M,T],result:[S,T,U]},"41–60":{cause:[M,N,O],process1:[M,O,Q],process2:[N,O,P],result:[P,Q,R]},"61+":{cause:[K,L,M],process1:[K,L,N],process2:[L,M,N],result:[V,W,X]}}};
}
export function phaseForAge(age){return age>=61?"61+":age>=41?"41–60":"21–40";}
export function ageFromBirthday(birthday,now=new Date()){const[d,m,y]=birthday.split("/").map(Number);let a=now.getFullYear()-y;if(now.getMonth()+1<m||(now.getMonth()+1===m&&now.getDate()<d))a--;return a;}