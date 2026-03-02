"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { QuestionBankResponse } from "@/types";
import DifficultyBadge from "@/components/DifficultyBadge";

export default function QuestionBankPage() {
  const [data, setData] = useState<QuestionBankResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; questionId: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/questions/${deleteTarget.id}`, { method: "DELETE" });
      if (res.status === 404) throw new Error("Question not found.");
      if (!res.ok) throw new Error("Failed to delete question.");
      setData((prev) =>
        prev ? { ...prev, questions: prev.questions.filter((q) => q.id !== deleteTarget.id) } : prev
      );
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Deletion failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (topicFilter !== "all") params.set("topic", topicFilter);
      if (difficultyFilter !== "all") params.set("difficulty", difficultyFilter);

      const res = await fetch(`/api/questions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load questions");

      const json = (await res.json()) as QuestionBankResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading questions");
    } finally {
      setLoading(false);
    }
  }, [topicFilter, difficultyFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-slate-500 mt-1">
            All stored questions and their performance stats
          </p>
        </div>
        <Link href="/upload" className="btn-secondary text-sm py-2 px-4">
          + Upload More
        </Link>
      </div>

      <div className="card flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Filter by Topic
          </label>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Topics</option>
            {data?.topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Filter by Difficulty
          </label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Levels</option>
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d.toString()}>
                Level {d}
              </option>
            ))}
          </select>
        </div>

        {(topicFilter !== "all" || difficultyFilter !== "all") && (
          <button
            onClick={() => {
              setTopicFilter("all");
              setDifficultyFilter("all");
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200 text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">
          Loading questions…
        </div>
      ) : data && data.questions.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            No questions found
          </h2>
          <p className="text-slate-500 mb-6">
            {topicFilter !== "all" || difficultyFilter !== "all"
              ? "Try adjusting your filters."
              : "Upload a CSV to populate the question bank."}
          </p>
          <Link href="/upload" className="btn-primary">
            Upload CSV
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">
                  Question
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">
                  Topic
                </th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">
                  Difficulty
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">
                  Attempts
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">
                  Success Rate
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {data?.questions.map((q) => (
                <tr
                  key={q.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-slate-800 truncate font-medium">
                      {q.question_content}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {q.questionId} · {q.origin_set}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{q.topic}</td>
                  <td className="px-4 py-3 text-center">
                    <DifficultyBadge level={q.difficulty} />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {q.timesAttempted}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        q.successRate >= 70
                          ? "text-green-600"
                          : q.successRate >= 40
                          ? "text-amber-600"
                          : "text-red-500"
                      }`}
                    >
                      {q.timesAttempted > 0 ? `${q.successRate}%` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/questions/${q.id}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Attempt
                      </Link>
                      <Link
                        href={`/questions/${q.id}/reflections`}
                        className="text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Reflections
                      </Link>
                      <button
                        onClick={() => { setDeleteError(null); setDeleteTarget({ id: q.id, questionId: q.questionId }); }}
                        disabled={deletingId === q.id}
                        className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            {data?.questions.length} question
            {data?.questions.length !== 1 ? "s" : ""} shown
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Delete Question</h2>
            <p className="text-sm text-slate-600 mb-1">
              Permanently delete{" "}
              <span className="font-mono font-semibold text-slate-800">{deleteTarget.questionId}</span>?
            </p>
            <p className="text-xs text-slate-400 mb-5">
              All associated attempt records will also be deleted. This cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId !== null}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                disabled={deletingId !== null}
                className="flex-1 btn-secondary py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}