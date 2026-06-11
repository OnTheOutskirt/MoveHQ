"use client";

import { dispatchScheduleTicks } from "@/lib/dispatch/schedule-grid";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type DispatchScheduleGridLinesProps = {
  className?: string;
};

export function DispatchScheduleGridLines({ className }: DispatchScheduleGridLinesProps) {
  const ticks = useMemo(() => dispatchScheduleTicks(), []);

  return (
    <div className={cn("pointer-events-none absolute inset-x-1 top-0 bottom-0", className)}>
      {ticks.map((tick) => (
        <div
          key={tick.percent}
          className={cn(
            "absolute top-0 bottom-0 border-l",
            tick.kind === "hour" ? "border-slate-200" : "border-dashed border-slate-100",
          )}
          style={{ left: `${tick.percent}%` }}
        />
      ))}
    </div>
  );
}
