"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QuestionDetailResponse, AttemptResponse } from "@/types";
import DifficultyBadge from "@/components/DifficultyBadge";

type Grade = "correct" | "incorrect" | null;
type Phase = "answer" | "grade";

interface SessionAttempt {
  grade: Grade;
  note: string;
}

export default function AttemptQuestionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<QuestionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Phase 1 — answer
  const [phase, setPhase] = useState<Phase>("answer");
  const [userAnswer, setUserAnswer] = useState("");

  // Phase 2 — grading
  const [grade, setGrade] = useState<Grade>(null);
  const [reflectionNote, setReflectionNote] = useState("");
  const [showSolutionInput, setShowSolutionInput] = useState(false);
  const [proposedSolution, setProposedSolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Session history
  const [sessionAttempts, setSessionAttempts] = useState<SessionAttempt[]>([]);
  const [lastResult, setLastResult] = useState<{ solutionUpdated: boolean } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/questions/${id}`);
        if (!res.ok) throw new Error("Question not found");
        const json = (await res.json()) as QuestionDetailResponse;
        setData(json);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;
    setPhase("grade");
  };

  const handleSubmitAttempt = async () => {
    if (!grade) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const body: { correct: boolean; reflection_note: string; newSolution?: string } = {
        correct: grade === "correct",
        reflection_note: reflectionNote,
      };

      if (showSolutionInput && proposedSolution.trim()) {
        body.newSolution = proposedSolution.trim();
      }

      const res = await fetch(`/api/questions/${id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to record attempt");
      }

      const result = (await res.json()) as AttemptResponse;

      setSessionAttempts((prev) => [...prev, { grade, note: reflectionNote }]);
      setLastResult({ solutionUpdated: result.solutionUpdated });

      // Refresh question data to reflect updated stats / solution.
      const refresh = await fetch(`/api/questions/${id}`);
      if (refresh.ok) {
        const refreshed = (await refresh.json()) as QuestionDetailResponse;
        setData(refreshed);
      }

      // Reset back to phase 1 for next attempt.
      setPhase("answer");
      setUserAnswer("");
      setGrade(null);
      setReflectionNote("");
      setShowSolutionInput(false);
      setProposedSolution("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading question…
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="card bg-red-50 border-red-200 text-red-700 max-w-2xl">
        <p className="font-semibold">{fetchError ?? "Question not found"}</p>
        <Link href="/question-bank" className="text-sm underline mt-2 block">
          ← Back to Question Bank
        </Link>
      </div>
    );
  }

  const { question } = data;
  const hasSolution = question.solution.trim().length > 0;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href="/question-bank" className="text-sm text-slate-500 hover:text-slate-700">
          ← Question Bank
        </Link>
        <span className="text-slate-300">/</span>
        <Link href={`/questions/${id}/reflections`} className="text-sm text-slate-500 hover:text-slate-700">
          View Reflections
        </Link>
      </div>

      {/* Question card */}
      <div className="card">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <DifficultyBadge level={question.difficulty} />
          <span className="badge bg-emerald-50 text-emerald-800">{question.topic}</span>
          <span className="text-xs text-slate-400 font-mono">{question.questionId}</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 leading-relaxed">
          {question.question_content}
        </h2>
        <div className="mt-4 flex gap-4 text-sm text-slate-500">
          <span>{question.timesAttempted} total attempts</span>
          <span>
            {question.timesAttempted > 0
              ? `${Math.round((question.timesCorrect / question.timesAttempted) * 100)}% success rate`
              : "No attempts yet"}
          </span>
        </div>
      </div>

      {/* Session history */}
      {sessionAttempts.length > 0 && (
        <div className="card bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            This Session ({sessionAttempts.length} attempt{sessionAttempts.length !== 1 ? "s" : ""})
          </p>
          <div className="space-y-1">
            {sessionAttempts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${a.grade === "correct" ? "bg-green-500" : "bg-red-400"}`} />
                <span className={a.grade === "correct" ? "text-green-700" : "text-red-600"}>
                  {a.grade === "correct" ? "Correct" : "Incorrect"}
                </span>
                {a.note && <span className="text-slate-500 italic truncate">— {a.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attempt recorded feedback */}
      {lastResult && (
        <div className="card bg-green-50 border border-green-200 text-green-800 text-sm">
          ✅ Attempt recorded.
          {lastResult.solutionUpdated && " Solution updated and stats reset."}
        </div>
      )}

      {/* ── Phase 1: Answer input ── */}
      {phase === "answer" && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-800">Your Answer</h3>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={4}
            placeholder="Write your answer here…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
            <button onClick={() => router.push("/dashboard")} className="btn-secondary">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── Phase 2: Solution reveal + grading ── */}
      {phase === "grade" && (
        <div className="space-y-4">
          {/* Side-by-side answer vs solution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Your Answer
              </p>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">{userAnswer}</p>
            </div>

            <div className={`card ${hasSolution ? "bg-green-50 border border-green-100" : "bg-slate-50"}`}>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                Solution
              </p>
              {hasSolution ? (
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{question.solution}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">No solution stored yet.</p>
              )}
            </div>
          </div>

          {/* Grading form */}
          <div className="card space-y-5">
            <h3 className="font-semibold text-slate-800">Grade This Attempt</h3>

            {/* Grade toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                How did you do? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setGrade("correct")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    grade === "correct"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  ✓ Correct
                </button>
                <button
                  onClick={() => setGrade("incorrect")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    grade === "incorrect"
                      ? "border-red-400 bg-red-50 text-red-600"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  ✗ Incorrect
                </button>
              </div>
            </div>

            {/* Reflection note */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Reflection Note{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={reflectionNote}
                onChange={(e) => setReflectionNote(e.target.value)}
                rows={3}
                placeholder="What did you learn? What tripped you up?"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            {/* Propose new solution */}
            <div>
              <button
                onClick={() => setShowSolutionInput((v) => !v)}
                className="text-sm text-green-600 hover:underline"
              >
                {showSolutionInput ? "− Hide" : "+ Set a new solution for this question"}
              </button>
              {showSolutionInput && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs text-slate-500">
                    Submitting this will update the stored solution and reset attempt stats to 1/1.
                  </p>
                  <textarea
                    value={proposedSolution}
                    onChange={(e) => setProposedSolution(e.target.value)}
                    rows={3}
                    placeholder="Write the correct solution…"
                    className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                  />
                </div>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmitAttempt}
                disabled={!grade || submitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit Attempt"}
              </button>
              <button
                onClick={() => { setPhase("answer"); setGrade(null); }}
                className="btn-secondary"
              >
                ← Edit Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}