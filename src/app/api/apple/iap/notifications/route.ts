import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { applePurchases } from "@/db/schema";
import {
  decodeAppleNotificationPayload,
  normalizeAppleNotification,
  readAppleNotificationConfig,
  validateAppleNotificationForApp,
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

  let notification;
  try {
    const config = readAppleNotificationConfig();
    notification = validateAppleNotificationForApp(
      normalizeAppleNotification(decodeAppleNotificationPayload(parsed.data.signedPayload)),
      config,
    );
  } catch (err) {
    console.error("apple notification validation failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
  }

  try {
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
    console.error("apple notification persistence failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Notification persistence failed" }, { status: 500 });
  }
}
