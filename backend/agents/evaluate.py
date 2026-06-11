import importlib
import json
import os
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

import progress
from graph.state import GraphState
from prompts.evaluation_system import build_evaluation_prompt

load_dotenv()

DIMENSION_NAMES = [
    "clarity",
    "completeness",
    "context",
    "constraints",
    "output_definition",
    "production_readiness",
]


def _load_rubric(domain: str) -> list[str]:
    module = importlib.import_module(f"prompts.rubrics.{domain}")
    return list(module.RUBRIC_QUESTIONS)


def _call_llm(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    base_url = os.getenv("OPENAI_API_BASE") or None
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=base_url)
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.0,
        max_tokens=1000,
    )
    content = response.choices[0].message.content or "{}"
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        print(f"Content: {content}")
        raise ValueError(f"LLM response is not valid JSON: {str(e)}")


def _validate_response(payload: dict[str, Any]) -> dict[str, Any]:
    if "score" not in payload:
        raise ValueError("LLM response missing score.")
    score = float(payload["score"])
    if score < 0.0 or score > 1.0:
        raise ValueError("LLM response score must be between 0 and 1.")

    dimensions = payload.get("dimensions")
    if not isinstance(dimensions, list) or len(dimensions) != 6:
        raise ValueError("LLM response must include exactly 6 dimensions.")

    found = {dimension.get("name") for dimension in dimensions}
    if found != set(DIMENSION_NAMES):
        raise ValueError("LLM response dimensions are incomplete or invalid.")

    clean_dimensions = []
    for dimension in dimensions:
        dim_score = float(dimension.get("score"))
        if dim_score < 0.0 or dim_score > 1.0:
            raise ValueError("Each dimension score must be between 0 and 1.")
        failure_reason = dimension.get("failureReason")
        if failure_reason:
            failure_reason = str(failure_reason)[:100]
        clean_dimensions.append(
            {
                "name": dimension["name"],
                "score": dim_score,
                "failureReason": failure_reason if dim_score < 0.8 else None,
            }
        )

    failures = [str(item)[:100] for item in payload.get("failures", []) if str(item).strip()]
    recommendations = [
        str(item)[:150] for item in payload.get("recommendations", []) if str(item).strip()
    ]

    return {
        "score": score,
        "dimensions": clean_dimensions,
        "failures": failures,
        "recommendations": recommendations,
    }


def evaluate_node(state: GraphState) -> GraphState:
    eid = state.get("evaluation_id", "")
    iteration_num = len(state.get("iterations", [])) + 1
    progress.emit(eid, "evaluate", "running", iteration=iteration_num)

    domain = state["domain"]
    rubric = _load_rubric(domain)
    system_prompt = build_evaluation_prompt(domain, rubric)

    last_error: Exception | None = None
    for _ in range(2):
        try:
            payload = _call_llm(system_prompt, state["current_prompt"])
            validated = _validate_response(payload)
            break
        except Exception as exc:
            last_error = exc
    else:
        raise ValueError(f"Evaluation LLM output validation failed: {last_error}")

    score = float(validated["score"])
    state["score"] = score
    state["dimensions"] = validated["dimensions"]
    state["failures"] = validated["failures"]
    state["recommendations"] = validated["recommendations"]
    state["best_score"] = max(float(state.get("best_score", 0.0)), score)

    iteration = {
        "iterationNumber": iteration_num,
        "score": score,
        "dimensions": validated["dimensions"],
        "rewrittenPrompt": state["current_prompt"],
    }
    state.setdefault("iterations", []).append(iteration)

    progress.emit(eid, "evaluate", "complete", score=score, iteration=iteration_num)
    return state
