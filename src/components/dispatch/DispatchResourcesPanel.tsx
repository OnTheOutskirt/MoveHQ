"use client";

import { DispatchCrewPanel } from "@/components/dispatch/DispatchCrewPanel";
import { DispatchTrucksPanel } from "@/components/dispatch/DispatchTrucksPanel";

export function DispatchResourcesPanel() {
  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:w-56 xl:w-60">
      <div className="shrink-0 border-b border-slate-100 px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Resources
        </h2>
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
