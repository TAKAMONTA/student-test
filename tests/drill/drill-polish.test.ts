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
