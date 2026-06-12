export const TESTER_FEEDBACK_STORAGE_KEY = "jm-tester-feedback-v1";

export const TESTER_FEEDBACK_KINDS = [
  "bug",
  "improvement",
  "question",
  "polish",
  "other",
] as const;

export type TesterFeedbackKind = (typeof TESTER_FEEDBACK_KINDS)[number];

export const TESTER_FEEDBACK_KIND_LABELS: Record<TesterFeedbackKind, string> = {
  bug: "Bug",
  improvement: "Improvement",
  question: "Question / unclear",
  polish: "UI polish",
  other: "Other",
};

export const TESTER_FEEDBACK_STATUSES = [
  "open",
  "planned",
  "done",
  "wont_fix",
] as const;

export type TesterFeedbackStatus = (typeof TESTER_FEEDBACK_STATUSES)[number];

export const TESTER_FEEDBACK_STATUS_LABELS: Record<TesterFeedbackStatus, string> = {
  open: "Open",
  planned: "Planned",
  done: "Done",
  wont_fix: "Won't fix",
};

export type TesterFeedback = {
  id: string;
  kind: TesterFeedbackKind;
  description: string;
  pagePath: string;
  pageTitle?: string;
  reporterId: string;
  reporterName: string;
  status: TesterFeedbackStatus;
  createdAt: string;
  updatedAt: string;
};

export type NewTesterFeedback = Pick<
  TesterFeedback,
  "kind" | "description" | "pagePath" | "pageTitle" | "reporterId" | "reporterName"
>;

export function generateTesterFeedbackId(): string {
  return `tf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadTesterFeedback(): TesterFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TESTER_FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TesterFeedback[];
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.filter((item) => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  } catch {
    return [];
  }
}

export function saveTesterFeedback(items: TesterFeedback[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TESTER_FEEDBACK_STORAGE_KEY, JSON.stringify(items));
}

export function openTesterFeedbackCount(items: TesterFeedback[]): number {
  return items.filter((item) => item.status === "open" || item.status === "planned").length;
}

export function countTesterFeedbackByStatus(
  items: TesterFeedback[],
): Record<TesterFeedbackStatus, number> {
  return {
    open: items.filter((item) => item.status === "open").length,
    planned: items.filter((item) => item.status === "planned").length,
    done: items.filter((item) => item.status === "done").length,
    wont_fix: items.filter((item) => item.status === "wont_fix").length,
  };
}
