# Pricing Display Single-Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the hardcoded `980` price (11 sites across 3 files) into a single `src/app/pricing-data.ts` config so a price change is a one-line edit.

**Architecture:** A new app-level constants module (`pricing-data.ts`, mirroring `legal-data.ts`) exports `PRICE_JPY` (number) plus two derived display strings. The 3 page files import from it; a structural regression test guards that no bare `980` literal remains in those pages.

**Tech Stack:** TypeScript, Next.js 16 App Router, Vitest.

**Reference spec:** `docs/superpowers/specs/2026-05-31-pricing-config-design.md`

---

## File Map

**New:**
- `src/app/pricing-data.ts` — single source of truth for the displayed price
- `tests/pricing/pricing-display.test.ts` — unit checks + regression guard

**Modified:**
- `src/app/page.tsx` (6 sites)
- `src/app/buy/BuyPageClient.tsx` (4 sites)
- `src/app/legal/tokusho/page.tsx` (1 site)

---

## Task 1: Pricing config module + unit tests

**Files:**
- Create: `src/app/pricing-data.ts`
- Create: `tests/pricing/pricing-display.test.ts`

- [ ] **Step 1: Write the failing unit test**

Create `tests/pricing/pricing-display.test.ts` (unit portion only for now — the regression-guard portion is added in Task 2 Step 5):

```ts
import { describe, expect, it } from "vitest";
import { PRICE_JPY, PRICE_DISPLAY, PRICE_DISPLAY_TAX } from "@/app/pricing-data";

describe("pricing-data config", () => {
  it("PRICE_JPY is the numeric source of truth", () => {
    expect(PRICE_JPY).toBe(980);
  });

  it("PRICE_DISPLAY is the yen-suffixed string", () => {
    expect(PRICE_DISPLAY).toBe("980円");
  });

  it("PRICE_DISPLAY_TAX is the tax-inclusive legal string", () => {
    expect(PRICE_DISPLAY_TAX).toBe("980円（税込）");
  });

  it("display strings derive from PRICE_JPY", () => {
    expect(PRICE_DISPLAY).toBe(`${PRICE_JPY}円`);
    expect(PRICE_DISPLAY_TAX).toBe(`${PRICE_JPY}円（税込）`);
  });
});
```

Note: this test imports via the `@/app/pricing-data` alias (`@/*` → `./src/*` per tsconfig). The page files themselves use relative imports (Task 2), but the test uses the alias for clarity.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/pricing/pricing-display.test.ts`
Expected: FAIL — module `@/app/pricing-data` does not exist.

- [ ] **Step 3: Create the config module**

Create `src/app/pricing-data.ts`:

```ts
export const PRICE_JPY = 980;
export const PRICE_DISPLAY = `${PRICE_JPY}円`;
export const PRICE_DISPLAY_TAX = `${PRICE_JPY}円（税込）`;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/pricing/pricing-display.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/pricing-data.ts tests/pricing/pricing-display.test.ts
git commit -m "feat: add pricing-data single-source config"
```

---

## Task 2: Migrate 11 hardcoded sites + regression guard

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/buy/BuyPageClient.tsx`
- Modify: `src/app/legal/tokusho/page.tsx`
- Modify: `tests/pricing/pricing-display.test.ts` (add regression guard)

- [ ] **Step 1: Migrate `src/app/page.tsx`**

Add the import alongside the existing imports at the top (after `import { capture } from "@/lib/analytics";`):

```tsx
import { PRICE_JPY, PRICE_DISPLAY } from "./pricing-data";
```

Then make these 6 edits:

**Edit 1 — line 20** (inside the `OUTCOMES` const, the third entry's `body`). Change from a plain string to a template literal:

```tsx
    body: `月額ではなく${PRICE_DISPLAY}の買い切り。テスト直前だけ使いたい家庭でも始めやすい価格にしています。`,
```

**Edit 2 — line 69** (header CTA `<Link>` text). The element currently reads `980円で始める`. Change the text node to:

```tsx
              {PRICE_DISPLAY}で始める
```

**Edit 3 — line 94** (inline stat-card array, first entry). Change:

```tsx
                  [PRICE_DISPLAY, "買い切り・税込"],
```

**Edit 4 — line 182** (pricing-section `<h2>`). Change the text node to:

```tsx
              {PRICE_DISPLAY}でテスト前のひと通りを揃える
```

**Edit 5 — line 200** (big-number `<span>`). Change the bare `980` to `{PRICE_JPY}` (leave the adjacent `円` span on line 201 untouched):

```tsx
              <span className="text-6xl font-black tabular-nums">{PRICE_JPY}</span>
```

**Edit 6 — line 211** (pricing CTA `<Link>` text). Change the text node to:

```tsx
              {PRICE_DISPLAY}で始める
```

- [ ] **Step 2: Migrate `src/app/buy/BuyPageClient.tsx`**

Add the import alongside the existing imports at the top (the file already imports `capture` / `identifyUser` from `@/lib/analytics`):

```tsx
import { PRICE_JPY, PRICE_DISPLAY } from "../pricing-data";
```

Then make these 4 edits:

**Edit 1 — line 34** (inside `WEB_FAQS` const, first entry's `a`). Change to a template literal:

```tsx
    a: `かかりません。${PRICE_DISPLAY}の買い切りで利用できます。`,
```

**Edit 2 — line 206** (the `<h1>` ternary). Change ONLY the non-iOS (else) branch from the plain string `"中1の定期テスト対策を980円で始める"` to a template literal; leave the iOS branch string exactly as-is:

```tsx
                {isIosApp ? "中1の定期テスト対策をApp Storeで始める" : `中1の定期テスト対策を${PRICE_DISPLAY}で始める`}
```

**Edit 3 — line 236** (big-number `<span>` in the non-iOS branch). Change the bare `980` to `{PRICE_JPY}` (leave the adjacent `円` span untouched):

```tsx
                    <span className="text-6xl font-black tabular-nums">{PRICE_JPY}</span>
```

**Edit 4 — line 342** (purchase button text ternary). Change ONLY the final string `"980円で購入する"` to a template literal; leave the `checking` / `loading` branch strings as-is:

```tsx
                        {checking ? "確認中..." : loading ? "決済画面を準備中..." : `${PRICE_DISPLAY}で購入する`}
```

- [ ] **Step 3: Migrate `src/app/legal/tokusho/page.tsx`**

Add `PRICE_DISPLAY_TAX` via a new import line (the file already imports from `"../../legal-data"`):

```tsx
import { PRICE_DISPLAY_TAX } from "../../pricing-data";
```

Then change line 16 (the `rows` array's first entry):

```tsx
  ["販売価格", PRICE_DISPLAY_TAX],
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Add the regression guard to the test file**

Modify `tests/pricing/pricing-display.test.ts`. At the top of the file, add these imports + helper (below the existing `vitest` import):

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}
```

Then append this new `describe` block after the existing `pricing-data config` describe:

```ts
describe("pricing consolidation regression guard", () => {
  const pages = [
    "src/app/page.tsx",
    "src/app/buy/BuyPageClient.tsx",
    "src/app/legal/tokusho/page.tsx",
  ];

  it.each(pages)("%s imports from pricing-data", (path) => {
    expect(source(path)).toContain("pricing-data");
  });

  it.each(pages)("%s contains no bare 980 literal", (path) => {
    expect(source(path)).not.toMatch(/980/);
  });
});
```

- [ ] **Step 6: Run the full regression test**

Run: `npm test -- tests/pricing/pricing-display.test.ts`
Expected: PASS — 4 unit tests + 3 import checks + 3 no-980 checks = 10 assertions green. If a `no bare 980` check fails, a `980` literal was missed in that file — find and migrate it (do NOT delete the assertion).

- [ ] **Step 7: Run the full suite + build**

Run:
```bash
npm test
npx tsc --noEmit
npm run build
```
Expected: all tests pass (prior baseline + the new pricing file), typecheck exit 0, build compiles all routes. The build is the key check that the `{PRICE_JPY}` / `{PRICE_DISPLAY}` JSX substitutions are valid in every edited location.

- [ ] **Step 8: Commit**

```bash
git add src/app/page.tsx src/app/buy/BuyPageClient.tsx src/app/legal/tokusho/page.tsx tests/pricing/pricing-display.test.ts
git commit -m "refactor: source displayed price from pricing-data config"
```

---

## Self-Review

**1. Spec coverage:**
- Config module (`PRICE_JPY`/`PRICE_DISPLAY`/`PRICE_DISPLAY_TAX`) → Task 1 ✓
- 11-site migration (page.tsx 6, BuyPageClient 4, tokusho 1) → Task 2 Steps 1-3 ✓
- iOS branches untouched → Task 2 Step 2 Edits 2 & 3 explicitly preserve iOS strings ✓
- Regression guard (import + no-bare-980 on the 3 pages) → Task 2 Step 5 ✓
- Unit checks on config → Task 1 Step 1 ✓
- Out-of-scope items (Stripe sync, descriptors, PostHog flags) → not implemented, correct ✓
- Verification (tsc, npm test, build, manual render) → Task 2 Step 7 ✓

**2. Placeholder scan:** No TBD/TODO/vague items. Every edit shows the exact replacement line.

**3. Type consistency:** `PRICE_JPY` (number) is used only in bare-number JSX spans; `PRICE_DISPLAY` (string) is used in text/interpolation; `PRICE_DISPLAY_TAX` (string) only in tokusho. Import paths are relative and correct per directory depth (`./pricing-data`, `../pricing-data`, `../../pricing-data`); the test uses the `@/app/pricing-data` alias. Names match the spec and Task 1 exactly.
