import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
  const priceId = process.env["STRIPE_PRICE_ID"];
  const appUrl = process.env["APP_URL"] ?? "http://localhost:3000";

  if (!stripeSecretKey || !priceId) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/buy`,
    customer_email: user.email,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: session.url });
}
