import test from 'node:test';
import assert from 'node:assert/strict';
import {previewCustomerImport} from '../src/customer-import-preview.js';

test('preview does not mutate existing customer data or perform writes', () => {
  const existing = Object.freeze([Object.freeze({id:'old-1', name:'Existing fictional'})]);
  const incoming = Object.freeze([Object.freeze({id:'new-1', name:'New fictional'})]);
  const result = previewCustomerImport(existing,incoming);
  assert.deepEqual(result.candidates,[{index:0,id:'new-1'}]);
  assert.equal(result.requiresManualApproval,true);
  assert.equal(existing.length,1);
});

test('existing IDs and duplicate imported IDs are held for manual review', () => {
  const result = previewCustomerImport([{id:'old-1'}],[{id:'old-1'},{id:'new-1'},{id:'new-1'},{}]);
  assert.deepEqual(result.conflicts,[
    {index:0,reason:'existing-id'},
    {index:2,reason:'duplicate-in-import'},
    {index:3,reason:'missing-or-invalid-id'}
  ]);
  assert.deepEqual(result.candidates,[{index:1,id:'new-1'}]);
});

test('preview never exposes contact or birthday fields', () => {
  const result = previewCustomerImport([], [{id:'fake-1',name:'Secret Fiction',whatsapp:'0100000000',birthday:'01/01/2000'}]);
  const text = JSON.stringify(result);
  for (const value of ['Secret Fiction','0100000000','01/01/2000']) assert.ok(!text.includes(value));
});

test('invalid input fails closed', () => {
  assert.throws(() => previewCustomerImport(null,[]),TypeError);
  assert.throws(() => previewCustomerImport([],{}),TypeError);
});

test('malformed or duplicated existing identifiers stop the preview safely', () => {
  assert.throws(() => previewCustomerImport([{id:'same'},{id:'same'}],[{id:'new'}]), TypeError);
  assert.throws(() => previewCustomerImport([{id:123}],[{id:'new'}]), TypeError);
  assert.throws(() => previewCustomerImport([null],[{id:'new'}]), TypeError);
});

test('non-string incoming IDs cannot be coerced into collisions', () => {
  const result = previewCustomerImport([{id:'123'}], [{id:123},{id:{toString(){throw Error('must not execute')}}},{id:'fresh'}]);
  assert.deepEqual(result.conflicts, [
    {index:0,reason:'missing-or-invalid-id'},
    {index:1,reason:'missing-or-invalid-id'}
  ]);
  assert.deepEqual(result.candidates,[{index:2,id:'fresh'}]);
});
