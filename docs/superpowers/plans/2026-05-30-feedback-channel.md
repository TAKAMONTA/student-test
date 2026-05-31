# Feedback Channel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "サポート" card with a `mailto:` button to `/profile` so paying users can send feedback to `admin@takaapps.com` in one tap, firing a `feedback_initiated` analytics event on click.

**Architecture:** Pure client-side change in `src/app/(app)/profile/page.tsx`. Build a pre-templated `mailto:` URL using the existing `SUPPORT_EMAIL` constant from `@/app/legal-data`. Render a single `<a href={mailtoUrl}>` styled as a button. On click, fire `capture("feedback_initiated", { source: "profile" })` via the existing analytics wrapper from subproject A. No new API surface, no server code, no privacy-policy changes.

**Tech Stack:** Next.js 16 App Router (`"use client"` component), TypeScript, the existing `@/lib/analytics` `capture()` wrapper, `@/app/legal-data` `SUPPORT_EMAIL` constant, Vitest source-text regression.

**Reference spec:** `docs/superpowers/specs/2026-05-30-feedback-channel-design.md`

---

## File Map

**Modified:**
- `src/app/(app)/profile/page.tsx` — Add imports, build mailto URL, add `onClick` handler, render new "サポート" card between the 購入情報 card and the ログアウト button (~30 lines added)
- `tests/analytics/instrumentation.test.ts` — Add one source-text regression `it` block asserting the profile page contains `mailto:`, `SUPPORT_EMAIL`, and `"feedback_initiated"` (~6 lines added)

**Not modified:** No new files. No API routes. No env vars. No privacy-policy text. No wrangler.jsonc.

---

## Task 1: Profile feedback card with mailto and analytics

**Files:**
- Modify: `src/app/(app)/profile/page.tsx`
- Modify: `tests/analytics/instrumentation.test.ts`

### Step 1: Write the failing regression test

Open `tests/analytics/instrumentation.test.ts`. Inside the existing `describe("analytics instrumentation", () => { ... })` block, add this new `it` block (place it after the existing "app layout mounts PostHogIdentify" test, before the closing `})` of the describe block):

```ts
  it("profile page provides feedback channel via mailto with analytics", () => {
    const text = source("src/app/(app)/profile/page.tsx");
    expect(text).toContain("mailto:");
    expect(text).toContain("SUPPORT_EMAIL");
    expect(text).toContain('"feedback_initiated"');
  });
```

### Step 2: Run the test, verify it fails

Run: `npm test -- tests/analytics/instrumentation.test.ts`

Expected: 1 test fails ("profile page provides feedback channel via mailto with analytics") because `src/app/(app)/profile/page.tsx` does not yet contain `mailto:`, `SUPPORT_EMAIL`, or `"feedback_initiated"`. The other 11 tests in the file should still pass.

### Step 3: Add imports to the profile page

Open `src/app/(app)/profile/page.tsx`. The current imports block (lines 1–5) is:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
```

Add two new imports below, grouped after `useRouter`:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SUPPORT_EMAIL } from "@/app/legal-data";
import { capture } from "@/lib/analytics";
```

### Step 4: Add mailto URL builder and click handler inside the component

In `src/app/(app)/profile/page.tsx`, find the `handleSave` function inside `export default function ProfilePage()`. After the closing `}` of `handleSave` and before the `if (!profile) { return ... }` early-return block, insert:

```tsx
  const feedbackSubject = encodeURIComponent("【中1テストキット】ご意見・不具合報告");
  const feedbackBody = encodeURIComponent(
    [
      "以下のテンプレートに沿ってお書きください。",
      "",
      "【ご意見または不具合の内容】",
      "",
      "",
      "【不具合の場合、再現手順】",
      "",
      "",
      "【ご利用環境】",
      "・端末（iPhone / Android / PC など）:",
      "・ブラウザ / アプリ:",
      "",
    ].join("\n"),
  );
  const feedbackMailto = `mailto:${SUPPORT_EMAIL}?subject=${feedbackSubject}&body=${feedbackBody}`;

  function handleFeedbackClick() {
    capture("feedback_initiated", { source: "profile" });
  }
```

### Step 5: Render the new "サポート" card

In `src/app/(app)/profile/page.tsx`, find the existing 購入情報 card. The current JSX block is:

```tsx
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-sm">
        <h2 className="font-bold text-slate-800">購入情報</h2>
        <div className="flex justify-between text-slate-600">
          <span>購入日</span>
          <span>{purchasedDate}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>利用期限</span>
          <span>無期限</span>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleLogout}
          ...
```

Insert the new サポート card BETWEEN the closing `</div>` of the 購入情報 card and the `<div className="mt-8">` that wraps the ログアウト button. The result should look like:

```tsx
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-sm">
        <h2 className="font-bold text-slate-800">購入情報</h2>
        <div className="flex justify-between text-slate-600">
          <span>購入日</span>
          <span>{purchasedDate}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>利用期限</span>
          <span>無期限</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-sm mt-5">
        <h2 className="font-bold text-slate-800">サポート</h2>
        <p className="text-xs text-slate-500 leading-5">
          返信は {SUPPORT_EMAIL} から数日以内にお送りします。
        </p>
        <a
          href={feedbackMailto}
          onClick={handleFeedbackClick}
          className="block w-full bg-indigo-50 text-indigo-700 font-medium py-3 rounded-xl text-center hover:bg-indigo-100 transition-colors"
        >
          ご意見・不具合報告をメールで送る
        </a>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleLogout}
          ...
```

### Step 6: Run the targeted regression test, verify it passes

Run: `npm test -- tests/analytics/instrumentation.test.ts`

Expected: all 12 tests pass (the previously failing one now passes; the existing 11 still pass).

### Step 7: Run full suite + typecheck

Run:
```
npx tsc --noEmit
npm test
```

Expected:
- `tsc --noEmit` exit 0
- `npm test` → 103 tests / 29 files passing (102 prior baseline + 1 new regression)

### Step 8: Commit

```bash
git add "src/app/(app)/profile/page.tsx" tests/analytics/instrumentation.test.ts
git commit -m "feat: add feedback mailto on profile with feedback_initiated event"
```

---

## Self-Review

**1. Spec coverage:**

| Spec section | Plan task |
|---|---|
| Goal (low-friction feedback via mailto:) | Steps 3-5 |
| UI placement (between 購入情報 and ログアウト) | Step 5 |
| mailto: subject/body templates | Step 4 (exact strings included) |
| Analytics `feedback_initiated` event | Step 4 (handler), Step 1 (test asserts the string) |
| Source-text regression test | Step 1 |
| No new API / no privacy-policy update | (correctly not mentioned in any task) |
| `SUPPORT_EMAIL` reused (not hardcoded) | Step 3 import + Step 4 URL build |

All spec requirements map to specific steps. No gaps.

**2. Placeholder scan:** No TBD/TODO/vague items. Every code block shows the exact patch. Every command shows the expected output. No "similar to" references.

**3. Type consistency:**
- `SUPPORT_EMAIL` is `string` (from `legal-data.ts` line 7: `export const SUPPORT_EMAIL = "admin@takaapps.com";`).
- `capture(event: string, properties?: Record<string, unknown>): void` is the signature from `src/lib/analytics.ts`. The call `capture("feedback_initiated", { source: "profile" })` matches.
- `encodeURIComponent: (uriComponent: string | number | boolean) => string` is a built-in. Used on plain strings.
- The `<a href={...} onClick={...}>` JSX uses standard React HTMLAnchorElement props. No type issues.

All consistent.
