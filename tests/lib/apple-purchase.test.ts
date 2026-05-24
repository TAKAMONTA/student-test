import { describe, expect, it } from "vitest";
import { verifyApplePurchaseForUser, type ApplePurchaseDb } from "@/lib/apple-purchase";

const signedTransactionInfo = "header.payload.signature";
const transaction = {
  transactionId: "tx_1",
  originalTransactionId: "tx_1",
  webOrderLineItemId: "line_1",
  productId: "chu1_testkit_lifetime",
  environment: "Sandbox" as const,
  purchaseDate: new Date("2026-05-24T00:00:00.000Z"),
  revocationDate: null,
  revocationReason: null,
};

class MemoryApplePurchaseDb implements ApplePurchaseDb {
  users = new Map<string, { purchasedAt: Date | null }>();
  purchases: unknown[] = [];
  updates: Array<{ userId: string; purchasedAt: Date }> = [];

  constructor() {
    this.users.set("user_1", { purchasedAt: null });
    this.users.set("purchased_user", { purchasedAt: new Date("2026-05-01T00:00:00.000Z") });
  }

  async getUser(userId: string) {
    const user = this.users.get(userId);
    return user ? { id: userId, purchasedAt: user.purchasedAt } : null;
  }

  async recordApplePurchase(record: unknown) {
    this.purchases.push(record);
  }

  async markUserPurchased(userId: string, purchasedAt: Date) {
    this.updates.push({ userId, purchasedAt });
    this.users.set(userId, { purchasedAt });
  }
}

describe("apple purchase grant orchestration", () => {
  it("records the transaction and grants purchase to an unpaid user", async () => {
    const db = new MemoryApplePurchaseDb();

    const result = await verifyApplePurchaseForUser({
      userId: "user_1",
      source: "purchase",
      signedTransactionInfo,
      deps: {
        db,
        fetchAndValidateTransaction: async () => ({ signedTransactionInfo, transaction }),
      },
    });

    expect(result).toEqual({ ok: true, purchasedAt: transaction.purchaseDate });
    expect(db.purchases).toHaveLength(1);
    expect(db.updates).toEqual([{ userId: "user_1", purchasedAt: transaction.purchaseDate }]);
  });

  it("records restore but preserves the first purchase date for an already purchased user", async () => {
    const db = new MemoryApplePurchaseDb();

    const result = await verifyApplePurchaseForUser({
      userId: "purchased_user",
      source: "restore",
      signedTransactionInfo,
      deps: {
        db,
        fetchAndValidateTransaction: async () => ({ signedTransactionInfo, transaction }),
      },
    });

    expect(result).toEqual({ ok: true, purchasedAt: new Date("2026-05-01T00:00:00.000Z") });
    expect(db.purchases).toHaveLength(1);
    expect(db.updates).toEqual([]);
  });

  it("rejects missing users", async () => {
    const db = new MemoryApplePurchaseDb();

    await expect(
      verifyApplePurchaseForUser({
        userId: "missing",
        source: "purchase",
        signedTransactionInfo,
        deps: {
          db,
          fetchAndValidateTransaction: async () => ({ signedTransactionInfo, transaction }),
        },
      }),
    ).rejects.toThrow("apple purchase user not found");
  });
});
