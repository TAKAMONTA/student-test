import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { subjects, topics, topicProgress } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  const { slug } = await params;
  const db = getDb();

  const subject = await db.select().from(subjects).where(eq(subjects.slug, slug)).get();
  if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const topicRows = await db
    .select()
    .from(topics)
    .where(eq(topics.subjectId, subject.id))
    .orderBy(asc(topics.order))
    .all();

  const progressRows = await db
    .select()
    .from(topicProgress)
    .where(eq(topicProgress.userId, user.id))
    .all();

  const progressMap = new Map(progressRows.map((p) => [p.topicId, p]));

  const result = topicRows.map((t) => ({
    ...t,
    progress: progressMap.get(t.id) ?? { masteryLevel: 0, consecutiveCorrect: 0, lastStudiedAt: null },
  }));

  return NextResponse.json({ subject, topics: result });
}
