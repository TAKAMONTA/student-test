# iOS Native Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 2 iOS shell for 中1テストキット: SwiftUI + WKWebView + StoreKit 2 wired to the existing Apple IAP verification API.

**Architecture:** Add an `ios/` XcodeGen-managed iOS app project. The native app hosts the production web app in `WKWebView`, appends the `Chu1TestKitIOS/1` user-agent token, handles Universal Links, receives `window.webkit.messageHandlers.iap.postMessage(...)`, runs StoreKit 2 purchase/restore/update flows, and posts verified transaction JWS values to `/api/apple/iap/verify` with the WebView session cookies. Server-side entitlement remains `users.purchased_at`.

**Tech Stack:** Xcode 26.2, SwiftUI, WebKit, StoreKit 2, XCTest, XcodeGen, existing Next.js Apple IAP API.

---

## File Structure

- Create `ios/project.yml`: XcodeGen project definition.
- Create `ios/Chu1TestKit/Chu1TestKitApp.swift`: SwiftUI entry point and Universal Link handoff.
- Create `ios/Chu1TestKit/AppConfig.swift`: app URL, bundle ID, IAP product ID, user-agent token.
- Create `ios/Chu1TestKit/WebViewModel.swift`: current web URL and navigation decisions.
- Create `ios/Chu1TestKit/AppWebView.swift`: `WKWebView` wrapper, custom UA, bridge handler.
- Create `ios/Chu1TestKit/IAPBridgeMessage.swift`: bridge payload parser.
- Create `ios/Chu1TestKit/AppleIAPVerifier.swift`: server verification request with WebView cookies.
- Create `ios/Chu1TestKit/IAPController.swift`: StoreKit product loading, purchase, restore, update listener.
- Create `ios/Chu1TestKit/ContentView.swift`: app shell UI and status alerts.
- Create `ios/Chu1TestKit/Info.plist`: app metadata.
- Create `ios/Chu1TestKit/Chu1TestKit.entitlements`: Associated Domains.
- Create `ios/Chu1TestKit/PrivacyInfo.xcprivacy`: privacy manifest.
- Create `ios/Chu1TestKit/Assets.xcassets/...`: minimal asset catalog.
- Create `ios/Chu1TestKitTests/...`: XCTest coverage for config, bridge messages, URL decisions, verifier request building.
- Modify `.gitignore`: ignore iOS derived build output while keeping source and project files.
- Modify `README.md`: add iOS build/test commands.

## Task 1: Scaffold XcodeGen iOS Project

**Files:**
- Create: `ios/project.yml`
- Create: `ios/Chu1TestKit/Info.plist`
- Create: `ios/Chu1TestKit/Assets.xcassets/Contents.json`
- Create: `ios/Chu1TestKit/Assets.xcassets/AccentColor.colorset/Contents.json`
- Create: `ios/Chu1TestKitTests/Info.plist`
- Modify: `.gitignore`

- [ ] **Step 1: Write the project definition**

Create `ios/project.yml` with app and unit-test targets:

```yaml
name: Chu1TestKit
options:
  bundleIdPrefix: jp.taka
  deploymentTarget:
    iOS: "17.0"
settings:
  base:
    MARKETING_VERSION: "1.0"
    CURRENT_PROJECT_VERSION: "1"
    SWIFT_VERSION: "5.0"
targets:
  Chu1TestKit:
    type: application
    platform: iOS
    sources:
      - Chu1TestKit
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: jp.taka.chu1testkit
        INFOPLIST_FILE: Chu1TestKit/Info.plist
        CODE_SIGN_ENTITLEMENTS: Chu1TestKit/Chu1TestKit.entitlements
        ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: AccentColor
  Chu1TestKitTests:
    type: bundle.unit-test
    platform: iOS
    sources:
      - Chu1TestKitTests
    dependencies:
      - target: Chu1TestKit
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: jp.taka.chu1testkit.tests
        INFOPLIST_FILE: Chu1TestKitTests/Info.plist
schemes:
  Chu1TestKit:
    build:
      targets:
        Chu1TestKit: all
        Chu1TestKitTests: [test]
    test:
      targets:
        - Chu1TestKitTests
```

- [ ] **Step 2: Add minimal plists and assets**

Create `ios/Chu1TestKit/Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>中1テストキット</string>
  <key>UILaunchScreen</key>
  <dict/>
</dict>
</plist>
```

Create `ios/Chu1TestKitTests/Info.plist` with an empty dictionary plist.

Create asset catalog `Contents.json` files with `{"info":{"author":"xcode","version":1}}`.

- [ ] **Step 3: Ignore derived iOS outputs**

Append to `.gitignore`:

```gitignore

# xcode
ios/.build/
ios/DerivedData/
ios/*.xcworkspace/xcuserdata/
ios/*.xcodeproj/xcuserdata/
ios/*.xcodeproj/project.xcworkspace/xcuserdata/
```

- [ ] **Step 4: Generate and inspect the Xcode project**

Run:

```bash
cd ios && xcodegen generate
xcodebuild -project Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
```

Expected: initial build fails until Swift app files are added in Task 2.

- [ ] **Step 5: Commit**

```bash
git add .gitignore ios/project.yml ios/Chu1TestKit/Info.plist ios/Chu1TestKit/Assets.xcassets ios/Chu1TestKitTests/Info.plist ios/Chu1TestKit.xcodeproj
git commit -m "chore: scaffold ios xcode project"
```

## Task 2: Add App Configuration, Entitlements, and Privacy Manifest

**Files:**
- Create: `ios/Chu1TestKit/AppConfig.swift`
- Create: `ios/Chu1TestKit/Chu1TestKit.entitlements`
- Create: `ios/Chu1TestKit/PrivacyInfo.xcprivacy`
- Test: `ios/Chu1TestKitTests/AppConfigTests.swift`

- [ ] **Step 1: Write failing config tests**

Create `ios/Chu1TestKitTests/AppConfigTests.swift`:

```swift
import XCTest
@testable import Chu1TestKit

final class AppConfigTests: XCTestCase {
    func testProductionConfigMatchesWebIAPSettings() throws {
        let config = AppConfig.production
        XCTAssertEqual(config.appURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev")
        XCTAssertEqual(config.bundleID, "jp.taka.chu1testkit")
        XCTAssertEqual(config.productID, "chu1_testkit_lifetime")
        XCTAssertEqual(config.iosUserAgentToken, "Chu1TestKitIOS/1")
    }

    func testBuildsServerEndpoint() throws {
        let endpoint = AppConfig.production.appleVerifyURL
        XCTAssertEqual(endpoint.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/api/apple/iap/verify")
    }
}
```

- [ ] **Step 2: Add `AppConfig`**

Create `ios/Chu1TestKit/AppConfig.swift`:

```swift
import Foundation

struct AppConfig: Equatable {
    let appURL: URL
    let bundleID: String
    let productID: String
    let iosUserAgentToken: String

    static let production = AppConfig(
        appURL: URL(string: "https://chu1-testkit.t-nakaima.workers.dev")!,
        bundleID: "jp.taka.chu1testkit",
        productID: "chu1_testkit_lifetime",
        iosUserAgentToken: "Chu1TestKitIOS/1"
    )

    var appleVerifyURL: URL {
        appURL.appending(path: "api/apple/iap/verify")
    }
}
```

- [ ] **Step 3: Add entitlements and privacy manifest**

Create `ios/Chu1TestKit/Chu1TestKit.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.developer.associated-domains</key>
  <array>
    <string>applinks:chu1-testkit.t-nakaima.workers.dev</string>
  </array>
</dict>
</plist>
```

Create `ios/Chu1TestKit/PrivacyInfo.xcprivacy`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyTracking</key>
  <false/>
  <key>NSPrivacyTrackingDomains</key>
  <array/>
  <key>NSPrivacyCollectedDataTypes</key>
  <array/>
  <key>NSPrivacyAccessedAPITypes</key>
  <array/>
</dict>
</plist>
```

- [ ] **Step 4: Verify**

Run:

```bash
cd ios && xcodegen generate
xcodebuild -project Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
```

Expected: build may still fail until app entry point is added in Task 3; config tests compile after Task 3.

- [ ] **Step 5: Commit**

```bash
git add ios/Chu1TestKit/AppConfig.swift ios/Chu1TestKit/Chu1TestKit.entitlements ios/Chu1TestKit/PrivacyInfo.xcprivacy ios/Chu1TestKitTests/AppConfigTests.swift ios/Chu1TestKit.xcodeproj
git commit -m "feat: add ios app configuration"
```

## Task 3: Add WebView Shell and Universal Link Handoff

**Files:**
- Create: `ios/Chu1TestKit/Chu1TestKitApp.swift`
- Create: `ios/Chu1TestKit/ContentView.swift`
- Create: `ios/Chu1TestKit/WebViewModel.swift`
- Create: `ios/Chu1TestKit/AppWebView.swift`
- Test: `ios/Chu1TestKitTests/WebViewModelTests.swift`

- [ ] **Step 1: Write failing URL decision tests**

Create `ios/Chu1TestKitTests/WebViewModelTests.swift`:

```swift
import XCTest
@testable import Chu1TestKit

@MainActor
final class WebViewModelTests: XCTestCase {
    func testStartsAtLogin() {
        let model = WebViewModel(config: .production)
        XCTAssertEqual(model.currentURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/login")
    }

    func testAcceptsUniversalLinkFromProductionHost() {
        let model = WebViewModel(config: .production)
        model.open(URL(string: "https://chu1-testkit.t-nakaima.workers.dev/api/auth/verify?token=abc")!)
        XCTAssertEqual(model.currentURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/api/auth/verify?token=abc")
    }

    func testRejectsUnexpectedUniversalLinkHost() {
        let model = WebViewModel(config: .production)
        model.open(URL(string: "https://example.com/api/auth/verify?token=abc")!)
        XCTAssertEqual(model.currentURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/login")
    }

    func testNavigatesHomeAfterPurchaseVerification() {
        let model = WebViewModel(config: .production)
        model.openHome()
        XCTAssertEqual(model.currentURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/home")
    }
}
```

- [ ] **Step 2: Add app entry and WebView model**

Implement `Chu1TestKitApp`, `ContentView`, and `WebViewModel` so the app starts at `/login`, handles `.onOpenURL`, and can navigate to `/home`.

- [ ] **Step 3: Add WKWebView wrapper**

Implement `AppWebView` with:

```swift
configuration.applicationNameForUserAgent = config.iosUserAgentToken
configuration.websiteDataStore = .default()
configuration.userContentController.add(coordinator, name: "iap")
```

Load `model.currentURL`, use `WKNavigationDelegate`, and keep navigation inside the production host.

- [ ] **Step 4: Verify**

Run:

```bash
cd ios && xcodegen generate
xcodebuild -project Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
```

Expected: build passes after app files exist.

- [ ] **Step 5: Commit**

```bash
git add ios/Chu1TestKit/Chu1TestKitApp.swift ios/Chu1TestKit/ContentView.swift ios/Chu1TestKit/WebViewModel.swift ios/Chu1TestKit/AppWebView.swift ios/Chu1TestKitTests/WebViewModelTests.swift ios/Chu1TestKit.xcodeproj
git commit -m "feat: add ios webview shell"
```

## Task 4: Add StoreKit Bridge Message Parsing

**Files:**
- Create: `ios/Chu1TestKit/IAPBridgeMessage.swift`
- Modify: `ios/Chu1TestKit/AppWebView.swift`
- Test: `ios/Chu1TestKitTests/IAPBridgeMessageTests.swift`

- [ ] **Step 1: Write failing bridge tests**

Create `IAPBridgeMessageTests.swift` to assert dictionary payloads `{ "type": "purchase" }` and `{ "type": "restore" }` parse, while unknown payloads fail.

- [ ] **Step 2: Add parser**

Create an enum:

```swift
enum IAPBridgeMessage: Equatable {
    case purchase
    case restore

    init?(body: Any) {
        guard let dict = body as? [String: Any], let type = dict["type"] as? String else { return nil }
        switch type {
        case "purchase": self = .purchase
        case "restore": self = .restore
        default: return nil
        }
    }
}
```

- [ ] **Step 3: Wire parser into WebView coordinator**

`WKScriptMessageHandler` should parse `message.body` and call `onIAPMessage(message)`.

- [ ] **Step 4: Verify and commit**

Run generic iOS build and commit:

```bash
git add ios/Chu1TestKit/IAPBridgeMessage.swift ios/Chu1TestKit/AppWebView.swift ios/Chu1TestKitTests/IAPBridgeMessageTests.swift ios/Chu1TestKit.xcodeproj
git commit -m "feat: add ios iap web bridge parser"
```

## Task 5: Add Apple IAP Server Verifier

**Files:**
- Create: `ios/Chu1TestKit/AppleIAPVerifier.swift`
- Test: `ios/Chu1TestKitTests/AppleIAPVerifierTests.swift`

- [ ] **Step 1: Write failing verifier tests**

Tests should verify request URL `/api/apple/iap/verify`, method `POST`, JSON keys `signedTransactionInfo` and `source`, and cookie header forwarding.

- [ ] **Step 2: Implement verifier**

Create `AppleIAPVerifier` with:

```swift
struct AppleIAPVerifier {
    enum Source: String, Codable {
        case purchase
        case restore
        case update
    }

    func makeRequest(signedTransactionInfo: String, source: Source, cookies: [HTTPCookie]) throws -> URLRequest
    func verify(signedTransactionInfo: String, source: Source, cookies: [HTTPCookie]) async throws -> PurchaseVerificationResponse
}
```

The request must attach `Content-Type: application/json` and a `Cookie` header built by `HTTPCookie.requestHeaderFields(with:)`.

- [ ] **Step 3: Verify and commit**

Run generic build and commit:

```bash
git add ios/Chu1TestKit/AppleIAPVerifier.swift ios/Chu1TestKitTests/AppleIAPVerifierTests.swift ios/Chu1TestKit.xcodeproj
git commit -m "feat: add ios apple iap verifier"
```

## Task 6: Add StoreKit Purchase, Restore, and Transaction Updates

**Files:**
- Create: `ios/Chu1TestKit/IAPController.swift`
- Modify: `ios/Chu1TestKit/ContentView.swift`
- Modify: `ios/Chu1TestKit/AppWebView.swift`

- [ ] **Step 1: Implement StoreKit controller**

`IAPController` must:

- Load `Product.products(for: [config.productID])`
- Start purchase with `product.purchase()`
- On `.success(.verified(transaction))`, send `transaction.jwsRepresentation` to `AppleIAPVerifier` with source `purchase`
- Restore with `AppStore.sync()` and `Transaction.currentEntitlements`
- Listen to `Transaction.updates` and verify with source `update`
- Call `await transaction.finish()` only after server verification succeeds
- Publish a user-facing status message for pending/cancelled/failure states

- [ ] **Step 2: Wire bridge actions**

`ContentView` should call `iapController.purchase()` for `.purchase` and `iapController.restore()` for `.restore`. On verification success, call `webViewModel.openHome()`.

- [ ] **Step 3: Verify and commit**

Run:

```bash
cd ios && xcodebuild -project Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
```

Commit:

```bash
git add ios/Chu1TestKit/IAPController.swift ios/Chu1TestKit/ContentView.swift ios/Chu1TestKit/AppWebView.swift ios/Chu1TestKit.xcodeproj
git commit -m "feat: add storekit purchase flow"
```

## Task 7: Add iOS Release Documentation

**Files:**
- Create: `docs/release/2026-05-25-ios-native-shell.md`
- Modify: `README.md`

- [ ] **Step 1: Document build and manual checks**

Document:

- `cd ios && xcodegen generate`
- `xcodebuild -project Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build`
- App Store Connect setup: Bundle ID, Associated Domains, Non-Consumable IAP, Sandbox tester
- Manual StoreKit sandbox checks: purchase, restore, update listener
- Review notes: demo account, IAP location, restore button

- [ ] **Step 2: Commit**

```bash
git add README.md docs/release/2026-05-25-ios-native-shell.md
git commit -m "docs: add ios native shell release notes"
```

## Task 8: Final Verification

**Files:** no code changes.

- [ ] **Step 1: Run web verification**

```bash
npm test
npx tsc --noEmit
npm run content:check
npm run build
```

- [ ] **Step 2: Run iOS project verification**

```bash
cd ios && xcodegen generate
xcodebuild -project Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
```

- [ ] **Step 3: Inspect status**

```bash
git status --short
```

Expected: only pre-existing unrelated untracked files remain.

