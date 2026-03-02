const levelConfig: Record<
  number,
  { label: string; className: string }
> = {
  1: { label: "L1 · Beginner", className: "bg-green-100 text-green-700" },
  2: { label: "L2 · Easy", className: "bg-teal-100 text-teal-700" },
  3: { label: "L3 · Medium", className: "bg-blue-100 text-blue-700" },
  4: { label: "L4 · Hard", className: "bg-orange-100 text-orange-700" },
  5: { label: "L5 · Expert", className: "bg-red-100 text-red-700" },
};

export default function DifficultyBadge({ level }: { level: number }) {
  const config = levelConfig[level] ?? {
    label: `L${level}`,
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`badge ${config.className}`}>{config.label}</span>
  );
}
