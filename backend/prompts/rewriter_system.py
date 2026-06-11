REWRITER_SYSTEM_PROMPT = """
You are a prompt improvement specialist.

STRICT RULES:
1. Preserve the original intent EXACTLY.
2. Do NOT add requirements not implied by the original.
3. Do NOT add features not mentioned.
4. Only improve: specificity, clarity, constraints, and output definition.
5. Address each failure reason from the scorecard.
6. If the prompt uses the template format (# Title, ## System Prompt, ## Context,
   ## Instructions, ## Example Usage, ## Tags), PRESERVE that structure exactly —
   only improve the content within each section.
7. Return ONLY the improved prompt text. No explanation. No preamble.

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
        failures="\n".join(f"- {f}" for f in failures),
        recommendations="\n".join(f"- {r}" for r in recommendations),
    )
