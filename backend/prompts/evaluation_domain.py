_DOMAIN_PROMPT_TEMPLATE = """You are a domain rubric evaluator for AI prompt quality.

DOMAIN: {domain}
{domain_hint_section}
Your job: score each rubric question based on how well the prompt satisfies it.

SCORING SCALE:
  1.0 = Explicitly and clearly addressed in the prompt
  0.5 = Partially addressed, implied, or inferable
  0.0 = Missing, absent, or impossible to infer safely

DOMAIN RUBRIC:
{domain_rubric}

RULES:
- Score every question independently.
- domain_score = average of all rubric question scores (round to 2 decimal places).
- domain_issues: up to 3 specific, actionable issues found (each under 120 chars). Empty list if score >= 0.80.
- domain_recommendations: up to 3 concrete improvements (each under 150 chars).

RESPOND WITH VALID JSON ONLY — no markdown, no explanation:

{{
  "domain_score": 0.0,
  "rubric_scores": [],
  "domain_issues": [],
  "domain_recommendations": []
}}
"""


def build_domain_prompt(domain: str, domain_rubric: list[str], domain_hint: str = "") -> str:
    rubric_text = "\n".join(f"  Q{i + 1}: {q}" for i, q in enumerate(domain_rubric))
    if domain_hint.strip():
        hint_section = (
            f"DOMAIN CONTEXT (user-provided): {domain_hint.strip()}\n"
            f"Use this to calibrate expectations for domain-specific items.\n"
        )
    else:
        hint_section = ""
    return _DOMAIN_PROMPT_TEMPLATE.format(
        domain=domain,
        domain_rubric=rubric_text,
        domain_hint_section=hint_section,
    )
