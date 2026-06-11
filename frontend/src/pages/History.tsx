import { useEffect, useState } from "react";
import { getEvaluation, getEvaluations } from "../api/client";
import DiffViewer from "../components/DiffViewer";
import ScoreCard from "../components/ScoreCard";
import type { Domain, EvaluationResult } from "../types";

function ScorePill({ score }: { score: number }) {
  const cls =
    score >= 0.8
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25"
      : score >= 0.5
      ? "bg-amber-500/15 text-amber-300 ring-amber-500/25"
      : "bg-red-500/15 text-red-300 ring-red-500/25";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ring-1 ${cls}`}>
      {score.toFixed(2)}
    </span>
  );
}

const LIMIT = 20;

export default function History() {
  const [domain, setDomain]       = useState<Domain | "">("");
  const [page, setPage]           = useState(0);
  const [rows, setRows]           = useState<EvaluationResult[]>([]);
  const [total, setTotal]         = useState(0);
  const [selected, setSelected]   = useState<EvaluationResult | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    getEvaluations(domain, LIMIT, page * LIMIT).then((r) => {
      setRows(r.evaluations);
      setTotal(r.total);
    });
  }, [domain, page]);

  async function openRow(id: string) {
    setLoadingId(id);
    try { setSelected(await getEvaluation(id)); }
    finally { setLoadingId(null); }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">History</h1>
          <p className="mt-0.5 text-sm text-gray-500">{total} evaluations recorded</p>
        </div>
        <select
          value={domain}
          onChange={(e) => { setDomain(e.target.value as Domain | ""); setPage(0); }}
          className="rounded-lg border border-white/[0.06] bg-[var(--pg-card)] px-3 py-2 text-sm text-gray-300 focus:border-violet-500/50 focus:outline-none cursor-pointer"
        >
          <option value="">All domains</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="devops">DevOps</option>
          <option value="testing">Testing</option>
          <option value="database">Database</option>
          <option value="system_design">System Design</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--pg-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-600">Date</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-600">Domain</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-600">Prompt</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-600">Before</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-600">After</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-600">Gain</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-600">Iters</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-sm text-gray-600">
                  No evaluations yet — go to <span className="text-violet-400">Evaluate</span> to run your first
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.evaluationId}
                onClick={() => openRow(row.evaluationId)}
                className="group cursor-pointer border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                  {new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5">
                  <span className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-gray-400 capitalize">
                    {row.domain.replace("_", " ")}
                  </span>
                </td>
                <td className="max-w-xs truncate px-5 py-3.5 text-xs text-gray-400 group-hover:text-gray-300">
                  {row.originalPrompt}
                </td>
                <td className="px-5 py-3.5 text-right text-xs tabular-nums text-gray-600">{row.originalScore.toFixed(2)}</td>
                <td className="px-5 py-3.5 text-right"><ScorePill score={row.finalScore} /></td>
                <td className="px-5 py-3.5 text-right text-xs font-semibold tabular-nums text-emerald-400">+{row.improvementPct.toFixed(1)}%</td>
                <td className="px-5 py-3.5 text-right text-xs text-gray-600">
                  {loadingId === row.evaluationId ? (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border border-violet-500 border-t-transparent" />
                  ) : row.iterationCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
          <button
            onClick={() => setPage((p) => p - 1)} disabled={page === 0}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/[0.06] hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >← Prev</button>
          <span className="text-xs text-gray-600">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * LIMIT >= total}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/[0.06] hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >Next →</button>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-6 py-10 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-3xl space-y-5 rounded-xl border border-white/[0.08] bg-[var(--pg-modal)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Evaluation Detail</h2>
                <p className="mt-0.5 text-xs text-gray-500">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-gray-200 transition-colors"
              >✕ Close</button>
            </div>
            <ScoreCard result={selected} />
            <DiffViewer
              originalPrompt={selected.originalPrompt}
              finalPrompt={selected.finalPrompt}
              added={selected.diff.added}
              removed={selected.diff.removed}
              improvementPct={selected.improvementPct}
            />
          </div>
        </div>
      )}
    </div>
  );
}
