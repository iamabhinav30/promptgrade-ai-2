import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAnalytics } from "../api/client";
import type { AnalyticsResult } from "../types";

export default function Home() {
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);

  useEffect(() => {
    getAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  if (!analytics) return <div className="p-8 text-slate-600">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-slate-950 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">AI Prompt Governance</p>
        <h1 className="mt-3 text-4xl font-extrabold">PromptGrade AI</h1>
        <p className="mt-3 max-w-2xl text-indigo-100">SonarQube for prompts: evaluate quality, rewrite weak prompts, and track governance performance across teams.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Average Score</div><div className="text-3xl font-bold text-indigo-700">{analytics.avgScore.toFixed(2)}</div></div>
        <div className="rounded-2xl bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Total Evaluations</div><div className="text-3xl font-bold text-slate-900">{analytics.totalEvaluations ?? 0}</div></div>
        <div className="rounded-2xl bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Avg Improvement</div><div className="text-3xl font-bold text-emerald-700">{(analytics.avgImprovement ?? 0).toFixed(2)}%</div></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Score Trend</h2>
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.trendByDay}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis domain={[0, 1]} /><Tooltip /><Line type="monotone" dataKey="avgScore" stroke="#4f46e5" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Avg Score by Domain</h2>
          <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.scoreByDomain}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="domain" /><YAxis domain={[0, 1]} /><Tooltip /><Bar dataKey="avgScore" fill="#6366f1" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Top Failures</h2>
        <ul className="space-y-3">
          {analytics.topFailures.map((failure) => (
            <li key={failure.failureReason} className="flex justify-between rounded-xl bg-slate-50 p-3 text-sm">
              <span>{failure.failureReason}</span><span className="font-bold">{failure.count}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
