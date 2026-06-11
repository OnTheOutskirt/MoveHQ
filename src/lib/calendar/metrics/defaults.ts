import type {
  CalendarDayCardMetricsConfig,
  ResourceCategory,
  WorkspaceCalendarConfig,
} from "./types";

export const JONAH_RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: "res-movers",
    name: "Movers",
    kind: "people",
    dataKey: "movers",
    valueKind: "capacity_pair",
    trackingMethod: "daily_count",
    shortLabel: "Movers",
  },
  {
    id: "res-trucks",
    name: "Standard Trucks",
    kind: "vehicles",
    dataKey: "trucks",
    valueKind: "capacity_pair",
    trackingMethod: "individual",
    shortLabel: "Trucks",
  },
  {
    id: "res-skippers",
    name: "Skippers",
    kind: "people",
    dataKey: "skippers",
    valueKind: "remaining_only",
    trackingMethod: "daily_count",
    shortLabel: "Skippers",
  },
  {
    id: "res-drivers",
    name: "Drivers",
    kind: "people",
    dataKey: "drivers",
    valueKind: "remaining_only",
    trackingMethod: "daily_count",
    shortLabel: "Drivers",
  },
  {
    id: "res-extra-cab",
    name: "Extra Cab Trucks",
    kind: "vehicles",
    dataKey: "extra_cab_trucks",
    valueKind: "remaining_only",
    trackingMethod: "individual",
    shortLabel: "EC",
  },
  {
    id: "res-f150",
    name: "F-150s",
    kind: "vehicles",
    dataKey: "f150s",
    valueKind: "remaining_only",
    trackingMethod: "individual",
    shortLabel: "F-150",
  },
];

export const JONAH_CALENDAR_METRICS_DEFAULTS: CalendarDayCardMetricsConfig = {
  primary: [
    {
      id: "metric-movers-primary",
      resourceCategoryId: "res-movers",
      displayType: "booked_available",
    },
    {
      id: "metric-trucks-primary",
      resourceCategoryId: "res-trucks",
      displayType: "booked_available",
    },
  ],
  secondary: [
    {
      id: "metric-skippers",
      resourceCategoryId: "res-skippers",
      displayType: "remaining",
      customLabel: "Skippers Left",
    },
    {
      id: "metric-drivers",
      resourceCategoryId: "res-drivers",
      displayType: "remaining",
      customLabel: "Drivers Left",
    },
    {
      id: "metric-extra-cab",
      resourceCategoryId: "res-extra-cab",
      displayType: "remaining",
      customLabel: "Extra Cab Trucks Left",
    },
    {
      id: "metric-f150",
      resourceCategoryId: "res-f150",
      displayType: "remaining",
      customLabel: "F-150s Left",
    },
  ],
};

export function defaultWorkspaceCalendarConfig(): WorkspaceCalendarConfig {
  return {
    resourceCategories: [...JONAH_RESOURCE_CATEGORIES],
    companyDefaults: {
      primary: JONAH_CALENDAR_METRICS_DEFAULTS.primary.map((s) => ({ ...s })),
      secondary: JONAH_CALENDAR_METRICS_DEFAULTS.secondary.map((s) => ({ ...s })),
    },
    locationOverrides: {},
  };
}
