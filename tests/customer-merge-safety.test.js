import test from 'node:test';
import assert from 'node:assert/strict';
import { planCustomerMerge } from '../src/customer-merge.js';

const old = Object.freeze({ id: 'fake-001', name: '虚构甲', status: '已联系', notes: '原始笔记' });

test('dry-run never mutates original customer or incoming data', () => {
  const existing = [old];
  const incoming = [{ id: 'fake-002', name: '虚构乙' }];
  const original = JSON.stringify(existing);
  const proposed = JSON.stringify(incoming);
  const plan = planCustomerMerge(existing, incoming);
  assert.equal(JSON.stringify(existing), original);
  assert.equal(JSON.stringify(incoming), proposed);
  assert.deepEqual(plan.additions, incoming);
  assert.equal(plan.canAutoApply, true);
});

test('same ID with changed note blocks automatic application and preserves both variants', () => {
  const changed = { ...old, notes: '不同的虚构笔记' };
  const plan = planCustomerMerge([old], [changed]);
  assert.equal(plan.canAutoApply, false);
  assert.equal(plan.conflicts.length, 1);
  assert.deepEqual(plan.conflicts[0].existing, old);
  assert.deepEqual(plan.conflicts[0].incoming, changed);
  assert.equal(old.notes, '原始笔记');
});

test('identical record is duplicate, not a new customer', () => {
  const plan = planCustomerMerge([old], [{ ...old }]);
  assert.deepEqual(plan.duplicates, ['fake-001']);
  assert.equal(plan.additions.length, 0);
  assert.equal(plan.conflicts.length, 0);
});

test('invalid IDs and duplicate IDs fail closed without partial writes', () => {
  assert.throws(() => planCustomerMerge([{ name: '无编号' }], []), /missing ID/);
  assert.throws(() => planCustomerMerge([old, old], []), /Duplicate existing ID/);
  assert.throws(() => planCustomerMerge([], [{ id: 'fake-002' }, { id: 'fake-002' }]), /Duplicate incoming ID/);
  assert.throws(() => planCustomerMerge([], [{ id: ' ' }]), /missing ID/);
});
