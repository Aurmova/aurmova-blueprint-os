import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBlueprint,
  calculateGoldenYearSnapshot,
  calculateGoldenYearBlueprint,
  activeFlowYear,
  flowYearRange,
  calculateYearCycleSet
} from '../src/engine/blueprint.js';

// Synthetic consultation fixtures only. No real D1, network, or customer records.
test('11/11/1998 life triangle uses the official positional algorithm', () => {
  const b = calculateBlueprint('11/11/1998');
  assert.equal(b.seatCode, '494');
  assert.equal(b.mainPersonality, 4);
  assert.equal(b.innerCode, 8);
  assert.equal(b.startingThoughtCode, 2);
  assert.deepEqual(b.phases['21–40'], {
    cause:[2,2,4], process1:[2,4,6], process2:[2,4,6], result:[6,6,3]
  });
});

test('golden year snapshot is consistent with its year triangle for 2025–2027', () => {
  for (const [year, number, code] of [[2025,4,'494'],[2026,5,'415'],[2027,6,'426']]) {
    const triangle = calculateGoldenYearBlueprint('11/11/1998', year);
    const snapshot = calculateGoldenYearSnapshot('11/11/1998', year);
    assert.equal(triangle.mainYearCode, number);
    assert.equal(snapshot.personal.number, number);
    assert.equal(snapshot.personalAxis.baseCode, code);
    assert.equal(snapshot.personalAxis.baseCode, triangle.personalAxis.groups.MNO.join(''));
  }
});

test('October 1 changes the active flow year, September 30 does not', () => {
  assert.equal(activeFlowYear(new Date(2026,8,30,12)), 2026);
  assert.equal(activeFlowYear(new Date(2026,9,1,12)), 2027);
  assert.deepEqual(flowYearRange(2027), {start:'2026-10-01',end:'2027-09-30'});
});

test('year cycle helper and golden snapshot agree for synthetic consultation', () => {
  const cycle = calculateYearCycleSet('11/11/1998', 2027);
  for (const [year, entry] of [[2026,cycle.previous],[2027,cycle.current],[2028,cycle.next]]) {
    assert.equal(entry.number,calculateGoldenYearSnapshot('11/11/1998',year).personal.number);
  }
});

test('another synthetic birthday keeps personal year equal to golden triangle O', () => {
  for (const year of [2025,2026,2027,2028]) {
    const golden=calculateGoldenYearBlueprint('05/11/1998',year);
    const snapshot=calculateGoldenYearSnapshot('05/11/1998',year);
    assert.equal(snapshot.personal.number,golden.positions.O);
  }
});
