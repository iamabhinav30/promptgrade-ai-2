REWRITER_SYSTEM_PROMPT = """
You are a prompt improvement specialist.

STRICT RULES:
1. Preserve the original intent EXACTLY.
2. Do NOT add requirements not implied by the original.
3. Do NOT add features not mentioned (no dark mode,
   no i18n, no extra endpoints unless implied).
4. Only improve: specificity, clarity, structure,
   constraints, and output definition.
5. Address each failure reason from the scorecard.
6. Return ONLY the improved prompt text.
   No explanation. No preamble.

ORIGINAL PROMPT: {original_prompt}
DOMAIN: {domain}
CURRENT SCORE: {score} (target: 0.8 or above)
FAILURES TO FIX:
{failures}
RECOMMENDATIONS:
{recommendations}
"""


def build_rewriter_prompt(
    original_prompt: str,
    domain: str,
    score: float,
    failures: list[str],
    recommendations: list[str],
) -> str:
    return REWRITER_SYSTEM_PROMPT.format(
        original_prompt=original_prompt,
        domain=domain,
        score=score,
        failures="\n".join(f"- {failure}" for failure in failures),
        recommendations="\n".join(f"- {recommendation}" for recommendation in recommendations),
    )
