import os

from dotenv import load_dotenv
from openai import OpenAI

from graph.state import GraphState
from prompts.rewriter_system import build_rewriter_prompt

load_dotenv()


def _rewrite(system_prompt: str, current_prompt: str) -> str:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), api_base=os.getenv("OPENAI_API_BASE"))
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

    state["retries"] = int(state.get("retries", 0)) + 1
    state["rewritten_prompt"] = rewritten
    state["current_prompt"] = rewritten
    return state
