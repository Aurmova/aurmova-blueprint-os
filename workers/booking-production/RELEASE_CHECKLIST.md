# AURMOVA – production customer booking release checklist

**Status:** PREPARATION ONLY. Do not share a booking URL with real customers yet.

## Isolation and non-negotiable safeguards

- Use an entirely new Cloudflare Worker named **aurmova-booking** (NOT **aurmova-secure-api** or **aurmova-booking-staging**).
- Use an entirely new D1 database **aurmova-booking-production**. Do not copy staging bookings.
- The production code uses D1 tables named `aurmova_booking_production` and `aurmova_booking_rate_limit`. Table creation is automatic on first authenticated access or successful booking.
- Use a new Cloudflare Turnstile widget for **aurmova-booking.xbing5668.workers.dev**, with a distinct production site key and encrypted secret. Never reuse the staging Turnstile secret.
- Generate an independent 32+ character **OWNER_ADMIN_KEY** for production. Never reuse or paste secret keys into GitHub, screenshots, WhatsApp, or ChatGPT. Store Cloudflare **OWNER_ADMIN_KEY**, **TURNSTILE_SECRET_KEY**, **RATE_LIMIT_SALT** as encrypted Worker secrets only.
- This code has a **closed-by-default booking gate**: `ENABLE_BOOKINGS = "false"`. Never enable before end-to-end tests and explicit business approval.
- Production remains independent of the existing consultation/blueprint system.

## Before a production Worker can be deployed

1. In Cloudflare > D1 SQL database, **Create Database**: `aurmova-booking-production`. Keep the generated database UUID.
2. Replace `REPLACE_WITH_NEW_PRODUCTION_D1_ID` in this directory's `wrangler.toml` with that NEW UUID. (The placeholder intentionally prevents careless deployment.)
3. Under Cloudflare Turnstile, create a separate **Managed** production widget for `aurmova-booking.xbing5668.workers.dev`. Copy the public site key to `wrangler.toml` under `[vars]` as `TURNSTILE_SITE_KEY`. Keep the private secret key exclusively in Worker encrypted secrets.
4. Create a new Cloudflare Worker named `aurmova-booking` and connect GitHub repo `Aurmova/aurmova-blueprint-os`, **branch `release/booking-production-prep`**, not `main` or the staging branch.
5. Cloudflare Builds: root directory `/`, build command blank, deploy command `npx wrangler deploy --config workers/booking-production/wrangler.toml`. Check builds target the NEW Worker only.
6. Add the encrypted runtime secrets `OWNER_ADMIN_KEY` (new unique 32+ char secret), `TURNSTILE_SECRET_KEY` (from production widget), and `RATE_LIMIT_SALT` (new unique 32+ char secret). Never print any secret key in logs or messages.

## Keep the booking gate closed until tests pass

- GET `/api/health`: `environment: production`, `publicReady: true`, `bookingsOpen: false`.
- GET `/`: only the “预约服务即将开放” holding page; no live booking form.
- GET `/owner`: empty owner dashboard with new key; verify no staging orders.
- GET `/api/owner/bookings` without Authorization: 401, no sensitive fields.
- POST `/api/bookings` while gated: 503, does not write to D1.
- Verify the TNG Business static reusable link is still valid and belongs to `TAN JOE PIN` (AURMOVA account). A customer must input the exact deposit amount. NO automatic TNG payment acknowledgment is implemented.
- Check operator's published privacy notice, refund/24h-reschedule terms and customer consent text before accepting real customer data.
- After the owner explicitly approves opening, change `ENABLE_BOOKINGS` to `"true"` in `wrangler.toml` in a separate reviewed commit. Test a synthetic order, Turnstile, D1 persistence, owner access, RM68/project, RM288 life+annual discount and manual confirmation/cancellation. Cleanly remove any production synthetic record using an approved procedure before real customer release.

## Pricing snapshot (RM)

- 人生蓝图 RM168; 黄金流年 RM188; 关系蓝图 RM328; 亲子蓝图 RM328; 合作蓝图 RM388.
- 人生 + 黄金流年: **RM288 combined total** (RM68 discount), even with additional projects.
- **Deposit = number of selected projects × RM68**, counted toward total; balance due before consultation.
- Example: 人生 + 黄金流年 + 亲子: total RM616, deposit RM204, balance RM412.

## Operational notes

- Avoid making unsupported automatic-payment or guaranteed-availability claims. TNG payment is manual, validated using actual merchant transaction history.
- Do not change, overwrite, or connect the existing `aurmova-secure-api`, its D1, or the existing GitHub Pages production frontend.
- Cloudflare Workers and D1 have free-plan allowances, with usage limits; verify the Cloudflare account's active plan and limits before operating at scale.
- Do not delete the staging D1 or Worker until production is verified and backups/retention requirements have been decided.

Cloudflare docs:
- D1: https://developers.cloudflare.com/d1/get-started/
- Turnstile: https://developers.cloudflare.com/turnstile/get-started/
- Pricing: https://developers.cloudflare.com/workers/platform/pricing/

## 2026-10-21 first production-build trigger

- Independent `aurmova-booking` Worker and D1 `aurmova-booking-production` were created in Cloudflare.
- `wrangler.toml` now contains the dedicated production D1 identifier and public production Turnstile site key. The checklist steps describing placeholders above are historical preparation instructions, already completed.
- The owner added three sensitive runtime values as encrypted secrets in the Cloudflare dashboard; none are stored in this repository.
- Git integration targets only `release/booking-production-prep` using the dedicated Wrangler config. Auto-builds were enabled in the Cloudflare dashboard after initial connection.
- This documentation-only change is intended to trigger the first Cloudflare Git build; its result must be checked separately. It does not change any application runtime code or enable customer bookings.
- Keep `ENABLE_BOOKINGS = "false"` until the owner expressly approves opening after tests.

## 2026-10-22 guarded deployment verification

- Cloudflare aurmova-booking Git builds were re-enabled by the owner.
- Production Wrangler config declares required secret names, not their values.
- This documentation-only commit intends to trigger a new Cloudflare Git build. The build result is not assumed; check the Cloudflare build logs and deployments.
- Keep ENABLE_BOOKINGS set to false until health checks and end-to-end tests pass.
