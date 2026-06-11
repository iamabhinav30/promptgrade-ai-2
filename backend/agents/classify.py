import json
import os

from dotenv import load_dotenv
from openai import OpenAI

import progress
from graph.state import GraphState

load_dotenv()

# For known technical domains we can map directly — no LLM call needed
_DOMAIN_CATEGORY_MAP = {
    "frontend":     "code_implementation",
    "backend":      "code_implementation",
    "testing":      "testing_qa",
    "database":     "data_analytics",
    "system_design": "system_design",
    "devops":       "devops_infra",
}

_VALID_CATEGORIES = {
    "code_implementation",
    "system_design",
    "testing_qa",
    "data_analytics",
    "devops_infra",
    "creative_content",
    "instructional",
    "analytical",
    "conversational",
    "general",
}

_CLASSIFY_SYSTEM = """Classify the prompt into exactly one category. Respond with valid JSON only.

Categories:
- code_implementation: building/writing specific code, components, APIs, features
- system_design: architecture, scalability, high-level system structure, design decisions
- testing_qa: writing tests, QA strategies, coverage, test plans, quality checks
- data_analytics: SQL, data pipelines, analysis, reporting, dashboards, metrics
- devops_infra: CI/CD, cloud, infrastructure, containers, deployment, monitoring
- creative_content: writing, storytelling, marketing copy, scripts, creative work
- instructional: tutorials, documentation, guides, how-to, training material
- analytical: research, evaluation, comparison, investigation, risk assessment
- conversational: chatbot behavior, dialogue, assistant personas, conversation flow
- general: does not clearly fit any above

Return only: {"category": "<name>"}"""


def classify_node(state: GraphState) -> GraphState:
    eid = state.get("evaluation_id", "")
    progress.emit(eid, "classify", "running")

    domain = state.get("domain", "other")

    # Fast path — known technical domains map directly
    if domain in _DOMAIN_CATEGORY_MAP:
        state["prompt_category"] = _DOMAIN_CATEGORY_MAP[domain]
        progress.emit(eid, "classify", "complete")
        return state

    # Slow path — LLM classification for "other" domain
    prompt = state.get("current_prompt", "")
    domain_hint = state.get("domain_hint", "")

    try:
        base_url = os.getenv("OPENAI_API_BASE") or None
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=base_url)

        user_content = f"Prompt:\n{prompt[:600]}"
        if domain_hint.strip():
            user_content += f"\n\nUser-provided context: {domain_hint.strip()}"

        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _CLASSIFY_SYSTEM},
                {"role": "user",   "content": user_content},
            ],
            temperature=0.0,
            max_tokens=30,
        )
        data = json.loads(response.choices[0].message.content or "{}")
        category = data.get("category", "general")
        if category not in _VALID_CATEGORIES:
            category = "general"
    except Exception:
        category = "general"

    state["prompt_category"] = category
    progress.emit(eid, "classify", "complete")
    return state
