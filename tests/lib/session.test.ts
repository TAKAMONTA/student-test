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
    const [header, payload, signature] = token.split(".");
    const body = JSON.parse(Buffer.from(payload!, "base64url").toString("utf8")) as {
      userId: string;
    };
    body.userId = "attacker";
    const tamperedPayload = Buffer.from(JSON.stringify(body)).toString("base64url");
    const tampered = `${header}.${tamperedPayload}.${signature}`;
    await expect(verifySessionToken({ token: tampered, secret: SECRET })).rejects.toThrow();
  });
});
