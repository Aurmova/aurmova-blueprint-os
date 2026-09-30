import test from "node:test";
import assert from "node:assert/strict";
import { createCustomer, validateCustomer, toCustomerReport, INTERNAL_TERMS } from "../src/data.js";

const valid = { name: " Josephine ", gender: "女性", day: "3", month: "9", year: "1990", consultationType: "人生藍圖解析" };
test("建立資料時固定生日格式為日 / 月 / 年", () => assert.equal(createCustomer(valid).birthday, "03/09/1990"));
test("拒絕不存在的日期", () => assert.equal(validateCustomer({...valid, day:"31", month:"2"}), "請輸入有效的生日日期"));
test("顧客簡版報告不洩漏內部欄位", () => {
 const customer={...createCustomer(valid), internalAnalysis:{missingNumbers:[1,2]}, jointCode:"secret"};
 const report=toCustomerReport(customer); assert.equal(report.internalAnalysis, undefined); assert.equal(report.jointCode, undefined);
 for (const term of INTERNAL_TERMS) assert.equal(JSON.stringify(report).includes(term), false);
});
