import {
  TESTER_FEEDBACK_KINDS,
  type NewTesterFeedback,
  type TesterFeedback,
  type TesterFeedbackStatus,
} from "@/lib/planning/tester-feedback";
import type { TesterFeedbackStorageMode } from "@/lib/planning/tester-feedback-server";

export type TesterFeedbackListResponse = {
  items: TesterFeedback[];
  storage: TesterFeedbackStorageMode;
};

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) return body.error;
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

export async function fetchTesterFeedback(): Promise<TesterFeedbackListResponse> {
  const response = await fetch("/api/tester-feedback", { cache: "no-store" });
  if (!response.ok) throw new Error(await parseErrorMessage(response));
  return response.json() as Promise<TesterFeedbackListResponse>;
}

export async function createTesterFeedback(
  input: NewTesterFeedback,
): Promise<TesterFeedback> {
  const response = await fetch("/api/tester-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await parseErrorMessage(response));
  const body = (await response.json()) as { item: TesterFeedback };
  return body.item;
}

export async function patchTesterFeedbackStatus(
  id: string,
  status: TesterFeedbackStatus,
): Promise<TesterFeedback> {
  const response = await fetch(`/api/tester-feedback/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(await parseErrorMessage(response));
  const body = (await response.json()) as { item: TesterFeedback };
  return body.item;
}

export async function deleteTesterFeedback(id: string): Promise<void> {
  const response = await fetch(`/api/tester-feedback/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(await parseErrorMessage(response));
}

export function isNewTesterFeedback(value: unknown): value is NewTesterFeedback {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<NewTesterFeedback>;
  return (
    typeof input.description === "string" &&
    input.description.trim().length > 0 &&
    typeof input.pagePath === "string" &&
    input.pagePath.length > 0 &&
    typeof input.reporterId === "string" &&
    typeof input.reporterName === "string" &&
    typeof input.kind === "string" &&
    TESTER_FEEDBACK_KINDS.includes(input.kind as (typeof TESTER_FEEDBACK_KINDS)[number])
  );
}
