import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("email input at-sign helper", () => {
  it("provides an explicit @ insertion control for simulator keyboards", () => {
    const component = source("src/components/EmailInput.tsx");
    const loginPage = source("src/app/login/page.tsx");
    const buyPage = source("src/app/buy/BuyPageClient.tsx");

    expect(component).toContain("insertAtSign");
    expect(component).toContain('value.includes("@")');
    expect(component).toContain('aria-label="@を入力"');
    expect(component).toContain('type="button"');
    expect(loginPage).toContain("<EmailInput");
    expect(buyPage).toContain("<EmailInput");
  });
});
