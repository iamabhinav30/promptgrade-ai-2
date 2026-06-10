interface DiffViewerProps {
  originalPrompt: string;
  finalPrompt: string;
  added: string[];
  removed: string[];
  improvementPct?: number;
}

function highlightWords(text: string, words: string[], className: string) {
  const lookup = new Set(words.map((word) => word.toLowerCase()));
  return text.split(/(\s+)/).map((token, index) => {
    const normalized = token.toLowerCase().replace(/[^a-z0-9_+-]/g, "");
    if (lookup.has(normalized)) {
      return <mark key={`${token}-${index}`} className={className}>{token}</mark>;
    }
    return <span key={`${token}-${index}`}>{token}</span>;
  });
}

export default function DiffViewer({ originalPrompt, finalPrompt, added, removed, improvementPct }: DiffViewerProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Before / After Diff</h2>
        {typeof improvementPct === "number" && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            +{improvementPct.toFixed(2)}%
          </span>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-red-50 p-4">
          <h3 className="mb-2 font-semibold text-red-700">Original Prompt</h3>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
            {highlightWords(originalPrompt, removed, "rounded bg-red-200 px-1 text-red-900")}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4">
          <h3 className="mb-2 font-semibold text-emerald-700">Final Prompt</h3>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
            {highlightWords(finalPrompt, added, "rounded bg-emerald-200 px-1 text-emerald-900")}
          </p>
        </div>
      </div>
    </section>
  );
}
