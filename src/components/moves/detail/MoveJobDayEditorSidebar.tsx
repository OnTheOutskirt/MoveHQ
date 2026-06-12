"use client";

import { JobDayArrivalWindowFields } from "@/components/moves/detail/JobDayArrivalWindowFields";
import { JobDayEditorCalendarPeek } from "@/components/moves/detail/JobDayEditorCalendarPeek";
import { JobDayEditorSwitcher } from "@/components/moves/detail/JobDayEditorSwitcher";
import { JobDayLocationsEditor } from "@/components/moves/detail/JobDayLocationsEditor";
import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  defaultCrewDepartureLabel,
  formatCrewDepartureLabel,
  parseCrewDepartureToTime24,
} from "@/lib/moves/crew-departure";
import {
  estimateDepotToOriginDriveMinutes,
  resolveArrivalWindowMinutes,
  resolveDepotDriveMinutes,
  roundUpToArrivalIncrement,
} from "@/lib/moves/job-day-arrival";
import {
  computeCrewHotelClientCharge,
} from "@/lib/moves/job-day-crew-hotel";
import {
  DEFAULT_FOLLOW_ON_DAY_FRACTION,
  JOB_DAY_SERVICE_OPTIONS,
  coerceFollowOnDayFraction,
  jobDayFractionOptionLabel,
  jobDayFractionOptionsForSchedule,
  syncDayFractionFromEstimatedHours,
  MAX_JOB_DAYS_PER_MOVE,
  buildJobDaySwitcherLabels,
  createDefaultJobDayFormValues,
  createNewJobDayKey,
  duplicateJobDayFormValues,
  formValuesToJobDay,
  generateJobDayLabel,
  getSortedJobDays,
  jobDayIndexAmongEditorEntries,
  isNewJobDayKey,
  jobDayToFormValues,
  resolveComputedArrivalWindow,
  type JobDayFormContext,
  type JobDayFormValues,
} from "@/lib/moves/job-day-form";
import type { JobDayFraction, MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Calendar, BedDouble } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type MoveJobDayEditorSidebarProps = {
  move: MoveRecord;
  dayId: string | null;
  /** When set with no dayId, sidebar opens as a copy of this day (new day on save). */
  duplicateFromDayId?: string | null;
  open: boolean;
  onClose: () => void;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-slate-600">{children}</span>;
}

function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      inputMode="numeric"
      className={cn(
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums",
        props.className,
      )}
    />
  );
}

function pendingDatesFromDrafts(
  drafts: Record<string, JobDayFormValues>,
  newDayKeys: string[],
): string[] {
  return newDayKeys.map((k) => drafts[k]?.date ?? "").filter((d) => d.trim().length > 0);
}

function withAutoArrival(
  base: JobDayFormValues,
  move: MoveRecord,
  formContext: JobDayFormContext,
): JobDayFormValues {
  if (base.arrivalWindowManual) return base;
  return {
    ...base,
    arrivalWindow: resolveComputedArrivalWindow(base, move, formContext),
  };
}

export function MoveJobDayEditorSidebar({
  move,
  dayId,
  duplicateFromDayId = null,
  open,
  onClose,
}: MoveJobDayEditorSidebarProps) {
  const { addJobDay, updateJobDay, removeJobDay } = useMoves();
  const { settings } = useSettings();
  const { getLocationById } = useWorkspace();
  const sortedDays = getSortedJobDays(move);

  const formContext = useMemo((): JobDayFormContext => {
    const depot = getLocationById(move.locationId);
    return {
      move,
      defaults: settings.defaults,
      depot: depot
        ? {
            addressLine1: depot.addressLine1,
            city: depot.city,
            state: depot.state,
            zip: depot.zip,
          }
        : undefined,
    };
  }, [move, settings.defaults, getLocationById]);

  const [activeKey, setActiveKey] = useState<string>(dayId ?? createNewJobDayKey());
  const [newDayKeys, setNewDayKeys] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, JobDayFormValues>>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(() => new Set());
  const [calendarPeekOpen, setCalendarPeekOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDayFraction, setPendingDayFraction] = useState<JobDayFraction | null>(null);

  const totalDayCount = sortedDays.length + newDayKeys.length;
  const atDayCap = totalDayCount >= MAX_JOB_DAYS_PER_MOVE;

  const isNewMode = isNewJobDayKey(activeKey);
  const isEdit = !isNewMode;
  const existing = isEdit ? move.jobDays.find((d) => d.id === activeKey) : null;
  const isDuplicate =
    isNewMode && duplicateFromDayId != null && newDayKeys[0] === activeKey;
  const duplicateSource = duplicateFromDayId
    ? move.jobDays.find((d) => d.id === duplicateFromDayId)
    : null;

  const resolveCardValues = useCallback(
    (key: string): JobDayFormValues => {
      if (drafts[key]) return drafts[key]!;
      if (isNewJobDayKey(key)) {
        if (key === newDayKeys[0] && duplicateFromDayId) {
          const source = move.jobDays.find((d) => d.id === duplicateFromDayId);
          if (source) return duplicateJobDayFormValues(source, formContext);
        }
        const others = pendingDatesFromDrafts(drafts, newDayKeys.filter((k) => k !== key));
        return createDefaultJobDayFormValues(move, others, formContext);
      }
      const day = move.jobDays.find((d) => d.id === key);
      return day
        ? jobDayToFormValues(day, formContext)
        : createDefaultJobDayFormValues(move, [], formContext);
    },
    [drafts, move, newDayKeys, duplicateFromDayId, formContext],
  );

  const values = useMemo(() => {
    if (drafts[activeKey]) return drafts[activeKey]!;
    return resolveCardValues(activeKey);
  }, [activeKey, drafts, resolveCardValues]);

  const computedArrival = useMemo(
    () => resolveComputedArrivalWindow(values, move, formContext),
    [values, move, formContext],
  );

  const driveMinutes = useMemo(
    () =>
      estimateDepotToOriginDriveMinutes({
        move,
        locations: values.locations,
        depot: formContext.depot,
        fallbackMinutes: resolveDepotDriveMinutes(formContext.defaults),
      }),
    [move, values.locations, formContext],
  );

  const showMorningDriveHint = values.isFirstJobOfDay;

  const crewHotelBreakdown = useMemo(() => {
    if (!values.crewHotelNeeded) return null;
    const lodging = settings.opsPrepRules.crewLodging;
    const moverCount = parseInt(values.crewSize, 10) || 4;
    const charge = computeCrewHotelClientCharge({
      moverCount,
      roomRate: lodging.roomRatePerNight,
      perDiemPerMover: lodging.perDiemPerMover,
      moversPerRoom: lodging.moversPerRoom,
    });
    return { lodging, moverCount, charge };
  }, [values.crewHotelNeeded, values.crewSize, settings.opsPrepRules.crewLodging]);

  useEffect(() => {
    if (!open) {
      setDrafts({});
      setDirtyKeys(new Set());
      setNewDayKeys([]);
      setCalendarPeekOpen(false);
      setDeleteConfirmOpen(false);
      setPendingDayFraction(null);
      return;
    }

    if (dayId) {
      setActiveKey(dayId);
      setNewDayKeys([]);
      setDrafts({});
      setDirtyKeys(new Set());
      return;
    }

    const firstNew = createNewJobDayKey();
    const initialDrafts: Record<string, JobDayFormValues> = {};
    if (duplicateFromDayId) {
      const source = move.jobDays.find((d) => d.id === duplicateFromDayId);
      if (source) initialDrafts[firstNew] = duplicateJobDayFormValues(source, formContext);
    }
    if (!initialDrafts[firstNew]) {
      initialDrafts[firstNew] = createDefaultJobDayFormValues(move, [], formContext);
    }

    setActiveKey(firstNew);
    setNewDayKeys([firstNew]);
    setDrafts(initialDrafts);
    setDirtyKeys(new Set([firstNew]));
  }, [open, dayId, duplicateFromDayId, move.id, formContext]);

  const editorDateEntries = useMemo(() => {
    const entries: { key: string; date: string }[] = [];
    for (const day of sortedDays) {
      const card =
        day.id === activeKey ? values : (drafts[day.id] ?? resolveCardValues(day.id));
      entries.push({ key: day.id, date: card.date });
    }
    for (const key of newDayKeys) {
      const card = key === activeKey ? values : (drafts[key] ?? resolveCardValues(key));
      entries.push({ key, date: card.date });
    }
    return entries;
  }, [sortedDays, newDayKeys, activeKey, values, drafts, resolveCardValues]);

  const switcherLabels = useMemo(
    () => buildJobDaySwitcherLabels(editorDateEntries),
    [editorDateEntries],
  );

  const dayTitle = useMemo(
    () =>
      generateJobDayLabel(jobDayIndexAmongEditorEntries(activeKey, editorDateEntries)),
    [activeKey, editorDateEntries],
  );

  const resolveSwitcherLabel = useCallback(
    (key: string) => {
      const label = switcherLabels.get(key) ?? "Day —";
      if (duplicateFromDayId && key === newDayKeys[0] && isNewJobDayKey(key)) {
        return duplicateSource ? `Copy · ${label}` : label;
      }
      return label;
    },
    [switcherLabels, duplicateFromDayId, newDayKeys, duplicateSource],
  );

  const canDelete =
    isEdit &&
    existing &&
    existing.status !== "in_progress" &&
    existing.status !== "completed";

  const markDirty = useCallback((key: string) => {
    setDirtyKeys((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  function patchValues(next: JobDayFormValues) {
    setDrafts((prev) => ({ ...prev, [activeKey]: next }));
    markDirty(activeKey);
  }

  function applyDayFractionChange(fraction: JobDayFraction) {
    const base = drafts[activeKey] ?? values;
    let next: JobDayFormValues = {
      ...base,
      dayFraction: fraction,
      dayFractionManualOverride: true,
    };
    if (!next.arrivalWindowManual) {
      next = withAutoArrival(next, move, formContext);
    }
    patchValues(next);
  }

  function clearDayFractionOverride() {
    const base = drafts[activeKey] ?? values;
    let next: JobDayFormValues = {
      ...base,
      dayFractionManualOverride: false,
      dayFraction: syncDayFractionFromEstimatedHours(base),
    };
    if (!next.arrivalWindowManual) {
      next = withAutoArrival(next, move, formContext);
    }
    patchValues(next);
  }

  function recalcCrewHotelCharge(base: JobDayFormValues): JobDayFormValues {
    if (!base.crewHotelNeeded) return base;
    const lodging = settings.opsPrepRules.crewLodging;
    const moverCount = parseInt(base.crewSize, 10) || 4;
    const charge = computeCrewHotelClientCharge({
      moverCount,
      roomRate: lodging.roomRatePerNight,
      perDiemPerMover: lodging.perDiemPerMover,
      moversPerRoom: lodging.moversPerRoom,
    });
    return {
      ...base,
      crewHotelMoverCount: String(moverCount),
      crewHotelRoomCount: String(charge.roomCount),
      crewHotelRoomRate: String(lodging.roomRatePerNight),
      crewHotelPerDiem: String(lodging.perDiemPerMover),
      crewHotelClientCharge: String(charge.total),
    };
  }

  function patch<K extends keyof JobDayFormValues>(key: K, value: JobDayFormValues[K]) {
    const base = drafts[activeKey] ?? values;
    let next: JobDayFormValues = { ...base, [key]: value };

    if (key === "crewHotelNeeded" && value === true) {
      next = recalcCrewHotelCharge(next);
    }

    if (key === "crewSize" && next.crewHotelNeeded) {
      next = recalcCrewHotelCharge(next);
    }

    if (key === "isFirstJobOfDay") {
      if (!value) {
        next = {
          ...next,
          departureWindow: "",
          arrivalWindowManual: false,
          dayFraction:
            next.dayFraction === "long" ? DEFAULT_FOLLOW_ON_DAY_FRACTION : next.dayFraction,
        };
      } else if (!next.departureWindow.trim()) {
        next = {
          ...next,
          departureWindow: defaultCrewDepartureLabel(formContext.defaults),
        };
      }
      if (!next.dayFractionManualOverride) {
        next.dayFraction = syncDayFractionFromEstimatedHours(next);
      } else {
        next.dayFraction = coerceFollowOnDayFraction(next.dayFraction, Boolean(value));
      }
    }

    if (key === "hoursEstimated" && !next.dayFractionManualOverride) {
      next.dayFraction = syncDayFractionFromEstimatedHours(next);
    }

    if (key === "dayFractionManualOverride" && value === false) {
      next.dayFraction = syncDayFractionFromEstimatedHours(next);
    }

    if (
      !next.arrivalWindowManual &&
      (key === "departureWindow" ||
        key === "isFirstJobOfDay" ||
        key === "dayFraction" ||
        key === "hoursEstimated" ||
        key === "dayFractionManualOverride" ||
        key === "locations")
    ) {
      next = withAutoArrival(next, move, formContext);
    }

    patchValues(next);
  }

  function setArrivalManual(manual: boolean) {
    const base = drafts[activeKey] ?? values;
    if (!manual) {
      patchValues(
        withAutoArrival({ ...base, arrivalWindowManual: false }, move, formContext),
      );
      return;
    }
    patchValues({
      ...base,
      arrivalWindowManual: true,
      arrivalWindow: base.arrivalWindow || computedArrival,
    });
  }

  function patchArrivalWindow(nextWindow: string) {
    const base = drafts[activeKey] ?? values;
    patchValues({
      ...base,
      arrivalWindow: nextWindow,
      arrivalWindowManual: true,
    });
    markDirty(activeKey);
  }

  function toggleService(id: JobDayFormValues["services"][number]) {
    const base = drafts[activeKey] ?? values;
    const has = base.services.includes(id);
    patch(
      "services",
      has ? base.services.filter((s) => s !== id) : [...base.services, id],
    );
  }

  function selectDay(key: string) {
    if (key === activeKey) return;
    setDrafts((prev) => ({ ...prev, [activeKey]: values }));
    setActiveKey(key);
  }

  function startAddAnother() {
    if (atDayCap) return;
    setDrafts((prev) => ({ ...prev, [activeKey]: values }));
    const key = createNewJobDayKey();
    const extraDates = pendingDatesFromDrafts(
      { ...drafts, [activeKey]: values },
      newDayKeys,
    );
    setNewDayKeys((prev) => [...prev, key]);
    setDrafts((prev) => ({
      ...prev,
      [key]: createDefaultJobDayFormValues(move, extraDates, formContext),
    }));
    setActiveKey(key);
    markDirty(key);
  }

  const keysToSave = useMemo(() => {
    const keys = new Set(dirtyKeys);
    keys.add(activeKey);
    return [...keys];
  }, [dirtyKeys, activeKey]);

  const pendingDayFractionCopy = useMemo(() => {
    if (!pendingDayFraction) return null;
    const currentLabel = jobDayFractionOptionLabel(values.dayFraction);
    const nextLabel = jobDayFractionOptionLabel(pendingDayFraction);
    const estHours = values.hoursEstimated.trim() || "—";
    return { currentLabel, nextLabel, estHours };
  }, [pendingDayFraction, values.dayFraction, values.hoursEstimated]);

  const saveLabel = keysToSave.length === 1 ? "Save day" : "Save days";

  function handleSave() {
    const snapshot = { ...drafts, [activeKey]: values };
    let moveSnapshot = move;

    const existingKeys = keysToSave.filter((k) => !isNewJobDayKey(k));
    const newKeys = keysToSave.filter(isNewJobDayKey);

    for (const key of existingKeys) {
      const form = snapshot[key];
      if (!form) continue;
      const orig = moveSnapshot.jobDays.find((d) => d.id === key);
      const day = formValuesToJobDay(form, moveSnapshot, orig);
      updateJobDay(moveSnapshot.id, day);
      moveSnapshot = {
        ...moveSnapshot,
        jobDays: moveSnapshot.jobDays.map((d) => (d.id === key ? day : d)),
      };
    }

    for (const key of newKeys) {
      const form = snapshot[key];
      if (!form) continue;
      const day = formValuesToJobDay(form, moveSnapshot);
      addJobDay(moveSnapshot.id, day);
      moveSnapshot = { ...moveSnapshot, jobDays: [...moveSnapshot.jobDays, day] };
    }

    onClose();
  }

  function handleDelete() {
    if (isEdit && activeKey && canDelete) {
      setDeleteConfirmOpen(true);
    }
  }

  function confirmDelete() {
    if (isEdit && activeKey && canDelete) {
      removeJobDay(move.id, activeKey);
      setDeleteConfirmOpen(false);
      onClose();
    }
  }

  const arrivalWindowMinutes = resolveArrivalWindowMinutes(formContext.defaults);
  const plannedDriveMinutes = roundUpToArrivalIncrement(driveMinutes);

  const footer = (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={handleSave}>
        {saveLabel}
      </Button>
      <Button type="button" variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      {isEdit ? (
        <Button
          type="button"
          variant="secondary"
          className="ml-auto text-red-600 hover:bg-red-50"
          disabled={!canDelete}
          title={
            canDelete
              ? "Remove this job day"
              : "Cannot delete days in progress or completed"
          }
          onClick={handleDelete}
        >
          Delete
        </Button>
      ) : null}
    </div>
  );

  return (
    <>
    <JobDayEditorCalendarPeek
      open={calendarPeekOpen}
      onClose={() => setCalendarPeekOpen(false)}
      jobDayDate={values.date}
      onPickDate={(dateKey) => patch("date", dateKey)}
    />
    <DetailSidebar
      open={open}
      onClose={onClose}
      showBackdrop={!calendarPeekOpen}
      title={
        isNewMode
          ? isDuplicate && duplicateSource
            ? `Duplicate ${duplicateSource.label}`
            : `Add ${dayTitle}`
          : `Edit ${dayTitle}`
      }
      description={
        isDuplicate && duplicateSource
          ? `Copy of ${duplicateSource.label} — set the date and save as a new day`
          : move.customerName
      }
      widthClassName="max-w-lg"
      footer={footer}
    >
      <JobDayEditorSwitcher
        days={sortedDays}
        newDayKeys={newDayKeys}
        activeKey={activeKey}
        activeValues={values}
        resolveCardValues={resolveCardValues}
        resolveDayLabel={resolveSwitcherLabel}
        onSelect={selectDay}
        onAddAnother={startAddAnother}
        atDayCap={atDayCap}
      />

      <div className="space-y-4">
        <label className="block">
          <FieldLabel>Date</FieldLabel>
          <input
            type="date"
            value={values.date}
            onChange={(e) => patch("date", e.target.value)}
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm",
              isNewMode && isDuplicate
                ? "border-brand-300 ring-1 ring-brand-100"
                : "border-slate-200",
            )}
          />
          {isNewMode && isDuplicate ? (
            <p className="mt-1 text-xs text-slate-500">
              Pre-filled to the day after the source — change if needed.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setCalendarPeekOpen(true)}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            <Calendar className="h-3.5 w-3.5" />
            View move calendar
          </button>
        </label>

        <fieldset>
          <FieldLabel>Services</FieldLabel>
          <div className="mt-1.5 flex flex-nowrap gap-1 overflow-x-auto scrollbar-none">
            {JOB_DAY_SERVICE_OPTIONS.map((opt) => {
              const on = values.services.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleService(opt.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight transition-colors",
                    on
                      ? "border-brand-300 bg-brand-50 text-brand-800"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <FieldLabel>Crew</FieldLabel>
            <NumberInput
              type="number"
              min={1}
              max={99}
              step={1}
              value={values.crewSize}
              onChange={(e) => patch("crewSize", e.target.value.replace(/\D/g, ""))}
              placeholder="4"
            />
          </label>
          <label className="block">
            <FieldLabel>Trucks</FieldLabel>
            <NumberInput
              type="number"
              min={0}
              max={99}
              step={1}
              value={values.truckCount}
              onChange={(e) => patch("truckCount", e.target.value.replace(/\D/g, ""))}
              placeholder="1"
            />
          </label>
          <label className="block">
            <FieldLabel>Est. hrs</FieldLabel>
            <NumberInput
              type="number"
              min={0}
              step={0.5}
              value={values.hoursEstimated}
              onChange={(e) => patch("hoursEstimated", e.target.value)}
            />
            {values.dayFractionManualOverride ? (
              <p className="mt-1 text-[10px] text-slate-400">Day length overridden</p>
            ) : (
              <p className="mt-1 text-[10px] text-slate-400">Sets day length</p>
            )}
          </label>
        </div>

        <fieldset className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
          <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Schedule
          </legend>

          <label
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5"
            title="11 AM–4 PM arrival on the calendar; no shop departure time"
          >
            <input
              type="checkbox"
              checked={!values.isFirstJobOfDay}
              onChange={(e) => patch("isFirstJobOfDay", !e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-[11px] font-medium text-slate-700">
              Follow-on job
            </span>
          </label>

          <div
            className={cn(
              "grid gap-2",
              values.isFirstJobOfDay ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {values.isFirstJobOfDay ? (
              <label className="block">
                <FieldLabel>Crew departure</FieldLabel>
                <input
                  type="time"
                  value={parseCrewDepartureToTime24(values.departureWindow)}
                  onChange={(e) =>
                    patch("departureWindow", formatCrewDepartureLabel(e.target.value))
                  }
                  className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
                />
              </label>
            ) : null}
            <label className="block">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                <FieldLabel>Day length</FieldLabel>
                {values.dayFractionManualOverride ? (
                  <span className="text-[10px] font-semibold text-amber-700">Overridden</span>
                ) : (
                  <span className="text-[10px] text-slate-400">From est. hrs</span>
                )}
              </div>
              <select
                value={values.dayFraction}
                onChange={(e) => {
                  const next = e.target.value as JobDayFraction;
                  if (next === values.dayFraction) return;
                  setPendingDayFraction(next);
                }}
                className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
              >
                {jobDayFractionOptionsForSchedule(values.isFirstJobOfDay).map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <label className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-600">
                <input
                  type="checkbox"
                  checked={values.dayFractionManualOverride}
                  onChange={(e) => {
                    if (e.target.checked) {
                      patch("dayFractionManualOverride", true);
                      return;
                    }
                    clearDayFractionOverride();
                  }}
                  className="rounded border-slate-300"
                />
                Override
              </label>
            </label>
          </div>

          <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <FieldLabel>Arrival window</FieldLabel>
                  {showMorningDriveHint ? (
                    <span className="text-[10px] text-slate-400">
                      {driveMinutes} min drive
                      {plannedDriveMinutes !== driveMinutes
                        ? ` (${plannedDriveMinutes} min for arrival)`
                        : ""}{" "}
                      · {arrivalWindowMinutes}-min window
                    </span>
                  ) : null}
                </div>
                <JobDayArrivalWindowFields
                  arrivalWindow={values.arrivalWindow}
                  computedArrival={computedArrival}
                  isFirstJobOfDay={values.isFirstJobOfDay}
                  manual={values.arrivalWindowManual}
                  defaults={formContext.defaults}
                  onChange={patchArrivalWindow}
                />
              </div>
              <label className="flex shrink-0 items-center gap-1 pt-0.5 text-[10px] text-slate-600">
                <input
                  type="checkbox"
                  checked={values.arrivalWindowManual}
                  onChange={(e) => setArrivalManual(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Custom
              </label>
            </div>
            {values.arrivalWindowManual ? (
              <button
                type="button"
                onClick={() => setArrivalManual(false)}
                className="mt-1 text-[10px] font-semibold text-brand-700 hover:underline"
              >
                Reset to calculated
              </button>
            ) : null}
          </div>
        </fieldset>

        <fieldset className="space-y-2 rounded-lg border border-violet-100 bg-violet-50/40 p-2.5">
          <legend className="flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
            <BedDouble className="h-3.5 w-3.5" />
            Crew hotel
          </legend>
          <label className="flex items-center gap-2 rounded-md border border-violet-100 bg-white px-2 py-1.5">
            <input
              type="checkbox"
              checked={values.crewHotelNeeded}
              onChange={(e) => patch("crewHotelNeeded", e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-[11px] font-medium text-slate-700">Hotel needed this day</span>
          </label>
          {values.crewHotelNeeded ? (
            <div className="space-y-2 rounded-md border border-violet-100 bg-white p-2.5">
              {crewHotelBreakdown ? (
                <p className="text-[11px] leading-snug text-slate-600">
                  From setup ({crewHotelBreakdown.moverCount} mover
                  {crewHotelBreakdown.moverCount === 1 ? "" : "s"} on this day):{" "}
                  {crewHotelBreakdown.charge.roomCount} room
                  {crewHotelBreakdown.charge.roomCount === 1 ? "" : "s"} × $
                  {crewHotelBreakdown.lodging.roomRatePerNight} + $
                  {crewHotelBreakdown.lodging.perDiemPerMover} per diem/mover ={" "}
                  <span className="font-medium text-slate-800">
                    ${crewHotelBreakdown.charge.total} suggested
                  </span>
                </p>
              ) : null}
              <label className="block">
                <FieldLabel>Client charge</FieldLabel>
                <NumberInput
                  min={0}
                  value={values.crewHotelClientCharge}
                  onChange={(e) => patch("crewHotelClientCharge", e.target.value)}
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  What you quote the client — creates an ops prep task to book the hotel.
                </p>
              </label>
            </div>
          ) : null}
        </fieldset>

        <JobDayLocationsEditor
          move={move}
          locations={values.locations}
          onChange={(locations) => patch("locations", locations)}
        />
      </div>
    </DetailSidebar>
    <ConfirmDialog
      open={pendingDayFraction !== null}
      onClose={() => setPendingDayFraction(null)}
      onConfirm={() => {
        if (pendingDayFraction) applyDayFractionChange(pendingDayFraction);
        setPendingDayFraction(null);
      }}
      title="Change day length?"
      description={
        pendingDayFractionCopy
          ? values.dayFractionManualOverride
            ? `Change day length from ${pendingDayFractionCopy.currentLabel} to ${pendingDayFractionCopy.nextLabel}? Est. hours will stay at ${pendingDayFractionCopy.estHours}.`
            : `Switch from ${pendingDayFractionCopy.currentLabel} to ${pendingDayFractionCopy.nextLabel}? Est. hours will stay at ${pendingDayFractionCopy.estHours} and day length will be marked as overridden.`
          : ""
      }
      confirmLabel="Yes, change"
      cancelLabel="Cancel"
    />
    <ConfirmDialog
      open={deleteConfirmOpen}
      onClose={() => setDeleteConfirmOpen(false)}
      onConfirm={confirmDelete}
      title="Delete job day?"
      description={`Remove ${existing?.label ?? dayTitle} from this move? This cannot be undone.`}
      confirmLabel="Yes, delete"
      cancelLabel="Cancel"
      variant="danger"
    />
    </>
  );
}
