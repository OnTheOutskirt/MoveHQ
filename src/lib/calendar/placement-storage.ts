import type { CalendarPlacementStore } from "./placement-types";

export const CALENDAR_PLACEMENT_STORAGE_KEY = "jm-calendar-placements";

export function defaultCalendarPlacementStore(): CalendarPlacementStore {
  return { version: 1, placements: [] };
}

export function loadCalendarPlacementStore(): CalendarPlacementStore {
  if (typeof window === "undefined") return defaultCalendarPlacementStore();
  try {
    const raw = localStorage.getItem(CALENDAR_PLACEMENT_STORAGE_KEY);
    if (!raw) return defaultCalendarPlacementStore();
    const parsed = JSON.parse(raw) as Partial<CalendarPlacementStore>;
    if (parsed.version !== 1 || !Array.isArray(parsed.placements)) {
      return defaultCalendarPlacementStore();
    }
    return {
      version: 1,
      placements: parsed.placements.filter(
        (p) =>
          p &&
          typeof p.id === "string" &&
          typeof p.moveId === "string" &&
          typeof p.date === "string" &&
          (p.kind === "hold" || p.kind === "waitlist") &&
          typeof p.movers === "number" &&
          typeof p.trucks === "number",
      ),
    };
  } catch {
    return defaultCalendarPlacementStore();
  }
}

export function persistCalendarPlacementStore(store: CalendarPlacementStore): void {
  localStorage.setItem(CALENDAR_PLACEMENT_STORAGE_KEY, JSON.stringify(store));
}

export function placementStoreFingerprint(store: CalendarPlacementStore): string {
  return JSON.stringify(store.placements.map((p) => [p.id, p.date, p.kind, p.movers, p.trucks]));
}

export function generatePlacementId(): string {
  return `cal-pl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
