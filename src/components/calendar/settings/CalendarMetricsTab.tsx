"use client";

import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { Button } from "@/components/ui/Button";
import { generateMetricSlotId } from "@/lib/calendar/metrics/ids";
import { patchMetricsForSettingsLocation } from "@/lib/calendar/metrics/apply";
import { resolveMetricsForLocation } from "@/lib/calendar/metrics/resolve";
import {
  MAX_PRIMARY_CALENDAR_METRICS,
  MAX_SECONDARY_CALENDAR_METRICS,
  type CalendarDayCardMetricsConfig,
  type CalendarDayMetricSlot,
  type CalendarMetricDisplayType,
  type WorkspaceCalendarConfig,
} from "@/lib/calendar/metrics/types";
import { displayOptionsForSlot, normalizeMetricDisplayType } from "@/lib/calendar/metrics/display-types";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction;
  if (next < 0 || next >= items.length) return items;
  const copy = [...items];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}

function MetricListEditor({
  title,
  hint,
  max,
  slots,
  categories,
  onChange,
  primaryOnly,
}: {
  title: string;
  hint: string;
  max: number;
  slots: CalendarDayMetricSlot[];
  categories: WorkspaceCalendarConfig["resourceCategories"];
  onChange: (slots: CalendarDayMetricSlot[]) => void;
  primaryOnly?: boolean;
}) {
  const usedIds = new Set(slots.map((s) => s.resourceCategoryId));
  const available = categories.filter((c) => !usedIds.has(c.id));
  const displayOptions = displayOptionsForSlot(Boolean(primaryOnly));

  function patchSlot(index: number, patch: Partial<CalendarDayMetricSlot>) {
    onChange(slots.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeSlot(index: number) {
    onChange(slots.filter((_, i) => i !== index));
  }

  function addSlot() {
    if (slots.length >= max || available.length === 0) return;
    const cat = available[0];
    const displayType = normalizeMetricDisplayType(
      primaryOnly || cat.valueKind === "capacity_pair" ? "booked_available" : "remaining",
      Boolean(primaryOnly),
    );
    onChange([
      ...slots,
      {
        id: generateMetricSlotId(),
        resourceCategoryId: cat.id,
        displayType,
      },
    ]);
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      <ul className="space-y-2">
        {slots.map((slot, index) => {
          const category = categories.find((c) => c.id === slot.resourceCategoryId);
          return (
            <li
              key={slot.id}
              className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-5 text-xs font-medium text-slate-500">{index + 1}.</span>
                <select
                  value={slot.resourceCategoryId}
                  onChange={(e) => patchSlot(index, { resourceCategoryId: e.target.value })}
                  className="min-w-[8rem] flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                >
                  {categories.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                      disabled={usedIds.has(c.id) && c.id !== slot.resourceCategoryId}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={index === 0}
                    onClick={() => onChange(moveItem(slots, index, -1))}
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={index === slots.length - 1}
                    onClick={() => onChange(moveItem(slots, index, 1))}
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600"
                    onClick={() => removeSlot(index)}
                    aria-label="Remove metric"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 pl-7">
                <SettingsField label="Display">
                  <SettingsSelect
                    value={slot.displayType}
                    onChange={(e) =>
                      patchSlot(index, {
                        displayType: normalizeMetricDisplayType(
                          e.target.value as CalendarMetricDisplayType,
                          Boolean(primaryOnly),
                        ),
                      })
                    }
                  >
                    {displayOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </SettingsSelect>
                </SettingsField>
                <SettingsField label="Card label" hint="Optional">
                  <SettingsInput
                    value={slot.customLabel ?? ""}
                    onChange={(e) =>
                      patchSlot(index, {
                        customLabel: e.target.value.trim() || undefined,
                      })
                    }
                    placeholder={category?.name ?? "Label"}
                  />
                </SettingsField>
              </div>
            </li>
          );
        })}
      </ul>
      {slots.length < max ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1"
          disabled={available.length === 0}
          onClick={addSlot}
        >
          <Plus className="h-3.5 w-3.5" />
          Add metric
        </Button>
      ) : (
        <p className="text-xs text-slate-500">Maximum {max} metrics.</p>
      )}
    </div>
  );
}

export function CalendarMetricsTab() {
  const { config, updateConfig, hasMultipleLocations } = useWorkspace();
  const { settingsLocationId, settingsUseCompanyDefault } = useCalendarSettings();
  const calendar = config.calendar;

  const activeMetrics = useMemo(
    () => resolveMetricsForLocation(calendar, settingsLocationId),
    [calendar, settingsLocationId],
  );

  function saveMetrics(metrics: CalendarDayCardMetricsConfig) {
    const useDefault = !hasMultipleLocations || settingsUseCompanyDefault;
    updateConfig({
      ...config,
      calendar: patchMetricsForSettingsLocation(
        calendar,
        settingsLocationId,
        useDefault,
        metrics,
      ),
    });
  }

  const customizing =
    hasMultipleLocations && !settingsUseCompanyDefault;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Resource categories
        </p>
        <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
          {calendar.resourceCategories.map((cat) => (
            <li key={cat.id} className="flex justify-between gap-2 px-3 py-2">
              <span className="font-medium text-slate-800">{cat.name}</span>
              <span className="text-xs capitalize text-slate-500">{cat.kind}</span>
            </li>
          ))}
        </ul>
      </div>

      {customizing ? (
        <p className="text-xs text-brand-800 bg-brand-50 rounded-lg px-3 py-2">
          Custom metrics for this branch only. Check &quot;Use company defaults&quot; above to edit
          the shared layout instead.
        </p>
      ) : null}

      <MetricListEditor
        title="Primary metrics"
        hint={`Top of each day card (max ${MAX_PRIMARY_CALENDAR_METRICS}).`}
        max={MAX_PRIMARY_CALENDAR_METRICS}
        slots={activeMetrics.primary}
        categories={calendar.resourceCategories}
        onChange={(primary) => saveMetrics({ ...activeMetrics, primary })}
        primaryOnly
      />
      <MetricListEditor
        title="Secondary metrics"
        hint={`Bottom of each day card (max ${MAX_SECONDARY_CALENDAR_METRICS}).`}
        max={MAX_SECONDARY_CALENDAR_METRICS}
        slots={activeMetrics.secondary}
        categories={calendar.resourceCategories}
        onChange={(secondary) => saveMetrics({ ...activeMetrics, secondary })}
      />
    </div>
  );
}
