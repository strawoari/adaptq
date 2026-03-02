"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SkillStatsResponse, RecommendationsResponse } from "@/types";
import SkillCard from "@/components/SkillCard";
import RecommendationCard from "@/components/RecommendationCard";
import StatSummary from "@/components/StatSummary";

export default function DashboardPage() {
  const [stats, setStats] = useState<SkillStatsResponse | null>(null);
  const [recs, setRecs] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recsRes] = await Promise.all([
          fetch("/api/skill-stats"),
          fetch("/api/recommendations"),
        ]);

        if (!statsRes.ok || !recsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const [statsData, recsData] = await Promise.all([
          statsRes.json() as Promise<SkillStatsResponse>,
          recsRes.json() as Promise<RecommendationsResponse>,
        ]);

        setStats(statsData);
        setRecs(recsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-lg">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200 text-red-700">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  if (!stats || stats.totalAttempts === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">
          No data yet
        </h2>
        <p className="text-slate-500 mb-6">
          Upload a CSV file to see your skill dashboard.
        </p>
        <Link href="/upload" className="btn-primary">
          Upload CSV
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Your adaptive learning insights
          </p>
        </div>
        <Link href="/upload" className="btn-secondary text-sm py-2 px-4">
          + Upload More
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatSummary
          label="Overall Accuracy"
          value={`${stats.overallAccuracy}%`}
          icon="🎯"
          highlight={stats.overallAccuracy >= 70}
        />
        <StatSummary
          label="Total Attempts"
          value={stats.totalAttempts.toString()}
          icon="📝"
        />
        <StatSummary
          label="Topics Covered"
          value={stats.topicSkills.length.toString()}
          icon="📚"
        />
      </div>

      {stats.weakestTopic && (
        <div className="card bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm text-amber-600 font-medium">
                Focus Area
              </p>
              <p className="font-bold text-amber-800 text-lg">
                {stats.weakestTopic}
              </p>
              <p className="text-sm text-amber-600">
                Your weakest topic — prioritize this in your studies.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Skill by Topic
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.topicSkills.map((ts) => (
            <SkillCard
              key={ts.topic}
              topic={ts.topic}
              skill={ts.skill}
              accuracy={ts.accuracy}
              totalAttempts={ts.totalAttempts}
              correctAttempts={ts.correctAttempts}
              isWeakest={ts.topic === stats.weakestTopic}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Recommended Questions
        </h2>
        {recs && recs.recommendations.length > 0 ? (
          <div className="space-y-3">
            {recs.recommendations.map((rec) => (
              <RecommendationCard key={rec.questionId} question={rec} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8 text-slate-500">
            No recommendations available. Upload more questions of similar difficulties to
            unlock personalized suggestions.
          </div>
        )}
      </div>
    </div>
  );
}
