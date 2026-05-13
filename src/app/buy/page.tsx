"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FEATURES = [
  { icon: "📖", label: "5教科の解説テキスト" },
  { icon: "✏️", label: "ドリル問題（無制限）" },
  { icon: "🤖", label: "AI個別質問（毎日30回）" },
  { icon: "📝", label: "予想模試（テスト7日前解放）" },
];

export default function BuyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePurchase() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json() as { error?: string };
        setError(data.error ?? "エラーが発生しました");
        return;
      }
      const data = await res.json() as { url: string };
      window.location.href = data.url;
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="font-bold text-indigo-600 text-2xl">中1テストキット</span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">テストキットを購入</h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold text-slate-900">980</span>
            <span className="text-lg text-slate-600">円</span>
            <span className="ml-2 text-sm text-slate-400">買い切り・30日間有効</span>
          </div>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="text-xl">{f.icon}</span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {loading ? "準備中…" : "カードで購入する"}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          Stripe による安全な決済。購入後すぐに使えます。
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-400">
          <Link href="/terms" className="hover:text-slate-600">
            利用規約
          </Link>
          <Link href="/privacy" className="hover:text-slate-600">
            プライバシーポリシー
          </Link>
          <Link href="/legal/tokusho" className="hover:text-slate-600">
            特商法表記
          </Link>
        </div>

        <p className="text-center mt-4">
          <Link href="/login" className="text-sm text-indigo-600 hover:underline">
            ログインはこちら
          </Link>
        </p>
      </div>
    </div>
  );
}
