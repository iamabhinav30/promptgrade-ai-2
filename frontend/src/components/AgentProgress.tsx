import type { AgentProgressEvent } from "../types";

interface AgentProgressProps {
  events: AgentProgressEvent[];
  isLoading: boolean;
}

const steps = ["intake", "evaluate", "rewrite", "validate", "report"];

function statusFor(step: string, events: AgentProgressEvent[], isLoading: boolean) {
  const event = [...events].reverse().find((item) => item.agent.toLowerCase() === step);
  if (event) return event.status;
  if (isLoading && step === "intake" && events.length === 0) return "running";
  return "pending";
}

export default function AgentProgress({ events, isLoading }: AgentProgressProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">Agent Progress</h2>
      <div className="space-y-4">
        {steps.map((step) => {
          const status = statusFor(step, events, isLoading);
          const latest = [...events].reverse().find((item) => item.agent.toLowerCase() === step);
          return (
            <div key={step} className="flex items-center gap-3">
              {status === "complete" ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
              ) : status === "running" ? (
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              ) : (
                <span className="h-7 w-7 rounded-full bg-slate-200" />
              )}
              <div className="flex-1">
                <div className="font-semibold capitalize text-slate-800">{step}</div>
                <div className="text-sm text-slate-500">
                  {status}
                  {typeof latest?.score === "number" ? ` · score ${latest.score.toFixed(2)}` : ""}
                  {typeof latest?.iteration === "number" ? ` · iteration ${latest.iteration}` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
