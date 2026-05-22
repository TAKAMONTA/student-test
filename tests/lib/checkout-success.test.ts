import { describe, expect, it } from "vitest";
import {
  createCheckoutSuccessToken,
  isCheckoutSuccessVerified,
  verifyCheckoutSuccessToken,
} from "@/lib/checkout-success";

describe("checkout success verification", () => {
  it("requires both the verified flag and a signed checkout token", async () => {
    const secret = "test-secret";
    const token = await createCheckoutSuccessToken({ sessionId: "cs_test_123", secret });

    await expect(isCheckoutSuccessVerified({ verified: "1", token, secret })).resolves.toBe(true);
    await expect(isCheckoutSuccessVerified({ verified: "1", secret })).resolves.toBe(false);
    await expect(isCheckoutSuccessVerified({ verified: "0", token, secret })).resolves.toBe(false);
    await expect(isCheckoutSuccessVerified({ token, secret })).resolves.toBe(false);
    await expect(isCheckoutSuccessVerified({ verified: "1", token, secret: "wrong-secret" })).resolves.toBe(false);
  });

  it("round-trips the checkout session id from a signed token", async () => {
    const token = await createCheckoutSuccessToken({
      sessionId: "cs_test_456",
      secret: "test-secret",
    });

    await expect(verifyCheckoutSuccessToken({ token, secret: "test-secret" })).resolves.toEqual({
      sessionId: "cs_test_456",
    });
  });
});
