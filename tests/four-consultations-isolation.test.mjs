import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBlueprint, calculateGoldenYearSnapshot, activeFlowYear, flowYearRange } from '../src/engine/blueprint.js';

// All birthdays below are synthetic fixtures. No production/customer data or network access.
const fixtures = ['11/11/1998', '05/11/1998', '05/11/1966', '16/03/1975'];

test('four independent consultation calculations are deterministic and isolated', () => {
  const first = fixtures.map(birthday => ({
    life: calculateBlueprint(birthday),
    flow: calculateGoldenYearSnapshot(birthday, 2027)
  }));
  const serialized = JSON.stringify(first);
  const second = fixtures.map(birthday => ({
    life: calculateBlueprint(birthday),
    flow: calculateGoldenYearSnapshot(birthday, 2027)
  }));
  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(first), serialized);
  for (let i = 0; i < fixtures.length; i++) {
    assert.equal(first[i].life.seatCode.length, 3);
    assert.equal(first[i].flow.personalAxis.baseCode.length, 3);
    assert.equal(first[i].flow.personal.number, first[i].flow.yearPositions.O);
  }
  assert.notStrictEqual(first[0].life, first[1].life);
  assert.notStrictEqual(first[0].flow, first[1].flow);
});

test('consultation flow-year boundary remains stable across 2026 rollover', () => {
  const before = new Date(2026, 8, 30, 23, 59, 59);
  const after = new Date(2026, 9, 1, 0, 0, 0);
  assert.equal(activeFlowYear(before), 2026);
  assert.equal(activeFlowYear(after), 2027);
  assert.deepEqual(flowYearRange(2027), {start:'2026-10-01',end:'2027-09-30'});
  for (const birthday of fixtures) {
    const beforeSnapshot = calculateGoldenYearSnapshot(birthday, activeFlowYear(before));
    const afterSnapshot = calculateGoldenYearSnapshot(birthday, activeFlowYear(after));
    assert.equal(beforeSnapshot.year, 2026);
    assert.equal(afterSnapshot.year, 2027);
  }
});
