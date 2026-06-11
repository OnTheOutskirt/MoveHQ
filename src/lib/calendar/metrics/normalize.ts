import { defaultWorkspaceCalendarConfig, JONAH_RESOURCE_CATEGORIES } from "./defaults";
import { normalizeMetricDisplayType } from "./display-types";
import {
  MAX_PRIMARY_CALENDAR_METRICS,
  MAX_SECONDARY_CALENDAR_METRICS,
  type CalendarDayCardMetricsConfig,
  type CalendarDayMetricSlot,
  type CalendarMetricDisplayType,
  type LocationCalendarMetricsOverride,
  type ResourceCategory,
  type ResourceCategoryKind,
  type ResourceTrackingMethod,
  type ResourceValueKind,
  type WorkspaceCalendarConfig,
  type CalendarResourceDataKey,
} from "./types";


const KINDS: ResourceCategoryKind[] = ["people", "vehicles", "equipment", "crews", "other"];
const DATA_KEYS: CalendarResourceDataKey[] = [
  "movers",
  "trucks",
  "skippers",
  "drivers",
  "extra_cab_trucks",
  "f150s",
];
const VALUE_KINDS: ResourceValueKind[] = ["capacity_pair", "remaining_only"];
const TRACKING: ResourceTrackingMethod[] = ["daily_count", "individual"];

function normalizeCategory(raw: unknown): ResourceCategory | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Partial<ResourceCategory>;
  if (!c.id || !c.name) return null;
  const dataKey = DATA_KEYS.includes(c.dataKey as CalendarResourceDataKey)
    ? (c.dataKey as CalendarResourceDataKey)
    : "movers";
  const fallback = JONAH_RESOURCE_CATEGORIES.find((j) => j.dataKey === dataKey);
  return {
    id: c.id,
    name: c.name.trim(),
    kind: KINDS.includes(c.kind as ResourceCategoryKind) ? (c.kind as ResourceCategoryKind) : "people",
    dataKey,
    valueKind: VALUE_KINDS.includes(c.valueKind as ResourceValueKind)
      ? (c.valueKind as ResourceValueKind)
      : (fallback?.valueKind ?? "remaining_only"),
    trackingMethod: TRACKING.includes(c.trackingMethod as ResourceTrackingMethod)
      ? (c.trackingMethod as ResourceTrackingMethod)
      : "daily_count",
    shortLabel: typeof c.shortLabel === "string" ? c.shortLabel : fallback?.shortLabel,
  };
}

function normalizeSlot(raw: unknown, isPrimary: boolean): CalendarDayMetricSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<CalendarDayMetricSlot>;
  if (!s.id || !s.resourceCategoryId) return null;
  const displayType = normalizeMetricDisplayType(
    s.displayType as CalendarMetricDisplayType | undefined,
    isPrimary,
  );
  return {
    id: s.id,
    resourceCategoryId: s.resourceCategoryId,
    displayType,
    customLabel: typeof s.customLabel === "string" ? s.customLabel : undefined,
  };
}

function normalizeMetrics(raw: unknown, max: number, isPrimary: boolean): CalendarDayMetricSlot[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((slot) => normalizeSlot(slot, isPrimary))
    .filter((s): s is CalendarDayMetricSlot => s != null)
    .slice(0, max);
}

function normalizeMetricsConfig(raw: unknown): CalendarDayCardMetricsConfig {
  const d = defaultWorkspaceCalendarConfig().companyDefaults;
  if (!raw || typeof raw !== "object") return d;
  const m = raw as Partial<CalendarDayCardMetricsConfig>;
  return {
    primary: normalizeMetrics(m.primary, MAX_PRIMARY_CALENDAR_METRICS, true).length
      ? normalizeMetrics(m.primary, MAX_PRIMARY_CALENDAR_METRICS, true)
      : d.primary,
    secondary: normalizeMetrics(m.secondary, MAX_SECONDARY_CALENDAR_METRICS, false).length
      ? normalizeMetrics(m.secondary, MAX_SECONDARY_CALENDAR_METRICS, false)
      : d.secondary,
  };
}

export function normalizeWorkspaceCalendarConfig(raw: unknown): WorkspaceCalendarConfig {
  const defaults = defaultWorkspaceCalendarConfig();
  if (!raw || typeof raw !== "object") return defaults;
  const c = raw as Partial<WorkspaceCalendarConfig>;
  const categories = Array.isArray(c.resourceCategories)
    ? c.resourceCategories.map(normalizeCategory).filter((x): x is ResourceCategory => x != null)
    : defaults.resourceCategories;

  const locationOverrides: Record<string, LocationCalendarMetricsOverride> = {};
  if (c.locationOverrides && typeof c.locationOverrides === "object") {
    for (const [key, val] of Object.entries(c.locationOverrides)) {
      if (!val || typeof val !== "object") continue;
      const o = val as Partial<LocationCalendarMetricsOverride>;
      locationOverrides[key] = {
        useCompanyDefault: o.useCompanyDefault !== false,
        metrics: normalizeMetricsConfig(o.metrics),
      };
    }
  }

  return {
    resourceCategories: categories.length > 0 ? categories : defaults.resourceCategories,
    companyDefaults: normalizeMetricsConfig(c.companyDefaults),
    locationOverrides,
  };
}
