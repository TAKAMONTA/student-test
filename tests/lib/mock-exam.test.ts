import { describe, expect, it } from "vitest";
import { findQuestionPoolProblems, pickQuestionIdsBySubject } from "@/lib/mock-exam";

describe("mock exam question pool", () => {
  it("reports subjects with too few questions", () => {
    const problems = findQuestionPoolProblems(
      [
        { subjectId: 1, subjectName: "国語", questionIds: [1, 2, 3, 4, 5] },
        { subjectId: 2, subjectName: "数学", questionIds: [6, 7] },
      ],
      5,
    );

    expect(problems).toEqual([
      { subjectId: 2, subjectName: "数学", available: 2, required: 5 },
    ]);
  });

  it("picks the required number from each subject", () => {
    const picked = pickQuestionIdsBySubject(
      [
        { subjectId: 1, subjectName: "国語", questionIds: [1, 2, 3, 4, 5, 6] },
        { subjectId: 2, subjectName: "数学", questionIds: [7, 8, 9, 10, 11, 12] },
      ],
      5,
      () => 0.5,
    );

    expect(picked).toHaveLength(10);
    expect(picked.slice(0, 5).every((id) => id >= 1 && id <= 6)).toBe(true);
    expect(picked.slice(5).every((id) => id >= 7 && id <= 12)).toBe(true);
  });

  it("throws when any subject is underfilled", () => {
    expect(() =>
      pickQuestionIdsBySubject(
        [{ subjectId: 1, subjectName: "国語", questionIds: [1, 2] }],
        5,
      ),
    ).toThrow("insufficient question pool");
  });
});
