import { describe, expect, it } from "vitest";
import { isAnswerCorrect, normalizeAnswer } from "@/lib/answers";

describe("answer normalization", () => {
  it("normalizes width, case, punctuation, and math spacing", () => {
    expect(normalizeAnswer(" Ｘ ＝ ７． ")).toBe("x=7");
    expect(normalizeAnswer("I DON’T PLAY SOCCER.")).toBe("i don't play soccer");
  });

  it("compares common answer variants", () => {
    expect(isAnswerCorrect("x = 7", "x=7")).toBe(true);
    expect(isAnswerCorrect(" サン。", "サン")).toBe(true);
    expect(isAnswerCorrect("I don’t play soccer.", "I don't play soccer")).toBe(true);
  });
});
