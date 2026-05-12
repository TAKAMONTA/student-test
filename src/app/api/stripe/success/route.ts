import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.redirect(new URL("/buy?error=missing_session", req.url));
  }

  const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
  if (!stripeSecretKey) {
    return NextResponse.redirect(new URL("/buy?error=server_error", req.url));
  }

  const stripe = new Stripe(stripeSecretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.redirect(new URL("/buy?error=not_paid", req.url));
  }

  const userId = session.metadata?.["userId"];
  if (!userId) {
    return NextResponse.redirect(new URL("/buy?error=missing_user", req.url));
  }

  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  const db = getDb();
  await db
    .update(users)
    .set({ purchasedAt: new Date(now), expiresAt: new Date(now + thirtyDays), updatedAt: new Date(now) })
    .where(eq(users.id, userId))
    .execute();

  return NextResponse.redirect(new URL("/setup", req.url));
}
