# AURMOVA booking → private workspace integration contract (review only)

Scope: **Staging**, isolated repair branch. Source reviewed: `workers/booking-staging/index.js`, `src/app.js`, `src/data.js` on `staging/private-customer-sync`. No deployment, DB access or schema change.

## Verified current behavior

1. Public booking `POST /api/bookings` requires same-origin and Turnstile; saves into `aurmova_booking_staging` and returns booking ID, public number, payment URL, WhatsApp URL.
2. Owner `GET /api/owner/bookings` requires `Authorization: Bearer <OWNER_ADMIN_KEY>`; currently returns **at most 100 newest bookings**. It is not a complete customer-history search.
3. Owner `PATCH /api/owner/bookings/:id` supports limited payment/status updates and requires explicit `manualPaymentVerified: true` for financial statuses. This is not a general customer-record update API.
4. `src/app.js` saves customers in `localStorage['aurmova.customers']` and follow-up notes in `localStorage['aurmova.followup.' + id]`. No direct `fetch(` or `/api/` integration was found in this file. Local-only records may exist and must not be deleted.
5. `src/data.js` contains an additional `儿童蓝图解析` consultation type absent from the five public booking services. Preserve historical records while deciding how to map this internal type.
6. TNG payment URL is a **manual-settlement** path; never infer paid status from a click or redirect.

## Security architecture required before implementing sync

- The public browser must **never** embed `OWNER_ADMIN_KEY` or another backend master secret.
- Add a dedicated authenticated private-backend/BFF route for owner-only access with short-lived session cookies (Secure, HttpOnly, SameSite), server-side authorization, CSRF protection for writes, restrictive CORS, and audit logs without sensitive payloads.
- Backend-to-backend access to booking D1 must be configured through scoped Cloudflare service bindings or an explicitly reviewed secret, **not** through a hardcoded owner key in the frontend.
- Implement cursor-based pagination and server-side search; the existing 100-row cap cannot be relied on for all historical customers.
- Distinguish booking ID from customer ID; ensure idempotent import/merge with a reviewable mapping, collision handling and rollback plan.
- Preserve old `localStorage` records; provide a user-initiated preview/export and explicit approval before import. No automatic overwrite, deletion or silent migration.
- Keep internal numerical analyses, parent genes, combined codes, scripts and full customer history out of public API responses. Verify authorization on the server, not just hidden UI.
- Store consultation notes in an owner-only persistence layer; validate inputs and use explicit revision/concurrency checks to prevent lost updates.
- Payment confirmation remains manual until TNG API/webhook approval and signature/reconciliation verification.

## Required synthetic end-to-end acceptance cases

1. Synthetic customer books two projects; RM136 deposit is calculated; public response contains no private numerology.
2. Owner sees booking through authenticated private session and can search beyond the first 100 records.
3. Owner creates a customer profile linked to booking ID, saves consultation notes, reloads on a different device and sees the same data.
4. Existing local-only customer is detected, previewed and imported **only after confirmation**, without duplicate or lost records.
5. Unauthenticated/expired session cannot list or change customer records; cross-origin and CSRF attempts fail.
6. Payment link click alone leaves status unpaid; manual confirmation requires verified receipt.
7. Five report types generate printable A4 output without leaking internal analysis.
8. Backup/restore validation and Production release/rollback checks pass before launch.

## Current decision

**BLOCKED for deployment.** This is an implementation contract, not a working sync. Two Staging D1 backups are still unverified; do not run migrations, deploy, or touch Production. Code review and synthetic tests may proceed on isolated branch.
