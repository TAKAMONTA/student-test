"use client";

import Link from "next/link";
import MarketingProductPreview from "@/components/MarketingProductPreview";
import { capture } from "@/lib/analytics";

const SUBJECTS = ["国語", "数学", "英語", "理科", "社会"];

const OUTCOMES = [
  {
    title: "初めての定期テストでも迷わない",
    body: "中1の1学期で出やすい単元を、5教科まとめて確認できます。今日は何をやるかが見えやすい構成です。",
  },
  {
    title: "解説から演習まで一気通貫",
    body: "単元の説明を読んで、すぐドリルで確認。間違えたところはAI質問でその場で聞けます。",
  },
  {
    title: "保護者が見ても費用が明快",
    body: "月額ではなく980円の買い切り。テスト直前だけ使いたい家庭でも始めやすい価格にしています。",
  },
];

const INCLUDED = [
  "5教科25単元の解説",
  "全201問の3択ドリル",
  "AI質問 1日30回",
  "中間・期末の予想模試",
  "学習進捗とテスト日カウントダウン",
  "スマホ・PCのブラウザで利用",
];

const FAQS = [
  {
    q: "どの学年・時期向けですか？",
    a: "中学1年生の中間・期末テスト前を想定しています。英語・数学・国語・理科・社会の基礎固めに使えます。",
  },
  {
    q: "塾に通っていても使えますか？",
    a: "使えます。塾や学校のワークの前後に、苦手単元の確認と短い演習を足すための補助教材です。",
  },
  {
    q: "購入後はどうやってログインしますか？",
    a: "購入時のメールアドレスにログインリンクを送ります。パスワードを覚える必要はありません。",
  },
  {
    q: "スマホだけでも使えますか？",
    a: "使えます。ブラウザで利用できるので、iPhone、Android、PCから学習できます。",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-full bg-white text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-base font-black text-slate-950">
            中1テストキット
          </Link>
          <nav className="flex items-center gap-4 text-sm font-bold">
            <Link href="/login" className="text-slate-600 hover:text-slate-950">
              ログイン
            </Link>
            <Link
              href="/buy"
              onClick={() => capture("lp_cta_clicked", { cta_id: "header", position: "header_nav" })}
              className="rounded-md bg-slate-950 px-4 py-2 text-white transition-colors hover:bg-slate-800"
            >
              980円で始める
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-slate-950 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:py-14">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-cyan-100">
                中学1年生の定期テスト対策
              </p>
              <h1 className="whitespace-nowrap text-4xl font-black leading-[1.02] tracking-normal sm:text-7xl">
                中1テストキット
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
                初めての中間・期末テストに向けて、5教科の解説、ドリル、AI質問、予想模試をひとつにまとめました。
                保護者が買いやすく、子どもが迷わず始めやすいWeb教材です。
              </p>
            </div>

            <div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["980円", "買い切り・税込"],
                  ["25単元", "5教科まとめて"],
                  ["201問", "3択ドリル"],
                ].map(([value, label]) => (
                  <div key={value} className="rounded-lg border border-white/15 bg-white/10 p-4">
                    <p className="text-3xl font-black">{value}</p>
                    <p className="mt-1 text-sm font-bold text-slate-300">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/buy"
                  onClick={() => capture("lp_cta_clicked", { cta_id: "hero", position: "above_fold" })}
                  className="rounded-md bg-cyan-300 px-7 py-4 text-center text-base font-black text-slate-950 transition-colors hover:bg-cyan-200"
                >
                  購入ページへ
                </Link>
                <Link
                  href="/login"
                  className="rounded-md border border-white/25 px-7 py-4 text-center text-base font-black text-white transition-colors hover:bg-white/10"
                >
                  購入済みの方はログイン
                </Link>
              </div>
            </div>

            <div className="max-w-5xl">
              <MarketingProductPreview />
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-4 py-5">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3">
            {SUBJECTS.map((subject) => (
              <span
                key={subject}
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-800"
              >
                {subject}
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black text-cyan-700">保護者向け</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              テスト前の「何からやる？」を減らす
            </h2>
            <p className="mt-4 leading-8 text-slate-600">
              中1の最初の定期テストは、本人も保護者もペースがつかみにくい時期です。
              中1テストキットは、範囲を細かい単元に分けて、短い学習を積み上げられるようにしています。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {OUTCOMES.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-black leading-7">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-black text-cyan-700">画面イメージ</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                  毎日の学習が見える
                </h2>
              </div>
              <p className="max-w-xl leading-8 text-slate-600">
                進捗、ドリル、AI質問を同じ流れで使えるので、テスト直前でも「解説を読む、問題を解く、質問する」まで進めやすくなります。
              </p>
            </div>
            <MarketingProductPreview />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-black text-cyan-700">料金</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
              980円でテスト前のひと通りを揃える
            </h2>
            <p className="mt-4 max-w-2xl leading-8 text-slate-600">
              月額課金ではありません。中1の定期テスト対策として、必要な解説・演習・質問・模試をまとめて使えます。
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {INCLUDED.map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-300 bg-slate-950 p-6 text-white shadow-xl">
            <p className="text-sm font-black text-cyan-200">買い切り・税込</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-6xl font-black tabular-nums">980</span>
              <span className="pb-2 text-xl font-black">円</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Stripeの安全な決済画面で購入します。購入後、メールリンクですぐ学習を始められます。
            </p>
            <Link
              href="/buy"
              onClick={() => capture("lp_cta_clicked", { cta_id: "pricing", position: "pricing_card" })}
              className="mt-6 block rounded-md bg-cyan-300 px-5 py-4 text-center font-black text-slate-950 transition-colors hover:bg-cyan-200"
            >
              980円で始める
            </Link>
            <p className="mt-4 text-xs leading-6 text-slate-400">
              決済情報はStripeが処理します。このサービス側ではカード番号を保存しません。
            </p>
          </aside>
        </section>

        <section className="border-t border-slate-200 bg-white px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-black text-cyan-700">FAQ</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">購入前によくある質問</h2>
            <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-black text-slate-950">
                    <span>{faq.q}</span>
                    <span className="text-slate-400 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 px-4 py-8 text-sm text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="font-bold">© 2026 中1テストキット</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/terms" className="hover:text-white">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:text-white">
              プライバシーポリシー
            </Link>
            <Link href="/legal/tokusho" className="hover:text-white">
              特定商取引法に基づく表記
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
