# App Store Review Prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fire `SKStoreReviewController.requestReview(in:)` on the iOS app when a user finishes a mock exam, and emit a `review_prompt_requested` PostHog event from the Web side regardless of platform.

**Architecture:** A small TypeScript helper `requestStoreReview()` posts an empty message to `window.webkit.messageHandlers.review` if available (iOS WKWebView only — no-op on web). On iOS, a new `WKScriptMessageHandler` registered under `name: "review"` routes to a static `StoreReviewController.request()` helper that resolves the active `UIWindowScene` and calls `SKStoreReviewController.requestReview(in: scene)`. The mock-exam page fires both the analytics event and the helper exactly once when `phase === "done"`, guarded by a `useRef` flag.

**Tech Stack:** TypeScript (Web), Swift / StoreKit / WebKit (iOS), Vitest (Web tests), XCTest (Swift tests), existing `@/lib/analytics` `capture()` wrapper from subproject A.

**Reference spec:** `docs/superpowers/specs/2026-05-30-review-prompt-design.md`

---

## File Map

**New:**
- `src/lib/store-review.ts` — `requestStoreReview()` that bridges to iOS or no-ops on web (~12 lines)
- `tests/lib/store-review.test.ts` — Vitest unit tests for no-op + postMessage paths (~40 lines)
- `ios/Chu1TestKit/StoreReviewController.swift` — Static helper that resolves the active `UIWindowScene` and calls Apple's API (~25 lines)
- `ios/Chu1TestKitTests/StoreReviewBridgeTests.swift` — XCTest verifying `Coordinator` routes `review` messages to the injected handler (~30 lines)

**Modified:**
- `ios/Chu1TestKit/AppWebView.swift` — Register `name: "review"` handler; add optional `onReviewRequested` injection point on `Coordinator`; switch on `message.name` (~15 lines added)
- `src/app/(app)/mock-exam/page.tsx` — Add `useRef` one-shot guard + `useEffect` that fires `capture()` + `requestStoreReview()` when `phase === "done"` (~20 lines added)
- `tests/analytics/instrumentation.test.ts` — Add one source-text regression assertion (~7 lines)

**Not modified:** No API routes, no D1 schema, no env vars, no `wrangler.jsonc`, no privacy policy, no `IAPBridgeMessage` (review bridge has its own path).

---

## Task 1: Web `requestStoreReview()` helper + Vitest unit tests

**Files:**
- Create: `src/lib/store-review.ts`
- Create: `tests/lib/store-review.test.ts`

### Step 1: Write the failing tests

Create `tests/lib/store-review.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("requestStoreReview", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns silently when window is undefined (SSR)", async () => {
    vi.stubGlobal("window", undefined);
    const { requestStoreReview } = await import("@/lib/store-review");
    expect(() => requestStoreReview()).not.toThrow();
  });

  it("returns silently when the iOS review bridge is missing", async () => {
    vi.stubGlobal("window", { webkit: { messageHandlers: {} } });
    const { requestStoreReview } = await import("@/lib/store-review");
    expect(() => requestStoreReview()).not.toThrow();
  });

  it("posts an empty message to the iOS review bridge when available", async () => {
    const postMessage = vi.fn();
    vi.stubGlobal("window", {
      webkit: {
        messageHandlers: {
          review: { postMessage },
        },
      },
    });
    const { requestStoreReview } = await import("@/lib/store-review");
    requestStoreReview();
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({});
  });
});
```

### Step 2: Run the test, verify it fails

Run: `npm test -- tests/lib/store-review.test.ts`
Expected: FAIL — module `@/lib/store-review` does not exist.

### Step 3: Implement the helper

Create `src/lib/store-review.ts`:

```ts
type ReviewBridge = { postMessage: (payload: Record<string, unknown>) => void };

type WindowWithReviewBridge = {
  webkit?: {
    messageHandlers?: {
      review?: ReviewBridge;
    };
  };
};

export function requestStoreReview(): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as WindowWithReviewBridge;
  const bridge = w.webkit?.messageHandlers?.review;
  if (!bridge) return;
  bridge.postMessage({});
}
```

### Step 4: Run the test, verify it passes

Run: `npm test -- tests/lib/store-review.test.ts`
Expected: PASS (3 tests).

### Step 5: Typecheck

Run: `npx tsc --noEmit`
Expected: exit 0.

### Step 6: Commit

```bash
git add src/lib/store-review.ts tests/lib/store-review.test.ts
git commit -m "feat: add requestStoreReview helper for iOS bridge"
```

---

## Task 2: iOS Swift bridge + StoreReviewController + XCTest

**Files:**
- Create: `ios/Chu1TestKit/StoreReviewController.swift`
- Create: `ios/Chu1TestKitTests/StoreReviewBridgeTests.swift`
- Modify: `ios/Chu1TestKit/AppWebView.swift`

### Step 1: Write the failing Swift test

Create `ios/Chu1TestKitTests/StoreReviewBridgeTests.swift`:

```swift
import XCTest
import WebKit
@testable import Chu1TestKit

final class StoreReviewBridgeTests: XCTestCase {
    func testCoordinatorInvokesReviewHandlerForReviewMessage() throws {
        let expectation = self.expectation(description: "review handler invoked")
        let model = WebViewModel(config: .production)
        let coordinator = AppWebView.Coordinator(
            model: model,
            onBridgeMessage: { _, _ in },
            onReviewRequested: {
                expectation.fulfill()
            }
        )

        let scriptMessage = TestScriptMessage(name: "review", body: [:])
        coordinator.userContentController(WKUserContentController(), didReceive: scriptMessage)

        wait(for: [expectation], timeout: 1.0)
    }

    func testCoordinatorIgnoresUnknownMessageNames() throws {
        let model = WebViewModel(config: .production)
        var reviewCalled = false
        let coordinator = AppWebView.Coordinator(
            model: model,
            onBridgeMessage: { _, _ in },
            onReviewRequested: { reviewCalled = true }
        )

        let scriptMessage = TestScriptMessage(name: "unknown", body: [:])
        coordinator.userContentController(WKUserContentController(), didReceive: scriptMessage)

        XCTAssertFalse(reviewCalled)
    }
}

/// Test double for WKScriptMessage. We cannot easily construct a real WKScriptMessage,
/// so this subclass overrides the readonly `name` and `body` to feed values into the
/// coordinator under test.
private final class TestScriptMessage: WKScriptMessage {
    private let _name: String
    private let _body: Any
    init(name: String, body: Any) {
        self._name = name
        self._body = body
        super.init()
    }
    override var name: String { _name }
    override var body: Any { _body }
}
```

### Step 2: Run the Swift test, verify it fails

Run: `xcodebuild test -project ios/Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'platform=iOS Simulator,name=iPhone 17' 2>&1 | tail -20`
Expected: FAIL — `Coordinator.init` does not accept `onReviewRequested`.

### Step 3: Implement the StoreReviewController helper

Create `ios/Chu1TestKit/StoreReviewController.swift`:

```swift
import StoreKit
import UIKit

enum StoreReviewController {
    /// Asks iOS to display the App Store review prompt. iOS enforces a ≈3-per-year
    /// quota per user and may silently no-op. The caller does not need to track
    /// frequency.
    static func request() {
        guard let scene = activeWindowScene() else { return }
        SKStoreReviewController.requestReview(in: scene)
    }

    private static func activeWindowScene() -> UIWindowScene? {
        let active = UIApplication.shared.connectedScenes.first { scene in
            scene.activationState == .foregroundActive
        }
        if let scene = active as? UIWindowScene { return scene }
        return UIApplication.shared.connectedScenes.first as? UIWindowScene
    }
}
```

### Step 4: Extend the Coordinator to route the `review` message

Modify `ios/Chu1TestKit/AppWebView.swift`. Find the current `Coordinator` class. The current implementation is:

```swift
final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
    private let model: WebViewModel
    private let onBridgeMessage: (IAPBridgeMessage, [HTTPCookie]) -> Void

    init(model: WebViewModel, onBridgeMessage: @escaping (IAPBridgeMessage, [HTTPCookie]) -> Void) {
        self.model = model
        self.onBridgeMessage = onBridgeMessage
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "iap", let bridgeMessage = IAPBridgeMessage(body: message.body) else { return }
        WKWebsiteDataStore.default().httpCookieStore.getAllCookies { cookies in
            DispatchQueue.main.async {
                self.onBridgeMessage(bridgeMessage, cookies)
            }
        }
    }
    ...
}
```

Change the `init` signature to accept an injectable `onReviewRequested` closure (defaulting to `StoreReviewController.request`), and switch on `message.name` in the handler. The full updated `Coordinator` class:

```swift
final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
    private let model: WebViewModel
    private let onBridgeMessage: (IAPBridgeMessage, [HTTPCookie]) -> Void
    private let onReviewRequested: () -> Void

    init(
        model: WebViewModel,
        onBridgeMessage: @escaping (IAPBridgeMessage, [HTTPCookie]) -> Void,
        onReviewRequested: @escaping () -> Void = { StoreReviewController.request() }
    ) {
        self.model = model
        self.onBridgeMessage = onBridgeMessage
        self.onReviewRequested = onReviewRequested
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.name {
        case "iap":
            guard let bridgeMessage = IAPBridgeMessage(body: message.body) else { return }
            WKWebsiteDataStore.default().httpCookieStore.getAllCookies { cookies in
                DispatchQueue.main.async {
                    self.onBridgeMessage(bridgeMessage, cookies)
                }
            }
        case "review":
            DispatchQueue.main.async {
                self.onReviewRequested()
            }
        default:
            break
        }
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        decisionHandler(model.canOpen(url) ? .allow : .cancel)
    }
}
```

### Step 5: Register the new script message handler in `makeUIView`

Still in `ios/Chu1TestKit/AppWebView.swift`, find `makeUIView(context:)`. The current body is:

```swift
func makeUIView(context: Context) -> WKWebView {
    let configuration = WKWebViewConfiguration()
    configuration.applicationNameForUserAgent = config.iosUserAgentToken
    configuration.websiteDataStore = .default()
    configuration.userContentController.add(context.coordinator, name: "iap")

    let webView = WKWebView(frame: .zero, configuration: configuration)
    webView.navigationDelegate = context.coordinator
    webView.load(URLRequest(url: model.currentURL))
    return webView
}
```

Add one line registering the `review` handler immediately after the `iap` registration:

```swift
func makeUIView(context: Context) -> WKWebView {
    let configuration = WKWebViewConfiguration()
    configuration.applicationNameForUserAgent = config.iosUserAgentToken
    configuration.websiteDataStore = .default()
    configuration.userContentController.add(context.coordinator, name: "iap")
    configuration.userContentController.add(context.coordinator, name: "review")

    let webView = WKWebView(frame: .zero, configuration: configuration)
    webView.navigationDelegate = context.coordinator
    webView.load(URLRequest(url: model.currentURL))
    return webView
}
```

Also update `dismantleUIView` to remove the new handler. The current body is:

```swift
static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
    webView.navigationDelegate = nil
    webView.configuration.userContentController.removeScriptMessageHandler(forName: "iap")
}
```

Update to:

```swift
static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
    webView.navigationDelegate = nil
    webView.configuration.userContentController.removeScriptMessageHandler(forName: "iap")
    webView.configuration.userContentController.removeScriptMessageHandler(forName: "review")
}
```

### Step 6: Run the Swift test, verify it passes

Run: `xcodebuild test -project ios/Chu1TestKit.xcodeproj -scheme Chu1TestKit -destination 'platform=iOS Simulator,name=iPhone 17' 2>&1 | tail -10`
Expected: TEST SUCCEEDED, 19 tests passing (17 prior + 2 new).

### Step 7: Run Web tests + typecheck (no regression)

Run:
```
npm test
npx tsc --noEmit
```
Expected: Web suite unchanged (103/29 baseline + 3 added in Task 1 = 106/30), tsc exit 0.

### Step 8: Commit

```bash
git add ios/Chu1TestKit/StoreReviewController.swift \
        ios/Chu1TestKitTests/StoreReviewBridgeTests.swift \
        ios/Chu1TestKit/AppWebView.swift
git commit -m "feat: add ios review bridge and StoreReviewController"
```

---

## Task 3: Wire mock-exam page + instrumentation regression

**Files:**
- Modify: `src/app/(app)/mock-exam/page.tsx`
- Modify: `tests/analytics/instrumentation.test.ts`

### Step 1: Write the failing regression test

Open `tests/analytics/instrumentation.test.ts`. Add this `it` block after the existing "profile page provides feedback channel" test (place it before the closing `})` of the describe block):

```ts
  it("mock exam fires review prompt on completion with analytics", () => {
    const text = source("src/app/(app)/mock-exam/page.tsx");
    expect(text).toContain("requestStoreReview");
    expect(text).toContain('"review_prompt_requested"');
    expect(text).toContain('"mock_exam_done"');
  });
```

### Step 2: Run the test, verify it fails

Run: `npm test -- tests/analytics/instrumentation.test.ts`
Expected: 1 test fails ("mock exam fires review prompt on completion with analytics"). Existing 12 tests still pass.

### Step 3: Add imports to the mock-exam page

Open `src/app/(app)/mock-exam/page.tsx`. The current imports (lines 1–4) are:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
```

Add `useEffect` and `useRef` to the React import, plus two new imports below:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { capture } from "@/lib/analytics";
import { requestStoreReview } from "@/lib/store-review";
```

### Step 4: Add the one-shot `useEffect` inside the component

Open `src/app/(app)/mock-exam/page.tsx`. Find the line that declares state hooks (the block `const [phase, setPhase] = ...` through `const [error, setError] = useState("");`). Immediately after the last state hook declaration and before the first function declaration (`async function startExam()`), add:

```tsx
  const reviewPromptFiredRef = useRef(false);

  useEffect(() => {
    if (phase !== "done") return;
    if (reviewPromptFiredRef.current) return;
    reviewPromptFiredRef.current = true;
    const score = results.filter((r) => r.isCorrect).length;
    capture("review_prompt_requested", {
      trigger: "mock_exam_done",
      scope,
      score,
      total: questions.length,
    });
    requestStoreReview();
  }, [phase, results, scope, questions.length]);
```

This must be added INSIDE the `MockExamPage` function but at the top level of the component body, NOT inside any nested function.

### Step 5: Run the targeted regression test, verify it passes

Run: `npm test -- tests/analytics/instrumentation.test.ts`
Expected: all 13 tests pass.

### Step 6: Run full suite + typecheck

Run:
```
npx tsc --noEmit
npm test
```

Expected:
- `tsc --noEmit` exit 0
- `npm test` → 107 tests / 30 files passing (103 baseline + 3 from Task 1's store-review.test.ts + 1 from this task's regression). Verify the final count matches 103 + 4 = 107.

### Step 7: Commit

```bash
git add "src/app/(app)/mock-exam/page.tsx" tests/analytics/instrumentation.test.ts
git commit -m "feat: fire review prompt and analytics on mock exam completion"
```

---

## Self-Review

**1. Spec coverage:**

| Spec section | Plan task |
|---|---|
| Goal (iOS SKStoreReview on mock-exam done) | Task 2 + Task 3 |
| Web helper `requestStoreReview()` no-op outside iOS | Task 1 |
| iOS bridge `name: "review"` + Coordinator routing | Task 2 (Steps 4-5) |
| `StoreReviewController.request()` resolving active scene | Task 2 (Step 3) |
| `useEffect` + `useRef` one-shot guard | Task 3 (Step 4) |
| `review_prompt_requested` event with `trigger/scope/score/total` | Task 3 (Step 4) |
| Source-text regression test | Task 3 (Step 1) |
| Web tests (no-op + postMessage) | Task 1 (Step 1) |
| Swift bridge test | Task 2 (Step 1) |
| `IAPBridgeMessage` untouched | (correctly absent from all tasks) |
| No new API / no privacy update | (correctly absent from all tasks) |

All spec requirements map to specific steps. No gaps.

**2. Placeholder scan:** No TBD/TODO/vague items. Every code block shows the exact patch. Every command shows the expected output. Test counts are derived from the prior baseline (103/29) + new test files.

**3. Type consistency:**
- `requestStoreReview(): void` is defined in Task 1 Step 3 and called in Task 3 Step 4. Signatures match.
- `StoreReviewController.request()` is defined in Task 2 Step 3 (no-arg, `static func`) and referenced as default in Task 2 Step 4 (`{ StoreReviewController.request() }`). Match.
- `Coordinator.init(model:onBridgeMessage:onReviewRequested:)` is the new signature in Task 2 Step 4; Task 2 Step 1 (test) constructs it with all three params. Match.
- `capture(event: string, properties?: Record<string, unknown>): void` matches the existing wrapper in subproject A; Task 3 Step 4 passes a `Record<string, unknown>`-compatible object.
- `useRef<boolean>` initialized to `false`, mutated to `true`. Standard React pattern.

All consistent.
