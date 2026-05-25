import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { applePurchases } from "@/db/schema";
import {
  decodeAppleNotificationPayload,
  normalizeAppleNotification,
} from "@/lib/apple-notifications";

const bodySchema = z.object({
  signedPayload: z.string().min(20),
});

export async function POST(req: NextRequest) {
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
    const decoded = decodeAppleNotificationPayload(parsed.data.signedPayload);
    const notification = normalizeAppleNotification(decoded);
    const db = getDb();

    await db.update(applePurchases)
      .set({
        revocationDate: notification.revocationDate,
        revocationReason: notification.revocationReason,
        notificationType: notification.notificationType,
        signedTransactionInfo: notification.signedTransactionInfo,
        updatedAt: new Date(),
      })
      .where(eq(applePurchases.transactionId, notification.transactionId))
      .execute();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("apple notification handling failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
  }
}
