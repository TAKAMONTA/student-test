import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { sessionCookieOptions } from "@/lib/cookie-options";
import { signSessionToken } from "@/lib/session";

const bodySchema = z.object({
  email: z.string().email(),
  secret: z.string().min(1),
});

export async function POST(req: NextRequest) {
  if (process.env["ENABLE_TEST_LOGIN"] !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const testSecret = process.env["TEST_LOGIN_SECRET"];
  const jwtSecret = process.env["JWT_SECRET"];
  if (!testSecret || !jwtSecret) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (parsed.data.secret !== testSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = parsed.data.email.toLowerCase();
  const allowedEmails = (process.env["TEST_LOGIN_ALLOWED_EMAILS"] ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const isAllowedEmail = email.endsWith("@takaapps.com") || allowedEmails.includes(email);
  if (!isAllowedEmail) {
    return NextResponse.json({ error: "Forbidden email" }, { status: 403 });
  }

  const db = getDb();
  let user = await db.select().from(users).where(eq(users.email, email)).get();

  if (!user) {
    const id = nanoid();
    await db.insert(users).values({ id, email }).execute();
    user = await db.select().from(users).where(eq(users.id, id)).get();
  }
  if (!user) {
    return NextResponse.json({ error: "User creation failed" }, { status: 500 });
  }

  const sessionToken = await signSessionToken({ userId: user.id, secret: jwtSecret });
  console.info("test login issued", { email: user.email });
  const res = NextResponse.json({ ok: true, email: user.email });
  res.cookies.set("session", sessionToken, sessionCookieOptions(req.url));
  return res;
}
