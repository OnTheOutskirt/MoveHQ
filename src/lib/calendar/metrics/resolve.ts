import {
  effectiveMoversBooked,
  effectiveTrucksBooked,
  moverHoldLabel,
} from "@/lib/calendar/capacity";
import { moverCapacityLabel } from "@/lib/calendar/capacity";
import type { CalendarDayData } from "@/lib/calendar/types";
import type { TerminologySettings } from "@/lib/terminology/types";
import { getResourceDaySnapshot } from "./resource-snapshot";
import type {
  CalendarDayCardMetricsConfig,
  CalendarDayMetricSlot,
  CalendarMetricDisplayType,
  ResourceCategory,
  WorkspaceCalendarConfig,
} from "./types";

export type ResolvedMetricDisplay = {
  slot: CalendarDayMetricSlot;
  category: ResourceCategory;
  displayType: CalendarMetricDisplayType;
  /** Primary large metrics */
  large?: boolean;
  label: string;
  booked: number;
  capacity: number;
  onHold: number;
  remaining: number;
  depleted: boolean;
  holdPillText?: string | null;
};

export function resolveMetricsForLocation(
  calendar: WorkspaceCalendarConfig,
  locationId: string,
): CalendarDayCardMetricsConfig {
  const override = calendar.locationOverrides[locationId];
  if (override && !override.useCompanyDefault) {
    return override.metrics;
  }
  return calendar.companyDefaults;
}

export function getCategoryById(
  categories: ResourceCategory[],
  id: string,
): ResourceCategory | undefined {
  return categories.find((c) => c.id === id);
}

function defaultLabel(
  category: ResourceCategory,
  displayType: CalendarMetricDisplayType,
  terms: TerminologySettings,
): string {
  if (displayType === "remaining") {
    return `${category.name} Left`;
  }
  if (category.dataKey === "movers") {
    return moverCapacityLabel(terms);
  }
  return category.shortLabel ?? category.name;
}

function holdPillForCategory(
  category: ResourceCategory,
  snapshot: ReturnType<typeof getResourceDaySnapshot>,
  terms: TerminologySettings,
): string | null {
  if (snapshot.onHold <= 0) return null;
  if (category.dataKey === "movers") {
    return moverHoldLabel(snapshot.onHold, terms);
  }
  if (category.dataKey === "trucks") {
    return snapshot.onHold === 1 ? "1 truck on hold" : `${snapshot.onHold} trucks on hold`;
  }
  return `${snapshot.onHold} on hold`;
}

export function resolveMetricDisplay(
  day: CalendarDayData,
  slot: CalendarDayMetricSlot,
  category: ResourceCategory,
  terms: TerminologySettings,
  options?: { large?: boolean },
): ResolvedMetricDisplay {
  const snapshot = getResourceDaySnapshot(day, category.dataKey);
  const label = slot.customLabel?.trim() || defaultLabel(category, slot.displayType, terms);

  const bookedDisplay =
    category.dataKey === "movers"
      ? effectiveMoversBooked(day)
      : category.dataKey === "trucks"
        ? effectiveTrucksBooked(day)
        : snapshot.booked;

  const depleted =
    slot.displayType === "remaining"
      ? snapshot.remaining === 0
      : slot.displayType === "booked_only"
        ? bookedDisplay === 0
        : bookedDisplay >= snapshot.capacity && snapshot.capacity > 0;

  return {
    slot,
    category,
    displayType: slot.displayType,
    large: options?.large,
    label,
    booked: bookedDisplay,
    capacity: snapshot.capacity,
    onHold: snapshot.onHold,
    remaining: snapshot.remaining,
    depleted,
    holdPillText:
      slot.displayType === "booked_available" && category.valueKind === "capacity_pair"
        ? holdPillForCategory(category, snapshot, terms)
        : null,
  };
}

export function resolveDayCardMetrics(
  day: CalendarDayData,
  calendar: WorkspaceCalendarConfig,
  locationId: string,
  terms: TerminologySettings,
): { primary: ResolvedMetricDisplay[]; secondary: ResolvedMetricDisplay[] } {
  const config = resolveMetricsForLocation(calendar, locationId);
  const categories = calendar.resourceCategories;

  const primary = config.primary
    .map((slot) => {
      const category = getCategoryById(categories, slot.resourceCategoryId);
      if (!category) return null;
      return resolveMetricDisplay(day, slot, category, terms, { large: true });
    })
    .filter((m): m is ResolvedMetricDisplay => m != null);

  const secondary = config.secondary
    .map((slot) => {
      const category = getCategoryById(categories, slot.resourceCategoryId);
      if (!category) return null;
      return resolveMetricDisplay(day, slot, category, terms);
    })
    .filter((m): m is ResolvedMetricDisplay => m != null);

  return { primary, secondary };
}

/** Warning labels driven by configured remaining + capacity metrics. */
export function getConfiguredDayWarningLabels(
  day: CalendarDayData,
  calendar: WorkspaceCalendarConfig,
  locationId: string,
  terms: TerminologySettings,
): string[] {
  const { primary, secondary } = resolveDayCardMetrics(day, calendar, locationId, terms);
  const labels: string[] = [];

  for (const m of [...primary, ...secondary]) {
    if (m.displayType === "booked_available" && m.capacity > 0 && m.booked > m.capacity) {
      labels.push(`${m.label} overbooked`);
    }
    if (m.displayType === "remaining" && m.remaining === 0) {
      const name = m.label.replace(/\s+left$/i, "").toLowerCase();
      labels.push(`No ${name} left`);
    }
  }

  return labels;
}
