from datetime import datetime, timezone

import progress
from db.queries import insert_dimension_scores, insert_evaluation, upsert_governance_score
from graph.state import GraphState


def report_node(state: GraphState) -> GraphState:
    eid = state.get("evaluation_id", "")
    progress.emit(eid, "report", "running")

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

    improvement_pct = float(state.get("improvement_pct", 0.0))
    state["report_summary"] = (
        f"Score improved from {original_score} to {final_score} "
        f"({improvement_pct}% improvement) in {len(iterations)} iterations"
    )

    progress.emit(eid, "report", "complete", improvementPct=improvement_pct)
    return state
