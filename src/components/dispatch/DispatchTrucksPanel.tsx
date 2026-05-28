"use client";

import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { useFleet } from "@/components/providers/FleetProvider";
import { formatTruckInline } from "@/lib/operations/fleet";
import type { DispatchTruck } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";
import { GripVertical, Truck } from "lucide-react";

export const DISPATCH_TRUCK_DRAG_TYPE = "application/x-dispatch-truck";

export function truckDragPayload(truckId: string): string {
  return JSON.stringify({ truckId });
}

export function parseTruckDragPayload(data: string): string | null {
  try {
    const parsed = JSON.parse(data) as { truckId?: string };
    return parsed.truckId ?? null;
  } catch {
    return null;
  }
}

type DispatchTrucksPanelProps = {
  embedded?: boolean;
};

export function DispatchTrucksPanel({ embedded }: DispatchTrucksPanelProps = {}) {
  const { dateKey, assignedTruckIds } = useDispatch();
  const { activeTrucksForDispatch } = useFleet();
  const fleet = activeTrucksForDispatch(dateKey);

  const available = fleet.filter((truck) => !assignedTruckIds.has(truck.id));

  return (
    <div>
      <h2 className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 shrink-0" />
          Trucks
        </span>
        <span className="shrink-0 text-[10px] font-medium normal-case tabular-nums text-slate-500">
          {available.length} available
        </span>
      </h2>
      <ul className="space-y-1">
        {available.map((truck) => (
          <TruckChip key={truck.id} truck={truck} />
        ))}
        {available.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 px-2 py-2 text-center text-[11px] text-slate-400">
            All trucks assigned
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function TruckChip({ truck }: { truck: DispatchTruck }) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DISPATCH_TRUCK_DRAG_TYPE, truckDragPayload(truck.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "flex cursor-grab items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm",
        "active:cursor-grabbing hover:border-brand-200",
      )}
    >
      <GripVertical className="h-3 w-3 shrink-0 text-slate-300" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-900">
        {formatTruckInline(truck)}
      </span>
    </li>
  );
}
