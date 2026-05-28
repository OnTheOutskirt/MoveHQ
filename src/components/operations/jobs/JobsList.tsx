"use client";

import { Badge } from "@/components/ui/Badge";
import { jobDayStatusConfig, jobDayStatusLabel } from "@/lib/moves/job-days";
import type { OpsJobDayRow } from "@/lib/operations/ops-jobs";
import { salesMovePath } from "@/lib/navigation/routes";
import { formatMoveDate } from "@/lib/moves/format";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import Link from "next/link";

type JobsListProps = {
  rows: OpsJobDayRow[];
  emptyMessage: string;
  showDateColumn?: boolean;
};

export function JobsList({ rows, emptyMessage, showDateColumn }: JobsListProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <p className="text-sm text-slate-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
      {rows.map((row) => {
        const statusStyle = jobDayStatusConfig[row.status];
        return (
          <li key={row.id}>
            <Link
              href={salesMovePath(row.moveId)}
              className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-slate-50 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{row.customerName}</p>
                  <Badge className={statusStyle.badge}>{jobDayStatusLabel(row.status)}</Badge>
                  <span className="text-xs text-slate-500">{row.dayLabel}</span>
                </div>
                <p className="mt-0.5 flex items-start gap-1 text-xs text-slate-600">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                  <span className="line-clamp-2">
                    {row.origin} → {row.destination}
                  </span>
                </p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                  {row.crewLine ? <span>{row.crewLine}</span> : null}
                  {row.truckLine ? <span>{row.truckLine}</span> : null}
                  {row.arrivalWindow ? <span>Arrive {row.arrivalWindow}</span> : null}
                  {row.durationLabel ? <span>{row.durationLabel}</span> : null}
                </div>
              </div>
              <div className={cn("shrink-0 text-right text-xs", showDateColumn && "sm:min-w-[7rem]")}>
                {showDateColumn ? (
                  <p className="font-medium text-slate-800">{formatMoveDate(row.date)}</p>
                ) : null}
                <p className="text-slate-500">{row.moveType}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
