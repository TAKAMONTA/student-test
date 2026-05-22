import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { questions, attempts, topicProgress } from "@/db/schema";
import { requirePurchased } from "@/lib/auth";
import { isAnswerCorrect } from "@/lib/answers";

const bodySchema = z.object({
  questionId: z.number().int(),
  userAnswer: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePurchased();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  const { id } = await params;
  const topicId = parseInt(id, 10);
  if (isNaN(topicId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { questionId, userAnswer } = parsed.data;

  const db = getDb();
  const question = await db.select().from(questions).where(eq(questions.id, questionId)).get();
  if (!question || question.topicId !== topicId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const trimmedAnswer = userAnswer.trim();
  const isCorrect = isAnswerCorrect(trimmedAnswer, question.answer);

  await db.insert(attempts).values({
    userId: user.id,
    questionId,
    userAnswer: trimmedAnswer,
    isCorrect,
    attemptedAt: new Date(),
  }).execute();

  const existing = await db
    .select()
    .from(topicProgress)
    .where(and(eq(topicProgress.userId, user.id), eq(topicProgress.topicId, topicId)))
    .get();

  const consecutiveCorrect = isCorrect ? (existing?.consecutiveCorrect ?? 0) + 1 : 0;
  const masteryLevel = Math.min(3, Math.floor(consecutiveCorrect / 5));

  if (existing) {
    await db
      .update(topicProgress)
      .set({ masteryLevel, consecutiveCorrect, lastStudiedAt: new Date() })
      .where(and(eq(topicProgress.userId, user.id), eq(topicProgress.topicId, topicId)))
      .execute();
  } else {
    await db
      .insert(topicProgress)
      .values({ userId: user.id, topicId, masteryLevel, consecutiveCorrect, lastStudiedAt: new Date() })
      .execute();
  }

  return NextResponse.json({
    isCorrect,
    answer: question.answer,
    explanation: question.explanation,
    masteryLevel,
    consecutiveCorrect,
  });
}
