-- Staging-only private customer profiles. No production migration or customer import.
-- The application must authenticate and authorize owner sessions before any access.
CREATE TABLE IF NOT EXISTS private_customers (
  id TEXT PRIMARY KEY,
  owner_github_id TEXT NOT NULL,
  name TEXT NOT NULL,
  birthday TEXT NOT NULL,
  gender TEXT NOT NULL,
  whatsapp TEXT NOT NULL DEFAULT '',
  consultation_type TEXT NOT NULL,
  profile_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_private_customers_owner_created
  ON private_customers(owner_github_id, created_at DESC);
