import type {
  StaffCalendarEvent,
  StaffCalendarEventPatch,
  StaffCalendarEventSource,
} from "./types";

export type StaffCalendarLocalEdits = {
  patches: Record<string, StaffCalendarEventPatch>;
  removedIds: string[];
  added: StaffCalendarEvent[];
};

export function emptyStaffCalendarEdits(): StaffCalendarLocalEdits {
  return { patches: {}, removedIds: [], added: [] };
}

export function applyStaffCalendarEdits(
  events: StaffCalendarEvent[],
  edits: StaffCalendarLocalEdits,
): StaffCalendarEvent[] {
  const removed = new Set(edits.removedIds);
  function withPatch(event: StaffCalendarEvent): StaffCalendarEvent {
    const patch = edits.patches[event.id];
    return patch ? { ...event, ...patch } : event;
  }

  const merged = events
    .filter((event) => !removed.has(event.id))
    .map(withPatch);
  const added = edits.added.filter((event) => !removed.has(event.id)).map(withPatch);
  return [...merged, ...added];
}

export function resolveStaffCalendarEventSource(
  event: StaffCalendarEvent,
): StaffCalendarEventSource {
  if (event.source) return event.source;
  if (event.moveId) return "walkthrough";
  if (event.outlookSynced) return "outlook";
  return "local";
}

export function staffCalendarEventIsEditable(event: StaffCalendarEvent): boolean {
  const source = resolveStaffCalendarEventSource(event);
  return source !== "walkthrough";
}

export function newLocalStaffCalendarEvent(
  partial: Omit<StaffCalendarEvent, "id" | "outlookSynced" | "outlookEventId"> & {
    id?: string;
  },
): StaffCalendarEvent {
  return {
    ...partial,
    id: partial.id ?? `local-ev-${Date.now()}`,
    source: "local",
    outlookSynced: false,
  };
}
