# AURMOVA Staging D1 encrypted backup — REVIEW DRAFT ONLY

Status: **NOT EXECUTABLE / NOT APPROVED TO RUN**. This is a design document, not a GitHub Actions workflow or script. It must not be copied into `.github/workflows/` or executed before explicit approval.

## Scope and immutable allowlist

Cloudflare account: `6b7eab5acb9dcc35ef11ddb0fdcd5a3b`

| Allowed staging database | Database ID |
| --- | --- |
| `aurmova-booking-staging` | `68dcbf69-cb79-4dbb-94d1-4e9e33bfd036` |
| `aurmova-private-staging` | `0783ec25-8819-49df-b360-fe1ef87dda0c` |

No user-provided database IDs, arbitrary CLI parameters, or wildcard database discovery. Explicitly reject any name or ID not exactly listed above. **Never access `aurmova-booking-production`, `aurmova-private`, or any other database.**

## Existing secrets (names only)

- `CLOUDFLARE_D1_BACKUP_TOKEN`: read-only token. Verify whether Cloudflare's D1 export endpoint accepts this permission; do not request broader permissions automatically.
- `AURMOVA_BACKUP_ENCRYPTION_KEY`: encryption passphrase. Never echo, print, interpolate into command-line arguments, or include in artifacts.

Do not include credentials, customer records, or plaintext SQL in commits, workflow logs, or issue comments.

## Proposed backup procedure (requires separate implementation and approval)

1. Trigger only by an explicitly approved manual action on the isolated Staging repair branch. GitHub Actions `workflow_dispatch` visibility on non-default branches needs validation; **do not add a workflow to `main`** to make it visible.
2. Before contacting Cloudflare, verify the exact Git ref, account ID, two database names and IDs, presence of both secrets, and that the execution environment is not a pull request from a fork. Stop on any mismatch.
3. Export **only** the two allowlisted Staging D1 databases through a documented read/export API or CLI operation. First confirm export API permission and that it cannot mutate data. Avoid printing SQL. Verify export completeness using supported metadata and nonempty files; record export time and tool version.
4. Encrypt each export immediately using an authenticated encryption method (preferred: age or GPG with verified integrity; if OpenSSL is chosen, use an authenticated scheme or a separate keyed MAC). Supply the passphrase through protected environment/stdin, not command-line text. Use restrictive file permissions.
5. Test decryption and integrity in the isolated runner without printing or uploading plaintext. Delete temporary plaintext files using cleanup traps; note that deletion on ephemeral runner is not a cryptographic wipe.
6. Upload **encrypted files only** as private GitHub Actions artifacts with short retention; pin external actions by reviewed full commit SHA. Include a manifest containing only database names, IDs, timestamps, encrypted-file hashes, and verification outcomes.
7. Verify both artifacts exist, can be downloaded by an authorized owner, and pass an independent restore/decryption validation before claiming a successful backup. No restore into an existing customer database without separate explicit approval.
8. On failure, stop immediately, report which stage failed without secrets or customer data, and **do not** run migrations, deploy, or touch Production.

## Pre-execution blockers

- Confirm the exact export method and its compatibility with the existing D1 Read token.
- Confirm GitHub Actions trigger strategy that cannot deploy or touch `main`; creating a workflow on a push-triggered branch can run immediately.
- Review automatic Cloudflare Workers Builds on branch commits. Current preview build failure (`npx wrangler preview` missing `previews` configuration) is unrelated to database backup success; do not “fix” it by binding live Staging D1 to previews.
- Choose and test authenticated encryption and restore validation in a safe offline test with synthetic data.
- Review artifact access and retention settings.
- Obtain explicit approval for any executable workflow creation and any actual export.

## Current evidence

The existing `scripts/check_staging_backup_scope.py` and `scripts/review_staging_backup_config.py` only inspect static allowlists. **No complete independent database backup has been performed or verified.**

This file is an inert review draft. Committing it may still cause Cloudflare to attempt an automatic preview build due to broad branch watch paths; this is not permission to retry, fix, or deploy a Worker.
