import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq, and } from "drizzle-orm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDb } from "@/db/client";
import { topics, lessons, topicProgress, subjects } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { emphasizeLessonTerms } from "@/lib/lesson-emphasis";

const MASTERY_LABELS = ["未学習", "初級", "中級", "マスター"] as const;

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) redirect("/login");
  const user = authResult;

  const { id } = await params;
  const topicId = parseInt(id, 10);
  if (isNaN(topicId)) notFound();

  const db = getDb();
  const topic = await db.select().from(topics).where(eq(topics.id, topicId)).get();
  if (!topic) notFound();

  const subject = await db
    .select()
    .from(subjects)
    .where(eq(subjects.id, topic.subjectId))
    .get();

  const lesson = await db.select().from(lessons).where(eq(lessons.topicId, topicId)).get();

  const progress = await db
    .select()
    .from(topicProgress)
    .where(and(eq(topicProgress.userId, user.id), eq(topicProgress.topicId, topicId)))
    .get();

  const level = progress?.masteryLevel ?? 0;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/home" className="hover:text-indigo-600">ホーム</Link>
        <span>›</span>
        {subject && (
          <>
            <Link href={`/subject/${subject.slug}`} className="hover:text-indigo-600">
              {subject.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-slate-700">{topic.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">{topic.name}</h1>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
          {MASTERY_LABELS[level]}
        </span>
      </div>

      {lesson ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="font-bold text-slate-800 mb-4">📖 解説</h2>
          <div className="text-slate-700 text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: (props) => (
                  <h3 className="text-lg font-bold text-slate-900 mt-5 first:mt-0 mb-3" {...props} />
                ),
                h2: (props) => (
                  <h4 className="text-base font-bold text-slate-900 mt-5 first:mt-0 mb-2 pb-1 border-b border-slate-200" {...props} />
                ),
                h3: (props) => (
                  <h5 className="text-sm font-bold text-indigo-700 mt-4 mb-1.5" {...props} />
                ),
                p: (props) => (
                  <p className="text-slate-700 text-sm leading-relaxed mb-3" {...props} />
                ),
                strong: (props) => (
                  <strong className="font-bold text-slate-900" {...props} />
                ),
                em: (props) => <em className="italic" {...props} />,
                ul: (props) => (
                  <ul className="list-disc pl-5 mb-3 space-y-1.5 text-sm text-slate-700" {...props} />
                ),
                ol: (props) => (
                  <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-sm text-slate-700" {...props} />
                ),
                li: (props) => <li className="leading-relaxed" {...props} />,
                code: (props) => (
                  <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                ),
                blockquote: (props) => (
                  <blockquote className="border-l-4 border-indigo-200 pl-4 my-3 text-slate-600 italic" {...props} />
                ),
                hr: () => <hr className="my-4 border-slate-200" />,
              }}
            >
              {emphasizeLessonTerms(lesson.contentMd)}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-6 text-center text-slate-400 text-sm">
          解説はまだ準備中です
        </div>
      )}

      <div className="grid gap-3">
        <Link
          href={`/topic/${topicId}/drill`}
          className="flex items-center justify-between bg-indigo-600 text-white rounded-2xl px-6 py-4 hover:bg-indigo-700 transition-colors"
        >
          <div>
            <p className="font-bold">ドリルを始める</p>
            <p className="text-indigo-200 text-xs mt-0.5">
              {progress
                ? `連続正解: ${progress.consecutiveCorrect} 問`
                : "問題を解いてマスターしよう"}
            </p>
          </div>
          <span className="text-2xl">✏️</span>
        </Link>

        <Link
          href={`/topic/${topicId}/ask`}
          className="flex items-center justify-between bg-white border border-slate-200 text-slate-900 rounded-2xl px-6 py-4 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div>
            <p className="font-bold">AIに質問する</p>
            <p className="text-slate-400 text-xs mt-0.5">わからないことを何でも聞こう</p>
          </div>
          <span className="text-2xl">🤖</span>
        </Link>
      </div>
    </div>
  );
}
