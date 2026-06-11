/** One accent color per calendar feature; variants are derived automatically. */
export type CalendarColorPalette = {
  healthy: string;
  warning: string;
  critical: string;
  closed: string;
  holds: string;
  waitlist: string;
  fta: string;
  crewWarning: string;
  notes: string;
  bookedMark: string;
  bookingRate: string;
  today: string;
};

export const CALENDAR_PALETTE_FIELDS: {
  key: keyof CalendarColorPalette;
  label: string;
  hint: string;
}[] = [
  { key: "healthy", label: "Healthy day", hint: "Open days with normal capacity" },
  { key: "warning", label: "Almost full day", hint: "Day cell when nearing capacity" },
  { key: "critical", label: "Full / booked day", hint: "Day cell when at capacity" },
  { key: "closed", label: "Closed day", hint: "Holidays and scheduled days off" },
  { key: "holds", label: "Holds", hint: "Hold pills, sidebar table, and lists" },
  { key: "waitlist", label: "Waitlist", hint: "Waitlist pills and sidebar table" },
  { key: "fta", label: "Open slots", hint: "Partial-day open slot pills on cells and sidebar" },
  { key: "crewWarning", label: "Crew warning", hint: "Crew shortage indicator on cells" },
  { key: "notes", label: "Day notes", hint: "Notes icon on month cells" },
  { key: "bookedMark", label: "Mark day booked", hint: "Icon when day is marked booked" },
  {
    key: "bookingRate",
    label: "Booking rate",
    hint: "Month cell top row (50%+ booking rate) and sales pipeline in day sidebar",
  },
  { key: "today", label: "Today", hint: "Today badge and cell ring" },
];

export function defaultCalendarPalette(): CalendarColorPalette {
  return {
    healthy: "#cbd5e1",
    warning: "#f59e0b",
    critical: "#ef4444",
    closed: "#64748b",
    holds: "#3b82f6",
    waitlist: "#8b5cf6",
    fta: "#10b981",
    crewWarning: "#f59e0b",
    notes: "#0ea5e9",
    bookedMark: "#dc2626",
    bookingRate: "#0d9488",
    today: "#2563eb",
  };
}

export function mergeCalendarPalette(
  partial?: Partial<CalendarColorPalette>,
): CalendarColorPalette {
  return { ...defaultCalendarPalette(), ...partial };
}

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function normalizeHex(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (HEX_RE.test(trimmed)) return trimmed;
  return fallback;
}
