import { DEFAULT_TERMINOLOGY } from "@/lib/terminology/defaults";
import { rolePlural, roleSingular } from "@/lib/terminology/labels";
import type { TerminologySettings } from "@/lib/terminology/types";
import type { CalendarDayData, DayCapacityStatus } from "./types";

export type CapacityTone = "ok" | "warn" | "full";

/** Booked + on hold; may exceed capacity (overages are shown as-is). */
export function effectiveMoversBooked(day: CalendarDayData): number {
  return day.moversBooked + day.moversOnHold;
}

export function effectiveTrucksBooked(day: CalendarDayData): number {
  return day.trucksBooked + day.trucksOnHold;
}

export function getCapacityTone(booked: number, capacity: number): CapacityTone {
  if (capacity <= 0) return "full";
  if (booked >= capacity) return "full";
  const ratio = booked / capacity;
  if (ratio >= 0.83 || booked >= capacity - 1) return "warn";
  return "ok";
}

export function getDayCapacityStatus(day: CalendarDayData): DayCapacityStatus {
  if (day.isClosed) return "closed";
  if (day.manuallyMarkedBooked) return "critical";

  const moversTone = getCapacityTone(effectiveMoversBooked(day), day.moversCapacity);
  const trucksTone = getCapacityTone(effectiveTrucksBooked(day), day.trucksCapacity);

  if (moversTone === "full" || trucksTone === "full") return "critical";
  if (moversTone === "warn" || trucksTone === "warn") return "warning";
  return "healthy";
}

export function totalFtaSlots(ftas: CalendarDayData["ftas"]): number {
  return ftas.reduce((sum, slot) => sum + slot.count, 0);
}

/** Brief labels for the day-cell warning icon tooltip (movers/trucks over capacity, depleted crew). */
export function getDayWarningLabels(
  day: CalendarDayData,
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): string[] {
  const labels: string[] = [];
  const movers = effectiveMoversBooked(day);
  const trucks = effectiveTrucksBooked(day);
  if (movers > day.moversCapacity) {
    labels.push(`${rolePlural(terms, "mover")} overbooked`);
  }
  if (trucks > day.trucksCapacity) {
    labels.push("Trucks overbooked");
  }
  if (day.skippersLeft === 0) {
    labels.push(`No ${rolePlural(terms, "skipper").toLowerCase()} left`);
  }
  if (day.driversLeft === 0) {
    labels.push(`No ${rolePlural(terms, "driver").toLowerCase()} left`);
  }

  return labels;
}

export function moverHoldLabel(
  hold: number,
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): string | null {
  if (hold === 0) return null;
  const word =
    hold === 1
      ? roleSingular(terms, "mover").toLowerCase()
      : rolePlural(terms, "mover").toLowerCase();
  return `${hold} ${word} on hold`;
}

export function moverCapacityLabel(terms: TerminologySettings = DEFAULT_TERMINOLOGY): string {
  return rolePlural(terms, "mover");
}

export const capacityToneText: Record<CapacityTone, string> = {
  ok: "text-slate-800",
  warn: "text-amber-700 font-semibold",
  full: "text-red-700 font-bold",
};

export const capacityToneTextMuted: Record<CapacityTone, string> = {
  ok: "text-slate-300",
  warn: "text-slate-300",
  full: "text-slate-300",
};

export const dayStatusCellClass: Record<DayCapacityStatus, string> = {
  healthy: "bg-white hover:bg-slate-50/80",
  warning: "bg-amber-50/90 hover:bg-amber-50",
  critical: "bg-red-50/80 hover:bg-red-50",
  closed: "bg-slate-100/90 hover:bg-slate-100",
};

export const dayStatusBorderClass: Record<DayCapacityStatus, string> = {
  healthy: "border-slate-200",
  warning: "border-amber-200",
  critical: "border-red-200",
  closed: "border-slate-300",
};
