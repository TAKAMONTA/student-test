"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Profile = {
  testDate: string | null;
  textbookPublisher: string | null;
  purchasedAt: number;
  expiresAt: number;
};

const PUBLISHERS = ["東京書籍", "啓林館", "大日本図書", "学校図書", "教育出版"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [testDate, setTestDate] = useState("");
  const [publisher, setPublisher] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        const profile = data as Profile;
        setProfile(profile);
        setTestDate(profile.testDate ?? "");
        setPublisher(profile.textbookPublisher ?? "");
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testDate: testDate || undefined,
          textbookPublisher: publisher || undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "保存に失敗しました");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return <div className="flex items-center justify-center py-20 text-slate-400">読み込み中…</div>;
  }

  const purchasedDate = new Date(profile.purchasedAt).toLocaleDateString("ja-JP");
  const expiresDate = new Date(profile.expiresAt).toLocaleDateString("ja-JP");

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">設定</h1>

      <form onSubmit={handleSave} className="space-y-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-bold text-slate-800 text-sm">テスト情報</h2>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              テスト日
            </label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              教科書出版社
            </label>
            <select
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
            >
              <option value="">選択してください</option>
              {PUBLISHERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "保存中…" : saved ? "✓ 保存しました" : "保存する"}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-sm">
        <h2 className="font-bold text-slate-800">購入情報</h2>
        <div className="flex justify-between text-slate-600">
          <span>購入日</span>
          <span>{purchasedDate}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>利用期限</span>
          <span>{expiresDate}</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/home" className="text-sm text-indigo-600 hover:underline">
          ← ホームに戻る
        </Link>
      </div>
    </div>
  );
}
