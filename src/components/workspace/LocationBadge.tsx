"use client";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { cn } from "@/lib/utils";

type LocationBadgeProps = {
  locationId: string;
  className?: string;
};

/** Square location pill — only shown when the company has multiple branches. */
export function LocationBadge({ locationId, className }: LocationBadgeProps) {
  const { getLocationById, hasMultipleLocations } = useWorkspace();
  if (!hasMultipleLocations) return null;

  const location = getLocationById(locationId);
  if (!location) return null;

  const label = location.shortName?.trim() || location.name;

  return (
    <span
      className={cn(
        "inline-flex min-w-[2rem] items-center justify-center rounded-sm border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm",
        className,
      )}
      title={location.name}
    >
      {label}
    </span>
  );
}
