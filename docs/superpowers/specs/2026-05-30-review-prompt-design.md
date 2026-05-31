# App Store Review Prompt — Design

> Subproject **C** of the 5 pre-launch monetization measures (brainstorming session 2026-05-30).
> A (analytics foundation) and B (feedback channel) are already in PR #2 and PR #3 respectively. C adds an in-app App Store review prompt fired at the user's moment of maximum satisfaction.

## Goal

Trigger iOS `SKStoreReviewController` when the user completes a mock exam, so we ask for an App Store review at the moment of maximum satisfaction. Web users are unaffected (App Store reviews have no web equivalent). Always log a `review_prompt_requested` analytics event for funnel measurement.

## Approach

When the mock exam `phase` transitions to `"done"` in `src/app/(app)/mock-exam/page.tsx`, a `useEffect` fires once (guarded by `useRef`):

1. `capture("review_prompt_requested", { trigger, scope, score, total })` — analytics signal
2. `requestStoreReview()` — a helper that posts `{}` to `webkit.messageHandlers.review` if running inside the iOS WKWebView; no-op otherwise

On iOS, the Swift `Coordinator` receives the bridge message and calls `SKStoreReviewController.requestReview(in: scene)`. Apple manages display frequency (≈3 prompts per year per user); we don't layer additional throttling.

## Scope

**In scope (v1):**
- iOS bridge `webkit.messageHandlers.review` (new `WKScriptMessageHandler` on `name: "review"`)
- Swift helper that resolves the active `UIWindowScene` and calls `SKStoreReviewController.requestReview(in:)`
- Web helper `requestStoreReview()` that is a no-op outside the iOS WKWebView
- One `useEffect` on the mock-exam done phase, gated by a one-shot `useRef`
- Analytics: new `review_prompt_requested` event with `trigger`, `scope`, `score`, `total` properties

**Out of scope (deferred):**
- Custom pre-prompt dialog ("レビューしますか？")
- Multi-trigger logic (drill streak, cumulative correct answers)
- Custom throttling table in D1 (Apple's quota is sufficient)
- Web "ぜひレビューを" banner — no App Store link makes sense for web-only users
- `AppStore.requestReview(in:)` (iOS 16+ API) — `SKStoreReviewController.requestReview(in:)` (iOS 14+) is the safer compatibility choice
- Outcome tracking (Apple does not expose whether the prompt was shown or what rating the user gave)

## Architecture Diagram

```
[User finishes mock exam]
   ↓ phase transitions to "done" in mock-exam/page.tsx
   ↓ useEffect runs (once, guarded by useRef)
   ↓
   ├─► capture("review_prompt_requested", { trigger: "mock_exam_done", scope, score, total })
   │
   └─► requestStoreReview()
         ├─ web / iOS without bridge: returns immediately (no-op)
         └─ iOS WKWebView: window.webkit.messageHandlers.review.postMessage({})
                              ↓
                       [Swift Coordinator]
                              ↓ matches message.name === "review"
                              ↓
                       StoreReviewController.request()
                              ↓ resolves active UIWindowScene
                              ↓ SKStoreReviewController.requestReview(in: scene)
                              ↓ (iOS decides display per its 3/year quota)
```

## Bridge Naming

The existing IAP bridge uses `name: "iap"` and an `IAPBridgeMessage` parser. The review bridge will use a separate `name: "review"` handler so that:
- Bridge name matches its responsibility (single semantic concept per channel)
- The existing `IAPBridgeMessage` type does not need to expand
- Future bridges (e.g. haptics, share sheet) follow the same per-feature handler pattern

The `review` message payload is intentionally empty (`{}`). No discriminator is needed because there is only one operation.

## Identification / Quota / Privacy

- **Identification:** None. We do not pass `user.id` or any PII through the bridge. The Swift side has no context about who the user is, only "show review prompt now".
- **Quota:** Apple enforces ≈3 prompts per 365 days per user, system-wide. We make no attempt to second-guess or extend this. Multiple completions of mock exams in a single year will silently no-op past Apple's quota — this is correct behavior.
- **Privacy:** No new privacy-policy disclosure needed. `SKStoreReviewController` is a native iOS API; Apple's privacy policy applies, not ours. The analytics event `review_prompt_requested` carries no PII (just trigger context).

## Event Taxonomy Addition

Adds one event to the existing PostHog taxonomy:

| Event | When | Source | Properties |
|---|---|---|---|
| `review_prompt_requested` | Mock exam `phase` transitions to `"done"` | Client (Web SDK) | `trigger: "mock_exam_done"`, `scope: "midterm" \| "final"`, `score: number`, `total: number` |

We do NOT capture a `review_prompt_shown` or `review_submitted` event because Apple intentionally does not expose those signals. We measure intent-to-prompt, not outcome.

## Files

### New
- `ios/Chu1TestKit/StoreReviewController.swift` — Static helper `request()` that resolves the active `UIWindowScene` and calls `SKStoreReviewController.requestReview(in: scene)`. ~20 lines.
- `src/lib/store-review.ts` — Single function `requestStoreReview()` that posts to `webkit.messageHandlers.review` when present and otherwise no-ops. ~12 lines.
- `tests/lib/store-review.test.ts` — Vitest unit tests for the no-op and the postMessage paths.
- `ios/Chu1TestKitTests/StoreReviewBridgeTests.swift` — Asserts that the Coordinator dispatches a `review` script message to `StoreReviewController.request()`. May require a small refactor to make `StoreReviewController.request` injectable (or test via a recorded invocation).

### Modified
- `ios/Chu1TestKit/AppWebView.swift` — Add `userContentController.add(coordinator, name: "review")` next to the existing `iap` handler; extend the `Coordinator` to switch on `message.name` and route `review` to `StoreReviewController.request()`.
- `src/app/(app)/mock-exam/page.tsx` — Add `useRef` for one-shot firing, `useEffect` that watches `phase === "done"` and (a) calls `capture("review_prompt_requested", ...)` and (b) calls `requestStoreReview()`.
- `tests/analytics/instrumentation.test.ts` — Add one source-text regression `it` block asserting the mock-exam page contains `"review_prompt_requested"` and `requestStoreReview`.

### Not modified
- No new API route, no new D1 schema, no new env vars, no new wrangler.jsonc entries, no privacy policy changes
- `IAPBridgeMessage` stays IAP-only; review bridge has its own (trivial) handler path

## Testing Strategy

**Automated (Vitest):**
- `tests/lib/store-review.test.ts`: 2 cases — (a) `requestStoreReview()` returns silently when `window.webkit?.messageHandlers?.review` is undefined, (b) calls `postMessage({})` when present (mocked).
- `tests/analytics/instrumentation.test.ts`: source-text regression that mock-exam page wires the event + helper.

**Automated (Swift / XCTest):**
- `StoreReviewBridgeTests.swift`: 1 case — when `Coordinator.userContentController(_:didReceive:)` is called with a script message of `name == "review"`, `StoreReviewController.request()` is invoked. Use a protocol seam or test-injected closure to capture the call without invoking the real Apple API.

**Manual:**
- iOS Simulator: complete a midterm mock exam → verify either (a) Apple's review sheet appears, or (b) silently no-ops because of quota. Either is success — Apple's behavior is opaque by design. Use `xcrun simctl spawn booted defaults delete jp.taka.chu1testkit` to reset SKStoreReviewController quota between local tests if needed.
- Web (any browser): complete a midterm mock exam → verify no error in console, and `review_prompt_requested` appears in PostHog Live Events (after Task 14 PostHog setup).

## Error Handling / Edge Cases

- **Web user:** `requestStoreReview()` short-circuits. The PostHog event still fires (useful for funnel: "X buyers reached the mock-exam-done state").
- **iOS user, Apple suppresses prompt (quota exhausted):** `postMessage` succeeds; Apple silently does nothing. We have no way to detect this, and that is OK.
- **iOS user, app version predates the `review` bridge:** Older app binaries that lack `name: "review"` registration would silently ignore the postMessage. The Web SDK never throws. Acceptable.
- **Rapid `phase` toggles or re-renders:** The `useRef`-based one-shot guard ensures the event fires exactly once per mock-exam completion.
- **User completes 5 mock exams back-to-back:** Each completion fires `review_prompt_requested` (intentionally — we track intent), but Apple's quota suppresses most actual prompts. Acceptable.
- **Network failure during analytics capture:** `capture()` is fire-and-forget per subproject A's wrapper. No user-visible impact.

## Rejected Alternatives

| Alternative | Rejected because |
|---|---|
| Extend the existing `iap` bridge to also handle review | Names should match responsibility; `iap` should not grow grab-bag semantics |
| Use `AppStore.requestReview(in:)` (iOS 16+ API) | `SKStoreReviewController.requestReview(in:)` (iOS 14+) covers more devices with identical behavior |
| Add our own D1-backed cooldown table | Apple already enforces a yearly quota; duplicating it is YAGNI and adds DB writes |
| Show a custom "Would you mind reviewing?" pre-prompt | Two-dialog flow feels intrusive; Apple's prompt is already polite and infrequent |
| Trigger on drill `consecutiveCorrect >= 10` as well | Apple's quota is shared across triggers; concentrating on the strongest trigger maximizes the rare prompt being well-timed |
| Fire on every page load if user has X cumulative correct answers | Spammy; violates Apple's UX guidelines on review prompt timing |
| Show a web banner linking to Google Reviews / external feedback | No purchase-flow analog for web; B (feedback channel) already covers web's needs |

## Phased Rollout

Single feature, two coordinated changes (iOS + Web). No phasing needed beyond a single PR.

1. Branch already created: `codex/review-prompt` (stacked on `codex/feedback-channel`)
2. Implement iOS bridge + Swift helper + iOS test
3. Implement Web helper + Vitest unit tests
4. Add `useEffect` to mock-exam page + instrumentation regression
5. Verify `npm test`, `npx tsc --noEmit`, and `xcodebuild test`
6. Commit, push, open PR stacked on PR #3

Estimated effort: **~2 hours** total (Swift 30 min, Web 30 min, tests 30 min, review 30 min).

## Cost

**$0.** No new infrastructure, no new third-party service, no new analytics quota impact (1 additional event per mock-exam completion is negligible).

## Self-Review (inline checks)

- ✅ **Placeholders:** No TBD/TODO/vague items remain.
- ✅ **Internal consistency:** Bridge name (`review`), event name (`review_prompt_requested`), helper name (`requestStoreReview()`), and Swift entry point (`StoreReviewController.request()`) are consistent across every section.
- ✅ **Scope:** Single feature, two coordinated changes (iOS + Web). Single implementation plan is appropriate.
- ✅ **Ambiguity:** Exact bridge handler name specified; exact event property shape specified; exact iOS API choice specified.
- ✅ **Privacy:** No PII through bridge or event; no privacy-policy update required.

## Open Follow-ups (post-v1)

- If `review_prompt_requested` count vastly exceeds App Store review count (likely — Apple quota), consider whether adding drill-streak trigger materially helps (probably not given shared quota).
- If users frequently complete mock exams without reviewing, consider adding a `feedback_initiated` follow-up CTA on the done screen (cross-link to subproject B for users who maybe weren't happy).
- If iOS 16+ becomes a hard requirement later, migrate to `AppStore.requestReview(in:)` for slightly newer API surface.
