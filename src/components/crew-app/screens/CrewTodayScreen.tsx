"use client";

import { TodayJobsGroupedList } from "@/components/crew-app/TodayJobsGroupedList";
import { TodayLoadPanel } from "@/components/crew-app/TodayLoadPanel";
import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { canSeeInventory } from "@/lib/crew-app/role-access";
import { crewScheduleTodayKey } from "@/lib/crew-app/crew-history";
import { jobsForDate } from "@/lib/crew-app/mock-jobs";
import { isJobComplete, readJobFieldState, subscribeJobFieldStore } from "@/lib/crew-app/job-field-storage";
import { formatMoveDate } from "@/lib/moves/format";
import { Briefcase, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function CrewTodayScreen() {
  const { myJobs, session, isClientReady } = useCrewApp();
  const showInventory = canSeeInventory(session.appRoles);
  const todayKey = isClientReady ? crewScheduleTodayKey() : "";
  const todayJobs = useMemo(
    () => (todayKey ? jobsForDate(myJobs, todayKey) : []),
    [myJobs, todayKey],
  );
  const [fieldRevision, setFieldRevision] = useState(0);

  useEffect(() => subscribeJobFieldStore(() => setFieldRevision((n) => n + 1)), []);

  const nextJob = useMemo(() => {
    void fieldRevision;
    return (
      todayJobs.find((job) => !isJobComplete(readJobFieldState(job.id))) ?? todayJobs[0] ?? null
    );
  }, [todayJobs, fieldRevision]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = session.name.split(" ")[0];

  return (
    <div className="space-y-4">
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
        {nextJob ? (
          <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-xs text-slate-600">
            <Briefcase className="h-3.5 w-3.5 text-brand-600" />
            Next up:{" "}
            <span className="font-medium text-slate-900">
              {nextJob.arrivalWindow ?? "TBD"} — {nextJob.customerName}
            </span>
          </div>
        ) : todayJobs.length > 0 ? (
          <div className="flex items-center gap-2 border-t border-emerald-100 bg-emerald-50/60 px-4 py-2.5 text-xs text-emerald-800">
            <Briefcase className="h-3.5 w-3.5" />
            All jobs complete for today
          </div>
        ) : null}
      </div>

      {showInventory && todayJobs.length > 0 ? <TodayLoadPanel jobs={todayJobs} /> : null}

      {todayJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-800">No jobs today</p>
          <p className="mt-1 text-xs text-slate-500">
            When dispatch sends your schedule to the crew app, jobs will show up here.
          </p>
        </div>
      ) : (
        <TodayJobsGroupedList jobs={todayJobs} revision={fieldRevision} />
      )}
    </div>
  );
}
