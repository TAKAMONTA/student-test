import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { sql } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { nanoid } from "nanoid";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { createMagicToken } from "@/lib/magic-link";
import { getClientIp, normalizeRateLimitEmail, reserveRateLimits } from "@/lib/rate-limit";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = normalizeRateLimitEmail(parsed.data.email);
  const ip = getClientIp(req.headers);
  const secret = process.env["JWT_SECRET"];
  const resendApiKey = process.env["RESEND_API_KEY"];
  const resendFromEmail = process.env["RESEND_FROM_EMAIL"];
  const appUrl = process.env["APP_URL"];
  if (!secret || !resendApiKey || !resendFromEmail || !appUrl) {
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

  const loginUser = existing ?? {
    id: nanoid(),
    email,
  };

  if (!existing) {
    await db.insert(users)
      .values({
        id: loginUser.id,
        email: loginUser.email,
      })
      .execute();
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
