import { describe, expect, it } from "vitest";
import {
  decodeAppleNotificationPayload,
  normalizeAppleNotification,
  validateAppleNotificationForApp,
} from "@/lib/apple-notifications";

function unsignedJws(payload: unknown): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.`;
}

const transactionPayload = {
  transactionId: "tx_1",
  originalTransactionId: "tx_1",
  webOrderLineItemId: "line_1",
  bundleId: "jp.taka.chu1testkit",
  productId: "chu1_testkit_lifetime",
  environment: "Sandbox",
  purchaseDate: 1779450000000,
  revocationDate: 1779460000000,
  revocationReason: 1,
  type: "Non-Consumable",
};

describe("apple notifications", () => {
  it("decodes notification signed payloads", () => {
    const signedTransactionInfo = unsignedJws(transactionPayload);
    const signedPayload = unsignedJws({
      notificationType: "REFUND",
      data: { signedTransactionInfo },
    });

    expect(decodeAppleNotificationPayload(signedPayload)).toEqual({
      notificationType: "REFUND",
      signedTransactionInfo,
      transactionPayload,
    });
  });

  it("normalizes transaction notification data", () => {
    const normalized = normalizeAppleNotification({
      notificationType: "REFUND",
      signedTransactionInfo: unsignedJws(transactionPayload),
      transactionPayload,
    });

    expect(normalized).toEqual({
      notificationType: "REFUND",
      signedTransactionInfo: expect.any(String),
      transactionId: "tx_1",
      originalTransactionId: "tx_1",
      webOrderLineItemId: "line_1",
      bundleId: "jp.taka.chu1testkit",
      productId: "chu1_testkit_lifetime",
      environment: "Sandbox",
      purchaseDate: new Date(1779450000000),
      revocationDate: new Date(1779460000000),
      revocationReason: 1,
    });
  });

  it("rejects malformed notification payloads", () => {
    expect(() => decodeAppleNotificationPayload(unsignedJws({ data: {} }))).toThrow(
      "apple notification type missing",
    );
    expect(() => decodeAppleNotificationPayload(unsignedJws({ notificationType: "REFUND", data: {} }))).toThrow(
      "apple notification transaction info missing",
    );
  });

  it("rejects malformed transaction payloads", () => {
    expect(() =>
      normalizeAppleNotification({
        notificationType: "REFUND",
        signedTransactionInfo: unsignedJws(transactionPayload),
        transactionPayload: { ...transactionPayload, transactionId: undefined },
      }),
    ).toThrow("apple notification transaction id missing");

    expect(() =>
      normalizeAppleNotification({
        notificationType: "REFUND",
        signedTransactionInfo: unsignedJws(transactionPayload),
        transactionPayload: { ...transactionPayload, environment: "Bad" },
      }),
    ).toThrow("apple notification environment invalid");

    expect(() =>
      normalizeAppleNotification({
        notificationType: "REFUND",
        signedTransactionInfo: unsignedJws(transactionPayload),
        transactionPayload: { ...transactionPayload, purchaseDate: undefined },
      }),
    ).toThrow("apple notification purchase date missing");
  });

  it("validates app-specific notification claims before persistence", () => {
    const normalized = normalizeAppleNotification({
      notificationType: "REFUND",
      signedTransactionInfo: unsignedJws(transactionPayload),
      transactionPayload,
    });

    expect(
      validateAppleNotificationForApp(normalized, {
        bundleId: "jp.taka.chu1testkit",
        productId: "chu1_testkit_lifetime",
        environment: "Sandbox",
      }),
    ).toBe(normalized);

    expect(() =>
      validateAppleNotificationForApp(normalized, {
        bundleId: "bad.bundle",
        productId: "chu1_testkit_lifetime",
        environment: "Sandbox",
      }),
    ).toThrow("apple notification bundle mismatch");

    expect(() =>
      validateAppleNotificationForApp(normalized, {
        bundleId: "jp.taka.chu1testkit",
        productId: "other_product",
        environment: "Sandbox",
      }),
    ).toThrow("apple notification product mismatch");

    expect(() =>
      validateAppleNotificationForApp(normalized, {
        bundleId: "jp.taka.chu1testkit",
        productId: "chu1_testkit_lifetime",
        environment: "Production",
      }),
    ).toThrow("apple notification environment mismatch");
  });
});
