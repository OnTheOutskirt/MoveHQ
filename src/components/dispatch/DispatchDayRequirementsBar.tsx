"use client";

import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type InlineStatProps = {
  label: string;
  filled: number;
  needed: number;
  short: number;
};

function InlineStat({
  label,
  filled,
  needed,
  short,
  ready,
}: InlineStatProps & { ready?: boolean }) {
  const warn = short > 0;
  return (
    <span
      className={cn(
        "tabular-nums",
        warn ? "font-semibold text-amber-800" : ready ? "text-emerald-800" : "text-slate-600",
      )}
      title={warn ? `${needed - filled} short` : undefined}
    >
      {label}{" "}
      <span
        className={cn(
          warn ? "text-amber-900" : ready ? "text-emerald-900" : "text-slate-800",
        )}
      >
        {filled}/{needed}
      </span>
    </span>
  );
}

function Dot({ ready }: { ready?: boolean }) {
  return (
    <span className={ready ? "text-emerald-300" : "text-slate-300"} aria-hidden>
      ·
    </span>
  );
}

export function DispatchDayRequirementsBar() {
  const { day, dayRequirements } = useDispatch();
  const { plural } = useTerminology();
  const totalJobs = day.jobs.length;

  if (totalJobs === 0) return null;

  const ready = !dayRequirements.hasShortfall;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-2.5 py-1.5 text-[11px]",
        ready
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200/80 bg-amber-50/50",
      )}
    >
      <span
        className={cn(
          "shrink-0 font-medium",
          ready ? "text-emerald-900" : "text-slate-700",
        )}
      >
        {totalJobs} job{totalJobs === 1 ? "" : "s"}
      </span>
      <Dot ready={ready} />
      <InlineStat
        ready={ready}
        label="Crew"
        filled={dayRequirements.crewFilled}
        needed={dayRequirements.crewNeeded}
        short={dayRequirements.shortCrew}
      />
      <Dot ready={ready} />
      <InlineStat
        ready={ready}
        label={plural("skipper")}
        filled={dayRequirements.skippersFilled}
        needed={dayRequirements.skippersNeeded}
        short={dayRequirements.shortSkippers}
      />
      <Dot ready={ready} />
      <InlineStat
        ready={ready}
        label={plural("driver")}
        filled={dayRequirements.driversFilled}
        needed={dayRequirements.driversNeeded}
        short={dayRequirements.shortDrivers}
      />
      <Dot ready={ready} />
      <InlineStat
        ready={ready}
        label="Trucks"
        filled={dayRequirements.trucksFilled}
        needed={dayRequirements.trucksNeeded}
        short={dayRequirements.shortTrucks}
      />
      <Dot ready={ready} />
      {dayRequirements.hasShortfall ? (
        <span className="inline-flex shrink-0 items-center gap-0.5 font-medium text-amber-800">
          <AlertTriangle className="h-3 w-3" />
          Incomplete
        </span>
      ) : (
        <span className="inline-flex shrink-0 items-center gap-0.5 font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Ready
        </span>
      )}
    </div>
  );
}
