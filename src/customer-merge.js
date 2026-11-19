/** Offline-only dry-run reconciliation. Never writes a database or browser storage. */
/**
 * Canonical comparison for offline conflict detection.
 * Object key order is irrelevant, but array order and value types are preserved.
 * Reject unsupported/cyclic payloads instead of silently treating them as equal.
 */
function canonical(value, stack = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (typeof value !== 'object') throw new TypeError('Unsupported customer field; refusing merge');
  if (stack.has(value)) throw new TypeError('Cyclic customer record; refusing merge');
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    throw new TypeError('Unsupported customer object; refusing merge');
  // Never invoke accessors during a supposedly read-only dry run. Getters can mutate records or trigger side effects.
  if (Reflect.ownKeys(value).some(key => typeof key === 'symbol'))
    throw new TypeError('Unsupported customer field; refusing merge');
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(descriptors).some(key => !Object.hasOwn(descriptors[key], 'value')))
    throw new TypeError('Unsupported customer field; refusing merge');
  stack.add(value);
  let result;
  if (Array.isArray(value)) {
    if (Object.keys(value).length !== value.length) throw new TypeError('Sparse or extended array; refusing merge');
    result = '[' + value.map(v => canonical(v, stack)).join(',') + ']';
  } else {
    result = '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key], stack)).join(',') + '}';
  }
  stack.delete(value);
  return result;
}

export function planCustomerMerge(existing, incoming) {
  if (!Array.isArray(existing) || !Array.isArray(incoming)) throw new TypeError('Expected customer arrays');
  const byId = new Map();
  const validId = id => typeof id === 'string' && id.length > 0 && id === id.trim() && !/[\u0000-\u001f\u007f]/.test(id);
  // Validate all records before constructing a plan; this function never applies changes.
  for (const record of [...existing, ...incoming]) canonical(record);
  for (const customer of existing) {
    if (!customer || !validId(customer.id)) throw new Error('Existing record missing ID; refusing merge');
    if (byId.has(customer.id)) throw new Error('Duplicate existing ID; refusing merge');
    byId.set(customer.id, customer);
  }
  const additions = [], conflicts = [], duplicates = [];
  const seen = new Set();
  for (const customer of incoming) {
    if (!customer || !validId(customer.id)) throw new Error('Incoming record missing ID; refusing merge');
    if (seen.has(customer.id)) throw new Error('Duplicate incoming ID; refusing merge');
    seen.add(customer.id);
    if (!byId.has(customer.id)) { additions.push(customer); continue; }
    const original = byId.get(customer.id);
    if (canonical(original) === canonical(customer)) duplicates.push(customer.id);
    else conflicts.push({id:customer.id, existing:original, incoming:customer});
  }
  return { additions, duplicates, conflicts, canAutoApply: conflicts.length === 0 };
}
