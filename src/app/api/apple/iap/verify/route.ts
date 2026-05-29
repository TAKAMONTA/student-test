import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { applePurchases, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import {
  fetchAppleTransactionInfo,
  readAppleIapConfig,
  validateAppleLifetimeTransaction,
} from "@/lib/apple-iap";
import {
  verifyApplePurchaseForUser,
  type ApplePurchaseDb,
  type ApplePurchaseRecord,
} from "@/lib/apple-purchase";
import { captureServerEvent } from "@/lib/analytics-server";

const bodySchema = z.object({
  signedTransactionInfo: z.string().min(20),
  source: z.enum(["purchase", "restore", "update"]),
});

function createApplePurchaseDb(): ApplePurchaseDb {
  const db = getDb();

  return {
    async getUser(userId: string) {
      const row = await db
        .select({ id: users.id, purchasedAt: users.purchasedAt })
        .from(users)
        .where(eq(users.id, userId))
        .get();
      return row ?? null;
    },

    async recordApplePurchase(record: ApplePurchaseRecord) {
      const now = new Date();
      const inserted = await db.insert(applePurchases)
        .values({
          transactionId: record.transaction.transactionId,
          originalTransactionId: record.transaction.originalTransactionId,
          webOrderLineItemId: record.transaction.webOrderLineItemId,
          userId: record.userId,
          productId: record.transaction.productId,
          environment: record.transaction.environment,
          purchaseDate: record.transaction.purchaseDate,
          revocationDate: record.transaction.revocationDate,
          revocationReason: record.transaction.revocationReason,
          signedTransactionInfo: record.signedTransactionInfo,
          source: record.source,
          notificationType: record.notificationType,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing()
        .returning({ userId: applePurchases.userId })
        .get();

      if (inserted) return inserted;

      const existing = await db
        .select({ userId: applePurchases.userId })
        .from(applePurchases)
        .where(eq(applePurchases.transactionId, record.transaction.transactionId))
        .get();
      if (!existing) throw new Error("apple purchase record conflict");
      return existing;
    },

    async markUserPurchased(userId: string, purchasedAt: Date) {
      await db.update(users)
        .set({ purchasedAt, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .execute();
    },
  };
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;
  const userId = authResult.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const config = readAppleIapConfig();
    const result = await verifyApplePurchaseForUser({
      userId,
      signedTransactionInfo: parsed.data.signedTransactionInfo,
      source: parsed.data.source,
      deps: {
        db: createApplePurchaseDb(),
        async fetchAndValidateTransaction(signedTransactionInfo: string) {
          const transactionInfo = await fetchAppleTransactionInfo({
            ...config,
            signedTransactionInfo,
          });
          return {
            signedTransactionInfo: transactionInfo.signedTransactionInfo,
            transaction: validateAppleLifetimeTransaction(transactionInfo.payload, config),
          };
        },
      },
    });

    // Only fire on fresh purchases, not restores or updates.
    if (parsed.data.source === "purchase") {
      await captureServerEvent({
        host: process.env["POSTHOG_HOST"] ?? "",
        apiKey: process.env["POSTHOG_PROJECT_API_KEY"] ?? "",
        event: "purchase_completed",
        distinctId: userId,
        properties: {
          channel: "ios",
          source: parsed.data.source,
          purchased_at: result.purchasedAt.toISOString(),
          $set: {
            purchased_at: result.purchasedAt.getTime(),
            purchase_channel: "ios",
          },
        },
      });
    }

    return NextResponse.json({ ok: true, purchasedAt: result.purchasedAt.getTime() });
  } catch (err) {
    console.error("apple purchase verification failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Apple purchase verification failed" }, { status: 400 });
  }
}
