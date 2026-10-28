# AURMOVA P0 Staging repair plan (2026-10-28)

Status: planning only. NO deployment, D1 migration, data mutation, or Production changes authorized by this file.

## Verified source findings
- Booking worker: `workers/booking-staging/index.js` on `staging/private-customer-sync` inserts bookings into `aurmova_booking_staging`; no private customer synchronization occurs in its POST booking handler.
- Booking D1: `aurmova-booking-staging`. Private API D1: `aurmova-private-staging`. Different bindings and databases.
- Private API source was located on `fix/staging-consultation-read-feedback-20261016` at `workers/auth-worker/src/private-customers-api.js` and `private-consultation-notes-api.js`. IMPORTANT: this source is not yet confirmed to be the code deployed in the active private Staging Worker. Do not blindly copy it into the booking branch.
- Private customers list limit 30; consultation notes list limit 50; notes schema has no consultation_session_id; notes handler restricts project to relationship blueprint.
- Existing private customer data and consultation notes must be preserved.

## Preflight gates (all required before D1 writes)
1. Confirm active deployed private Staging Worker commit and its repository/branch, including whether booking and private sources can be updated independently.
2. Export FULL schema + data backups separately from both Staging D1 databases; verify row counts, export file integrity, and restore process in disposable test databases. Keep backups access-controlled, encrypted, and out of GitHub.
3. Record baseline table row counts and API smoke tests without including customer PII in logs.
4. Check CI/deployment automation on the new branch; prohibit auto-deploy and Production targets.

## Proposed design
- Keep existing booking and private D1 databases; do not cross-bind a public booking Worker to private D1.
- Booking worker creates a unique booking ID as today; a server-to-server authenticated, idempotent sync to private API will create/link a customer. Never expose owner auth secrets to the public frontend.
- Store a mapping of `booking_id -> customer_id` with unique booking_id, sync state, attempt count, last error category, timestamps. Use retry/backfill for partial failures; never lose successful bookings if sync fails.
- Avoid merging customers solely by name, birthday, or WhatsApp. For uncertain matches, flag for owner review. Preserve all existing records.
- Add consultation sessions with UUID, owner_id, customer_id, optional booking_id, project, started_at, ended_at, status. Notes should reference session_id; legacy notes remain readable under an explicit "legacy/unassigned" grouping.
- Add cursor-based pagination to customers and notes; enforce owner authorization and bounded page size. Ensure all five project types are supported in notes without assuming all project scripts exist.
- Retain current manual TNG payment confirmation until API approval. No payment state inferred from booking submission.

## Acceptance tests
1. New booking -> private record/mapping; same booking retried -> exactly one mapping.
2. Two bookings by same person -> two booking records, safely linked customer only after identity resolution.
3. Two consultations for same customer -> separate session histories; legacy notes visible.
4. 51+ notes and 31+ customers -> full history reachable through pagination.
5. Cross-owner access rejected; unauthorized sync rejected; no internal analysis exposed to public.
6. Sync outage -> booking preserved, pending retry; recovery backfills exactly once.
7. No production configuration, D1, or deployment changed.

## Next code work
Locate and verify the deployed private API source branch. Implement and test on an isolated Staging-only branch after preflight. Obtain separate approval before any database migration or Staging deployment.
