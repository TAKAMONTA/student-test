import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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
  return NextResponse.redirect(new URL(`/checkout/success?session_id=${encodeURIComponent(session.id)}`, req.url));
}
