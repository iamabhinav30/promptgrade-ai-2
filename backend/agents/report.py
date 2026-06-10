from datetime import datetime, timezone

from db.queries import insert_dimension_scores, insert_evaluation, upsert_governance_score
from graph.state import GraphState


def report_node(state: GraphState) -> GraphState:
    iterations = state.get("iterations", [])
    original_score = float(iterations[0]["score"]) if iterations else 0.0
    final_score = float(state.get("best_score", original_score))
    result = {
        "evaluationId": state["evaluation_id"],
        "originalPrompt": state["original_prompt"],
        "finalPrompt": state["final_prompt"],
        "domain": state["domain"],
        "originalScore": original_score,
        "finalScore": final_score,
        "improvementPct": float(state.get("improvement_pct", 0.0)),
        "iterationCount": len(iterations),
        "iterations": iterations,
        "diff": state.get("diff", {"added": [], "removed": []}),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    insert_evaluation(result)
    insert_dimension_scores(result["evaluationId"], iterations)
    upsert_governance_score("Hackathon Team", result)

    state["report_summary"] = (
        f"Score improved from {original_score} to {final_score} "
        f"({state.get('improvement_pct', 0.0)}% improvement) in {len(iterations)} iterations"
    )
    return state
