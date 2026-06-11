from langgraph.graph import END, START, StateGraph

from agents.classify import classify_node
from agents.evaluate import evaluate_node
from agents.intake import intake_node
from agents.report import report_node
from agents.rewriter import rewrite_content_node, rewrite_context_node, rewrite_output_node
from agents.structure import structure_node
from agents.validator import validator_node
from graph.state import GraphState

_MAX_RETRIES          = 3
_STAGNATION_THRESHOLD = 0.03   # stop if score improved less than this between iterations


def route_after_classify(state: GraphState) -> str:
    return "structure" if state.get("reformat_prompt", True) else "evaluate"


def route_after_eval(state: GraphState) -> str:
    score          = float(state.get("score", 0.0))
    retries        = int(state.get("retries", 0))
    previous_score = float(state.get("previous_score", 0.0))

    # ── Stop conditions ──────────────────────────────────────────────────────
    if score >= 0.8:
        return "validate"
    if retries >= _MAX_RETRIES:
        return "validate"
    # Stagnation: already tried at least once and barely improved
    if retries > 0 and (score - previous_score) < _STAGNATION_THRESHOLD:
        return "validate"

    # ── Route to the rewriter that targets the worst-scoring dimension pair ──
    dims = {d["name"]: float(d["score"]) for d in state.get("dimensions", [])}

    content_avg = (dims.get("clarity", 1.0) + dims.get("completeness", 1.0)) / 2
    context_avg = (dims.get("context", 1.0) + dims.get("constraints", 1.0))  / 2
    output_avg  = (dims.get("output_definition", 1.0) + dims.get("production_readiness", 1.0)) / 2

    worst = min(
        [("rewrite_content", content_avg),
         ("rewrite_context", context_avg),
         ("rewrite_output",  output_avg)],
        key=lambda x: x[1],
    )
    return worst[0]


def build_graph():
    graph = StateGraph(GraphState)

    graph.add_node("intake",          intake_node)
    graph.add_node("classify",        classify_node)
    graph.add_node("structure",       structure_node)
    graph.add_node("evaluate",        evaluate_node)
    graph.add_node("rewrite_content", rewrite_content_node)
    graph.add_node("rewrite_context", rewrite_context_node)
    graph.add_node("rewrite_output",  rewrite_output_node)
    graph.add_node("validate",        validator_node)
    graph.add_node("report",          report_node)

    graph.add_edge(START,    "intake")
    graph.add_edge("intake", "classify")

    graph.add_conditional_edges("classify", route_after_classify, {
        "structure": "structure",
        "evaluate":  "evaluate",
    })

    graph.add_edge("structure", "evaluate")

    graph.add_conditional_edges("evaluate", route_after_eval, {
        "validate":        "validate",
        "rewrite_content": "rewrite_content",
        "rewrite_context": "rewrite_context",
        "rewrite_output":  "rewrite_output",
    })

    # All three rewriters loop back to evaluate
    graph.add_edge("rewrite_content", "evaluate")
    graph.add_edge("rewrite_context", "evaluate")
    graph.add_edge("rewrite_output",  "evaluate")

    graph.add_edge("validate", "report")
    graph.add_edge("report",   END)

    return graph.compile()


promptgrade_graph = build_graph()
