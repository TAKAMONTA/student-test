# iOS App Review Access (Demo Login) — Design

> Unblocks Apple App Review Guideline 2.1 for the iOS app. The app uses passwordless magic-link auth only, which Apple reviewers cannot complete (no inbox access). This adds a secret-gated demo login reachable inside the iOS WKWebView so reviewers can access the paid experience.

## Goal

Let an Apple reviewer log in without an email round-trip, using a demo email + a review code documented in App Review notes, reusing the existing tested `/api/auth/test-login` endpoint. Reviewer reaches the full paid experience (home / drill / mock-exam) so the app is reviewable end-to-end.

## Context / why this shape

- The iOS app is a WKWebView with **no address bar**; an unauthenticated launch lands on `/login`. So the review-login affordance must live **on `/login`** (a separate `/review` page would be unreachable in-app).
- `/api/auth/test-login` already exists and is tested: gated by `ENABLE_TEST_LOGIN === "true"`, requires a `secret` (`TEST_LOGIN_SECRET`) in the POST body, restricts to `@takaapps.com` or `TEST_LOGIN_ALLOWED_EMAILS`, and issues a session cookie directly (no email). We reuse it as-is for the review path.
- The local-dev auto-login path in `/api/auth/send` is localhost-gated and unrelated; we do not touch it.

## Scope (code)

### 1. `/login` — add a demo/review login form
`src/app/login/page.tsx` gains, **below the existing magic-link form** (always rendered, inside the `max-w-sm` container, after the `{sent ? ... : ...}` block), an unobtrusive collapsible:

- A `<details>` with `<summary>審査・デモ用ログイン</summary>`.
- Inside: two inputs — email (`reviewEmail`) and review code (`reviewCode`) — and a submit button "ログイン".
- New local state: `reviewEmail`, `reviewCode`, `reviewError`, `reviewLoading`.
- `handleReviewSubmit`: `POST /api/auth/test-login` with body `{ email: reviewEmail, secret: reviewCode }`. On `res.ok` → `window.location.href = "/home"`. On failure → show `reviewError` ("ログインできませんでした").
- The existing magic-link form, `EmailInput`, and copy are untouched. No `pr-16`, no `@` helper (keeps the existing `email-input-at-sign` guard green).
- The form renders regardless of server flag (it is just UI). Security lives in the API: when `ENABLE_TEST_LOGIN` is not `"true"`, `/api/auth/test-login` returns 404, so the form is inert in normal operation.

### 2. `/api/auth/test-login` — add brute-force rate limiting
`src/app/api/auth/test-login/route.ts` currently has **no rate limit**, so the `secret` could be brute-forced. Add an IP-based throttle using the existing `reserveRateLimits` + `getClientIp` from `@/lib/rate-limit`:

- After the `ENABLE_TEST_LOGIN` gate and env presence check, before the secret comparison: compute `ip = getClientIp(req.headers)`, then `reserveRateLimits(getDb(), [{ key: \`testlogin_ip:${ip}\`, limit: 10 }], 60 * 60)`. If `!allowed` → `429 { error: "Too many requests" }`.
- This bounds guesses to 10/hour/IP. Combined with a 32-char random `TEST_LOGIN_SECRET`, brute force is infeasible.
- All other behavior (allowlist, user create/find, session issue) unchanged.

### Testing
New `tests/security/review-login.test.ts`, structural (matching repo convention — `email-input-at-sign`, `access-control`, etc.):
- `src/app/login/page.tsx` contains the review form: `/api/auth/test-login`, a `reviewCode` reference, and the label `審査・デモ用ログイン`.
- `src/app/api/auth/test-login/route.ts` contains the rate-limit (`reserveRateLimits`, `getClientIp`) AND still contains the `ENABLE_TEST_LOGIN` gate and the `secret !== testSecret` check (regression guard that hardening did not remove the gate).
- Existing `tests/security/email-input-at-sign.test.ts` must still pass (login page keeps `<EmailInput`, no `pr-16`).

## Operational steps (manual — NOT code; documented here so nothing is lost)

These are executed by the user at submission time; this spec's implementation does not perform them.

1. **Production env** (via `wrangler secret put` / vars):
   - `ENABLE_TEST_LOGIN=true`
   - `TEST_LOGIN_SECRET=<32-char random>` (the review code given to Apple)
   - `TEST_LOGIN_ALLOWED_EMAILS=appreview@takaapps.com` (optional; `@takaapps.com` already allowed)
2. **Demo account** in production D1 — create `appreview@takaapps.com` and set it **purchased** so the reviewer sees paid content immediately (de-risks 2.1):
   ```sql
   -- after first login creates the row, or insert directly:
   UPDATE users SET purchased_at = unixepoch()*1000 WHERE lower(email)='appreview@takaapps.com';
   ```
3. **App Review notes** (App Store Connect): provide demo email `appreview@takaapps.com` + the review code; explain the native value (StoreKit IAP purchase/restore, entitlement sync) for Guideline 4.2.
4. **After approval**: set `ENABLE_TEST_LOGIN=false` to close the demo-login path.

## Out of scope
- App Store Connect product creation, metadata, privacy nutrition labels, screenshots (separate submission checklist).
- The 4.2 minimum-functionality risk mitigation beyond review notes.
- Any change to the magic-link flow or the localhost dev auto-login.

## Security notes
- The demo-login path is inert unless `ENABLE_TEST_LOGIN=true` AND a correct 32-char secret AND an allowlisted email are all present.
- Rate limiting caps brute force; the secret is high-entropy; the allowlist limits blast radius to a demo account.
- Disable after approval. The endpoint already logs issuance (`console.info("test login issued", ...)`).

## Branch
`codex/ios-review-access`, based on `main`. PR targets `main` directly.

## Verification
- `npx tsc --noEmit` → exit 0
- `npm test` → prior suite (127) green + new review-login tests; `email-input-at-sign` still green
- `npm run build` → all routes compile
- Manual (local, `ENABLE_TEST_LOGIN=true` + secret set): open `/login`, expand 審査・デモ用ログイン, enter demo email + code → lands on `/home`

## Self-Review (inline)
- **Placeholders:** none.
- **Consistency:** reuses existing `/api/auth/test-login` + `reserveRateLimits`; no new auth path.
- **Scope:** one login-page form + one rate-limit addition + tests; manual ops clearly separated.
- **Ambiguity:** form always renders but API-gated; demo account purchased (2.1 over IAP-demo); reviewer reachability solved by placing on `/login`.
