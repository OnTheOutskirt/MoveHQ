"use client";

import { SettingsField, SettingsInput, SettingsSelect } from "@/components/settings/SettingsField";
import {
  IANA_TIMEZONE_OPTIONS,
  WEEK_STARTS_ON_OPTIONS,
} from "@/lib/settings/business-calendar";
import { WEEKDAY_IDS, WEEKDAY_LABELS, type WeekdayId } from "@/lib/operations/fleet-types";
import type { WeekStartsOn } from "@/lib/settings/types";
import type { WorkspaceLocation } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";

type LocationHoursEditorProps = {
  location: WorkspaceLocation;
  onChange: (patch: Partial<WorkspaceLocation>) => void;
};

function DayToggleRow({
  title,
  hint,
  days,
  selected,
  onToggle,
}: {
  title: string;
  hint: string;
  days: readonly WeekdayId[];
  selected: WeekdayId[];
  onToggle: (day: WeekdayId) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {days.map((day) => {
          const on = selected.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onToggle(day)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-sm border text-xs font-semibold transition-colors",
                on
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
  );
}

function toggleDay(current: WeekdayId[], day: WeekdayId): WeekdayId[] {
  const next = current.includes(day)
    ? current.filter((d) => d !== day)
    : [...current, day].sort((a, b) => a - b);
  return next.length === 0 ? current : next;
}

export function LocationHoursEditor({ location, onChange }: LocationHoursEditorProps) {
  return (
    <div className="space-y-5 border-t border-slate-100 pt-5">
      <SettingsField label="Timezone" hint="Dates and times for this branch." className="sm:col-span-2">
        <SettingsSelect
          value={location.timezone}
          onChange={(e) => onChange({ timezone: e.target.value })}
        >
          {IANA_TIMEZONE_OPTIONS.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </SettingsSelect>
      </SettingsField>

      <SettingsField label="Week starts on">
        <SettingsSelect
          value={location.weekStartsOn}
          onChange={(e) => onChange({ weekStartsOn: e.target.value as WeekStartsOn })}
        >
          {WEEK_STARTS_ON_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </SettingsSelect>
      </SettingsField>

      <div className="sm:col-span-2 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="text-sm font-semibold text-slate-900">Office hours</p>
        <p className="text-xs text-slate-500">
          When customers can reach the office and when sales/scheduling staff are available.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Opens">
            <SettingsInput
              type="time"
              value={location.officeHoursStart}
              onChange={(e) => onChange({ officeHoursStart: e.target.value })}
            />
          </SettingsField>
          <SettingsField label="Closes">
            <SettingsInput
              type="time"
              value={location.officeHoursEnd}
              onChange={(e) => onChange({ officeHoursEnd: e.target.value })}
            />
          </SettingsField>
        </div>
        <DayToggleRow
          title="Office open days"
          hint="Mon–Fri for Jonah — days the office answers phones and books moves."
          days={WEEKDAY_IDS}
          selected={location.officeOpenDays}
          onToggle={(day) => onChange({ officeOpenDays: toggleDay(location.officeOpenDays, day) })}
        />
      </div>

      <div className="sm:col-span-2 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="text-sm font-semibold text-slate-900">Crew working days</p>
        <p className="text-xs text-slate-500">
          Days shown on the move calendar and used for crew scheduling — can include Saturdays even
          when the office is closed.
        </p>
        <DayToggleRow
          title="Crew schedules moves on"
          hint="Typically Mon–Sat for local moving companies."
          days={WEEKDAY_IDS}
          selected={location.crewWorkingDays}
          onToggle={(day) => onChange({ crewWorkingDays: toggleDay(location.crewWorkingDays, day) })}
        />
      </div>
    </div>
  );
}
