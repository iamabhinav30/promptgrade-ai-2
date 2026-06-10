from typing import List, TypedDict


class GraphState(TypedDict):
    session_id: str
    original_prompt: str
    domain: str
    current_prompt: str
    retries: int
    best_score: float
    score: float
    dimensions: List[dict]
    failures: List[str]
    recommendations: List[str]
    iterations: List[dict]
    rewritten_prompt: str
    improvement_pct: float
    diff: dict
    final_prompt: str
    report_summary: str
    evaluation_id: str
