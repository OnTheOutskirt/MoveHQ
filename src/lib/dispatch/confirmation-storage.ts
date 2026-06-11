import type { DayBeforeConfirmationStatus } from "./day-before-confirmation";

const STORAGE_KEY = "jm-dispatch-day-before-confirmation-v2";

type ConfirmationStore = Record<string, DayBeforeConfirmationStatus>;

type ConfirmationListener = () => void;

const listeners = new Set<ConfirmationListener>();

/** Re-read overrides when another dispatch surface (card vs sidebar) updates storage. */
export function subscribeConfirmationStore(listener: ConfirmationListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyConfirmationStore() {
  listeners.forEach((listener) => listener());
}

function readStore(): ConfirmationStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ConfirmationStore;
  } catch {
    return {};
  }
}

export function readConfirmationOverride(jobId: string): DayBeforeConfirmationStatus | null {
  return readStore()[jobId] ?? null;
}

export function writeConfirmationOverride(
  jobId: string,
  status: DayBeforeConfirmationStatus | null,
): void {
  if (typeof window === "undefined") return;
  const store = readStore();
  if (status === null) {
    delete store[jobId];
  } else {
    store[jobId] = status;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  notifyConfirmationStore();
}
