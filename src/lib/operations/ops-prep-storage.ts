const STORAGE_KEY_V1 = "jm-ops-prep-tasks-done-v1";
const STORAGE_KEY = "jm-ops-prep-completions-v2";

export type OpsPrepCompletion = {
  completedAt: string;
  actualCost?: number;
};

type CompletionMap = Record<string, OpsPrepCompletion>;

function readRaw(): CompletionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CompletionMap;
      if (parsed && typeof parsed === "object") return parsed;
    }
    const legacy = localStorage.getItem(STORAGE_KEY_V1);
    if (legacy) {
      const ids = JSON.parse(legacy) as string[];
      if (Array.isArray(ids)) {
        const migrated: CompletionMap = {};
        const now = new Date().toISOString();
        for (const id of ids) migrated[id] = { completedAt: now };
        writeRaw(migrated);
        localStorage.removeItem(STORAGE_KEY_V1);
        return migrated;
      }
    }
  } catch {
    /* ignore */
  }
  return {};
}

function writeRaw(map: CompletionMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

const listeners = new Set<() => void>();

export function subscribeOpsPrepDone(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function readOpsPrepCompletions(): CompletionMap {
  return readRaw();
}

export function readOpsPrepDoneIds(): Set<string> {
  return new Set(Object.keys(readRaw()));
}

export function readOpsPrepCompletion(taskId: string): OpsPrepCompletion | undefined {
  return readRaw()[taskId];
}

export function isOpsPrepTaskDone(taskId: string): boolean {
  return taskId in readRaw();
}

export function readOpsPrepActualCost(taskId: string): number | undefined {
  return readRaw()[taskId]?.actualCost;
}

export function setOpsPrepTaskDone(
  taskId: string,
  done: boolean,
  completion?: Pick<OpsPrepCompletion, "actualCost">,
): void {
  const next = { ...readRaw() };
  if (done) {
    next[taskId] = {
      completedAt: new Date().toISOString(),
      actualCost:
        completion?.actualCost != null && completion.actualCost >= 0
          ? Math.round(completion.actualCost * 100) / 100
          : next[taskId]?.actualCost,
    };
  } else {
    delete next[taskId];
  }
  writeRaw(next);
  notify();
}

export function countOpenOpsPrepTasks(taskIds: string[]): number {
  const done = readOpsPrepDoneIds();
  return taskIds.filter((id) => !done.has(id)).length;
}

/** Sum recorded hotel actual costs for a move from completed lodging prep tasks. */
export function sumLodgingActualCostsForMove(moveId: string): number {
  const prefix = `${moveId}:hotel:`;
  return Object.entries(readRaw()).reduce((sum, [taskId, completion]) => {
    if (!taskId.startsWith(prefix)) return sum;
    return sum + (completion.actualCost ?? 0);
  }, 0);
}
