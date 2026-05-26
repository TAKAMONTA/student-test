# iOS Native Shell

Date: 2026-05-25

This release adds the native iOS shell for the App Store build: SwiftUI, WKWebView, StoreKit 2 purchase/restore, Universal Links entitlements, and the privacy manifest.

## Included

- XcodeGen-managed iOS project under `ios/`
- SwiftUI app entry and WKWebView host for `https://chu1-testkit.t-nakaima.workers.dev`
- iOS user-agent token `Chu1TestKitIOS/1`
- Associated Domains entitlement for `applinks:chu1-testkit.t-nakaima.workers.dev`
- StoreKit 2 bridge for `purchase` and `restore`
- Server verification through `/api/apple/iap/verify` with WebView session cookies
- Transaction update listener that verifies and finishes transactions after server confirmation
- Privacy manifest at `ios/Chu1TestKit/PrivacyInfo.xcprivacy`
- Local StoreKit configuration at `ios/StoreKit/Chu1TestKit.storekit`
- Debug launch environment overrides via `CHU1_APP_URL` and `CHU1_IAP_PRODUCT_ID`

## Build And Test

```bash
cd ios
xcodegen generate
xcodebuild -project Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
xcodebuild -project Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'platform=iOS Simulator,name=iPhone 17' CODE_SIGNING_ALLOWED=NO test
xcodebuild -project Chu1TestKit.xcodeproj -scheme 'Chu1TestKit Local StoreKit' -destination 'platform=iOS Simulator,name=iPhone 17' CODE_SIGNING_ALLOWED=NO build
```

## Local StoreKit Testing

Use this before App Store Connect sandbox testing when you want to check the native purchase sheet and WebView bridge locally.

1. Set the local web environment to Xcode StoreKit mode:

```bash
APPLE_BUNDLE_ID=jp.taka.chu1testkit
APPLE_IAP_PRODUCT_ID=chu1_testkit_lifetime
APPLE_APP_STORE_ENVIRONMENT=Xcode
```

`APPLE_IAP_ISSUER_ID`, `APPLE_IAP_KEY_ID`, and `APPLE_IAP_PRIVATE_KEY` can stay empty in Xcode mode because the server accepts the local StoreKit JWS payload directly.

2. Start the web app locally:

```bash
npm run dev
```

3. Open `ios/Chu1TestKit.xcodeproj` and run the `Chu1TestKit Local StoreKit` scheme on a simulator.

The local scheme uses `CHU1_APP_URL=http://localhost:3000`, `CHU1_IAP_PRODUCT_ID=chu1_testkit_lifetime`, and `ios/StoreKit/Chu1TestKit.storekit`. For a physical device, replace `CHU1_APP_URL` with a reachable Mac LAN URL or a tunneled HTTPS URL.

## App Store Connect Setup

- Bundle ID: `jp.taka.chu1testkit`
- Associated Domains: `applinks:chu1-testkit.t-nakaima.workers.dev`
- In-App Purchase type: non-consumable
- Product ID: `chu1_testkit_lifetime`
- App Store Server Notifications V2 URL: `https://chu1-testkit.t-nakaima.workers.dev/api/apple/iap/notifications`
- Sandbox tester: create at least one account for purchase and restore checks

## Manual StoreKit Sandbox Checks

Use App Store Connect sandbox after the non-consumable product is created. Set `APPLE_APP_STORE_ENVIRONMENT=Sandbox` and provide App Store Server API credentials before running these checks.

1. Log in through the iOS WebView email magic-link flow.
2. Open the buy page and tap the native purchase action.
3. Confirm the StoreKit purchase sheet completes and the WebView moves to `/home`.
4. Delete and reinstall the app, log in, then use restore.
5. Confirm restored access reaches `/home`.
6. Trigger a transaction update from StoreKit sandbox history and confirm the update listener verifies it.

## Review Notes

- Provide a demo account with unpaid state and instructions for reaching the purchase screen.
- The restore action is available from the iOS buy page through the WebView bridge.
- Web Stripe Checkout remains available only outside the native iOS app.
- The app uses WebKit for the authenticated learning experience, plus native StoreKit and Universal Links.
