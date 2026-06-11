import axios from "axios";
import type { AgentProgressEvent, AnalyticsResult, Domain, EvaluationListResponse, EvaluationResult } from "../types";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Streaming evaluate (primary – real-time agent progress) ──────────────────

export class GuardRejectionError extends Error {
  reason: string;
  suggestion: string;
  constructor(message: string, reason: string, suggestion: string) {
    super(message);
    this.name = "GuardRejectionError";
    this.reason = reason;
    this.suggestion = suggestion;
  }
}

async function _readStream(
  response: Response,
  onEvent: (e: AgentProgressEvent) => void,
): Promise<EvaluationResult> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).detail || `HTTP ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: EvaluationResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    // SSE events are separated by double newlines
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6)) as Record<string, unknown>;
        if (data.type === "result") {
          const { type: _t, ...rest } = data;
          result = rest as unknown as EvaluationResult;
        } else if (data.type === "guard_rejected") {
          throw new GuardRejectionError(
            String(data.message || "This doesn't look like an AI prompt."),
            String(data.reason || "not_a_prompt"),
            String(data.suggestion || ""),
          );
        } else {
          onEvent(data as unknown as AgentProgressEvent);
        }
      } catch {
        // ignore malformed lines
      }
    }
  }

  if (!result) throw new Error("No result received from server");
  return result;
}

export async function evaluatePromptStream(
  prompt: string,
  domain: Domain,
  onEvent: (e: AgentProgressEvent) => void,
  reformat = true,
  domainHint = "",
): Promise<EvaluationResult> {
  const response = await fetch(`${BASE_URL}/api/evaluate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, domain, reformat, domain_hint: domainHint }),
  });
  return _readStream(response, onEvent);
}

export async function evaluateFileStream(
  file: File,
  domain: Domain,
  onEvent: (e: AgentProgressEvent) => void,
  reformat = true,
  domainHint = "",
): Promise<EvaluationResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("domain", domain);
  form.append("reformat", String(reformat));
  form.append("domain_hint", domainHint);
  const response = await fetch(`${BASE_URL}/api/evaluate/upload/stream`, {
    method: "POST",
    body: form,
  });
  return _readStream(response, onEvent);
}

// ── Batch file evaluation ─────────────────────────────────────────────────────

export async function evaluateBatch(
  files: File[],
  domain: Domain,
  onFileStart: (index: number) => void,
  onFileComplete: (index: number, result: EvaluationResult) => void,
  onFileError: (index: number, error: string) => void,
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  for (let i = 0; i < files.length; i++) {
    onFileStart(i);
    try {
      const form = new FormData();
      form.append("file", files[i]);
      form.append("domain", domain);
      const response = await axios.post<EvaluationResult>(`${BASE_URL}/api/evaluate/upload`, form);
      results.push(response.data);
      onFileComplete(i, response.data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } }; message?: string })
        ?.response?.data?.detail ?? (e as { message?: string })?.message ?? "Failed";
      onFileError(i, msg);
    }
  }
  return results;
}

// ── REST helpers ──────────────────────────────────────────────────────────────

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
