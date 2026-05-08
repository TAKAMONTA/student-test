import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { lessons } from "@/db/schema";
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
  const lesson = await db.select().from(lessons).where(eq(lessons.topicId, topicId)).get();
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(lesson);
}
