"use client";

import type { RepFollowUpCounts } from "@/lib/moves/follow-ups";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

type FollowUpsRepListProps = {
  reps: RepFollowUpCounts[];
  selectedRep: string | null;
  onSelectRep: (rep: string) => void;
};

export function FollowUpsRepList({ reps, selectedRep, onSelectRep }: FollowUpsRepListProps) {
  if (reps.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-500">
        No open follow-ups assigned yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {reps.map((row) => {
        const selected = row.rep === selectedRep;
        return (
          <li key={row.rep}>
            <button
              type="button"
              onClick={() => onSelectRep(row.rep)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors",
                selected ? "bg-brand-50" : "hover:bg-slate-50",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  selected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600",
                )}
              >
                {row.rep
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  <span
                    className={cn(
                      "truncate text-sm font-medium",
                      selected ? "text-brand-900" : "text-slate-900",
                    )}
                  >
                    {row.rep}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {row.total} open
                  {row.overdue > 0 ? (
                    <span className="font-medium text-amber-800"> · {row.overdue} overdue</span>
                  ) : null}
                </span>
              </span>
              {row.overdue > 0 ? (
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  {row.overdue}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {row.total}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
