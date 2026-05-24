import type { AppleIapSource, ValidAppleTransaction } from "@/lib/apple-iap";

export type ApplePurchaseDb = {
  getUser(userId: string): Promise<{ id: string; purchasedAt: Date | null } | null>;
  recordApplePurchase(record: ApplePurchaseRecord): Promise<{ userId: string }>;
  markUserPurchased(userId: string, purchasedAt: Date): Promise<void>;
};

export type ApplePurchaseRecord = {
  userId: string;
  transaction: ValidAppleTransaction;
  source: AppleIapSource | "notification";
  signedTransactionInfo: string;
  notificationType: string | null;
};

export async function verifyApplePurchaseForUser(opts: {
  userId: string;
  signedTransactionInfo: string;
  source: AppleIapSource;
  deps: {
    db: ApplePurchaseDb;
    fetchAndValidateTransaction: (signedTransactionInfo: string) => Promise<{
      signedTransactionInfo: string;
      transaction: ValidAppleTransaction;
    }>;
  };
}): Promise<{ ok: true; purchasedAt: Date }> {
  const user = await opts.deps.db.getUser(opts.userId);
  if (!user) {
    throw new Error("apple purchase user not found");
  }

  const { signedTransactionInfo, transaction } = await opts.deps.fetchAndValidateTransaction(opts.signedTransactionInfo);

  const recordedPurchase = await opts.deps.db.recordApplePurchase({
    userId: opts.userId,
    transaction,
    source: opts.source,
    signedTransactionInfo,
    notificationType: null,
  });
  if (recordedPurchase.userId !== opts.userId) {
    throw new Error("apple transaction belongs to another user");
  }

  if (user.purchasedAt) {
    return { ok: true, purchasedAt: user.purchasedAt };
  }

  await opts.deps.db.markUserPurchased(opts.userId, transaction.purchaseDate);
  return { ok: true, purchasedAt: transaction.purchaseDate };
}
