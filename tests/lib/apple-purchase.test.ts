import { describe, expect, it } from "vitest";
import {
  verifyApplePurchaseForUser,
  type ApplePurchaseDb,
  type ApplePurchaseRecord,
} from "@/lib/apple-purchase";

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
  purchaseOwners = new Map<string, string>();
  purchases: ApplePurchaseRecord[] = [];
  updates: Array<{ userId: string; purchasedAt: Date }> = [];

  constructor(existingPurchases: Record<string, string> = {}) {
    this.users.set("user_1", { purchasedAt: null });
    this.users.set("purchased_user", { purchasedAt: new Date("2026-05-01T00:00:00.000Z") });
    this.users.set("other_user", { purchasedAt: null });
    this.purchaseOwners = new Map(Object.entries(existingPurchases));
  }

  async getUser(userId: string) {
    const user = this.users.get(userId);
    return user ? { id: userId, purchasedAt: user.purchasedAt } : null;
  }

  async recordApplePurchase(record: ApplePurchaseRecord) {
    const existingUserId = this.purchaseOwners.get(record.transaction.transactionId);
    if (existingUserId) {
      return { userId: existingUserId };
    }
    this.purchaseOwners.set(record.transaction.transactionId, record.userId);
    this.purchases.push(record);
    return { userId: record.userId };
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
    expect(db.purchases).toEqual([
      {
        userId: "user_1",
        transaction,
        source: "purchase",
        signedTransactionInfo,
        notificationType: null,
      },
    ]);
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

  it("rejects a transaction already recorded for another user", async () => {
    const db = new MemoryApplePurchaseDb({ tx_1: "other_user" });

    await expect(
      verifyApplePurchaseForUser({
        userId: "user_1",
        source: "purchase",
        signedTransactionInfo,
        deps: {
          db,
          fetchAndValidateTransaction: async () => ({ signedTransactionInfo, transaction }),
        },
      }),
    ).rejects.toThrow("apple transaction belongs to another user");

    expect(db.purchases).toEqual([]);
    expect(db.updates).toEqual([]);
  });

  it("rejects missing users", async () => {
    const db = new MemoryApplePurchaseDb();
    let validatorCalls = 0;

    await expect(
      verifyApplePurchaseForUser({
        userId: "missing",
        source: "purchase",
        signedTransactionInfo,
        deps: {
          db,
          fetchAndValidateTransaction: async () => {
            validatorCalls += 1;
            return { signedTransactionInfo, transaction };
          },
        },
      }),
    ).rejects.toThrow("apple purchase user not found");

    expect(validatorCalls).toBe(0);
    expect(db.purchases).toEqual([]);
    expect(db.updates).toEqual([]);
  });
});
