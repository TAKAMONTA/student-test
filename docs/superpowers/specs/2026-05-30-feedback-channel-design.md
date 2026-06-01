# Feedback Channel — Design

> Subproject **B** of the 5 pre-launch monetization measures (brainstorming session 2026-05-30).
> A is the analytics foundation (already shipped, awaiting PR #2 merge). B adds a low-friction feedback channel so we can hear from real users post-launch.

## Goal

Give paying users a low-friction way to send feedback or bug reports to `admin@takaapps.com`. The mechanism must work on the iOS WKWebView and on mobile browsers without requiring a backend or new privacy-policy disclosure.

## Approach

Single button on `/profile` (the authenticated settings page). Tapping it opens the device's default mail client with `to`, `subject`, and a templated `body` pre-filled. No server-side code, no Resend dependency for this path, no new API surface.

## Scope

**In scope (v1):**
- One "サポート" card on `/profile` with one mailto: button
- `subject` and `body` templated for actionable reports (structured headers, not free-form)
- Analytics: fire `feedback_initiated` on click via the existing `capture()` wrapper

**Out of scope (deferred):**
- In-app form (`POST /api/feedback`, Resend forwarding, rate-limiting) — only needed if mailto: proves insufficient
- Auto-injection of diagnostic info (OS, app version, browser) — would require privacy-policy update; skip until needed
- App Store review-related flows — handled in subproject C (review prompts)
- Feedback dashboard / triage tooling

## UI Placement

Inside the `(app)/profile` page, between the existing "購入情報" card and the "ログアウト" button. Visually:

```
[テスト情報 card]
[購入情報 card]
[サポート card]        ← new
[ログアウト button]
```

Rationale for this placement:
- Above the destructive "ログアウト" button → no fat-finger risk
- Below "購入情報" → user expectations: account-related info clusters together
- Not in the header nav → support is a low-frequency action; doesn't deserve top-level real estate

## mailto: Specification

```
mailto:admin@takaapps.com
?subject=【中1テストキット】ご意見・不具合報告
&body=<URL-encoded template below>
```

Body template (Japanese):

```
以下のテンプレートに沿ってお書きください。

【ご意見または不具合の内容】


【不具合の場合、再現手順】


【ご利用環境】
・端末（iPhone / Android / PC など）:
・ブラウザ / アプリ:
```

Implementation note: encode the body with `encodeURIComponent` and use `\n` line breaks. Some mail clients show `%0A` characters if line breaks aren't properly encoded.

## Analytics Tie-In

On button click, fire:

```ts
capture("feedback_initiated", { source: "profile" });
```

This event is part of the existing taxonomy from subproject A. The `source` property is forward-compatible: if we later add another feedback entry point (e.g., a header link), we can distinguish it by `source` without changing the event name.

PostHog will see this event under the authenticated user's `distinct_id` (because `identifyUser` was wired up in the analytics hotfix). The funnel can then ask questions like "what % of buyers send feedback" and "do users who send feedback retain better than those who don't".

## Files

### Modified
- `src/app/(app)/profile/page.tsx` — Add the import for `capture` and `SUPPORT_EMAIL`, build the mailto URL via a helper or inline `encodeURIComponent`, render the new card, attach the `onClick` handler
- `tests/analytics/instrumentation.test.ts` — Add a regression `it` block asserting the profile page contains `mailto:`, `SUPPORT_EMAIL` (or `admin@takaapps.com`), and `feedback_initiated`

### Not modified
- No new API route
- No new lib file
- No env vars
- No wrangler.jsonc changes
- No privacy policy update (mailto: opens the user's own mail client; nothing transmitted to us via this path beyond what the user types)

## Testing

**Automated (Vitest):**
- One source-text regression assertion in `instrumentation.test.ts` (matches the existing pattern from subproject A)

**Manual:**
- Open `/profile` in a browser → click button → mail client opens with `to`/`subject`/`body` pre-filled correctly
- Open `/profile` in iOS Simulator WKWebView → button taps through to native Mail app
- Verify `feedback_initiated` event appears in PostHog Live Events (after Task 14 PostHog setup is complete)

No unit test for the click handler is needed — the entire logic is `window.location.href = mailtoUrl; capture(...)`, which is too thin to meaningfully test in isolation.

## Error Handling / Edge Cases

- **Mail app not configured:** Some Android devices and PCs without a default mail handler will silently no-op the `mailto:` link. We cannot detect or recover from this in pure HTML — the user falls back to copying `admin@takaapps.com` from the visible card text (which we display as helper copy under the button).
- **mailto: blocked by browser policy:** Cloudflare Workers does not serve any blocking CSP; the standard browser mailto: scheme works.
- **iOS WKWebView:** `WKWebView` honors `mailto:` URLs by handing off to the Mail app (or whatever `MFMailComposeViewController`-compatible handler is registered). No special configuration needed.

## Rejected Alternatives

| Alternative | Rejected because |
|---|---|
| In-app form posting to `/api/feedback` (Resend forward) | Larger scope (API + spam protection + UI states); deferred until mailto: proves insufficient |
| Auto-inject OS/browser/app-version in mailto body | Would require privacy-policy update for diagnostic capture; YAGNI for v1 |
| Place the button in the header nav | Low-frequency action; would dilute primary navigation |
| Place the button next to "ログアウト" | Fat-finger risk on destructive action |
| Use external service (Google Form / Tally) | Domain transition + new privacy disclosure; defeats the "low-friction" goal |
| CTA copy "お問い合わせ" | "ご意見・不具合報告" is more concrete and action-oriented |

## Phased Rollout

This is a single-task implementation. No phasing needed.

1. Create branch (already on `codex/feedback-channel`)
2. Implement the change in `(app)/profile/page.tsx`
3. Add the regression test
4. Verify with `npm test` and `npx tsc --noEmit`
5. Commit, push, open PR
6. After PostHog is live (Task 14 of subproject A), confirm `feedback_initiated` events arrive

Estimated effort: 30 minutes implementation + 15 minutes review = **~45 minutes**.

## Cost

**$0.** No new infrastructure. No new external service. Email volume into `admin@takaapps.com` will be whatever real users send — expected to be low (single-digit per day at launch).

## Self-Review (inline checks)

- ✅ **Placeholders:** No TBD/TODO/vague items remain
- ✅ **Internal consistency:** mailto:-only approach is reflected in every section (Scope, Files, Testing, Edge Cases all agree)
- ✅ **Scope:** Single coherent unit, no decomposition needed
- ✅ **Ambiguity:** Exact mailto: URL template specified; exact analytics event name specified; exact file paths specified
- ✅ **Privacy:** No diagnostic auto-capture → no policy update required → no dependency on subproject A's privacy work

## Open Follow-ups (post-v1)

- If `feedback_initiated` events vastly outnumber actual emails received (mail app failures), revisit and add the in-app form as a fallback
- If feedback volume justifies it, build a triage workflow (e.g., forward to a shared inbox, tag with PostHog distinct_id for context)
- If review prompts (subproject C) launch first, consider showing the feedback button to users who left low ratings in-app — but this is C's design problem, not B's
