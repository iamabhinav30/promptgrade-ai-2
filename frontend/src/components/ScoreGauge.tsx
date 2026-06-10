interface ScoreGaugeProps {
  score: number;
  label: string;
}

function colorClass(score: number): string {
  if (score < 0.5) return "text-red-600 stroke-red-500";
  if (score < 0.8) return "text-amber-600 stroke-amber-500";
  return "text-emerald-600 stroke-emerald-500";
}

export default function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const normalized = Math.max(0, Math.min(score, 1));
  const circumference = 220;
  const dash = normalized * circumference;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="relative mx-auto h-36 w-64">
        <svg viewBox="0 0 260 150" className="h-full w-full">
          <path d="M30 130 A100 100 0 0 1 230 130" fill="none" strokeWidth="18" className="stroke-slate-200" strokeLinecap="round" />
          <path
            d="M30 130 A100 100 0 0 1 230 130"
            fill="none"
            strokeWidth="18"
            className={colorClass(score)}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <div className={`text-4xl font-extrabold ${colorClass(score).split(" ")[0]}`}>{score.toFixed(2)}</div>
          <div className="text-sm font-medium text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );
}
