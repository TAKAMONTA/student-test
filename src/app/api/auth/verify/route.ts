import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { verifyMagicToken } from "@/lib/magic-link";
import { signSessionToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.url));
  }

  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }

  let email: string;
  try {
    ({ email } = await verifyMagicToken({ token, secret }));
  } catch {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  const db = getDb();
  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=user_not_found", req.url));
  }

  const sessionToken = await signSessionToken({ userId: user.id, secret });

  const isPurchased = user.purchasedAt !== null;
  const destination = isPurchased ? "/home" : "/buy";

  const res = NextResponse.redirect(new URL(destination, req.url));
  res.cookies.set("session", sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
