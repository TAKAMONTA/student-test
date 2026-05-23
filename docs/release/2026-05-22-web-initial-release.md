# Web Initial Release Checklist - 2026-05-22

## Release Target

- Product: 中1テストキット
- Public URL: https://chu1-testkit.t-nakaima.workers.dev
- Platform: Next.js on Cloudflare Workers
- Cloudflare Worker version: `213e4a8c-ea54-4cad-9b52-ad40b0288f0a`

## Completed Checks

- Production deploy completed with `npm run deploy`.
- Production build completed during deploy.
- Unit tests passed: 11 test files, 40 tests.
- Content seed validation passed: 25 topics, 201 questions.
- Public pages returned expected statuses:
  - `/`: 200
  - `/buy`: 200
  - `/login`: 200
  - `/terms`: 200
  - `/privacy`: 200
  - `/legal/tokusho`: 200
  - `/sw.js`: 200
- Protected unauthenticated APIs returned expected statuses:
  - `/api/profile`: 401
  - `/api/topics/1/questions`: 401
- Stripe Checkout session creation returned a live Checkout URL.
- Cloudflare Worker secrets are configured for Stripe, Resend, JWT, and Anthropic.

## Remaining Manual Checks

- In Stripe Dashboard, confirm webhook endpoint receives `checkout.session.completed` with a 2xx response after a real or controlled live purchase test.
- In Resend Dashboard, confirm purchase/login emails are delivered after a real email flow.
- Do a final human pass on the purchase page, legal pages, and post-login learning flow from a normal browser session.

## Release Decision

The web app is ready for initial public release, assuming the remaining manual payment/email dashboard checks pass.
