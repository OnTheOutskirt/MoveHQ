export const TIME_CATEGORIES = ["move", "drive", "extra", "break"] as const;
export type TimeCategory = (typeof TIME_CATEGORIES)[number];

export const TIME_CATEGORY_LABELS: Record<TimeCategory, string> = {
  move: "Move time",
  drive: "Drive time",
  extra: "Extra time",
  break: "Break",
};

export type TimeClockSlot = {
  clockIn: string | null;
  clockOut: string | null;
};

export type JobFieldState = {
  times: Record<TimeCategory, TimeClockSlot>;
  startSignature: { signedAt: string; signedBy: string } | null;
  endSignature: { signedAt: string; signedBy: string } | null;
};

const STORAGE_KEY = "jm-crew-job-field-v1";

type Store = Record<string, JobFieldState>;

function emptyState(): JobFieldState {
  return {
    times: {
      move: { clockIn: null, clockOut: null },
      drive: { clockIn: null, clockOut: null },
      extra: { clockIn: null, clockOut: null },
      break: { clockIn: null, clockOut: null },
    },
    startSignature: null,
    endSignature: null,
  };
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function readJobFieldState(jobId: string): JobFieldState {
  return readStore()[jobId] ?? emptyState();
}

export function writeJobFieldState(jobId: string, state: JobFieldState): void {
  const store = readStore();
  store[jobId] = state;
  writeStore(store);
}

export function formatElapsedMs(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function slotElapsed(slot: TimeClockSlot, now = Date.now()): string {
  if (!slot.clockIn) return "—";
  const start = new Date(slot.clockIn).getTime();
  const end = slot.clockOut ? new Date(slot.clockOut).getTime() : now;
  return formatElapsedMs(Math.max(0, end - start));
}

export function jobProgressLabel(state: JobFieldState): "Not started" | "On site" | "Complete" {
  if (state.endSignature) return "Complete";
  if (state.startSignature) return "On site";
  return "Not started";
}
