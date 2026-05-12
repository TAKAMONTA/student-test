"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

type Question = {
  id: number;
  text: string;
  type: string;
  choices: string[] | null;
  difficulty: number;
};

type AttemptResult = {
  isCorrect: boolean;
  answer: string;
  explanation: string;
  masteryLevel: number;
  consecutiveCorrect: number;
};

export default function DrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const topicId = parseInt(id, 10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/topics/${topicId}/questions`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions((data as Question[]).sort(() => Math.random() - 0.5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [topicId]);

  const question = questions[index];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question || !userAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/topics/${topicId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, userAnswer: userAnswer.trim() }),
      });
      const data = (await res.json()) as AttemptResult;
      setResult(data);
      setSessionTotal((t) => t + 1);
      if (data.isCorrect) setSessionCorrect((c) => c + 1);
    } finally {
      setSubmitting(false);
    }
  }

  function nextQuestion() {
    setResult(null);
    setUserAnswer("");
    setIndex((i) => (i + 1) % questions.length);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">読み込み中…</div>;
  }

  if (!question) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">問題が見つかりません</p>
        <Link href={`/topic/${topicId}`} className="text-indigo-600 hover:underline">← 単元に戻る</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href={`/topic/${topicId}`} className="text-sm text-indigo-600 hover:underline">
          ← 単元に戻る
        </Link>
        {sessionTotal > 0 && (
          <span className="text-sm text-slate-500">正解率: {sessionCorrect}/{sessionTotal}</span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <p className="text-xs text-slate-400 mb-3">問題 {index + 1} / {questions.length}</p>
        <p className="text-slate-900 font-medium leading-relaxed">{question.text}</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {question.choices && question.choices.length > 0 ? (
            <div className="grid gap-2">
              {question.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setUserAnswer(choice)}
                  className={`w-full text-left px-5 py-3 rounded-xl border transition-colors ${
                    userAnswer === choice
                      ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="答えを入力"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
          <button
            type="submit"
            disabled={!userAnswer || submitting}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "採点中…" : "答える"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 border ${result.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <p className={`font-bold text-lg mb-1 ${result.isCorrect ? "text-green-700" : "text-red-700"}`}>
              {result.isCorrect ? "✓ 正解！" : "✗ 不正解"}
            </p>
            {!result.isCorrect && (
              <p className="text-slate-700 text-sm mb-2">正解: <span className="font-semibold">{result.answer}</span></p>
            )}
            {result.explanation && (
              <p className="text-slate-600 text-sm leading-relaxed">{result.explanation}</p>
            )}
          </div>
          <div className="text-center text-xs text-slate-400">
            連続正解: {result.consecutiveCorrect} 問 / マスターレベル: {result.masteryLevel}
          </div>
          <button
            onClick={nextQuestion}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            次の問題へ
          </button>
        </div>
      )}
    </div>
  );
}
