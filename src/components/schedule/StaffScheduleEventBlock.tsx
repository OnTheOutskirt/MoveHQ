"use client";

import { formatEventTimeRange } from "@/lib/schedule/format-event-time";
import { departmentTone } from "@/lib/schedule/staff-calendar-filter";
import {
  resolveStaffCalendarEventKind,
  staffCalendarEventKindIcon,
} from "@/lib/schedule/staff-calendar-event-display";
import {
  scheduleMinutesToPx,
} from "@/lib/schedule/schedule-time-grid";
import type { StaffCalendarEvent } from "@/lib/schedule/types";
import { cn } from "@/lib/utils";

type StaffScheduleEventBlockProps = {
  event: StaffCalendarEvent;
  top: number;
  height: number;
  showStaff: boolean;
  selected: boolean;
  onSelect: () => void;
};

export function StaffScheduleEventBlock({
  event,
  top,
  height,
  showStaff,
  selected,
  onSelect,
}: StaffScheduleEventBlockProps) {
  const tone = departmentTone(event.department);
  const kind = resolveStaffCalendarEventKind(event);
  const KindIcon = staffCalendarEventKindIcon(kind);
  const durationMin = event.endMinutes - event.startMinutes;
  const isCompact = durationMin <= 45;
  const showLocation = Boolean(event.location) && height >= scheduleMinutesToPx(60);
  const timeLabel = formatEventTimeRange(event.startMinutes, event.endMinutes);
  const tooltip = event.location
    ? `${event.title} · ${timeLabel} · ${event.staffName} · ${event.location}`
    : `${event.title} · ${timeLabel} · ${event.staffName}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "absolute inset-x-0.5 z-[1] w-[calc(100%-0.25rem)] overflow-hidden rounded border text-left transition-shadow sm:inset-x-1 sm:w-[calc(100%-0.5rem)]",
        tone.border,
        tone.bg,
        selected && "ring-2 ring-brand-400 ring-offset-1",
        "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        isCompact ? "flex items-center gap-1 px-1 py-0" : "px-1.5 py-0.5",
      )}
      style={{ top, height: Math.max(height, isCompact ? 22 : height) }}
      title={tooltip}
      aria-label={`${event.title}, ${timeLabel}`}
    >
      <KindIcon
        className={cn(
          "shrink-0",
          isCompact ? "h-3 w-3" : "h-3.5 w-3.5",
          tone.text,
        )}
        aria-hidden
      />

      {isCompact ? (
        <span className={cn("min-w-0 flex-1 truncate text-[10px] font-semibold leading-none", tone.text)}>
          {event.title}
        </span>
      ) : (
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium leading-tight text-slate-600">
            {timeLabel}
          </p>
          <p className={cn("truncate text-xs font-semibold leading-snug", tone.text)}>
            {event.title}
          </p>
          {showStaff ? (
            <p className="truncate text-[10px] font-medium text-slate-600">{event.staffName}</p>
          ) : null}
          {showLocation ? (
            <p className="truncate text-[10px] text-slate-500">{event.location}</p>
          ) : null}
        </div>
      )}
    </button>
  );
}
