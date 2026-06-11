const CURRENT: { icon: string; title: string; desc: string; tags: string[] }[] = [
  {
    icon: "⚡",
    title: "6-Agent Evaluation Pipeline",
    desc: "Every prompt runs through Intake → Structure → Evaluate → Rewrite → Validate → Report. Auto-improves until it hits quality threshold or exhausts retries.",
    tags: ["LangGraph", "LLM", "Auto-rewrite"],
  },
  {
    icon: "⊞",
    title: "Standardised Template Enforcement",
    desc: "Prompts are transformed into a governance-ready markdown template with Channel, Scope, Topic, System Prompt, Context, Instructions, Example Usage, and Tags.",
    tags: ["Governance", "Template", "Structured output"],
  },
  {
    icon: "✦",
    title: "6-Dimension Quality Scoring",
    desc: "Each prompt is scored on Clarity, Completeness, Context, Constraints, Output Definition, and Production Readiness — tailored rubrics per engineering domain.",
    tags: ["Scoring", "Rubrics", "Domain-aware"],
  },
  {
    icon: "📂",
    title: "Batch File Evaluation",
    desc: "Upload multiple .md prompt files at once. Each is evaluated independently and results shown in a summary table — ideal for auditing a whole prompt library.",
    tags: ["Batch", "Markdown", "Audit"],
  },
  {
    icon: "↑",
    title: "Team Governance Leaderboard",
    desc: "Track prompt quality scores and improvement rates across the team. Promotes healthy competition and surfaces who is shipping the best AI interactions.",
    tags: ["Leaderboard", "Team", "Metrics"],
  },
  {
    icon: "→",
    title: "Before / After Diff Viewer",
    desc: "See exactly what the rewrite pipeline changed — words added, words removed, iteration-by-iteration score progression shown on a radar chart.",
    tags: ["Diff", "Transparency", "Radar chart"],
  },
];

type Status = "in-progress" | "planned" | "idea";

const ROADMAP: {
  icon: string;
  title: string;
  desc: string;
  status: Status;
  tags: string[];
}[] = [
  {
    icon: "🧩",
    title: "VS Code Extension",
    desc: "Evaluate prompts inline as you write them. A sidebar shows the live quality score, dimension breakdown, and one-click rewrite — without leaving the editor. Zero context switching for developers.",
    status: "in-progress",
    tags: ["VS Code", "Real-time", "Extension"],
  },
  {
    icon: "🔗",
    title: "Bitbucket MCP Integration",
    desc: "Connect PromptGrade to Bitbucket via Model Context Protocol. Auto-evaluate prompt files in pull requests, post inline comments with quality scores, and block merges below the threshold — like a Sonar quality gate for prompts.",
    status: "planned",
    tags: ["Bitbucket", "MCP", "PR comments", "Quality gate"],
  },
  {
    icon: "🐙",
    title: "GitHub MCP Integration",
    desc: "Same governance workflow for GitHub repos. A GitHub Action triggers the pipeline on any .md file change, posts scores as PR checks, and fails the build if quality drops.",
    status: "planned",
    tags: ["GitHub", "MCP", "CI/CD", "Actions"],
  },
  {
    icon: "🔧",
    title: "JetBrains Plugin",
    desc: "Real-time prompt evaluation inside IntelliJ IDEA, WebStorm, and PyCharm. Developers on Java/Kotlin/Python stacks get the same in-editor experience as VS Code users.",
    status: "planned",
    tags: ["JetBrains", "IntelliJ", "Plugin"],
  },
  {
    icon: "📚",
    title: "Org Prompt Library",
    desc: "A shared, searchable repository of approved high-scoring prompts. Teams can browse, fork, and build on prompts that already meet governance standards — reducing duplicated work.",
    status: "planned",
    tags: ["Library", "Reuse", "Discovery"],
  },
  {
    icon: "🚦",
    title: "CI/CD Quality Gates",
    desc: "Enforce minimum prompt quality scores in your pipeline. A pipeline stage evaluates every prompt file commit — if the score drops below the configured threshold, the build fails with a detailed report.",
    status: "planned",
    tags: ["CI/CD", "Quality gate", "Pipeline"],
  },
  {
    icon: "🤖",
    title: "Multi-LLM Provider Support",
    desc: "Evaluate prompts against Claude, Gemini, Llama, and Mistral — not just OpenAI models. Scores reflect performance across the LLMs your org actually uses in production.",
    status: "idea",
    tags: ["Claude", "Gemini", "Llama", "Multi-model"],
  },
  {
    icon: "📊",
    title: "Per-Developer Analytics",
    desc: "Break down quality metrics by developer, team, and squad. Track improvement over time, surface coaching opportunities, and celebrate teams consistently shipping excellent prompts.",
    status: "idea",
    tags: ["Analytics", "Developer", "Trends"],
  },
  {
    icon: "🔔",
    title: "Slack / Teams Notifications",
    desc: "Get notified when a prompt score drops below a threshold, when a batch evaluation completes, or when a team member achieves a new high score — keeping everyone informed without checking the dashboard.",
    status: "idea",
    tags: ["Slack", "Teams", "Notifications"],
  },
  {
    icon: "📝",
    title: "Custom Rubric Definitions",
    desc: "Teams can define their own scoring dimensions on top of the standard 6. A mobile team might add an 'accessibility' dimension; a security team might add an 'injection risk' check.",
    status: "idea",
    tags: ["Custom rubrics", "Extensible", "Domain"],
  },
];

const STATUS_STYLES: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  "in-progress": { label: "In Progress", bg: "bg-violet-500/15", text: "text-violet-300", dot: "bg-violet-400" },
  "planned":     { label: "Planned",     bg: "bg-sky-500/15",    text: "text-sky-300",    dot: "bg-sky-400" },
  "idea":        { label: "On Roadmap",  bg: "bg-gray-500/15",   text: "text-gray-400",   dot: "bg-gray-500" },
};

export default function Plans() {
  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-300">Product Roadmap</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Where PromptGrade is going</h1>
        <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
          Every engineer in the organisation has full access to all current features.
          Below is what's live today and the integrations planned to make prompt governance
          a seamless part of your existing development workflow.
        </p>
      </div>

      {/* What's live today */}
      <div>
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-base font-semibold text-white">Live Today</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available to everyone
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CURRENT.map((item) => (
            <div key={item.title} className="rounded-xl border border-white/[0.06] bg-[#13131a] p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20 text-base">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-5">{item.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                {item.tags.map(t => (
                  <span key={t} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-gray-500">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div>
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <h2 className="text-base font-semibold text-white">Coming Next</h2>
          <div className="flex flex-wrap gap-2">
            {(["in-progress", "planned", "idea"] as Status[]).map(s => {
              const st = STATUS_STYLES[s];
              return (
                <span key={s} className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${st.bg} ${st.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                  {st.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ROADMAP.map((item) => {
            const st = STATUS_STYLES[item.status];
            return (
              <div key={item.title} className="rounded-xl border border-white/[0.06] bg-[#13131a] p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06] text-base">
                      {item.icon}
                    </div>
                    <p className="text-sm font-semibold text-white leading-snug pt-1">{item.title}</p>
                  </div>
                  <span className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${st.bg} ${st.text}`}>
                    <span className={`h-1 w-1 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-5">{item.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                  {item.tags.map(t => (
                    <span key={t} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-gray-500">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vision strip */}
      <div className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-[#13131a] to-[#13131a] p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">The Vision</p>
          <p className="text-lg font-semibold text-white leading-relaxed">
            Prompt quality should be as automatic as code quality.
          </p>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            Just as SonarQube runs silently in every PR and CI job, PromptGrade will eventually
            sit in every editor, every commit hook, and every pipeline stage — ensuring that no
            low-quality AI prompt ever reaches production. The goal: make excellent prompt engineering
            the path of least resistance for every developer in the org.
          </p>
        </div>
      </div>

    </div>
  );
}
