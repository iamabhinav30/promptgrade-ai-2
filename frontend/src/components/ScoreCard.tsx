import type { EvaluationResult } from "../types";

function dimColor(score: number) {
  if (score < 0.5) return { bar: "bg-red-500",    text: "text-red-400" };
  if (score < 0.8) return { bar: "bg-amber-500",  text: "text-amber-400" };
  return             { bar: "bg-emerald-500",      text: "text-emerald-400" };
}

export default function ScoreCard({ result }: { result: EvaluationResult }) {
  const dims     = result.iterations[result.iterations.length - 1]?.dimensions ?? [];
  const failures = dims.filter((d) => d.failureReason);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[var(--pg-card)] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Scorecard</h2>
          <p className="mt-0.5 text-xs text-gray-600 capitalize">Domain: {result.domain.replace("_", " ")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-center">
            <p className="text-[10px] text-gray-600">Original</p>
            <p className="text-xl font-bold tabular-nums text-gray-400">{result.originalScore.toFixed(2)}</p>
          </div>
          <span className="text-gray-700">→</span>
          <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-center">
            <p className="text-[10px] text-violet-500">Final</p>
            <p className="text-xl font-bold tabular-nums text-violet-300">{result.finalScore.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center">
            <p className="text-[10px] text-emerald-500">Gain</p>
            <p className="text-xl font-bold tabular-nums text-emerald-300">+{result.improvementPct.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="space-y-3.5">
        {dims.map((d) => {
          const { bar, text } = dimColor(d.score);
          return (
            <div key={d.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-400 capitalize">{d.name.replace("_", " ")}</span>
                <span className={`text-xs font-bold tabular-nums ${text}`}>{(d.score * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.05]">
                <div className={`h-1.5 rounded-full ${bar} transition-all duration-700`} style={{ width: `${d.score * 100}%` }} />
              </div>
              {d.failureReason && <p className="mt-1 text-[11px] text-red-400">{d.failureReason}</p>}
            </div>
          );
        })}
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
          {result.iterationCount} iteration{result.iterationCount !== 1 ? "s" : ""}
        </span>
        {failures.length === 0 ? (
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            ✓ No critical failures
          </span>
        ) : (
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
            {failures.length} dimension{failures.length !== 1 ? "s" : ""} need attention
          </span>
        )}
      </div>
    </div>
  );
}
