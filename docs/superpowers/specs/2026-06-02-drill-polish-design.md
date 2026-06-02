# Drill Experience Polish — Design

> Subproject **E** (UI/UX polish) of the 5 pre-launch monetization measures. v1 scope confirmed during brainstorming 2026-06-02: **polish the drill answering experience** — the most-used, currently-plainest screen.

## Goal

Make the drill answer→feedback loop feel responsive and rewarding, so studying is satisfying enough to drive retention, good reviews, and word-of-mouth. Pure front-end polish of one screen: no API changes, no new data, no business-logic changes.

## Why the drill

The app's marketing pages (`/`, `/buy`) and `/home` already have visual investment. The learning-loop screens (`drill`, `mock-exam`, `topic`, `ask`) are plainer. The **drill** (`src/app/(app)/topic/[id]/drill/page.tsx`) is where a paying student spends the most time and currently has the least delight:

- On submit, the choices are *replaced* by a separate result box — the student loses sight of which option they picked and which was right.
- `consecutiveCorrect` and `masteryLevel` are shown as tiny gray text — gamification signals are buried.
- Progress is text-only (`問題 N / M`).
- No animation; hard state swaps.

## Scope (v1) — six focused improvements

All changes are within `src/app/(app)/topic/[id]/drill/page.tsx` plus a small CSS-keyframe block in `src/app/globals.css`. No external libraries.

1. **Inline answer feedback on the choices.** After grading, keep the choice buttons visible. Color the chosen button green (correct) or red (incorrect), and always highlight the correct answer green. Disable further selection once answered. This is the single biggest UX win — located, immediate feedback.

2. **Correct-answer micro-celebration.** On a correct answer, a tasteful checkmark pop + brief color pulse (CSS keyframe). Encouraging for a 中1 student without being childish. Nothing on incorrect beyond the calm red marking + explanation.

3. **Streak surfacing.** Promote the buried `consecutiveCorrect` into a visible 🔥 streak indicator near the score. At milestones (3, 5, 10 consecutive correct) show a brief celebratory flourish (e.g., "🔥 3連続！"). Hidden when streak is 0.

4. **Progress bar.** A thin progress bar at the top reflecting `(index + 1) / questions.length`, complementing the existing `問題 N / M` text.

5. **Result reveal animation.** The explanation/result area slides+fades in (keyframe) instead of a hard swap.

6. **Reduced-motion accessibility.** All keyframe animations are disabled under `@media (prefers-reduced-motion: reduce)`. Functionality (coloring, feedback) remains; only motion is removed.

## Out of scope (v1, deferred)

- Threading the per-subject theme color (from `/home`) into the drill.
- New analytics events (e.g. `drill_streak_milestone`) — E is UI polish, not measurement.
- Sound effects.
- Polishing `mock-exam`, `topic`, `ask` screens — separate later increments.
- Dark mode / focus mode.

## Architecture / approach

The drill page is a single `"use client"` component. Changes stay inside it, with one extracted pure helper for testability:

- **`choiceState(choice, userAnswer, result)` helper** — returns one of `"idle" | "selected" | "correct" | "incorrect"` for a given choice button, derived from current selection + grading result. This is the only piece of branching logic worth unit-testing; extracting it keeps the JSX className mapping clean and lets a test assert the state machine without rendering.
  - Before answering (`result === null`): chosen option → `"selected"`, others → `"idle"`.
  - After answering: the correct answer → `"correct"`; the user's pick if wrong → `"incorrect"`; everything else → `"idle"`.
- A small `classForChoiceState(state)` returns the Tailwind classes for each state (green/red/indigo/neutral).
- CSS keyframes (`drill-pop`, `drill-reveal`) defined in `globals.css`, applied via utility classes, gated by `prefers-reduced-motion`.

Free-text questions (no `choices`) keep the existing input flow; the inline-choice feedback applies only to multiple-choice questions. For free-text, the existing result box is retained but gains the reveal animation (#5) and streak (#3).

## Data flow (unchanged)

`GET /api/topics/:id/questions` → render question → user selects/types → `POST /api/topics/:id/attempts` → `AttemptResult { isCorrect, answer, explanation, masteryLevel, consecutiveCorrect }` → display. No API or schema changes. `result.answer` (the correct answer string) drives the "which choice is correct" highlight.

## Error handling

Unchanged from current behavior: fetch failures fall through to the existing loading/empty states. The polish is presentational and does not introduce new failure modes. The `choiceState` helper is pure and total (always returns a valid state).

## Testing

New `tests/drill/drill-polish.test.ts` (vitest), following the structural + unit pattern used by A–D:

1. **Unit tests for `choiceState`** (extracted to `src/app/(app)/topic/[id]/drill/choice-state.ts`, imported by both the page and the test):
   - before answering: selected choice → `"selected"`, others → `"idle"`
   - after correct answer: chosen+correct → `"correct"`, others → `"idle"`
   - after wrong answer: correct option → `"correct"`, user's wrong pick → `"incorrect"`, others → `"idle"`
2. **Structural regression** on `drill/page.tsx`: asserts the streak indicator, progress bar, and reduced-motion-gated animation hooks are present (e.g. contains `consecutiveCorrect`, a progress-bar element, and the keyframe utility class names).
3. **globals.css** contains the `drill-pop` / `drill-reveal` keyframes and a `prefers-reduced-motion: reduce` guard.

## Branch

`codex/drill-polish`, based on `main` (A–D already merged). PR targets `main` directly.

## Verification

- `npx tsc --noEmit` → exit 0
- `npm test` → prior suite (117) still green + new drill tests
- `npm run build` → all routes compile
- Manual: run the drill locally, answer correct/incorrect, confirm inline coloring, streak, progress bar, reveal animation; toggle OS reduced-motion and confirm animations stop while feedback remains

## Self-Review (inline)

- **Placeholders:** none — each improvement is concrete and bounded.
- **Consistency:** all six changes live in the drill page + globals.css; the `choiceState` helper is the single extracted, tested unit; palette stays within existing indigo/green/red.
- **Scope:** one screen, one implementation plan; mock-exam/topic/ask and analytics explicitly deferred.
- **Ambiguity:** free-text vs multiple-choice behavior is explicitly distinguished; `choiceState` states are enumerated; reduced-motion behavior is specified (motion off, feedback on).
