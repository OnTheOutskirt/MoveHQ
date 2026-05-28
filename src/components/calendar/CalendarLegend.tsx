"use client";

import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import {
  dayStatusBorderStyle,
  dayStatusCellStyle,
} from "@/lib/calendar/color-styles";
import type { DayCapacityStatus } from "@/lib/calendar/types";

const LEGEND: { status: DayCapacityStatus; label: string }[] = [
  { status: "healthy", label: "Healthy" },
  { status: "warning", label: "Almost full" },
  { status: "critical", label: "Full" },
  { status: "closed", label: "Closed" },
];

export function CalendarLegend() {
  const { colors } = useCalendarSettings();

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-200 pt-3 text-[11px] text-slate-600">
      {LEGEND.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-4 rounded border"
            style={{
              ...dayStatusCellStyle(colors, item.status),
              ...dayStatusBorderStyle(colors, item.status),
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

