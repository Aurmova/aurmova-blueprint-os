-- Only short-lived authentication metadata; no customer profiles in the pilot.
CREATE TABLE IF NOT EXISTS auth_states (
  state_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS login_tickets (
  ticket_hash TEXT PRIMARY KEY,
  github_user_id TEXT NOT NULL,
  github_login TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS owner_sessions (
  token_hash TEXT PRIMARY KEY,
  github_user_id TEXT NOT NULL,
  github_login TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_states_expires_at ON auth_states (expires_at);
CREATE INDEX IF NOT EXISTS idx_login_tickets_expires_at ON login_tickets (expires_at);
CREATE INDEX IF NOT EXISTS idx_owner_sessions_expires_at ON owner_sessions (expires_at);
