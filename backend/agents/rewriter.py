import os

from dotenv import load_dotenv
from openai import OpenAI

import progress
from graph.state import GraphState
from prompts.rewriter_system import (
    build_content_rewriter_prompt,
    build_context_rewriter_prompt,
    build_output_rewriter_prompt,
)

load_dotenv()


def _call_rewriter(system_prompt: str, current_prompt: str) -> str:
    base_url = os.getenv("OPENAI_API_BASE") or None
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=base_url)
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": current_prompt},
        ],
        temperature=0.2,
        max_tokens=1000,
    )
    return (response.choices[0].message.content or "").strip()


def _run_rewrite(state: GraphState, system_prompt: str) -> GraphState:
    eid       = state.get("evaluation_id", "")
    retry_num = int(state.get("retries", 0)) + 1
    progress.emit(eid, "rewrite", "running", iteration=retry_num)

    rewritten = _call_rewriter(system_prompt, state["current_prompt"])

    # Guard against bloated rewrites
    if len(rewritten) > len(state["current_prompt"]) * 3:
        rewritten = _call_rewriter("Be concise.\n" + system_prompt, state["current_prompt"])

    if not rewritten:
        rewritten = state["current_prompt"]

    state["retries"]          = retry_num
    state["rewritten_prompt"] = rewritten
    state["current_prompt"]   = rewritten

    progress.emit(eid, "rewrite", "complete", iteration=retry_num)
    return state


def rewrite_content_node(state: GraphState) -> GraphState:
    """Targeted fix for Clarity + Completeness failures."""
    system_prompt = build_content_rewriter_prompt(
        original_prompt=state["original_prompt"],
        domain=state["domain"],
        score=float(state.get("score", 0.0)),
        failures=state.get("failures", []),
        recommendations=state.get("recommendations", []),
    )
    return _run_rewrite(state, system_prompt)


def rewrite_context_node(state: GraphState) -> GraphState:
    """Targeted fix for Context + Constraints failures."""
    system_prompt = build_context_rewriter_prompt(
        original_prompt=state["original_prompt"],
        domain=state["domain"],
        score=float(state.get("score", 0.0)),
        failures=state.get("failures", []),
        recommendations=state.get("recommendations", []),
    )
    return _run_rewrite(state, system_prompt)


def rewrite_output_node(state: GraphState) -> GraphState:
    """Targeted fix for Output Definition + Production Readiness failures."""
    system_prompt = build_output_rewriter_prompt(
        original_prompt=state["original_prompt"],
        domain=state["domain"],
        score=float(state.get("score", 0.0)),
        failures=state.get("failures", []),
        recommendations=state.get("recommendations", []),
    )
    return _run_rewrite(state, system_prompt)
