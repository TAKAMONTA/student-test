import { describe, expect, it } from "vitest";
import { emphasizeLessonTerms } from "@/lib/lesson-emphasis";

describe("lesson emphasis", () => {
  it("adds markdown strong markers to important lesson terms", () => {
    expect(emphasizeLessonTerms("緯度と経度を確認します。")).toBe(
      "**緯度**と**経度**を確認します。",
    );
  });

  it("does not alter headings, code, or existing strong text", () => {
    const markdown = [
      "## 緯度と経度",
      "本文では緯度を使います。",
      "`緯度`",
      "**経度**",
    ].join("\n");

    expect(emphasizeLessonTerms(markdown)).toBe(
      [
        "## 緯度と経度",
        "本文では**緯度**を使います。",
        "`緯度`",
        "**経度**",
      ].join("\n"),
    );
  });
});
