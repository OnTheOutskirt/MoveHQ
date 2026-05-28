"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { WEEKDAY_IDS, WEEKDAY_LABELS, type WeekdayId } from "@/lib/operations/fleet";
import { cn } from "@/lib/utils";

export function CrewScheduleTab() {
  const { crew, getWorkSchedule, setWorkSchedule } = useFleet();

  function toggleDay(crewId: string, day: WeekdayId) {
    const workDays = getWorkSchedule(crewId);
    const next = workDays.includes(day)
      ? workDays.filter((d) => d !== day)
      : [...workDays, day].sort((a, b) => a - b);
    if (next.length === 0) return;
    setWorkSchedule(crewId, next);
  }

  function applyWeekdayPreset(crewId: string) {
    setWorkSchedule(crewId, [1, 2, 3, 4, 5]);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Regular days off for each crew member. Tap a day to toggle work vs off.
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Crew
                </th>
                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Days off
                </th>
                <th className="hidden px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                  Work days
                </th>
                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Schedule
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {crew.map((member) => {
                const workDays = getWorkSchedule(member.id);
                const daysOff = WEEKDAY_IDS.filter((d) => !workDays.includes(d));

                return (
                  <tr key={member.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">{member.name}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {daysOff.length > 0
                        ? daysOff.map((d) => WEEKDAY_LABELS[d]).join(", ")
                        : "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                      {workDays.map((d) => WEEKDAY_LABELS[d]).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {WEEKDAY_IDS.map((day) => {
                          const works = workDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(member.id, day)}
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
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => applyWeekdayPreset(member.id)}
                        className="whitespace-nowrap rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Mon–Fri
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {crew.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">No crew on the roster.</p>
        ) : null}
      </div>
    </div>
  );
}
