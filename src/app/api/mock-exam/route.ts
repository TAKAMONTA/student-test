import { NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { users, subjects, topics, questions, attempts, mockExams, mockExamItems } from "@/db/schema";
import { requireAuth, hasPurchase } from "@/lib/auth";
import { isAnswerCorrect } from "@/lib/answers";
import { findQuestionPoolProblems, pickQuestionIdsBySubject, type SubjectQuestionPool } from "@/lib/mock-exam";

const QUESTIONS_PER_SUBJECT = 5;
const UNLOCK_DAYS_BEFORE = 7;

const startSchema = z.object({
  scope: z.enum(["midterm", "final"]).default("midterm"),
});

const submitSchema = z.object({
  examId: z.number().int(),
  questionId: z.number().int(),
  userAnswer: z.string().min(1),
});

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  const db = getDb();
  const exams = await db.select().from(mockExams).where(eq(mockExams.userId, user.id)).all();
  return NextResponse.json(exams);
}

export async function POST(req: Request) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  if (!hasPurchase(user)) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  let scope: "midterm" | "final" = "midterm";
  try {
    const body = await req.json();
    const parsed = startSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    scope = parsed.data.scope;
  } catch {
    // Allow legacy clients that POST without a body.
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
  const questionPools: SubjectQuestionPool[] = [];

  for (const subject of allSubjects) {
    const subjectTopics =
      scope === "midterm"
        ? await db
            .select()
            .from(topics)
            .where(and(eq(topics.subjectId, subject.id), eq(topics.midtermScope, true)))
            .all()
        : await db.select().from(topics).where(eq(topics.subjectId, subject.id)).all();
    const topicIds = subjectTopics.map((t) => t.id);
    if (topicIds.length === 0) {
      questionPools.push({ subjectId: subject.id, subjectName: subject.name, questionIds: [] });
      continue;
    }

    const subjectQuestions = await db
      .select({ id: questions.id })
      .from(questions)
      .where(inArray(questions.topicId, topicIds))
      .all();

    questionPools.push({
      subjectId: subject.id,
      subjectName: subject.name,
      questionIds: subjectQuestions.map((q) => q.id),
    });
  }

  const poolProblems = findQuestionPoolProblems(questionPools, QUESTIONS_PER_SUBJECT);
  if (poolProblems.length > 0) {
    return NextResponse.json(
      {
        error: "Not enough questions to start mock exam",
        requiredPerSubject: QUESTIONS_PER_SUBJECT,
        problems: poolProblems,
      },
      { status: 409 },
    );
  }

  const selectedQuestionIds = pickQuestionIdsBySubject(questionPools, QUESTIONS_PER_SUBJECT);

  const [exam] = await db
    .insert(mockExams)
    .values({ userId: user.id, startedAt: new Date() })
    .returning();

  if (!exam) return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });

  await db
    .insert(mockExamItems)
    .values(selectedQuestionIds.map((qId) => ({ examId: exam.id, questionId: qId })))
    .execute();

  const questionRows = await db
    .select({
      id: questions.id,
      text: questions.questionText,
      type: questions.type,
      choices: questions.choices,
      topicId: questions.topicId,
    })
    .from(questions)
    .where(inArray(questions.id, selectedQuestionIds))
    .all();

  return NextResponse.json({ examId: exam.id, scope, questions: questionRows });
}

export async function PATCH(req: Request) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;
  const user = authResult;

  const parsed = submitSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { examId, questionId, userAnswer } = parsed.data;

  const db = getDb();
  const exam = await db
    .select()
    .from(mockExams)
    .where(and(eq(mockExams.id, examId), eq(mockExams.userId, user.id)))
    .get();
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  if (exam.finishedAt) {
    return NextResponse.json({ error: "Exam already finished" }, { status: 409 });
  }

  const item = await db
    .select()
    .from(mockExamItems)
    .where(and(eq(mockExamItems.examId, examId), eq(mockExamItems.questionId, questionId)))
    .get();
  if (!item) return NextResponse.json({ error: "Question not in exam" }, { status: 404 });

  const question = await db.select().from(questions).where(eq(questions.id, questionId)).get();
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const trimmedAnswer = userAnswer.trim();
  const isCorrect = isAnswerCorrect(trimmedAnswer, question.answer);

  await db
    .update(mockExamItems)
    .set({ userAnswer: trimmedAnswer, isCorrect })
    .where(and(eq(mockExamItems.examId, examId), eq(mockExamItems.questionId, questionId)))
    .execute();

  await db
    .insert(attempts)
    .values({
      userId: user.id,
      questionId,
      userAnswer: trimmedAnswer,
      isCorrect,
      attemptedAt: new Date(),
    })
    .execute();

  const items = await db
    .select({
      userAnswer: mockExamItems.userAnswer,
      isCorrect: mockExamItems.isCorrect,
    })
    .from(mockExamItems)
    .where(eq(mockExamItems.examId, examId))
    .all();
  const answeredCount = items.filter((row) => row.userAnswer !== null).length;
  const score = items.filter((row) => row.isCorrect).length;
  const finished = items.length > 0 && answeredCount === items.length;

  if (finished) {
    await db
      .update(mockExams)
      .set({ finishedAt: new Date(), score })
      .where(and(eq(mockExams.id, examId), eq(mockExams.userId, user.id)))
      .execute();
  }

  return NextResponse.json({
    isCorrect,
    answer: question.answer,
    explanation: question.explanation,
    finished,
    score: finished ? score : null,
  });
}
