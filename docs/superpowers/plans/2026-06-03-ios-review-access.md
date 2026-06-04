# iOS App Review Access (Demo Login) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secret-gated demo login on `/login` (reusing `/api/auth/test-login`) so an Apple reviewer can access the paid experience without an email round-trip, and rate-limit the endpoint against brute force.

**Architecture:** Reuse the existing `/api/auth/test-login` endpoint (gated by `ENABLE_TEST_LOGIN` + `TEST_LOGIN_SECRET` + email allowlist, issues a session cookie directly). Add an IP rate limit to it. Add an unobtrusive collapsible review-login form on `/login` that POSTs to it. No new auth path; magic-link flow untouched.

**Tech Stack:** Next.js 16 App Router (Cloudflare Workers via OpenNext), React, TypeScript, Drizzle/D1, Vitest.

**Reference spec:** `docs/superpowers/specs/2026-06-03-ios-review-access-design.md`

---

## File Map

**Modified:**
- `src/app/api/auth/test-login/route.ts` — add IP rate limiting
- `src/app/login/page.tsx` — add the collapsible demo/review login form

**New:**
- `tests/security/review-login.test.ts` — structural regression tests

---

## Task 1: Rate-limit `/api/auth/test-login`

**Files:**
- Modify: `src/app/api/auth/test-login/route.ts`
- Create: `tests/security/review-login.test.ts`

The current handler imports `NextRequest, NextResponse`, `eq`, `nanoid`, `z`, `getDb`, `users`, `sessionCookieOptions`, `signSessionToken`. It: (1) 404s unless `ENABLE_TEST_LOGIN === "true"`; (2) reads `TEST_LOGIN_SECRET` + `JWT_SECRET` (500 if missing); (3) parses `{ email, secret }`; (4) rejects if `secret !== testSecret`; (5) allowlist-checks email; (6) creates/finds user; (7) signs session + sets cookie.

- [ ] **Step 1: Write the failing structural test**

Create `tests/security/review-login.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("test-login endpoint hardening", () => {
  const route = () => source("src/app/api/auth/test-login/route.ts");

  it("keeps the ENABLE_TEST_LOGIN gate and secret check", () => {
    const text = route();
    expect(text).toContain('process.env["ENABLE_TEST_LOGIN"]');
    expect(text).toContain("secret !== testSecret");
  });

  it("rate-limits by IP via the shared rate-limit helper", () => {
    const text = route();
    expect(text).toContain("getClientIp");
    expect(text).toContain("reserveRateLimits");
    expect(text).toContain("testlogin_ip:");
  });
});
```

- [ ] **Step 2: Run the test, verify the rate-limit assertions fail**

Run: `npm test -- tests/security/review-login.test.ts`
Expected: FAIL — the rate-limit assertions fail (no `getClientIp`/`reserveRateLimits`/`testlogin_ip:` in the route yet). The gate/secret assertions pass.

- [ ] **Step 3: Add the rate limit to the route**

In `src/app/api/auth/test-login/route.ts`, add this import (new line, grouped with the other `@/lib/...` imports):

```ts
import { getClientIp, reserveRateLimits } from "@/lib/rate-limit";
```

Then, inside `POST`, AFTER the `testSecret`/`jwtSecret` presence check (the block returning 500 if missing) and BEFORE `const parsed = bodySchema.safeParse(...)`, insert:

```ts
  const ip = getClientIp(req.headers);
  const rateLimit = await reserveRateLimits(
    getDb(),
    [{ key: `testlogin_ip:${ip}`, limit: 10 }],
    60 * 60,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
```

(`getDb` is already imported. This throttles to 10 attempts/hour/IP before the secret comparison, bounding brute force.)

- [ ] **Step 4: Run the test, verify it passes**

Run: `npm test -- tests/security/review-login.test.ts`
Expected: PASS (the `test-login endpoint hardening` describe — 2 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/auth/test-login/route.ts tests/security/review-login.test.ts
git commit -m "feat: rate-limit test-login endpoint against brute force"
```

---

## Task 2: Add the demo/review login form to `/login`

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `tests/security/review-login.test.ts` (append login-page assertions)

The current `LoginPage` is a `"use client"` component with state `email/sent/loading/error`, a `handleSubmit` that POSTs to `/api/auth/send`, and renders (inside `<div className="w-full max-w-sm">`) a header then `{sent ? <green box> : <form>...EmailInput...</form>}`.

- [ ] **Step 1: Add review-form state + handler**

In `src/app/login/page.tsx`, add four state hooks after the existing `const [error, setError] = useState("");`:

```tsx
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewCode, setReviewCode] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
```

Add this handler after `handleSubmit`:

```tsx
  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError("");
    try {
      const res = await fetch("/api/auth/test-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: reviewEmail, secret: reviewCode }),
      });
      if (res.ok) {
        window.location.href = "/home";
      } else {
        setReviewError("ログインできませんでした");
      }
    } catch {
      setReviewError("通信エラーが発生しました");
    } finally {
      setReviewLoading(false);
    }
  }
```

- [ ] **Step 2: Render the collapsible form**

Insert this block immediately AFTER the closing `)}` of the `{sent ? (...) : (...)}` expression and BEFORE the closing `</div>` of `<div className="w-full max-w-sm">`:

```tsx
        <details className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-600">
            審査・デモ用ログイン
          </summary>
          <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
            <input
              type="email"
              value={reviewEmail}
              onChange={(e) => setReviewEmail(e.target.value)}
              placeholder="デモ用メールアドレス"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
            <input
              type="text"
              value={reviewCode}
              onChange={(e) => setReviewCode(e.target.value)}
              placeholder="審査コード"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
            <button
              type="submit"
              disabled={reviewLoading || !reviewEmail || !reviewCode}
              className="w-full bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              {reviewLoading ? "ログイン中…" : "ログイン"}
            </button>
          </form>
        </details>
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Append login-page assertions to the test**

Append to `tests/security/review-login.test.ts`:

```ts
describe("login page review form", () => {
  const page = () => source("src/app/login/page.tsx");

  it("renders the demo/review login form posting to test-login", () => {
    const text = page();
    expect(text).toContain("審査・デモ用ログイン");
    expect(text).toContain("/api/auth/test-login");
    expect(text).toContain("reviewCode");
  });

  it("does not disturb the magic-link form", () => {
    const text = page();
    expect(text).toContain("<EmailInput");
    expect(text).toContain("/api/auth/send");
    expect(text).not.toContain("pr-16");
  });
});
```

- [ ] **Step 5: Run the review-login test + the existing email-input guard**

Run:
```bash
npm test -- tests/security/review-login.test.ts
npm test -- tests/security/email-input-at-sign.test.ts
```
Expected: review-login → 4 tests pass (2 from Task 1 + 2 here); email-input-at-sign → still 1 passed (unchanged).

- [ ] **Step 6: Full suite + build**

Run:
```bash
npm test
npx tsc --noEmit
npm run build
```
Expected: prior suite (127) + new review-login tests pass; tsc exit 0; build compiles all routes.

- [ ] **Step 7: Commit**

```bash
git add src/app/login/page.tsx tests/security/review-login.test.ts
git commit -m "feat: add demo/review login form on /login for App Review access"
```

---

## Self-Review

**1. Spec coverage:**
- `/login` collapsible review form (email + code → test-login → /home) → Task 2 ✓
- `<details>審査・デモ用ログイン`, posts `{ email, secret }` to `/api/auth/test-login` → Task 2 Steps 1-2 ✓
- Magic-link form / EmailInput untouched, no `pr-16` → Task 2 Step 2 + Step 4 guard ✓
- test-login IP rate limit via `reserveRateLimits`/`getClientIp`, key `testlogin_ip:`, 10/hr, 429 → Task 1 Step 3 ✓
- ENABLE_TEST_LOGIN gate + secret check preserved (regression guard) → Task 1 Step 1 ✓
- Tests structural, email-input-at-sign stays green → Tasks 1 & 2 ✓
- Manual ops (env, demo account purchased, ASC notes, disable after approval) → spec "Operational steps"; NOT in code, correctly excluded ✓

**2. Placeholder scan:** No TBD/TODO/vague items. Every code step shows the exact insertion.

**3. Type consistency:** `reviewEmail`/`reviewCode`/`reviewError`/`reviewLoading` defined in Task 2 Step 1, used in Steps 1-2. `handleReviewSubmit` posts `{ email: reviewEmail, secret: reviewCode }` matching the route's `bodySchema = { email, secret }`. `getClientIp`/`reserveRateLimits` match `@/lib/rate-limit` usage in `/api/auth/send` (`reserveRateLimits(db, [{key, limit}], ttlSeconds)` → `{ allowed }`). Redirect `/home` matches the purchased-demo-account flow.
