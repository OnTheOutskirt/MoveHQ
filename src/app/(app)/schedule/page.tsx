"use client";

import { StaffScheduleWorkspace } from "@/components/schedule/StaffScheduleWorkspace";
import { ModulePage } from "@/components/shared/ModulePage";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/schedule"];

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <ModulePage title={meta.title} description={meta.description} />
      <StaffScheduleWorkspace />
    </div>
  );
}
