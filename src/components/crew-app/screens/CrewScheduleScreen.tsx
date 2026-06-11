"use client";



import { CrewJobCard } from "@/components/crew-app/CrewJobCard";

import { ScheduleWeekSummaryCard } from "@/components/crew-app/ScheduleWeekSummaryCard";

import { CrewTimeOffSection } from "@/components/crew-app/CrewTimeOffSection";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";

import { crewScheduleTodayKey } from "@/lib/crew-app/crew-history";

import { upcomingJobs } from "@/lib/crew-app/mock-jobs";

import { formatMoveDate } from "@/lib/moves/format";

import { useMemo } from "react";



export function CrewScheduleScreen() {

  const { myJobs, inbox, isClientReady } = useCrewApp();

  const todayKey = isClientReady ? crewScheduleTodayKey() : "";

  const upcoming = useMemo(

    () => (todayKey ? upcomingJobs(myJobs, todayKey) : []),

    [myJobs, todayKey],

  );



  const byDate = useMemo(() => {

    const map = new Map<string, typeof upcoming>();

    for (const job of upcoming) {

      const list = map.get(job.dateKey) ?? [];

      list.push(job);

      map.set(job.dateKey, list);

    }

    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));

  }, [upcoming]);



  return (

    <div className="space-y-5">

      <div>

        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">

          Upcoming work days

        </h2>

        <p className="mb-3 text-sm text-slate-600">

          Days you&apos;re on the published crew schedule (from dispatch).

        </p>



        {!isClientReady ? (

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center">

            <p className="text-sm text-slate-500">Loading schedule…</p>

          </div>

        ) : byDate.length === 0 ? (

          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">

            <p className="text-sm font-medium text-slate-800">Nothing scheduled ahead</p>

            <p className="mt-1 text-xs text-slate-500">Check back after the next publish.</p>

          </div>

        ) : (

          byDate.map(([dateKey, jobs]) => (

            <section key={dateKey} className="mb-5 last:mb-0">

              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">

                {formatMoveDate(dateKey)}

              </h3>

              <ul className="space-y-3">

                {jobs.map((job) => (

                  <li key={job.id}>

                    <CrewJobCard job={job} />

                  </li>

                ))}

              </ul>

            </section>

          ))

        )}

      </div>



      <ScheduleWeekSummaryCard />



      <CrewTimeOffSection requests={inbox.timeOffRequests} />

    </div>

  );

}


