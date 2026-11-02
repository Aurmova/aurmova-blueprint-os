// Offline-only regression tests. Never call live Workers, D1, or customer endpoints.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const bookingSource = readFileSync(new URL('../workers/booking-staging/index.js', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const purePrefix = bookingSource.split('const json =')[0];
assert.ok(purePrefix.includes('function calcQuote('), 'pricing calculation missing');
const sandbox = vm.createContext({});
vm.runInContext(`${purePrefix}\n globalThis.testAPI = {calcQuote, SERVICES, PRICES, STATUSES, DEPOSIT_PER_PROJECT};`, sandbox);
const {calcQuote, SERVICES, STATUSES, DEPOSIT_PER_PROJECT} = sandbox.testAPI;

test('exactly five public booking services and RM68 per project', () => {
  assert.equal(SERVICES.length, 5);
  assert.equal(new Set(SERVICES).size, 5);
  assert.equal(DEPOSIT_PER_PROJECT, 68);
});

test('single-service deposits and totals are internally consistent', () => {
  for (const service of SERVICES) {
    const quote = calcQuote([service]);
    assert.equal(quote.deposit, 68);
    assert.equal(quote.total - quote.deposit, quote.balance);
    assert.equal(quote.discount, 0);
  }
});

test('life + annual cycle combo has RM288 total and RM136 deposit', () => {
  const quote = calcQuote(['人生蓝图解析', '黄金流年蓝图解析']);
  assert.equal(quote.total, 288);
  assert.equal(quote.deposit, 136);
  assert.equal(quote.balance, 152);
  assert.equal(quote.discount, 68);
});

test('all five services quote without negative outstanding balance', () => {
  const quote = calcQuote([...SERVICES]);
  assert.equal(quote.deposit, 340);
  assert.equal(quote.total - quote.deposit, quote.balance);
  assert.ok(quote.balance >= 0);
});

test('booking payment states do not imply automatic confirmation', () => {
  assert.ok(STATUSES.includes('待订金'));
  assert.ok(STATUSES.includes('已付订金'));
  assert.ok(!bookingSource.includes('paymentWebhookVerified'), 'review payment automation before enabling');
});

test('document unresolved private-workbench local-only persistence', () => {
  assert.match(appSource, /localStorage\.getItem\("aurmova\.customers"\)/);
  assert.match(appSource, /localStorage\.setItem\("aurmova\.customers"/);
  assert.doesNotMatch(appSource, /fetch\s*\(/, 'backend synchronization added: revisit migration/security audit');
});
