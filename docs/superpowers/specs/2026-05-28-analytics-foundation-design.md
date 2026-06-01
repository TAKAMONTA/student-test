# Analytics Foundation (PostHog) — Design

> Subproject **A** of the 5 pre-launch monetization measures (brainstorming session 2026-05-28).
> Foundation for B (feedback), C (review prompts), D (pricing experiments), E (UX polish).

## Goal

Provide minimum-viable analytics so we can answer **"how many visitors become buyers, and where do they drop off?"** by launch day. This becomes the measurement substrate for all subsequent monetization work.

## Scope (v1)

**In scope:**
- Conversion funnel: LP visit → `/buy` reach → purchase initiated → purchase completed
- Traffic source attribution (referrer, utm_*)
- Web + iOS WKWebView coverage (WebView automatically picks up the Web SDK)
- Server-side capture for the authoritative purchase event (Stripe + Apple IAP)

**Out of scope (deferred to later subprojects):**
- Retention / cohort analysis (deferred)
- Feature stickiness deep dive (deferred to E)
- A/B testing infrastructure (PostHog supports it; deferred to D)
- Session Replay (explicitly disabled — privacy decision)
- Native iOS analytics SDK (intentionally not used)

## Tool: PostHog Cloud (EU region)

**Rationale:**
- One tool covers product analytics, future feature flags / experiments, and ingest API
- Generous free tier: 1M events / 1M feature-flag requests per month. Projected v1 ≈ 150K events/month at 1,000 visitors/day × 5 events avg. Comfortable margin.
- EU residency is easier to justify in App Store review and aligns with Japanese personal-info best practices.

**Rejected alternatives:**
- Self-hosted PostHog — operational burden, not warranted at current scale
- Mixpanel / Amplitude — comparable features, smaller free tiers
- Server-only (no client SDK) — insufficient client-interaction granularity for funnel diagnostics
- Plausible / Umami — no funnels, no user identification

## Privacy Stance: Standard with PP disclosure

Decisions (revised during brainstorming):

| Concern | Decision |
|---|---|
| Consent banner | NOT shown (privacy policy update only) |
| Session Replay | **Disabled** (do not enable for any page in v1) |
| Raw email to PostHog | **No** — SHA-256 hashed (server-side) before sending |
| IP address | Last octet masked (PostHog project setting) |
| Browser DNT | Honored — `posthog.init()` is skipped when `navigator.doNotTrack === '1'` |
| ATT prompt (iOS) | Not required — no cross-app tracking; document the stance |
| Privacy Policy update | Required: discloses analytics tool, EU storage, opt-out method, under-18 considerations |

## Identification Strategy

- **First visit (anonymous):** PostHog auto-generated `distinct_id` stored in 1st-party cookie
- **On login:** `posthog.identify(user.id)` — links the anonymous session to the D1 `users.id`
- **On purchase:** `posthog.people.set({ purchased_at, purchase_channel, email_hash })`
- The raw email never leaves Cloudflare Workers; hashing is performed server-side via `hashEmailForAnalytics()`.

## Event Taxonomy (v1)

| Event | When | Source | Key properties |
|---|---|---|---|
| `$pageview` (auto) | Every page load | Web SDK | `$current_url`, `$referrer`, `utm_*`, `is_ios_app` (derived from UA) |
| `lp_cta_clicked` | Click on "始める" CTA on `/` | Web SDK manual | `cta_id`, `position` |
| `login_email_submitted` | Submit on `/login` | Web SDK manual | `email_hash` |
| `login_completed` | Magic-link session creation succeeds | Server (`/api/auth/verify`) | `user_id`, `is_new_user` |
| `purchase_initiated` | Click "980円で購入する" / "App Storeで購入" on `/buy` | Web SDK manual | `channel: 'stripe' \| 'ios'` |
| `purchase_completed` | Stripe webhook OR Apple IAP verifier confirms | Server | `user_id`, `email_hash`, `channel`, `amount`, `currency`, `session_id` or `transaction_id` |
| `purchase_failed` | Webhook reports a non-success terminal state | Server | `channel`, `reason` (PII-free) |

**User properties set:** `email_hash`, `first_seen_at`, `purchased_at`, `purchase_channel`.

## Data Flow

### Web (browser → PostHog)
```
Browser ── posthog-js SDK ──> PostHog Cloud EU
  - autocapture: $pageview
  - manual capture: lp_cta_clicked, login_email_submitted, purchase_initiated
  - DNT honored before init
  - is_ios_app property injected via a UA-based hook
```

### Server-side (Cloudflare Workers → PostHog)
```
/api/stripe/webhook
  └─► resolve user, compute email_hash
  └─► capture("purchase_completed" | "purchase_failed", { channel: "stripe", ... })

/api/apple/iap/verify
  └─► capture("purchase_completed", { channel: "ios", ... })

/api/apple/iap/notifications
  └─► capture("purchase_failed", { channel: "ios", reason }) on REFUND / REVOKE / EXPIRED

/api/auth/verify
  └─► capture("login_completed", { user_id, is_new_user })
```

All server-side captures are fire-and-forget POST to `https://eu.i.posthog.com/i/v0/capture/` with `AbortController` 1-second timeout. Failures are logged but never propagate.

### iOS WKWebView
- The same Web SDK runs inside the WKWebView (no native SDK)
- WebView UA contains the iOS app token → all client events tagged with `is_ios_app: true` automatically
- The authoritative purchase event for iOS originates server-side from the IAP verifier — no native client work needed

## Files

### New
- `src/lib/analytics.ts` — Client wrapper around `posthog-js`: `init()`, `identify()`, `capture()`, `optedOut()` (DNT detection), UA-based `is_ios_app` injection
- `src/lib/analytics-server.ts` — Server-side `capture()` (fetch to PostHog ingestion endpoint; fire-and-forget; timeout-bounded)
- `src/lib/email-hash.ts` — `hashEmailForAnalytics(email): Promise<string>` (SHA-256 of `trim().toLowerCase()`, hex output)
- `src/components/PostHogProvider.tsx` — React provider; initialized in `app/layout.tsx`; runs DNT check
- `tests/lib/analytics-server.test.ts` — Server capture wrapper test
- `tests/lib/email-hash.test.ts` — Normalization + determinism test
- `tests/analytics/instrumentation.test.ts` — Static regression test asserting each modified route/page contains its expected `capture()` call

### Modified
- `src/app/layout.tsx` — Wrap children in `<PostHogProvider>`
- `src/app/page.tsx` — Capture `lp_cta_clicked` on CTA click
- `src/app/login/page.tsx` — Capture `login_email_submitted` on submit
- `src/app/buy/BuyPageClient.tsx` — Capture `purchase_initiated` before Stripe redirect / iOS bridge
- `src/app/api/auth/verify/route.ts` — Capture `login_completed`
- `src/app/api/stripe/webhook/route.ts` — Capture `purchase_completed` / `purchase_failed`
- `src/app/api/apple/iap/verify/route.ts` — Capture `purchase_completed` (channel: `"ios"`)
- `src/app/api/apple/iap/notifications/route.ts` — Capture `purchase_failed` on REFUND / REVOKE / EXPIRED
- `src/app/privacy/page.tsx` — Add "外部解析ツール" section (PostHog, EU storage, opt-out, hashed identifiers, ATT non-requirement)
- `.env.example` — Add PostHog env vars
- `wrangler.toml` — Wire env vars / secrets for production
- `package.json` — Add `posthog-js` dependency

## Environment Variables

| Name | Visibility | Used by |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_HOST` | client | `analytics.ts` init |
| `NEXT_PUBLIC_POSTHOG_KEY` | client | `analytics.ts` init (project API key — safe to embed publicly) |
| `POSTHOG_HOST` | server | `analytics-server.ts` |
| `POSTHOG_PROJECT_API_KEY` | server | `analytics-server.ts` (same value as the public key — reused) |

## Dashboards (v1)

Built in the PostHog UI (no code). Saved as a "Pre-Launch" dashboard collection.

### 1. Conversion Funnel
Funnel steps:
1. `$pageview` where `$current_url` matches `/$`
2. `lp_cta_clicked`
3. `$pageview` where `$current_url` matches `/buy`
4. `purchase_initiated`
5. `purchase_completed`

Default breakdown: by `$referrer`. Saved alternates: `utm_source`, `is_ios_app`, `$geoip_country_name`.

### 2. Daily Summary
Time-series: daily count of `$pageview`, `login_completed`, `purchase_completed`. Compare last 7d and 30d.

### 3. Channel Comparison
Side-by-side: `purchase_channel=stripe` vs `purchase_channel=ios`. Metrics: purchase count, average days from first `$pageview` to `purchase_completed`.

## Verification Plan

### Pre-launch (sequential)
1. **Local dev (localhost):**
   - `npm run dev` with test PostHog project keys
   - Manual walkthrough: LP → click CTA → `/login` → `/buy` → Stripe test purchase
   - PostHog "Live Events" shows every taxonomy event within 5 seconds
2. **DNT verification:** Same walkthrough with browser DNT enabled. No events arrive.
3. **iOS Simulator:** App pointed at localhost. Walkthrough via the WKWebView. Events arrive with `is_ios_app=true`.
4. **Staging:** Deploy to Cloudflare Workers staging env with staging PostHog project. Repeat step 1 in the staging context.

### Automated tests (Vitest)
- `email-hash.test.ts` — Deterministic SHA-256 output; normalization handles whitespace and case
- `analytics-server.test.ts` — Capture wrapper builds correct payload; on fetch failure, does not throw and returns gracefully (fire-and-forget contract)
- `instrumentation.test.ts` — Static source-text regression asserting each modified file contains its expected capture call (same pattern as the existing `tests/security/email-input-at-sign.test.ts`)

## Phased Rollout

| Phase | Duration | Work |
|---|---|---|
| 1 | 1–2 days | PostHog project signup + Web SDK install + LP/buy client capture |
| 2 | 1–2 days | Server-side capture from Stripe webhook + Apple IAP verifier + auth verify |
| 3 | 1 day | Email hashing utility + Privacy Policy update |
| 4 | 1 day | Build 3 dashboards in PostHog UI + verification walkthroughs |
| 5 | 1 day (overlaps with launch) | Production deploy + 3-day observation window |

**Total: 5–7 working days**

## Cost

**$0 / month at v1 scale.** Projected ~150K events/month. PostHog free tier: 1M events/month, 1M feature-flag requests/month. Comfortable margin.

## Error Handling

- **Client SDK:** PostHog SDK auto-buffers and retries. App functionality is fully decoupled from PostHog availability.
- **Server capture:** `fetch()` with `AbortController` 1-second timeout. Failures are logged via Workers logger but never propagate. No business logic depends on capture success.
- **DNT:** Checked at init time. If `navigator.doNotTrack === '1'`, `posthog.init()` is not called and all `capture()` calls become no-ops.
- **PostHog outage:** Documented graceful failure mode — client SDK queues events for replay; server captures lose events silently (acceptable per fire-and-forget design).

## Self-Review (inline checks)

- ✅ **Placeholders:** No TBD/TODO/vague items remain
- ✅ **Internal consistency:** Session Replay disabled across every section; email-hashing applied wherever email reaches PostHog
- ✅ **Scope:** Single coherent v1 plan; B/C/D/E explicitly deferred
- ✅ **Ambiguity:** API endpoints verified against `find src/app/api`; env var naming follows Next.js public/private convention; PostHog ingestion URL is the cloud capture endpoint

## Open follow-ups (post-v1)

- B (Feedback): a `mailto:` button on `/profile` plus a minimal in-app form
- C (Review prompts): SKStoreReviewController fired after N successful drills, gated on a PostHog feature flag
- D (Pricing): consolidate the hardcoded `980` price across `/`, `/buy`, `/legal/tokusho` into a single config; later integrate PostHog feature flags for price experiments
- E (UI/UX polish): prioritized using funnel drop-off data from this baseline
