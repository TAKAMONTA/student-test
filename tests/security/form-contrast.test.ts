import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("form contrast", () => {
  it("keeps form fields readable in iOS simulator dark appearance", () => {
    const css = source("src/app/globals.css");

    expect(css).toContain("color-scheme: light");
    expect(css).toContain("input:not([type=\"checkbox\"]):not([type=\"radio\"]),");
    expect(css).toContain("background-color: #ffffff");
    expect(css).toContain("color: #0f172a");
    expect(css).toContain("::placeholder");
  });
});
