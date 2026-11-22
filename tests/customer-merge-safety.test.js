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

test('equivalent nested objects with different property insertion order are duplicates', () => {
  const existing = [{id:'fake-100', name:'虚构甲', notes:[{at:'2026-01-01', text:'原始记录'}], details:{phone:'000', status:'待联系'}}];
  const incoming = [{details:{status:'待联系',phone:'000'}, notes:[{text:'原始记录',at:'2026-01-01'}],name:'虚构甲',id:'fake-100'}];
  const plan = planCustomerMerge(existing, incoming);
  assert.deepEqual(plan.duplicates, ['fake-100']);
  assert.equal(plan.conflicts.length, 0);
});

test('changes in nested note content or array order remain conflicts', () => {
  const existing = [{id:'fake-101', notes:[{text:'甲'}, {text:'乙'}]}];
  const changed = [{id:'fake-101', notes:[{text:'乙'}, {text:'甲'}]}];
  const plan = planCustomerMerge(existing, changed);
  assert.equal(plan.canAutoApply, false);
  assert.equal(plan.conflicts.length, 1);
});

test('unsupported and cyclic customer payloads fail closed', () => {
  assert.throws(() => planCustomerMerge([{id:'fake-102', invalid:undefined}], []), /Unsupported customer field/);
  const cyclic = {id:'fake-103'};cyclic.self=cyclic;
  assert.throws(() => planCustomerMerge([cyclic], []), /Cyclic customer record/);
  assert.throws(() => planCustomerMerge([{id:'fake-104', amount:Infinity}], []), /Unsupported customer field/);
});

test('ambiguous customer IDs fail closed rather than creating shadow records', () => {
  const valid = [{id:'fake-201', name:'虚构甲'}];
  assert.throws(() => planCustomerMerge(valid, [{id:' fake-201', name:'虚构乙'}]), /missing ID/);
  assert.throws(() => planCustomerMerge(valid, [{id:'fake-201 ', name:'虚构乙'}]), /missing ID/);
  assert.throws(() => planCustomerMerge(valid, [{id:'fake-201\n', name:'虚构乙'}]), /missing ID/);
  assert.throws(() => planCustomerMerge([{id:'fake-201\u0000'}], []), /missing ID/);
  assert.equal(valid[0].name, '虚构甲');
});

test('accessor and symbol fields are rejected without running getters', () => {
  let called = 0;
  const accessor = {id:'fake-accessor'};
  Object.defineProperty(accessor, 'notes', {enumerable:true, get(){called++; throw new Error('getter executed');}});
  assert.throws(() => planCustomerMerge([accessor], []), /Unsupported customer field/);
  assert.equal(called, 0);
  const symbol = Symbol('private');
  assert.throws(() => planCustomerMerge([{id:'fake-symbol', [symbol]:'hidden'}], []), /Unsupported customer field/);
  const nested = {id:'fake-nested', meta:{}};
  Object.defineProperty(nested.meta, 'status', {enumerable:true, get(){called++; return 'changed';}});
  assert.throws(() => planCustomerMerge([nested], []), /Unsupported customer field/);
  assert.equal(called, 0);
});

test('hidden fields and extended arrays fail closed rather than being silently ignored', () => {
  const hidden = {id:'fake-hidden', name:'虚构甲'};
  Object.defineProperty(hidden, 'privateNote', {value:'different', enumerable:false});
  assert.throws(() => planCustomerMerge([hidden], [{id:'fake-hidden',name:'虚构甲'}]), /Unsupported customer field/);

  const extra = [{text:'原始记录'}];
  Object.defineProperty(extra, 'privateNote', {value:'hidden', enumerable:false});
  assert.throws(() => planCustomerMerge([{id:'fake-array', notes:extra}], []), /Sparse or extended array/);

  const sparse = new Array(2);
  sparse[0] = 'record';
  assert.throws(() => planCustomerMerge([{id:'fake-sparse', notes:sparse}], []), /Sparse or extended array/);
});

test('top-level merge arrays reject getters before they can run', () => {
  let called = 0;
  const incoming = [{id:'fake-new'}];
  Object.defineProperty(incoming, '0', {configurable:true, enumerable:true, get(){called++; throw new Error('unsafe getter');}});
  assert.throws(() => planCustomerMerge([], incoming), /Unsupported customer field/);
  assert.equal(called, 0);

  const existing = [{id:'fake-old'}];
  Object.defineProperty(existing, '0', {configurable:true, enumerable:true, get(){called++; throw new Error('unsafe getter');}});
  assert.throws(() => planCustomerMerge(existing, []), /Unsupported customer field/);
  assert.equal(called, 0);
});

test('top-level merge arrays reject hidden metadata and extra fields', () => {
  const incoming = [{id:'fake-new'}];
  Object.defineProperty(incoming, 'hidden', {value:'must not be discarded', enumerable:false});
  assert.throws(() => planCustomerMerge([], incoming), /Sparse or extended array/);
  const existing = [{id:'fake-old'}];
  existing.extra = 'not a customer';
  assert.throws(() => planCustomerMerge(existing, []), /Sparse or extended array/);
});

test('dense arrays with 11 or more entries remain valid, while sparse arrays are rejected', () => {
  const notes = Array.from({length: 12}, (_, i) => ({text: '虚构记录' + i}));
  const old = [{id:'fake-many', notes}];
  const incoming = [{notes:notes.map(note => ({...note})),id:'fake-many'}];
  const plan = planCustomerMerge(old, incoming);
  assert.deepEqual(plan.duplicates, ['fake-many']);
  assert.equal(plan.conflicts.length, 0);
  const sparse = Array.from({length: 12}, (_, i) => ({text: String(i)}));
  delete sparse[10];
  assert.throws(() => planCustomerMerge([{id:'fake-sparse-long', notes:sparse}], []), /Sparse or extended array/);
});
