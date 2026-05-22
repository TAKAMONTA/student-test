import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getSession, hasPurchase } from "@/lib/auth";

const bodySchema = z.object({
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  const sessionUser = await getSession();
  if (sessionUser && hasPurchase(sessionUser)) {
    return NextResponse.json({ error: "すでに購入済みです" }, { status: 409 });
  }

  const bodyResult = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!bodyResult.success) {
    return NextResponse.json({ error: "メールアドレスを正しく入力してください" }, { status: 400 });
  }
  const email = sessionUser?.email ?? bodyResult.data.email;

  if (!email) {
    return NextResponse.json({ error: "メールアドレスを入力してください" }, { status: 400 });
  }

  const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
  const priceId = process.env["STRIPE_PRICE_ID"];
  const appUrl = process.env["APP_URL"] ?? "http://localhost:3000";

  if (!stripeSecretKey || !priceId) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/buy`,
      customer_email: email,
      metadata: {
        email,
        ...(sessionUser ? { userId: sessionUser.id } : {}),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Stripe session create failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
