import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { getAnalytics } from "../api/client";
import type { AnalyticsResult } from "../types";

const TT = {
  contentStyle: {
    background: "#16161f", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", color: "#f9fafb", fontSize: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  },
  labelStyle: { color: "#6b7280" },
  cursor: { stroke: "rgba(255,255,255,0.06)" },
};

function KpiCard({
  label, value, sub, accent, icon,
}: { label: string; value: string; sub: string; accent: string; icon: string }) {
  const accents: Record<string, { bg: string; ring: string; text: string; glow: string; dot: string }> = {
    violet: { bg: "bg-violet-500/10", ring: "ring-violet-500/20", text: "text-violet-300", glow: "shadow-violet-900/30", dot: "bg-violet-500" },
    emerald: { bg: "bg-emerald-500/10", ring: "ring-emerald-500/20", text: "text-emerald-300", glow: "shadow-emerald-900/30", dot: "bg-emerald-500" },
    sky:     { bg: "bg-sky-500/10",     ring: "ring-sky-500/20",     text: "text-sky-300",     glow: "shadow-sky-900/30",     dot: "bg-sky-500" },
  };
  const c = accents[accent] ?? accents.violet;
  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#13131a] p-6 shadow-lg ${c.glow}`}>
      <div className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg ${c.bg} ring-1 ${c.ring} text-lg`}>
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
      <p className={`mt-3 text-4xl font-bold tabular-nums ${c.text}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-600">{sub}</p>
    </div>
  );
}

const BAR_COLORS = ["#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#3b0764", "#2e1065"];

export default function Home() {
  const [data, setData] = useState<AnalyticsResult | null>(null);

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Prompt quality metrics across all evaluations</p>
        </div>
        <span className="rounded-full border border-white/[0.06] bg-[#13131a] px-3 py-1 text-xs text-gray-500">
          {data.totalEvaluations ?? 0} evaluations total
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Average Score"    value={data.avgScore.toFixed(2)} sub="Across all prompts"        accent="violet" icon="✦" />
        <KpiCard label="Total Evaluated"  value={String(data.totalEvaluations ?? 0)} sub="Prompts processed"  accent="sky"    icon="⊞" />
        <KpiCard label="Avg Improvement"  value={`+${(data.avgImprovement ?? 0).toFixed(1)}%`} sub="Quality gain after rewrite" accent="emerald" icon="↑" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-[#13131a] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Score Trend</h2>
            <span className="text-[10px] text-gray-600">7-day rolling</span>
          </div>
          {data.trendByDay.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-gray-600">No trend data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.trendByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#374151" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 1]} stroke="#374151" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip {...TT} formatter={(v) => [(v as number).toFixed(2), "Score"]} />
                <Line type="monotone" dataKey="avgScore" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3.5, fill: "#7c3aed", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#13131a] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Score by Domain</h2>
            <span className="text-[10px] text-gray-600">avg score</span>
          </div>
          {data.scoreByDomain.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-gray-600">No domain data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.scoreByDomain} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="domain" stroke="#374151" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 1]} stroke="#374151" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
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

      {/* Top failures */}
      <div className="rounded-xl border border-white/[0.06] bg-[#13131a] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Top Failure Patterns</h2>
        {data.topFailures.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <span className="text-emerald-400">✓</span>
            <span className="text-sm text-emerald-300">No failure patterns recorded yet — great quality!</span>
          </div>
        ) : (
          <div className="space-y-2">
            {data.topFailures.map((f, i) => (
              <div key={i} className="group flex items-center justify-between rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-white/[0.06] hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-[10px] font-bold text-red-400">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-300">{f.failureReason}</span>
                </div>
                <span className="ml-4 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400 ring-1 ring-red-500/20">
                  ×{f.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
