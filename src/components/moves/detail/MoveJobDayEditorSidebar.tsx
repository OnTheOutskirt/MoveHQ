"use client";

import { JobDayEditorSwitcher } from "@/components/moves/detail/JobDayEditorSwitcher";
import { JobDayLocationsEditor } from "@/components/moves/detail/JobDayLocationsEditor";
import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  JOB_DAY_SERVICE_OPTIONS,
  MAX_JOB_DAYS_PER_MOVE,
  createDefaultJobDayFormValues,
  createNewJobDayKey,
  duplicateJobDayFormValues,
  formValuesToJobDay,
  generateJobDayLabel,
  getSortedJobDays,
  isNewJobDayKey,
  jobDayIndexForDate,
  jobDayToFormValues,
  type JobDayFormValues,
} from "@/lib/moves/job-day-form";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
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

export function MoveJobDayEditorSidebar({
  move,
  dayId,
  duplicateFromDayId = null,
  open,
  onClose,
}: MoveJobDayEditorSidebarProps) {
  const { addJobDay, updateJobDay, removeJobDay } = useMoves();
  const sortedDays = getSortedJobDays(move);

  const [activeKey, setActiveKey] = useState<string>(dayId ?? createNewJobDayKey());
  const [newDayKeys, setNewDayKeys] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, JobDayFormValues>>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(() => new Set());

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
          if (source) return duplicateJobDayFormValues(source);
        }
        const others = pendingDatesFromDrafts(drafts, newDayKeys.filter((k) => k !== key));
        return createDefaultJobDayFormValues(move, others);
      }
      const day = move.jobDays.find((d) => d.id === key);
      return day ? jobDayToFormValues(day) : createDefaultJobDayFormValues(move);
    },
    [drafts, move, newDayKeys, duplicateFromDayId],
  );

  const values = useMemo(() => {
    if (drafts[activeKey]) return drafts[activeKey]!;
    return resolveCardValues(activeKey);
  }, [activeKey, drafts, resolveCardValues]);

  useEffect(() => {
    if (!open) {
      setDrafts({});
      setDirtyKeys(new Set());
      setNewDayKeys([]);
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
      if (source) initialDrafts[firstNew] = duplicateJobDayFormValues(source);
    }
    if (!initialDrafts[firstNew]) {
      initialDrafts[firstNew] = createDefaultJobDayFormValues(move);
    }

    setActiveKey(firstNew);
    setNewDayKeys([firstNew]);
    setDrafts(initialDrafts);
    setDirtyKeys(new Set([firstNew]));
  }, [open, dayId, duplicateFromDayId, move.id]);

  const dayTitle = useMemo(
    () => generateJobDayLabel(jobDayIndexForDate(move, values.date, isEdit ? activeKey : undefined)),
    [move, values.date, isEdit, activeKey],
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

  function patch<K extends keyof JobDayFormValues>(key: K, value: JobDayFormValues[K]) {
    setDrafts((prev) => ({
      ...prev,
      [activeKey]: { ...(prev[activeKey] ?? values), [key]: value },
    }));
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
      [key]: createDefaultJobDayFormValues(move, extraDates),
    }));
    setActiveKey(key);
    markDirty(key);
  }

  const keysToSave = useMemo(() => {
    const keys = new Set(dirtyKeys);
    keys.add(activeKey);
    return [...keys];
  }, [dirtyKeys, activeKey]);

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
      removeJobDay(move.id, activeKey);
      onClose();
    }
  }

  function newDayLabel(key: string, index: number): string {
    if (duplicateFromDayId && key === newDayKeys[0]) {
      return duplicateSource ? `Copy · ${duplicateSource.label}` : "Copy";
    }
    if (newDayKeys.length === 1) return "New day";
    return `New day ${index + 1}`;
  }

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
    <DetailSidebar
      open={open}
      onClose={onClose}
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
        newDayLabel={newDayLabel}
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
              placeholder="8"
            />
          </label>
        </div>

        <JobDayLocationsEditor
          move={move}
          locations={values.locations}
          onChange={(locations) => patch("locations", locations)}
        />
      </div>
    </DetailSidebar>
  );
}
