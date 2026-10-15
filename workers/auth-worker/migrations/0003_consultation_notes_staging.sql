-- V3 STAGING ONLY. Separate consultation notes from immutable customer blueprint inputs.
-- Requires the existing private_customers table (migration 0002); never run on production.
CREATE TABLE IF NOT EXISTS private_consultation_notes (
  id TEXT PRIMARY KEY,
  owner_github_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  project TEXT NOT NULL,
  step_id TEXT NOT NULL,
  selection_key TEXT NOT NULL DEFAULT '',
  selection_label TEXT NOT NULL DEFAULT '',
  answer_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(customer_id) REFERENCES private_customers(id)
);
CREATE INDEX IF NOT EXISTS idx_private_consultation_notes_owner_customer_created
  ON private_consultation_notes (owner_github_id, customer_id, created_at DESC);
