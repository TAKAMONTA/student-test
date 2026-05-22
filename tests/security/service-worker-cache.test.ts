import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("service worker cache policy", () => {
  it("does not pre-cache authenticated routes", () => {
    const text = source("public/sw.js");
    expect(text).not.toContain('"/home"');
    expect(text).not.toContain('"/profile"');
    expect(text).not.toContain('"/mock-exam"');
    expect(text).toContain("CACHEABLE_PATHS");
  });

  it("does not runtime-cache arbitrary application pages", () => {
    const text = source("public/sw.js");
    expect(text).toContain("isStaticAsset");
    expect(text).toContain("if (!CACHEABLE_PATHS.has(url.pathname) && !isStaticAsset(url.pathname)) return;");
  });

  it("clears browser cache on logout", () => {
    const text = source("src/app/api/auth/logout/route.ts");
    expect(text).toContain('Clear-Site-Data');
    expect(text).toContain('"cache"');
  });
});
