from langgraph.graph import END, START, StateGraph

from agents.evaluate import evaluate_node
from agents.intake import intake_node
from agents.report import report_node
from agents.rewriter import rewriter_node
from agents.structure import structure_node
from agents.validator import validator_node
from graph.state import GraphState


def route_after_eval(state: GraphState) -> str:
    if state["score"] < 0.8 and state["retries"] < 3:
        return "rewrite"
    return "validate"


def build_graph():
    graph = StateGraph(GraphState)
    graph.add_node("intake",    intake_node)
    graph.add_node("structure", structure_node)
    graph.add_node("evaluate",  evaluate_node)
    graph.add_node("rewrite",   rewriter_node)
    graph.add_node("validate",  validator_node)
    graph.add_node("report",    report_node)
    graph.add_edge(START,       "intake")
    graph.add_edge("intake",    "structure")
    graph.add_edge("structure", "evaluate")
    graph.add_conditional_edges("evaluate", route_after_eval)
    graph.add_edge("rewrite",   "evaluate")
    graph.add_edge("validate",  "report")
    graph.add_edge("report",    END)
    return graph.compile()


promptgrade_graph = build_graph()
