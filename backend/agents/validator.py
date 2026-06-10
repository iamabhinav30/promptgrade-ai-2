from graph.state import GraphState


def validator_node(state: GraphState) -> GraphState:
    iterations = state.get("iterations", [])
    if iterations:
        best_iteration = max(iterations, key=lambda item: float(item.get("score", 0)))
        final_prompt = best_iteration.get("rewrittenPrompt", state.get("original_prompt", ""))
        best_score = float(best_iteration.get("score", 0))
    else:
        final_prompt = state.get("original_prompt", "")
        best_score = 0.0

    original_score = float(iterations[0]["score"]) if iterations else 0.0
    improvement_pct = 0.0 if original_score == 0 else round(((best_score - original_score) / original_score) * 100, 2)

    original_words = set(state.get("original_prompt", "").lower().split())
    final_words = set(final_prompt.lower().split())

    state["best_score"] = best_score
    state["final_prompt"] = final_prompt
    state["improvement_pct"] = improvement_pct
    state["diff"] = {
        "added": sorted(list(final_words - original_words)),
        "removed": sorted(list(original_words - final_words)),
    }
    return state
