interface StatSummaryProps {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}

export default function StatSummary({
  label,
  value,
  icon,
  highlight = false,
}: StatSummaryProps) {
  return (
    <div
      className={`card flex items-center gap-4 ${
        highlight ? "border-green-300 bg-green-50/50" : ""
      }`}
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
