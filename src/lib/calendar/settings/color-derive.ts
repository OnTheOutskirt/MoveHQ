import type { CalendarColorPalette } from "./color-palette";
import type { CalendarColorTheme } from "./colors";

type Rgb = { r: number; g: number; b: number };

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function parseHex(hex: string): Rgb | null {
  const match = HEX_RE.exec(hex.trim());
  if (!match) return null;
  let h = match[1]!;
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function lighten(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return toHex(mix(rgb, { r: 255, g: 255, b: 255 }, amount));
}

function darken(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return toHex(mix(rgb, { r: 0, g: 0, b: 0 }, amount));
}

function dayCellColors(base: string): { bg: string; border: string; text: string } {
  const rgb = parseHex(base);
  if (!rgb) return { bg: base, border: base, text: "#475569" };

  const light = relativeLuminance(rgb) > 0.82;
  return {
    bg: light ? "#ffffff" : lighten(base, 0.93),
    border: light ? lighten(base, 0.55) : lighten(base, 0.7),
    text: light ? "#475569" : darken(base, 0.38),
  };
}

function pillColors(base: string): { bg: string; text: string; border: string } {
  return {
    bg: lighten(base, 0.82),
    text: darken(base, 0.48),
    border: lighten(base, 0.64),
  };
}

function tableColors(base: string): {
  bg: string;
  text: string;
  border: string;
  headerBg: string;
  rowBg: string;
} {
  const pill = pillColors(base);
  return {
    bg: pill.bg,
    text: pill.text,
    border: pill.border,
    headerBg: lighten(base, 0.8),
    rowBg: lighten(base, 0.9),
  };
}

function iconColors(base: string): { bg: string; text: string } {
  return {
    bg: lighten(base, 0.84),
    text: darken(base, 0.42),
  };
}

function badgeColors(base: string): { bg: string; text: string; ring: string } {
  const rgb = parseHex(base);
  const text = rgb && relativeLuminance(rgb) > 0.55 ? darken(base, 0.65) : "#ffffff";
  return {
    bg: base,
    text,
    ring: lighten(base, 0.22),
  };
}

/** Expand user palette picks into the full theme used by the calendar UI. */
export function expandPaletteToTheme(palette: CalendarColorPalette): CalendarColorTheme {
  const healthy = dayCellColors(palette.healthy);
  const warning = dayCellColors(palette.warning);
  const critical = dayCellColors(palette.critical);
  const closed = dayCellColors(palette.closed);
  const holdsPill = pillColors(palette.holds);
  const holdsTable = tableColors(palette.holds);
  const waitlist = tableColors(palette.waitlist);
  const fta = pillColors(palette.fta);
  const crew = pillColors(palette.crewWarning);
  const notes = iconColors(palette.notes);
  const booked = iconColors(palette.bookedMark);
  const today = badgeColors(palette.today);

  return {
    dayHealthyBg: healthy.bg,
    dayHealthyBorder: healthy.border,
    dayWarningBg: warning.bg,
    dayWarningBorder: warning.border,
    dayCriticalBg: critical.bg,
    dayCriticalBorder: critical.border,
    dayClosedBg: closed.bg,
    dayClosedBorder: closed.border,
    dayClosedText: closed.text,
    dayPastBg: lighten(palette.closed, 0.94),
    capacityOkText: "#1e293b",
    capacityWarnText: darken(palette.warning, 0.45),
    capacityFullText: darken(palette.critical, 0.45),
    holdBg: holdsPill.bg,
    holdText: holdsPill.text,
    holdBorder: holdsPill.border,
    holdHeaderBg: holdsTable.headerBg,
    holdRowBg: holdsTable.rowBg,
    holdBookedText: darken(palette.holds, 0.35),
    waitlistBg: waitlist.bg,
    waitlistText: waitlist.text,
    waitlistBorder: waitlist.border,
    waitlistHeaderBg: waitlist.headerBg,
    waitlistRowBg: waitlist.rowBg,
    ftaBg: fta.bg,
    ftaText: fta.text,
    crewWarningBg: crew.bg,
    crewWarningText: crew.text,
    notesIconBg: notes.bg,
    notesIconText: notes.text,
    bookedMarkBg: booked.bg,
    bookedMarkText: booked.text,
    resourceDepletedText: darken(palette.critical, 0.45),
    resourceMutedText: "#cbd5e1",
    resourceNormalText: "#64748b",
    todayBadgeBg: today.bg,
    todayBadgeText: today.text,
    todayRing: today.ring,
    bookingRateText: darken(palette.bookingRate, 0.38),
  };
}
