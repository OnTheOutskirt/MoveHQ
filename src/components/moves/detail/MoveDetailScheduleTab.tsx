"use client";

import { MoveJobDayTimeline } from "@/components/moves/detail/MoveJobDayTimeline";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { MoveRecord } from "@/lib/moves/types";
import { Plus } from "lucide-react";

type MoveDetailScheduleTabProps = {
  move: MoveRecord;
};

export function MoveDetailScheduleTab({ move }: MoveDetailScheduleTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          Job days live <strong className="text-slate-900">inside this move</strong> as operational
          phases — not separate CRM records.
        </p>
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled title="Coming soon">
            <Plus className="h-4 w-4" />
            Add job day
          </Button>
          <Link
            href="/calendar"
            className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Open calendar
          </Link>
        </div>
      </div>
      <MoveJobDayTimeline move={move} />
    </div>
  );
}
