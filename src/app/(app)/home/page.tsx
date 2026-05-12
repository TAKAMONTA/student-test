import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users, subjects, topics, topicProgress, attempts, questions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

type SubjectTheme = {
  icon: string;
  soft: string;
  iconBg: string;
  stamp: string;
  text: string;
  accent: string;
};

const SUBJECT_THEMES: Record<string, SubjectTheme> = {
  kokugo: {
    icon: "📖",
    soft: "bg-rose-50",
    iconBg: "bg-rose-500",
    stamp: "bg-rose-500",
    text: "text-rose-700",
    accent: "text-rose-600",
  },
  sugaku: {
    icon: "📐",
    soft: "bg-sky-50",
    iconBg: "bg-sky-500",
    stamp: "bg-sky-500",
    text: "text-sky-700",
    accent: "text-sky-600",
  },
  eigo: {
    icon: "🔤",
    soft: "bg-emerald-50",
    iconBg: "bg-emerald-500",
    stamp: "bg-emerald-500",
    text: "text-emerald-700",
    accent: "text-emerald-600",
  },
  rika: {
    icon: "🔬",
    soft: "bg-violet-50",
    iconBg: "bg-violet-500",
    stamp: "bg-violet-500",
    text: "text-violet-700",
    accent: "text-violet-600",
  },
  shakai: {
    icon: "🗺️",
    soft: "bg-amber-50",
    iconBg: "bg-amber-500",
    stamp: "bg-amber-500",
    text: "text-amber-700",
    accent: "text-amber-600",
  },
};

const DEFAULT_THEME: SubjectTheme = SUBJECT_THEMES.kokugo!;

type Urgency = {
  gradient: string;
  label: string;
  sub: string;
  pillBg: string;
};

function getUrgency(days: number): Urgency {
  if (days <= 0) {
    return {
      gradient: "linear-gradient(135deg, #c026d3 0%, #e11d48 50%, #ea580c 100%)",
      label: "今日が本番！",
      sub: "全力で挑もう 🔥",
      pillBg: "rgba(255,255,255,0.25)",
    };
  }
  if (days <= 3) {
    return {
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
      label: "ラストスパート！",
      sub: "集中して仕上げよう",
      pillBg: "rgba(255,255,255,0.22)",
    };
  }
  if (days <= 7) {
    return {
      gradient: "linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
      label: "あと一週間！",
      sub: "弱点をひとつずつつぶそう",
      pillBg: "rgba(255,255,255,0.22)",
    };
  }
  if (days <= 14) {
    return {
      gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
      label: "そろそろ追い込み",
      sub: "毎日コツコツ進めよう",
      pillBg: "rgba(255,255,255,0.25)",
    };
  }
  return {
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)",
    label: "計画的にいこう",
    sub: "今のうちに基礎固め",
    pillBg: "rgba(255,255,255,0.18)",
  };
}

export default async function HomePage() {
  const authResult = await requireAuth();
  if (authResult instanceof Response) redirect("/login");
  const user = authResult;

  const db = getDb();
  const userRow = await db.select().from(users).where(eq(users.id, user.id)).get();
  if (!userRow?.testDate) redirect("/setup");

  const allSubjects = await db.select().from(subjects).all();
  allSubjects.sort((a, b) => a.order - b.order);

  const subjectData = await Promise.all(
    allSubjects.map(async (subject) => {
      const subjectTopics = await db
        .select({ id: topics.id })
        .from(topics)
        .where(eq(topics.subjectId, subject.id))
        .all();
      const topicIds = subjectTopics.map((t) => t.id);

      let masteredCount = 0;
      let inProgressCount = 0;
      if (topicIds.length > 0) {
        const progress = await db
          .select({ topicId: topicProgress.topicId, masteryLevel: topicProgress.masteryLevel })
          .from(topicProgress)
          .where(
            and(
              eq(topicProgress.userId, user.id),
              inArray(topicProgress.topicId, topicIds),
            ),
          )
          .all();
        const masteredSet = new Set(
          progress.filter((p) => p.masteryLevel >= 3).map((p) => p.topicId),
        );
        masteredCount = masteredSet.size;

        const attemptedRows = await db
          .select({ topicId: questions.topicId })
          .from(attempts)
          .innerJoin(questions, eq(attempts.questionId, questions.id))
          .where(
            and(
              eq(attempts.userId, user.id),
              inArray(questions.topicId, topicIds),
            ),
          )
          .groupBy(questions.topicId)
          .all();
        inProgressCount = attemptedRows.filter((r) => !masteredSet.has(r.topicId)).length;
      }

      return {
        ...subject,
        totalTopics: topicIds.length,
        masteredTopics: masteredCount,
        inProgressTopics: inProgressCount,
      };
    }),
  );

  const testDate = new Date(userRow.testDate);
  const daysLeft = Math.max(0, Math.ceil((testDate.getTime() - Date.now()) / 86_400_000));

  const totalAll = subjectData.reduce((s, x) => s + x.totalTopics, 0);
  const masteredAll = subjectData.reduce((s, x) => s + x.masteredTopics, 0);
  const inProgressAll = subjectData.reduce((s, x) => s + x.inProgressTopics, 0);
  const overallPct = totalAll > 0 ? Math.round((masteredAll / totalAll) * 100) : 0;
  const urgency = getUrgency(daysLeft);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          学習ダッシュボード
        </span>
      </div>

      <section
        className="relative overflow-hidden rounded-3xl text-white shadow-2xl"
        style={{ background: urgency.gradient }}
      >
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1.5px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.08)" }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.06)" }}
          aria-hidden="true"
        />

        <div className="relative px-7 pt-7 pb-8">
          <span
            className="inline-flex items-center gap-1.5 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4"
            style={{ background: urgency.pillBg }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
              aria-hidden="true"
            />
            テストカウントダウン
          </span>

          <div className="flex items-end gap-3 mb-4">
            <span className="text-xl font-bold pb-3 opacity-90">あと</span>
            <span
              className="font-black leading-[0.85] tabular-nums tracking-tighter"
              style={{ fontSize: "clamp(5rem, 22vw, 7.5rem)" }}
            >
              {daysLeft}
            </span>
            <span className="text-3xl font-bold pb-3">日</span>
          </div>

          <p className="text-xl font-black">{urgency.label}</p>
          <p className="text-sm font-medium opacity-90 mt-1">{urgency.sub}</p>

          <div className="mt-6 pt-6 border-t border-white/25">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[11px] font-bold tracking-widest uppercase opacity-80">
                ぜんたいの進み具合
              </span>
              <span className="text-2xl font-black tabular-nums">{overallPct}%</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs font-bold opacity-95">
              <span>⭐ {masteredAll} 単元マスター</span>
              {inProgressAll > 0 && <span>🔥 {inProgressAll} 単元 進行中</span>}
              <span>📚 全 {totalAll} 単元</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-500">▍</span>
            教科ごとの進み具合
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {subjectData.map((subject) => {
            const theme = SUBJECT_THEMES[subject.slug] ?? DEFAULT_THEME;
            const pct =
              subject.totalTopics > 0
                ? Math.round((subject.masteredTopics / subject.totalTopics) * 100)
                : 0;
            const isComplete =
              subject.totalTopics > 0 && subject.masteredTopics === subject.totalTopics;

            return (
              <Link
                key={subject.id}
                href={`/subject/${subject.slug}`}
                className={`group relative block ${theme.soft} rounded-2xl ring-1 ring-slate-200/70 hover:ring-slate-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 overflow-hidden`}
              >
                {isComplete && (
                  <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md">
                    ✓ 完了
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`${theme.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md group-hover:rotate-[8deg] group-hover:scale-105 transition-transform duration-300`}
                      aria-hidden="true"
                    >
                      <span>{theme.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-slate-900 leading-tight">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        全 {subject.totalTopics} 単元
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-2xl font-black ${theme.text} leading-none tabular-nums`}
                      >
                        {pct}
                        <span className="text-sm font-bold opacity-60">%</span>
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex gap-1.5 mb-3"
                    role="img"
                    aria-label={`進捗 ${subject.masteredTopics} / ${subject.totalTopics}`}
                  >
                    {Array.from({ length: Math.max(subject.totalTopics, 1) }).map((_, i) => {
                      const filled = i < subject.masteredTopics;
                      return (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-colors ${
                            filled ? theme.stamp : "bg-white/70"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={theme.accent}>
                      ⭐ {subject.masteredTopics}/{subject.totalTopics} マスター
                    </span>
                    {subject.inProgressTopics > 0 && (
                      <span className="inline-flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full text-slate-700 ring-1 ring-slate-200/80 shadow-sm">
                        🔥 進行中 {subject.inProgressTopics}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
