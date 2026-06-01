# iOS IAP Readiness

Date: 2026-05-24

This release prepares the Web/API layer for a future iOS App Store build.

## Included

- Apple purchase audit table via `migrations/0005_apple_iap.sql`
- StoreKit transaction verification endpoint at `/api/apple/iap/verify`
- App Store Server Notifications endpoint at `/api/apple/iap/notifications`
- Unpaid user creation through email magic-link login
- iOS WebView detection for `/buy`
- Universal Links association file for email login return

## Required Secrets

- `APPLE_TEAM_ID`
- `APPLE_BUNDLE_ID`
- `APPLE_IAP_PRODUCT_ID`
- `APPLE_APP_STORE_ENVIRONMENT`
- `APPLE_IAP_ISSUER_ID`
- `APPLE_IAP_KEY_ID`
- `APPLE_IAP_PRIVATE_KEY`

## Manual Setup

1. Create the non-consumable IAP product in App Store Connect with product ID `chu1_testkit_lifetime`.
2. Create an In-App Purchase key and store its `.p8` content in `APPLE_IAP_PRIVATE_KEY`.
3. Configure App Store Server Notifications V2 to call `/api/apple/iap/notifications`.
4. Apply `migrations/0005_apple_iap.sql` to the remote D1 database before enabling iOS purchase verification.

## Verification

```bash
npm test
npx tsc --noEmit
npm run content:check
npm run build
```

## Notes

Web Stripe Checkout remains the purchase method for browsers. The iOS native app must hide Stripe purchase copy and call StoreKit through the WebView bridge.
