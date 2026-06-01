import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("email input keyboard behavior", () => {
  it("uses native email keyboard hints without an in-app @ helper", () => {
    const component = source("src/components/EmailInput.tsx");
    const loginPage = source("src/app/login/page.tsx");
    const buyPage = source("src/app/buy/BuyPageClient.tsx");

    expect(component).toContain('type="email"');
    expect(component).toContain('inputMode="email"');
    expect(component).toContain('autoCapitalize="none"');
    expect(component).toContain('autoCorrect="off"');
    expect(component).toContain("spellCheck={false}");
    expect(component).not.toContain("insertAtSign");
    expect(component).not.toContain('aria-label="@を入力"');
    expect(component).not.toContain('type="button"');
    expect(loginPage).toContain("<EmailInput");
    expect(loginPage).not.toContain("pr-16");
    expect(buyPage).toContain("<EmailInput");
    expect(buyPage).not.toContain("pr-16");
  });
});
