"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QuestionDetailResponse } from "@/types";
import DifficultyBadge from "@/components/DifficultyBadge";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function QuestionReflectionsPage() {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<QuestionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/questions/${id}`);
        if (!res.ok) throw new Error("Question not found");
        const json = (await res.json()) as QuestionDetailResponse;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading reflections…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card bg-red-50 border-red-200 text-red-700 max-w-2xl">
        <p className="font-semibold">{error ?? "Question not found"}</p>
        <Link href="/question-bank" className="text-sm underline mt-2 block">
          ← Back to Question Bank
        </Link>
      </div>
    );
  }

  const { question, attempts } = data;
  const correctCount = attempts.filter((a) => a.correct).length;
  const hasSolution = question.solution.trim().length > 0;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link
          href="/question-bank"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Question Bank
        </Link>
        <span className="text-slate-300">/</span>
        <Link
          href={`/questions/${id}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Attempt This Question
        </Link>
      </div>

      {/* Question header */}
      <div className="card">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <DifficultyBadge level={question.difficulty} />
          <span className="badge bg-blue-50 text-blue-700">{question.topic}</span>
          <span className="text-xs text-slate-400 font-mono">
            {question.questionId}
          </span>
          <span className="text-xs text-slate-400">
            from {question.origin_set}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 leading-relaxed mb-4">
          {question.question_content}
        </h2>

        {hasSolution && (
          <div className="bg-slate-50 rounded-xl p-4 mt-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Solution
            </p>
            <p className="text-slate-700">{question.solution}</p>
          </div>
        )}

        {!hasSolution && (
          <p className="text-sm text-slate-400 italic">No solution stored yet.</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-slate-900">
            {attempts.length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total Attempts</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-green-600">{correctCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Correct</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-slate-900">
            {attempts.length > 0
              ? `${Math.round((correctCount / attempts.length) * 100)}%`
              : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Success Rate</p>
        </div>
      </div>

      {/* Attempts list */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">
          All Attempts{" "}
          <span className="text-slate-400 font-normal text-sm">
            (newest first)
          </span>
        </h3>

        {attempts.length === 0 ? (
          <div className="card text-center py-10 text-slate-400">
            <p className="text-3xl mb-2">📭</p>
            <p>No attempts recorded yet.</p>
            <Link
              href={`/questions/${id}`}
              className="btn-primary mt-4 inline-block"
            >
              Attempt Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt, index) => (
              <div
                key={attempt.id}
                className={`card border-l-4 ${
                  attempt.correct
                    ? "border-l-green-400"
                    : "border-l-red-400"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        attempt.correct ? "bg-green-500" : "bg-red-400"
                      }`}
                    >
                      {attempt.correct ? "✓" : "✗"}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        attempt.correct ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {attempt.correct ? "Correct" : "Incorrect"}
                    </span>
                    <span className="text-xs text-slate-400">
                      #{attempts.length - index}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {formatDate(attempt.createdAt)}
                  </span>
                </div>

                {attempt.reflection_note ? (
                  <div className="mt-2 pl-7">
                    <p className="text-xs font-medium text-slate-500 mb-0.5 uppercase tracking-wide">
                      Reflection
                    </p>
                    <p className="text-sm text-slate-700 italic">
                      {attempt.reflection_note}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1.5 pl-7 text-xs text-slate-400 italic">
                    No reflection note.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
