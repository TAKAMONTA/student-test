import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("ios release docs", () => {
  it("documents the iOS IAP verification commands", () => {
    const text = source("docs/release/2026-05-24-ios-iap-readiness.md");

    expect(text).toContain("iOS IAP Readiness");
    expect(text).toContain("migrations/0005_apple_iap.sql");
    expect(text).toContain("APPLE_IAP_PRODUCT_ID");
    expect(text).toContain("App Store Server Notifications");
    expect(text).toContain("npm test");
    expect(text).toContain("npm run build");
  });

  it("links the iOS release docs from README", () => {
    const text = source("README.md");
    expect(text).toContain("docs/release/2026-05-24-ios-iap-readiness.md");
  });
});
