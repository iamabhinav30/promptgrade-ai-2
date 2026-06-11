interface ScoreGaugeProps { score: number; label: string; }

function scoreColor(s: number) {
  if (s < 0.5) return { stroke: "#ef4444", text: "text-red-400",    badge: "bg-red-500/15 text-red-300 ring-1 ring-red-500/25",         status: "Needs Work" };
  if (s < 0.8) return { stroke: "#f59e0b", text: "text-amber-400",  badge: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25",   status: "Improving"  };
  return       { stroke: "#10b981", text: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25",   status: "Excellent"  };
}

export default function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const { stroke, text, status, badge } = scoreColor(score);
  const pct   = Math.max(0, Math.min(score, 1));
  const total = 220;
  const dash  = pct * total;

  return (
    <div className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-[#13131a] px-6 py-7">
      <div className="relative h-28 w-52">
        <svg viewBox="0 0 260 145" className="w-full h-full overflow-visible">
          <path d="M30 130 A100 100 0 0 1 230 130" fill="none" strokeWidth={14} stroke="#1a1a24" strokeLinecap="round" />
          <path
            d="M30 130 A100 100 0 0 1 230 130"
            fill="none"
            strokeWidth={14}
            stroke={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${total}`}
            style={{
              transition: "stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)",
              filter: `drop-shadow(0 0 8px ${stroke}66)`,
            }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className={`text-4xl font-bold tabular-nums ${text}`}>{score.toFixed(2)}</span>
        </div>
      </div>
      <span className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>{status}</span>
      <span className="mt-2 text-[11px] font-medium uppercase tracking-widest text-gray-600">{label}</span>
    </div>
  );
}
