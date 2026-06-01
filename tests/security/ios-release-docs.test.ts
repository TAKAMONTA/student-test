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

  it("documents the local StoreKit preview harness", () => {
    const readme = source("README.md");
    const releaseNotes = source("docs/release/2026-05-25-ios-native-shell.md");
    const packageJson = source("package.json");
    const project = source("ios/project.yml");

    expect(packageJson).toContain("preview:local-storekit");
    expect(readme).toContain(".dev.vars");
    expect(readme).toContain("npm run preview:local-storekit");
    expect(releaseNotes).toContain("npm run preview:local-storekit");
    expect(project).toContain("storeKitConfiguration: StoreKit/Chu1TestKit.storekit");
    expect(project).toContain("CHU1_APP_URL: http://localhost:8787");
  });
});
