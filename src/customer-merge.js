/** Offline-only dry-run reconciliation. Never writes a database or browser storage. */
export function planCustomerMerge(existing, incoming) {
  if (!Array.isArray(existing) || !Array.isArray(incoming)) throw new TypeError('Expected customer arrays');
  const byId = new Map();
  for (const customer of existing) {
    if (!customer || typeof customer.id !== 'string' || !customer.id.trim()) throw new Error('Existing record missing ID; refusing merge');
    if (byId.has(customer.id)) throw new Error('Duplicate existing ID; refusing merge');
    byId.set(customer.id, customer);
  }
  const additions = [], conflicts = [], duplicates = [];
  const seen = new Set();
  for (const customer of incoming) {
    if (!customer || typeof customer.id !== 'string' || !customer.id.trim()) throw new Error('Incoming record missing ID; refusing merge');
    if (seen.has(customer.id)) throw new Error('Duplicate incoming ID; refusing merge');
    seen.add(customer.id);
    if (!byId.has(customer.id)) { additions.push(customer); continue; }
    const original = byId.get(customer.id);
    if (JSON.stringify(original) === JSON.stringify(customer)) duplicates.push(customer.id);
    else conflicts.push({id:customer.id, existing:original, incoming:customer});
  }
  return { additions, duplicates, conflicts, canAutoApply: conflicts.length === 0 };
}
