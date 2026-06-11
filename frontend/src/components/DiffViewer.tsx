function highlight(text: string, words: string[], cls: string) {
  const set = new Set(words.map((w) => w.toLowerCase()));
  return text.split(/(\s+)/).map((token, i) => {
    const norm = token.toLowerCase().replace(/[^a-z0-9]/g, "");
    return set.has(norm)
      ? <mark key={i} className={cls}>{token}</mark>
      : <span key={i}>{token}</span>;
  });
}

export default function DiffViewer({
  originalPrompt, finalPrompt, added, removed, improvementPct,
}: {
  originalPrompt: string; finalPrompt: string; added: string[]; removed: string[]; improvementPct?: number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#13131a] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Before / After</h2>
          <p className="mt-0.5 text-xs text-gray-600">Highlighted words show key changes</p>
        </div>
        {improvementPct != null && (
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            +{improvementPct.toFixed(1)}% improvement
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <p className="text-xs font-semibold text-red-400">Original</p>
          </div>
          <div className="min-h-40 rounded-lg border border-white/[0.04] bg-[#0d0d12] p-4 font-mono text-xs leading-6 text-gray-300 whitespace-pre-wrap overflow-auto">
            {highlight(originalPrompt, removed, "rounded bg-red-500/20 text-red-300 px-0.5 not-italic")}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-xs font-semibold text-emerald-400">Improved</p>
          </div>
          <div className="min-h-40 rounded-lg border border-white/[0.04] bg-[#0d0d12] p-4 font-mono text-xs leading-6 text-gray-300 whitespace-pre-wrap overflow-auto">
            {highlight(finalPrompt, added, "rounded bg-emerald-500/20 text-emerald-300 px-0.5 not-italic")}
          </div>
        </div>
      </div>

      {(removed.length > 0 || added.length > 0) && (
        <div className="flex flex-wrap gap-4 border-t border-white/[0.04] pt-4 text-xs text-gray-600">
          {removed.length > 0 && (
            <span><span className="font-semibold text-red-400">−{removed.length}</span> words removed</span>
          )}
          {added.length > 0 && (
            <span><span className="font-semibold text-emerald-400">+{added.length}</span> words added</span>
          )}
        </div>
      )}
    </div>
  );
}
