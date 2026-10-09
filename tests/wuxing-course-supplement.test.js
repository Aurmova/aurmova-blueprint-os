import test from "node:test";
import assert from "node:assert/strict";
import { calculateGoldenYearSnapshot } from "../src/engine/blueprint.js";
import { calculateAnnualFiveElementDistribution } from "../src/five-elements.js";
import { analyzeAnnualFiveElements, renderAnnualFiveElementAnalysis } from "../src/five-elements-analysis.js";
import { WUXING_COURSE_SUPPLEMENT, buildWuxingCourseEntries, analyzeWuxingCourseRelations } from "../src/wuxing-course-supplement.js";

test("十张原书五行补充条目完整，且五位/六位来源差异透明",()=>{
 const s=WUXING_COURSE_SUPPLEMENT;
 assert.equal(buildWuxingCourseEntries().length,11);
 assert.ok(s.positionContrast.includes("M/N/O/P/Q五个"));
 assert.ok(s.positionContrast.includes("M/N/O/P/Q/R六个"));
 assert.ok(s.entry.includes("原书同时列0"));
 assert.deepEqual(s.elements.map(x=>x.digits),[[1,6],[2,7],[3,8],[4,9],[5]]);
 assert.equal(s.supports.map(x=>x.label).join("、"),"木生火、火生土、土生金、金生水、水生木");
 assert.equal(s.checks.map(x=>x.label).join("、"),"木克土、土克水、水克火、火克金、金克木");
});
test("五位书本案例与六位咨询法结果可不同，不能互换",()=>{
 const digits={M:2,N:6,O:4,P:2,Q:6,R:1};
 const r=calculateAnnualFiveElementDistribution({year:2027,yearPositions:digits});
 assert.equal(r.positionCount,6);
 assert.equal(r.rows.find(x=>x.label==="金").count,3);
 assert.equal(r.rows.find(x=>x.label==="水").count,2);
 assert.equal(r.rows.find(x=>x.label==="木").count,1);
 // Original five M/N/O/P/Q gives only two metal (6,6), one added R=1 makes three.
 assert.equal(["M","N","O","P","Q"].filter(k=>[1,6].includes(digits[k])).length,2);
});
test("生克关系仅使用本年实际出现的元素, 不予健康风险归因",()=>{
 const data=analyzeAnnualFiveElements(calculateGoldenYearSnapshot("18/08/1985",2027));
 const relations=analyzeWuxingCourseRelations(data);
 assert.deepEqual(relations.missing,["土"]);
 assert.ok(relations.focused.some(x=>x.label==="火"&&x.count===2&&x.repeatedDigits[0].digit===3));
 assert.ok(relations.supporting.includes("木生火"));
 assert.ok(relations.controlling.includes("水克火"));
 assert.equal(relations.healthRisk,null);
 assert.equal(relations.courseOnly,true);
 const html=renderAnnualFiveElementAnalysis(calculateGoldenYearSnapshot("18/08/1985",2027));
 assert.ok(html.includes("五行相生相克"));
 assert.ok(html.includes("方法差异"));
 assert.ok(html.includes("数字分布"));
 assert.ok(html.includes("不能"));
});
test("年份不同，五行补充用对应年份重算",()=>{
 const y26=analyzeAnnualFiveElements(calculateGoldenYearSnapshot("18/08/1985",2026));
 const y27=analyzeAnnualFiveElements(calculateGoldenYearSnapshot("18/08/1985",2027));
 assert.notDeepEqual(y26.points.map(x=>x.digit),y27.points.map(x=>x.digit));
 assert.notEqual(renderAnnualFiveElementAnalysis(calculateGoldenYearSnapshot("18/08/1985",2026)),
  renderAnnualFiveElementAnalysis(calculateGoldenYearSnapshot("18/08/1985",2027)));
});
