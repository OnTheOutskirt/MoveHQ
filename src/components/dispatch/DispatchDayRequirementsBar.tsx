"use client";

import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type ReqStatProps = {
  label: string;
  filled: number;
  needed: number;
  short: number;
};

function ReqStat({ label, filled, needed, short }: ReqStatProps) {
  const shortfall = short > 0;
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-center",
        shortfall ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-lg font-semibold tabular-nums leading-tight",
          shortfall ? "text-amber-900" : "text-slate-900",
        )}
      >
        {filled}/{needed}
      </p>
    </div>
  );
}

export function DispatchDayRequirementsBar() {
  const { dayRequirements } = useDispatch();
  const { plural } = useTerminology();

  if (dayRequirements.jobCount === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Day totals · {dayRequirements.jobCount} job
          {dayRequirements.jobCount === 1 ? "" : "s"}
        </p>
        {dayRequirements.hasShortfall ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
            <AlertTriangle className="h-3 w-3" />
            Assignments incomplete
          </span>
        ) : (
          <span className="text-[10px] font-medium text-emerald-700">All slots filled</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ReqStat
          label="Crew"
          filled={dayRequirements.crewFilled}
          needed={dayRequirements.crewNeeded}
          short={dayRequirements.shortCrew}
        />
        <ReqStat
          label={plural("skipper")}
          filled={dayRequirements.skippersFilled}
          needed={dayRequirements.skippersNeeded}
          short={dayRequirements.shortSkippers}
        />
        <ReqStat
          label={plural("driver")}
          filled={dayRequirements.driversFilled}
          needed={dayRequirements.driversNeeded}
          short={dayRequirements.shortDrivers}
        />
        <ReqStat
          label="Trucks"
          filled={dayRequirements.trucksFilled}
          needed={dayRequirements.trucksNeeded}
          short={dayRequirements.shortTrucks}
        />
      </div>
    </div>
  );
}
