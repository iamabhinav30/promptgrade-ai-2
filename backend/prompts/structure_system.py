_SHARED_RULES = """
PRESERVATION RULES:
1. Preserve the original intent exactly — do not change what the user is asking for.
2. Do not add features, tools, or requirements not implied by the original prompt.
3. Do not remove any meaningful requirement.
4. Use {{double_braces}} for all configurable or unknown values.
5. Do not invent missing facts — convert unknown details into {{placeholders}}.
6. Keep the original language unless the prompt clearly requires English.

FORMATTING RULES:
1. Use the markdown structure exactly as shown in the template above.
2. Do not wrap output in code fences.
3. Do not include explanations, preamble, or the original prompt text.
4. Output only the formatted prompt — nothing else.

ORIGINAL PROMPT:
{original_prompt}
"""

# ── 1. Code Implementation (frontend / backend) ───────────────────────────────

_CODE_IMPL_TEMPLATE = """You are a strict prompt architect for software engineering AI systems.
Transform the raw prompt into the clean structured template below, preserving intent exactly.

Use EXACTLY this structure:

# {{Descriptive Title}}

Channel: {{Web|Mobile|Services|SDLC}} | Scope: {{Common|Specific}} | Topic: {{short topic}}

## System Prompt

{{Concise role and expertise statement — 1–2 sentences}}

## Context

* Framework: {{framework}}
* Language: {{language}}
* Environment: {{dev|staging|prod}}
* {{Key}}: {{value}}

## Instructions

1. **{{Step}}:** {{Actionable detail}}
2. **{{Step}}:** {{Actionable detail}}

## Example Usage

{{Field}}: {{value}}

Generate:

* {{Output item}}

## Tags

{{tag1}} {{tag2}} {{tag3}}

---

CHANNEL: Web=frontend/UI/browser, Mobile=Android/iOS/mobile, Services=APIs/backend/infra, SDLC=CI/CD/testing/review
SCOPE: Common=reusable across projects, Specific=tied to one project/feature/bug
TITLE: Short, specific, no generic names like "Improved Prompt"
CONTEXT: 2–8 bullets, use {{double_braces}} for all values. Keys: Framework, Language, Version, Environment, Target User, Input, Constraints.
INSTRUCTIONS: 3–8 numbered steps, each with a bold key concept and actionable detail.
TAGS: 3–6 lowercase space-separated tags, no hashtags.
{shared_rules}"""

# ── 2. System Design / Architecture ──────────────────────────────────────────

_SYSTEM_DESIGN_TEMPLATE = """You are a strict prompt architect for system design and architecture tasks.
Transform the raw prompt into the clean structured template below, preserving intent exactly.

Use EXACTLY this structure:

# {{Descriptive Title}}

## Problem Statement

{{What needs to be designed and why — 1–3 sentences}}

## Requirements

### Functional
* {{User-facing capability or behavior}}

### Non-Functional
* {{Scale, latency, availability, durability, or cost target}}

## Constraints

* {{Technology, team, time, compliance, or budget constraint}}

## Design Scope

* In scope: {{what this design covers}}
* Out of scope: {{what to explicitly exclude}}

## Deliverables

* {{High-level architecture diagram or description}}
* {{Component breakdown with responsibilities}}
* {{Key design decisions and rationale}}

## Tags

{{tag1}} {{tag2}} {{tag3}}

---

PROBLEM STATEMENT: Explain what to design and the motivation or scale challenge.
REQUIREMENTS: Separate functional (what it does) from non-functional (how well it does it).
CONSTRAINTS: Technology stack, compliance rules, team size, deadlines, cost limits.
SCOPE: Be explicit about what is and is not covered to prevent scope creep.
DELIVERABLES: List concrete outputs expected — diagram, decision doc, API contract, etc.
TAGS: 3–6 lowercase space-separated tags (e.g. distributed-systems scalability caching).
{shared_rules}"""

# ── 3. Testing & QA ───────────────────────────────────────────────────────────

_TESTING_TEMPLATE = """You are a strict prompt architect for testing and quality assurance tasks.
Transform the raw prompt into the clean structured template below, preserving intent exactly.

Use EXACTLY this structure:

# {{Descriptive Title}}

## System Under Test

* Component: {{what is being tested}}
* Language/Framework: {{language and test framework}}
* Environment: {{unit|integration|e2e|performance}}

## Test Objectives

* {{What behavior, contract, or quality property must be verified}}

## Test Scenarios

1. **{{Scenario name}}:** {{What to test and expected outcome}}
2. **{{Scenario name}}:** {{What to test and expected outcome}}

## Edge Cases & Failure Modes

* {{Invalid input or boundary condition}}: {{expected behavior}}

## Coverage Requirements

* {{Lines|Branches|Paths}}: {{target %}}
* {{Critical paths that must be covered}}

## Deliverables

* {{Test file, test plan, coverage report, or CI integration}}

## Tags

{{tag1}} {{tag2}} {{tag3}}

---

SYSTEM UNDER TEST: Name the component, language, framework, and test type clearly.
SCENARIOS: Each scenario has a name and clear expected outcome — not vague descriptions.
EDGE CASES: Cover nulls, empty inputs, boundary values, concurrency, and failures.
COVERAGE: Specify quantitative targets where possible.
{shared_rules}"""

# ── 4. Data & Analytics ───────────────────────────────────────────────────────

_DATA_ANALYTICS_TEMPLATE = """You are a strict prompt architect for data analytics and engineering tasks.
Transform the raw prompt into the clean structured template below, preserving intent exactly.

Use EXACTLY this structure:

# {{Descriptive Title}}

## Objective

{{What insight, result, or artifact needs to be produced}}

## Data Sources

* {{Table/dataset/API}}: {{schema or description}}

## Analysis Requirements

1. **{{Requirement}}:** {{Specific analysis step or transformation}}
2. **{{Requirement}}:** {{Specific analysis step or transformation}}

## Output Format

* Format: {{SQL query|Python script|dashboard|CSV|report}}
* Metrics: {{Specific columns, KPIs, or aggregations required}}
* Granularity: {{Row level|Daily|Monthly|Cohort}}

## Constraints

* Time range: {{date range or window}}
* Performance: {{query time limit or row count expectations}}
* Filters: {{required filters or exclusions}}

## Tags

{{tag1}} {{tag2}} {{tag3}}

---

OBJECTIVE: State the decision or question this analysis answers.
DATA SOURCES: Name tables/APIs with schema hints. Use {{placeholders}} for unknown details.
OUTPUT FORMAT: Be specific — a vague "report" is not enough. Name the format and metrics.
CONSTRAINTS: Time ranges, performance limits, data freshness, and exclusion filters.
{shared_rules}"""

# ── 5. DevOps / Infrastructure ────────────────────────────────────────────────

_DEVOPS_TEMPLATE = """You are a strict prompt architect for DevOps and infrastructure tasks.
Transform the raw prompt into the clean structured template below, preserving intent exactly.

Use EXACTLY this structure:

# {{Descriptive Title}}

Channel: {{Cloud|On-Prem|Hybrid}} | Provider: {{AWS|GCP|Azure|Other}}

## Environment

* Platform: {{Kubernetes|ECS|Lambda|VMs|etc.}}
* Stack: {{language, runtime, container registry}}
* Target: {{dev|staging|prod}}

## Requirements

1. **{{Requirement}}:** {{Specific infrastructure or pipeline need}}
2. **{{Requirement}}:** {{Specific infrastructure or pipeline need}}

## Constraints

* Security: {{IAM, secrets, network rules}}
* Reliability: {{SLA, retry, rollback requirements}}
* Cost: {{budget limits or optimization targets}}
* Compliance: {{PCI, SOC2, HIPAA, or N/A}}

## Deliverables

* {{Config files, IaC, workflow YAML, runbook, or scripts}}

## Tags

{{tag1}} {{tag2}} {{tag3}}

---

ENVIRONMENT: Be specific — cloud provider, orchestration platform, runtime, and target.
REQUIREMENTS: Numbered steps covering provisioning, deployment, monitoring, and rollback.
CONSTRAINTS: Security and compliance requirements are mandatory — never leave these blank.
DELIVERABLES: Name the exact artifact: Terraform module, GitHub Actions workflow, Helm chart, etc.
{shared_rules}"""

# ── 6. Creative Content ───────────────────────────────────────────────────────

_CREATIVE_TEMPLATE = """You are a strict prompt architect for creative content tasks.
Transform the raw prompt into the clean structured template below, preserving intent exactly.

Use EXACTLY this structure:

# {{Descriptive Title}}

## Objective

{{What this content needs to accomplish — goal and desired impact}}

## Target Audience

* Who: {{persona, demographics, or role}}
* Knowledge level: {{novice|general|expert}}
* Context: {{where/when they will encounter this content}}

## Tone & Voice

* Tone: {{formal|casual|humorous|inspirational|authoritative}}
* Style: {{concise|narrative|persuasive|educational}}
* Avoid: {{what to never say or do}}

## Content Requirements

1. **{{Key message or element}}:** {{Detail}}
2. **{{Key message or element}}:** {{Detail}}

## Format & Length

* Format: {{article|email|script|social post|landing page|ad copy}}
* Length: {{word count, duration, or character limit}}
* Structure: {{sections, paragraphs, bullet lists, or free-form}}

## References & Examples

* {{Reference, sample, or inspiration to model after}}

## Tags

{{tag1}} {{tag2}} {{tag3}}

---

OBJECTIVE: Creative content without a clear goal produces weak output. State what success looks like.
AUDIENCE: Specificity here directly controls voice, vocabulary, and depth.
TONE: Contradictory tone/style signals confuse the model — be deliberate.
FORMAT: Name the exact deliverable — a blog post and a tweet need entirely different treatment.
{shared_rules}"""

# ── 7. Instructional / Tutorial ───────────────────────────────────────────────

_INSTRUCTIONAL_TEMPLATE = """You are a strict prompt architect for instructional and tutorial content.
Transform the raw prompt into the clean structured template below, preserving intent exactly.

Use EXACTLY this structure:

# {{Descriptive Title}}

## Learning Objective

{{What the reader will be able to do after completing this — one clear outcome}}

## Prerequisites

* {{Required knowledge, tool, or environment}}

## Steps

1. **{{Step Name}}:** {{Clear, specific instruction with expected result}}
2. **{{Step Name}}:** {{Clear, specific instruction with expected result}}

## Expected Outcome

{{What success looks like — concrete and verifiable}}

## Common Issues & Solutions

* {{Potential problem}}: {{How to resolve it}}

## Next Steps

* {{What to do or learn after completing this}}

## Tags

{{tag1}} {{tag2}} {{tag3}}

---

LEARNING OBJECTIVE: One specific, measurable outcome — not "understand X" but "be able to do X".
PREREQUISITES: List tools, accounts, knowledge, or setup required. Missing prereqs break tutorials.
STEPS: Each step should produce a verifiable intermediate result — not just describe an action.
COMMON ISSUES: Anticipate where readers will get stuck and provide explicit solutions.
{shared_rules}"""

# ── 8. Analytical / Research ─────────────────────────────────────────────────

_ANALYTICAL_TEMPLATE = """You are a strict prompt architect for analytical and research tasks.
Transform the raw prompt into the clean structured template below, preserving intent exactly.

Use EXACTLY this structure:

# {{Descriptive Title}}

## Analysis Question

{{The specific question to answer or decision to inform — one focused question}}

## Context & Background

* {{Relevant facts, history, or constraints}}

## Information Sources

* {{Data, documents, systems, or APIs to analyze}}

## Analysis Criteria

1. **{{Criterion}}:** {{What to evaluate and how to weight it}}
2. **{{Criterion}}:** {{What to evaluate and how to weight it}}

## Output Format

* Format: {{summary|comparison table|recommendation memo|risk register}}
* Depth: {{executive summary|detailed analysis|bullet points}}
* Length: {{approximate word count or page count}}

## Constraints

* Scope: {{what is in and out of scope}}
* Time: {{data recency requirements}}
* Assumptions: {{explicit assumptions to work from}}

## Tags

{{tag1}} {{tag2}} {{tag3}}

---

ANALYSIS QUESTION: A well-scoped question produces a focused answer. Broad questions produce generic analysis.
CRITERIA: Name what success looks like — what makes one option better than another?
OUTPUT FORMAT: Specify whether you want a recommendation, comparison, risk list, or narrative.
{shared_rules}"""

# ── 9. Conversational / Dialogue ──────────────────────────────────────────────

_CONVERSATIONAL_TEMPLATE = """You are a strict prompt architect for conversational AI and dialogue systems.
Transform the raw prompt into the clean structured template below, preserving intent exactly.

Use EXACTLY this structure:

# {{Descriptive Title}}

## Role Definition

{{Who the AI is, its expertise, and its personality — 1–2 sentences}}

## Context

* Use case: {{what conversations this handles}}
* Users: {{who the AI talks to}}
* Platform: {{chat interface, voice, email, or embedded widget}}

## Behavior Rules

1. **{{Rule name}}:** {{Specific behavioral constraint or guideline}}
2. **{{Rule name}}:** {{Specific behavioral constraint or guideline}}

## Tone & Style

* Tone: {{friendly|professional|empathetic|neutral}}
* Language: {{formal|informal|simple|technical}}
* Response length: {{brief|conversational|detailed}}

## Example Exchanges

User: {{example user message}}
Assistant: {{expected response style and content}}

## Hard Constraints

* Never: {{things the assistant must never say or do}}
* Always: {{things the assistant must always do}}

## Tags

{{tag1}} {{tag2}} {{tag3}}

---

ROLE DEFINITION: Define persona, expertise, and limits — ambiguous personas produce inconsistent responses.
BEHAVIOR RULES: Explicit rules prevent hallucination, off-topic responses, and policy violations.
EXAMPLE EXCHANGES: One concrete exchange is worth more than ten abstract rules.
HARD CONSTRAINTS: These are non-negotiable guardrails — be specific about prohibitions.
{shared_rules}"""

# ── 10. General / Universal fallback ─────────────────────────────────────────

_GENERAL_TEMPLATE = """You are a strict prompt architect. Transform the raw prompt into the clean structured template below, preserving intent exactly.

Use EXACTLY this structure:

# {{Descriptive Title}}

## Objective

{{Clear statement of what this prompt should accomplish — one focused goal}}

## Context

* {{Key}}: {{value}}
* {{Key}}: {{value}}

## Instructions

1. **{{Step}}:** {{Actionable detail}}
2. **{{Step}}:** {{Actionable detail}}

## Output

* Format: {{Expected output format, structure, or medium}}
* Length: {{Approximate length or size}}
* Criteria: {{What a correct, high-quality answer looks like}}

## Constraints

* {{Rule, limit, or exclusion — use N/A if none}}

## Tags

{{tag1}} {{tag2}} {{tag3}}

---

OBJECTIVE: One focused goal. Multiple objectives → split into separate prompts.
CONTEXT: Include only fields that genuinely affect the output. Omit irrelevant context.
INSTRUCTIONS: Numbered steps, bold key concept per step, actionable detail.
OUTPUT: The clearer the output definition, the more consistent the results.
{shared_rules}"""

# ── Category → template map ───────────────────────────────────────────────────

_CATEGORY_TEMPLATES: dict[str, str] = {
    "code_implementation": _CODE_IMPL_TEMPLATE,
    "system_design":       _SYSTEM_DESIGN_TEMPLATE,
    "testing_qa":          _TESTING_TEMPLATE,
    "data_analytics":      _DATA_ANALYTICS_TEMPLATE,
    "devops_infra":        _DEVOPS_TEMPLATE,
    "creative_content":    _CREATIVE_TEMPLATE,
    "instructional":       _INSTRUCTIONAL_TEMPLATE,
    "analytical":          _ANALYTICAL_TEMPLATE,
    "conversational":      _CONVERSATIONAL_TEMPLATE,
    "general":             _GENERAL_TEMPLATE,
}


def build_structure_prompt(original_prompt: str, prompt_category: str = "general") -> str:
    template = _CATEGORY_TEMPLATES.get(prompt_category, _GENERAL_TEMPLATE)
    shared = _SHARED_RULES.format(original_prompt=original_prompt)
    return template.format(shared_rules=shared)
