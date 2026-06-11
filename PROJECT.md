 # PromptGrade AI — Project Reference

> **One-liner:** SonarQube for AI prompts — a 6-agent LangGraph pipeline that evaluates, structures, and automatically improves every AI prompt your engineering team ships.

---

## Table of Contents

1. [The Problem](#the-problem)
2. [The Solution](#the-solution)
3. [Why It Matters (Impact)](#why-it-matters)
4. [Architecture Overview](#architecture-overview)
5. [The 6-Agent Pipeline](#the-6-agent-pipeline)
6. [Pages — What & Why](#pages--what--why)
7. [Key Differentiators](#key-differentiators)
8. [Technical Stack Decisions](#technical-stack-decisions)
9. [Roadmap Rationale](#roadmap-rationale)
10. [Common Judge Questions & Answers](#common-judge-questions--answers)

---

## The Problem

Engineering teams are writing AI prompts the same way they wrote code before version control — individually, inconsistently, and with no quality bar.

**Consequences:**
- Two developers writing prompts for the same feature produce wildly different quality outputs
- No one knows *why* a prompt is underperforming — it just produces bad results
- Prompts are stored as random strings in code, Notion docs, Slack messages — never governed
- There is no "PR review" for prompts; bad ones reach production silently
- When a prompt fails in production, there is no diff, no history, no rollback path

**The gap:** Tools like PromptLayer and LangSmith tell you a prompt performed poorly *after the fact*. Nothing actively improves it or enforces a quality standard *before* it ships.

---

## The Solution

PromptGrade AI is an internal platform that treats prompt quality the same way SonarQube treats code quality:

1. **Evaluate** — Score every prompt on 6 engineering-specific dimensions
2. **Structure** — Transform it into a standard governance template (Channel / Scope / Topic / System Prompt / Context / Instructions / Example Usage / Tags)
3. **Rewrite** — Automatically improve the prompt until it meets the quality threshold
4. **Govern** — Track quality history, surface failure patterns, maintain a team leaderboard

Every engineer in the organisation has full access. No pricing tiers — it is a shared internal tool.

---

## Why It Matters

### For developers
- Write a rough prompt → get back a production-ready, structured, improved version in under 60 seconds
- Understand *why* it scored low (which of the 6 dimensions failed and why)
- See exactly what changed between original and improved (diff viewer)

### For the organisation
- Consistent prompt quality across every team, every domain
- A shared standard template means prompts are reusable and searchable
- Governance leaderboard drives quality improvement through healthy competition
- Failure patterns surfaced across all prompts → systemic coaching opportunities

### Scale context
- 6 engineering domains covered: Frontend, Backend, DevOps, Testing, Database, System Design
- Each domain has its own evaluation rubric — a DevOps prompt is judged differently from a Frontend prompt
- Supports single prompts, .md files, and batch evaluation of entire prompt libraries

---

## Architecture Overview

```
Browser (React + Vite)
        │
        │  POST /api/evaluate/stream  (SSE — real-time events)
        │  POST /api/evaluate/upload/stream
        │  POST /api/evaluate/batch (sequential, per-file)
        ▼
FastAPI  (Python)
        │
        │  asyncio.to_thread()
        ▼
LangGraph Pipeline  ──────────────────────────────────────────
  intake → structure → evaluate ──► rewrite (loop ≤3×) ──► validate → report
──────────────────────────────────────────────────────────────
        │
        ▼
SQLite  (evaluations, dimension_scores, governance_scores)
```

**Real-time streaming:** Each agent fires progress events through a `threading.Queue` (sync) bridged to an async SSE generator. The browser receives `{ agent, status, score?, iteration? }` events live as each step completes — judges watch the pipeline execute in real time.

---

## The 6-Agent Pipeline

### 1 · Intake
**What:** Validates domain, prompt length, and initialises state.  
**Why it exists:** Acts as a guard — rejects garbage before spending LLM tokens. Sets up the shared `GraphState` that all downstream agents read and write.

### 2 · Structure
**What:** Calls an LLM to reformat any raw prompt into the standard markdown template.  
**Why it exists:** This is the governance agent. Raw prompts come in all shapes — "write a button component", a 500-word paragraph, a half-finished idea. The Structure agent normalises everything into:
```
# Title
Channel: Web | Scope: Specific | Topic: React
## System Prompt
## Context        ← {{placeholders}} for configurable values
## Instructions   ← numbered, bold key concepts
## Example Usage
## Tags
```
Downstream agents (evaluate, rewrite) work on the structured version, not the original — so improvement is always measured on an apples-to-apples basis.

**Channel taxonomy:** Web = frontend UI, Mobile = Android/iOS/RN/Flutter, Services = APIs/DB/backend/infra, SDLC = CI/CD/PR/testing/security/docs

### 3 · Evaluate
**What:** Scores the current prompt on 6 dimensions using a domain-specific rubric.  
**Why it exists:** This is the quality sensor. Without a score, there is nothing to improve toward. The 6 dimensions are:

| Dimension | What it checks |
|---|---|
| **Clarity** | Is the intent unambiguous? |
| **Completeness** | Are all necessary elements present? |
| **Context** | Is enough background provided for the LLM to respond correctly? |
| **Constraints** | Are format, length, and output constraints specified? |
| **Output Definition** | Is the expected output structure clearly defined? |
| **Production Readiness** | Is this safe, specific, and deployable? |

Each domain has additional rubric questions on top of these. A `devops` prompt is also checked for idempotency and rollback safety. A `database` prompt is checked for schema migration safety.

**Scoring:** 0.0 (worst) → 1.0 (best). Threshold for "good enough" is 0.8. Below that, the pipeline routes to Rewrite.

### 4 · Rewrite
**What:** Takes the current prompt, the failure reasons, and the recommendations from Evaluate, and produces an improved version.  
**Why it exists:** The human insight — knowing *what* to improve — is encoded in the Evaluate output. Rewrite acts on that signal automatically. It is called in a loop: evaluate → if score < 0.8 → rewrite → evaluate again. Maximum 3 iterations to prevent infinite loops.

**Key rule:** If the prompt is already in the standard template format, Rewrite preserves the structure and only improves content within each section.

### 5 · Validate
**What:** Picks the highest-scoring iteration from the loop, calculates final improvement %, builds the word diff.  
**Why it exists:** The Rewrite loop might produce 3 versions. Validate acts as the "best of N" selector — it doesn't take the last version, it takes the *best* version. Also caps improvement % at 100 to keep metrics meaningful.

### 6 · Report
**What:** Persists the evaluation to SQLite, updates the team governance leaderboard.  
**Why it exists:** Turns a one-off evaluation into an organisational asset. Every evaluation is stored with its score trajectory, dimensions, diff, and domain — enabling the Dashboard trends, History audit trail, and Leaderboard.

---

## Pages — What & Why

### Dashboard (`/`)
**What:** Hero banner, pipeline explainer, 3 KPI cards, Score Trend line chart, Score by Domain bar chart, Top Failure Patterns.

**Why it exists:**  
The Dashboard is the first thing a manager or team lead opens. It answers two questions in 5 seconds:
- "How good are our prompts overall?" → Average Score KPI
- "Are we getting better?" → Score Trend chart
- "What keeps going wrong?" → Top Failure Patterns

The **Pipeline explainer** (6-step card grid) is there so anyone who opens the tool for the first time understands what it does before they navigate to Evaluate. No onboarding email needed.

The **hero banner** states the value proposition plainly: "SonarQube for AI Prompts" with the 4 feature tags — so a judge or new team member gets it immediately.

**Data is live** — all charts pull from real evaluations. Empty state shows the pipeline explainer and a CTA to evaluate first prompt.

---

### Evaluate (`/evaluate`)
**What:** Three-tab input (Paste Prompt / Upload .md / Batch Files), domain selector, real-time pipeline progress, results with score gauges + structured prompt viewer + score card + radar chart + diff viewer.

**Why it exists:**  
This is the core product interaction. A developer comes here to get a prompt improved.

**Why 3 tabs:**
- **Paste Prompt** — for prompts being written inline, fastest path
- **Upload .md** — for prompts already living in a file in the repo (engineers store prompts as markdown)
- **Batch Files** — for auditing an entire existing prompt library at once; select 10+ files and get scores for all of them in one pass

**Why real-time pipeline progress:**  
The evaluation takes 30–60 seconds (6 LLM calls). Without streaming, this looks like the app is broken. With streaming, the developer watches each agent complete — it demonstrates the pipeline is actually working and builds confidence in the result.

**Why show Structured Prompt before the score card:**  
Because the structured output is the primary deliverable. The score tells you *how good* it is; the structured prompt is *what you actually ship*. Showing it first reinforces that the tool's job is improvement, not just judgement.

**Why the Radar Chart:**  
A radar chart across 6 dimensions lets the developer see *which specific dimensions* dropped from original to improved (or stayed) — much more actionable than a single number.

---

### History (`/history`)
**What:** Paginated table of all past evaluations with domain, before/after scores, improvement %, iteration count. Click any row to open a detailed modal with ScoreCard + DiffViewer.

**Why it exists:**  
**Audit trail and learning.** Three use cases:
1. "I evaluated a prompt last week, where is it?" — findability
2. "Which domains are consistently scoring low for our team?" — pattern recognition (use domain filter)
3. "What changed between my original and the final version?" — the modal shows the full diff

Without History, every evaluation is ephemeral — you run it, use it, forget it. History turns the tool from a one-shot utility into an organisational memory.

---

### Leaderboard (`/leaderboard`)
**What:** Top-3 podium with medals, remaining participants in a table, sorted by average quality score with improvement % shown.

**Why it exists:**  
**Behaviour change through visibility.** The Leaderboard does something the other pages don't — it makes prompt quality a *social* metric. When developers can see that a colleague's prompts consistently score 0.92 while theirs average 0.71, it creates pull toward improvement without any mandate from management.

In practice, this is the governance mechanism. The organisation doesn't need a policy that says "prompts must score above 0.8" — the Leaderboard makes that the obvious goal.

---

### Roadmap (`/roadmap`)
**What:** "Live Today" grid showing all 6 current capabilities (everyone has full access), "Coming Next" grid with 10 planned integrations across 3 statuses (In Progress / Planned / On Roadmap), Vision strip.

**Why it exists:**  
**Two audiences:**

1. **Engineers using the tool** — they need to know what's coming so they can plan integrations (e.g., "when will the VS Code extension be ready so I can move my team off switching to the browser?")

2. **Stakeholders / leadership** — they need to see that this is a platform with a roadmap, not a one-off hackathon project. The CI/CD quality gates, Bitbucket MCP, and org prompt library show this has a real path to becoming embedded in the development lifecycle.

**Why no pricing:**  
This is an internal organisational tool. Every engineer has full access. There are no tiers. The Roadmap page replaces the traditional "pricing" page precisely because the commercial model is irrelevant — what matters is the feature timeline.

---

## Key Differentiators

| PromptGrade | PromptLayer / LangSmith |
|---|---|
| Actively **rewrites and improves** prompts | Monitors and observes existing prompts |
| **Enforces a governance template** — structured output | Logs raw prompts as-is |
| **Domain-aware rubrics** — DevOps ≠ Frontend evaluation | Generic quality metrics |
| **Batch evaluation** — audit entire libraries at once | Per-request logging |
| **Governance leaderboard** — team-level quality tracking | Individual usage analytics |
| **Real-time streaming** — watch the pipeline execute | Request/response logging |

**The core difference:** PromptLayer tells you your prompt is bad after it runs in production. PromptGrade makes the prompt better before it ever runs.

---

## Technical Stack Decisions

### LangGraph (not a simple LLM chain)
**Why:** The evaluate → rewrite → evaluate loop is a graph, not a sequence. LangGraph's conditional edges handle "if score < 0.8 → rewrite, else → validate" cleanly. A simple chain can't branch. Using LangGraph also demonstrates architectural thinking — the pipeline is modular; adding a new agent (e.g., a security check) is just adding a node.

### FastAPI + SSE (not WebSockets)
**Why:** Server-Sent Events are unidirectional (server → client) and fire-and-forget, which matches exactly what the pipeline does — it sends progress events and a final result. SSE is simpler than WebSockets, works over HTTP/1.1, and doesn't require handshake management.

### Threading bridge for SSE
**Why:** LangGraph nodes run synchronously in a thread (`asyncio.to_thread`). They can't call `async` functions directly. A `threading.Queue` (sync, thread-safe) is written to by agents and polled by the async SSE generator — clean separation between the sync graph world and the async FastAPI world.

### SQLite (not Postgres)
**Why:** Internal tool, single-node deployment, zero infrastructure setup. Swappable to Postgres by changing the connection string when the org needs multi-node. For a hackathon and initial org rollout, SQLite is the right call — no ops overhead.

### React + Tailwind (not a component library)
**Why:** Custom dark theme with `bg-[#0d0d12]` cards and violet accent — a component library like MUI would fight the design. Tailwind utility classes give full control. The design system is consistent: all cards share `rounded-xl border border-white/[0.06] bg-[#13131a]`, all active states use `bg-violet-600/20 ring-violet-500/30`.

### Fetch API for streaming (not EventSource)
**Why:** `EventSource` only supports GET requests. The evaluate endpoint is POST (it sends a request body with the prompt). The Fetch API with `response.body.getReader()` reads the SSE stream from a POST response — standard browser API, no library needed.

---

## Roadmap Rationale

### VS Code Extension (In Progress)
The context switch from editor → browser → copy result → back to editor adds friction. If evaluation happens inline as the developer types the prompt, adoption increases dramatically. This is the "IDE plugin" moment for prompt tooling.

### Bitbucket / GitHub MCP Integration (Planned)
Connects the tool to where the code actually lives. When a developer commits a `.md` prompt file, the MCP integration automatically evaluates it and posts the score as a PR comment — same pattern as SonarQube's PR decoration. Quality gates can block merges below threshold.

This is the moment PromptGrade stops being a tool you have to remember to use and becomes part of the automatic development workflow.

### CI/CD Quality Gates (Planned)
Like `eslint --max-warnings 0` but for prompts. A pipeline stage that fails the build if any prompt file drops below the configured score. Zero-configuration governance.

### Org Prompt Library (Planned)
Once prompts are evaluated and structured, they should be reusable. The library is a searchable repository of approved prompts — browse by domain, topic, score. Fork any prompt as a starting point. This turns PromptGrade from an evaluation tool into an organisational knowledge base.

### Multi-LLM Support (On Roadmap)
Organisations use Claude for some workflows, Gemini for others, local Llama for sensitive data. A prompt that scores 0.9 on GPT-4o might score 0.6 on Llama-3. Multi-LLM evaluation gives a cross-model quality signal.

---

## Common Judge Questions & Answers

**Q: How is this different from just asking ChatGPT to improve my prompt?**  
A: Three things ChatGPT can't do: (1) score against a domain-specific rubric so you know *why* it's bad, (2) enforce a standard governance template your whole org uses, (3) maintain history, leaderboards, and failure pattern analytics across your entire team. It's the difference between "get one person's opinion" and "run the test suite."

**Q: Who uses this inside the organisation?**  
A: Any engineer who writes prompts for AI features — which, increasingly, is everyone. Frontend devs writing UI copy generation prompts, backend devs writing data extraction prompts, DevOps writing infrastructure automation prompts. The 6 domain-specific rubrics mean each team gets evaluation criteria relevant to their work.

**Q: What happens if the LLM rewrites the prompt badly?**  
A: The Validate agent picks the *highest-scoring* iteration, not the last one. If the rewrite somehow scores lower than the original, the original is returned. The pipeline never degrades a prompt — it can only improve it or return the original unchanged.

**Q: How do you handle sensitive or proprietary prompts?**  
A: The tool runs fully on-premise. The only external call is to the configured LLM provider (OpenAI-compatible endpoint). The prompts themselves are stored in SQLite on the organisation's own infrastructure. The Enterprise roadmap item includes on-premise LLM support (Llama) to keep everything inside the network.

**Q: What's the scoring threshold and why 0.8?**  
A: 0.8 was chosen empirically — it represents a prompt that has no critical failures across any dimension. At 0.8+, clarity, completeness, context, constraints, output definition, and production readiness are all at a level where the LLM will produce consistent, useful results. The threshold is configurable in the environment config.

**Q: Why build this as an internal tool and not a SaaS?**  
A: SaaS adds privacy risk (customer prompts contain business logic), sales overhead, and infrastructure cost before there's product-market fit. Starting internal proves the value, builds adoption, and produces real usage data. The roadmap (VS Code extension, Bitbucket MCP, CI/CD gates) is the natural expansion path — once those are built, the SaaS question re-opens with a proven, battle-tested product.

**Q: The improvement % — how is it calculated?**  
A: `((final_score - original_score) / original_score) * 100`, capped at 100%. A prompt going from 0.4 to 0.8 = 100% improvement. Capped because relative percentage gain on a 0–1 scale can mathematically exceed 100% for very low starting scores, which would be misleading. The cap keeps the metric honest.

**Q: What does the Structure agent actually do?**  
A: It's a prompt architect. It takes any raw prompt — could be one sentence, could be a paragraph — and reformats it into the standard template with `# Title`, `Channel / Scope / Topic` metadata, `## System Prompt`, `## Context` (with `{{placeholder}}` syntax for configurable values), `## Instructions` (numbered, bold key concepts), `## Example Usage`, and `## Tags`. Every prompt that leaves PromptGrade looks the same structurally — which is what makes them governable.
