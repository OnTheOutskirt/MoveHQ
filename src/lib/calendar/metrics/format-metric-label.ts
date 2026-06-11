import { roleQuantityLabel } from "@/lib/terminology/labels";
import type { TerminologySettings } from "@/lib/terminology/types";
import type { ResolvedMetricDisplay } from "./resolve";

/** Compact line text for secondary (and non-capacity) day-card metrics. */
export function formatDayCardMetricLine(
  metric: ResolvedMetricDisplay,
  terms: TerminologySettings,
): string {
  const { displayType, category, remaining, booked, capacity } = metric;

  if (displayType === "booked_available") {
    return `${booked} / ${capacity}`;
  }

  if (displayType === "remaining") {
    if (category.dataKey === "skippers") {
      return roleQuantityLabel(terms, "skipper", remaining);
    }
    if (category.dataKey === "drivers") {
      return roleQuantityLabel(terms, "driver", remaining);
    }
    if (category.dataKey === "extra_cab_trucks") {
      return `${remaining} ${category.shortLabel ?? "EC"}`;
    }
    if (category.dataKey === "f150s") {
      return `${remaining} ${category.shortLabel ?? "F-150"}`;
    }
    const base = metric.slot.customLabel?.trim() || `${category.name} Left`;
    return `${remaining} ${base}`;
  }

  if (displayType === "booked_only") {
    return `${booked} ${category.name} Booked`;
  }

  return `${remaining}`;
}
