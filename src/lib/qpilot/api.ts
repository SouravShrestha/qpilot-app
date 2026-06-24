import type {
  GenerateError,
  GenerateRequest,
  GenerateSuccess,
} from "./types";

const ENV_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export const API_BASE = (ENV_BASE || "https://test-api.qpilot.cbsdev.me").replace(/\/$/, "");

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/v1/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export class QPilotApiError extends Error {
  status: number;
  payload: GenerateError;
  constructor(payload: GenerateError) {
    super(payload.message);
    this.status = payload.status;
    this.payload = payload;
  }
}

export async function generateQuestions(
  body: GenerateRequest,
  keys: { appKey: string; groqKey?: string },
  signal?: AbortSignal,
): Promise<GenerateSuccess> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": keys.appKey,
  };
  if (keys.groqKey) headers["X-LLM-API-Key"] = keys.groqKey;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/v1/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    throw new QPilotApiError({
      success: false,
      status: 0,
      message:
        e instanceof Error && e.name === "AbortError"
          ? "Request was cancelled."
          : "Network error — couldn't reach the QPilot API.",
    });
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }

  if (res.ok && data && (data as GenerateSuccess).success) {
    return data as GenerateSuccess;
  }

  const raw = (data ?? {}) as Partial<GenerateError> & {
    validation_reasoning?: string;
  };

  const friendly: Record<number, string> = {
    400: "Something went wrong. Please try again.",
    401: "API key is invalid or missing. Check your settings.",
    429: "Too many requests. Please try again shortly.",
    500: "Unable to generate questions right now.",
    502: "The AI service is temporarily unavailable. Try again in a moment.",
  };

  let message = raw.message || friendly[res.status] || `Request failed (${res.status}).`;
  if (res.status === 422 && raw.errorCode === "UNSUPPORTED_TOPIC") {
    message = raw.message || "QPilot supports software engineering topics only.";
  } else if (res.status === 422 && raw.errorCode === "TOPIC_TOO_BROAD") {
    message = raw.message || "Please enter a more specific topic.";
  }

  throw new QPilotApiError({
    success: false,
    status: res.status,
    message,
    errorCode: raw.errorCode,
    suggestions: raw.suggestions,
    validation_reasoning: raw.validation_reasoning,
  });
}