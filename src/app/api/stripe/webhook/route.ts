import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { createMagicToken } from "@/lib/magic-link";

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
      const sessionEmail =
        session.metadata?.["email"] ?? session.customer_details?.email ?? session.customer_email ?? null;

      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const db = getDb();
      let user:
        | {
            id: string;
            email: string;
          }
        | undefined;

      if (userId) {
        user = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, userId)).get();
      }

      if (!user && sessionEmail) {
        user = await db
          .select({ id: users.id, email: users.email })
          .from(users)
          .where(eq(users.email, sessionEmail))
          .get();
      }

      if (user) {
        await db
          .update(users)
          .set({ purchasedAt: new Date(now), expiresAt: new Date(now + thirtyDays), updatedAt: new Date(now) })
          .where(eq(users.id, user.id))
          .execute();
      } else if (sessionEmail) {
        const newId = nanoid();
        await db
          .insert(users)
          .values({
            id: newId,
            email: sessionEmail,
            purchasedAt: new Date(now),
            expiresAt: new Date(now + thirtyDays),
            updatedAt: new Date(now),
          })
          .execute();
        user = { id: newId, email: sessionEmail };
      } else {
        console.error("checkout.session.completed has no user identity", {
          eventId: event.id,
          sessionId: session.id,
        });
      }

      // Purchase success must not fail if email delivery fails.
      if (user) {
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
            }
          } catch (mailErr) {
            console.error("purchase mail send exception", { error: String(mailErr) });
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
