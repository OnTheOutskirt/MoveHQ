const STORAGE_KEY = "jm-ops-prep-tasks-done-v1";

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function writeSet(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

const listeners = new Set<() => void>();

export function subscribeOpsPrepDone(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function readOpsPrepDoneIds(): Set<string> {
  return readSet();
}

export function isOpsPrepTaskDone(taskId: string): boolean {
  return readSet().has(taskId);
}

export function setOpsPrepTaskDone(taskId: string, done: boolean): void {
  const next = readSet();
  if (done) next.add(taskId);
  else next.delete(taskId);
  writeSet(next);
  notify();
}

export function countOpenOpsPrepTasks(taskIds: string[]): number {
  const done = readSet();
  return taskIds.filter((id) => !done.has(id)).length;
}
