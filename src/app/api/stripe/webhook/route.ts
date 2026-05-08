import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.["userId"];
    if (userId && session.payment_status === "paid") {
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const db = getDb();
      await db
        .update(users)
        .set({ purchasedAt: now, expiresAt: now + thirtyDays, updatedAt: now })
        .where(eq(users.id, userId))
        .execute();
    }
  }

  return NextResponse.json({ received: true });
}
