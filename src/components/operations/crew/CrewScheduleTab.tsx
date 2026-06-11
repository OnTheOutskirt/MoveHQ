"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { Button } from "@/components/ui/Button";
import { WEEKDAY_IDS, WEEKDAY_LABELS, type WeekdayId } from "@/lib/operations/fleet";
import { useBusinessCalendar } from "@/lib/settings/use-business-calendar";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

function sameWorkDays(a: WeekdayId[], b: WeekdayId[]) {
  return a.length === b.length && a.every((day, i) => day === b[i]);
}

/** Keep only days the location allows; fall back to all location crew days if none match. */
export function workDaysForLocation(
  workDays: WeekdayId[],
  locationWorkingDays: WeekdayId[],
): WeekdayId[] {
  const allowed = new Set(locationWorkingDays);
  const filtered = workDays.filter((day) => allowed.has(day));
  return filtered.length > 0 ? filtered : [...locationWorkingDays];
}

export function CrewWorkScheduleDays({ crewId }: { crewId: string }) {
  const { getWorkSchedule, setWorkSchedule } = useFleet();
  const { openDays: locationWorkingDays } = useBusinessCalendar();
  const visibleDays = useMemo(
    () => WEEKDAY_IDS.filter((day) => locationWorkingDays.includes(day)),
    [locationWorkingDays],
  );
  const locationKey = locationWorkingDays.join(",");

  const savedDays = useMemo(
    () => workDaysForLocation(getWorkSchedule(crewId), locationWorkingDays),
    [crewId, getWorkSchedule, locationKey],
  );
  const savedKey = savedDays.join(",");
  const [draftDays, setDraftDays] = useState(savedDays);

  useEffect(() => {
    setDraftDays(workDaysForLocation(getWorkSchedule(crewId), locationWorkingDays));
  }, [crewId, savedKey, getWorkSchedule, locationKey]);

  const dirty = !sameWorkDays(draftDays, savedDays);

  function toggleDay(day: WeekdayId) {
    if (!locationWorkingDays.includes(day)) return;
    setDraftDays((current) => {
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort((a, b) => a - b);
      if (next.length === 0) return current;
      return next;
    });
  }

  function save() {
    setWorkSchedule(crewId, workDaysForLocation(draftDays, locationWorkingDays));
  }

  function discard() {
    setDraftDays(savedDays);
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap gap-1">
        {visibleDays.map((day) => {
          const works = draftDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              title={works ? `${WEEKDAY_LABELS[day]} — working` : `${WEEKDAY_LABELS[day]} — off`}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                works
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-slate-200 bg-slate-100 text-slate-400",
              )}
            >
              {WEEKDAY_LABELS[day]}
            </button>
          );
        })}
      </div>
      {dirty ? (
        <div className="flex items-center gap-1.5">
          <Button type="button" size="sm" onClick={save}>
            Save
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={discard}>
            Cancel
          </Button>
        </div>
      ) : null}
    </div>
  );
}
