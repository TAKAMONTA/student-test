import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PRICE_JPY, PRICE_DISPLAY, PRICE_DISPLAY_TAX } from "@/app/pricing-data";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("pricing-data config", () => {
  it("PRICE_JPY is the numeric source of truth", () => {
    expect(PRICE_JPY).toBe(980);
  });

  it("PRICE_DISPLAY is the yen-suffixed string", () => {
    expect(PRICE_DISPLAY).toBe("980円");
  });

  it("PRICE_DISPLAY_TAX is the tax-inclusive legal string", () => {
    expect(PRICE_DISPLAY_TAX).toBe("980円（税込）");
  });

  it("display strings derive from PRICE_JPY", () => {
    expect(PRICE_DISPLAY).toBe(`${PRICE_JPY}円`);
    expect(PRICE_DISPLAY_TAX).toBe(`${PRICE_JPY}円（税込）`);
  });
});

describe("pricing consolidation regression guard", () => {
  const pages = [
    "src/app/page.tsx",
    "src/app/buy/BuyPageClient.tsx",
    "src/app/legal/tokusho/page.tsx",
  ];

  it.each(pages)("%s imports from pricing-data", (path) => {
    expect(source(path)).toContain("pricing-data");
  });

  it.each(pages)("%s contains no bare 980 literal", (path) => {
    expect(source(path)).not.toMatch(/980/);
  });
});
