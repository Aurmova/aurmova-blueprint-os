# AURMOVA private backend: Stage 1 (review-only)

**Status: implementation pilot on a separate GitHub branch. NOT DEPLOYED.**
Production GitHub Pages remains unchanged until Josephine reviews and approves a merge.

## What this stage delivers
- Cloudflare Worker at workers/auth-worker/src/index.js with GitHub OAuth owner login, owner numeric GitHub ID verification, hashed database-backed 30-minute bearer sessions, one-time tickets, controlled CORS, and logout.
- Dedicated experimental pilot page at secure-login.html, not linked from the existing dashboard.
- D1 database migration for login/session metadata only. No customer, revenue or personal data migrated.
- Regression tests and pull-request-only checks.

**Not delivered:** Instagram auto-replies; TNG webhook; automatic payment verification; a customer database; old localStorage migration; protected numerology content; Cloudflare deployment.

## Important security limitation

GitHub Pages is public static hosting. Adding a password form to the existing website does NOT protect source files hosted publicly.

Existing app inspection shows:
- Customer and consultation data currently saved in browser localStorage, not safely synced across devices.
- Proprietary numerology teaching and internal calculations are bundled into publicly accessible src/*.js files.
- Public legacy app remains available without a verified server session.
- The main logo URL still references Floot hosting.

**Before real customer data can be used in the new architecture:**
1. Back up every device's localStorage data before any migration; do not overwrite it.
2. Migrate proprietary materials and calculation logic to a protected server endpoint, stop publicly serving those files and plan mitigation of Git history exposure. Deleting a file in a later commit does not remove public commit history or existing clones.
3. Replace browser-only customer storage with authenticated server APIs and test authorization on each endpoint.
4. Review existing HTML injection/XSS risks before embedding private API access into the legacy dashboard.
5. Document personal-data handling and retention, and test recovery and encrypted backups.

Never upload real client birth dates, phone numbers, transactions, OAuth client secrets, TNG credentials, or OpenAI API keys to this public repository.

## Set up: Cloudflare Worker + D1

Cloudflare is the intended always-on hosting infrastructure, not Floot or another chatbot app. Cloudflare account approval and possible costs are separate. Merely preparing the PR creates no Cloudflare account and incurs no service charges.

After code review, create a Cloudflare account using your browser and arrange the initial deployment:

1. Create a Cloudflare D1 database called aurmova-private.
2. In workers/auth-worker/wrangler.toml, replace REPLACE_WITH_YOUR_D1_DATABASE_ID with the new D1 database ID.
3. Confirm your Cloudflare workers.dev subdomain and set API_ORIGIN to your Worker HTTPS origin without a trailing slash.
4. GitHub browser -> Settings -> Developer settings -> OAuth Apps -> New OAuth App:
   - Homepage: https://aurmova.github.io/aurmova-blueprint-os/secure-login.html
   - Callback: https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/auth/github/callback
   - Keep the client secret private. OAuth requests read:user permission.
5. Verify the **numeric GitHub user ID** for the authorized repository owner. Use this numeric ID for OWNER_GITHUB_USER_ID, not a guessed login name.
6. Run the following infrastructure commands from workers/auth-worker on an authorized build machine:

    npm install
    npx wrangler login
    npx wrangler d1 migrations apply aurmova-private --remote
    npx wrangler secret put GITHUB_CLIENT_ID
    npx wrangler secret put GITHUB_CLIENT_SECRET
    npx wrangler secret put OWNER_GITHUB_USER_ID
    npm run deploy

7. Once the PR has been explicitly approved and merged, open https://aurmova.github.io/aurmova-blueprint-os/secure-login.html, enter your HTTPS workers.dev base URL and sign in with GitHub.
8. Confirm another GitHub account cannot log in, the authenticated private status endpoint works, and logout invalidates the session.

Cloudflare/GitHub OAuth registration happens in their web consoles. It does not involve installing an extra Instagram chatbot app. Do NOT paste secrets into ChatGPT or commit .dev.vars files.

## Auth details
- Private authorization occurs only on the Worker server using the approved numeric user ID.
- Login state and one-time exchange tickets expire quickly, cannot be reused, and are stored as SHA-256 digests.
- The authenticated session lasts up to 30 minutes; bearer tokens are stored hashed by the server and only in memory in the pilot client (never in browser storage).
- A page reload logs out of the pilot UI and requires a new login.
- The OAuth ticket is carried in a URL fragment, not a query.
- CORS is limited to the exact GitHub Pages origin. CORS alone is not authorization; every private request needs a valid token.
- The pilot Content Security Policy permits only workers.dev API domains. Review and update before moving to a custom domain.

## Planned next steps, not yet implemented
1. Back up browser client records and design private database with access controls, audit logs and exports.
2. Migrate internal code + content out of public GitHub Pages.
3. Bind the existing consultation dashboard to protected read/write APIs only after an XSS review.
4. Add Instagram official messaging API once Meta authorizes access.
5. Verify TNG Payment Link APIs with TNG before automating payment verification; static links alone do not identify every customer or prove settlement.
6. Expose a restricted OpenAI/ChatGPT connector after the backend is verified.

## Testing / rollback
In workers/auth-worker run npm run check and npm test (Node 22). PR-only GitHub Actions repeats these tests.
Closing this feature PR leaves the production website unchanged. Publishing the auth login page requires an approved merge and deployment.
