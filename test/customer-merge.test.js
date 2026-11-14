import test from 'node:test';
import assert from 'node:assert/strict';
import {planCustomerMerge} from '../src/customer-merge.js';
test('new fictitious customer is an addition, existing untouched',()=>{const old={id:'fiction-1',notes:'keep'};const plan=planCustomerMerge([old],[{id:'fiction-2'}]);assert.equal(plan.additions.length,1);assert.equal(old.notes,'keep');assert.equal(plan.canAutoApply,true)});
test('identical ID and content is duplicate',()=>{const plan=planCustomerMerge([{id:'fiction-1'}],[{id:'fiction-1'}]);assert.deepEqual(plan.duplicates,['fiction-1'])});
test('changed same ID is conflict, never overwrite',()=>{const plan=planCustomerMerge([{id:'fiction-1',notes:'old'}],[{id:'fiction-1',notes:'new'}]);assert.equal(plan.canAutoApply,false);assert.equal(plan.conflicts[0].existing.notes,'old')});
test('duplicate existing IDs are rejected',()=>assert.throws(()=>planCustomerMerge([{id:'x'},{id:'x'}],[])));
test('missing IDs are rejected',()=>assert.throws(()=>planCustomerMerge([],[{name:'fictitious'}])));
test('duplicate incoming IDs are rejected',()=>assert.throws(()=>planCustomerMerge([],[{id:'x'},{id:'x'}])));
