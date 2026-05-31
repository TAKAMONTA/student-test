import { describe, expect, it } from "vitest";
import { PRICE_JPY, PRICE_DISPLAY, PRICE_DISPLAY_TAX } from "@/app/pricing-data";

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
