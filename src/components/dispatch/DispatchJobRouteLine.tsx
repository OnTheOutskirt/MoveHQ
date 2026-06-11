"use client";

import { dispatchJobRouteCities } from "@/lib/dispatch/job-card-display";
import type { DispatchJob } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";
import { ArrowRight, MapPin } from "lucide-react";

type DispatchJobRouteLineProps = {
  job: DispatchJob;
  className?: string;
  /** Tighter line for timeline blocks */
  compact?: boolean;
};

export function DispatchJobRouteLine({
  job,
  className,
  compact = false,
}: DispatchJobRouteLineProps) {
  const { originCity, destinationCity } = dispatchJobRouteCities(job);
  if (!originCity && !destinationCity) return null;

  return (
    <p
      className={cn(
        "flex min-w-0 items-center gap-1 leading-tight text-slate-600",
        compact ? "text-[10px]" : "text-[11px]",
        className,
      )}
    >
      <MapPin
        className={cn("shrink-0 text-slate-400", compact ? "h-3 w-3" : "h-3.5 w-3.5")}
        aria-hidden
      />
      <span className="min-w-0 truncate font-medium">{originCity ?? "—"}</span>
      <ArrowRight
        className={cn("shrink-0 text-slate-400", compact ? "h-3 w-3" : "h-3.5 w-3.5")}
        aria-hidden
      />
      <span className="min-w-0 truncate font-medium">{destinationCity ?? "—"}</span>
    </p>
  );
}
