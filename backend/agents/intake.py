from uuid import uuid4

import progress
from graph.state import GraphState
from models.schemas import Domain

MAX_PROMPT_LEN = 8000


def intake_node(state: GraphState) -> GraphState:
    domain = state.get("domain")
    allowed_domains = {item.value for item in Domain}
    if domain not in allowed_domains:
        raise ValueError(f"Invalid domain. Allowed values: {', '.join(sorted(allowed_domains))}")

    prompt = state.get("original_prompt", "").strip()
    if len(prompt) < 20:
        raise ValueError("Prompt must be at least 20 characters.")
    if len(prompt) > MAX_PROMPT_LEN:
        raise ValueError(f"Prompt must be at most {MAX_PROMPT_LEN} characters.")

    # Preserve pre-generated evaluation_id if caller set it; otherwise create one
    evaluation_id = state.get("evaluation_id") or str(uuid4())

    state["session_id"]        = str(uuid4())
    state["evaluation_id"]     = evaluation_id
    state["original_prompt"]   = prompt
    state["current_prompt"]    = prompt
    state["structured_prompt"] = ""
    state["prompt_category"]   = ""
    state["previous_score"]    = 0.0
    state["guard_status"]      = "pass"
    state["guard_message"]     = ""
    state["guard_suggestion"]  = ""
    state["guard_reason"]      = ""
    state["retries"]           = 0
    state["best_score"]        = 0.0
    state["score"]             = 0.0
    state["dimensions"]        = []
    state["failures"]          = []
    state["recommendations"]   = []
    state["iterations"]        = []
    state["rewritten_prompt"]  = prompt
    state["improvement_pct"]   = 0.0
    state["diff"]              = {"added": [], "removed": []}
    state["final_prompt"]      = prompt
    state["report_summary"]    = ""

    progress.emit(evaluation_id, "intake", "complete")
    return state
