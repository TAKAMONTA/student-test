import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

const patchSchema = z.object({
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  textbookPublisher: z.string().max(50).optional(),
});

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  const db = getDb();
  const row = await db.select().from(users).where(eq(users.id, user.id)).get();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: row.id,
    email: row.email,
    testDate: row.testDate,
    textbookPublisher: row.textbookPublisher,
    purchasedAt: row.purchasedAt,
    expiresAt: row.expiresAt,
  });
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const db = getDb();
  await db
    .update(users)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .execute();

  return NextResponse.json({ ok: true });
}
