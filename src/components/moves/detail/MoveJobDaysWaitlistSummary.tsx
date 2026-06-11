"use client";

import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { waitlistPillStyle } from "@/lib/calendar/color-styles";
import { formatMoveDate } from "@/lib/moves/format";
import { jobDayDatesForMove } from "@/lib/calendar/placement";
import type { MoveRecord } from "@/lib/moves/types";

type MoveJobDaysWaitlistSummaryProps = {
  dates: string[];
  jobDayDateSet?: Set<string>;
  onEdit: () => void;
};

export function MoveJobDaysWaitlistSummary({
  dates,
  jobDayDateSet,
  onEdit,
}: MoveJobDaysWaitlistSummaryProps) {
  const { colors } = useCalendarSettings();
  if (dates.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-slate-100 px-4 py-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Waitlist
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {dates.map((date) => {
          const isJobDay = jobDayDateSet?.has(date);
          return (
            <span
              key={date}
              className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={waitlistPillStyle(colors)}
              title={isJobDay === false ? "Additional waitlist date (not a job day)" : undefined}
            >
              {formatMoveDate(date)}
            </span>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-[11px] font-medium text-violet-700 hover:text-violet-900"
      >
        Edit dates
      </button>
    </div>
  );
}

export function jobDayDateSetForMove(move: MoveRecord): Set<string> {
  return new Set(jobDayDatesForMove(move));
}
