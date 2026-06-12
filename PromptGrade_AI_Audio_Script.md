# PromptGrade AI — 10-Minute Audio Script
## Hackathon Preparation · Speak naturally, pause at [PAUSE] markers

---

> READING SPEED GUIDE:
> This script is designed for natural speaking pace — 130 words per minute.
> Total words: ~1,300. Estimated time: 10 minutes.
> [PAUSE] = 2 second pause. [BREATH] = 1 second pause.

---

## PART 1 — THE OPENING (1 minute)

---

Hello. My name is Abhinav, and today I want to walk you
through PromptGrade AI — a project I built for this
hackathon that I believe solves one of the most overlooked
problems in enterprise AI adoption.

[PAUSE]

Here is a question for you.

[BREATH]

Your organization is using AI. Your engineers are writing
prompts every single day — prompts that power your
chatbots, your code generators, your internal tools.

[BREATH]

But here is what I want to ask you.

[PAUSE]

Who is governing those prompts?

[PAUSE]

Who is checking their quality before they hit production?
Who is measuring whether they are getting better or worse
over time? Who is enforcing standards across your teams?

[PAUSE]

The answer, in almost every organization today, is nobody.

[BREATH]

Prompts are the most critical input to your AI systems —
and they are completely unmanaged.

[PAUSE]

That is the problem PromptGrade AI solves.

---

## PART 2 — THE PROBLEM (1.5 minutes)

---

Let me paint a picture of what is actually happening inside
engineering teams right now.

[PAUSE]

A developer needs an AI feature. They write a prompt.
Maybe it took them five minutes. Maybe it works okay in
testing. They ship it.

[BREATH]

Six weeks later, the AI is hallucinating. Outputs are
inconsistent. Users are complaining.

[BREATH]

The developer goes back to the prompt. It says something
like — and I have seen this in real codebases — it says:

[PAUSE]

"Write a React component for a user form."

[PAUSE]

That is it. Eleven words. No framework version. No
TypeScript requirement. No accessibility rules. No error
states. No validation logic. No output format defined.

[BREATH]

And this prompt is running in production. Right now.
In someone's application. Serving real users.

[PAUSE]

This is not one developer's mistake. This is a systemic
problem.

[BREATH]

Poor prompts lead to hallucinations. They lead to missing
requirements. They lead to inconsistent outputs, wasted
API tokens, and poor developer productivity.

[PAUSE]

And the worst part?

[BREATH]

Nobody knows it is happening. Because there is no
measurement. No visibility. No governance.

[PAUSE]

Until today.

---

## PART 3 — THE SOLUTION (2 minutes)

---

PromptGrade AI is an AI Prompt Governance Platform.

[PAUSE]

Think of it as SonarQube — but for prompts.

[BREATH]

Just the way SonarQube gates code quality before it merges
into your main branch, PromptGrade gates prompt quality
before it reaches your production AI systems.

[PAUSE]

Here is how it works.

[BREATH]

A developer submits a prompt and selects their tech domain
— Frontend, Backend, DevOps, Testing, Database, or System
Design.

[PAUSE]

Our system immediately evaluates the prompt against two
layers of criteria.

[BREATH]

Layer one is six universal quality dimensions —
Clarity, Completeness, Context, Constraints,
Output Definition, and Production Readiness.

[BREATH]

Layer two is a domain-specific rubric. A frontend prompt
gets checked for accessibility requirements, TypeScript
specification, state management approach, and responsive
behavior. A backend prompt gets checked for input
validation, authentication scope, error handling, and
logging requirements. Every domain has its own standards.

[PAUSE]

The system returns a score between zero and one.

[BREATH]

If the score is zero point eight or above — the prompt
passes. It meets the governance threshold.

[PAUSE]

If the score is below zero point eight —

[BREATH]

This is where it gets interesting.

[PAUSE]

The system does not just tell you your prompt is bad.
It automatically rewrites it.

[BREATH]

Our Rewriter Agent takes the original prompt, the
scorecard, and every specific failure reason — and
produces an improved version that preserves the original
intent while fixing every identified weakness.

[PAUSE]

Then it evaluates the rewritten prompt again.

[BREATH]

This loop continues — up to three iterations — until the
prompt either passes the zero point eight threshold or we
return the best version achieved.

[PAUSE]

The result is a complete before-and-after report.
Original score. Final score. Improvement percentage.
Word-level diff showing exactly what changed and why.
All stored permanently in your governance database.

---

## PART 4 — THE TECHNOLOGY (1.5 minutes)

---

Let me briefly walk you through how we built this.

[PAUSE]

The backend is Python with FastAPI. Fast, async, and
it auto-generates API documentation we can use for testing.

[BREATH]

The agent orchestration uses LangGraph — a graph-based
framework that lets us define our five agents as nodes in
a stateful graph, with conditional routing between them.

[PAUSE]

We have five agents.

[BREATH]

The Intake Agent normalizes and validates the prompt.
No LLM call — pure deterministic logic.

[BREATH]

The Evaluation Agent calls OpenAI GPT-4o-mini with a
structured JSON response format, applies the rubric, and
returns a validated scorecard.

[BREATH]

The Rewriter Agent improves the prompt with strict
instructions to preserve original intent and never add
requirements that were not implied.

[BREATH]

The Validation Agent computes improvement percentage and
generates a word-level diff — no LLM call, pure arithmetic.

[BREATH]

The Report Agent assembles the final result and writes
everything to our SQLite database.

[PAUSE]

The frontend is React with TypeScript, Vite, and Tailwind
CSS. We use Recharts for our radar chart — which shows all
six evaluation dimensions visually — and Server-Sent Events
for the live agent progress indicator that lets you watch
each agent activate in real time.

[PAUSE]

One design decision I want to highlight is our
anti-hallucination architecture.

[BREATH]

We never ask the LLM to invent scores. We give it a fixed
rubric of binary yes-or-no questions. The score is computed
from the answers — not estimated by the model. The LLM
classifies. It does not create.

---

## PART 5 — THE DEMO (1.5 minutes)

---

Let me walk you through what you would see in a live demo.

[PAUSE]

You open the Evaluate page. You paste in our weak prompt —
"Write a React component for a user form."

[BREATH]

You select domain: Frontend. You click Evaluate.

[PAUSE]

Immediately, the Agent Progress indicator lights up.
You watch each agent activate in sequence —
Intake running, Intake complete, Evaluation running...

[BREATH]

The score comes back. Zero point four two.

[PAUSE]

The radar chart shows you exactly where it failed.
Context — zero point three three. Constraints — zero
point two five. Output Definition — zero point three three.

[BREATH]

Below the threshold. The Rewriter Agent kicks in
automatically.

[PAUSE]

Two iterations later, the final score is zero point eight
six. A hundred and four percent improvement.

[BREATH]

You click to the Diff Viewer. Every change is highlighted.
Green for what the rewriter added — TypeScript typing,
accessibility requirements, form validation, error states,
loading states. Red for the vague language it removed.

[PAUSE]

You click to the Leaderboard. You can see which team in
your organization is writing the best prompts. Who has
the highest governance score. Who needs coaching.

[BREATH]

You click to Analytics. Score trends over time. Domain
distribution. Top failure categories across your org.

[PAUSE]

This is not a demo. This is a product.

---

## PART 6 — COMMON QUESTIONS AND ANSWERS (2 minutes)

---

Now let me address the questions I know you are thinking.

[PAUSE]

QUESTION ONE.

[BREATH]

"Why can't I just ask ChatGPT to improve my prompt?"

[PAUSE]

You can. But that is like asking a developer to review
their own code instead of running SonarQube.

[BREATH]

ChatGPT rewrites one prompt when you ask it.
It has no memory of what standards it applied last time.
It has no consistent rubric. It gives you no score.
It keeps no history. It cannot tell your engineering
manager which team is writing the worst prompts.
It cannot enforce governance at scale.

[PAUSE]

GPT is a tool. PromptGrade is the system that governs
how your entire organization uses tools like GPT.

[PAUSE]

QUESTION TWO.

[BREATH]

"Isn't the LLM just evaluating itself? Is that circular?"

[PAUSE]

No. The LLM does not decide the criteria. We do.
The rubric is hardcoded — six universal dimensions,
domain-specific binary checklists. The LLM only answers
the yes-or-no questions on that rubric.

[BREATH]

It is like using a calculator. The formula is ours.
The LLM just does the computation. It cannot change the
scoring rules or invent new criteria.

[PAUSE]

QUESTION THREE.

[BREATH]

"This seems like a nice-to-have, not a must-have."

[PAUSE]

In 2024, the average enterprise is spending over two
million dollars per year on LLM API costs. Studies show
that poorly written prompts waste between twenty and
forty percent of those tokens through repeated calls,
hallucination corrections, and rework.

[BREATH]

PromptGrade is not a nice-to-have. It is a cost
reduction tool, a quality gate, and a governance
framework — all in one.

[PAUSE]

QUESTION FOUR.

[BREATH]

"How does this scale beyond the hackathon?"

[PAUSE]

Phase two is a GitHub Action that blocks pull requests
if prompt quality drops below the team threshold —
same as SonarQube quality gates in CI/CD.

[BREATH]

Phase two also includes a VS Code extension for
real-time scoring as you type — like ESLint, but
for prompts.

[BREATH]

Phase three is a Prompt Registry — a versioned,
searchable library of approved prompts per organization,
so high-scoring prompts can be reused across teams.

[PAUSE]

The hackathon build is the foundation.
The roadmap is the platform.

---

## PART 7 — THE CLOSE (30 seconds)

---

SonarQube took ten years to become the standard for
code quality governance.

[PAUSE]

Every enterprise engineering team uses it today because
they learned — the hard way — that unmeasured code quality
degrades silently until it becomes a crisis.

[PAUSE]

Prompt quality is at the same inflection point right now.
Organizations are shipping AI features at scale with zero
measurement, zero standards, and zero governance.

[BREATH]

PromptGrade AI does for prompts what SonarQube did for
code.

[PAUSE]

We built the foundation in eighteen hours.

[PAUSE]

Thank you.

---

## QUICK REFERENCE — KEY NUMBERS TO MEMORIZE

Score threshold:     0.8
Max iterations:      3
Universal dimensions: 6
Domains supported:   6
Universal weight:    60%
Domain weight:       40%
Demo prompt score:   0.42 → 0.86 (104% improvement)

---

## QUICK REFERENCE — ONE-LINERS FOR Q&A

"GPT is a tool. PromptGrade governs how your org uses it."
"The LLM classifies. It does not create the criteria."
"SonarQube for prompts — same problem, same solution."
"Measurement is the first step to improvement."
"We built the foundation. The roadmap is the platform."

---

END OF SCRIPT
Total estimated time: 10 minutes at natural speaking pace.
