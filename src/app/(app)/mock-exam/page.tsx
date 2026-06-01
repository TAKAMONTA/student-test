"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { capture } from "@/lib/analytics";
import { requestStoreReview } from "@/lib/store-review";

type ExamQuestion = {
  id: number;
  text: string;
  type: string;
  choices: string[] | null;
  topicId: number;
};

type AttemptResult = {
  isCorrect: boolean;
  answer: string;
  explanation: string;
  finished?: boolean;
  score?: number | null;
};

type Phase = "idle" | "running" | "done";
type ExamScope = "midterm" | "final";

export default function MockExamPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scope, setScope] = useState<ExamScope>("midterm");
  const [examId, setExamId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lockMsg, setLockMsg] = useState("");
  const [error, setError] = useState("");

  const reviewPromptFiredRef = useRef(false);

  useEffect(() => {
    if (phase !== "done") return;
    if (reviewPromptFiredRef.current) return;
    reviewPromptFiredRef.current = true;
    const score = results.filter((r) => r.isCorrect).length;
    capture("review_prompt_requested", {
      trigger: "mock_exam_done",
      scope,
      score,
      total: questions.length,
    });
    requestStoreReview();
  }, [phase, results, scope, questions.length]);

  async function startExam() {
    setLoading(true);
    setError("");
    setLockMsg("");
    try {
      const res = await fetch("/api/mock-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const data = (await res.json()) as {
        examId?: number;
        questions?: ExamQuestion[];
        error?: string;
        unlockDate?: string;
      };
      if (!res.ok) {
        if (res.status === 403 && data.unlockDate) {
          const d = new Date(data.unlockDate);
          setLockMsg(`模試は ${d.toLocaleDateString("ja-JP")} から受けられます`);
        } else {
          setError(data.error ?? "エラーが発生しました");
        }
        return;
      }
      if (data.questions) {
        setExamId(data.examId ?? null);
        setQuestions(data.questions);
        setIndex(0);
        setResults([]);
        reviewPromptFiredRef.current = false;
        setPhase("running");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    const question = questions[index];
    if (!question || !examId || !userAnswer.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/mock-exam", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, questionId: question.id, userAnswer: userAnswer.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "採点に失敗しました");
        return;
      }
      const data = (await res.json()) as AttemptResult;
      setResults((prev) => [...prev, data]);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  function nextOrFinish() {
    setUserAnswer("");
    if (index + 1 >= questions.length) {
      setPhase("done");
    } else {
      setIndex((i) => i + 1);
    }
  }

  const currentResult = results[index];
  const question = questions[index];
  const score = results.filter((r) => r.isCorrect).length;
  const scopeLabel = scope === "midterm" ? "中間" : "期末";

  if (phase === "done") {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{scopeLabel}模試終了</h1>
        <p className="text-slate-600 mb-6">
          <span className="text-4xl font-bold text-indigo-600">{score}</span>
          <span className="text-xl text-slate-400"> / {questions.length}</span>
        </p>
        <div className="grid gap-3 max-w-sm mx-auto text-left mb-8">
          {questions.map((q, i) => {
            const r = results[i];
            return (
              <div
                key={q.id}
                className={`rounded-xl p-3 border text-sm ${r?.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <p className="font-medium text-slate-800 mb-1">{q.text}</p>
                {!r?.isCorrect && <p className="text-slate-500">正解: {r?.answer}</p>}
              </div>
            );
          })}
        </div>
        <Link href="/home" className="text-indigo-600 hover:underline text-sm">
          ← ホームに戻る
        </Link>
      </div>
    );
  }

  if (phase === "running" && question) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold text-slate-900">{scopeLabel}予想模試</h1>
          <span className="text-sm text-slate-400">{index + 1} / {questions.length}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <p className="text-slate-900 font-medium leading-relaxed">{question.text}</p>
        </div>

        {!currentResult ? (
          <div className="space-y-4">
            {question.choices && question.choices.length > 0 ? (
              <div className="grid gap-2">
                {question.choices.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setUserAnswer(c)}
                    className={`w-full text-left px-5 py-3 rounded-xl border transition-colors ${
                      userAnswer === c
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
                    }`}
                  >
                    {c}
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
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={submitAnswer}
              disabled={!examId || !userAnswer || submitting}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "採点中…" : "答える"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-2xl p-5 border ${currentResult.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <p className={`font-bold text-lg mb-1 ${currentResult.isCorrect ? "text-green-700" : "text-red-700"}`}>
                {currentResult.isCorrect ? "✓ 正解！" : "✗ 不正解"}
              </p>
              {!currentResult.isCorrect && (
                <p className="text-slate-700 text-sm mb-2">正解: <span className="font-semibold">{currentResult.answer}</span></p>
              )}
              {currentResult.explanation && (
                <p className="text-slate-600 text-sm">{currentResult.explanation}</p>
              )}
            </div>
            <button
              onClick={nextOrFinish}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {index + 1 >= questions.length ? "結果を見る" : "次の問題へ"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📝</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-3">予想模試</h1>
      <p className="text-slate-600 mb-2 text-sm max-w-xs mx-auto">
        5教科からランダムに各5問、合計25問の模擬テストです。中間は主要8単元、期末は全25単元から出題します。
      </p>
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 mt-4">
        {[
          { value: "midterm", label: "中間" },
          { value: "final", label: "期末" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setScope(option.value as ExamScope)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
              scope === option.value
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {lockMsg && <p className="text-amber-600 text-sm font-medium my-4">{lockMsg}</p>}
      {error && <p className="text-red-600 text-sm my-4">{error}</p>}
      <button
        onClick={startExam}
        disabled={loading || !!lockMsg}
        className="mt-6 bg-indigo-600 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "準備中…" : `${scopeLabel}模試を始める`}
      </button>
    </div>
  );
}
