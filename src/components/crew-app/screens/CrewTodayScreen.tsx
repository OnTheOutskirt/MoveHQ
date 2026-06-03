"use client";

import { CrewJobCard } from "@/components/crew-app/CrewJobCard";
import { CrewRoleSwitcher } from "@/components/crew-app/CrewRoleSwitcher";
import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { jobsForDate } from "@/lib/crew-app/mock-jobs";
import { toDateKey } from "@/lib/calendar/date-utils";
import { formatMoveDate } from "@/lib/moves/format";
import { Briefcase, Sun } from "lucide-react";
import { useMemo } from "react";

export function CrewTodayScreen() {
  const { myJobs, session } = useCrewApp();
  const todayKey = toDateKey(new Date());
  const todayJobs = useMemo(() => jobsForDate(myJobs, todayKey), [myJobs, todayKey]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = session.name.split(" ")[0];

  return (
    <div className="space-y-4">
      <CrewRoleSwitcher />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-brand-50 to-white px-4 py-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-brand-700">
            <Sun className="h-3.5 w-3.5" />
            {greeting}, {firstName}
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
            {todayJobs.length === 0
              ? "No jobs scheduled"
              : `${todayJobs.length} job${todayJobs.length === 1 ? "" : "s"} today`}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{formatMoveDate(todayKey)}</p>
        </div>
        {todayJobs.length > 0 ? (
          <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-xs text-slate-600">
            <Briefcase className="h-3.5 w-3.5 text-brand-600" />
            Next up:{" "}
            <span className="font-medium text-slate-900">
              {todayJobs[0]!.arrivalWindow ?? "TBD"} — {todayJobs[0]!.customerName}
            </span>
          </div>
        ) : null}
      </div>

      {todayJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-800">No jobs today</p>
          <p className="mt-1 text-xs text-slate-500">
            When dispatch sends your schedule to the crew app, jobs will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {todayJobs.map((job) => (
            <li key={job.id}>
              <CrewJobCard job={job} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
