# Pricing Display Single-Source — Design

> Subproject **D** of the 5 pre-launch monetization measures (roadmap from `2026-05-28-analytics-foundation-design.md`).
> Scope confirmed during brainstorming 2026-05-31: **display-price consolidation only**. PostHog price experiments and Stripe-sync guards are explicitly deferred.

## Goal

Eliminate the hardcoded `980` price scattered across 11 sites in 3 files so that changing the displayed price is a one-line edit in a single config module. This is a pure refactor: no user-visible behavior changes, no new price.

## Problem

The price `980` is currently hardcoded in 11 places across 3 files:

| File | Occurrences |
|---|---|
| `src/app/page.tsx` | 6 (lines 20, 69, 94, 182, 200, 211) |
| `src/app/buy/BuyPageClient.tsx` | 4 (lines 34, 206, 236, 342) |
| `src/app/legal/tokusho/page.tsx` | 1 (line 16) |

A price change today requires hunting all 11 sites — error-prone, and risks the legal 特商法 page drifting out of sync with the marketing pages.

## Architecture: single-source config module

**New file `src/app/pricing-data.ts`** — mirrors the existing `src/app/legal-data.ts` convention (app-level shared constants, imported relatively by app pages).

```ts
export const PRICE_JPY = 980;
export const PRICE_DISPLAY = `${PRICE_JPY}円`;            // "980円"
export const PRICE_DISPLAY_TAX = `${PRICE_JPY}円（税込）`;  // "980円（税込）"
```

Single numeric source (`PRICE_JPY`); the two display strings derive from it. Changing the price = editing one number; all derived strings and bare-number displays update automatically.

**Rejected config shapes (brainstorming):**
- Hand-written individual string constants (`PRICE_LABEL = "980円"`) — risks number/string drift. Rejected.
- `Intl.NumberFormat` currency formatting (`¥980`) — Japanese sites use "980円"; over-engineering for a single fixed JPY price. Rejected.

**Import style:** relative imports, mirroring how `legal/tokusho/page.tsx` imports `legal-data.ts`:
- `src/app/page.tsx` → `import { PRICE_JPY, PRICE_DISPLAY } from "./pricing-data";`
- `src/app/buy/BuyPageClient.tsx` → `import { PRICE_JPY, PRICE_DISPLAY } from "../pricing-data";`
- `src/app/legal/tokusho/page.tsx` → `import { PRICE_DISPLAY_TAX } from "../../pricing-data";`

## Migration map (exact before → after)

### `src/app/page.tsx` (6 sites)

| Line | Before | After |
|---|---|---|
| 20 | `body: "月額ではなく980円の買い切り。テスト直前だけ使いたい家庭でも始めやすい価格にしています。"` | `` body: `月額ではなく${PRICE_DISPLAY}の買い切り。テスト直前だけ使いたい家庭でも始めやすい価格にしています。` `` |
| 69 | `980円で始める` (header CTA text) | `{PRICE_DISPLAY}で始める` |
| 94 | `["980円", "買い切り・税込"]` (stat card) | `[PRICE_DISPLAY, "買い切り・税込"]` |
| 182 | `980円でテスト前のひと通りを揃える` (heading) | `{PRICE_DISPLAY}でテスト前のひと通りを揃える` |
| 200 | `<span className="text-6xl font-black tabular-nums">980</span>` | `<span className="text-6xl font-black tabular-nums">{PRICE_JPY}</span>` (adjacent `円` span untouched) |
| 211 | `980円で始める` (pricing CTA text) | `{PRICE_DISPLAY}で始める` |

Note: lines 20 and 94 are in module-level / inline const arrays (`OUTCOMES`, inline stat array). Line 20's `OUTCOMES` const is defined at module top — interpolation works because `PRICE_DISPLAY` is a module-level import. The stat array at line 94 is inline in JSX, so `PRICE_DISPLAY` (a string) is used directly as the array element.

### `src/app/buy/BuyPageClient.tsx` (4 sites)

| Line | Before | After |
|---|---|---|
| 34 | `a: "かかりません。980円の買い切りで利用できます。"` (WEB_FAQS const) | `` a: `かかりません。${PRICE_DISPLAY}の買い切りで利用できます。` `` |
| 206 | `{isIosApp ? "..." : "中1の定期テスト対策を980円で始める"}` | `` {isIosApp ? "..." : `中1の定期テスト対策を${PRICE_DISPLAY}で始める`} `` |
| 236 | `<span className="text-6xl font-black tabular-nums">980</span>` (non-iOS branch) | `<span className="text-6xl font-black tabular-nums">{PRICE_JPY}</span>` |
| 342 | `"980円で購入する"` (button text, non-iOS) | `` `${PRICE_DISPLAY}で購入する` `` |

The iOS branches (App Store price display) carry no `980` literal and are untouched.

### `src/app/legal/tokusho/page.tsx` (1 site)

| Line | Before | After |
|---|---|---|
| 16 | `["販売価格", "980円（税込）"]` | `["販売価格", PRICE_DISPLAY_TAX]` |

## Out of scope (explicit)

- **Stripe charged amount** (`STRIPE_PRICE_ID`): the actual charge lives in the Stripe dashboard, a separate source of truth. This config governs *display* only. Keeping them in sync remains a manual/operational concern.
- **Descriptive labels without the number** ("買い切り・税込", "買い切り・App Store"): not the price itself; left as-is (YAGNI).
- **PostHog feature-flag price experiments**: deferred to a later subproject.

## Testing

New `tests/pricing/pricing-display.test.ts`, following the structural-regression pattern of `tests/security/email-input-at-sign.test.ts` and `tests/analytics/instrumentation.test.ts`:

1. **Unit checks on the config module:**
   - `PRICE_JPY === 980`
   - `PRICE_DISPLAY === "980円"`
   - `PRICE_DISPLAY_TAX === "980円（税込）"`

2. **Regression guard (consolidation holds):** read each of the 3 page source files as text and assert they import from `pricing-data` and contain NO bare `980` literal:
   - `src/app/page.tsx`: `expect(text).toContain("pricing-data")` and `expect(text).not.toMatch(/980/)`
   - `src/app/buy/BuyPageClient.tsx`: same
   - `src/app/legal/tokusho/page.tsx`: same

   The `not.toMatch(/980/)` guard ensures that if anyone re-hardcodes the price in these files, the test fails. (The config module itself is the only place `980` may appear.)

## Branch

`codex/pricing-config`, stacked on `codex/review-prompt` (PR #4). Merge order: #2 → #3 → #4 → this.

## Verification

- `npx tsc --noEmit` → exit 0
- `npm test` → all prior tests pass + new pricing tests (baseline 107 → 107 + new file)
- `npm run build` → all routes compile (display-only change, no behavior shift)
- Manual: `/`, `/buy`, `/legal/tokusho` all still render "980円" exactly as before

## Self-Review (inline)

- **Placeholders:** none — every before/after is a concrete line.
- **Consistency:** `PRICE_JPY` is the only numeric source; `PRICE_DISPLAY`/`PRICE_DISPLAY_TAX` derive from it; bare-number spans use `PRICE_JPY`, inline-text uses `PRICE_DISPLAY`, legal uses `PRICE_DISPLAY_TAX`.
- **Scope:** single focused refactor, no behavior change, one implementation plan.
- **Ambiguity:** the `not.toMatch(/980/)` guard is scoped to the 3 page files only, not the config module (which legitimately holds `980`).
