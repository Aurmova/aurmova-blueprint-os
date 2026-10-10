// Isolated STAGING-only, owner-side blueprint review.
// Calculation delegates to the same established engine used by AURMOVA Blueprint OS.
// This module is not a customer-facing API and does not write to D1.
import {
  calculateBlueprint, calculateGoldenYearSnapshot,
  calculateExpressionNumber, activeFlowYear, flowYearRange,
  ageFromBirthday, phaseForAge
} from "../../../src/engine/blueprint.js";
import { PERSONALITY_LIBRARY } from "../../../src/personality-library.js";

export const FIVE_BLUEPRINTS = Object.freeze([
  "人生蓝图解析", "黄金流年蓝图解析", "关系蓝图解析",
  "亲子蓝图解析", "合作蓝图解析"
]);
const PAIRED = new Set(FIVE_BLUEPRINTS.slice(2));
const LABELS = ["因果", "过程一", "过程二", "结果"];
const GROUPS = {
  "21–40": ["IJM", "IMS", "JMT", "STU"],
  "41–60": ["MNO", "MOQ", "NOP", "PQR"],
  "61+": ["KLN", "KNV", "LNW", "VWX"]
};
const PERSON_ROLE = { "关系蓝图解析": "双方相处", "亲子蓝图解析": "家庭互动", "合作蓝图解析": "合作分工" };

function codes(group) { return group ? group.join("") : "—"; }
function dateAge(birthday) { return ageFromBirthday(birthday, new Date()); }
function expressionSource(person, profile = null) {
  // Server-side Chinese pinyin conversion is not yet available; never derive a number
  // by dropping Han characters or substituting a different person's name.
  const input = (profile?.officialName || person.calculationName || person.name || "").trim();
  const converted = calculateExpressionNumber(input);
  return {
    number: converted.valid ? converted.reduced : null,
    path: converted.valid ? converted.compound : "",
    source: converted.valid ? input : "",
    warning: converted.valid ? "" : "姓名含中文或尚无有效英文／拼音来源；姓名数字暂不计算，避免错误结果。"
  };
}
function personPreview(input, isOwner) {
  const b = calculateBlueprint(input.birthday);
  if (!b) throw new Error("生日资料无法计算，请先检查档案");
  const profile = PERSONALITY_LIBRARY[b.mainPersonality] || {};
  const age = dateAge(input.birthday);
  const activePhase = age === null || age < 21 ? null : phaseForAge(age);
  return {
    name: input.name, gender: input.gender, birthday: input.birthday,
    role: isOwner ? "主要顾客" : (input.role || "共同分析成员"),
    age, main: b.mainPersonality, mainTitle: profile.title || "",
    seatCode: b.seatCode, innerCode: b.innerCode,
    fatherCode: b.fatherCode, motherCode: b.motherCode,
    phase: activePhase,
    phaseCodes: activePhase ? GROUPS[activePhase].map((key, i) => ({
      position: key, role: LABELS[i], code: codes(Object.values(b.phases[activePhase])[i])
    })) : [],
    innerMissing: b.innerEnergy.missing, innerRepeated: b.innerEnergy.repeated,
    positive: (profile.positive || []).slice(0, 3),
    growth: (profile.growth || []).slice(0, 3),
    expression: expressionSource(input, isOwner ? input : null)
  };
}
function row(label, value) { return { label, value: String(value ?? "—") }; }
function section(title, rows) { return { title, rows }; }
function aboutPerson(person) {
  return [
    row("人物", person.name + " · " + person.gender + " · " + person.birthday),
    row("主性格", person.main + "（" + person.mainTitle + "）"),
    row("坐镇码（后台）", person.seatCode),
    row("内心码（后台）", person.innerCode)
  ];
}
function formatPhase(person) {
  return person.phaseCodes.map(code => row(code.role + " · " + code.position, code.code));
}
function phrase(person, key) { return person[key][0] || "待结合实际情况核对"; }
function ask(text) { return text; }

export function buildPrivateBlueprintPreview(customer, project, requestedYear) {
  if (!customer || !customer.id) throw new Error("顾客资料不可用");
  if (!FIVE_BLUEPRINTS.includes(project)) throw new Error("请选择有效的五大蓝图项目");
  const y = requestedYear === undefined || requestedYear === null || requestedYear === ""
    ? activeFlowYear()
    : Number(requestedYear);
  if (!Number.isInteger(y) || y < 2000 || y > 2099) throw new Error("请选择有效的流年年份");
  const owner = personPreview(customer, true);
  const members = Array.isArray(customer.members) ? customer.members : [];
  const people = [owner, ...members.map(member => personPreview(member, false))];
  const sections = [];
  const questions = [];
  const annotations = [];
  let completeness = "已接入出生盘的确定性计算；深入联合码语义、儿童专用完整话术、全部姓名拼音换算与正式顾客报告仍待专项审核。";
  if (project === "人生蓝图解析") {
    sections.push(section("个人核心数字", [
      ...aboutPerson(owner),
      row("父亲基因（后台）", owner.fatherCode),
      row("母亲基因（后台）", owner.motherCode),
      row("盘内较少出现", owner.innerMissing.join("、") || "无"),
      row("盘内重复数字", owner.innerRepeated.join("、") || "无"),
      row("姓名表现数字", owner.expression.number ?? "暂不能安全计算")
    ]));
    if (owner.phase) sections.push(section("当前年龄阶段 · " + owner.phase, formatPhase(owner)));
    questions.push(ask("你的日常决定、关系沟通、工作表现，哪一项与你最有共鸣？我们先用具体例子验证。"));
    questions.push(ask("你觉得自己做得最顺的一件事是什么？背后是怎样的做事方式？"));
    if (owner.expression.warning) annotations.push(owner.expression.warning);
  } else if (project === "黄金流年蓝图解析") {
    const snaps = [y - 1, y, y + 1].map(yr => calculateGoldenYearSnapshot(customer.birthday, yr));
    const snapshot = snaps[1];
    sections.push(section("黄金流年 · 三年对照", snaps.map((v, i) =>
      row(["上一年", "目标年", "下一年"][i] + " · " + v.year, "年盘 O 位 " + v.personal.number + " · " + v.personal.title)
    )));
    sections.push(section(y + " 年个人年盘（MNO → MOQ／NOP → PQR）",
      Object.entries(snapshot.personalAxis.groups).map(([key, arr], i) => row(LABELS[i] + " · " + key, codes(arr)))));
    sections.push(section(y + " 年环境年盘（KLN → KNV／LNW → VWX）",
      Object.entries(snapshot.environmentAxis.groups).map(([key, arr], i) => row(LABELS[i] + " · " + key, codes(arr)))));
    const positions = snapshot.yearPositions;
    const six = ["M", "N", "O", "P", "Q", "R"].map(key => positions[key]);
    const tally = Object.fromEntries([...new Set(six)].sort().map(number => [number, six.filter(x => x === number).length]));
    sections.push(section("年份核对", [
      row("流年起讫", flowYearRange(y).start + " 至 " + flowYearRange(y).end),
      row("M、N、O、P、Q、R", six.join(" · ")),
      row("重复次数", Object.entries(tally).map(([n, c]) => n + "×" + c).join("、")),
      row("个人流年主题", snapshot.personal.summary),
    ]));
    questions.push(ask("这一段流年你最想验证的真实议题，是工作、关系还是家庭？"));
    questions.push(ask("先回顾上一年发生过的具体变化，再判断目标年应该如何调整行动。"));
  } else {
    if (!members.length) {
      completeness = "此项目需要至少一位共同分析成员。请先在档案编辑处添加姓名、性别、生日。";
      sections.push(section("等待成员资料", [row("项目", project), row("状态", "尚未添加共同分析成员")]));
    } else {
      sections.push(section("双方／成员联合对照", people.flatMap(person => [
        row(person.name + " · " + person.role, "主性格 " + person.main + "；内心码 " + person.innerCode + "；坐镇码 " + person.seatCode)
      ])));
      for (const other of people.slice(1)) {
        if (project === "关系蓝图解析") {
          sections.push(section(owner.name + " × " + other.name + " · " + PERSON_ROLE[project], [
            row("表达／沟通视角（待核对）", owner.name + "：" + phrase(owner, "positive") + "；" + other.name + "：" + phrase(other, "positive")),
            row("相处练习方向", owner.name + "：" + phrase(owner, "growth") + "；" + other.name + "：" + phrase(other, "growth"))
          ]));
          questions.push(ask("当你们意见不同时，通常是谁先表达、谁先听？谁更需要先被理解？请两位各举一个生活例子。"));
          questions.push(ask("你们希望对方怎样提出建议，才不会感觉被控制或被忽略？"));
        } else if (project === "亲子蓝图解析") {
          sections.push(section(owner.name + " 与 " + other.name + " · " + PERSON_ROLE[project], [
            row("家长观察方向（待核对）", "从家庭／学习／社交三个场景观察，不把数字当作儿童的固定性格"),
            row("成员数字与成长建议", other.name + "：主性格 " + other.main + "；可尝试：" + phrase(other, "growth"))
          ]));
          questions.push(ask("孩子遇到不想做的事时，通常怎样表达？家长会怎样回应？"));
          questions.push(ask("在学校、家庭、朋友相处三个场景里，孩子最近最需要支持的是哪一个？"));
        } else {
          sections.push(section(owner.name + " × " + other.name + " · " + PERSON_ROLE[project], [
            row("优势讨论（待核对）", owner.name + "：" + phrase(owner, "positive") + "；" + other.name + "：" + phrase(other, "positive")),
            row("职责与协作", "先根据实际技能、经验、时间与财务条件分工，不按数字直接判定赚钱能力")
          ]));
          questions.push(ask("你们各自最擅长什么工作？谁负责决定、执行、对账、客户沟通？"));
          questions.push(ask("遇到意见不合或资金风险时，你们事先约定了怎样的处理方式？"));
        }
      }
      if (people.some(p => p.expression.warning)) annotations.push("部分姓名含中文，云端拼音换算尚未完成；请勿把缺失姓名数字视为最终解析。");
    }
  }
  return {
    version: "staging-blueprint-review-v1",
    stage: "STAGING_ONLY",
    ownerOnly: true,
    project, targetYear: y,
    customerId: customer.id, customerUpdatedAt: customer.updatedAt,
    heading: "AURMOVA · " + project,
    people, sections, questions, annotations, completeness,
    disclaimer: "本页属于数字学课程框架下的管理员内部咨询草稿，必须结合当事人的事实核对；不得用于诊断、断言关系结果、预测财富或决定儿童潜能。",
    clientReportAvailable: false
  };
}
