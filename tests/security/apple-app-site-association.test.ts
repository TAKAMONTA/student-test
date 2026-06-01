import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/.well-known/apple-app-site-association/route";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("apple app site association route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("serves Universal Links details for login verification", async () => {
    vi.stubEnv("APPLE_TEAM_ID", "ABCDE12345");
    vi.stubEnv("APPLE_BUNDLE_ID", "jp.taka.chu1testkit");

    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    await expect(res.json()).resolves.toEqual({
      applinks: {
        details: [
          {
            appIDs: ["ABCDE12345.jp.taka.chu1testkit"],
            components: [
              {
                "/": "/api/auth/verify*",
                comment: "Open email magic links in the iOS app",
              },
            ],
          },
        ],
      },
    });
  });

  it("fails closed when the app association is not configured", async () => {
    vi.stubEnv("APPLE_TEAM_ID", "");
    vi.stubEnv("APPLE_BUNDLE_ID", "");

    const res = await GET();

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Apple app association is not configured" });
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
