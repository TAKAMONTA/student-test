# Drill Experience Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the drill answer→feedback loop (`src/app/(app)/topic/[id]/drill/page.tsx`) with inline choice feedback, a surfaced streak, a progress bar, and tasteful reduced-motion-safe animations.

**Architecture:** Extract the per-choice feedback state machine into a pure, unit-tested helper (`choice-state.ts`) co-located with the drill page. Add two CSS keyframes (`drill-pop`, `drill-reveal`) to `globals.css`, gated by `prefers-reduced-motion`. Rewrite the drill page to keep choices visible after grading (colored via the helper), show a 🔥 streak + milestone flourish, a top progress bar, and an animated result reveal. No API/schema/business-logic changes.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Tailwind CSS v4, Vitest.

**Reference spec:** `docs/superpowers/specs/2026-06-02-drill-polish-design.md`

---

## File Map

**New:**
- `src/app/(app)/topic/[id]/drill/choice-state.ts` — pure helper: `choiceState()` + `classForChoiceState()`
- `tests/drill/drill-polish.test.ts` — unit tests (Task 1) + structural regression (Task 3)

**Modified:**
- `src/app/globals.css` — keyframes + reduced-motion guard
- `src/app/(app)/topic/[id]/drill/page.tsx` — full rewrite of the render layer

---

## Task 1: Choice-state helper + unit tests

**Files:**
- Create: `src/app/(app)/topic/[id]/drill/choice-state.ts`
- Create: `tests/drill/drill-polish.test.ts`

- [ ] **Step 1: Write the failing unit test**

Create `tests/drill/drill-polish.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { choiceState, classForChoiceState } from "@/app/(app)/topic/[id]/drill/choice-state";

describe("choiceState", () => {
  it("before answering: the selected choice is 'selected', others 'idle'", () => {
    expect(choiceState("A", "A", null)).toBe("selected");
    expect(choiceState("B", "A", null)).toBe("idle");
  });

  it("after a correct answer: chosen+correct is 'correct', others 'idle'", () => {
    const result = { isCorrect: true, answer: "A" };
    expect(choiceState("A", "A", result)).toBe("correct");
    expect(choiceState("B", "A", result)).toBe("idle");
  });

  it("after a wrong answer: correct option 'correct', user's pick 'incorrect', others 'idle'", () => {
    const result = { isCorrect: false, answer: "A" };
    expect(choiceState("A", "B", result)).toBe("correct");
    expect(choiceState("B", "B", result)).toBe("incorrect");
    expect(choiceState("C", "B", result)).toBe("idle");
  });

  it("classForChoiceState returns distinct classes per state", () => {
    expect(classForChoiceState("correct")).toContain("green");
    expect(classForChoiceState("incorrect")).toContain("red");
    expect(classForChoiceState("selected")).toContain("indigo");
    expect(classForChoiceState("idle")).toContain("slate");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/drill/drill-polish.test.ts`
Expected: FAIL — module `@/app/(app)/topic/[id]/drill/choice-state` does not exist.

- [ ] **Step 3: Create the helper**

Create `src/app/(app)/topic/[id]/drill/choice-state.ts`:

```ts
export type ChoiceState = "idle" | "selected" | "correct" | "incorrect";

export type ChoiceResult = { isCorrect: boolean; answer: string } | null;

export function choiceState(
  choice: string,
  userAnswer: string,
  result: ChoiceResult,
): ChoiceState {
  if (result === null) {
    return choice === userAnswer ? "selected" : "idle";
  }
  if (choice === result.answer) return "correct";
  if (choice === userAnswer && !result.isCorrect) return "incorrect";
  return "idle";
}

export function classForChoiceState(state: ChoiceState): string {
  switch (state) {
    case "correct":
      return "border-green-500 bg-green-50 text-green-900";
    case "incorrect":
      return "border-red-500 bg-red-50 text-red-900";
    case "selected":
      return "border-indigo-500 bg-indigo-50 text-indigo-900";
    case "idle":
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/drill/drill-polish.test.ts`
Expected: PASS (4 tests). If the `@/app/(app)/topic/[id]/drill/choice-state` import fails to resolve (special chars in path), confirm the file path on disk exactly matches and the `@/*`→`./src/*` alias is in `tsconfig.json`; do not change the import to a relative `../../../`-style path unless resolution genuinely fails.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(app)/topic/[id]/drill/choice-state.ts" tests/drill/drill-polish.test.ts
git commit -m "feat: add drill choice-state helper with unit tests"
```

---

## Task 2: Animation keyframes in globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Append keyframes + reduced-motion guard**

`src/app/globals.css` currently starts with `@import "tailwindcss";` and an `@theme inline { ... }` block (43 lines, no keyframes). APPEND the following to the END of the file:

```css

/* Drill polish animations (subproject E) */
@keyframes drill-pop {
  0% { transform: scale(0.85); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
}

@keyframes drill-reveal {
  0% { transform: translateY(8px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.animate-drill-pop {
  animation: drill-pop 0.32s ease-out;
}

.animate-drill-reveal {
  animation: drill-reveal 0.28s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .animate-drill-pop,
  .animate-drill-reveal {
    animation: none;
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0 (CSS does not affect tsc, but confirms nothing else broke).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add drill-pop and drill-reveal keyframes (reduced-motion safe)"
```

---

## Task 3: Rewrite the drill page + structural regression test

**Files:**
- Modify: `src/app/(app)/topic/[id]/drill/page.tsx`
- Modify: `tests/drill/drill-polish.test.ts` (append structural block)

- [ ] **Step 1: Replace the drill page with the polished version**

Replace the ENTIRE contents of `src/app/(app)/topic/[id]/drill/page.tsx` with:

```tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { choiceState, classForChoiceState } from "./choice-state";

type Question = {
  id: number;
  text: string;
  type: string;
  choices: string[] | null;
  difficulty: number;
};

type AttemptResult = {
  isCorrect: boolean;
  answer: string;
  explanation: string;
  masteryLevel: number;
  consecutiveCorrect: number;
};

const STREAK_MILESTONES = [3, 5, 10];

export default function DrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const topicId = parseInt(id, 10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetch(`/api/topics/${topicId}/questions`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions((data as Question[]).sort(() => Math.random() - 0.5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [topicId]);

  const question = questions[index];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question || !userAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/topics/${topicId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, userAnswer: userAnswer.trim() }),
      });
      const data = (await res.json()) as AttemptResult;
      setResult(data);
      setSessionTotal((t) => t + 1);
      if (data.isCorrect) {
        setSessionCorrect((c) => c + 1);
        setStreak(data.consecutiveCorrect);
      } else {
        setStreak(0);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function nextQuestion() {
    setResult(null);
    setUserAnswer("");
    setIndex((i) => (i + 1) % questions.length);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">読み込み中…</div>;
  }

  if (!question) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">問題が見つかりません</p>
        <Link href={`/topic/${topicId}`} className="text-indigo-600 hover:underline">← 単元に戻る</Link>
      </div>
    );
  }

  const answered = result !== null;
  const hasChoices = !!question.choices && question.choices.length > 0;
  const progress = Math.round(((index + 1) / questions.length) * 100);
  const isMilestone =
    answered && result.isCorrect && STREAK_MILESTONES.includes(result.consecutiveCorrect);

  return (
    <div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        <Link href={`/topic/${topicId}`} className="text-sm text-indigo-600 hover:underline">
          ← 単元に戻る
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {streak > 0 && <span className="font-bold text-orange-600">🔥 {streak}</span>}
          {sessionTotal > 0 && (
            <span className="text-slate-500">正解率: {sessionCorrect}/{sessionTotal}</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <p className="text-xs text-slate-400 mb-3">問題 {index + 1} / {questions.length}</p>
        <p className="text-slate-900 font-medium leading-relaxed">{question.text}</p>
      </div>

      {hasChoices ? (
        <div className="space-y-4">
          <div className="grid gap-2">
            {question.choices!.map((choice) => {
              const state = choiceState(choice, userAnswer, result);
              const pop = answered && state === "correct" && result.isCorrect;
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={answered || submitting}
                  onClick={() => setUserAnswer(choice)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-5 py-3 text-left transition-colors disabled:cursor-default ${classForChoiceState(
                    state,
                  )} ${!answered ? "hover:border-indigo-200" : ""} ${pop ? "animate-drill-pop" : ""}`}
                >
                  <span>{choice}</span>
                  {answered && state === "correct" && (
                    <span className="font-bold text-green-600">✓</span>
                  )}
                  {answered && state === "incorrect" && (
                    <span className="font-bold text-red-600">✗</span>
                  )}
                </button>
              );
            })}
          </div>
          {!answered && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!userAnswer || submitting}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "採点中…" : "答える"}
            </button>
          )}
        </div>
      ) : (
        !answered && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="答えを入力"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!userAnswer || submitting}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "採点中…" : "答える"}
            </button>
          </form>
        )
      )}

      {answered && (
        <div className="mt-4 space-y-4 animate-drill-reveal">
          {isMilestone && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-center animate-drill-pop">
              <p className="font-bold text-orange-700">🔥 {result.consecutiveCorrect}連続正解！</p>
            </div>
          )}
          <div
            className={`rounded-2xl p-5 border ${
              result.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <p className={`font-bold text-lg mb-1 ${result.isCorrect ? "text-green-700" : "text-red-700"}`}>
              {result.isCorrect ? "✓ 正解！" : "✗ 不正解"}
            </p>
            {!result.isCorrect && (
              <p className="text-slate-700 text-sm mb-2">
                正解: <span className="font-semibold">{result.answer}</span>
              </p>
            )}
            {result.explanation && (
              <p className="text-slate-600 text-sm leading-relaxed">{result.explanation}</p>
            )}
          </div>
          <div className="text-center text-xs text-slate-400">
            連続正解: {result.consecutiveCorrect} 問 / マスターレベル: {result.masteryLevel}
          </div>
          <button
            onClick={nextQuestion}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            次の問題へ
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0. (Note: `result` narrows to non-null inside the `answered && (...)` block because `answered = result !== null` and `result` is read after the guard. If tsc complains about possible null, keep the code as written — the `answered &&` guard ensures non-null at runtime; do not sprinkle `!` assertions unless tsc actually errors.)

- [ ] **Step 3: Append the structural regression test**

In `tests/drill/drill-polish.test.ts`, add these imports at the TOP of the file (below the existing `vitest` import):

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}
```

Then APPEND this describe block after the existing `describe("choiceState", ...)`:

```ts
describe("drill page polish (structural)", () => {
  const page = () => source("src/app/(app)/topic/[id]/drill/page.tsx");
  const css = () => source("src/app/globals.css");

  it("uses the choice-state helper", () => {
    expect(page()).toContain("choiceState");
    expect(page()).toContain("classForChoiceState");
  });

  it("renders a progress bar", () => {
    expect(page()).toContain("width: `${progress}%`");
  });

  it("surfaces the streak with a flame and milestone flourish", () => {
    expect(page()).toContain("🔥");
    expect(page()).toContain("STREAK_MILESTONES");
    expect(page()).toContain("consecutiveCorrect");
  });

  it("uses reveal + pop animation hooks", () => {
    expect(page()).toContain("animate-drill-reveal");
    expect(page()).toContain("animate-drill-pop");
  });

  it("keeps choices visible and disabled after answering", () => {
    expect(page()).toContain("disabled={answered || submitting}");
  });

  it("globals.css defines the keyframes with a reduced-motion guard", () => {
    const c = css();
    expect(c).toContain("@keyframes drill-pop");
    expect(c).toContain("@keyframes drill-reveal");
    expect(c).toContain("prefers-reduced-motion: reduce");
  });
});
```

- [ ] **Step 4: Run the full drill test file**

Run: `npm test -- tests/drill/drill-polish.test.ts`
Expected: PASS — 4 unit + 6 structural = 10 assertions green. If a structural assertion fails, the page/CSS is missing that exact element — add it to match the Step 1 / Task 2 code (do not weaken the assertion).

- [ ] **Step 5: Full suite + typecheck + build**

Run:
```bash
npm test
npx tsc --noEmit
npm run build
```
Expected: prior suite (117) + new drill tests all pass; tsc exit 0; build compiles all routes (confirms the rewritten JSX is valid).

- [ ] **Step 6: Commit**

```bash
git add "src/app/(app)/topic/[id]/drill/page.tsx" tests/drill/drill-polish.test.ts
git commit -m "feat: polish drill with inline feedback, streak, progress bar, animations"
```

---

## Self-Review

**1. Spec coverage:**
- Inline answer feedback on choices → Task 1 (`choiceState`/`classForChoiceState`) + Task 3 (choices stay visible, colored, disabled, ✓/✗) ✓
- Correct-answer micro-celebration → Task 2 (`drill-pop`) + Task 3 (`pop` on correct choice gated by `result.isCorrect`; milestone box) ✓
- Streak surfacing + milestones → Task 3 (`streak` state, 🔥 indicator, `STREAK_MILESTONES`, "N連続正解！") ✓
- Progress bar → Task 3 (top bar, `width: ${progress}%`) ✓
- Result reveal animation → Task 2 (`drill-reveal`) + Task 3 (`animate-drill-reveal`) ✓
- Reduced-motion accessibility → Task 2 (`@media (prefers-reduced-motion: reduce)`) ✓
- Free-text vs choices distinction → Task 3 (`hasChoices` branch; free-text keeps input+result, gains reveal) ✓
- Testing (unit choiceState + structural + globals.css) → Tasks 1 & 3 ✓
- Out-of-scope (subject theme, analytics, sound, other screens) → not implemented ✓

**2. Placeholder scan:** No TBD/TODO/vague items. Every code step shows complete content.

**3. Type consistency:** `choiceState` / `classForChoiceState` / `ChoiceState` / `ChoiceResult` defined in Task 1, used identically in Task 3. `AttemptResult` is structurally assignable to `ChoiceResult` (has `isCorrect` + `answer`). `STREAK_MILESTONES`, `streak`, `progress`, `answered`, `hasChoices`, `isMilestone`, `pop` all defined within Task 3's page. Test import path matches Task 1's file location. Correct-answer `pop` is gated on `result.isCorrect` so the correct option does not pop on a wrong answer (matches spec: "Nothing on incorrect beyond calm red marking").
