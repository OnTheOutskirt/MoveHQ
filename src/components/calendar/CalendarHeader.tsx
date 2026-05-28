"use client";

import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

type CalendarHeaderProps = {
  periodLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenSettings: () => void;
};

export function CalendarHeader({
  periodLabel,
  onPrevious,
  onNext,
  onToday,
  onOpenSettings,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Move Calendar</h1>
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings className="h-3.5 w-3.5" aria-hidden />
          Move Calendar settings
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <Button type="button" variant="secondary" size="sm" onClick={onToday}>
          Today
        </Button>
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[9rem] text-center text-sm font-semibold text-slate-900 sm:min-w-[11rem]">
          {periodLabel}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
