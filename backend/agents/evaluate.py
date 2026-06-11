import importlib
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

import progress
from graph.state import GraphState
from prompts.evaluation_domain import build_domain_prompt
from prompts.evaluation_universal import build_universal_prompt

load_dotenv()

DIMENSION_NAMES = [
    "clarity",
    "completeness",
    "context",
    "constraints",
    "output_definition",
    "production_readiness",
]

_DEFAULT_FAILURES = {
    "clarity":             "Task intent, scope, or expected decision is unclear or open to multiple interpretations.",
    "completeness":        "Required inputs, requirements, examples, or acceptance criteria are missing.",
    "context":             "Target user, domain, environment, system, or use case is not sufficiently described.",
    "constraints":         "Boundaries such as tech stack, limits, rules, security, compliance, budget, or exclusions are undefined.",
    "output_definition":   "Expected output structure, format, level of detail, or success criteria are missing.",
    "production_readiness":"Production concerns like scalability, testing, security, observability, and maintainability are missing.",
}


def _load_rubric(domain: str) -> list[str]:
    module = importlib.import_module(f"prompts.rubrics.{domain}")
    return list(module.RUBRIC_QUESTIONS)


def _get_client() -> OpenAI:
    base_url = os.getenv("OPENAI_API_BASE") or None
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=base_url)


def _call_universal(current_prompt: str) -> dict[str, Any]:
    client = _get_client()
    system_prompt = build_universal_prompt()
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": current_prompt},
        ],
        temperature=0.0,
        max_tokens=1200,
    )
    return json.loads(response.choices[0].message.content or "{}")


def _call_domain(current_prompt: str, domain: str, rubric: list[str], domain_hint: str) -> dict[str, Any]:
    client = _get_client()
    system_prompt = build_domain_prompt(domain, rubric, domain_hint)
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": current_prompt},
        ],
        temperature=0.0,
        max_tokens=600,
    )
    return json.loads(response.choices[0].message.content or "{}")


def _validate_universal(payload: dict[str, Any]) -> dict[str, Any]:
    if "score" not in payload:
        raise ValueError("Universal response missing score.")
    score = float(payload["score"])
    if not (0.0 <= score <= 1.0):
        raise ValueError("Universal score out of range.")

    dimensions = payload.get("dimensions")
    if not isinstance(dimensions, list) or len(dimensions) != 6:
        raise ValueError("Universal response must have exactly 6 dimensions.")

    found = {d.get("name") for d in dimensions}
    if found != set(DIMENSION_NAMES):
        raise ValueError(f"Dimensions incomplete: got {found}")

    clean_dims = []
    for d in dimensions:
        dim_score = float(d.get("score", 0.0))
        if not (0.0 <= dim_score <= 1.0):
            raise ValueError(f"Dimension score out of range: {dim_score}")
        failure_reason = d.get("failureReason")
        if failure_reason:
            failure_reason = str(failure_reason)[:100]
        elif dim_score < 0.8:
            failure_reason = _DEFAULT_FAILURES.get(d["name"], "Needs improvement")
        clean_dims.append({
            "name":          d["name"],
            "score":         dim_score,
            "failureReason": failure_reason if dim_score < 0.8 else None,
        })

    return {
        "score":           score,
        "dimensions":      clean_dims,
        "failures":        [str(f)[:100] for f in payload.get("failures", []) if str(f).strip()],
        "recommendations": [str(r)[:150] for r in payload.get("recommendations", []) if str(r).strip()],
    }


def _validate_domain(payload: dict[str, Any]) -> dict[str, Any]:
    domain_score = float(payload.get("domain_score", 0.0))
    domain_score = max(0.0, min(1.0, domain_score))
    issues = [str(i)[:120] for i in payload.get("domain_issues", []) if str(i).strip()]
    recs   = [str(r)[:150] for r in payload.get("domain_recommendations", []) if str(r).strip()]
    return {
        "domain_score":            domain_score,
        "domain_issues":           issues[:3],
        "domain_recommendations":  recs[:3],
    }


def evaluate_node(state: GraphState) -> GraphState:
    eid           = state.get("evaluation_id", "")
    iteration_num = len(state.get("iterations", [])) + 1
    progress.emit(eid, "evaluate", "running", iteration=iteration_num)

    domain      = state["domain"]
    domain_hint = state.get("domain_hint", "")
    rubric      = _load_rubric(domain)
    prompt      = state["current_prompt"]

    # ── Parallel evaluation: universal dims + domain rubric ──────────────────
    universal_result: dict[str, Any] = {}
    domain_result:    dict[str, Any] = {}
    last_error: Exception | None = None

    for _attempt in range(2):
        try:
            with ThreadPoolExecutor(max_workers=2) as executor:
                f_universal = executor.submit(_call_universal, prompt)
                f_domain    = executor.submit(_call_domain, prompt, domain, rubric, domain_hint)
                universal_raw = f_universal.result()
                domain_raw    = f_domain.result()

            universal_result = _validate_universal(universal_raw)
            domain_result    = _validate_domain(domain_raw)
            break
        except Exception as exc:
            last_error = exc
    else:
        raise ValueError(f"Evaluation failed after retries: {last_error}")

    # ── Merge scores ──────────────────────────────────────────────────────────
    u_score = float(universal_result["score"])
    d_score = float(domain_result["domain_score"])
    overall = round((u_score * 0.6) + (d_score * 0.4), 2)

    # Combine recommendations (universal first, then domain-specific)
    combined_recs = universal_result["recommendations"] + domain_result["domain_recommendations"]
    combined_recs = combined_recs[:6]

    # ── Store previous score for stagnation detection ─────────────────────────
    state["previous_score"] = float(state.get("score", 0.0))
    state["score"]          = overall
    state["dimensions"]     = universal_result["dimensions"]
    state["failures"]       = universal_result["failures"]
    state["recommendations"] = combined_recs
    state["best_score"]     = max(float(state.get("best_score", 0.0)), overall)

    iteration = {
        "iterationNumber": iteration_num,
        "score":           overall,
        "dimensions":      universal_result["dimensions"],
        "rewrittenPrompt": prompt,
    }
    state.setdefault("iterations", []).append(iteration)

    progress.emit(eid, "evaluate", "complete", score=overall, iteration=iteration_num)
    return state
