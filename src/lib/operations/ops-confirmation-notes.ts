const STORAGE_KEY = "jm-ops-confirmation-call-notes-v1";

type NotesStore = Record<string, string>;

type NotesListener = () => void;

const listeners = new Set<NotesListener>();

export function subscribeOpsConfirmationNotes(listener: NotesListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

function readStore(): NotesStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as NotesStore;
  } catch {
    return {};
  }
}

export function readOpsConfirmationNote(rowId: string): string {
  return readStore()[rowId] ?? "";
}

export function writeOpsConfirmationNote(rowId: string, text: string): void {
  if (typeof window === "undefined") return;
  const store = readStore();
  const trimmed = text.trim();
  if (!trimmed) {
    delete store[rowId];
  } else {
    store[rowId] = trimmed;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  notify();
}
