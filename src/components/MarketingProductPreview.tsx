const SUBJECT_PROGRESS = [
  { name: "国語", done: 3, total: 5, tone: "bg-rose-500" },
  { name: "数学", done: 2, total: 5, tone: "bg-sky-500" },
  { name: "英語", done: 4, total: 5, tone: "bg-emerald-500" },
  { name: "理科", done: 1, total: 5, tone: "bg-violet-500" },
  { name: "社会", done: 2, total: 5, tone: "bg-amber-500" },
];

const DRILL_CHOICES = ["A", "B", "C"];

export default function MarketingProductPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-lg border border-slate-300 bg-white text-slate-950 shadow-2xl shadow-slate-950/20",
        compact ? "p-4" : "p-5 sm:p-6",
      ].join(" ")}
      aria-label="中1テストキットの画面イメージ"
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <p className="text-xs font-bold text-slate-500">学習ダッシュボード</p>
          <p className="mt-1 text-lg font-black">テストまであと12日</p>
        </div>
        <div className="rounded-md bg-slate-950 px-3 py-2 text-right text-white">
          <p className="text-[10px] font-bold text-cyan-200">進み具合</p>
          <p className="text-xl font-black tabular-nums">48%</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black">5教科の進捗</h3>
            <span className="text-xs font-bold text-slate-500">25単元</span>
          </div>
          <div className="space-y-3">
            {SUBJECT_PROGRESS.map((subject) => {
              const width = `${Math.round((subject.done / subject.total) * 100)}%`;
              return (
                <div key={subject.name}>
                  <div className="mb-1 flex items-center justify-between text-xs font-bold">
                    <span>{subject.name}</span>
                    <span className="text-slate-500">
                      {subject.done}/{subject.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div className={`h-full rounded-full ${subject.tone}`} style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black">単元ドリル</h3>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                3択
              </span>
            </div>
            <p className="text-sm font-bold leading-6">
              正負の数で、-3 + 5 の答えは？
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DRILL_CHOICES.map((choice, index) => (
                <div
                  key={choice}
                  className={[
                    "rounded-md border px-3 py-2 text-center text-sm font-black",
                    index === 1
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-500",
                  ].join(" ")}
                >
                  {choice}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-black">AI質問</h3>
              <span className="text-xs font-bold text-cyan-200">30回/日</span>
            </div>
            <p className="rounded-md bg-white/10 px-3 py-2 text-sm leading-6 text-slate-100">
              「なぜマイナス同士を足すと小さくなるの？」
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              中1向けの言葉で、途中式から説明します。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
