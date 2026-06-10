export type Domain = "frontend" | "backend" | "devops" | "testing" | "database" | "system_design";

export type DimensionName =
  | "clarity"
  | "completeness"
  | "context"
  | "constraints"
  | "output_definition"
  | "production_readiness";

export interface DimensionScore {
  name: DimensionName;
  score: number;
  failureReason?: string | null;
}

export interface Iteration {
  iterationNumber: number;
  score: number;
  dimensions: DimensionScore[];
  rewrittenPrompt: string;
}

export interface EvaluationResult {
  evaluationId: string;
  originalPrompt: string;
  finalPrompt: string;
  domain: Domain;
  originalScore: number;
  finalScore: number;
  improvementPct: number;
  iterationCount: number;
  iterations: Iteration[];
  diff: { added: string[]; removed: string[] };
  createdAt: string;
}

export interface AnalyticsResult {
  avgScore: number;
  totalEvaluations?: number;
  avgImprovement?: number;
  scoreByDomain: Array<{ domain: Domain; avgScore: number; count: number }>;
  topFailures: Array<{ failureReason: string; count: number }>;
  trendByDay: Array<{ day: string; avgScore: number; count: number }>;
  governanceLeaderboard: Array<{
    rank: number;
    name: string;
    avgScore: number;
    totalPrompts: number;
    avgImprovement: number;
  }>;
}

export interface AgentProgressEvent {
  agent: string;
  status: "running" | "complete" | "pending" | "done" | "heartbeat";
  score?: number | null;
  iteration?: number | null;
  improvementPct?: number | null;
}

export interface EvaluationListResponse {
  evaluations: EvaluationResult[];
  total: number;
}
