import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { createMagicToken } from "@/lib/magic-link";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const { email } = parsed.data;

  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  if (!existing) {
    await db.insert(users).values({ id: nanoid(), email }).execute();
  }

  const secret = process.env["JWT_SECRET"];
  if (!secret) return NextResponse.json({ error: "Server error" }, { status: 500 });

  const token = await createMagicToken({ email, secret });
  const url = `${process.env["APP_URL"]}/api/auth/verify?token=${token}`;

  const resend = new Resend(process.env["RESEND_API_KEY"]);
  await resend.emails.send({
    from: process.env["RESEND_FROM_EMAIL"] ?? "noreply@example.com",
    to: email,
    subject: "中1テストキット ログインリンク",
    html: `<p><a href="${url}">こちらをクリックしてログイン</a>（15分間有効）</p>`,
  });

  return NextResponse.json({ ok: true });
}
