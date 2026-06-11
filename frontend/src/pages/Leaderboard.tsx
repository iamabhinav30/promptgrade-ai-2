import { useEffect, useState } from "react";
import { getAnalytics } from "../api/client";
import type { AnalyticsResult } from "../types";

const MEDALS = ["🏆", "🥈", "🥉"];
const PODIUM = [
  { ring: "border-yellow-500/30",  bg: "bg-yellow-500/10",  text: "text-yellow-300",  score: "text-yellow-200" },
  { ring: "border-gray-500/25",    bg: "bg-white/[0.03]",   text: "text-gray-300",    score: "text-gray-200" },
  { ring: "border-orange-500/30",  bg: "bg-orange-500/10",  text: "text-orange-300",  score: "text-orange-200" },
];

export default function Leaderboard() {
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);

  useEffect(() => {
    getAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-violet-500/15">
            <div className="h-5 w-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-600">Loading leaderboard…</p>
        </div>
      </div>
    );
  }

  const top3 = analytics.governanceLeaderboard.slice(0, 3);
  const rest  = analytics.governanceLeaderboard.slice(3);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Leaderboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">Top performers ranked by average prompt quality score</p>
      </div>

      {/* Empty state */}
      {analytics.governanceLeaderboard.length === 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[#13131a] px-6 py-16 text-center">
          <p className="text-3xl mb-3">🏁</p>
          <p className="text-sm font-medium text-gray-400">No leaderboard data yet</p>
          <p className="mt-1 text-xs text-gray-600">Run evaluations to populate rankings</p>
        </div>
      )}

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {top3.map((row, i) => {
            const s = PODIUM[i];
            return (
              <div key={row.name} className={`flex flex-col items-center rounded-xl border ${s.ring} ${s.bg} p-6 text-center space-y-2`}>
                <span className="text-3xl">{MEDALS[i]}</span>
                <p className={`text-base font-bold ${s.text}`}>{row.name}</p>
                <p className={`text-3xl font-black tabular-nums ${s.score}`}>{row.avgScore.toFixed(2)}</p>
                <div className="w-full pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">Prompts</p>
                    <p className="text-sm font-semibold text-gray-300">{row.totalPrompts}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">Improvement</p>
                    <p className="text-sm font-semibold text-emerald-400">+{row.avgImprovement.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remaining participants */}
      {rest.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#13131a]">
          <div className="border-b border-white/[0.06] px-5 py-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Other Participants</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-600">#</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-600">Name</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-600">Avg Score</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-600">Prompts</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-600">Improvement</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((row) => (
                <tr key={row.name} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 text-sm font-bold tabular-nums text-gray-600">{row.rank}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-300">{row.name}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-block rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-bold tabular-nums text-violet-300 ring-1 ring-violet-500/20">
                      {row.avgScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-500">{row.totalPrompts}</td>
                  <td className="px-5 py-3.5 text-right text-xs font-semibold tabular-nums text-emerald-400">+{row.avgImprovement.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
