import axios from "axios";
import type { AgentProgressEvent, AnalyticsResult, Domain, EvaluationListResponse, EvaluationResult } from "../types";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export async function evaluatePrompt(prompt: string, domain: Domain): Promise<EvaluationResult> {
  const response = await api.post<EvaluationResult>("/api/evaluate", { prompt, domain });
  return response.data;
}

export async function getEvaluations(domain?: Domain | "", limit = 20, offset = 0): Promise<EvaluationListResponse> {
  const response = await api.get<EvaluationListResponse>("/api/evaluations", {
    params: { domain: domain || undefined, limit, offset },
  });
  return response.data;
}

export async function getEvaluation(id: string): Promise<EvaluationResult> {
  const response = await api.get<EvaluationResult>(`/api/evaluations/${id}`);
  return response.data;
}

export async function getAnalytics(): Promise<AnalyticsResult> {
  const response = await api.get<AnalyticsResult>("/api/analytics");
  return response.data;
}

export function subscribeToAgentProgress(
  evaluationId: string,
  onEvent: (event: AgentProgressEvent) => void,
  onDone?: () => void,
): () => void {
  const source = new EventSource(`${BASE_URL}/api/evaluate/${evaluationId}/status`);
  source.onmessage = (message) => {
    const event = JSON.parse(message.data) as AgentProgressEvent;
    onEvent(event);
    if (event.status === "done") {
      onDone?.();
      source.close();
    }
  };
  source.onerror = () => source.close();
  return () => source.close();
}
