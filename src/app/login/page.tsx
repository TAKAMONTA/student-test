"use client";

import { useState } from "react";
import EmailInput from "@/components/EmailInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "エラーが発生しました");
      } else {
        setSent(true);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-bold text-indigo-600 text-2xl">中1テストキット</span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">ログイン</h1>
          <p className="mt-2 text-sm text-slate-600">
            受信できるメールアドレスにログインリンクを送信します
          </p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">📬</div>
            <p className="font-semibold text-green-800">メールを送信しました</p>
            <p className="text-sm text-green-700 mt-2">
              {email} に届いたリンクをクリックしてください
            </p>
            <p className="text-xs text-green-700/80 mt-3 leading-5">
              届かない場合は迷惑メールフォルダ、入力したメールアドレス、受信拒否設定を確認してください。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                メールアドレス
              </label>
              <EmailInput
                id="email"
                required
                value={email}
                onChange={setEmail}
                inputClassName="w-full px-4 py-3 pr-16 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {loading ? "送信中…" : "ログインリンクを送信"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
