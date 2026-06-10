import type { EvaluationResult } from "../types";

interface ScoreCardProps {
  result: EvaluationResult;
}

function scoreColor(score: number): string {
  if (score < 0.5) return "bg-red-500";
  if (score < 0.8) return "bg-amber-500";
  return "bg-emerald-500";
}

function latestDimensions(result: EvaluationResult) {
  return result.iterations[result.iterations.length - 1]?.dimensions ?? [];
}

export default function ScoreCard({ result }: ScoreCardProps) {
  const dimensions = latestDimensions(result);
  const failures = dimensions.filter((dimension) => dimension.failureReason);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Scorecard</h2>
          <p className="text-sm text-slate-500">Domain: {result.domain.replace("_", " ")}</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl bg-slate-100 px-4 py-2 text-center">
            <div className="text-xs text-slate-500">Original</div>
            <div className="text-2xl font-bold">{result.originalScore.toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-indigo-50 px-4 py-2 text-center">
            <div className="text-xs text-indigo-600">Final</div>
            <div className="text-2xl font-bold text-indigo-700">{result.finalScore.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${result.improvementPct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {result.improvementPct.toFixed(2)}% improvement
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
          {result.iterationCount} iterations
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {dimensions.map((dimension) => (
          <div key={dimension.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium capitalize text-slate-700">{dimension.name.replace("_", " ")}</span>
              <span className="font-bold text-slate-900">{dimension.score.toFixed(2)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${scoreColor(dimension.score)}`} style={{ width: `${dimension.score * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-red-50 p-4">
          <h3 className="font-semibold text-red-700">Failures</h3>
          {failures.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
              {failures.map((failure) => <li key={failure.name}>{failure.failureReason}</li>)}
            </ul>
          ) : <p className="mt-2 text-sm text-red-700">No critical failures in the final iteration.</p>}
        </div>
        <div className="rounded-xl bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-700">Recommendations</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-700">
            <li>Keep task, constraints, context, and acceptance criteria explicit.</li>
            <li>Include edge cases and target output structure for production prompts.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
