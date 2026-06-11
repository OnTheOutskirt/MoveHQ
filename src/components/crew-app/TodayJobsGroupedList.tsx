"use client";

import { CrewJobCard } from "@/components/crew-app/CrewJobCard";
import {
  TODAY_JOB_LIST_GROUP_LABELS,
  TODAY_JOB_LIST_GROUP_ORDER,
  readJobFieldState,
  todayJobListGroup,
  type TodayJobListGroup,
} from "@/lib/crew-app/job-field-storage";
import type { CrewAppJob } from "@/lib/crew-app/types";
import { useMemo } from "react";

type TodayJobsGroupedListProps = {
  jobs: CrewAppJob[];
  /** Bump when job field store changes so groups stay current. */
  revision?: number;
};

function groupJobs(jobs: CrewAppJob[]): Record<TodayJobListGroup, CrewAppJob[]> {
  const groups: Record<TodayJobListGroup, CrewAppJob[]> = {
    scheduled: [],
    in_progress: [],
    completed: [],
  };
  for (const job of jobs) {
    const group = todayJobListGroup(readJobFieldState(job.id));
    groups[group].push(job);
  }
  return groups;
}

export function TodayJobsGroupedList({ jobs, revision = 0 }: TodayJobsGroupedListProps) {
  void revision;
  const grouped = useMemo(() => groupJobs(jobs), [jobs, revision]);

  return (
    <div className="space-y-5">
      {TODAY_JOB_LIST_GROUP_ORDER.map((group) => {
        const list = grouped[group];
        if (list.length === 0) return null;
        return (
          <section key={group}>
            <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {TODAY_JOB_LIST_GROUP_LABELS[group]}
              <span className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-bold tabular-nums text-slate-600">
                {list.length}
              </span>
            </h2>
            <ul className="space-y-3">
              {list.map((job) => (
                <li key={job.id}>
                  <CrewJobCard job={job} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
