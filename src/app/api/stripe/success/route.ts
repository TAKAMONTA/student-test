import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CHECKOUT_SUCCESS_COOKIE, createCheckoutSuccessToken } from "@/lib/checkout-success";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.redirect(new URL("/buy?error=missing_session", req.url));
  }

  const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
  const jwtSecret = process.env["JWT_SECRET"];
  if (!stripeSecretKey || !jwtSecret) {
    return NextResponse.redirect(new URL("/buy?error=server_error", req.url));
  }

  const stripe = new Stripe(stripeSecretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.redirect(new URL("/buy?error=not_paid", req.url));
  }
  const token = await createCheckoutSuccessToken({ sessionId: session.id, secret: jwtSecret });
  const res = NextResponse.redirect(new URL("/checkout/success?verified=1", req.url));
  res.cookies.set(CHECKOUT_SUCCESS_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/checkout/success",
  });
  return res;
}
