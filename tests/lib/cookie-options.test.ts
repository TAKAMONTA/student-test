import { describe, expect, it } from "vitest";
import {
  checkoutSuccessCookieOptions,
  sessionCookieOptions,
} from "@/lib/cookie-options";

describe("cookie options", () => {
  it("keeps auth cookies secure on HTTPS origins", () => {
    expect(sessionCookieOptions("https://chu1-testkit.t-nakaima.workers.dev").secure).toBe(true);
    expect(checkoutSuccessCookieOptions("https://chu1-testkit.t-nakaima.workers.dev").secure).toBe(true);
  });

  it("allows auth cookies over local HTTP for simulator StoreKit testing", () => {
    expect(sessionCookieOptions("http://localhost:8787").secure).toBe(false);
    expect(checkoutSuccessCookieOptions("http://127.0.0.1:8787").secure).toBe(false);
  });

  it("does not downgrade cookies on non-local HTTP origins", () => {
    expect(sessionCookieOptions("http://example.com").secure).toBe(true);
    expect(checkoutSuccessCookieOptions("http://192.168.1.10:8787").secure).toBe(true);
  });
});
