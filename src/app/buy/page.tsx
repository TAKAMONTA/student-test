"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const FEATURES = [
  { icon: "📖", title: "5教科の解説", desc: "国語・数学・英語・理科・社会の全25単元に対応。" },
  { icon: "✏️", title: "ドリル演習", desc: "各単元の問題を繰り返し解いて定着度を確認。" },
  { icon: "🤖", title: "AI個別質問", desc: "つまずいた内容をその場で質問。1日30回まで利用可能。" },
  { icon: "📝", title: "予想模試", desc: "中間・期末の総仕上げとして本番形式で確認。" },
];

const STEPS = ["メール入力", "カード決済", "メール受信", "学習開始"];

type Profile = {
  email: string;
  purchasedAt: number | null;
  expiresAt: number | null;
};

export default function BuyPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/profile")
      .then(async (res) => {
        if (!active) return;
        if (!res.ok) {
          setChecking(false);
          return;
        }
        const profile = (await res.json()) as Profile;
        setEmail(profile.email);
        const expiresAt = profile.expiresAt ? new Date(profile.expiresAt) : null;
        const hasActivePurchase = Boolean(profile.purchasedAt && (!expiresAt || expiresAt > new Date()));
        setIsPurchased(hasActivePurchase);
        setChecking(false);
      })
      .catch(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handlePurchase() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("メールアドレスを入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      if (!res.ok) {
        if (res.status === 409) {
          setIsPurchased(true);
          return;
        }
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "エラーが発生しました");
        return;
      }
      const data = (await res.json()) as { url: string };
      window.location.href = data.url;
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_38%,#eef6ff_100%)] text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-indigo-600">
            中1テストキット
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="font-medium text-slate-600 hover:text-slate-900">
              ログイン
            </Link>
            <Link href="/home" className="font-medium text-slate-600 hover:text-slate-900">
              ホーム
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
        <section className="flex flex-col justify-center">
          <p className="mb-4 inline-flex w-fit rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">
            購入ページ
          </p>
          <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
            中間・期末テスト対策を
            <br />
            30日間まとめて使う
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            5教科の解説、単元ドリル、AI質問、予想模試をひとつにまとめた中学1年生向けの定期テスト対策アプリです。
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                  {feature.icon}
                </div>
                <h2 className="font-bold text-slate-900">{feature.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70 sm:p-8">
          <div className="rounded-2xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-cyan-300">買い切り・30日間有効</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-6xl font-black tracking-normal">980</span>
              <span className="pb-2 text-xl font-bold">円</span>
              <span className="pb-2 text-sm text-slate-300">税込</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Stripeの決済画面に移動します。購入完了後、ログインリンクをメールで送信します。
            </p>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {STEPS.map((step, index) => (
              <div key={step} className="rounded-xl bg-slate-50 px-2 py-3 text-center">
                <div className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-xs font-bold leading-5 text-slate-700">{step}</p>
              </div>
            ))}
          </div>

          {isPurchased ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="font-bold text-emerald-900">このアカウントは購入済みです</p>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                追加購入は不要です。ホームから学習を続けられます。
              </p>
              <Link
                href="/home"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700"
              >
                ホームへ戻る
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <label htmlFor="purchase-email" className="mb-2 block text-sm font-bold text-slate-700">
                  購入後にログインリンクを受け取るメールアドレス
                </label>
                <input
                  id="purchase-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

              <button
                onClick={handlePurchase}
                disabled={loading || checking}
                className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-4 text-lg font-black text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checking ? "確認中..." : loading ? "決済画面を準備中..." : "980円で購入する"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                決済後、このメールアドレスにログインリンクを送信します。
              </p>
            </>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-slate-200 pt-5 text-xs text-slate-500">
            <Link href="/terms" className="hover:text-slate-700">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:text-slate-700">
              プライバシーポリシー
            </Link>
            <Link href="/legal/tokusho" className="hover:text-slate-700">
              特商法表記
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
