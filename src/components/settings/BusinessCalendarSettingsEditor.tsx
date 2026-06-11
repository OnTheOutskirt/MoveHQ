"use client";

import { useOptionalSettingsDraft } from "@/components/providers/SettingsDraftProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useSettingsEditor } from "@/lib/settings/use-settings-editor";
import { SettingsField, SettingsSelect } from "@/components/settings/SettingsField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  IANA_TIMEZONE_OPTIONS,
  WEEK_STARTS_ON_OPTIONS,
} from "@/lib/settings/business-calendar";
import type { WeekStartsOn } from "@/lib/settings/types";
import { WEEKDAY_IDS, WEEKDAY_LABELS, type WeekdayId } from "@/lib/operations/fleet-types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

function sameOpenDays(a: WeekdayId[], b: WeekdayId[]) {
  return a.length === b.length && a.every((day, i) => day === b[i]);
}

export function BusinessCalendarSettingsEditor() {
  const draftCtx = useOptionalSettingsDraft();
  const { replaceSettings } = useSettings();
  const { settings } = useSettingsEditor();
  const saved = settings.company;

  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>(saved.weekStartsOn);
  const [openDays, setOpenDays] = useState<WeekdayId[]>(saved.openDays);
  const [timezone, setTimezone] = useState(saved.timezone);

  useEffect(() => {
    setWeekStartsOn(saved.weekStartsOn);
    setOpenDays(saved.openDays);
    setTimezone(saved.timezone);
  }, [saved.weekStartsOn, saved.openDays, saved.timezone]);

  const dirty =
    weekStartsOn !== saved.weekStartsOn ||
    !sameOpenDays(openDays, saved.openDays) ||
    timezone !== saved.timezone;

  function toggleOpenDay(day: WeekdayId) {
    setOpenDays((current) => {
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort((a, b) => a - b);
      if (next.length === 0) return current;
      return next;
    });
  }

  function save() {
    const companyPatch = { weekStartsOn, openDays, timezone };
    const nextSettings = { ...settings, company: { ...settings.company, ...companyPatch } };
    if (draftCtx) {
      draftCtx.replaceDraft(nextSettings);
      draftCtx.save();
    } else {
      replaceSettings(nextSettings);
    }
  }

  function discard() {
    setWeekStartsOn(saved.weekStartsOn);
    setOpenDays(saved.openDays);
    setTimezone(saved.timezone);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business calendar</CardTitle>
        <p className="text-sm text-slate-500">
          Week start, operating days, and timezone drive the move calendar, crew time off, and
          payroll.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <SettingsField label="Timezone" hint="All dates and times use this zone across the app.">
          <SettingsSelect value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            {IANA_TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </SettingsSelect>
        </SettingsField>

        <SettingsField label="Week starts on">
          <SettingsSelect
            value={weekStartsOn}
            onChange={(e) => setWeekStartsOn(e.target.value as WeekStartsOn)}
          >
            {WEEK_STARTS_ON_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </SettingsSelect>
        </SettingsField>

        <div>
          <p className="text-sm font-medium text-slate-800">Open days</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Days your office schedules moves — shown as columns on the move calendar.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {WEEKDAY_IDS.map((day) => {
              const open = openDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleOpenDay(day)}
                  title={open ? `${WEEKDAY_LABELS[day]} — open` : `${WEEKDAY_LABELS[day]} — closed`}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-semibold transition-colors",
                    open
                      ? "border-brand-500 bg-brand-50 text-brand-800"
                      : "border-slate-200 bg-slate-100 text-slate-400",
                  )}
                >
                  {WEEKDAY_LABELS[day]}
                </button>
              );
            })}
          </div>
        </div>

        {dirty ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <Button type="button" size="sm" onClick={save}>
              Save calendar settings
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={discard}>
              Cancel
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
