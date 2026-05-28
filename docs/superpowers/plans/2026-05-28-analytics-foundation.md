# Analytics Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PostHog product analytics to 中1テストキット so the conversion funnel (visit → purchase) is observable by launch, with iOS coverage via the existing WKWebView, server-side authoritative purchase events, hashed-email PII, and Session Replay disabled.

**Architecture:** Web users are instrumented via `posthog-js` (1st-party cookies, autocapture for `$pageview`, manual capture for a few signal events). The authoritative `purchase_completed` event originates **server-side** from the Stripe webhook and the Apple IAP verifier, posted to PostHog's capture endpoint via `fetch`. iOS WKWebView is automatically covered because it loads the same Next.js pages (no native iOS SDK). Email is SHA-256 hashed at the Cloudflare Workers boundary; the raw value never reaches PostHog. Session Replay is explicitly disabled. The browser `Do Not Track` header is honored.

**Tech Stack:** Next.js 16 App Router (Cloudflare Workers via OpenNext), TypeScript, `posthog-js` (client), `fetch` + Web Crypto SubtleCrypto (server), Vitest.

**Reference spec:** `docs/superpowers/specs/2026-05-28-analytics-foundation-design.md`

---

## File Map

**New:**
- `src/lib/email-hash.ts` — SHA-256 of normalized email
- `src/lib/analytics-server.ts` — Server-side capture wrapper (fetch + AbortController, fire-and-forget)
- `src/lib/analytics.ts` — Client wrapper around `posthog-js` (init, identify, capture, optedOut)
- `src/components/PostHogProvider.tsx` — React client-component provider mounted in `layout.tsx`
- `tests/lib/email-hash.test.ts`
- `tests/lib/analytics-server.test.ts`
- `tests/lib/analytics.test.ts`
- `tests/analytics/instrumentation.test.ts`

**Modified:**
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/buy/BuyPageClient.tsx`
- `src/app/api/auth/verify/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/apple/iap/verify/route.ts`
- `src/app/api/apple/iap/notifications/route.ts`
- `src/app/privacy/page.tsx`
- `src/app/legal-data.ts` (date bump)
- `wrangler.jsonc`
- `.env.example` (create if absent)
- `package.json`, `package-lock.json`

---

## Task 1: Email Hashing Utility

**Files:**
- Create: `src/lib/email-hash.ts`
- Create: `tests/lib/email-hash.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/email-hash.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { hashEmailForAnalytics } from "@/lib/email-hash";

describe("hashEmailForAnalytics", () => {
  it("returns a 64-char hex SHA-256 string", async () => {
    const result = await hashEmailForAnalytics("user@example.com");
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("normalizes by trimming whitespace and lowercasing", async () => {
    const a = await hashEmailForAnalytics("  USER@Example.COM ");
    const b = await hashEmailForAnalytics("user@example.com");
    expect(a).toBe(b);
  });

  it("is deterministic for the same input", async () => {
    const a = await hashEmailForAnalytics("user@example.com");
    const b = await hashEmailForAnalytics("user@example.com");
    expect(a).toBe(b);
  });

  it("yields different outputs for different inputs", async () => {
    const a = await hashEmailForAnalytics("user1@example.com");
    const b = await hashEmailForAnalytics("user2@example.com");
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npm test -- tests/lib/email-hash.test.ts`
Expected: FAIL — module `@/lib/email-hash` does not exist.

- [ ] **Step 3: Implement the utility**

Create `src/lib/email-hash.ts`:

```ts
export async function hashEmailForAnalytics(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npm test -- tests/lib/email-hash.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/email-hash.ts tests/lib/email-hash.test.ts
git commit -m "feat: add email hashing utility for analytics"
```

---

## Task 2: Server-Side Analytics Capture Wrapper

**Files:**
- Create: `src/lib/analytics-server.ts`
- Create: `tests/lib/analytics-server.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/analytics-server.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { captureServerEvent } from "@/lib/analytics-server";

describe("captureServerEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the expected payload to PostHog's capture endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 200 }),
    );
    await captureServerEvent({
      host: "https://eu.i.posthog.com",
      apiKey: "phc_test",
      event: "purchase_completed",
      distinctId: "user_123",
      properties: { channel: "stripe", amount: 980 },
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe("https://eu.i.posthog.com/i/v0/capture/");
    expect(init?.method).toBe("POST");
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body).toMatchObject({
      api_key: "phc_test",
      event: "purchase_completed",
      distinct_id: "user_123",
      properties: { channel: "stripe", amount: 980 },
    });
    expect(typeof body.timestamp).toBe("string");
  });

  it("swallows fetch failures (fire-and-forget contract)", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    await expect(
      captureServerEvent({
        host: "https://eu.i.posthog.com",
        apiKey: "phc_test",
        event: "purchase_completed",
        distinctId: "user_123",
        properties: {},
      }),
    ).resolves.toBeUndefined();
  });

  it("returns silently when host or apiKey is missing", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await captureServerEvent({
      host: "",
      apiKey: "",
      event: "purchase_completed",
      distinctId: "user_123",
      properties: {},
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npm test -- tests/lib/analytics-server.test.ts`
Expected: FAIL — module `@/lib/analytics-server` does not exist.

- [ ] **Step 3: Implement the wrapper**

Create `src/lib/analytics-server.ts`:

```ts
export type CaptureEventInput = {
  host: string;
  apiKey: string;
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 1_000;

export async function captureServerEvent(input: CaptureEventInput): Promise<void> {
  if (!input.host || !input.apiKey) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  const body = JSON.stringify({
    api_key: input.apiKey,
    event: input.event,
    distinct_id: input.distinctId,
    properties: input.properties ?? {},
    timestamp: new Date().toISOString(),
  });

  try {
    await fetch(`${input.host.replace(/\/+$/, "")}/i/v0/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal,
    });
  } catch (err) {
    console.warn(
      "[analytics-server] capture failed:",
      err instanceof Error ? err.message : err,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npm test -- tests/lib/analytics-server.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/analytics-server.ts tests/lib/analytics-server.test.ts
git commit -m "feat: add server-side analytics capture wrapper"
```

---

## Task 3: Add posthog-js Dependency + Env Vars

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm install)
- Create or modify: `.env.example`
- Modify: `wrangler.jsonc`

- [ ] **Step 1: Install posthog-js**

Run: `npm install posthog-js`
Expected: `package.json` gets a new entry in `dependencies` and `package-lock.json` updates. No test run yet.

- [ ] **Step 2: Add env vars to `.env.example`**

Append (or create with) the following block in `.env.example`:

```
# PostHog analytics (https://eu.i.posthog.com)
# Public (embedded in client bundle, safe):
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
NEXT_PUBLIC_POSTHOG_KEY=phc_REPLACE_WITH_PROJECT_KEY

# Server-side capture (same key value reused):
POSTHOG_HOST=https://eu.i.posthog.com
POSTHOG_PROJECT_API_KEY=phc_REPLACE_WITH_PROJECT_KEY
```

- [ ] **Step 3: Add PostHog config to `wrangler.jsonc`**

The current `vars` block is:

```jsonc
"vars": {
  "APP_URL": "https://chu1-testkit.t-nakaima.workers.dev"
}
```

Replace with:

```jsonc
"vars": {
  "APP_URL": "https://chu1-testkit.t-nakaima.workers.dev",
  "NEXT_PUBLIC_POSTHOG_HOST": "https://eu.i.posthog.com",
  "POSTHOG_HOST": "https://eu.i.posthog.com"
}
```

The two API key vars (`NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_PROJECT_API_KEY`) are set as **secrets** in production via `wrangler secret put` during Task 14 — do not commit them.

- [ ] **Step 4: Verify the install + typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0 (posthog-js ships its own types).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example wrangler.jsonc
git commit -m "chore: add posthog-js dependency and analytics env vars"
```

---

## Task 4: Client Analytics Wrapper + Provider + Layout Wire-Up

**Files:**
- Create: `src/lib/analytics.ts`
- Create: `src/components/PostHogProvider.tsx`
- Create: `tests/lib/analytics.test.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write the failing client wrapper test**

Create `tests/lib/analytics.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    register: vi.fn(),
    people: { set: vi.fn() },
  },
}));

describe("client analytics wrapper", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("isOptedOut returns true when DNT is '1'", async () => {
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    const { isOptedOut } = await import("@/lib/analytics");
    expect(isOptedOut()).toBe(true);
  });

  it("isOptedOut returns false when DNT is not set", async () => {
    vi.stubGlobal("navigator", { doNotTrack: null });
    const { isOptedOut } = await import("@/lib/analytics");
    expect(isOptedOut()).toBe(false);
  });

  it("capture is a no-op when opted out", async () => {
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    const posthog = (await import("posthog-js")).default;
    const { capture } = await import("@/lib/analytics");
    capture("test_event", { foo: "bar" });
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("capture forwards to posthog when not opted out", async () => {
    vi.stubGlobal("navigator", { doNotTrack: null, userAgent: "Mozilla/5.0" });
    vi.stubGlobal("window", {});
    const posthog = (await import("posthog-js")).default;
    const { capture } = await import("@/lib/analytics");
    capture("test_event", { foo: "bar" });
    expect(posthog.capture).toHaveBeenCalledWith("test_event", { foo: "bar" });
  });
});
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npm test -- tests/lib/analytics.test.ts`
Expected: FAIL — module `@/lib/analytics` does not exist.

- [ ] **Step 3: Implement the client wrapper**

Create `src/lib/analytics.ts`:

```ts
import posthog from "posthog-js";
import { isIosAppUserAgent } from "@/lib/ios-app";

let initialized = false;

export function isOptedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { msDoNotTrack?: string };
  const dnt = nav.doNotTrack ?? nav.msDoNotTrack;
  return dnt === "1";
}

export function initAnalytics(): void {
  if (initialized) return;
  if (typeof window === "undefined") return;
  if (isOptedOut()) return;

  const host = process.env["NEXT_PUBLIC_POSTHOG_HOST"];
  const key = process.env["NEXT_PUBLIC_POSTHOG_KEY"];
  if (!host || !key) {
    console.warn("[analytics] PostHog not configured");
    return;
  }

  posthog.init(key, {
    api_host: host,
    autocapture: true,
    capture_pageview: true,
    disable_session_recording: true,
    persistence: "localStorage+cookie",
    loaded: (ph) => {
      ph.register({
        is_ios_app: isIosAppUserAgent(navigator.userAgent),
      });
    },
  });
  initialized = true;
}

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined" || isOptedOut()) return;
  posthog.identify(userId, properties);
}

export function capture(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined" || isOptedOut()) return;
  posthog.capture(event, properties);
}

export function setUserProperties(properties: Record<string, unknown>): void {
  if (typeof window === "undefined" || isOptedOut()) return;
  posthog.people.set(properties);
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npm test -- tests/lib/analytics.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Create the React provider**

Create `src/components/PostHogProvider.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initAnalytics();
  }, []);
  return <>{children}</>;
}
```

- [ ] **Step 6: Wire the provider into the root layout**

Modify `src/app/layout.tsx`. The current file:

```tsx
import type { Metadata, Viewport } from "next";
import SwRegister from "@/components/SwRegister";
import "./globals.css";

export const metadata: Metadata = { /* ... */ };
export const viewport: Viewport = { /* ... */ };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
```

Add the import and wrap children:

```tsx
import type { Metadata, Viewport } from "next";
import PostHogProvider from "@/components/PostHogProvider";  // NEW
import SwRegister from "@/components/SwRegister";
import "./globals.css";

// metadata + viewport unchanged

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased">
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <SwRegister />
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 8: Commit**

```bash
git add src/lib/analytics.ts src/components/PostHogProvider.tsx tests/lib/analytics.test.ts src/app/layout.tsx
git commit -m "feat: add PostHog client wrapper and root provider"
```

---

## Task 5: LP CTA Capture (`lp_cta_clicked`)

**Files:**
- Modify: `src/app/page.tsx`

`src/app/page.tsx` has multiple "始める" CTAs (around lines 65 and 205 per grep). All should fire `lp_cta_clicked` with a distinguishing `cta_id`.

- [ ] **Step 1: Convert the file to a client component (if it is not already)**

Open `src/app/page.tsx`. If the first non-comment line is not `"use client";`, add it as the first line. If the file relies on server-only data, extract the CTAs into a small client component (e.g., `src/components/LandingCta.tsx`) and import it into the page. Document which approach was taken.

- [ ] **Step 2: Add the capture handler to each CTA**

Add at the top of the (client) file or component:

```tsx
import { capture } from "@/lib/analytics";
```

For each CTA element (currently rendered as `<Link href="/buy">...</Link>` or `<button>`), attach `onClick`. Example for the hero CTA:

```tsx
<Link
  href="/buy"
  onClick={() => capture("lp_cta_clicked", { cta_id: "hero", position: "above_fold" })}
  className="..."
>
  980円で始める
</Link>
```

Apply the same pattern to every "始める" CTA on the page. Use distinct `cta_id` values:
- `hero` — the above-fold primary CTA
- `pricing` — the CTA inside the pricing card
- `footer` — the final-row CTA at the bottom

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: capture lp_cta_clicked on landing-page CTAs"
```

---

## Task 6: Login Submit Capture (`login_email_submitted`)

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Add capture in `handleSubmit`**

At the top of `src/app/login/page.tsx`, add imports:

```tsx
import { capture } from "@/lib/analytics";
import { hashEmailForAnalytics } from "@/lib/email-hash";
```

Modify `handleSubmit` (currently begins at line 12). Insert two lines **after** `setError("")` and **before** the `fetch` call:

```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    const emailHash = await hashEmailForAnalytics(email);                 // NEW
    capture("login_email_submitted", { email_hash: emailHash });           // NEW
    const res = await fetch("/api/auth/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    // ... rest of handleSubmit unchanged
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Run the existing email-input test (must still pass)**

Run: `npm test -- tests/security/email-input-at-sign.test.ts`
Expected: 1 passed.

- [ ] **Step 4: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat: capture login_email_submitted on /login submit"
```

---

## Task 7: Purchase Initiated Capture (`purchase_initiated`)

**Files:**
- Modify: `src/app/buy/BuyPageClient.tsx`

The buy page has two code paths: `handlePurchase()` (Stripe, line 136-166) and `sendIosPurchaseMessage()` (iOS, line 121-134). Each should emit `purchase_initiated` with its `channel`.

- [ ] **Step 1: Add the import**

At the top of `src/app/buy/BuyPageClient.tsx`:

```tsx
import { capture } from "@/lib/analytics";
```

- [ ] **Step 2: Add capture in `handlePurchase` (Stripe path)**

Inside `handlePurchase`, **immediately before** `setLoading(true)`:

```tsx
async function handlePurchase() {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) {
    setError("メールアドレスを入力してください");
    return;
  }
  capture("purchase_initiated", { channel: "stripe" });  // NEW
  setLoading(true);
  setError("");
  // ... rest unchanged
}
```

- [ ] **Step 3: Add capture in `sendIosPurchaseMessage` (iOS path)**

Inside `sendIosPurchaseMessage`, **after** `setError("")` and **before** `postMessage`. Only fire when `type === "purchase"` (restore is not a new conversion):

```tsx
function sendIosPurchaseMessage(type: "purchase" | "restore") {
  if (!isAuthenticated) {
    setError("購入前にログインしてください。");
    return;
  }
  if (!window.webkit?.messageHandlers?.iap) {
    setError("iOSアプリ内で購入を開始できませんでした。アプリを再起動してからもう一度お試しください。");
    return;
  }
  setError("");
  if (type === "purchase") {
    capture("purchase_initiated", { channel: "ios" });  // NEW
  }
  window.webkit.messageHandlers.iap.postMessage({ type });
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/buy/BuyPageClient.tsx
git commit -m "feat: capture purchase_initiated on /buy CTAs"
```

---

## Task 8: Server-Side `login_completed`

**Files:**
- Modify: `src/app/api/auth/verify/route.ts`

- [ ] **Step 1: Add the import**

At the top of `src/app/api/auth/verify/route.ts`:

```ts
import { captureServerEvent } from "@/lib/analytics-server";
```

- [ ] **Step 2: Emit `login_completed` after session is signed**

After `signSessionToken` (line 33) and **before** building the redirect response (line 38), add:

```ts
const sessionToken = await signSessionToken({ userId: user.id, secret });

// NEW — emit server-side login_completed (fire-and-forget; never throws)
await captureServerEvent({
  host: process.env["POSTHOG_HOST"] ?? "",
  apiKey: process.env["POSTHOG_PROJECT_API_KEY"] ?? "",
  event: "login_completed",
  distinctId: user.id,
  properties: {
    has_purchased: user.purchasedAt !== null,
  },
});

const isPurchased = user.purchasedAt !== null;
const destination = isPurchased ? "/home" : "/buy";
// ... rest unchanged
```

- [ ] **Step 3: Typecheck and run tests**

Run: `npx tsc --noEmit && npm test`
Expected: exit 0, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/auth/verify/route.ts
git commit -m "feat: capture login_completed in auth verify"
```

---

## Task 9: Server-Side Purchase Events from Stripe Webhook

**Files:**
- Modify: `src/app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Add imports**

At the top of `src/app/api/stripe/webhook/route.ts`:

```ts
import { captureServerEvent } from "@/lib/analytics-server";
import { hashEmailForAnalytics } from "@/lib/email-hash";
```

- [ ] **Step 2: Emit `purchase_completed` after the user row is updated**

Locate the block at lines 165-171 (`if (user) { await db.update(stripePurchases)... }`). **After** that block and **before** the email-send block (line 173 onward), insert:

```ts
// NEW — emit purchase_completed only on the first successful delivery
if (user && !duplicateDelivery) {
  const emailHash = await hashEmailForAnalytics(user.email);
  await captureServerEvent({
    host: process.env["POSTHOG_HOST"] ?? "",
    apiKey: process.env["POSTHOG_PROJECT_API_KEY"] ?? "",
    event: "purchase_completed",
    distinctId: user.id,
    properties: {
      channel: "stripe",
      email_hash: emailHash,
      amount: session.amount_total,
      currency: session.currency,
      session_id: session.id,
      $set: {
        purchased_at: now,
        purchase_channel: "stripe",
        email_hash: emailHash,
      },
    },
  });
}
```

- [ ] **Step 3: Emit `purchase_failed` for non-paid completed sessions**

The current line 51 is `if (session.payment_status === "paid")`. Add an `else` branch:

```ts
if (session.payment_status === "paid") {
  // ... existing block unchanged
} else {
  // NEW
  await captureServerEvent({
    host: process.env["POSTHOG_HOST"] ?? "",
    apiKey: process.env["POSTHOG_PROJECT_API_KEY"] ?? "",
    event: "purchase_failed",
    distinctId: session.metadata?.["userId"] ?? `stripe_session:${session.id}`,
    properties: {
      channel: "stripe",
      reason: `payment_status:${session.payment_status ?? "unknown"}`,
    },
  });
}
```

- [ ] **Step 4: Typecheck and run tests**

Run: `npx tsc --noEmit && npm test`
Expected: exit 0, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/stripe/webhook/route.ts
git commit -m "feat: capture purchase_completed/failed in stripe webhook"
```

---

## Task 10: Server-Side `purchase_completed` from Apple IAP Verify

**Files:**
- Modify: `src/app/api/apple/iap/verify/route.ts`

- [ ] **Step 1: Add the import**

At the top of `src/app/api/apple/iap/verify/route.ts`:

```ts
import { captureServerEvent } from "@/lib/analytics-server";
```

- [ ] **Step 2: Emit `purchase_completed` after successful verification**

In the `POST` handler, the success path returns at line 117. **Before** that `return`, insert:

```ts
// NEW — only fire on fresh purchases, not restores
if (parsed.data.source === "purchase") {
  await captureServerEvent({
    host: process.env["POSTHOG_HOST"] ?? "",
    apiKey: process.env["POSTHOG_PROJECT_API_KEY"] ?? "",
    event: "purchase_completed",
    distinctId: userId,
    properties: {
      channel: "ios",
      source: parsed.data.source,
      purchased_at: result.purchasedAt.toISOString(),
      $set: {
        purchased_at: result.purchasedAt.getTime(),
        purchase_channel: "ios",
      },
    },
  });
}

return NextResponse.json({ ok: true, purchasedAt: result.purchasedAt.getTime() });
```

- [ ] **Step 3: Typecheck and run tests**

Run: `npx tsc --noEmit && npm test`
Expected: exit 0, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/apple/iap/verify/route.ts
git commit -m "feat: capture purchase_completed in apple iap verify"
```

---

## Task 11: Server-Side `purchase_failed` from Apple Notifications

**Files:**
- Modify: `src/app/api/apple/iap/notifications/route.ts`

- [ ] **Step 1: Add the import**

At the top of `src/app/api/apple/iap/notifications/route.ts`:

```ts
import { captureServerEvent } from "@/lib/analytics-server";
```

(The `applePurchases` table and `eq` from drizzle-orm are already imported.)

- [ ] **Step 2: Capture `purchase_failed` on REFUND/REVOKE**

The success path currently returns at line 57. **Before** that `return`, insert:

```ts
// NEW — on REFUND/REVOKE, emit purchase_failed so dashboards see the negative event
const failureTypes = new Set(["REFUND", "REVOKE"]);
if (failureTypes.has(notification.notificationType)) {
  const row = await db
    .select({ userId: applePurchases.userId })
    .from(applePurchases)
    .where(eq(applePurchases.transactionId, notification.transactionId))
    .get();
  if (row?.userId) {
    await captureServerEvent({
      host: process.env["POSTHOG_HOST"] ?? "",
      apiKey: process.env["POSTHOG_PROJECT_API_KEY"] ?? "",
      event: "purchase_failed",
      distinctId: row.userId,
      properties: {
        channel: "ios",
        reason: `apple_notification:${notification.notificationType}`,
        transaction_id: notification.transactionId,
      },
    });
  }
}

return NextResponse.json({ ok: true });
```

- [ ] **Step 3: Typecheck and run tests**

Run: `npx tsc --noEmit && npm test`
Expected: exit 0, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/apple/iap/notifications/route.ts
git commit -m "feat: capture purchase_failed on apple refund/revoke notifications"
```

---

## Task 12: Privacy Policy Update

**Files:**
- Modify: `src/app/privacy/page.tsx`
- Modify: `src/app/legal-data.ts`

- [ ] **Step 1: Insert a new section about analytics and renumber the rest**

In `src/app/privacy/page.tsx`, **replace** the existing §3 block (lines 33-38) with the §3 keep-as-is plus a new §4, then renumber §4 → §5, §5 → §6, §6 → §7.

Replace this:

```tsx
<section>
  <h2 className="text-lg font-bold text-slate-900">3. 外部サービス</h2>
  <p>
    決済には Stripe、メール送信には Resend、AI回答生成には Anthropic、ホスティングおよびデータ保存には Cloudflare を利用します。各サービスには、機能提供に必要な範囲で情報が送信される場合があります。
  </p>
</section>

<section>
  <h2 className="text-lg font-bold text-slate-900">4. 第三者提供</h2>
```

With:

```tsx
<section>
  <h2 className="text-lg font-bold text-slate-900">3. 外部サービス</h2>
  <p>
    決済には Stripe、メール送信には Resend、AI回答生成には Anthropic、ホスティングおよびデータ保存には Cloudflare を利用します。各サービスには、機能提供に必要な範囲で情報が送信される場合があります。
  </p>
</section>

<section>
  <h2 className="text-lg font-bold text-slate-900">4. 利用状況の集計（解析ツール）</h2>
  <p>
    サービス改善のため、PostHog Inc.（データ保管リージョン: 欧州）が提供する解析ツールを利用しています。送信される情報の例: ページ閲覧履歴、操作内容、購入の成否、リファラ情報、デバイス・ブラウザの種類。メールアドレスは送信前に当社サーバ内でハッシュ化（SHA-256）し、原文は送信しません。IPアドレスは末尾を匿名化する設定にしています。画面の録画は行いません。
  </p>
  <p className="mt-2">
    ブラウザの「Do Not Track」設定が有効な場合、解析ツールの初期化を行いません。これにより、当該端末からの計測は停止されます。
  </p>
  <p className="mt-2">
    iOSアプリは他社アプリ・サイトを横断したトラッキングを行わないため、App Tracking Transparency（ATT）の許諾要求は表示しません。
  </p>
</section>

<section>
  <h2 className="text-lg font-bold text-slate-900">5. 第三者提供</h2>
```

Then update the remaining headers:
- "4. 第三者提供" → "5. 第三者提供"
- "5. 安全管理" → "6. 安全管理"
- "6. 開示・訂正・削除" → "7. 開示・訂正・削除"

- [ ] **Step 2: Bump the legal update date**

Open `src/app/legal-data.ts` and update `LEGAL_UPDATED_AT` to `"2026-05-28"` (or today's date if executing later). Keep the existing format.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/app/privacy/page.tsx src/app/legal-data.ts
git commit -m "docs: disclose analytics tool in privacy policy"
```

---

## Task 13: Instrumentation Regression Test + Full Verification

**Files:**
- Create: `tests/analytics/instrumentation.test.ts`

A structural source-text regression test that asserts each instrumentation site contains its expected capture call. Modeled on the existing `tests/security/email-input-at-sign.test.ts`.

- [ ] **Step 1: Write the regression test**

Create `tests/analytics/instrumentation.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("analytics instrumentation", () => {
  it("layout mounts the PostHogProvider", () => {
    const text = source("src/app/layout.tsx");
    expect(text).toContain("import PostHogProvider");
    expect(text).toContain("<PostHogProvider>");
  });

  it("LP captures lp_cta_clicked", () => {
    const text = source("src/app/page.tsx");
    expect(text).toContain('"lp_cta_clicked"');
  });

  it("login captures login_email_submitted with hashed email", () => {
    const text = source("src/app/login/page.tsx");
    expect(text).toContain("hashEmailForAnalytics");
    expect(text).toContain('"login_email_submitted"');
  });

  it("buy captures purchase_initiated for both Stripe and iOS paths", () => {
    const text = source("src/app/buy/BuyPageClient.tsx");
    expect(text).toContain('"purchase_initiated"');
    expect(text).toContain('channel: "stripe"');
    expect(text).toContain('channel: "ios"');
  });

  it("auth verify captures login_completed server-side", () => {
    const text = source("src/app/api/auth/verify/route.ts");
    expect(text).toContain("captureServerEvent");
    expect(text).toContain('"login_completed"');
  });

  it("stripe webhook captures purchase_completed and purchase_failed", () => {
    const text = source("src/app/api/stripe/webhook/route.ts");
    expect(text).toContain('"purchase_completed"');
    expect(text).toContain('"purchase_failed"');
    expect(text).toContain("hashEmailForAnalytics");
  });

  it("apple iap verify captures purchase_completed", () => {
    const text = source("src/app/api/apple/iap/verify/route.ts");
    expect(text).toContain('"purchase_completed"');
    expect(text).toContain('channel: "ios"');
  });

  it("apple notifications capture purchase_failed on REFUND/REVOKE", () => {
    const text = source("src/app/api/apple/iap/notifications/route.ts");
    expect(text).toContain('"purchase_failed"');
    expect(text).toContain('"REFUND"');
    expect(text).toContain('"REVOKE"');
  });

  it("privacy policy discloses analytics", () => {
    const text = source("src/app/privacy/page.tsx");
    expect(text).toContain("PostHog");
    expect(text).toContain("Do Not Track");
    expect(text).toContain("ハッシュ化");
  });
});
```

- [ ] **Step 2: Run the regression test, verify it passes**

Run: `npm test -- tests/analytics/instrumentation.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: every previously passing test still passes; the new analytics tests pass.

- [ ] **Step 4: Final typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add tests/analytics/instrumentation.test.ts
git commit -m "test: add analytics instrumentation regression suite"
```

---

## Task 14: PostHog UI Setup (Manual)

Performed entirely in the PostHog web UI — no code changes.

- [ ] **Step 1: Create the PostHog account / project**

Go to https://eu.posthog.com — sign up or sign in. New project:
- Project name: `chu1-testkit`
- Data residency: **EU**
- Plan: Free

- [ ] **Step 2: Capture the Project API Key**

Project settings → API keys. Copy the `Project API Key` (starts with `phc_...`). This is both `NEXT_PUBLIC_POSTHOG_KEY` and `POSTHOG_PROJECT_API_KEY` for our setup.

- [ ] **Step 3: Configure the project**

Project settings:
- **IP capture / Anonymize IP**: enable (last octet masked)
- **Session Replay**: ensure it is disabled (it is by default; leave off)
- **Persistence**: cookie + localStorage (default)

- [ ] **Step 4: Set Cloudflare Workers secrets for production**

```bash
cd /Users/taka/中学一年生中間テスト対策
echo "phc_REPLACE_WITH_PROJECT_KEY" | npx wrangler secret put NEXT_PUBLIC_POSTHOG_KEY
echo "phc_REPLACE_WITH_PROJECT_KEY" | npx wrangler secret put POSTHOG_PROJECT_API_KEY
```

Replace `phc_REPLACE_WITH_PROJECT_KEY` with the actual key from Step 2.

- [ ] **Step 5: Build the 3 v1 dashboards**

PostHog UI → Dashboards → New dashboard "Pre-Launch":

**Dashboard 1 — Conversion Funnel:**
- New Funnel insight, 5 steps in order:
  1. `$pageview` where `$current_url` matches regex `/$`
  2. `lp_cta_clicked`
  3. `$pageview` where `$current_url` matches regex `/buy`
  4. `purchase_initiated`
  5. `purchase_completed`
- Save as "LP → Purchase". Pin to dashboard.

**Dashboard 2 — Daily Summary:**
- Three trends insights:
  - daily count of `$pageview`
  - daily count of `login_completed`
  - daily count of `purchase_completed`
- Compare-to: previous 7 days.

**Dashboard 3 — Channel Comparison:**
- Two insights:
  - Purchase count by `purchase_channel` (bar chart, breakdown property: `purchase_channel`)
  - Average days from first `$pageview` to `purchase_completed`, broken down by `purchase_channel`

- [ ] **Step 6: Document the project URL and dashboard URLs**

Add a private note (NOT to git) with:
- PostHog project URL
- Each dashboard URL
- API key (already in `wrangler secret` and local `.env.local`)

This task does not commit.

---

## Task 15: Pre-Launch Verification Walkthrough (Manual)

- [ ] **Step 1: Local dev walkthrough**

```bash
cd /Users/taka/中学一年生中間テスト対策
# Ensure local .env has NEXT_PUBLIC_POSTHOG_KEY and POSTHOG_PROJECT_API_KEY set to a test project
npm run dev
```

In a browser at http://localhost:3000:
1. Visit `/` → click any "始める" CTA → arrive at `/buy`
2. Open `/login`, enter `test@example.com`, click "ログインリンクを送信"
3. Open the magic-link URL (from Resend or your dev mail)
4. From the redirect, go to `/buy` and click "980円で購入する"
5. Complete the Stripe test purchase (card `4242 4242 4242 4242`)

In PostHog → Activity → Live events, verify within ~5 seconds:
- `$pageview` for `/` and `/buy`
- `lp_cta_clicked` with `cta_id`
- `login_email_submitted` with `email_hash` (64-char hex)
- `login_completed`
- `purchase_initiated` with `channel: "stripe"`
- `purchase_completed` with `channel: "stripe"`, `amount: 980`, `currency: "jpy"`

- [ ] **Step 2: DNT verification**

In Firefox, set `privacy.donottrackheader.enabled=true` (or use a browser with DNT on). Repeat Step 1's walkthrough. Verify in PostHog that **no** events are recorded for this session.

- [ ] **Step 3: iOS Simulator walkthrough**

```bash
SIMCTL_CHILD_CHU1_APP_URL=http://localhost:8787 \
  xcrun simctl launch --terminate-running-process booted jp.taka.chu1testkit
```

(Adjust the URL if your local preview uses a different port.) In the WKWebView, repeat the LP → buy → login → IAP purchase flow. Verify in PostHog that events arrive with `is_ios_app: true` and that `purchase_completed` carries `channel: "ios"`.

- [ ] **Step 4: Staging verification (optional)**

If a staging Cloudflare Workers env exists, deploy to it and rerun Step 1 against the staging URL using a separate "staging" PostHog project. If not, note for future setup.

This task does not commit; capture screenshots / notes for QA records.

---

## Task 16: Production Deploy + Observation

- [ ] **Step 1: Confirm preceding tasks are complete**

```bash
cd /Users/taka/中学一年生中間テスト対策
git log --oneline | head -20
git status -s   # expect: clean tree
npm test        # expect: full pass
npx tsc --noEmit
```

- [ ] **Step 2: Confirm production secrets are set**

```bash
npx wrangler secret list
# expect both NEXT_PUBLIC_POSTHOG_KEY and POSTHOG_PROJECT_API_KEY in the output
```

- [ ] **Step 3: Push and deploy**

```bash
git push -u origin codex/ios-web-iap-readiness
npm run deploy
```

- [ ] **Step 4: Smoke test on production**

```bash
curl -s -o /dev/null -w "lp: %{http_code}\n" https://chu1-testkit.t-nakaima.workers.dev/
curl -s -o /dev/null -w "buy: %{http_code}\n" https://chu1-testkit.t-nakaima.workers.dev/buy
```

Then visit the LP in a fresh browser and confirm a `$pageview` arrives in PostHog Live Events.

- [ ] **Step 5: Three-day observation window**

For three days after launch, check the Conversion Funnel dashboard daily. Watch for:
- Funnel step counts increasing as expected
- No abnormal drop between `purchase_initiated` and `purchase_completed` (a large gap suggests a Stripe webhook issue)
- Server-side `purchase_completed` count matches the count in D1 `stripe_purchases` / `apple_purchases` tables

Record any anomalies as follow-up issues.

This task does not commit.

---

## Self-Review

**1. Spec coverage:** Each section of `docs/superpowers/specs/2026-05-28-analytics-foundation-design.md` maps to one or more tasks:
- Goal / Scope / Tool selection → Tasks 1-13 collectively
- Privacy Stance → Tasks 1, 4, 9, 12
- Identification Strategy → Tasks 4, 8-10
- Event Taxonomy → Tasks 5-11
- Data Flow → Tasks 4, 8-11
- Files (New / Modified) → all tasks reference exact paths
- Environment Variables → Task 3
- Dashboards → Task 14
- Verification Plan → Task 15
- Phased Rollout → Tasks 14-16 mirror Phases 1-5
- Cost / Error Handling → encoded in implementation (Tasks 2, 4); no separate task needed

**2. Placeholder scan:** No TBD/TODO/vague items. Every code step shows the exact patch.

**3. Type consistency:** `captureServerEvent` signature is consistent across all server tasks. `capture` / `identifyUser` / `setUserProperties` signatures match `src/lib/analytics.ts`. `hashEmailForAnalytics` returns `Promise<string>` and is awaited everywhere.

**4. Ambiguity:** Each server event includes its `distinctId` derivation (e.g., `user.id` from D1, fallback `stripe_session:${session.id}` for unknown-user failures). `purchase_initiated` channel is split between Stripe and iOS paths in Task 7.
