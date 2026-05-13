"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [testDate, setTestDate] = useState("");
  const [publisher, setPublisher] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testDate, textbookPublisher: publisher }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "エラーが発生しました");
        return;
      }
      router.push("/home");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📅</div>
          <h1 className="text-2xl font-bold text-slate-900">初期設定</h1>
          <p className="text-sm text-slate-600 mt-2">
            テストの日程を設定して学習を始めましょう
          </p>
          <p className="text-xs leading-6 text-slate-500 mt-3">
            ここで入力する日程は、次に受けるテストの日程です。
            中間テスト対策なら中間テスト日、期末テスト対策なら期末テスト日を設定してください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="testDate" className="block text-sm font-medium text-slate-700 mb-1">
              テスト日程 <span className="text-red-500">*</span>
            </label>
            <input
              id="testDate"
              type="date"
              required
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="publisher" className="block text-sm font-medium text-slate-700 mb-1">
              教科書出版社（任意）
            </label>
            <select
              id="publisher"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
            >
              <option value="">選択してください</option>
              <option value="東京書籍">東京書籍</option>
              <option value="光村図書">光村図書</option>
              <option value="教育出版">教育出版</option>
              <option value="三省堂">三省堂</option>
              <option value="啓林館">啓林館</option>
              <option value="大日本図書">大日本図書</option>
              <option value="学校図書">学校図書</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "保存中…" : "学習を始める"}
          </button>
        </form>
      </div>
    </div>
  );
}
