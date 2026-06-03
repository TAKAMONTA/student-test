import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("test-login endpoint hardening", () => {
  const route = () => source("src/app/api/auth/test-login/route.ts");

  it("keeps the ENABLE_TEST_LOGIN gate and secret check", () => {
    const text = route();
    expect(text).toContain('process.env["ENABLE_TEST_LOGIN"]');
    expect(text).toContain("secret !== testSecret");
  });

  it("rate-limits by IP via the shared rate-limit helper", () => {
    const text = route();
    expect(text).toContain("getClientIp");
    expect(text).toContain("reserveRateLimits");
    expect(text).toContain("testlogin_ip:");
  });
});
