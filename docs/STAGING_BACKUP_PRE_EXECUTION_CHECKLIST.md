# AURMOVA Staging backup — pre-execution checklist

Status: REVIEW ONLY. This document does not execute anything.

Target branch: fix/staging-p0-booking-customer-history-20261028

Allowed databases:
- aurmova-booking-staging
- aurmova-private-staging

Never target production databases or deploy website code.

## Implementation review gates
1. Create a workflow that runs only with explicit authorization, never on every push.
2. Use only the two existing repository secret names, without revealing values.
3. Verify the Cloudflare API token supports export with read-only permission.
4. Confirm D1 export API request and polling behavior against official documentation.
5. Use fixed staging database identifiers; reject user-provided database names or IDs.
6. Encrypt both exports before uploading artifacts; do not upload plaintext SQL.
7. Validate two encrypted artifacts and integrity checksums; verify decryption in a secure isolated environment.
8. Store encrypted artifacts with a defined retention period and a separate recovery copy.
9. A successful export is not proof of recoverability: a restore rehearsal requires separate approval and a fresh staging-only test database.
10. Keep migrations, deployments, and all production operations disabled.

## Execution approval
Do not trigger exports until the user explicitly approves the reviewed workflow and the possible temporary interruption to staging queries.

## Current status
- Existing secret names are confirmed.
- Security gate documentation has been committed.
- No complete D1 export has been run.
- No restore test has been run.
