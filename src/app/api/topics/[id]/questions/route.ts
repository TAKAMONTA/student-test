import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { questions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;

  const { id } = await params;
  const topicId = parseInt(id, 10);
  if (isNaN(topicId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const db = getDb();
  const rows = await db.select().from(questions).where(eq(questions.topicId, topicId)).all();

  // Strip answer/explanation — revealed only after attempt
  const safe = rows.map(({ answer: _a, explanation: _e, ...rest }) => rest);
  return NextResponse.json(safe);
}
