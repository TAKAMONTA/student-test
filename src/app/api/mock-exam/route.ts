import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users, subjects, topics, questions, mockExams, mockExamItems } from "@/db/schema";
import { requireAuth, hasPurchase } from "@/lib/auth";

const QUESTIONS_PER_SUBJECT = 5;
const UNLOCK_DAYS_BEFORE = 7;

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  const db = getDb();
  const exams = await db.select().from(mockExams).where(eq(mockExams.userId, user.id)).all();
  return NextResponse.json(exams);
}

export async function POST() {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  if (!hasPurchase(user)) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const db = getDb();
  const userRow = await db.select().from(users).where(eq(users.id, user.id)).get();
  if (!userRow?.testDate) {
    return NextResponse.json({ error: "Test date not set" }, { status: 400 });
  }

  const testDate = new Date(userRow.testDate);
  const unlockDate = new Date(testDate);
  unlockDate.setDate(unlockDate.getDate() - UNLOCK_DAYS_BEFORE);

  if (new Date() < unlockDate) {
    return NextResponse.json(
      { error: "Mock exam unlocks 7 days before test date", unlockDate: unlockDate.toISOString() },
      { status: 403 }
    );
  }

  const allSubjects = await db.select().from(subjects).all();
  const selectedQuestionIds: number[] = [];

  for (const subject of allSubjects) {
    const subjectTopics = await db.select().from(topics).where(eq(topics.subjectId, subject.id)).all();
    const topicIds = subjectTopics.map((t) => t.id);
    if (topicIds.length === 0) continue;

    const subjectQuestions = await db
      .select({ id: questions.id })
      .from(questions)
      .where(inArray(questions.topicId, topicIds))
      .all();

    const shuffled = subjectQuestions.sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, QUESTIONS_PER_SUBJECT).map((q) => q.id);
    selectedQuestionIds.push(...picked);
  }

  const now = Date.now();
  const [exam] = await db
    .insert(mockExams)
    .values({ userId: user.id, startedAt: now })
    .returning();

  if (!exam) return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });

  await db
    .insert(mockExamItems)
    .values(selectedQuestionIds.map((qId) => ({ examId: exam.id, questionId: qId })))
    .execute();

  return NextResponse.json({ examId: exam.id, questionIds: selectedQuestionIds });
}
