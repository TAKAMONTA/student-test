import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { subjects, topics, topicProgress, attempts, questions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

const MASTERY_LABELS = ["未学習", "初級", "中級", "マスター"] as const;
const MASTERY_COLORS = [
  "text-slate-400",
  "text-yellow-500",
  "text-orange-500",
  "text-green-600",
] as const;

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) redirect("/login");
  const user = authResult;

  const { slug } = await params;
  const db = getDb();

  const subject = await db.select().from(subjects).where(eq(subjects.slug, slug)).get();
  if (!subject) notFound();

  const subjectTopics = await db
    .select()
    .from(topics)
    .where(eq(topics.subjectId, subject.id))
    .all();
  subjectTopics.sort((a, b) => a.order - b.order);

  const progressRows = await db
    .select()
    .from(topicProgress)
    .where(eq(topicProgress.userId, user.id))
    .all();
  const progressMap = new Map(progressRows.map((p) => [p.topicId, p]));

  const topicIds = subjectTopics.map((t) => t.id);
  const attemptStats =
    topicIds.length > 0
      ? await db
          .select({
            topicId: questions.topicId,
            total: sql<number>`count(*)`,
            correct: sql<number>`sum(case when ${attempts.isCorrect} then 1 else 0 end)`,
          })
          .from(attempts)
          .innerJoin(questions, eq(attempts.questionId, questions.id))
          .where(
            and(
              eq(attempts.userId, user.id),
              inArray(questions.topicId, topicIds),
            ),
          )
          .groupBy(questions.topicId)
          .all()
      : [];
  const attemptMap = new Map(attemptStats.map((s) => [s.topicId, s]));

  return (
    <div>
      <div className="mb-6">
        <Link href="/home" className="text-sm text-indigo-600 hover:underline">
          ← ホームに戻る
        </Link>
        <h1 className="text-xl font-bold text-slate-900 mt-2">{subject.name}</h1>
        <p className="text-sm text-slate-500 mt-1">{subjectTopics.length} 単元</p>
      </div>

      <div className="grid gap-3">
        {subjectTopics.map((topic) => {
          const progress = progressMap.get(topic.id);
          const level = progress?.masteryLevel ?? 0;
          const stats = attemptMap.get(topic.id);
          const total = Number(stats?.total ?? 0);
          const correct = Number(stats?.correct ?? 0);
          const inProgress = level < 3 && total > 0;
          const label = inProgress ? "進行中" : MASTERY_LABELS[level];
          const labelColor = inProgress ? "text-indigo-600" : MASTERY_COLORS[level];
          return (
            <Link
              key={topic.id}
              href={`/topic/${topic.id}`}
              className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{topic.name}</p>
                <p className={`text-xs mt-0.5 font-semibold ${labelColor}`}>
                  {label}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {total > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">挑戦 {total} 問</p>
                    <p className="text-xs text-slate-400">正解 {correct} 問</p>
                  </div>
                )}
                {level >= 3 && <span className="text-green-500 text-lg">✓</span>}
                <span className="text-slate-300 text-lg">›</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
