// Offline-only, side-effect-free preview for future customer migration.
// This module MUST NOT be connected to live D1 or automatically invoked by the UI.
const key = value => typeof value === 'string' ? value.trim() : '';
export function previewCustomerImport(existing, incoming) {
  if (!Array.isArray(existing) || !Array.isArray(incoming)) throw new TypeError('Customer collections must be arrays');
  // Fail closed on malformed or duplicated existing identifiers: never guess which record wins.
  const existingIds = new Set();
  for (const record of existing) {
    const id = key(record?.id);
    if (!record || typeof record !== 'object' || Array.isArray(record) || !id || existingIds.has(id)) {
      throw new TypeError('Existing customer identifiers must be unique nonempty strings');
    }
    existingIds.add(id);
  }
  const seen = new Set();
  const candidates = [];
  const conflicts = [];
  for (let index = 0; index < incoming.length; index++) {
    const record = incoming[index];
    const id = key(record?.id);
    // Do not deduplicate on names, phone numbers, or birthdays: collisions are unsafe.
    if (!id || !record || typeof record !== 'object' || Array.isArray(record)) {
      conflicts.push({index, reason:'missing-or-invalid-id'});
    } else if (existingIds.has(id)) {
      conflicts.push({index, reason:'existing-id'});
    } else if (seen.has(id)) {
      conflicts.push({index, reason:'duplicate-in-import'});
    } else {
      seen.add(id);
      candidates.push({index, id});
    }
  }
  // Deliberately no personal fields, no mutation, no writes, no auto-import.
  return {existingCount:existing.length, incomingCount:incoming.length, candidates, conflicts, requiresManualApproval:true};
}
