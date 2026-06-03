import { describe, expect, it } from "vitest";
import { choiceState, classForChoiceState } from "@/app/(app)/topic/[id]/drill/choice-state";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

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
