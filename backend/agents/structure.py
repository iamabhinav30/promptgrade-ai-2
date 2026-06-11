import os

from dotenv import load_dotenv
from openai import OpenAI

import progress
from graph.state import GraphState
from prompts.structure_system import build_structure_prompt

load_dotenv()


def _call_llm(system_prompt: str, user_prompt: str) -> str:
    base_url = os.getenv("OPENAI_API_BASE") or None
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=base_url)
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=2000,
    )
    return (response.choices[0].message.content or "").strip()


def structure_node(state: GraphState) -> GraphState:
    eid             = state.get("evaluation_id", "")
    prompt_category = state.get("prompt_category", "general")
    original_prompt = state["current_prompt"]

    progress.emit(eid, "structure", "running")

    # Build category-aware structure prompt — the full system prompt includes
    # the original prompt embedded, so the user message is just a trigger.
    system_prompt = build_structure_prompt(original_prompt, prompt_category)
    structured    = _call_llm(system_prompt, "Structure the prompt above.")

    if not structured or len(structured) < 50:
        structured = original_prompt

    state["structured_prompt"] = structured
    state["current_prompt"]    = structured

    progress.emit(eid, "structure", "complete")
    return state
