"use client";

import { DispatchCrewPanel } from "@/components/dispatch/DispatchCrewPanel";
import { DispatchTrucksPanel } from "@/components/dispatch/DispatchTrucksPanel";
import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";

export function DispatchResourcesPanel() {
  const { dayRequirements } = useDispatch();
  const { plural } = useTerminology();

  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:w-56 xl:w-60">
      <div className="shrink-0 border-b border-slate-100 px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Crew & trucks
        </h2>
        {dayRequirements.jobCount > 0 ? (
          <dl
            className={cn(
              "mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]",
              dayRequirements.hasShortfall && "rounded-md border border-amber-200 bg-amber-50/80 p-1.5",
            )}
          >
            <SidebarReq label="Crew" filled={dayRequirements.crewFilled} needed={dayRequirements.crewNeeded} />
            <SidebarReq label={plural("skipper")} filled={dayRequirements.skippersFilled} needed={dayRequirements.skippersNeeded} />
            <SidebarReq label={plural("driver")} filled={dayRequirements.driversFilled} needed={dayRequirements.driversNeeded} />
            <SidebarReq label="Trucks" filled={dayRequirements.trucksFilled} needed={dayRequirements.trucksNeeded} />
          </dl>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        <div className="space-y-4">
          <DispatchCrewPanel embedded />
          <DispatchTrucksPanel embedded />
        </div>
      </div>
    </aside>
  );
}

function SidebarReq({
  label,
  filled,
  needed,
}: {
  label: string;
  filled: number;
  needed: number;
}) {
  const short = filled < needed;
  return (
    <div>
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className={cn("tabular-nums font-semibold", short ? "text-amber-800" : "text-slate-800")}>
        {filled}/{needed}
      </dd>
    </div>
  );
}
