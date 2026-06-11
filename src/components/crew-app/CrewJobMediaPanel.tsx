"use client";

import { CrewFieldCapturePanel } from "@/components/crew-app/CrewFieldCapturePanel";
import type { CrewAppJob } from "@/lib/crew-app/types";

type CrewJobMediaPanelProps = {
  job: CrewAppJob;
};

/** @deprecated Use CrewFieldCapturePanel — kept as alias for job detail screens. */
export function CrewJobMediaPanel({ job }: CrewJobMediaPanelProps) {
  return <CrewFieldCapturePanel job={job} />;
}
