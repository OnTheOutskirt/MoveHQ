import { toDateKey } from "@/lib/calendar/date-utils";
import { CURRENT_USER } from "@/lib/session/current-user";
import { totalHoursFromCategories, normalizeTimeEntry } from "./time-entry-utils";
import type { TimeEntry } from "./types";

export type OfficeClockPhase = "out" | "in" | "break";

export type OfficeClockState = {
  dateKey: string;
  phase: OfficeClockPhase;
  clockInAt: string | null;
  breakStartedAt: string | null;
  accumulatedBreakMs: number;
  clockOutAt: string | null;
};

function clockStorageKey(userId: string): string {
  return `jm-office-time-clock-v1-${userId}`;
}

function emptyState(dateKey: string): OfficeClockState {
  return {
    dateKey,
    phase: "out",
    clockInAt: null,
    breakStartedAt: null,
    accumulatedBreakMs: 0,
    clockOutAt: null,
  };
}

function normalize(raw: unknown, todayKey: string): OfficeClockState {
  if (!raw || typeof raw !== "object") return emptyState(todayKey);
  const o = raw as Partial<OfficeClockState>;
  if (o.dateKey !== todayKey) return emptyState(todayKey);
  const phase = o.phase === "in" || o.phase === "break" ? o.phase : "out";
  return {
    dateKey: todayKey,
    phase,
    clockInAt: typeof o.clockInAt === "string" ? o.clockInAt : null,
    breakStartedAt: typeof o.breakStartedAt === "string" ? o.breakStartedAt : null,
    accumulatedBreakMs:
      typeof o.accumulatedBreakMs === "number" && o.accumulatedBreakMs >= 0
        ? o.accumulatedBreakMs
        : 0,
    clockOutAt: typeof o.clockOutAt === "string" ? o.clockOutAt : null,
  };
}

type OfficeClockListener = () => void;
const listeners = new Set<OfficeClockListener>();

export function subscribeOfficeClock(listener: OfficeClockListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  listeners.forEach((l) => l());
}

function write(state: OfficeClockState, userId: string = CURRENT_USER.id): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(clockStorageKey(userId), JSON.stringify(state));
  notify();
}

export function readOfficeClock(
  todayKey = toDateKey(new Date()),
  userId: string = CURRENT_USER.id,
): OfficeClockState {
  if (typeof window === "undefined") return emptyState(todayKey);
  try {
    const raw = localStorage.getItem(clockStorageKey(userId));
    if (!raw) return emptyState(todayKey);
    return normalize(JSON.parse(raw), todayKey);
  } catch {
    return emptyState(todayKey);
  }
}

/** Hourly office staff who clock in from the main app (not crew app). */
export function canUseOfficeTimeClock(userId = CURRENT_USER.id): boolean {
  return (
    userId === "user-jonah-morrison" ||
    userId === "user-alex-rivera" ||
    userId === "user-lisa-parker"
  );
}

export function officeClockPersonId(userId: string = CURRENT_USER.id): string {
  if (userId === "user-lisa-parker") return "office-lisa";
  if (userId === "user-alex-rivera") return "office-alex";
  return "office-jonah";
}

export function clockInOffice(
  todayKey = toDateKey(new Date()),
  userId: string = CURRENT_USER.id,
): OfficeClockState {
  const next: OfficeClockState = {
    dateKey: todayKey,
    phase: "in",
    clockInAt: new Date().toISOString(),
    breakStartedAt: null,
    accumulatedBreakMs: 0,
    clockOutAt: null,
  };
  write(next, userId);
  return next;
}

export function startOfficeBreak(
  todayKey = toDateKey(new Date()),
  userId: string = CURRENT_USER.id,
): OfficeClockState {
  const prev = readOfficeClock(todayKey, userId);
  if (prev.phase !== "in" || !prev.clockInAt) return prev;
  const next: OfficeClockState = {
    ...prev,
    phase: "break",
    breakStartedAt: new Date().toISOString(),
  };
  write(next, userId);
  return next;
}

export function endOfficeBreak(
  todayKey = toDateKey(new Date()),
  userId: string = CURRENT_USER.id,
): OfficeClockState {
  const prev = readOfficeClock(todayKey, userId);
  if (prev.phase !== "break" || !prev.breakStartedAt) return prev;
  const extra =
    Date.now() - new Date(prev.breakStartedAt).getTime() + prev.accumulatedBreakMs;
  const next: OfficeClockState = {
    ...prev,
    phase: "in",
    breakStartedAt: null,
    accumulatedBreakMs: extra,
  };
  write(next, userId);
  return next;
}

export function clockOutOffice(
  todayKey = toDateKey(new Date()),
  userId: string = CURRENT_USER.id,
): OfficeClockState {
  const prev = readOfficeClock(todayKey, userId);
  if (prev.phase === "out" || !prev.clockInAt) return prev;
  let breakMs = prev.accumulatedBreakMs;
  if (prev.phase === "break" && prev.breakStartedAt) {
    breakMs += Date.now() - new Date(prev.breakStartedAt).getTime();
  }
  const next: OfficeClockState = {
    ...prev,
    phase: "out",
    breakStartedAt: null,
    accumulatedBreakMs: breakMs,
    clockOutAt: new Date().toISOString(),
  };
  write(next, userId);
  appendCompletedPunch(next, userId);
  return next;
}

export type OfficeClockPunch = {
  dateKey: string;
  personId: string;
  clockInAt: string;
  clockOutAt: string;
  officeMs: number;
  breakMs: number;
};

function punchesStorageKey(userId: string): string {
  return `jm-office-time-punches-v1-${userId}`;
}

function appendCompletedPunch(state: OfficeClockState, userId: string = CURRENT_USER.id): void {
  if (!state.clockInAt || !state.clockOutAt) return;
  const start = new Date(state.clockInAt).getTime();
  const end = new Date(state.clockOutAt).getTime();
  const totalMs = Math.max(0, end - start);
  const breakMs = state.accumulatedBreakMs;
  const officeMs = Math.max(0, totalMs - breakMs);
  const punch: OfficeClockPunch = {
    dateKey: state.dateKey,
    personId: officeClockPersonId(userId),
    clockInAt: state.clockInAt,
    clockOutAt: state.clockOutAt,
    officeMs,
    breakMs,
  };
  const key = punchesStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    const list: OfficeClockPunch[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((p) => p.dateKey !== punch.dateKey);
    localStorage.setItem(key, JSON.stringify([punch, ...filtered]));
  } catch {
    localStorage.setItem(key, JSON.stringify([punch]));
  }
}

export function readTodayOfficePunch(
  todayKey = toDateKey(new Date()),
  userId: string = CURRENT_USER.id,
): OfficeClockPunch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(punchesStorageKey(userId));
    if (!raw) return null;
    const list = JSON.parse(raw) as OfficeClockPunch[];
    return list.find((p) => p.dateKey === todayKey) ?? null;
  } catch {
    return null;
  }
}

export function readOfficeClockPunches(userId: string = CURRENT_USER.id): OfficeClockPunch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(punchesStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as OfficeClockPunch[];
  } catch {
    return [];
  }
}

const OFFICE_CLOCK_PEOPLE: Record<
  string,
  { personName: string; roleLabel: string; hourlyRate: number }
> = {
  "office-alex": {
    personName: "Alex Rivera",
    roleLabel: "Sales · hourly",
    hourlyRate: 24,
  },
  "office-lisa": {
    personName: "Lisa Parker",
    roleLabel: "Operations · hourly",
    hourlyRate: 28,
  },
};

function msToQuarterHours(ms: number): number {
  return Math.round((ms / 3_600_000) * 4) / 4;
}

export function officePunchToTimeEntry(punch: OfficeClockPunch): TimeEntry {
  const person = OFFICE_CLOCK_PEOPLE[punch.personId] ?? {
    personName: "Office staff",
    roleLabel: "Office · hourly",
    hourlyRate: null,
  };
  const categories = {
    move: 0,
    drive: 0,
    extra: 0,
    office: msToQuarterHours(punch.officeMs),
    break: msToQuarterHours(punch.breakMs),
  };
  return normalizeTimeEntry({
    id: `te-${punch.personId}-${punch.dateKey}-office-clock`,
    personId: punch.personId,
    personName: person.personName,
    workerType: "office",
    roleLabel: person.roleLabel,
    date: punch.dateKey,
    jobRef: null,
    categories,
    hours: totalHoursFromCategories(categories),
    hourlyRate: person.hourlyRate,
    status: "pending",
    source: "office_clock",
    notes: "Clocked via office time clock",
    clockInAt: punch.clockInAt,
    clockOutAt: punch.clockOutAt,
  });
}

export function officeActiveClockToTimeEntry(
  state: OfficeClockState,
  now = Date.now(),
): TimeEntry | null {
  if (state.phase === "out" || !state.clockInAt) return null;

  const personId = officeClockPersonId();
  const person = OFFICE_CLOCK_PEOPLE[personId] ?? {
    personName: "Office staff",
    roleLabel: "Office · hourly",
    hourlyRate: null,
  };

  const officeMs = activeOfficeElapsedMs(state, now);
  let breakMs = state.accumulatedBreakMs;
  if (state.phase === "break" && state.breakStartedAt) {
    breakMs += now - new Date(state.breakStartedAt).getTime();
  }

  const categories = {
    move: 0,
    drive: 0,
    extra: 0,
    office: msToQuarterHours(officeMs),
    break: msToQuarterHours(breakMs),
  };

  return normalizeTimeEntry({
    id: `te-${personId}-${state.dateKey}-office-clock-active`,
    personId,
    personName: person.personName,
    workerType: "office",
    roleLabel: person.roleLabel,
    date: state.dateKey,
    jobRef: null,
    categories,
    hours: totalHoursFromCategories(categories),
    hourlyRate: person.hourlyRate,
    status: "pending",
    source: "office_clock",
    notes:
      state.phase === "break"
        ? "On break — office time clock (live)"
        : "On the clock — office time clock (live)",
    clockInAt: state.clockInAt,
    clockOutAt: null,
    isLiveClock: true,
  });
}

function officeClockEntryKey(personId: string, dateKey: string): string {
  return `${personId}:${dateKey}`;
}

/** Replace demo office rows with office clock punches and any live clock session. */
export function mergeOfficeClockIntoEntries(entries: TimeEntry[]): TimeEntry[] {
  const punches = readOfficeClockPunches();
  const activeEntry = officeActiveClockToTimeEntry(readOfficeClock());

  const clockKeys = new Set(punches.map((p) => officeClockEntryKey(p.personId, p.dateKey)));
  if (activeEntry) {
    clockKeys.add(officeClockEntryKey(activeEntry.personId, activeEntry.date));
  }

  const withoutOverlapping = entries.filter((entry) => {
    const key = officeClockEntryKey(entry.personId, entry.date);
    if (clockKeys.has(key) && entry.workerType === "office") return false;
    if (entry.source === "office_clock" || entry.isLiveClock) return false;
    return true;
  });

  const clockEntries = [
    ...punches.map(officePunchToTimeEntry),
    ...(activeEntry ? [activeEntry] : []),
  ];

  return [...withoutOverlapping, ...clockEntries];
}

/** @deprecated Use mergeOfficeClockIntoEntries */
export const mergeOfficeClockPunchesIntoEntries = mergeOfficeClockIntoEntries;

export function formatOfficeClockDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Elapsed office time (excluding break) while still on the clock. */
export function activeOfficeElapsedMs(state: OfficeClockState, now = Date.now()): number {
  if (!state.clockInAt || state.phase === "out") {
    const punch = readTodayOfficePunch(state.dateKey);
    if (punch) return punch.officeMs;
    return 0;
  }
  const start = new Date(state.clockInAt).getTime();
  let breakMs = state.accumulatedBreakMs;
  if (state.phase === "break" && state.breakStartedAt) {
    breakMs += now - new Date(state.breakStartedAt).getTime();
  }
  return Math.max(0, now - start - breakMs);
}

export function activeBreakElapsedMs(state: OfficeClockState, now = Date.now()): number {
  if (state.phase !== "break" || !state.breakStartedAt) return 0;
  return now - new Date(state.breakStartedAt).getTime();
}

export function officeClockStatusLabel(state: OfficeClockState, now = Date.now()): string {
  if (state.phase === "break") {
    return `On break · ${formatOfficeClockDuration(activeBreakElapsedMs(state, now))}`;
  }
  if (state.phase === "in") {
    return `On the clock · ${formatOfficeClockDuration(activeOfficeElapsedMs(state, now))}`;
  }
  const punch = readTodayOfficePunch(state.dateKey);
  if (punch) {
    return `Clocked out · ${formatOfficeClockDuration(punch.officeMs)} today`;
  }
  return "Not clocked in";
}
