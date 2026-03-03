interface SkillCardProps {
  topic: string;
  skill: number;
  accuracy: number;
  totalAttempts: number;
  correctAttempts: number;
  isWeakest?: boolean;
}

export default function SkillCard({
  topic,
  skill,
  accuracy,
  totalAttempts,
  correctAttempts,
  isWeakest = false,
}: SkillCardProps) {
  const fillPercent = (skill / 10) * 100;

  const barColor =
    skill <= 3
      ? "bg-red-400"
      : skill <= 6
      ? "bg-amber-400"
      : "bg-green-400";

  return (
    <div
      className={`card ${
        isWeakest ? "border-amber-300 bg-amber-50/50" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800">{topic}</h3>
          {isWeakest && (
            <span className="badge bg-amber-100 text-amber-700 mt-1">
              Needs focus
            </span>
          )}
        </div>
        <span className="text-2xl font-bold text-slate-700">
          {skill.toFixed(1)}
          <span className="text-sm font-normal text-slate-400">/10</span>
        </span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>{totalAttempts} attempts</span>
        <span>
          {correctAttempts}/{totalAttempts} correct
        </span>
        <span>{accuracy}% accuracy</span>
      </div>
    </div>
  );
}
