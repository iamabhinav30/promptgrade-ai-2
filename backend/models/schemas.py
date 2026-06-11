from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class Domain(str, Enum):
    frontend = "frontend"
    backend = "backend"
    devops = "devops"
    testing = "testing"
    database = "database"
    system_design = "system_design"


class DimensionName(str, Enum):
    clarity = "clarity"
    completeness = "completeness"
    context = "context"
    constraints = "constraints"
    output_definition = "output_definition"
    production_readiness = "production_readiness"


class DimensionScore(BaseModel):
    name: DimensionName
    score: float = Field(ge=0.0, le=1.0)
    failureReason: Optional[str] = Field(default=None, max_length=100)


class Iteration(BaseModel):
    iterationNumber: int
    score: float = Field(ge=0.0, le=1.0)
    dimensions: List[DimensionScore]
    rewrittenPrompt: str


class EvaluationResult(BaseModel):
    evaluationId: str
    originalPrompt: str
    structuredPrompt: str
    finalPrompt: str
    domain: Domain
    originalScore: float = Field(ge=0.0, le=1.0)
    finalScore: float = Field(ge=0.0, le=1.0)
    improvementPct: float
    iterationCount: int
    iterations: List[Iteration]
    diff: dict
    createdAt: str


class EvaluationRequest(BaseModel):
    prompt: str
    domain: Domain


class AnalyticsResult(BaseModel):
    avgScore: float
    scoreByDomain: List[dict]
    topFailures: List[dict]
    trendByDay: List[dict]
    governanceLeaderboard: List[dict]


class AgentProgressEvent(BaseModel):
    agent: str
    status: str
    score: Optional[float] = None
    iteration: Optional[int] = None
    improvementPct: Optional[float] = None
