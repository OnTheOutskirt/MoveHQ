import type { WalkthroughMode } from "./types";

export type WalkthroughTimeWindow = {
  start: string;
  end: string;
};

export type WalkthroughDaySchedule = {
  enabled: boolean;
  windows: WalkthroughTimeWindow[];
};

export type WalkthroughModeAvailability = {
  weekly: Record<number, WalkthroughDaySchedule>;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  slotIntervalMinutes: number;
};

export type WalkthroughTimeOffEntry = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
};

export type WalkthroughAvailabilitySettings = {
  assigneeKey: string;
  inPerson: WalkthroughModeAvailability;
  virtual: WalkthroughModeAvailability;
  timeOff: WalkthroughTimeOffEntry[];
  updatedAt: string;
};

const STORAGE_KEY = "jm-walkthrough-availability-v1";

type Store = Record<string, WalkthroughAvailabilitySettings>;

/** @deprecated Legacy per-day interval — migrated to mode-level on load. */
type LegacyWalkthroughDaySchedule = WalkthroughDaySchedule & {
  slotIntervalMinutes?: number;
};

export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const WEEKDAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const SLOT_INTERVAL_OPTIONS = [30, 45, 60, 90] as const;

function weekdaySchedule(
  enabled: boolean,
  windows: WalkthroughTimeWindow[] = [{ start: "09:00", end: "17:00" }],
): WalkthroughDaySchedule {
  return { enabled, windows };
}

function buildWeekly(
  enabledDays: number[],
  windows: WalkthroughTimeWindow[] = [{ start: "09:00", end: "17:00" }],
): Record<number, WalkthroughDaySchedule> {
  const weekly: Record<number, WalkthroughDaySchedule> = {};
  for (let day = 0; day <= 6; day++) {
    weekly[day] = weekdaySchedule(enabledDays.includes(day), windows);
  }
  return weekly;
}

function modeAvailability(
  enabledDays: number[],
  windows: WalkthroughTimeWindow[],
  slotIntervalMinutes: number,
  bufferBeforeMinutes: number,
  bufferAfterMinutes: number,
): WalkthroughModeAvailability {
  return {
    weekly: buildWeekly(enabledDays, windows),
    bufferBeforeMinutes,
    bufferAfterMinutes,
    slotIntervalMinutes,
  };
}

export function defaultWalkthroughAvailability(
  assigneeKey: string,
): WalkthroughAvailabilitySettings {
  return {
    assigneeKey,
    inPerson: modeAvailability(
      [1, 2, 3, 4, 5],
      [{ start: "09:00", end: "17:00" }],
      60,
      15,
      15,
    ),
    virtual: modeAvailability(
      [1, 2, 3, 4, 5, 6],
      [{ start: "10:00", end: "19:00" }],
      30,
      10,
      10,
    ),
    timeOff: [],
    updatedAt: new Date().toISOString(),
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

function normalizeDaySchedule(raw: unknown, fallback: WalkthroughDaySchedule): WalkthroughDaySchedule {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Partial<LegacyWalkthroughDaySchedule>;
  const windows =
    Array.isArray(r.windows) && r.windows.length > 0
      ? r.windows
          .filter((w) => w && typeof w.start === "string" && typeof w.end === "string")
          .map((w) => ({ start: w.start, end: w.end }))
      : fallback.windows;
  return {
    enabled: typeof r.enabled === "boolean" ? r.enabled : fallback.enabled,
    windows: windows.length > 0 ? windows : fallback.windows,
  };
}

function legacySlotIntervalFromWeekly(
  weekly: Record<number, WalkthroughDaySchedule>,
  rawWeekly: Record<number, unknown> | undefined,
  fallback: number,
): number {
  if (!rawWeekly) return fallback;
  for (let day = 0; day <= 6; day++) {
    const raw = rawWeekly[day] as LegacyWalkthroughDaySchedule | undefined;
    if (raw?.slotIntervalMinutes && raw.slotIntervalMinutes > 0) {
      return raw.slotIntervalMinutes;
    }
  }
  return fallback;
}

function normalizeModeAvailability(
  raw: unknown,
  fallback: WalkthroughModeAvailability,
): WalkthroughModeAvailability {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Partial<WalkthroughModeAvailability> & {
    weekly?: Record<number, unknown>;
  };
  const weekly: Record<number, WalkthroughDaySchedule> = { ...fallback.weekly };
  if (r.weekly && typeof r.weekly === "object") {
    for (let day = 0; day <= 6; day++) {
      weekly[day] = normalizeDaySchedule(
        r.weekly[day],
        fallback.weekly[day] ?? weekdaySchedule(false),
      );
    }
  }
  const slotIntervalMinutes =
    typeof r.slotIntervalMinutes === "number" && r.slotIntervalMinutes > 0
      ? r.slotIntervalMinutes
      : legacySlotIntervalFromWeekly(weekly, r.weekly, fallback.slotIntervalMinutes);
  return {
    weekly,
    bufferBeforeMinutes:
      typeof r.bufferBeforeMinutes === "number" ? r.bufferBeforeMinutes : fallback.bufferBeforeMinutes,
    bufferAfterMinutes:
      typeof r.bufferAfterMinutes === "number" ? r.bufferAfterMinutes : fallback.bufferAfterMinutes,
    slotIntervalMinutes,
  };
}

export function normalizeWalkthroughAvailability(
  raw: Partial<WalkthroughAvailabilitySettings> | undefined,
  assigneeKey: string,
): WalkthroughAvailabilitySettings {
  const fallback = defaultWalkthroughAvailability(assigneeKey);
  if (!raw) return fallback;
  return {
    assigneeKey,
    inPerson: normalizeModeAvailability(raw.inPerson, fallback.inPerson),
    virtual: normalizeModeAvailability(raw.virtual, fallback.virtual),
    timeOff: Array.isArray(raw.timeOff)
      ? raw.timeOff.filter(
          (e) =>
            e &&
            typeof e.id === "string" &&
            typeof e.label === "string" &&
            typeof e.startDate === "string" &&
            typeof e.endDate === "string",
        )
      : [],
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : fallback.updatedAt,
  };
}

export function readWalkthroughAvailability(assigneeKey: string): WalkthroughAvailabilitySettings {
  const stored = readStore()[assigneeKey];
  return normalizeWalkthroughAvailability(stored, assigneeKey);
}

export function writeWalkthroughAvailability(settings: WalkthroughAvailabilitySettings): void {
  const store = readStore();
  store[settings.assigneeKey] = { ...settings, updatedAt: new Date().toISOString() };
  writeStore(store);
}

export function modeAvailabilityFromSettings(
  settings: WalkthroughAvailabilitySettings,
  mode: WalkthroughMode,
): WalkthroughModeAvailability {
  return mode === "virtual" ? settings.virtual : settings.inPerson;
}

export function isDateBlocked(
  settings: WalkthroughAvailabilitySettings,
  dateKey: string,
): boolean {
  return settings.timeOff.some(
    (entry) => dateKey >= entry.startDate && dateKey <= entry.endDate,
  );
}

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatSlotLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  if (minutes === 0) return `${h12}:00 ${period}`;
  return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function generateSlotsFromDaySchedule(
  schedule: WalkthroughDaySchedule,
  slotIntervalMinutes: number,
): string[] {
  if (!schedule.enabled) return [];
  const slotMinutes: number[] = [];
  const seen = new Set<number>();

  for (const window of schedule.windows) {
    const start = parseTimeToMinutes(window.start);
    const end = parseTimeToMinutes(window.end);
    if (start == null || end == null || end <= start) continue;

    for (
      let cursor = start;
      cursor + slotIntervalMinutes <= end;
      cursor += slotIntervalMinutes
    ) {
      if (!seen.has(cursor)) {
        seen.add(cursor);
        slotMinutes.push(cursor);
      }
    }
  }

  return slotMinutes.sort((a, b) => a - b).map(formatSlotLabel);
}

export function generateSlotsForDate(
  settings: WalkthroughAvailabilitySettings,
  mode: WalkthroughMode,
  dateKey: string,
): string[] {
  if (isDateBlocked(settings, dateKey)) return [];
  const dayOfWeek = new Date(`${dateKey}T12:00:00`).getDay();
  const modeSettings = modeAvailabilityFromSettings(settings, mode);
  const daySchedule = modeSettings.weekly[dayOfWeek];
  if (!daySchedule?.enabled) return [];
  return generateSlotsFromDaySchedule(daySchedule, modeSettings.slotIntervalMinutes);
}

export function createTimeOffEntry(
  label: string,
  startDate: string,
  endDate: string,
): WalkthroughTimeOffEntry {
  return {
    id: `wto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    label: label.trim() || "Time off",
    startDate,
    endDate: endDate < startDate ? startDate : endDate,
  };
}
