import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { sql } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { nanoid } from "nanoid";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { sessionCookieOptions } from "@/lib/cookie-options";
import { createMagicToken } from "@/lib/magic-link";
import { getClientIp, normalizeRateLimitEmail, reserveRateLimits } from "@/lib/rate-limit";
import { signSessionToken } from "@/lib/session";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = normalizeRateLimitEmail(parsed.data.email);
  const ip = getClientIp(req.headers);
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const isLocalTestLogin = isLocalTestLoginRequest(req, email);
  const resendApiKey = process.env["RESEND_API_KEY"];
  const resendFromEmail = process.env["RESEND_FROM_EMAIL"];
  const appUrl = process.env["APP_URL"];
  if (!isLocalTestLogin && (!resendApiKey || !resendFromEmail || !appUrl)) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const db = getDb();
  const limit = await reserveRateLimits(
    db,
    [
      { key: `auth_email:${email}`, limit: 5 },
      { key: `auth_ip:${ip}`, limit: 20 },
    ],
    60 * 60,
  );
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const existing = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .get();

  const loginUser = await (async () => {
    if (existing) return existing;

    const inserted = await db
      .insert(users)
      .values({ id: nanoid(), email })
      .onConflictDoNothing()
      .returning({ id: users.id, email: users.email })
      .get();
    if (inserted) return inserted;

    const conflicted = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .get();
    if (conflicted) return conflicted;

    throw new Error("auth user insert conflict");
  })();

  if (isLocalTestLogin) {
    const sessionToken = await signSessionToken({ userId: loginUser.id, secret });
    const res = NextResponse.json({ ok: true, directLogin: true, redirectTo: "/home" });
    res.cookies.set("session", sessionToken, sessionCookieOptions(req.url));
    return res;
  }

  if (!resendApiKey || !resendFromEmail || !appUrl) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const { ctx } = getCloudflareContext();
  ctx.waitUntil(
    sendLoginEmail({
      email: loginUser.email,
      secret,
      resendApiKey,
      resendFromEmail,
      appUrl,
    }),
  );

  return NextResponse.json({ ok: true });
}

function isLocalTestLoginRequest(req: NextRequest, email: string): boolean {
  if (process.env["ENABLE_TEST_LOGIN"] !== "true") return false;

  const hostname = req.nextUrl.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  if (!isLocalhost) return false;

  const allowedEmails = (process.env["TEST_LOGIN_ALLOWED_EMAILS"] ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return email.endsWith("@takaapps.com") || allowedEmails.includes(email);
}

async function sendLoginEmail(opts: {
  email: string;
  secret: string;
  resendApiKey: string;
  resendFromEmail: string;
  appUrl: string;
}) {
  try {
    const token = await createMagicToken({ email: opts.email, secret: opts.secret });
    const url = `${opts.appUrl}/api/auth/verify?token=${token}`;

    const resend = new Resend(opts.resendApiKey);
    const { data, error } = await resend.emails.send({
      from: opts.resendFromEmail,
      to: opts.email,
      subject: "中1テストキット ログインリンク",
      html: `<p><a href="${url}">こちらをクリックしてログイン</a>（15分間有効）</p>`,
    });
    if (error) {
      console.error("Resend email send failed:", error);
      return;
    }
    if (!data?.id) {
      console.error("Resend email send returned no message id");
    }
  } catch (err) {
    console.error("Resend email send exception:", err);
  }
}
