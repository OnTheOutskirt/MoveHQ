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
  getDayWarningLabels,
  totalFtaSlots,
} from "@/lib/calendar/capacity";
import { isBeforeToday, isSameDay } from "@/lib/calendar/date-utils";
import { closedDayDisplayText } from "@/lib/calendar/settings/apply-closed";
import { bookingRatePercent } from "@/lib/calendar/sales-metrics";
import type { CalendarColorTheme } from "@/lib/calendar/settings/colors";
import type { CalendarDayData } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";
import { CalendarCheck, MessageSquare } from "lucide-react";

const WORK_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DAY_PILL =
  "inline-flex shrink-0 items-center justify-center rounded-full px-1.5 py-px text-[8px] font-semibold";

type MonthDayCellProps = {
  date: Date;
  today: Date;
  day: CalendarDayData;
  onSelect: () => void;
  onEditNotes: (e: React.MouseEvent) => void;
};

function ResourcePart({
  label,
  depleted,
  muted,
  depletedColor,
  mutedColor,
  normalColor,
}: {
  label: string;
  depleted: boolean;
  muted: boolean;
  depletedColor: string;
  mutedColor: string;
  normalColor: string;
}) {
  return (
    <span
      style={{
        color: muted ? mutedColor : depleted ? depletedColor : normalColor,
        fontWeight: !muted && depleted ? 600 : undefined,
      }}
    >
      {label}
    </span>
  );
}

function BookingRateLabel({
  rate,
  muted,
  colors,
}: {
  rate: number;
  muted: boolean;
  colors: CalendarColorTheme;
}) {
  return (
    <span
      className="shrink-0 font-semibold tabular-nums"
      style={{ color: muted ? colors.resourceMutedText : colors.bookingRateText }}
      title="Booking rate"
    >
      {rate}%
    </span>
  );
}

export function MonthDayCell({ date, today, day, onSelect, onEditNotes }: MonthDayCellProps) {
  const { colors } = useCalendarSettings();
  const isToday = isSameDay(date, today);
  const isPast = isBeforeToday(date, today);
  const bookingRate = bookingRatePercent(day.sales);

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
        className="relative min-h-[6.25rem] cursor-pointer border-b border-r p-1.5 text-left sm:min-h-[7rem]"
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
  const ftaTotal = totalFtaSlots(day.ftas);

  const moversDisplay = effectiveMoversBooked(day);
  const trucksDisplay = effectiveTrucksBooked(day);

  const skippersDepleted = day.skippersLeft === 0;
  const driversDepleted = day.driversLeft === 0;
  const ecDepleted = day.extraCabsLeft === 0;
  const f150Depleted = day.f150Count === 0;
  const dayWarnings = !isPast ? getDayWarningLabels(day) : [];

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
        "group flex min-h-[6.25rem] cursor-pointer flex-col border-b border-r p-1.5 text-left transition-colors sm:min-h-[7rem] sm:p-1.5",
        isToday && !isPast && "ring-2 ring-inset",
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
        <div className="flex shrink-0 items-center gap-0.5">
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
      </div>

      <div className="mt-0.5 space-y-0.5">
        <CapacityLine
          label="Movers"
          booked={moversDisplay}
          capacity={day.moversCapacity}
          hold={day.moversOnHold}
          holdPillText={
            day.moversOnHold === 1
              ? "1 mover on hold"
              : `${day.moversOnHold} movers on hold`
          }
          large
          muted={isPast}
          colors={colors}
        />
        <CapacityLine
          label="Trucks"
          booked={trucksDisplay}
          capacity={day.trucksCapacity}
          hold={day.trucksOnHold}
          holdPillText={
            day.trucksOnHold === 1 ? "1 truck on hold" : `${day.trucksOnHold} trucks on hold`
          }
          large
          muted={isPast}
          colors={colors}
        />
        {!isPast && ftaTotal > 0 && (
          <span
            className="inline-flex w-fit rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
            style={pillStyle(colors.ftaBg, colors.ftaText)}
          >
            {ftaTotal} FTA{ftaTotal === 1 ? "" : "s"} Available
          </span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 pt-0.5 text-[9px] leading-tight sm:text-[10px]">
        <span className="min-w-0 flex flex-wrap items-center gap-x-0.5">
          <ResourcePart
            label={`${day.skippersLeft} Skippers`}
            depleted={skippersDepleted}
            muted={isPast}
            depletedColor={colors.resourceDepletedText}
            mutedColor={colors.resourceMutedText}
            normalColor={colors.resourceNormalText}
          />
          <span style={{ color: isPast ? colors.resourceMutedText : "#cbd5e1" }}> · </span>
          <ResourcePart
            label={`${day.driversLeft} Drivers`}
            depleted={driversDepleted}
            muted={isPast}
            depletedColor={colors.resourceDepletedText}
            mutedColor={colors.resourceMutedText}
            normalColor={colors.resourceNormalText}
          />
          <span style={{ color: isPast ? colors.resourceMutedText : "#cbd5e1" }}> · </span>
          <ResourcePart
            label={`${day.extraCabsLeft} EC`}
            depleted={ecDepleted}
            muted={isPast}
            depletedColor={colors.resourceDepletedText}
            mutedColor={colors.resourceMutedText}
            normalColor={colors.resourceNormalText}
          />
          <span style={{ color: isPast ? colors.resourceMutedText : "#cbd5e1" }}> · </span>
          <ResourcePart
            label={`${day.f150Count} F-150`}
            depleted={f150Depleted}
            muted={isPast}
            depletedColor={colors.resourceDepletedText}
            mutedColor={colors.resourceMutedText}
            normalColor={colors.resourceNormalText}
          />
        </span>
        <BookingRateLabel rate={bookingRate} muted={isPast} colors={colors} />
      </div>
    </div>
  );
}

export function MonthWeekdayHeader() {
  return (
    <div className="grid grid-cols-6 border-l border-t border-slate-200">
      {WORK_WEEKDAYS.map((label) => (
        <div
          key={label}
          className="border-b border-r border-slate-200 bg-slate-50 px-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:px-2 sm:py-2 sm:text-xs"
        >
          {label}
        </div>
      ))}
    </div>
  );
}

export function MonthEmptyCell() {
  return (
    <div className="min-h-[6.25rem] border-b border-r border-slate-200 bg-slate-50/50 sm:min-h-[7rem]" />
  );
}
