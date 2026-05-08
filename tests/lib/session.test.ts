import { describe, it, expect } from "vitest";
import { signSessionToken, verifySessionToken } from "@/lib/session";

const SECRET = "test-secret-please-change-this-1234567890abcdef";

describe("session token", () => {
  it("round-trips a userId", async () => {
    const token = await signSessionToken({ userId: "user-123", secret: SECRET });
    const payload = await verifySessionToken({ token, secret: SECRET });
    expect(payload.userId).toBe("user-123");
  });

  it("rejects tampered tokens", async () => {
    const token = await signSessionToken({ userId: "user-123", secret: SECRET });
    const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
    await expect(verifySessionToken({ token: tampered, secret: SECRET })).rejects.toThrow();
  });
});
