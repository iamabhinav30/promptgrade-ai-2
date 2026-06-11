import { useState } from "react";
import { evaluatePrompt } from "../api/client";
import AgentProgress from "../components/AgentProgress";
import DiffViewer from "../components/DiffViewer";
import RadarChart from "../components/RadarChart";
import ScoreCard from "../components/ScoreCard";
import ScoreGauge from "../components/ScoreGauge";
import type { AgentProgressEvent, Domain, EvaluationResult } from "../types";

const DOMAINS: { value: Domain; label: string; desc: string }[] = [
  { value: "frontend",      label: "Frontend",      desc: "React, Vue, HTML/CSS" },
  { value: "backend",       label: "Backend",       desc: "APIs, services, logic" },
  { value: "devops",        label: "DevOps",        desc: "CI/CD, infra, deploy" },
  { value: "testing",       label: "Testing",       desc: "QA, coverage, TDD" },
  { value: "database",      label: "Database",      desc: "SQL, NoSQL, queries" },
  { value: "system_design", label: "System Design", desc: "Architecture, scale" },
];

const EXAMPLES: Record<Domain, string> = {
  frontend:      "Build a responsive navigation component with a hamburger menu for mobile, dropdowns on desktop, and active state highlighting.",
  backend:       "Write a REST API endpoint that handles user authentication, validates JWT tokens, and returns user profile data with proper error handling.",
  devops:        "Create a GitHub Actions workflow that runs tests, builds a Docker image, pushes to ECR, and deploys to ECS on merge to main.",
  testing:       "Write unit tests for a user registration service that validates email, hashes passwords, and sends confirmation emails.",
  database:      "Design a SQL schema for a multi-tenant SaaS application with users, organizations, roles, and audit logging.",
  system_design: "Design a real-time notification system that handles 1M concurrent users with guaranteed delivery and sub-100ms latency.",
};

export default function Evaluate() {
  const [prompt, setPrompt]   = useState("");
  const [domain, setDomain]   = useState<Domain>("frontend");
  const [loading, setLoading] = useState(false);
  const [events, setEvents]   = useState<AgentProgressEvent[]>([]);
  const [result, setResult]   = useState<EvaluationResult | null>(null);
  const [error, setError]     = useState("");

  async function run() {
    setError("");
    setResult(null);
    setLoading(true);
    setEvents([{ agent: "intake", status: "running" }]);
    try {
      setEvents([
        { agent: "intake",   status: "complete" },
        { agent: "evaluate", status: "running" },
      ]);
      const data = await evaluatePrompt(prompt, domain);
      setEvents([
        { agent: "intake",   status: "complete" },
        { agent: "evaluate", status: "complete", score: data.originalScore },
        { agent: "rewrite",  status: "complete", iteration: Math.max(data.iterationCount - 1, 0) },
        { agent: "validate", status: "complete" },
        { agent: "report",   status: "complete", improvementPct: data.improvementPct },
      ]);
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || "Evaluation failed");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const origDims  = result?.iterations[0]?.dimensions ?? [];
  const finalDims = result?.iterations[result.iterations.length - 1]?.dimensions ?? [];
  const canSubmit = !loading && prompt.trim().length >= 20;

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Evaluate Prompt</h1>
        <p className="mt-0.5 text-sm text-gray-500">Score your AI prompt and get an auto-rewritten, improved version</p>
      </div>

      {/* Input card */}
      <div className="rounded-xl border border-white/[0.06] bg-[#13131a] p-6 space-y-6">

        {/* Domain selector */}
        <div>
          <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-gray-500">Domain</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {DOMAINS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDomain(d.value)}
                className={`flex flex-col items-center rounded-lg border px-2 py-2.5 text-center transition-all duration-150 ${
                  domain === d.value
                    ? "border-violet-500/50 bg-violet-600/20 text-violet-300 ring-1 ring-inset ring-violet-500/30"
                    : "border-white/[0.06] bg-white/[0.02] text-gray-500 hover:border-white/10 hover:text-gray-300"
                }`}
              >
                <span className="text-xs font-semibold">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt textarea */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Prompt</label>
            <button
              onClick={() => setPrompt(EXAMPLES[domain])}
              className="text-[11px] text-violet-500 hover:text-violet-400 transition-colors"
            >
              Use example →
            </button>
          </div>
          <div className="relative">
            <textarea
              rows={8}
              maxLength={2000}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Paste your ${domain.replace("_", " ")} prompt here… (min 20 chars)`}
              className="w-full resize-none rounded-lg border border-white/[0.06] bg-[#0d0d12] px-4 py-3 text-sm text-gray-200 placeholder-gray-700 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-colors leading-relaxed"
            />
            <span className={`absolute bottom-3 right-3 text-[11px] tabular-nums transition-colors ${
              prompt.length > 1800 ? "text-amber-400" : "text-gray-700"
            }`}>
              {prompt.length}/2000
            </span>
          </div>
          {prompt.trim().length > 0 && prompt.trim().length < 20 && (
            <p className="mt-1.5 text-[11px] text-amber-500">Minimum 20 characters required ({20 - prompt.trim().length} more)</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <span className="text-red-400 text-sm font-bold flex-shrink-0">✕</span>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={run}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:bg-violet-500 hover:shadow-violet-800/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Running evaluation pipeline…
            </>
          ) : (
            <>
              <span>⚡</span>
              Evaluate Prompt
            </>
          )}
        </button>
      </div>

      {/* Pipeline progress */}
      {(loading || events.length > 0) && (
        <AgentProgress events={events} isLoading={loading} />
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Score gauges */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ScoreGauge score={result.originalScore} label="Original Score" />
            <ScoreGauge score={result.finalScore}    label="Final Score" />
          </div>

          {/* Score card */}
          <ScoreCard result={result} />

          {/* Radar chart */}
          <div className="rounded-xl border border-white/[0.06] bg-[#13131a] p-6">
            <h2 className="mb-1 text-sm font-semibold text-white">Dimension Analysis</h2>
            <p className="mb-4 text-xs text-gray-500">Original vs improved across all quality dimensions</p>
            <RadarChart originalDimensions={origDims} finalDimensions={finalDims} />
          </div>

          {/* Diff viewer */}
          {result.iterationCount > 0 && (
            <DiffViewer
              originalPrompt={result.originalPrompt}
              finalPrompt={result.finalPrompt}
              added={result.diff.added}
              removed={result.diff.removed}
              improvementPct={result.improvementPct}
            />
          )}
        </div>
      )}
    </div>
  );
}
