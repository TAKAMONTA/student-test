"use client";

import { useState, useRef, use } from "react";
import Link from "next/link";

const MAX_PROMPT = 500;
const DAILY_LIMIT = 30;

export default function AskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const topicId = parseInt(id, 10);

  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResponse("");
    setError("");

    abortRef.current = new AbortController();
    try {
      const res = await fetch(`/api/topics/${topicId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(
          res.status === 429
            ? "本日の質問上限（30回）に達しました。明日また使えます。"
            : (data.error ?? "エラーが発生しました")
        );
        return;
      }

      const rem = res.headers.get("X-Rate-Limit-Remaining");
      if (rem !== null) setRemaining(parseInt(rem, 10));

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResponse((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href={`/topic/${topicId}`} className="text-sm text-indigo-600 hover:underline">
          ← 単元に戻る
        </Link>
        <span className="text-xs text-slate-400">
          残り {remaining ?? DAILY_LIMIT} 回 / 日
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h1 className="font-bold text-slate-900 mb-1">🤖 AIに質問する</h1>
        <p className="text-xs text-slate-400">
          この単元についてわからないことを何でも聞いてください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT))}
            placeholder="例: 一次方程式の解き方がわかりません"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none"
          />
          <span className="absolute bottom-2 right-3 text-xs text-slate-300">
            {prompt.length}/{MAX_PROMPT}
          </span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!prompt.trim() || loading}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "考え中…" : "質問する"}
        </button>
      </form>

      {(response || loading) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-xs font-semibold text-indigo-600 mb-3">AIの回答</p>
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {response}
            {loading && (
              <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
