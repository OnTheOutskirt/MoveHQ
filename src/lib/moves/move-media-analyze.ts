import type { MoveMediaItem } from "./move-media";

export type MoveMediaAnalyzeStatus = "pending" | "analyzed";

export type MoveMediaWithAnalyze = MoveMediaItem & {
  analyzeStatus: MoveMediaAnalyzeStatus;
  analyzedAt?: string;
  aiSummary?: string;
};

const STORAGE_KEY = "jm-move-media-analyze-v1";

function readOverrides(): Record<string, MoveMediaAnalyzeStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MoveMediaAnalyzeStatus>) : {};
  } catch {
    return {};
  }
}

function writeOverrides(map: Record<string, MoveMediaAnalyzeStatus>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Demo: even ids analyzed, odd pending unless overridden. */
export function enrichMediaWithAnalyzeStatus(items: MoveMediaItem[]): MoveMediaWithAnalyze[] {
  const overrides = readOverrides();
  return items.map((item, index) => {
    const status =
      overrides[item.id] ??
      (index % 2 === 0 ? "analyzed" : "pending");
    return {
      ...item,
      analyzeStatus: status,
      analyzedAt: status === "analyzed" ? item.capturedAt : undefined,
      aiSummary:
        status === "analyzed"
          ? "Scope reviewed — no material quote change suggested."
          : undefined,
    };
  });
}

export function markMediaAnalyzed(mediaId: string): void {
  const overrides = readOverrides();
  overrides[mediaId] = "analyzed";
  writeOverrides(overrides);
}

export function markMediaPending(mediaId: string): void {
  const overrides = readOverrides();
  overrides[mediaId] = "pending";
  writeOverrides(overrides);
}

export function partitionMediaByAnalyze(items: MoveMediaWithAnalyze[]) {
  return {
    pending: items.filter((i) => i.analyzeStatus === "pending"),
    analyzed: items.filter((i) => i.analyzeStatus === "analyzed"),
  };
}
