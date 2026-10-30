# AURMOVA Staging backup preparation — security review status

Date: 2026-10-30. Branch: `fix/staging-p0-booking-customer-history-20261028`.

## Completed without real-data access

- Offline scope allowlist exists: `scripts/check_staging_backup_scope.py`.
- Offline allowlist consistency checker exists: `scripts/review_staging_backup_config.py`.
- Synthetic-only AES-256-GCM encryption prototype exists: `scripts/review_staging_backup_encryption_synthetic.py`.
- Offline backup preflight planner exists: `scripts/staging_d1_backup_review_only.py`. Its `--review-only` output is a JSON review plan; it has no network, file export, or backup functionality.
- A local, separate synthetic AES-GCM smoke test succeeded (round-trip and tamper detection). This does **not** certify the repository prototype's full test suite or production backup.
- No GitHub Actions workflow was created or enabled by this work. No Cloudflare API calls, exports, migrations, or deployments were initiated.

## Required before any real backup (BLOCKED)

1. Independently inspect Cloudflare D1 export documentation, API compatibility, and token permissions; do not assume existing token is sufficient.
2. Implement reviewed export client with exact two-database allowlist, explicit account and branch guards, timeout, retry, and no SQL logs.
3. Implement reviewed streaming or bounded-memory authenticated encryption for potentially large exports, safe secret handling, encrypted-only upload, cleanup, retention, and restore verification. The current in-memory synthetic prototype is **not** suitable for real customer exports.
4. Test the exact committed prototype, the export client's mocked error cases, and encrypted restore with synthetic fixtures in isolation.
5. Design a trigger that does not require deploying or editing Production/default branch, and check existing Cloudflare preview auto-build behavior.
6. Obtain explicit authorization before contacting real Staging D1, enabling workflow, or exporting customer data.

## Database allowlist

- `aurmova-booking-staging`: `68dcbf69-cb79-4dbb-94d1-4e9e33bfd036`
- `aurmova-private-staging`: `0783ec25-8819-49df-b360-fe1ef87dda0c`

**Current outcome: review preparation only. Zero verified independent D1 backups.** Do not deploy or migrate until both backups are completed and validated.
