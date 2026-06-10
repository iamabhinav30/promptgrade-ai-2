import { useState } from "react";
import { evaluatePrompt } from "../api/client";
import AgentProgress from "../components/AgentProgress";
import DiffViewer from "../components/DiffViewer";
import RadarChart from "../components/RadarChart";
import ScoreCard from "../components/ScoreCard";
import ScoreGauge from "../components/ScoreGauge";
import type { AgentProgressEvent, Domain, EvaluationResult } from "../types";

const domains: Array<{ value: Domain; label: string }> = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "devops", label: "DevOps" },
  { value: "testing", label: "Testing" },
  { value: "database", label: "Database" },
  { value: "system_design", label: "System Design" },
];

export default function Evaluate() {
  const [prompt, setPrompt] = useState("Write a React component for a user form");
  const [domain, setDomain] = useState<Domain>("frontend");
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<AgentProgressEvent[]>([]);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");

  async function onSubmit() {
    setError("");
    setResult(null);
    setIsLoading(true);
    setEvents([{ agent: "intake", status: "running" }]);
    try {
      setEvents((prev) => [...prev, { agent: "intake", status: "complete" }, { agent: "evaluate", status: "running" }]);
      const data = await evaluatePrompt(prompt, domain);
      setEvents((prev) => [
        ...prev,
        { agent: "evaluate", status: "complete", score: data.originalScore },
        { agent: "rewrite", status: "complete", iteration: Math.max(data.iterationCount - 1, 0) },
        { agent: "validate", status: "complete" },
        { agent: "report", status: "complete", improvementPct: data.improvementPct },
      ]);
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Evaluation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  const originalDimensions = result?.iterations[0]?.dimensions ?? [];
  const finalDimensions = result?.iterations[result.iterations.length - 1]?.dimensions ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Evaluate Prompt</h1>
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Prompt</label>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={6} maxLength={2000} className="w-full rounded-xl border border-slate-300 p-4 outline-none ring-indigo-500 focus:ring-2" />
            <div className="mt-1 text-right text-xs text-slate-500">{prompt.length}/2000</div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Domain</label>
            <select value={domain} onChange={(event) => setDomain(event.target.value as Domain)} className="w-full rounded-xl border border-slate-300 p-3 outline-none ring-indigo-500 focus:ring-2">
              {domains.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <button disabled={isLoading || prompt.length < 20} onClick={onSubmit} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? "Evaluating..." : "Evaluate"}
          </button>
          {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{String(error)}</div>}
        </div>
      </section>

      {(isLoading || events.length > 0) && <AgentProgress events={events} isLoading={isLoading} />}

      {result && (
        <>
          <section className="grid gap-4 md:grid-cols-2"><ScoreGauge score={result.originalScore} label="Original Score" /><ScoreGauge score={result.finalScore} label="Final Score" /></section>
          <ScoreCard result={result} />
          <RadarChart originalDimensions={originalDimensions} finalDimensions={finalDimensions} />
          {result.iterationCount > 0 && <DiffViewer originalPrompt={result.originalPrompt} finalPrompt={result.finalPrompt} added={result.diff.added} removed={result.diff.removed} improvementPct={result.improvementPct} />}
        </>
      )}
    </div>
  );
}
