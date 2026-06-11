from typing import List, TypedDict


class GraphState(TypedDict):
    session_id: str
    original_prompt: str
    domain: str
    current_prompt: str
    structured_prompt: str
    reformat_prompt: bool
    domain_hint: str
    prompt_category: str
    previous_score: float
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
