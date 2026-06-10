import { useEffect, useState } from "react";
import { getAnalytics } from "../api/client";
import type { AnalyticsResult } from "../types";

function medal(rank: number) {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
}

function rowClass(rank: number) {
  if (rank === 1) return "bg-yellow-50";
  if (rank === 2) return "bg-slate-100";
  if (rank === 3) return "bg-orange-50";
  return "bg-white";
}

export default function Leaderboard() {
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  useEffect(() => { getAnalytics().then(setAnalytics).catch(console.error); }, []);
  if (!analytics) return <div className="p-8">Loading leaderboard...</div>;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Governance Leaderboard</h1>
      <table className="w-full text-left text-sm">
        <thead className="text-slate-500"><tr><th className="p-3">Rank</th><th>Name</th><th>Prompts</th><th>Avg Score</th><th>Avg Improvement</th></tr></thead>
        <tbody>
          {analytics.governanceLeaderboard.map((row) => (
            <tr key={row.name} className={`border-t border-slate-100 ${rowClass(row.rank)}`}>
              <td className="p-3 text-lg font-bold">{medal(row.rank)}</td><td className="font-semibold">{row.name}</td><td>{row.totalPrompts}</td><td>{row.avgScore.toFixed(2)}</td><td>{row.avgImprovement.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
