interface Props { content: string; }

const SECTION_COLORS: Record<string, { border: string; label: string; dot: string }> = {
  "system prompt":  { border: "border-violet-500/30", label: "text-violet-400",  dot: "bg-violet-500" },
  "context":        { border: "border-sky-500/30",    label: "text-sky-400",     dot: "bg-sky-500" },
  "instructions":   { border: "border-amber-500/30",  label: "text-amber-400",   dot: "bg-amber-500" },
  "example usage":  { border: "border-emerald-500/30",label: "text-emerald-400", dot: "bg-emerald-500" },
  "tags":           { border: "border-gray-500/30",   label: "text-gray-400",    dot: "bg-gray-500" },
};

function highlightPlaceholders(text: string) {
  const parts = text.split(/({{[^}]+}})/g);
  return parts.map((part, i) =>
    /^{{.+}}$/.test(part)
      ? <span key={i} className="rounded bg-orange-500/20 px-1 font-mono text-[11px] text-orange-300 ring-1 ring-orange-500/30">{part}</span>
      : <span key={i}>{part}</span>
  );
}

function renderLine(line: string, i: number) {
  if (/^# /.test(line)) {
    return <div key={i} className="mb-1"><p className="text-base font-bold text-white">{line.replace(/^# /, "")}</p></div>;
  }
  if (/^Channel:/i.test(line)) {
    const parts = line.split("|").map(s => s.trim());
    return (
      <div key={i} className="mb-4 flex flex-wrap gap-2">
        {parts.map((p, j) => (
          <span key={j} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-gray-400">{p}</span>
        ))}
      </div>
    );
  }
  if (/^## /.test(line)) {
    const title  = line.replace(/^## /, "").toLowerCase();
    const colors = SECTION_COLORS[title] ?? { border: "border-white/10", label: "text-gray-300", dot: "bg-gray-500" };
    return (
      <div key={i} className={`mt-5 mb-2 flex items-center gap-2 border-b pb-1.5 ${colors.border}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
        <span className={`text-xs font-bold uppercase tracking-widest ${colors.label}`}>{line.replace(/^## /, "")}</span>
      </div>
    );
  }
  if (/^\d+\.\s/.test(line)) {
    const [num, ...rest] = line.split(/\.\s(.+)/);
    const text = rest.join("");
    const boldified = text.replace(/\*\*([^*]+)\*\*/g, "|||BOLD|||$1|||/BOLD|||");
    const segments  = boldified.split(/(|||BOLD|||[^|]+|||\/BOLD\|||)/g);
    return (
      <div key={i} className="flex gap-2 py-0.5">
        <span className="flex-shrink-0 text-xs font-bold tabular-nums text-gray-600">{num}.</span>
        <span className="text-xs text-gray-300 leading-5">
          {segments.map((seg, j) => {
            if (seg.startsWith("|||BOLD|||")) {
              const inner = seg.replace(/\|\|\|BOLD\|\|\|/, "").replace(/\|\|\|\/BOLD\|\|\|/, "");
              return <strong key={j} className="font-semibold text-white">{highlightPlaceholders(inner)}</strong>;
            }
            return <span key={j}>{highlightPlaceholders(seg)}</span>;
          })}
        </span>
      </div>
    );
  }
  if (/^[-*]\s/.test(line) || /^  [-*]\s/.test(line)) {
    const indent = line.startsWith("  ") ? "ml-4" : "";
    return (
      <div key={i} className={`flex gap-2 py-0.5 ${indent}`}>
        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-600" />
        <span className="text-xs text-gray-300 leading-5">{highlightPlaceholders(line.replace(/^[-*]\s|^  [-*]\s/, ""))}</span>
      </div>
    );
  }
  if (/^[a-z][-a-z0-9 ]+$/.test(line.trim()) && !line.includes(":")) {
    return (
      <div key={i} className="mt-1 flex flex-wrap gap-1.5">
        {line.trim().split(/\s+/).map((tag, j) => (
          <span key={j} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[11px] text-gray-500">#{tag}</span>
        ))}
      </div>
    );
  }
  if (line.trim() === "") return <div key={i} className="h-1" />;
  return <p key={i} className="text-xs text-gray-300 leading-5 py-0.5">{highlightPlaceholders(line)}</p>;
}

export default function StructuredPromptViewer({ content }: Props) {
  const lines = content.split("\n");
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[var(--pg-card)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Structured Prompt</h2>
          <p className="mt-0.5 text-xs text-gray-500">Auto-formatted to the standard template</p>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(content)}
          className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-gray-400 hover:bg-white/[0.06] hover:text-gray-200 transition-colors"
        >
          Copy
        </button>
      </div>
      <div className="rounded-lg border border-white/[0.04] bg-[var(--pg-page)] p-5">
        {lines.map((line, i) => renderLine(line, i))}
      </div>
    </div>
  );
}
