import Link from "next/link";
import DifficultyBadge from "./DifficultyBadge";

interface RecommendationCardProps {
  question: {
    id: string;
    questionId: string;
    question_content: string;
    topic: string;
    difficulty: number;
    solution: string;
    timesAttempted: number;
    successRate: number;
    relevanceScore: number;
  };
}

export default function RecommendationCard({ question }: RecommendationCardProps) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-mono text-xs text-slate-400">
            {question.questionId}
          </span>
          <span className="badge bg-yellow-50 text-lime-600">{question.topic}</span>
        </div>
        <p className="text-slate-800 font-medium line-clamp-2">
          {question.question_content}
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <DifficultyBadge level={question.difficulty} />
        <div className="text-right">
          <p className="text-xs text-slate-400">Success Rate</p>
          <p
            className={`font-semibold text-sm ${
              question.timesAttempted === 0
                ? "text-slate-400"
                : question.successRate >= 70
                ? "text-green-600"
                : question.successRate >= 40
                ? "text-amber-600"
                : "text-red-500"
            }`}
          >
            {question.timesAttempted === 0 ? "New" : `${question.successRate}%`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Attempts</p>
          <p className="font-semibold text-sm text-slate-700">
            {question.timesAttempted}
          </p>
        </div>
        <Link
          href={`/questions/${question.id}`}
          className="text-xs font-semibold text-emerald-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          Attempt →
        </Link>
      </div>
    </div>
  );
}
