import type { AgentProgressEvent } from "../types";

const STEPS = [
  { key: "intake",    label: "Intake",    desc: "Validating" },
  { key: "structure", label: "Structure", desc: "Formatting" },
  { key: "evaluate",  label: "Evaluate",  desc: "Scoring" },
  { key: "rewrite",   label: "Rewrite",   desc: "Improving" },
  { key: "validate",  label: "Validate",  desc: "Checking" },
  { key: "report",    label: "Report",    desc: "Saving" },
];

function getStatus(key: string, events: AgentProgressEvent[]): "pending" | "running" | "complete" {
  const m = events.filter((e) => e.agent === key);
  if (m.some((e) => e.status === "complete")) return "complete";
  if (m.some((e) => e.status === "running"))  return "running";
  return "pending";
}

export default function AgentProgress({ events, isLoading }: { events: AgentProgressEvent[]; isLoading: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[var(--pg-card)] p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Pipeline Running</p>
        {isLoading && (
          <span className="flex items-center gap-1.5 text-xs text-violet-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Processing…
          </span>
        )}
      </div>
      <div className="flex items-start">
        {STEPS.map((step, idx) => {
          const status     = getStatus(step.key, events);
          const isLast     = idx === STEPS.length - 1;
          const ev         = events.find((e) => e.agent === step.key && e.status === "complete");
          const nextStatus = idx < STEPS.length - 1 ? getStatus(STEPS[idx + 1].key, events) : "pending";

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {idx > 0 && (
                  <div className={`h-px flex-1 transition-colors duration-500 ${status !== "pending" ? "bg-violet-600" : "bg-white/[0.06]"}`} />
                )}
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  status === "complete" ? "bg-violet-600 shadow-md shadow-violet-900/50"
                  : status === "running"  ? "border border-violet-500/50 bg-violet-500/10"
                  : "border border-white/[0.08] bg-white/[0.02]"
                }`}>
                  {status === "complete" ? (
                    <svg className="h-3.5 w-3.5 !text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : status === "running" ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-violet-400 border-t-transparent" />
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-700">{idx + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div className={`h-px flex-1 transition-colors duration-500 ${nextStatus !== "pending" ? "bg-violet-600" : "bg-white/[0.06]"}`} />
                )}
              </div>
              <div className="mt-2.5 text-center">
                <p className={`text-xs font-semibold ${
                  status === "complete" ? "text-violet-400"
                  : status === "running"  ? "text-white"
                  : "text-gray-600"
                }`}>{step.label}</p>
                {status === "running" && <p className="text-[10px] text-gray-600 mt-0.5">{step.desc}</p>}
                {ev?.score != null && <p className="text-[10px] font-bold text-violet-400 mt-0.5 tabular-nums">{ev.score.toFixed(2)}</p>}
                {ev?.improvementPct != null && <p className="text-[10px] font-bold text-emerald-400 mt-0.5 tabular-nums">+{ev.improvementPct.toFixed(1)}%</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
