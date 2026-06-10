import { useEffect, useState } from "react";
import { getEvaluation, getEvaluations } from "../api/client";
import DiffViewer from "../components/DiffViewer";
import ScoreCard from "../components/ScoreCard";
import type { Domain, EvaluationResult } from "../types";

function scoreClass(score: number) {
  if (score < 0.5) return "text-red-700 bg-red-50";
  if (score < 0.8) return "text-amber-700 bg-amber-50";
  return "text-emerald-700 bg-emerald-50";
}

export default function History() {
  const [domain, setDomain] = useState<Domain | "">("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<EvaluationResult[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<EvaluationResult | null>(null);
  const limit = 20;

  useEffect(() => {
    getEvaluations(domain, limit, page * limit).then((response) => { setRows(response.evaluations); setTotal(response.total); });
  }, [domain, page]);

  async function openDetails(id: string) {
    setSelected(await getEvaluation(id));
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Evaluation History</h1>
        <select value={domain} onChange={(event) => { setDomain(event.target.value as Domain | ""); setPage(0); }} className="rounded-xl border border-slate-300 p-3">
          <option value="">All domains</option><option value="frontend">Frontend</option><option value="backend">Backend</option><option value="devops">DevOps</option><option value="testing">Testing</option><option value="database">Database</option><option value="system_design">System Design</option>
        </select>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600"><tr><th className="p-4">Date</th><th>Domain</th><th>Original</th><th>Final</th><th>Improvement %</th><th>Iterations</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.evaluationId} onClick={() => openDetails(row.evaluationId)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                <td className="p-4">{new Date(row.createdAt).toLocaleString()}</td><td className="capitalize">{row.domain.replace("_", " ")}</td><td>{row.originalScore.toFixed(2)}</td><td><span className={`rounded-full px-2 py-1 font-bold ${scoreClass(row.finalScore)}`}>{row.finalScore.toFixed(2)}</span></td><td>{row.improvementPct.toFixed(2)}%</td><td>{row.iterationCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between border-t border-slate-100 p-4">
          <button className="rounded-lg border px-4 py-2 disabled:opacity-40" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Prev</button>
          <span className="text-sm text-slate-500">Page {page + 1} · {total} total</span>
          <button className="rounded-lg border px-4 py-2 disabled:opacity-40" disabled={(page + 1) * limit >= total} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-6">
          <div className="mx-auto max-w-5xl space-y-4 rounded-2xl bg-slate-50 p-6">
            <div className="flex justify-end"><button className="rounded-lg bg-slate-900 px-4 py-2 text-white" onClick={() => setSelected(null)}>Close</button></div>
            <ScoreCard result={selected} />
            <DiffViewer originalPrompt={selected.originalPrompt} finalPrompt={selected.finalPrompt} added={selected.diff.added} removed={selected.diff.removed} improvementPct={selected.improvementPct} />
          </div>
        </div>
      )}
    </div>
  );
}
