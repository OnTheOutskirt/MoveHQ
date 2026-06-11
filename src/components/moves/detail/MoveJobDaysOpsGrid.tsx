"use client";

import { MoveJobDayOpsCard } from "@/components/moves/detail/MoveJobDayOpsCard";
import { useMoveJobDayDispatchMap } from "@/components/moves/detail/useMoveJobDayDispatchMap";
import { getSortedJobDays } from "@/lib/moves/job-day-form";
import type { MoveRecord } from "@/lib/moves/types";
import Link from "next/link";

type MoveJobDaysOpsGridProps = {
  move: MoveRecord;
};

export function MoveJobDaysOpsGrid({ move }: MoveJobDaysOpsGridProps) {
  const days = getSortedJobDays(move);
  const dispatchByDay = useMoveJobDayDispatchMap(move);

  if (days.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500">
        No job days yet. Add them on the Move Plan tab before dispatch.
      </div>
    );
  }

  /** Column-major layout: up to 3 cards per column — row count matches days when ≤3. */
  const rowCount = days.length <= 3 ? days.length : 3;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-1">
        <div
          className="inline-grid grid-flow-col auto-cols-[17.5rem] items-start gap-3"
          style={{ gridTemplateRows: `repeat(${rowCount}, auto)` }}
        >
          {days.map((day, i) => (
            <MoveJobDayOpsCard
              key={day.id}
              move={move}
              day={day}
              index={i}
              dispatch={
                dispatchByDay.get(day.id) ?? {
                  assignment: {
                    skipperId: null,
                    driverIds: [],
                    moverIds: [],
                    truckIds: [],
                    dispatchNotes: "",
                    jobNote: "",
                  },
                  crewLine: null,
                  truckLine: null,
                  crewFromDispatch: false,
                  trucksFromDispatch: false,
                }
              }
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Trucks and crew marked{" "}
        <span className="font-medium text-brand-700">dispatch</span> come from the dispatch board.
        Assign on{" "}
        <Link href="/operations/dispatch" className="font-medium text-brand-700 hover:underline">
          Operations → Dispatch
        </Link>
        .
      </p>
    </div>
  );
}
