import os

from dotenv import load_dotenv
from openai import OpenAI

import progress
from graph.state import GraphState
from prompts.rewriter_system import build_rewriter_prompt

load_dotenv()


def _rewrite(system_prompt: str, current_prompt: str) -> str:
    base_url = os.getenv("OPENAI_API_BASE") or None
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=base_url)
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": current_prompt},
        ],
        temperature=0.2,
        max_tokens=800,
    )
    return (response.choices[0].message.content or "").strip()


def rewriter_node(state: GraphState) -> GraphState:
    eid = state.get("evaluation_id", "")
    retry_num = int(state.get("retries", 0)) + 1
    progress.emit(eid, "rewrite", "running", iteration=retry_num)

    system_prompt = build_rewriter_prompt(
        original_prompt=state["original_prompt"],
        domain=state["domain"],
        score=float(state["score"]),
        failures=state.get("failures", []),
        recommendations=state.get("recommendations", []),
    )
    rewritten = _rewrite(system_prompt, state["current_prompt"])
    if len(rewritten) > len(state["current_prompt"]) * 3:
        rewritten = _rewrite("Be concise.\n" + system_prompt, state["current_prompt"])

    if not rewritten:
        rewritten = state["current_prompt"]

    state["retries"] = retry_num
    state["rewritten_prompt"] = rewritten
    state["current_prompt"] = rewritten

    progress.emit(eid, "rewrite", "complete", iteration=retry_num)
    return state
