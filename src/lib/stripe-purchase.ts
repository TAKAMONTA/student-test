import { sql } from "drizzle-orm";
import type { Db } from "@/db/client";

type EmailCarrier = {
  metadata?: Record<string, string> | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
};

export function getCheckoutSessionEmail(session: EmailCarrier): string | null {
  return (
    session.metadata?.["email"] ??
    session.customer_details?.email ??
    session.customer_email ??
    null
  );
}

export function getPaymentIntentId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

export type StripePurchaseResumeState = {
  userId: string | null;
  purchaseEmail: string | null;
  emailSendStatus: StripePurchaseEmailSendStatus;
};

export type StripePurchaseResumeContext = {
  userId?: string | null;
  purchaseEmail?: string | null;
};

export type StripePurchaseEmailSendStatus = "skipped" | "sending" | "sent" | "failed";

export function shouldResumeStripePurchase(
  purchase: StripePurchaseResumeState,
  currentEvent: StripePurchaseResumeContext = {},
): boolean {
  const candidateUserId = purchase.userId ?? currentEvent.userId ?? null;
  const candidateEmail = purchase.purchaseEmail ?? currentEvent.purchaseEmail ?? null;

  if (!purchase.userId && candidateUserId) {
    return true;
  }
  if (!candidateUserId) {
    return Boolean(candidateEmail);
  }
  return shouldAttemptPurchaseEmail(purchase.emailSendStatus);
}

export function isUnrecoverableStripePurchase(
  purchase: StripePurchaseResumeState,
  currentEvent: StripePurchaseResumeContext = {},
): boolean {
  const candidateUserId = purchase.userId ?? currentEvent.userId ?? null;
  const candidateEmail = purchase.purchaseEmail ?? currentEvent.purchaseEmail ?? null;
  return !candidateUserId && !candidateEmail;
}

export function shouldAttemptPurchaseEmail(emailSendStatus: StripePurchaseEmailSendStatus): boolean {
  return emailSendStatus === "skipped" || emailSendStatus === "failed";
}

export async function claimStripePurchaseEmail(db: Db, sessionId: string): Promise<boolean> {
  const result = await db.run(sql`
    UPDATE stripe_purchases
    SET email_send_status = 'sending'
    WHERE session_id = ${sessionId}
      AND email_send_status IN ('skipped', 'failed')
  `);

  return Number((result as D1Result).meta?.changes ?? 0) > 0;
}

export async function completeStripePurchaseEmail(
  db: Db,
  opts: { sessionId: string; status: "sent" | "failed" },
): Promise<void> {
  await db.run(sql`
    UPDATE stripe_purchases
    SET email_send_status = ${opts.status}
    WHERE session_id = ${opts.sessionId}
      AND email_send_status = 'sending'
  `);
}
