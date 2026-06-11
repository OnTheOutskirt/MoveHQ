/** Links calendar metrics to values on `CalendarDayData` (mock / future dispatch). */
export type CalendarResourceDataKey =
  | "movers"
  | "trucks"
  | "skippers"
  | "drivers"
  | "extra_cab_trucks"
  | "f150s";

export type ResourceCategoryKind = "people" | "vehicles" | "equipment" | "crews" | "other";

export type ResourceTrackingMethod = "daily_count" | "individual";

/** How daily numbers are stored for this category. */
export type ResourceValueKind = "capacity_pair" | "remaining_only";

export type CalendarMetricDisplayType =
  | "booked_available"
  | "remaining"
  | "booked_only";

export type ResourceCategory = {
  id: string;
  name: string;
  kind: ResourceCategoryKind;
  dataKey: CalendarResourceDataKey;
  valueKind: ResourceValueKind;
  trackingMethod: ResourceTrackingMethod;
  /** Short label on day card when not using custom label (e.g. Trucks). */
  shortLabel?: string;
};

export type CalendarDayMetricSlot = {
  id: string;
  resourceCategoryId: string;
  displayType: CalendarMetricDisplayType;
  /** Optional override — e.g. "Skippers Left" */
  customLabel?: string;
};

export type CalendarDayCardMetricsConfig = {
  primary: CalendarDayMetricSlot[];
  secondary: CalendarDayMetricSlot[];
};

export type LocationCalendarMetricsOverride = {
  useCompanyDefault: boolean;
  metrics: CalendarDayCardMetricsConfig;
};

export type WorkspaceCalendarConfig = {
  resourceCategories: ResourceCategory[];
  companyDefaults: CalendarDayCardMetricsConfig;
  locationOverrides: Record<string, LocationCalendarMetricsOverride>;
};

export const MAX_PRIMARY_CALENDAR_METRICS = 3;
export const MAX_SECONDARY_CALENDAR_METRICS = 8;
