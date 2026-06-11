"use client";

import { CapacityLine } from "@/components/calendar/CapacityLine";
import { DayWarningIcon } from "@/components/calendar/DayWarningIcon";
import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import {
  dayStatusBorderStyle,
  dayStatusCellStyle,
  pillStyle,
} from "@/lib/calendar/color-styles";
import {
  effectiveMoversBooked,
  effectiveTrucksBooked,
  getDayCapacityStatus,
  moverCapacityLabel,
  moverHoldLabel,
} from "@/lib/calendar/capacity";
import { DayCardMetricsDisplay, useConfiguredDayWarnings } from "@/components/calendar/DayCardMetricsDisplay";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { isBeforeToday, isSameDay } from "@/lib/calendar/date-utils";
import { closedDayDisplayText } from "@/lib/calendar/settings/apply-closed";
import { formatRevenueProjection, projectedRevenueForDay } from "@/lib/calendar/revenue-projection";
import {
  BOOKING_RATE_FORMULA_LABEL,
  bookingRateHighlightColor,
  bookingRatePercent,
} from "@/lib/calendar/sales-metrics";
import type { CalendarDayData } from "@/lib/calendar/types";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { WEEKDAY_LABELS, type WeekdayId } from "@/lib/operations/fleet-types";
import { cn } from "@/lib/utils";
import { CalendarCheck, MessageSquare } from "lucide-react";
import type { CalendarColorTheme } from "@/lib/calendar/settings/colors";

const DAY_PILL =
  "inline-flex shrink-0 items-center justify-center rounded-full px-1.5 py-px text-[8px] font-semibold";

export const MONTH_DAY_CELL_HEIGHT =
  "min-h-[6.25rem] sm:min-h-[7rem]";
export const MONTH_DAY_CELL_HEIGHT_FILL = "min-h-0 h-full";

export type MonthDayCellMode = "default" | "capacity-only";

function DayMoversTrucksCapacity({
  day,
  isPast,
  colors,
}: {
  day: CalendarDayData;
  isPast: boolean;
  colors: CalendarColorTheme;
}) {
  const { terminology } = useTerminology();
  const moversHold = day.moversOnHold;
  const trucksHold = day.trucksOnHold;

  return (
    <div className="mt-0.5 space-y-0.5">
      <CapacityLine
        label={moverCapacityLabel(terminology)}
        booked={effectiveMoversBooked(day)}
        capacity={day.moversCapacity}
        hold={moversHold}
        holdPillText={moverHoldLabel(moversHold, terminology) ?? undefined}
        large
        muted={isPast}
        colors={colors}
      />
      <CapacityLine
        label="Trucks"
        booked={effectiveTrucksBooked(day)}
        capacity={day.trucksCapacity}
        hold={trucksHold}
        holdPillText={
          trucksHold === 1 ? "1 truck on hold" : trucksHold > 1 ? `${trucksHold} trucks on hold` : undefined
        }
        large
        muted={isPast}
        colors={colors}
      />
    </div>
  );
}

type MonthDayCellProps = {
  date: Date;
  today: Date;
  day: CalendarDayData;
  highlighted?: boolean;
  mode?: MonthDayCellMode;
  fillHeight?: boolean;
  onSelect: () => void;
  onEditNotes?: (e: React.MouseEvent) => void;
};

export function MonthDayCell({
  date,
  today,
  day,
  highlighted = false,
  mode = "default",
  fillHeight = false,
  onSelect,
  onEditNotes,
}: MonthDayCellProps) {
  const capacityOnly = mode === "capacity-only";
  const rowHeight = fillHeight ? MONTH_DAY_CELL_HEIGHT_FILL : MONTH_DAY_CELL_HEIGHT;
  const { colors } = useCalendarSettings();
  const { config, activeLocation } = useWorkspace();
  const metricsLocationId =
    activeLocation?.id ??
    config.locations.find((l) => l.isPrimary)?.id ??
    config.locations[0]?.id ??
    "";
  const isToday = isSameDay(date, today);
  const isPast = isBeforeToday(date, today);
  const bookingRate = bookingRatePercent(day.sales);
  const revenueProj = projectedRevenueForDay(day);

  if (day.isClosed) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "relative cursor-pointer border-b border-r p-1.5 text-left",
          rowHeight,
          highlighted && "ring-2 ring-inset ring-brand-500",
        )}
        style={{
          backgroundColor: colors.dayClosedBg,
          borderColor: colors.dayClosedBorder,
        }}
        aria-label={`${date.getDate()} — ${closedDayDisplayText(day)}`}
      >
        <span
          className="relative z-10 inline-flex h-5 min-w-5 items-center justify-center rounded text-xs font-semibold"
          style={{ color: colors.dayClosedText }}
        >
          {date.getDate()}
        </span>
        <p
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center text-sm font-semibold leading-snug sm:text-base"
          style={{ color: colors.dayClosedText }}
        >
          {closedDayDisplayText(day)}
        </p>
      </div>
    );
  }

  const status = isPast ? null : getDayCapacityStatus(day);
  const configuredWarnings = useConfiguredDayWarnings(day, metricsLocationId, isPast);
  const dayWarnings = capacityOnly ? [] : configuredWarnings;

  const cellStyle = isPast
    ? { backgroundColor: colors.dayPastBg }
    : dayStatusCellStyle(colors, status!);
  const borderStyle = isPast
    ? { borderColor: "#e2e8f0" }
    : dayStatusBorderStyle(colors, status!);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex cursor-pointer flex-col border-b border-r p-1.5 text-left transition-colors sm:p-1.5",
        rowHeight,
        isToday && !isPast && "ring-2 ring-inset",
        highlighted && !isToday && "ring-2 ring-inset ring-brand-500",
      )}
      style={{
        ...cellStyle,
        ...borderStyle,
        ...(isToday && !isPast
          ? { boxShadow: `inset 0 0 0 2px ${colors.todayRing}` }
          : {}),
      }}
    >
      <div className="flex items-start justify-between gap-0.5">
        <span
          className="inline-flex h-5 min-w-5 items-center justify-center rounded text-xs font-semibold"
          style={
            isToday && !isPast
              ? { backgroundColor: colors.todayBadgeBg, color: colors.todayBadgeText }
              : isPast
                ? { color: colors.resourceMutedText }
                : { color: colors.capacityOkText }
          }
        >
          {date.getDate()}
        </span>
        {!capacityOnly ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-1 gap-y-0.5">
            <span
              className="text-[9px] font-semibold tabular-nums leading-none sm:text-[10px]"
              style={{ color: bookingRateHighlightColor(bookingRate, colors, isPast) }}
              title={`Booking rate (${BOOKING_RATE_FORMULA_LABEL})`}
            >
              {bookingRate}%
            </span>
            <span
              className="text-[9px] font-semibold tabular-nums leading-none text-emerald-700 sm:text-[10px]"
              title="Projected revenue"
            >
              {formatRevenueProjection(revenueProj)}
            </span>
            {dayWarnings.length > 0 && (
              <DayWarningIcon labels={dayWarnings} colors={colors} />
            )}
            {!isPast && day.manuallyMarkedBooked && (
              <span
                className={DAY_PILL}
                style={pillStyle(colors.bookedMarkBg, colors.bookedMarkText)}
                role="img"
                aria-label="Manually marked as booked"
              >
                <CalendarCheck className="h-3 w-3 shrink-0" strokeWidth={2.5} />
              </span>
            )}
            {day.importantNotes ? (
              <button
                type="button"
                onClick={onEditNotes}
                className={DAY_PILL}
                style={
                  isPast
                    ? { backgroundColor: "#e2e8f0", color: colors.resourceMutedText }
                    : pillStyle(colors.notesIconBg, colors.notesIconText)
                }
                aria-label="View or edit day note"
              >
                <MessageSquare className="h-3 w-3 shrink-0" strokeWidth={2.5} />
              </button>
            ) : null}
            {day.waitlistCount > 0 && (
              <span
                className={DAY_PILL}
                style={
                  isPast
                    ? { backgroundColor: "#e2e8f0", color: colors.resourceMutedText }
                    : pillStyle(colors.waitlistBg, colors.waitlistText)
                }
              >
                {day.waitlistCount} Waitlist
              </span>
            )}
          </div>
        ) : null}
      </div>

      {capacityOnly ? (
        <DayMoversTrucksCapacity day={day} isPast={isPast} colors={colors} />
      ) : (
        <DayCardMetricsDisplay
          day={day}
          isPast={isPast}
          colors={colors}
          locationId={metricsLocationId}
          className="flex-1"
        />
      )}
    </div>
  );
}

export function MonthWeekdayHeader({ columnWeekdays }: { columnWeekdays: WeekdayId[] }) {
  return (
    <div
      className="grid border-l border-t border-slate-200"
      style={{ gridTemplateColumns: `repeat(${columnWeekdays.length}, minmax(0, 1fr))` }}
    >
      {columnWeekdays.map((day) => (
        <div
          key={day}
          className="border-b border-r border-slate-200 bg-slate-50 px-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:px-2 sm:py-2 sm:text-xs"
        >
          {WEEKDAY_LABELS[day]}
        </div>
      ))}
    </div>
  );
}

export function MonthEmptyCell({ fillHeight = false }: { fillHeight?: boolean }) {
  return (
    <div
      className={cn(
        "border-b border-r border-slate-200 bg-slate-50/50",
        fillHeight ? MONTH_DAY_CELL_HEIGHT_FILL : MONTH_DAY_CELL_HEIGHT,
      )}
    />
  );
}
