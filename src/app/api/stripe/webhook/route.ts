import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { getDb } from "@/db/client";
import { stripePurchases, users } from "@/db/schema";
import { createMagicToken } from "@/lib/magic-link";
import {
  claimStripePurchaseEmail,
  completeStripePurchaseEmail,
  getCheckoutSessionEmail,
  getPaymentIntentId,
  isUnrecoverableStripePurchase,
  shouldAttemptPurchaseEmail,
  shouldResumeStripePurchase,
  type StripePurchaseEmailSendStatus,
} from "@/lib/stripe-purchase";
import { captureServerEvent } from "@/lib/analytics-server";
import { hashEmailForAnalytics } from "@/lib/email-hash";

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      const userId = session.metadata?.["userId"];
      const sessionEmail = getCheckoutSessionEmail(session);

      const receivedAt = new Date();
      const now = receivedAt.getTime();
      const db = getDb();
      let duplicateDelivery = false;
      let existingPurchase:
        | {
            userId: string | null;
            purchaseEmail: string | null;
            emailSendStatus: StripePurchaseEmailSendStatus;
          }
        | undefined;
      const insertedPurchase = await db
        .insert(stripePurchases)
        .values({
          sessionId: session.id,
          eventId: event.id,
          paymentIntentId: getPaymentIntentId(session.payment_intent),
          amountTotal: session.amount_total,
          currency: session.currency,
          purchaseEmail: sessionEmail,
          webhookReceivedAt: receivedAt,
        })
        .onConflictDoNothing()
        .returning({ sessionId: stripePurchases.sessionId })
        .get();

      if (!insertedPurchase) {
        duplicateDelivery = true;
        existingPurchase = await db
          .select({
            userId: stripePurchases.userId,
            purchaseEmail: stripePurchases.purchaseEmail,
            emailSendStatus: stripePurchases.emailSendStatus,
          })
          .from(stripePurchases)
          .where(eq(stripePurchases.sessionId, session.id))
          .get();

        if (!existingPurchase) {
          console.error("stripe purchase insert conflicted without existing session row", {
            eventId: event.id,
            sessionId: session.id,
          });
          return NextResponse.json({ error: "Webhook state conflict" }, { status: 500 });
        }

        const currentPurchaseIdentity = { userId, purchaseEmail: sessionEmail };
        if (!shouldResumeStripePurchase(existingPurchase, currentPurchaseIdentity)) {
          if (isUnrecoverableStripePurchase(existingPurchase, currentPurchaseIdentity)) {
            console.error("stripe purchase duplicate has no recoverable identity", {
              eventId: event.id,
              sessionId: session.id,
            });
            return NextResponse.json({ error: "Webhook state incomplete" }, { status: 500 });
          }
          return NextResponse.json({ received: true, duplicate: true });
        }
      }

      const purchaseEmail = sessionEmail ?? existingPurchase?.purchaseEmail ?? null;
      const purchaseUserId = userId ?? existingPurchase?.userId ?? undefined;
      let user:
        | {
            id: string;
            email: string;
            purchasedAt: Date | null;
          }
        | undefined;

      if (purchaseUserId) {
        user = await db
          .select({ id: users.id, email: users.email, purchasedAt: users.purchasedAt })
          .from(users)
          .where(eq(users.id, purchaseUserId))
          .get();
      }

      if (!user && purchaseEmail) {
        user = await db
          .select({ id: users.id, email: users.email, purchasedAt: users.purchasedAt })
          .from(users)
          .where(sql`lower(${users.email}) = ${purchaseEmail.toLowerCase()}`)
          .get();
      }

      if (user) {
        await db
          .update(users)
          .set({ purchasedAt: user.purchasedAt ?? new Date(now), updatedAt: new Date(now) })
          .where(eq(users.id, user.id))
          .execute();
      } else if (purchaseEmail) {
        const newId = nanoid();
        await db
          .insert(users)
          .values({
            id: newId,
            email: purchaseEmail,
            purchasedAt: new Date(now),
            updatedAt: new Date(now),
          })
          .execute();
        user = { id: newId, email: purchaseEmail, purchasedAt: new Date(now) };
      } else {
        console.error("checkout.session.completed has no user identity", {
          eventId: event.id,
          sessionId: session.id,
        });
      }

      if (user) {
        await db
          .update(stripePurchases)
          .set({ userId: user.id, purchaseEmail: purchaseEmail ?? user.email })
          .where(eq(stripePurchases.sessionId, session.id))
          .execute();
      }

      // Emit purchase_completed only on the first successful delivery (skips duplicates).
      if (user && !duplicateDelivery) {
        const emailHash = await hashEmailForAnalytics(user.email);
        await captureServerEvent({
          host: process.env["POSTHOG_HOST"] ?? "",
          apiKey: process.env["POSTHOG_PROJECT_API_KEY"] ?? "",
          event: "purchase_completed",
          distinctId: user.id,
          properties: {
            channel: "stripe",
            email_hash: emailHash,
            amount: session.amount_total,
            currency: session.currency,
            session_id: session.id,
            $set: {
              purchased_at: now,
              purchase_channel: "stripe",
              email_hash: emailHash,
            },
          },
        });
      }

      // Purchase success must not fail if email delivery fails.
      const emailSendStatus: StripePurchaseEmailSendStatus = existingPurchase?.emailSendStatus ?? "skipped";
      if (user) {
        const shouldTryEmail = shouldAttemptPurchaseEmail(emailSendStatus);
        const claimedEmail = shouldTryEmail ? await claimStripePurchaseEmail(db, session.id) : false;
        if (claimedEmail) {
          let nextEmailStatus: "sent" | "failed" = "failed";
          const secret = process.env["JWT_SECRET"];
          const resendApiKey = process.env["RESEND_API_KEY"];
          const resendFromEmail = process.env["RESEND_FROM_EMAIL"];
          const appUrl = process.env["APP_URL"];
          if (!secret || !resendApiKey || !resendFromEmail || !appUrl) {
            console.error("purchase mail skipped due to missing env");
          } else {
            try {
              const token = await createMagicToken({ email: user.email, secret });
              const url = `${appUrl}/api/auth/verify?token=${token}`;
              const resend = new Resend(resendApiKey);
              const { data, error } = await resend.emails.send({
                from: resendFromEmail,
                to: user.email,
                subject: "中1テストキット ご購入ありがとうございます",
                html: `<p>ご購入ありがとうございます。</p><p><a href="${url}">こちらをクリックしてログイン</a>（15分間有効）</p>`,
              });
              if (error || !data?.id) {
                console.error("purchase mail send failed", { error, email: user.email });
              } else {
                nextEmailStatus = "sent";
              }
            } catch (mailErr) {
              console.error("purchase mail send exception", { error: String(mailErr) });
            }
          }

          await completeStripePurchaseEmail(db, { sessionId: session.id, status: nextEmailStatus });
        }
      }

      if (duplicateDelivery) {
        return NextResponse.json({ received: true, duplicate: true, resumed: true });
      }
    } else {
      // Emit purchase_failed when checkout.session.completed arrives without a paid status.
      await captureServerEvent({
        host: process.env["POSTHOG_HOST"] ?? "",
        apiKey: process.env["POSTHOG_PROJECT_API_KEY"] ?? "",
        event: "purchase_failed",
        distinctId: session.metadata?.["userId"] ?? `stripe_session:${session.id}`,
        properties: {
          channel: "stripe",
          reason: `payment_status:${session.payment_status ?? "unknown"}`,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
