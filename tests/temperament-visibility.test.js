import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { calculateTemperamentNumber } from "../src/engine/blueprint.js";
import { TEMPERAMENT_NUMBER_LIBRARY } from "../src/consultation-library.js";

test("四体次数沿用姓名字母计数规则，不进行个位化简", () => {
  const result = calculateTemperamentNumber("CHEN ROU BING");
  assert.equal(result.valid, true);
  assert.deepEqual(result.counts, { mind: 1, body: 3, emotion: 4, intuition: 3 });
  assert.equal(result.totalLetters, 11);
  assert.equal(result.sumCheck, true);
});

test("四体1–9咨询资料均包含白话、优势、盲点与验证问题", () => {
  for (const plane of ["mind", "body", "emotion", "intuition"]) {
    for (let number = 1; number <= 9; number++) {
      const entry = TEMPERAMENT_NUMBER_LIBRARY[plane]?.[number];
      assert.ok(entry, `Missing ${plane} ${number}`);
      for (const field of ["core", "mature", "watch", "talk", "question"]) {
        assert.ok(entry[field], `Missing ${plane} ${number}.${field}`);
      }
    }
  }
});

test("隐藏旧主性格区块时不隐藏四体详细解读卡片", () => {
  const source = readFileSync(new URL("../src/v6-enhancements.js", import.meta.url), "utf8");
  assert.match(source, /'<div class="reading-grid">'+blocks+'<\/div>'/);
  assert.doesNotMatch(source, /document\.querySelector\("\.reading-grid"\)\?\.style\.setProperty\("display","none"\)/);

  const hideLegacyOnly = source.match(/document\.querySelector\("#app > \.reading-grid"\)\?\.style\.setProperty\("display","none"\);/)?.[0];
  assert.ok(hideLegacyOnly, "Legacy-only CSS selector was not found");

  const legacy = { display: null };
  const temperament = { display: null };
  const fakeDocument = {
    querySelector(selector) {
      if (selector === "#app > .reading-grid") {
        return { style: { setProperty(prop, value) { if (prop === "display") legacy.display = value; } } };
      }
      if (selector === ".reading-grid") {
        return { style: { setProperty(prop, value) { if (prop === "display") temperament.display = value; } } };
      }
      return null;
    }
  };
  runInNewContext(hideLegacyOnly, { document: fakeDocument });
  assert.equal(legacy.display, "none");
  assert.equal(temperament.display, null);
});
