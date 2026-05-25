"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MarketingProductPreview from "@/components/MarketingProductPreview";
import { isIosAppUserAgent } from "@/lib/ios-app";

const INCLUDED = [
  "5教科25単元の解説",
  "全201問の3択ドリル",
  "AI質問 1日30回",
  "中間・期末の予想模試",
  "学習進捗とテスト日カウントダウン",
  "メールリンク認証",
];

const WEB_STEPS = [
  { title: "メール入力", body: "購入後のログインリンクを受け取るアドレスです。" },
  { title: "Stripe決済", body: "カード情報はStripeの決済画面で安全に処理されます。" },
  { title: "学習開始", body: "決済後に届くメールからすぐに使い始められます。" },
];

const IOS_STEPS = [
  { title: "メールログイン", body: "購入前にログインリンクでアカウントに入ります。" },
  { title: "App Store購入", body: "購入と復元はApp Storeの確認画面で行います。" },
  { title: "学習開始", body: "購入確認後、同じアカウントですぐに学習できます。" },
];

const WEB_FAQS = [
  {
    q: "月額料金はかかりますか？",
    a: "かかりません。980円の買い切りで利用できます。",
  },
  {
    q: "購入後に何が届きますか？",
    a: "入力したメールアドレスにログインリンクが届きます。リンクを開くと学習画面に入れます。",
  },
  {
    q: "カード番号は保存されますか？",
    a: "このサービス側ではカード番号を保存しません。決済はStripeの画面で処理されます。",
  },
];

const IOS_FAQS = [
  {
    q: "月額料金はかかりますか？",
    a: "かかりません。価格はApp Storeの購入確認画面に表示されます。",
  },
  {
    q: "購入後に何ができますか？",
    a: "購入確認後、このアカウントで学習画面に入れるようになります。",
  },
  {
    q: "購入を復元できますか？",
    a: "同じApple IDで購入済みの場合は、アプリ内の復元ボタンから確認できます。",
  },
];

type Profile = {
  email: string;
  purchasedAt: number | null;
};

type IosBridgeMessage = { type: "purchase" } | { type: "restore" };

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        iap?: {
          postMessage: (message: IosBridgeMessage) => void;
        };
      };
    };
  }
}

export default function BuyPageClient({ initialIsIosApp }: { initialIsIosApp: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isIosApp, setIsIosApp] = useState(initialIsIosApp);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/profile")
      .then(async (res) => {
        if (!active) return;
        if (!res.ok) {
          setIsAuthenticated(false);
          setChecking(false);
          return;
        }
        const profile = (await res.json()) as Profile;
        setIsAuthenticated(true);
        setEmail(profile.email);
        setIsPurchased(Boolean(profile.purchasedAt));
        setChecking(false);
      })
      .catch(() => {
        if (active) {
          setIsAuthenticated(false);
          setChecking(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setIsIosApp(isIosAppUserAgent(window.navigator.userAgent));
  }, []);

  function sendIosPurchaseMessage(type: "purchase" | "restore") {
    if (!isAuthenticated) {
      setError("購入前にログインしてください。");
      return;
    }

    if (!window.webkit?.messageHandlers?.iap) {
      setError("iOSアプリ内で購入を開始できませんでした。アプリを再起動してからもう一度お試しください。");
      return;
    }

    setError("");
    window.webkit.messageHandlers.iap.postMessage({ type });
  }

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

  const isIosAuthPending = isIosApp && checking && !isAuthenticated;
  const isIosLoginRequired = isIosApp && !checking && !isAuthenticated;
  const displaySteps = isIosApp ? IOS_STEPS : WEB_STEPS;
  const displayFaqs = isIosApp ? IOS_FAQS : WEB_FAQS;

  return (
    <div className="min-h-full bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-black text-slate-950">
            中1テストキット
          </Link>
          <div className="flex items-center gap-4 text-sm font-bold">
            <Link href="/login" className="text-slate-600 hover:text-slate-950">
              ログイン
            </Link>
            <Link href="/home" className="text-slate-600 hover:text-slate-950">
              ホーム
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-50 px-4 py-12 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="mb-4 inline-flex rounded-md bg-slate-950 px-3 py-2 text-xs font-black text-white">
                購入内容の確認
              </p>
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
                {isIosApp ? "中1の定期テスト対策をApp Storeで始める" : "中1の定期テスト対策を980円で始める"}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                5教科の解説、ドリル、AI質問、予想模試をまとめて使えます。購入後はメールリンクでログインし、
                スマホやPCのブラウザから学習できます。
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {INCLUDED.map((item) => (
                  <div key={item} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-black">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <MarketingProductPreview compact />
              </div>
            </div>

            <aside className="rounded-lg border border-slate-300 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-6">
              <div className="border-b border-slate-200 pb-5">
                <p className="text-sm font-black text-cyan-700">{isIosApp ? "買い切り・App Store" : "買い切り・税込"}</p>
                {isIosApp ? (
                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <span className="text-4xl font-black">App Store</span>
                    <span className="pb-1 text-xl font-black">価格</span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-6xl font-black tabular-nums">980</span>
                    <span className="pb-2 text-xl font-black">円</span>
                  </div>
                )}
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {isIosApp
                    ? "月額料金はありません。価格はApp Storeの購入確認画面に表示されます。"
                    : "月額料金はありません。Stripeの決済画面に移動して購入します。"}
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                {displaySteps.map((step, index) => (
                  <div key={step.title} className="grid grid-cols-[2.25rem_1fr] gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-sm font-black text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-950">{step.title}</h2>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {isPurchased ? (
                <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-black text-emerald-900">このアカウントは購入済みです</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-800">
                    追加購入は不要です。ホームから学習を続けられます。
                  </p>
                  <Link
                    href="/home"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-3 font-black text-white hover:bg-emerald-700"
                  >
                    ホームへ戻る
                  </Link>
                </div>
              ) : (
                <>
                  {isIosAuthPending ? (
                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
                      <p className="font-black text-slate-950">購入状態を確認中</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        ログイン状態を確認しています。確認が終わるまで購入操作は表示されません。
                      </p>
                    </div>
                  ) : isIosLoginRequired ? (
                    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
                      <p className="font-black text-amber-950">購入前にログインしてください</p>
                      <p className="mt-2 text-sm leading-6 text-amber-900">
                        App Store購入はログイン中のアカウントに紐づきます。先にメールリンクでログインしてください。
                      </p>
                      <Link
                        href="/login"
                        className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-slate-950 px-4 py-3 font-black text-white hover:bg-slate-800"
                      >
                        ログインしてから購入する
                      </Link>
                    </div>
                  ) : isIosApp ? (
                    <>
                      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                      <button
                        onClick={() => sendIosPurchaseMessage("purchase")}
                        disabled={checking}
                        className="mt-5 w-full rounded-md bg-cyan-500 px-5 py-4 text-lg font-black text-slate-950 shadow-lg shadow-cyan-100 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {checking ? "確認中..." : "App Storeで購入"}
                      </button>

                      <button
                        onClick={() => sendIosPurchaseMessage("restore")}
                        disabled={checking}
                        className="mt-3 w-full rounded-md border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        購入を復元
                      </button>

                      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                        購入と復元はApp Storeの仕組みを使います。
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mt-6">
                        <label htmlFor="purchase-email" className="mb-2 block text-sm font-black text-slate-700">
                          ログインリンクを受け取るメールアドレス
                        </label>
                        <input
                          id="purchase-email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                      <button
                        onClick={handlePurchase}
                        disabled={loading || checking}
                        className="mt-5 w-full rounded-md bg-cyan-500 px-5 py-4 text-lg font-black text-slate-950 shadow-lg shadow-cyan-100 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {checking ? "確認中..." : loading ? "決済画面を準備中..." : "980円で購入する"}
                      </button>

                      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                        決済後、このメールアドレスにログインリンクを送信します。
                      </p>
                    </>
                  )}
                </>
              )}

              <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-slate-200 pt-5 text-xs font-bold text-slate-500">
                <Link href="/terms" className="hover:text-slate-900">
                  利用規約
                </Link>
                <Link href="/privacy" className="hover:text-slate-900">
                  プライバシーポリシー
                </Link>
                <Link href="/legal/tokusho" className="hover:text-slate-900">
                  特商法表記
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-black text-cyan-700">FAQ</p>
            <h2 className="mt-2 text-3xl font-black">購入前の確認</h2>
            <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
              {displayFaqs.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-black">
                    <span>{faq.q}</span>
                    <span className="text-slate-400 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
