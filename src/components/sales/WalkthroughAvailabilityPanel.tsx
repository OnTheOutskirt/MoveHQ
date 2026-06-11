"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { useWalkthroughAvailability } from "@/hooks/use-walkthrough-availability";
import {
  buildWalkthroughAvailabilityPreviewUrl,
  WALKTHROUGH_PREVIEW_MOVE_ID,
} from "@/lib/moves/walkthrough-scheduling-link";
import {
  SLOT_INTERVAL_OPTIONS,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  createTimeOffEntry,
  type WalkthroughDaySchedule,
  type WalkthroughModeAvailability,
  type WalkthroughTimeOffEntry,
  type WalkthroughTimeWindow,
} from "@/lib/moves/walkthrough-availability-settings";
import type { WalkthroughMode } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { CalendarOff, Clock, ExternalLink, MapPin, Plus, Trash2, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AvailabilityTab = "in_person" | "virtual" | "time_off";

type WalkthroughAvailabilityPanelProps = {
  assigneeKey: string;
  initialTab?: AvailabilityTab;
};

export function WalkthroughAvailabilityPanel({
  assigneeKey,
  initialTab = "in_person",
}: WalkthroughAvailabilityPanelProps) {
  const { moves } = useMoves();
  const { settings, saveSettings } = useWalkthroughAvailability(assigneeKey);
  const [tab, setTab] = useState<AvailabilityTab>(initialTab);
  const [timeOffLabel, setTimeOffLabel] = useState("");
  const [timeOffStart, setTimeOffStart] = useState("");
  const [timeOffEnd, setTimeOffEnd] = useState("");

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const previewMoveId = useMemo(() => {
    const active = moves.filter(
      (m) =>
        m.conditionStatus !== "lost" &&
        m.conditionStatus !== "cancelled" &&
        m.conditionStatus !== "closed",
    );
    const forRep = active.find(
      (m) =>
        m.assignedRep === assigneeKey ||
        m.scheduledWalkthrough?.assignedTo === assigneeKey,
    );
    return (forRep ?? active[0])?.id ?? WALKTHROUGH_PREVIEW_MOVE_ID;
  }, [moves, assigneeKey]);

  const customerPreviewUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return buildWalkthroughAvailabilityPreviewUrl(
      window.location.origin,
      assigneeKey,
      previewMoveId,
    );
  }, [assigneeKey, previewMoveId]);

  function patchMode(mode: WalkthroughMode, patch: Partial<WalkthroughModeAvailability>) {
    const key = mode === "virtual" ? "virtual" : "inPerson";
    saveSettings({
      ...settings,
      [key]: { ...settings[key], ...patch },
    });
  }

  function patchDaySchedule(
    mode: WalkthroughMode,
    day: number,
    patch: Partial<WalkthroughDaySchedule>,
  ) {
    const key = mode === "virtual" ? "virtual" : "inPerson";
    const modeSettings = settings[key];
    saveSettings({
      ...settings,
      [key]: {
        ...modeSettings,
        weekly: {
          ...modeSettings.weekly,
          [day]: { ...modeSettings.weekly[day], ...patch },
        },
      },
    });
  }

  function addTimeOff() {
    if (!timeOffStart) return;
    const entry = createTimeOffEntry(
      timeOffLabel,
      timeOffStart,
      timeOffEnd || timeOffStart,
    );
    saveSettings({
      ...settings,
      timeOff: [...settings.timeOff, entry].sort((a, b) =>
        a.startDate.localeCompare(b.startDate),
      ),
    });
    setTimeOffLabel("");
    setTimeOffStart("");
    setTimeOffEnd("");
  }

  function removeTimeOff(id: string) {
    saveSettings({
      ...settings,
      timeOff: settings.timeOff.filter((e) => e.id !== id),
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-slate-100 px-4 pt-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Customer scheduling link preview — in-person and virtual.
          </p>
          {customerPreviewUrl ? (
            <a
              href={customerPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
            >
              Preview as customer
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <TabButton
            active={tab === "in_person"}
            onClick={() => setTab("in_person")}
            icon={MapPin}
            label="In person"
          />
          <TabButton
            active={tab === "virtual"}
            onClick={() => setTab("virtual")}
            icon={Video}
            label="Virtual"
          />
          <TabButton
            active={tab === "time_off"}
            onClick={() => setTab("time_off")}
            icon={CalendarOff}
            label="Time off"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "in_person" || tab === "virtual" ? (
          <ModeAvailabilityEditor
            mode={tab}
            modeSettings={tab === "virtual" ? settings.virtual : settings.inPerson}
            assigneeKey={settings.assigneeKey}
            onPatchMode={(patch) => patchMode(tab, patch)}
            onPatchDay={(day, patch) => patchDaySchedule(tab, day, patch)}
          />
        ) : null}

        {tab === "time_off" ? (
          <TimeOffEditor
            entries={settings.timeOff}
            label={timeOffLabel}
            start={timeOffStart}
            end={timeOffEnd}
            onLabelChange={setTimeOffLabel}
            onStartChange={setTimeOffStart}
            onEndChange={setTimeOffEnd}
            onAdd={addTimeOff}
            onRemove={removeTimeOff}
          />
        ) : null}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium transition-colors sm:text-xs",
        active
          ? "bg-white text-brand-700 shadow-sm"
          : "text-slate-600 hover:text-slate-900",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}

function ModeAvailabilityEditor({
  mode,
  modeSettings,
  assigneeKey,
  onPatchMode,
  onPatchDay,
}: {
  mode: WalkthroughMode;
  modeSettings: WalkthroughModeAvailability;
  assigneeKey: string;
  onPatchMode: (patch: Partial<WalkthroughModeAvailability>) => void;
  onPatchDay: (day: number, patch: Partial<WalkthroughDaySchedule>) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Set which days and times you offer{" "}
        <strong>{mode === "virtual" ? "virtual" : "in-person"}</strong> walkthroughs.
        Scheduling links and the book panel use these windows for {assigneeKey}.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm">
          <span className="text-xs font-medium text-slate-700">Buffer before</span>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={120}
              step={5}
              value={modeSettings.bufferBeforeMinutes}
              onChange={(e) =>
                onPatchMode({ bufferBeforeMinutes: Number(e.target.value) || 0 })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <span className="shrink-0 text-xs text-slate-500">min</span>
          </div>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-slate-700">Buffer after</span>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={120}
              step={5}
              value={modeSettings.bufferAfterMinutes}
              onChange={(e) =>
                onPatchMode({ bufferAfterMinutes: Number(e.target.value) || 0 })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <span className="shrink-0 text-xs text-slate-500">min</span>
          </div>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-medium text-slate-700">Slot length</span>
          <select
            value={modeSettings.slotIntervalMinutes}
            onChange={(e) =>
              onPatchMode({ slotIntervalMinutes: Number(e.target.value) })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {SLOT_INTERVAL_OPTIONS.map((m) => (
              <option key={m} value={m}>
                Every {m} min
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs leading-relaxed text-slate-500 lg:self-end lg:pb-2">
          Travel and wrap-up between bookings. Outlook calendar sync will also block busy times.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Weekly schedule
        </p>
        {WEEKDAY_ORDER.map((day) => (
          <DayScheduleRow
            key={day}
            day={day}
            schedule={modeSettings.weekly[day]}
            onPatch={(patch) => onPatchDay(day, patch)}
          />
        ))}
      </div>
    </div>
  );
}

function DayScheduleRow({
  day,
  schedule,
  onPatch,
}: {
  day: number;
  schedule: WalkthroughDaySchedule;
  onPatch: (patch: Partial<WalkthroughDaySchedule>) => void;
}) {
  function updateWindow(index: number, patch: Partial<WalkthroughTimeWindow>) {
    const windows = schedule.windows.map((w, i) =>
      i === index ? { ...w, ...patch } : w,
    );
    onPatch({ windows });
  }

  function addWindow() {
    const last = schedule.windows[schedule.windows.length - 1];
    onPatch({
      windows: [
        ...schedule.windows,
        { start: last?.end ?? "14:00", end: "16:00" },
      ],
    });
  }

  function removeWindow(index: number) {
    const windows = schedule.windows.filter((_, i) => i !== index);
    onPatch({
      windows: windows.length > 0 ? windows : [{ start: "09:00", end: "17:00" }],
    });
  }

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3 transition-colors",
        schedule.enabled
          ? "border-slate-200 bg-white"
          : "border-dashed border-slate-200 bg-slate-50/80",
      )}
    >
      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={schedule.enabled}
          onChange={(e) => onPatch({ enabled: e.target.checked })}
          className="rounded border-slate-300 text-brand-600"
        />
        {WEEKDAY_LABELS[day]}
      </label>

      {schedule.enabled ? (
        <div className="mt-3 space-y-2">
          {schedule.windows.map((window, index) => (
            <div
              key={index}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2"
            >
              <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <input
                type="time"
                value={window.start}
                onChange={(e) => updateWindow(index, { start: e.target.value })}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
              <span className="text-xs text-slate-500">to</span>
              <input
                type="time"
                value={window.end}
                onChange={(e) => updateWindow(index, { end: e.target.value })}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
              {schedule.windows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeWindow(index)}
                  className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove time block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            onClick={addWindow}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add time block
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-400">Unavailable</p>
      )}
    </div>
  );
}

function TimeOffEditor({
  entries,
  label,
  start,
  end,
  onLabelChange,
  onStartChange,
  onEndChange,
  onAdd,
  onRemove,
}: {
  entries: WalkthroughTimeOffEntry[];
  label: string;
  start: string;
  end: string;
  onLabelChange: (v: string) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Holidays, PTO, and other days you&apos;re unavailable for any walkthrough type.
        Existing bookings on these dates should be rescheduled separately.
      </p>

      {entries.length > 0 ? (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{entry.label}</p>
                <p className="text-xs text-slate-500">
                  {entry.startDate === entry.endDate
                    ? entry.startDate
                    : `${entry.startDate} → ${entry.endDate}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(entry.id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${entry.label}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          No time off added yet.
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm font-medium text-slate-900">Add time off</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">Label</span>
            <input
              type="text"
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              placeholder="Holiday, PTO, conference…"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-slate-700">Start date</span>
            <input
              type="date"
              value={start}
              onChange={(e) => onStartChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-slate-700">End date</span>
            <input
              type="date"
              value={end}
              onChange={(e) => onEndChange(e.target.value)}
              min={start || undefined}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <Button type="button" size="sm" className="mt-3" disabled={!start} onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add time off
        </Button>
      </div>
    </div>
  );
}
