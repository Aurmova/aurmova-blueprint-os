# AURMOVA Staging D1 Backup — execution safety gate

Status: DESIGN ONLY. No workflow, export, or database operation is authorized by this document.

## Approved scope
- Cloudflare account: `6b7eab5acb9dcc35ef11ddb0fdcd5a3b`
- Booking staging D1: `68dcbf69-cb79-4dbb-94d1-4e9e33bfd036`
- Private staging D1: `0783ec25-8819-49df-b360-fe1ef87dda0c`
- Never enumerate, export, modify, or restore any production database.
- Never commit secrets or SQL dumps to Git.

## Existing secrets (names only)
- `CLOUDFLARE_D1_BACKUP_TOKEN`
- `AURMOVA_BACKUP_ENCRYPTION_KEY`

## Requirements before implementation
1. Verify Cloudflare D1 Read token authorizes the D1 export endpoint; do not elevate to Write without a new approval.
2. Export through the official D1 SQL export polling API with hard-coded database UUID allowlist, request schema and data, and poll to completion. Cloudflare warns exports may temporarily interrupt queries.
3. Never echo authorization headers, signed download URLs, customer data, or encryption passphrase to logs.
4. Encrypt each export locally **before** artifact upload. Fail closed: do not upload any raw SQL or other plaintext fallback.
5. Confirm archive integrity, both expected database names, and nonempty SQL content; conduct a separately approved restore rehearsal into fresh staging-only test DB before declaring recoverability.
6. Use `permissions: { contents: read }`, no deployments, no database migrations, no PR write token.
7. Default-branch `workflow_dispatch` limitation: do not place a runnable workflow on `main` without explicit authorization. A branch-only workflow may not show a Run workflow button.
8. Treat GitHub artifact retention as temporary, not an off-site long-term backup. Plan encrypted off-site copy and a documented recovery process.
9. GitHub repository secrets are available to workflows across permitted branches; protect the backup branch and review workflow edits before any trigger that can access secrets.

References:
- https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/export/
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow

## Current checkpoint
- GitHub secrets reported saved by user.
- D1 Time Travel bookmark IDs retrieved by user, not independent backups.
- No verified SQL exports, no encryption validation, no restore rehearsal.
- No production changes authorized.
