"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { useFleet } from "@/components/providers/FleetProvider";
import {
  capacityToneStyle,
  holdPillStyle,
  holdTableStyle,
  pillStyle,
  sidebarCapacityPanelStyle,
  waitlistTableStyle,
} from "@/lib/calendar/color-styles";
import {
  effectiveMoversBooked,
  effectiveTrucksBooked,
  getCapacityTone,
  getDayCapacityStatus,
  getDayWarningLabels,
  moverCapacityLabel,
  moverHoldLabel,
} from "@/lib/calendar/capacity";
import { useTerminology } from "@/lib/terminology/use-terminology";
import type { CalendarColorTheme } from "@/lib/calendar/settings/colors";
import { formatDayLong, toDateKey } from "@/lib/calendar/date-utils";
import { closedDayDisplayText } from "@/lib/calendar/settings/apply-closed";
import { CalendarMoveRowLink } from "@/components/calendar/CalendarMoveRowLink";
import { DayPipelineTable } from "@/components/calendar/DayPipelineTable";
import { calendarMoveDetailHref } from "@/lib/calendar/resolve-move-link";
import { DaySalesSection } from "@/components/calendar/DaySalesSection";
import { DayWarningIcon } from "@/components/calendar/DayWarningIcon";
import { CalendarHoverTooltip } from "@/components/calendar/CalendarHoverTooltip";
import { expandFtaPillLabels } from "@/lib/calendar/fta";
import { formatSlotHoverFromCode } from "@/lib/day-share/labels";
import type { ClosedDaySource } from "@/lib/calendar/settings/types";
import { AddCalendarPlacementDialog } from "@/components/calendar/AddCalendarPlacementDialog";
import type { CalendarDayData, HoldEntry, WaitlistEntry } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

type DayDetailSidebarProps = {
  open: boolean;
  date: Date | null;
  day: CalendarDayData | null;
  onClose: () => void;
  onNotesChange: (notes: string) => void;
  closedDaySource?: ClosedDaySource;
  onManuallyMarkedBookedChange: (checked: boolean) => void;
  onMarkDayOff: (label: string) => void;
  onReopenDay: () => void;
  side?: "left" | "right";
  showBackdrop?: boolean;
  lockBodyScroll?: boolean;
  zIndexClassName?: string;
};

const HOLD_PILL_CLASS =
  "mt-1.5 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold";

const FTA_PILL_CLASS = "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold";

type CustomerTableEntry = HoldEntry | WaitlistEntry;

function CapacityStatColumn({
  label,
  booked,
  capacity,
  hold,
  holdLabel,
  colors,
}: {
  label: string;
  booked: number;
  capacity: number;
  hold: number;
  holdLabel: string | null;
  colors: CalendarColorTheme;
}) {
  const tone = getCapacityTone(booked, capacity);
  const capacityStyle = capacityToneStyle(colors, tone);
  const bookedStyle =
    hold > 0
      ? { color: colors.holdBookedText, fontWeight: 600 as const }
      : capacityStyle;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold leading-none">
        <span style={bookedStyle}>{booked}</span>
        <span className="text-slate-400">/</span>
        <span style={capacityStyle}>{capacity}</span>
      </p>
      {holdLabel ? (
        <span className={HOLD_PILL_CLASS} style={holdPillStyle(colors)}>
          {holdLabel}
        </span>
      ) : null}
    </div>
  );
}

function ResourceMini({
  label,
  value,
  depleted,
  colors,
}: {
  label: string;
  value: number;
  depleted: boolean;
  colors: CalendarColorTheme;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center">
      <p
        className="text-lg font-semibold leading-none"
        style={{
          color: depleted ? colors.resourceDepletedText : colors.capacityOkText,
        }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-medium text-slate-500">{label}</p>
    </div>
  );
}

function DayHeaderActions({
  manuallyMarkedBooked,
  colors,
  onManuallyMarkedBookedChange,
  onMarkDayOffClick,
}: {
  manuallyMarkedBooked: boolean;
  colors: CalendarColorTheme;
  onManuallyMarkedBookedChange: (checked: boolean) => void;
  onMarkDayOffClick: () => void;
}) {
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onManuallyMarkedBookedChange(!manuallyMarkedBooked)}
        style={
          manuallyMarkedBooked
            ? {
                backgroundColor: colors.bookedMarkBg,
                color: colors.bookedMarkText,
                borderColor: colors.bookedMarkText,
              }
            : undefined
        }
      >
        {manuallyMarkedBooked ? "Mark day unbooked" : "Mark day booked"}
      </Button>
      <Button type="button" variant="secondary" size="sm" onClick={onMarkDayOffClick}>
        Mark as Day Off
      </Button>
    </>
  );
}

function AutoResizeTextarea({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      id={id}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full min-h-[2.25rem] resize-none overflow-hidden rounded-lg border border-slate-200 px-3 py-2 text-sm leading-snug text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    />
  );
}

function SidebarCustomerTable({
  title,
  emptyMessage,
  entries,
  tableStyle,
  borderColor,
  moverColumnLabel,
  onAdd,
}: {
  title: string;
  emptyMessage: string;
  entries: CustomerTableEntry[];
  tableStyle: ReturnType<typeof holdTableStyle>;
  borderColor: string;
  moverColumnLabel: string;
  onAdd?: () => void;
}) {
  return (
    <section className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            + Add
          </button>
        ) : null}
      </div>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="mt-2 overflow-hidden rounded-lg border" style={tableStyle.container}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr
                className="border-b text-[10px] font-semibold uppercase tracking-wide"
                style={tableStyle.header}
              >
                <th className="px-2 py-1.5">Customer</th>
                <th className="px-2 py-1.5 text-right">{moverColumnLabel}</th>
                <th className="px-2 py-1.5 text-right">Trucks</th>
              </tr>
            </thead>
            <tbody style={tableStyle.body}>
              {entries.map((entry) => {
                const linked = Boolean(
                  calendarMoveDetailHref(entry.customerName, entry.moveId),
                );

                return (
                  <CalendarMoveRowLink
                    key={entry.id}
                    label={entry.customerName}
                    moveId={entry.moveId}
                    asRow
                    className={linked ? undefined : "cursor-default hover:bg-transparent"}
                  >
                    <td
                      className="max-w-[8rem] truncate px-2 py-2 font-medium"
                      style={{
                        ...tableStyle.rowText,
                        ...(linked ? { textDecoration: "underline" } : {}),
                      }}
                    >
                      {entry.customerName}
                    </td>
                    <td className="px-2 py-2 text-right" style={tableStyle.cellText}>
                      {entry.movers}
                    </td>
                    <td className="px-2 py-2 text-right" style={tableStyle.cellText}>
                      {entry.trucks}
                    </td>
                  </CalendarMoveRowLink>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function MarkDayOffDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (label: string) => void;
}) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (open) setLabel("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mark-day-off-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h2 id="mark-day-off-title" className="text-lg font-semibold text-slate-900">
          Mark as day off
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          This day will show as closed on the calendar and appear in Move Calendar settings.
        </p>
        <label className="mt-4 block text-xs font-medium text-slate-600">
          Reason
          <input
            type="text"
            required
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Company meeting, training, etc."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </label>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!label.trim()}>
            Save day off
          </Button>
        </div>
      </form>
    </div>
  );
}

export function DayDetailSidebar({
  open,
  date,
  day,
  onClose,
  onNotesChange,
  closedDaySource,
  onManuallyMarkedBookedChange,
  onMarkDayOff,
  onReopenDay,
  side = "right",
  showBackdrop = true,
  lockBodyScroll = true,
  zIndexClassName = "z-50",
}: DayDetailSidebarProps) {
  const [confirmReopenOpen, setConfirmReopenOpen] = useState(false);
  const [markDayOffOpen, setMarkDayOffOpen] = useState(false);
  const [waitlistDialogOpen, setWaitlistDialogOpen] = useState(false);
  const { colors, dayShareSettings } = useCalendarSettings();
  const { getTruckCapacityBreakdownForDate } = useFleet();
  const { terminology, leftHeading, plural } = useTerminology();

  if (!date || !day) return null;

  if (day.isClosed) {
    const isFederal = closedDaySource === "federal";

    const reopenConfirmDescription = isFederal
      ? "This opens the day for booking and shows normal capacity. The holiday stays saved in Move Calendar settings — turn it back on there anytime."
      : "This opens the day for booking and shows normal capacity. The closure stays saved in Move Calendar settings — turn it back on there anytime.";

    return (
      <>
        <DetailSidebar
        open={open}
        onClose={onClose}
        title={formatDayLong(date)}
        widthClassName="max-w-xl"
        side={side}
        showBackdrop={showBackdrop}
        lockBodyScroll={lockBodyScroll}
        zIndexClassName={zIndexClassName}
      >
        <div className="space-y-4">
          <div
            className="rounded-lg border px-4 py-6 text-center sm:py-8"
              style={{
                backgroundColor: colors.dayClosedBg,
                borderColor: colors.dayClosedBorder,
              }}
            >
              <p className="text-xl font-semibold sm:text-2xl" style={{ color: colors.dayClosedText }}>
                {closedDayDisplayText(day)}
              </p>
            {!isFederal && (
              <p className="mx-auto mt-3 max-w-xs text-sm text-slate-500">
                To change this closure, update it in Move Calendar settings.
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setConfirmReopenOpen(true)}
              >
                Open this day
              </Button>
              <p className="mt-2 text-sm text-slate-500">
                Open this date for booking. The closure stays saved and can be turned back on in
                Move Calendar settings.
              </p>
          </div>
        </div>
      </DetailSidebar>

        <ConfirmDialog
          open={confirmReopenOpen}
          onClose={() => setConfirmReopenOpen(false)}
          onConfirm={onReopenDay}
          title="Open this day?"
          description={reopenConfirmDescription}
          confirmLabel="Open day"
        />
      </>
    );
  }

  const status = getDayCapacityStatus(day);
  const dayWarnings = getDayWarningLabels(day, terminology);
  const ftaPills = expandFtaPillLabels(day.ftas);
  const truckBreakdown = getTruckCapacityBreakdownForDate(toDateKey(date));

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={formatDayLong(date)}
      headerExtra={
        <DayHeaderActions
          manuallyMarkedBooked={day.manuallyMarkedBooked}
          colors={colors}
          onManuallyMarkedBookedChange={onManuallyMarkedBookedChange}
          onMarkDayOffClick={() => setMarkDayOffOpen(true)}
        />
      }
      widthClassName="max-w-xl"
      side={side}
      showBackdrop={showBackdrop}
      lockBodyScroll={lockBodyScroll}
      zIndexClassName={zIndexClassName}
    >
      <MarkDayOffDialog
        open={markDayOffOpen}
        onClose={() => setMarkDayOffOpen(false)}
        onConfirm={onMarkDayOff}
      />
      <div className="space-y-4">
        <DaySalesSection sales={day.sales} date={date} day={day} />

        <section>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Capacity</h3>
            {dayWarnings.length > 0 && (
              <DayWarningIcon labels={dayWarnings} colors={colors} />
            )}
          </div>

          <div
            className="mt-2 rounded-lg border p-4"
            style={sidebarCapacityPanelStyle(colors, status)}
          >
            <div className="grid grid-cols-2 gap-3">
            <CapacityStatColumn
              label={moverCapacityLabel(terminology)}
              booked={effectiveMoversBooked(day)}
              capacity={day.moversCapacity}
              hold={day.moversOnHold}
              holdLabel={moverHoldLabel(day.moversOnHold, terminology)}
              colors={colors}
            />
            <CapacityStatColumn
              label="Trucks"
              booked={effectiveTrucksBooked(day)}
              capacity={day.trucksCapacity}
              hold={day.trucksOnHold}
              holdLabel={
                day.trucksOnHold === 0
                  ? null
                  : day.trucksOnHold === 1
                    ? "1 truck on hold"
                    : `${day.trucksOnHold} trucks on hold`
              }
              colors={colors}
            />
          </div>
            {truckBreakdown.rentals > 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Includes {truckBreakdown.rentals} rental{" "}
                {truckBreakdown.rentals === 1 ? "truck" : "trucks"} (
                {truckBreakdown.roster} roster
                {truckBreakdown.outOfService > 0
                  ? `, ${truckBreakdown.outOfService} out of service`
                  : ""}
                )
              </p>
            ) : null}

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500">
                {dayShareSettings.sectionLabel}
              </p>
              {ftaPills.length === 0 ? (
                <p className="mt-1.5 text-sm text-slate-500">None needed for this day.</p>
              ) : (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {ftaPills.map((label, i) => {
                    const hoverLine =
                      formatSlotHoverFromCode(label, dayShareSettings) ?? label;
                    return (
                      <CalendarHoverTooltip
                        key={`${label}-${i}`}
                        lines={[hoverLine]}
                        bgColor={colors.ftaBg}
                        textColor={colors.ftaText}
                      >
                        <span
                          className={cn(FTA_PILL_CLASS, "cursor-default")}
                          style={pillStyle(colors.ftaBg, colors.ftaText)}
                        >
                          {label}
                        </span>
                      </CalendarHoverTooltip>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              <ResourceMini
                label={leftHeading("skipper")}
                value={day.skippersLeft}
                depleted={day.skippersLeft === 0}
                colors={colors}
              />
              <ResourceMini
                label={leftHeading("driver")}
                value={day.driversLeft}
                depleted={day.driversLeft === 0}
                colors={colors}
              />
              <ResourceMini
                label="Extra cabs left"
                value={day.extraCabsLeft}
                depleted={day.extraCabsLeft === 0}
                colors={colors}
              />
              <ResourceMini
                label="F-150s left"
                value={day.f150Count}
                depleted={day.f150Count === 0}
                colors={colors}
              />
            </div>
          </div>
        </section>

        <section>
          <label htmlFor="day-notes" className="text-sm font-semibold text-slate-900">
            Important notes
          </label>
          <AutoResizeTextarea
            id="day-notes"
            value={day.importantNotes}
            onChange={onNotesChange}
            placeholder="Elevator holds, crew notes, traffic, etc."
          />
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <section className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Crew members off</h3>
            {day.crewOff.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No crew marked off for this day.</p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                {day.crewOff.map((member) => (
                  <li key={member.id} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate font-medium text-slate-900">{member.name}</span>
                    <span className="shrink-0 text-slate-500">{member.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="min-w-0 space-y-4">
            <SidebarCustomerTable
              title="On hold"
              emptyMessage="No customers on hold for this day. Place holds from a move's job days."
              entries={day.holds}
              tableStyle={holdTableStyle(colors)}
              borderColor={colors.holdBorder}
              moverColumnLabel={plural("mover")}
            />
            <SidebarCustomerTable
              title="Waitlist"
              emptyMessage="No customers on the waitlist."
              entries={day.waitlist}
              tableStyle={waitlistTableStyle(colors)}
              borderColor={colors.waitlistBorder}
              moverColumnLabel={plural("mover")}
              onAdd={() => setWaitlistDialogOpen(true)}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-5">
          <DayPipelineTable rows={day.pipeline} />
        </div>
      </div>

      {waitlistDialogOpen ? (
        <AddCalendarPlacementDialog
          open
          kind="waitlist"
          anchorDate={date}
          onClose={() => setWaitlistDialogOpen(false)}
        />
      ) : null}
    </DetailSidebar>
  );
}
