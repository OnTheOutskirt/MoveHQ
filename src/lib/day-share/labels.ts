import type { DayShareFraction, DaySharePeriod, DayShareSettings, DayShareSlot } from "./types";
import { defaultDayShareSettings } from "./settings-defaults";

export function periodCode(period: DaySharePeriod): string {
  return period === "morning" ? "M" : "A";
}

export function fractionCode(duration: Exclude<DayShareFraction, "long">): string {
  if (duration === "short") return "s";
  if (duration === "brief") return "b";
  return "m";
}

/** Compact code: Ms, Ab, etc. */
export function slotTypeCode(period: DaySharePeriod, duration: Exclude<DayShareFraction, "long">): string {
  return `${periodCode(period)}${fractionCode(duration)}`;
}

/** Sheet-style label, e.g. (1)3Ms */
export function formatSlotCode(slot: DayShareSlot): string {
  return `(${slot.count})${slot.crewSize}${slotTypeCode(slot.period, slot.duration)}`;
}

export function formatSlotList(slots: DayShareSlot[]): string {
  return slots.map(formatSlotCode).join(" · ");
}

export function expandSlotPillLabels(slots: DayShareSlot[]): string[] {
  const labels: string[] = [];
  for (const slot of slots) {
    for (let i = 0; i < slot.count; i++) {
      labels.push(formatSlotCode({ ...slot, count: 1 }));
    }
  }
  return labels;
}

export function fractionLabel(
  fraction: DayShareFraction,
  settings: DayShareSettings = defaultDayShareSettings(),
): string {
  return settings.fractionLabels[fraction];
}

export function periodLabel(
  period: DaySharePeriod,
  settings: DayShareSettings = defaultDayShareSettings(),
): string {
  return settings.periodLabels[period];
}

/** Human-readable slot, e.g. "Need · 3-person · Morning · Short (½ day)" */
export function formatSlotReadable(
  slot: DayShareSlot,
  settings: DayShareSettings = defaultDayShareSettings(),
): string {
  const dur = fractionLabel(slot.duration, settings);
  const per = periodLabel(slot.period, settings);
  const crew = `${slot.crewSize}-person`;
  const count = slot.count > 1 ? `${slot.count}× ` : "";
  return `${settings.slotVerb} · ${count}${crew} · ${per} · ${dur}`;
}

/** Tooltip on hover, e.g. "Need 3-man - Morning - Short (½ day)" */
export function formatSlotHoverFromCode(
  code: string,
  settings: DayShareSettings = defaultDayShareSettings(),
): string | null {
  const m = code.match(/^\((\d+)\)(\d+)([MA])([bsm])$/i);
  if (!m) return null;
  const crewSize = Number(m[2]);
  const period = m[3]!.toUpperCase() === "M" ? "morning" : "afternoon";
  const duration = ({ b: "brief", s: "short", m: "medium" } as const)[m[4]!.toLowerCase() as "b" | "s" | "m"];
  return `${settings.slotVerb} ${crewSize}-man - ${periodLabel(period, settings)} - ${fractionLabel(duration, settings)}`;
}

export function formatSlotReadableFromCode(
  code: string,
  settings: DayShareSettings = defaultDayShareSettings(),
): string | null {
  const m = code.match(/^\((\d+)\)(\d+)([MA])([bsm])$/i);
  if (!m) return null;
  const slot: DayShareSlot = {
    count: Number(m[1]),
    crewSize: Number(m[2]),
    period: m[3]!.toUpperCase() === "M" ? "morning" : "afternoon",
    duration: ({ b: "brief", s: "short", m: "medium" } as const)[m[4]!.toLowerCase() as "b" | "s" | "m"],
  };
  return formatSlotReadable(slot, settings);
}
