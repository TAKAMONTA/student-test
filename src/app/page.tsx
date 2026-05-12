import Link from "next/link";

const SUBJECTS = ["国語", "数学", "英語", "理科", "社会"];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <span className="font-bold text-indigo-600 text-lg">中1テストキット</span>
        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ログイン
        </Link>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-indigo-50 to-white px-6 py-20 text-center">
          <p className="text-indigo-600 font-semibold text-sm mb-3">中学1年生向け</p>
          <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-4">
            定期テストを<br />しっかり攻略しよう
          </h1>
          <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
            中間・期末に向けた5教科の解説・ドリル・AI個別質問・予想模試がこれ1つで。
            一度買えばテスト当日まで使い放題。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/buy"
              className="inline-block bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-indigo-700 transition-colors"
            >
              980円で始める
            </Link>
            <Link
              href="/login"
              className="inline-block bg-white text-indigo-600 font-semibold px-8 py-4 rounded-xl text-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              ログイン
            </Link>
          </div>
          <p className="text-slate-400 text-sm mt-4">買い切り・30日間有効</p>
        </section>

        {/* Subjects */}
        <section className="px-6 py-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">対応教科</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {SUBJECTS.map((s) => (
              <span key={s} className="px-5 py-2 bg-indigo-100 text-indigo-800 rounded-full font-semibold text-base">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-white px-6 py-16">
          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
            {[
              { icon: "📖", title: "解説", desc: "各単元をわかりやすく解説。教科書に沿った内容で予習・復習。" },
              { icon: "✏️", title: "ドリル", desc: "繰り返し解いてマスターレベルを上げる問題演習。" },
              { icon: "🤖", title: "AI個別質問", desc: "わからないことを何でもAIに聞ける。毎日30回まで無料。" },
              { icon: "📝", title: "予想模試", desc: "中間・期末を切り替えて、本番形式で総仕上げ。" },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-200">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{f.title}</h3>
                <p className="text-slate-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">さあ、始めよう</h2>
          <p className="text-slate-600 mb-6">クレジットカード1回払い・980円ぽっきり</p>
          <Link
            href="/buy"
            className="inline-block bg-indigo-600 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-indigo-700 transition-colors"
          >
            購入して始める
          </Link>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 px-6 py-6 text-center text-slate-400 text-sm">
        © 2026 中1テストキット
      </footer>
    </div>
  );
}
