export type DispatchPublishRecord = {
  publishedAt: string;
  jobCount: number;
};

const STORAGE_KEY = "jm-dispatch-publish-v1";

export type DispatchPublishStore = Record<string, DispatchPublishRecord>;

export function readDispatchPublishStore(): DispatchPublishStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as DispatchPublishStore;
  } catch {
    return {};
  }
}

export function writeDispatchPublishStore(store: DispatchPublishStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getPublishRecord(
  store: DispatchPublishStore,
  dateKey: string,
): DispatchPublishRecord | null {
  return store[dateKey] ?? null;
}

export function setPublishRecord(
  store: DispatchPublishStore,
  dateKey: string,
  jobCount: number,
): DispatchPublishStore {
  return {
    ...store,
    [dateKey]: { publishedAt: new Date().toISOString(), jobCount },
  };
}
