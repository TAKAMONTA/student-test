import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("buy page ios purchase mode", () => {
  it("has StoreKit bridge calls and restore purchase UI", () => {
    const text = source("src/app/buy/page.tsx");

    expect(text).toContain("isIosAppUserAgent");
    expect(text).toContain("window.webkit.messageHandlers.iap.postMessage");
    expect(text).toContain('type: "purchase"');
    expect(text).toContain('type: "restore"');
    expect(text).toContain("App Storeで購入");
    expect(text).toContain("購入を復元");
  });
});
