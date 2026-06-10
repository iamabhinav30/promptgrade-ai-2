from uuid import uuid4

from graph.state import GraphState
from models.schemas import Domain


def intake_node(state: GraphState) -> GraphState:
    domain = state.get("domain")
    allowed_domains = {item.value for item in Domain}
    if domain not in allowed_domains:
        raise ValueError(f"Invalid domain. Allowed values: {', '.join(sorted(allowed_domains))}")

    prompt = state.get("original_prompt", "").strip()
    if len(prompt) < 20 or len(prompt) > 2000:
        raise ValueError("Prompt must be between 20 and 2000 characters.")

    state["session_id"] = str(uuid4())
    state["evaluation_id"] = str(uuid4())
    state["original_prompt"] = prompt
    state["current_prompt"] = prompt
    state["retries"] = 0
    state["best_score"] = 0.0
    state["score"] = 0.0
    state["dimensions"] = []
    state["failures"] = []
    state["recommendations"] = []
    state["iterations"] = []
    state["rewritten_prompt"] = prompt
    state["improvement_pct"] = 0.0
    state["diff"] = {"added": [], "removed": []}
    state["final_prompt"] = prompt
    state["report_summary"] = ""
    return state
