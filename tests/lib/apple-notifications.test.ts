import { describe, expect, it } from "vitest";
import { decodeAppleNotificationPayload, normalizeAppleNotification } from "@/lib/apple-notifications";

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
      productId: "chu1_testkit_lifetime",
      environment: "Sandbox",
      purchaseDate: new Date(1779450000000),
      revocationDate: new Date(1779460000000),
      revocationReason: 1,
    });
  });
});
