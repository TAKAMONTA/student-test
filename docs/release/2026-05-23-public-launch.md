# Public Launch Record - 2026-05-23

## Product

- Name: 中1テストキット
- Public sales URL: https://chu1-testkit.t-nakaima.workers.dev
- Platform: Next.js on Cloudflare Workers
- Current marketing commit: `2e66856 feat: improve marketing purchase flow`
- Current deployed Worker version: `fb8c9f2a-b633-4d07-b119-e88aee9052c4`

## Launch Decision

中1テストキット is approved for public web sales on the current `workers.dev` URL.

Custom domain setup is intentionally deferred until the broader series direction is decided.

## Confirmed Production Flow

- Public landing page is live.
- Purchase page is live.
- Stripe Checkout creates a live Checkout session.
- A real production payment completed successfully.
- Success page displayed after payment.
- Stripe webhook wrote a purchase record to D1.
- Purchase mail status was recorded as `sent`.
- Purchase mail failures were `0`.
- Purchased user count increased.
- Login link worked.
- Purchased user reached onboarding/setup.
- Onboarding and learning start were confirmed by manual QA.

## Production D1 Snapshot

After the successful live payment test:

- `stripe_purchases`: 1
- purchase mail `sent`: 1
- purchase mail `failed`: 0
- `users_with_purchase`: 5

## Remaining Operational Notes

- If the payment was only for launch testing, refund it from Stripe Dashboard.
- Keep an eye on Stripe webhook deliveries and Resend delivery failures during the first sales period.
- Revisit custom domain and brand architecture after the product series direction is fixed.
