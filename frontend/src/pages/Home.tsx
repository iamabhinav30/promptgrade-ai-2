import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { getAnalytics } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import type { AnalyticsResult } from "../types";

function KpiCard({
  label, value, sub, accent, icon,
}: { label: string; value: string; sub: string; accent: string; icon: string }) {
  const accents: Record<string, { bg: string; ring: string; text: string; glow: string }> = {
    violet: { bg: "bg-violet-500/10", ring: "ring-violet-500/20", text: "text-violet-300", glow: "shadow-violet-900/20" },
    emerald: { bg: "bg-emerald-500/10", ring: "ring-emerald-500/20", text: "text-emerald-300", glow: "shadow-emerald-900/20" },
    sky:     { bg: "bg-sky-500/10",     ring: "ring-sky-500/20",     text: "text-sky-300",     glow: "shadow-sky-900/20" },
  };
  const c = accents[accent] ?? accents.violet;
  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--pg-card)] p-6 shadow-lg ${c.glow}`}>
      <div className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg ${c.bg} ring-1 ${c.ring} text-lg`}>
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
      <p className={`mt-3 text-4xl font-bold tabular-nums ${c.text}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-600">{sub}</p>
    </div>
  );
}

const PIPELINE_STEPS = [
  { icon: "→",  label: "Intake",    desc: "Validates domain and length",       color: "text-gray-400",   dot: "bg-gray-500" },
  { icon: "⊞",  label: "Structure", desc: "Formats to standard template",      color: "text-violet-400", dot: "bg-violet-500" },
  { icon: "✦",  label: "Evaluate",  desc: "Scores 6 quality dimensions",       color: "text-sky-400",    dot: "bg-sky-500" },
  { icon: "↺",  label: "Rewrite",   desc: "Auto-improves with LLM (×3 max)",   color: "text-amber-400",  dot: "bg-amber-500" },
  { icon: "✓",  label: "Validate",  desc: "Picks highest-scoring iteration",   color: "text-emerald-400",dot: "bg-emerald-500" },
  { icon: "↑",  label: "Report",    desc: "Saves score, diff, and governance", color: "text-pink-400",   dot: "bg-pink-500" },
];

const BAR_COLORS = ["#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#3b0764", "#2e1065"];

export default function Home() {
  const [data, setData] = useState<AnalyticsResult | null>(null);
  const navigate        = useNavigate();
  const { theme }       = useTheme();
  const isDark          = theme === "dark";

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error);
  }, []);

  const TT = {
    contentStyle: {
      background: isDark ? "#16161f" : "#ffffff",
      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.10)",
      borderRadius: "10px",
      color: isDark ? "#f9fafb" : "#111827",
      fontSize: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    },
    labelStyle: { color: isDark ? "#6b7280" : "#9ca3af" },
    cursor: { stroke: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" },
  };

  const gridStroke  = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";
  const axisStroke  = isDark ? "#374151" : "#d1d5db";
  const tickFill    = isDark ? "#6b7280" : "#9ca3af";

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const isEmpty = (data.totalEvaluations ?? 0) === 0;

  return (
    <div className="space-y-7">

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-[var(--pg-card)] to-[var(--pg-card)] p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-80 rounded-full bg-purple-700/8 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-300">SonarQube for AI Prompts</span>
            </div>
            <h1 className="text-2xl font-bold text-white leading-snug">
              Evaluate, structure, and automatically<br />
              <span className="text-violet-300">improve every AI prompt</span> you ship.
            </h1>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              A 6-agent LangGraph pipeline scores your prompt across 6 quality dimensions,
              rewrites it to a governance-ready template, and tracks improvement over time —
              so your whole team ships consistently excellent AI interactions.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { label: "6 engineering domains", color: "text-violet-300 border-violet-500/30 bg-violet-500/10" },
                { label: "Auto-rewrite loop",      color: "text-sky-300 border-sky-500/30 bg-sky-500/10" },
                { label: "Structured template",    color: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
                { label: "Team governance",        color: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
              ].map(p => (
                <span key={p.label} className={`rounded-full border px-3 py-1 text-[11px] font-medium ${p.color}`}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {isEmpty && (
            <button
              onClick={() => navigate("/evaluate")}
              className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold !text-white shadow-lg shadow-violet-900/40 transition-all hover:bg-violet-500"
            >
              ⚡ Evaluate Your First Prompt
            </button>
          )}
        </div>
      </div>

      {/* ── Pipeline overview ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-[var(--pg-card)] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white">How the Pipeline Works</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center text-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-600">{i + 1}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${step.dot}`} />
              </div>
              <p className={`text-xs font-bold ${step.color}`}>{step.label}</p>
              <p className="text-[10px] text-gray-600 leading-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Quality Metrics</h2>
          <span className="rounded-full border border-white/[0.06] bg-[var(--pg-card)] px-3 py-1 text-xs text-gray-500">
            {data.totalEvaluations ?? 0} evaluations total
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Average Score"   value={data.avgScore.toFixed(2)}                     sub="Across all prompts"         accent="violet"  icon="✦" />
          <KpiCard label="Total Evaluated" value={String(data.totalEvaluations ?? 0)}            sub="Prompts processed"          accent="sky"     icon="⊞" />
          <KpiCard label="Avg Improvement" value={`+${(data.avgImprovement ?? 0).toFixed(1)}%`} sub="Quality gain after rewrite" accent="emerald" icon="↑" />
        </div>
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-[var(--pg-card)] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Score Trend</h2>
            <span className="text-[10px] text-gray-600">7-day rolling</span>
          </div>
          {data.trendByDay.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2">
              <p className="text-sm text-gray-600">No trend data yet</p>
              <button onClick={() => navigate("/evaluate")} className="text-xs text-violet-500 hover:text-violet-400">Run your first evaluation →</button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.trendByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="day" stroke={axisStroke} tick={{ fontSize: 10, fill: tickFill }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 1]} stroke={axisStroke} tick={{ fontSize: 10, fill: tickFill }} tickLine={false} axisLine={false} />
                <Tooltip {...TT} formatter={(v) => [(v as number).toFixed(2), "Score"]} />
                <Line type="monotone" dataKey="avgScore" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3.5, fill: "#7c3aed", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[var(--pg-card)] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Score by Domain</h2>
            <span className="text-[10px] text-gray-600">avg score</span>
          </div>
          {data.scoreByDomain.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2">
              <p className="text-sm text-gray-600">No domain data yet</p>
              <button onClick={() => navigate("/evaluate")} className="text-xs text-violet-500 hover:text-violet-400">Start evaluating →</button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.scoreByDomain} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="domain" stroke={axisStroke} tick={{ fontSize: 10, fill: tickFill }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 1]} stroke={axisStroke} tick={{ fontSize: 10, fill: tickFill }} tickLine={false} axisLine={false} />
                <Tooltip {...TT} formatter={(v) => [(v as number).toFixed(2), "Avg Score"]} />
                <Bar dataKey="avgScore" radius={[5, 5, 0, 0]} maxBarSize={48}>
                  {data.scoreByDomain.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Top failures ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.06] bg-[var(--pg-card)] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Top Failure Patterns</h2>
        {data.topFailures.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <span className="text-emerald-400">✓</span>
            <span className="text-sm text-emerald-300">No failure patterns recorded yet — run evaluations to surface common weaknesses</span>
          </div>
        ) : (
          <div className="space-y-2">
            {data.topFailures.map((f, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-white/[0.06] hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-[10px] font-bold text-red-400">{i + 1}</span>
                  <span className="text-sm text-gray-300">{f.failureReason}</span>
                </div>
                <span className="ml-4 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400 ring-1 ring-red-500/20">×{f.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
