import { useRef, useState } from "react";
import { evaluateBatch, evaluateFileStream, evaluatePromptStream } from "../api/client";
import AgentProgress from "../components/AgentProgress";
import DiffViewer from "../components/DiffViewer";
import RadarChart from "../components/RadarChart";
import ScoreCard from "../components/ScoreCard";
import ScoreGauge from "../components/ScoreGauge";
import StructuredPromptViewer from "../components/StructuredPromptViewer";
import type { AgentProgressEvent, Domain, EvaluationResult } from "../types";

const DOMAINS: { value: Domain; label: string }[] = [
  { value: "frontend",      label: "Frontend" },
  { value: "backend",       label: "Backend" },
  { value: "devops",        label: "DevOps" },
  { value: "testing",       label: "Testing" },
  { value: "database",      label: "Database" },
  { value: "system_design", label: "System Design" },
];

const EXAMPLES: Record<Domain, string> = {
  frontend:      "Build a responsive navigation component with a hamburger menu for mobile, dropdowns on desktop, and active state highlighting.",
  backend:       "Write a REST API endpoint that handles user authentication, validates JWT tokens, and returns user profile data with proper error handling.",
  devops:        "Create a GitHub Actions workflow that runs tests, builds a Docker image, pushes to ECR, and deploys to ECS on merge to main.",
  testing:       "Write unit tests for a user registration service that validates email, hashes passwords, and sends confirmation emails.",
  database:      "Design a SQL schema for a multi-tenant SaaS application with users, organizations, roles, and audit logging.",
  system_design: "Design a real-time notification system that handles 1M concurrent users with guaranteed delivery and sub-100ms latency.",
};

type Tab = "text" | "file" | "batch";

type BatchItem = {
  file: File;
  status: "queued" | "running" | "done" | "error";
  result?: EvaluationResult;
  error?: string;
};

function completeEvents(data: EvaluationResult): AgentProgressEvent[] {
  return [
    { agent: "intake",    status: "complete" },
    { agent: "structure", status: "complete" },
    { agent: "evaluate",  status: "complete", score: data.originalScore },
    { agent: "rewrite",   status: "complete", iteration: Math.max(data.iterationCount - 1, 0) },
    { agent: "validate",  status: "complete" },
    { agent: "report",    status: "complete", improvementPct: data.improvementPct },
  ];
}

function ScorePill({ score }: { score: number }) {
  const cls =
    score >= 0.8
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25"
      : score >= 0.5
      ? "bg-amber-500/15 text-amber-300 ring-amber-500/25"
      : "bg-red-500/15 text-red-300 ring-red-500/25";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ring-1 ${cls}`}>
      {score.toFixed(2)}
    </span>
  );
}

export default function Evaluate() {
  const [tab, setTab]               = useState<Tab>("text");
  const [prompt, setPrompt]         = useState("");
  const [domain, setDomain]         = useState<Domain>("frontend");
  const [file, setFile]             = useState<File | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [events, setEvents]         = useState<AgentProgressEvent[]>([]);
  const [result, setResult]         = useState<EvaluationResult | null>(null);
  const [error, setError]           = useState("");
  const fileRef                     = useRef<HTMLInputElement>(null);
  const batchRef                    = useRef<HTMLInputElement>(null);

  function mergeEvent(ev: AgentProgressEvent) {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.agent === ev.agent);
      if (idx >= 0) { const next = [...prev]; next[idx] = ev; return next; }
      return [...prev, ev];
    });
  }

  async function run() {
    setError(""); setResult(null); setBatchItems([]);
    setLoading(true);
    setEvents([{ agent: "intake", status: "running" }]);
    try {
      if (tab === "batch") { await runBatch(); return; }
      const data = tab === "file" && file
        ? await evaluateFileStream(file, domain, mergeEvent)
        : await evaluatePromptStream(prompt, domain, mergeEvent);
      setEvents(completeEvents(data));
      setResult(data);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || "Evaluation failed");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function runBatch() {
    const items: BatchItem[] = batchFiles.map(f => ({ file: f, status: "queued" }));
    setBatchItems([...items]);
    await evaluateBatch(
      batchFiles, domain,
      (i) => setBatchItems(prev => { const n = [...prev]; n[i] = { ...n[i], status: "running" }; return n; }),
      (i, res) => setBatchItems(prev => { const n = [...prev]; n[i] = { ...n[i], status: "done", result: res }; return n; }),
      (i, err) => setBatchItems(prev => { const n = [...prev]; n[i] = { ...n[i], status: "error", error: err }; return n; }),
    );
    setLoading(false);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".md")) { setFile(dropped); setError(""); }
    else setError("Only .md files are supported.");
  }

  function handleBatchDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith(".md"));
    if (dropped.length) { setBatchFiles(dropped); setError(""); }
    else setError("Only .md files are supported.");
  }

  const canSubmit = !loading && (
    tab === "text"  ? prompt.trim().length >= 20 :
    tab === "file"  ? file !== null :
                      batchFiles.length > 0
  );

  const origDims  = result?.iterations[0]?.dimensions ?? [];
  const finalDims = result?.iterations[result.iterations.length - 1]?.dimensions ?? [];
  const doneCount = batchItems.filter(i => i.status === "done").length;
  const batchDone = batchItems.length > 0 && batchItems.every(i => i.status === "done" || i.status === "error");

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-semibold text-white">Evaluate Prompt</h1>
        <p className="mt-0.5 text-sm text-gray-500">Score, structure, and auto-improve your AI prompts with a 6-agent pipeline</p>
      </div>

      {/* Input card */}
      <div className="rounded-xl border border-white/[0.06] bg-[var(--pg-card)] p-6 space-y-6">

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1 w-fit">
          {(["text", "file", "batch"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                tab === t ? "bg-violet-600 !text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t === "text" ? "Paste Prompt" : t === "file" ? "Upload .md" : "Batch Files"}
            </button>
          ))}
        </div>

        {/* Domain selector */}
        <div>
          <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-gray-500">Domain</label>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDomain(d.value)}
                className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                  domain === d.value
                    ? "border-violet-500/50 bg-violet-600/20 text-violet-300 ring-1 ring-inset ring-violet-500/30"
                    : "border-white/[0.06] text-gray-500 hover:border-white/10 hover:text-gray-300"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        {tab === "text" && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">Prompt</label>
              <button onClick={() => setPrompt(EXAMPLES[domain])} className="text-[11px] text-violet-500 hover:text-violet-400 transition-colors">
                Use example →
              </button>
            </div>
            <div className="relative">
              <textarea
                rows={8}
                maxLength={8000}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Paste your ${domain.replace("_", " ")} prompt here… (min 20 chars)`}
                className="w-full resize-none rounded-lg border border-white/[0.06] bg-[var(--pg-page)] px-4 py-3 text-sm text-gray-200 placeholder-gray-700 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-colors leading-relaxed"
              />
              <span className={`absolute bottom-3 right-3 text-[11px] tabular-nums ${prompt.length > 7200 ? "text-amber-400" : "text-gray-700"}`}>
                {prompt.length}/8000
              </span>
            </div>
            {prompt.trim().length > 0 && prompt.trim().length < 20 && (
              <p className="mt-1.5 text-[11px] text-amber-500">{20 - prompt.trim().length} more characters needed</p>
            )}
          </div>
        )}

        {/* Single file upload */}
        {tab === "file" && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500">Prompt File</label>
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
                file ? "border-violet-500/40 bg-violet-500/5" : "border-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              <input ref={fileRef} type="file" accept=".md" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setError(""); } }} />
              {file ? (
                <div className="space-y-2">
                  <p className="text-2xl">📄</p>
                  <p className="text-sm font-semibold text-violet-300">{file.name}</p>
                  <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(1)} KB · click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-2xl">⬆</p>
                  <p className="text-sm text-gray-400">Drop a <span className="font-mono text-violet-400">.md</span> file here or click to browse</p>
                  <p className="text-xs text-gray-600">Max 8 KB · UTF-8 encoded</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Batch file upload */}
        {tab === "batch" && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500">
              Prompt Files — {batchFiles.length} selected
            </label>
            <div
              onDrop={handleBatchDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => batchRef.current?.click()}
              className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
                batchFiles.length > 0 ? "border-violet-500/40 bg-violet-500/5" : "border-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              <input ref={batchRef} type="file" accept=".md" multiple className="hidden"
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []).filter(f => f.name.endsWith(".md"));
                  if (picked.length) { setBatchFiles(picked); setError(""); }
                }} />
              {batchFiles.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-violet-300">{batchFiles.length} file{batchFiles.length > 1 ? "s" : ""} selected</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {batchFiles.slice(0, 6).map((f, i) => (
                      <span key={i} className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-gray-400 font-mono">{f.name}</span>
                    ))}
                    {batchFiles.length > 6 && <span className="text-xs text-gray-600">+{batchFiles.length - 6} more</span>}
                  </div>
                  <p className="text-xs text-gray-600">click to change selection</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-2xl">📂</p>
                  <p className="text-sm text-gray-400">Drop multiple <span className="font-mono text-violet-400">.md</span> files or click to browse</p>
                  <p className="text-xs text-gray-600">Each file is evaluated independently · Max 8 KB each</p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <span className="flex-shrink-0 text-sm font-bold text-red-400">✕</span>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <button
          onClick={run}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold !text-white shadow-lg shadow-violet-900/30 transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {tab === "batch" ? `Evaluating batch… (${doneCount}/${batchFiles.length})` : "Running pipeline…"}
            </>
          ) : (
            <> ⚡ {tab === "batch" ? `Evaluate ${batchFiles.length || ""} Files` : "Evaluate Prompt"} </>
          )}
        </button>
      </div>

      {/* Pipeline progress */}
      {tab !== "batch" && (loading || events.length > 0) && (
        <AgentProgress events={events} isLoading={loading} />
      )}

      {/* Batch results table */}
      {tab === "batch" && batchItems.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[var(--pg-card)] overflow-hidden">
          <div className="border-b border-white/[0.06] px-5 py-3.5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Batch Results</h2>
            {batchDone && <span className="text-xs text-emerald-400">{doneCount}/{batchItems.length} completed</span>}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-600">File</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-600">Status</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-600">Before</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-600">After</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-600">Gain</th>
              </tr>
            </thead>
            <tbody>
              {batchItems.map((item, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{item.file.name}</td>
                  <td className="px-5 py-3">
                    {item.status === "queued"  && <span className="text-xs text-gray-600">Queued</span>}
                    {item.status === "running" && (
                      <span className="flex items-center gap-1.5 text-xs text-violet-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />Running…
                      </span>
                    )}
                    {item.status === "done"  && <span className="text-xs text-emerald-400">Done</span>}
                    {item.status === "error" && <span className="text-xs text-red-400 truncate max-w-xs block">{item.error}</span>}
                  </td>
                  <td className="px-5 py-3 text-right text-xs tabular-nums text-gray-600">
                    {item.result ? item.result.originalScore.toFixed(2) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {item.result ? <ScorePill score={item.result.finalScore} /> : <span className="text-xs text-gray-700">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right text-xs font-semibold tabular-nums text-emerald-400">
                    {item.result ? `+${item.result.improvementPct.toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Single-file results */}
      {result && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ScoreGauge score={result.originalScore} label="Original Score" />
            <ScoreGauge score={result.finalScore}    label="Final Score" />
          </div>
          <StructuredPromptViewer content={result.structuredPrompt || result.finalPrompt} />
          <ScoreCard result={result} />
          <div className="rounded-xl border border-white/[0.06] bg-[var(--pg-card)] p-6">
            <h2 className="mb-1 text-sm font-semibold text-white">Dimension Analysis</h2>
            <p className="mb-4 text-xs text-gray-500">Original vs improved across all quality dimensions</p>
            <RadarChart originalDimensions={origDims} finalDimensions={finalDims} />
          </div>
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
