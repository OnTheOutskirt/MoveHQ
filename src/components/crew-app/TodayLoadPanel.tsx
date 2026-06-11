"use client";

import { CrewLoadChecklist } from "@/components/crew-app/CrewLoadChecklist";
import type { CrewAppJob } from "@/lib/crew-app/types";
import { countTodayLoadMaterialTypes } from "@/lib/crew-app/load-checklist-storage";

type TodayLoadPanelProps = {
  jobs: CrewAppJob[];
};

export function TodayLoadPanel({ jobs }: TodayLoadPanelProps) {
  if (countTodayLoadMaterialTypes(jobs) === 0) return null;

  return (
    <CrewLoadChecklist
      scope="day"
      dayJobs={jobs}
      title="Load for today"
      subtitle={`${countTodayLoadMaterialTypes(jobs)} item types across ${jobs.length} job${jobs.length === 1 ? "" : "s"} — grab before you roll`}
      doneTitle="All items loaded for today"
      doneSubtitle="You're ready to roll — everything on the truck."
      hideWhenEmpty={false}
    />
  );
}
