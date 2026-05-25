import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("apple app site association route", () => {
  it("serves Universal Links details for login verification", () => {
    const text = source("src/app/.well-known/apple-app-site-association/route.ts");

    expect(text).toContain("APPLE_TEAM_ID");
    expect(text).toContain("APPLE_BUNDLE_ID");
    expect(text).toContain("appIDs");
    expect(text).toContain("/api/auth/verify*");
    expect(text).toContain("application/json");
  });

  it("documents required Apple env vars", () => {
    const text = source(".env.local.example");

    expect(text).toContain("APPLE_TEAM_ID=");
    expect(text).toContain("APPLE_BUNDLE_ID=");
    expect(text).toContain("APPLE_IAP_PRODUCT_ID=");
    expect(text).toContain("APPLE_APP_STORE_ENVIRONMENT=");
    expect(text).toContain("APPLE_IAP_ISSUER_ID=");
    expect(text).toContain("APPLE_IAP_KEY_ID=");
    expect(text).toContain("APPLE_IAP_PRIVATE_KEY=");
  });
});
